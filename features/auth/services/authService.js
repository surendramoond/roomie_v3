import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { Platform } from 'react-native';
import { sanitizePhone } from '../../../shared/utils/validation';
import { USER_ROLES } from '../../../shared/constants/roles';
import { firebaseAuth, firestore, storage } from '../../../shared/services/firebase/firebaseApp';

const buildRoleIdentifier = ({ identifier = '', role }) => {
  if (role === USER_ROLES.LANDLORD) {
    return sanitizePhone(identifier);
  }

  return identifier.trim().toLowerCase();
};

const buildAuthEmail = ({ identifier = '', role }) => {
  const normalizedIdentifier = buildRoleIdentifier({ identifier, role });

  if (role === USER_ROLES.LANDLORD) {
    return `landlord.${normalizedIdentifier}@roomie.local`;
  }

  return normalizedIdentifier;
};

const buildUserKey = ({ identifier = '', role }) => `${role}:${buildRoleIdentifier({ identifier, role })}`;

const buildDefaultDisplayName = ({ identifier = '', role }) => {
  if (role === USER_ROLES.STUDENT) {
    const emailName = identifier.split('@')[0]?.replace(/[._-]+/g, ' ').trim();
    return emailName || 'Student User';
  }

  const phoneTail = identifier.slice(-4);
  return phoneTail ? `Landlord ${phoneTail}` : 'Landlord User';
};

const inferProfileFromAuthEmail = (email = '') => {
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail.startsWith('landlord.') && normalizedEmail.endsWith('@roomie.local')) {
    return {
      role: USER_ROLES.LANDLORD,
      identifier: normalizedEmail.replace(/^landlord\./, '').replace(/@roomie\.local$/, ''),
    };
  }

  return {
    role: USER_ROLES.STUDENT,
    identifier: normalizedEmail,
  };
};

const mapAuthError = (error, fallbackMessage) => {
  const errorCode = error?.code;

  switch (errorCode) {
    case 'auth/email-already-in-use':
      return new Error('An account already exists for this email or phone number.');
    case 'auth/configuration-not-found':
    case 'auth/operation-not-allowed':
      return new Error('Firebase Email/Password sign-in is not enabled yet. Turn it on in Firebase Console > Authentication > Sign-in method.');
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return new Error('Incorrect login details. Check your identifier and password.');
    case 'unavailable':
      return new Error('Firestore is not reachable yet. Create Firestore Database in Firebase Console and make sure your device has internet.');
    case 'auth/network-request-failed':
      return new Error('Network error while contacting Firebase. Check your internet connection.');
    default:
      if (/client is offline/i.test(error?.message || '')) {
        return new Error(
          'Firestore is not reachable yet. Create Firestore Database in Firebase Console and make sure your device has internet.'
        );
      }

      return new Error(error?.message || fallbackMessage);
  }
};

const uploadProfileImageIfNeeded = async (userId, profileImageUri = '') => {
  if (!profileImageUri || /^https?:\/\//i.test(profileImageUri) || !/^data:image\//i.test(profileImageUri)) {
    return profileImageUri;
  }

  // Firebase JS Storage uploads are not supported on React Native, so keep
  // the data URL directly in Firestore on native platforms.
  if (Platform.OS !== 'web') {
    return profileImageUri;
  }

  const imageRef = ref(storage, `users/${userId}/profile-${Date.now()}.jpg`);
  await uploadString(imageRef, profileImageUri, 'data_url');
  return getDownloadURL(imageRef);
};

const createMissingFirebaseUserProfile = async ({ uid, identifier, role, displayName = '' }) => {
  const normalizedIdentifier = buildRoleIdentifier({ identifier, role });
  const nextUser = {
    identifier: normalizedIdentifier,
    role,
    displayName: displayName.trim() || buildDefaultDisplayName({ identifier: normalizedIdentifier, role }),
    bio: '',
    location: 'Prince George, BC',
    profileImageUri: '',
    favoriteListingIds: [],
    createdAt: new Date().toISOString(),
    createdByKey: buildUserKey({ identifier: normalizedIdentifier, role }),
  };

  await setDoc(doc(firestore, 'users', uid), nextUser);

  return {
    id: uid,
    ...nextUser,
  };
};

const loadFirebaseUserProfile = async (uid) => {
  if (!uid) {
    return null;
  }

  const snapshot = await getDoc(doc(firestore, 'users', uid));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
    favoriteListingIds: Array.isArray(snapshot.data().favoriteListingIds)
      ? snapshot.data().favoriteListingIds
      : [],
  };
};

export const subscribeToAuthChanges = (callback) =>
  onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    let profile = await loadFirebaseUserProfile(firebaseUser.uid);

    if (!profile) {
      const inferredProfile = inferProfileFromAuthEmail(firebaseUser.email || '');
      profile = await createMissingFirebaseUserProfile({
        uid: firebaseUser.uid,
        identifier: inferredProfile.identifier,
        role: inferredProfile.role,
        displayName: firebaseUser.displayName || '',
      });
    }

    callback(profile);
  });

export const login = async ({ identifier, role, password = '' }) => {
  try {
    const authEmail = buildAuthEmail({ identifier, role });
    const credential = await signInWithEmailAndPassword(firebaseAuth, authEmail, password);
    const userProfile =
      (await loadFirebaseUserProfile(credential.user.uid)) ||
      (await createMissingFirebaseUserProfile({
        uid: credential.user.uid,
        identifier,
        role,
        displayName: credential.user.displayName || '',
      }));

    return userProfile;
  } catch (error) {
    throw mapAuthError(error, 'Unable to log in right now.');
  }
};

export const signup = async ({ identifier, role, password, displayName }) => {
  try {
    const normalizedIdentifier = buildRoleIdentifier({ identifier, role });
    const authEmail = buildAuthEmail({ identifier: normalizedIdentifier, role });
    const credential = await createUserWithEmailAndPassword(firebaseAuth, authEmail, password);
    const nextUser = {
      identifier: normalizedIdentifier,
      role,
      displayName,
      bio: '',
      location: 'Prince George, BC',
      profileImageUri: '',
      favoriteListingIds: [],
      createdAt: new Date().toISOString(),
      createdByKey: buildUserKey({ identifier: normalizedIdentifier, role }),
    };

    await setDoc(doc(firestore, 'users', credential.user.uid), nextUser);

    return {
      id: credential.user.uid,
      ...nextUser,
    };
  } catch (error) {
    throw mapAuthError(error, 'Unable to create your account right now.');
  }
};

export const updateProfile = async ({ user, updates }) => {
  if (!user) {
    return null;
  }

  try {
    const nextProfileImageUri = await uploadProfileImageIfNeeded(user.id, updates.profileImageUri);
    const nextUpdates = {
      ...updates,
      profileImageUri: nextProfileImageUri,
    };

    await updateDoc(doc(firestore, 'users', user.id), nextUpdates);
    return {
      ...user,
      ...nextUpdates,
    };
  } catch (error) {
    throw new Error(error?.message || 'Unable to update your profile right now.');
  }
};

export const logout = async () => {
  try {
    await signOut(firebaseAuth);
  } catch (error) {
    throw new Error(error?.message || 'Unable to log out right now.');
  }
};
