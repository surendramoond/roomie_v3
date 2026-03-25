import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { Platform } from 'react-native';
import { sanitizePhone } from '../../../shared/utils/validation';
import { ROOM_TYPES } from '../constants/listings';
import { USER_ROLES } from '../../../shared/constants/roles';
import { firestore, storage } from '../../../shared/services/firebase/firebaseApp';

const FALLBACK_LISTING_IMAGE = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200';

const normalizePrice = (value = '') => Number(String(value).replace(/[^0-9.]/g, '')) || 0;

const normalizeIdentifierForRole = ({ identifier = '', role }) => {
  if (role === USER_ROLES.LANDLORD) {
    return sanitizePhone(identifier);
  }

  return identifier.trim().toLowerCase();
};

const buildOwnerKey = ({ identifier, role }) => {
  if (!identifier || !role) {
    return null;
  }

  return `${role}:${normalizeIdentifierForRole({ identifier, role })}`;
};

const sortListings = (listings) =>
  [...listings].sort((first, second) => (second.createdAt || '').localeCompare(first.createdAt || ''));

const normalizeImageUrls = (imageUrls = [], imageUrl = '') => {
  const sourceImages = Array.isArray(imageUrls) && imageUrls.length ? imageUrls : imageUrl ? [imageUrl] : [];
  const cleanedImages = sourceImages
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean);

  return cleanedImages.length ? cleanedImages : [FALLBACK_LISTING_IMAGE];
};

const normalizeListing = (listing) => {
  const imageUrls = normalizeImageUrls(listing?.imageUrls, listing?.imageUrl);
  const priceAmount = Number.isFinite(Number(listing?.priceAmount)) ? Number(listing.priceAmount) : 0;
  const hasDistance = Number.isFinite(Number(listing?.distanceKm));

  return {
    ...listing,
    title: listing?.title?.trim() || 'Untitled Listing',
    price: listing?.price || (priceAmount > 0 ? `$${priceAmount}/mo` : 'Price on request'),
    priceAmount,
    imageUrls,
    imageUrl: imageUrls[0],
    type: listing?.type?.trim() || 'Not specified',
    description: listing?.description?.trim() || 'No description provided.',
    location: listing?.location?.trim() || 'Location not provided',
    distanceKm: hasDistance ? Number(listing.distanceKm) : null,
    landlordName: listing?.landlordName?.trim() || 'Roomie User',
    landlordIdentifier: listing?.landlordIdentifier || '0000000000',
    isSold: Boolean(listing?.isSold),
  };
};

const uploadListingImagesIfNeeded = async ({ listingId, createdByUid, imageUrls = [] }) =>
  Promise.all(
    normalizeImageUrls(imageUrls).map(async (imageUrl, index) => {
      if (/^https?:\/\//i.test(imageUrl) || !/^data:image\//i.test(imageUrl)) {
        return imageUrl;
      }

      // Firebase JS Storage uploads are not supported on React Native, so keep
      // the data URL directly in Firestore on native platforms.
      if (Platform.OS !== 'web') {
        return imageUrl;
      }

      const imageRef = ref(storage, `listings/${createdByUid}/${listingId}-${Date.now()}-${index}.jpg`);
      await uploadString(imageRef, imageUrl, 'data_url');
      return getDownloadURL(imageRef);
    })
  );

const mapListingDocument = (snapshot) =>
  normalizeListing({
    id: snapshot.id,
    ...snapshot.data(),
  });

export const getListings = async () => {
  const snapshot = await getDocs(collection(firestore, 'listings'));
  return sortListings(snapshot.docs.map(mapListingDocument).filter((listing) => !listing.isSold));
};

export const getListingsCreatedByUser = async (user) => {
  if (!user?.id) {
    return [];
  }

  const snapshot = await getDocs(
    query(collection(firestore, 'listings'), where('createdByUid', '==', user.id))
  );
  return sortListings(snapshot.docs.map(mapListingDocument));
};

export const getListingById = async (listingId) => {
  const snapshot = await getDoc(doc(firestore, 'listings', listingId));
  return snapshot.exists() ? mapListingDocument(snapshot) : null;
};

export const createListing = async (payload) => {
  const cleanPrice = normalizePrice(payload.price);
  const listingId = doc(collection(firestore, 'listings')).id;
  const createdByIdentifier = normalizeIdentifierForRole({
    identifier: payload.createdByIdentifier,
    role: payload.createdByRole,
  });

  const imageUrls = await uploadListingImagesIfNeeded({
    listingId,
    createdByUid: payload.createdByUid,
    imageUrls: payload.imageUrls,
  });
  const priceLabel = cleanPrice > 0 ? `$${cleanPrice}/mo` : 'Price on request';

  const listingData = {
    id: listingId,
    title: payload.title.trim() || 'Untitled Listing',
    price: priceLabel,
    priceAmount: cleanPrice,
    imageUrls,
    imageUrl: imageUrls[0] || FALLBACK_LISTING_IMAGE,
    type: payload.type?.trim() || 'Not specified',
    description: payload.description.trim() || 'No description provided.',
    location: payload.location.trim() || 'Location not provided',
    distanceKm: payload.distanceKm?.toString().trim() ? Number(payload.distanceKm) : null,
    landlordName: payload.landlordName || 'New Landlord',
    landlordIdentifier: payload.landlordIdentifier || '0000000000',
    createdByIdentifier,
    createdByRole: payload.createdByRole,
    createdByUid: payload.createdByUid,
    createdByKey: buildOwnerKey({
      identifier: payload.createdByIdentifier,
      role: payload.createdByRole,
    }),
    isSold: false,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(firestore, 'listings', listingId), listingData);
  return normalizeListing(listingData);
};

export const updateListing = async ({ listingId, updates, user }) => {
  if (!user?.id) {
    throw new Error('You need to be signed in to edit a listing.');
  }

  const nextImageUrls = updates?.imageUrls
    ? await uploadListingImagesIfNeeded({
        listingId,
        createdByUid: user.id,
        imageUrls: updates.imageUrls,
      })
    : null;

  const nextPriceAmount = updates?.price !== undefined ? normalizePrice(updates.price) : undefined;

  const nextData = {
    ...(updates?.title !== undefined ? { title: updates.title.trim() || 'Untitled Listing' } : {}),
    ...(updates?.price !== undefined
      ? {
          priceAmount: nextPriceAmount,
          price: nextPriceAmount > 0 ? `$${nextPriceAmount}/mo` : 'Price on request',
        }
      : {}),
    ...(updates?.type !== undefined ? { type: updates.type.trim() || 'Not specified' } : {}),
    ...(updates?.description !== undefined
      ? { description: updates.description.trim() || 'No description provided.' }
      : {}),
    ...(updates?.location !== undefined ? { location: updates.location.trim() || 'Location not provided' } : {}),
    ...(updates?.distanceKm !== undefined
      ? {
          distanceKm: updates.distanceKm?.toString().trim() ? Number(updates.distanceKm) : null,
        }
      : {}),
    ...(nextImageUrls
      ? {
          imageUrls: nextImageUrls,
          imageUrl: nextImageUrls[0] || FALLBACK_LISTING_IMAGE,
        }
      : {}),
  };

  const listingRef = doc(firestore, 'listings', listingId);
  const snapshot = await getDoc(listingRef);

  if (!snapshot.exists()) {
    throw new Error('Listing not found.');
  }

  if (snapshot.data().createdByUid !== user.id) {
    throw new Error('You can only edit your own listings.');
  }

  await updateDoc(listingRef, nextData);

  return normalizeListing({
    id: snapshot.id,
    ...snapshot.data(),
    ...nextData,
  });
};

export const deleteListing = async ({ listingId, user }) => {
  if (!user?.id) {
    throw new Error('You need to be signed in to delete a listing.');
  }

  const listingRef = doc(firestore, 'listings', listingId);
  const snapshot = await getDoc(listingRef);

  if (!snapshot.exists()) {
    throw new Error('Listing not found.');
  }

  if (snapshot.data().createdByUid !== user.id) {
    throw new Error('You can only delete your own listings.');
  }

  await deleteDoc(listingRef);
  return 'Listing deleted successfully.';
};

export const setListingSoldStatus = async ({ listingId, isSold, user }) => {
  if (!user?.id) {
    throw new Error('You need to be signed in to update a listing.');
  }

  const listingRef = doc(firestore, 'listings', listingId);
  const snapshot = await getDoc(listingRef);

  if (!snapshot.exists()) {
    throw new Error('Listing not found.');
  }

  if (snapshot.data().createdByUid !== user.id) {
    throw new Error('You can only update your own listings.');
  }

  await updateDoc(listingRef, { isSold });

  return normalizeListing({
    id: snapshot.id,
    ...snapshot.data(),
    isSold,
  });
};

export const getFavoriteIds = async (user) => {
  if (!user?.id) {
    return [];
  }

  const snapshot = await getDoc(doc(firestore, 'users', user.id));

  if (!snapshot.exists()) {
    return [];
  }

  return Array.isArray(snapshot.data().favoriteListingIds) ? snapshot.data().favoriteListingIds : [];
};

export const toggleFavorite = async (listingId, user) => {
  if (!user?.id) {
    return false;
  }

  const favoriteIds = await getFavoriteIds(user);
  const isAlreadyFavorited = favoriteIds.includes(listingId);

  await updateDoc(doc(firestore, 'users', user.id), {
    favoriteListingIds: isAlreadyFavorited ? arrayRemove(listingId) : arrayUnion(listingId),
  });

  return !isAlreadyFavorited;
};

export const isFavorite = async (listingId, user) => {
  const favoriteIds = await getFavoriteIds(user);
  return favoriteIds.includes(listingId);
};

export const filterListings = ({ listings, search, type, maxPrice, maxDistance }) => {
  const normalizedSearch = search.trim().toLowerCase();
  const parsedMaxPrice = Number(maxPrice);
  const parsedMaxDistance = Number(maxDistance);

  return listings.filter((item) => {
    const itemPrice = item.priceAmount || normalizePrice(item.price);
    const matchesSearch =
      !normalizedSearch ||
      item.title.toLowerCase().includes(normalizedSearch) ||
      (item.location || '').toLowerCase().includes(normalizedSearch) ||
      item.price.includes(normalizedSearch);

    const matchesType = type === ROOM_TYPES.ALL || item.type === type;
    const matchesPrice = !parsedMaxPrice || itemPrice <= parsedMaxPrice;
    const matchesDistance = !parsedMaxDistance || Number(item.distanceKm) <= parsedMaxDistance;

    return matchesSearch && matchesType && matchesPrice && matchesDistance;
  });
};
