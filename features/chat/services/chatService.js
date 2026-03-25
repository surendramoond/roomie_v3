import {
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
import { firestore } from '../../../shared/services/firebase/firebaseApp';

const sortByNewest = (items, fieldName) =>
  [...items].sort((first, second) => (second[fieldName] || '').localeCompare(first[fieldName] || ''));

const buildUserKey = (user) => {
  if (!user?.identifier || !user?.role) {
    return null;
  }

  return `${user.role}:${user.identifier}`;
};

const getConversationCollection = () => collection(firestore, 'conversations');

const getMessageCollection = (conversationId) =>
  collection(firestore, 'conversations', conversationId, 'messages');

const mapConversation = (snapshot) => ({
  id: snapshot.id,
  ...snapshot.data(),
});

const mapMessage = (snapshot) => ({
  id: snapshot.id,
  ...snapshot.data(),
});

const assertConversationAccess = async (conversationId, userId) => {
  const snapshot = await getDoc(doc(firestore, 'conversations', conversationId));

  if (!snapshot.exists()) {
    throw new Error('Conversation not found.');
  }

  const conversation = mapConversation(snapshot);

  if (!conversation.participantIds?.includes(userId)) {
    throw new Error('You do not have access to this conversation.');
  }

  return conversation;
};

export const getConversations = async (user) => {
  if (!user?.id) {
    return [];
  }

  const snapshot = await getDocs(
    query(getConversationCollection(), where('participantIds', 'array-contains', user.id))
  );

  return sortByNewest(snapshot.docs.map(mapConversation), 'lastMessageAt');
};

export const getConversationById = async (conversationId, user) => {
  if (!user?.id) {
    return null;
  }

  return assertConversationAccess(conversationId, user.id);
};

export const getMessages = async (conversationId, user) => {
  if (!user?.id) {
    return [];
  }

  await assertConversationAccess(conversationId, user.id);
  const snapshot = await getDocs(query(getMessageCollection(conversationId)));
  return sortByNewest(snapshot.docs.map(mapMessage), 'createdAt').reverse();
};

export const ensureConversationForListing = async ({
  listingId,
  listingTitle,
  landlordName,
  landlordIdentifier,
  landlordUid,
  requesterIdentifier,
  requesterName,
  requesterUid,
}) => {
  if (!landlordUid || !requesterUid) {
    throw new Error('Missing participant details for this conversation.');
  }

  const existingConversationsSnapshot = await getDocs(
    query(getConversationCollection(), where('participantIds', 'array-contains', requesterUid))
  );

  const existingConversation = existingConversationsSnapshot.docs
    .map(mapConversation)
    .find(
      (conversation) =>
        conversation.listingId === listingId &&
        conversation.landlordUid === landlordUid &&
        conversation.requesterUid === requesterUid
    );

  if (existingConversation) {
    return existingConversation;
  }

  const createdAt = new Date().toISOString();
  const starterText = `Conversation started for "${listingTitle}".`;
  const conversationRef = doc(getConversationCollection());
  const conversationData = {
    id: conversationRef.id,
    listingId,
    listingTitle,
    landlordName,
    landlordIdentifier,
    landlordUid,
    requesterIdentifier,
    requesterName,
    requesterUid,
    participantIds: [landlordUid, requesterUid],
    lastMessageText: starterText,
    lastMessageAt: createdAt,
    updatedAt: createdAt,
    createdAt,
  };

  await setDoc(conversationRef, conversationData);
  await setDoc(doc(getMessageCollection(conversationRef.id)), {
    conversationId: conversationRef.id,
    senderType: 'system',
    senderName: 'Roomie',
    text: starterText,
    createdAt,
    createdByKey: 'system',
    senderUid: requesterUid,
  });

  return conversationData;
};

export const sendMessage = async ({ conversationId, text, user }) => {
  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new Error('Message text is required.');
  }

  const messageData = {
    conversationId,
    senderType: user.role === 'Landlord' ? 'landlord' : 'student',
    senderName: user.displayName || 'You',
    text: trimmedText,
    createdAt: new Date().toISOString(),
    createdByKey: buildUserKey(user),
    senderUid: user.id,
  };

  await assertConversationAccess(conversationId, user.id);
  const messageRef = doc(getMessageCollection(conversationId));

  await setDoc(messageRef, messageData);
  await updateDoc(doc(firestore, 'conversations', conversationId), {
    lastMessageText: trimmedText,
    lastMessageAt: messageData.createdAt,
    updatedAt: messageData.createdAt,
  });

  return {
    id: messageRef.id,
    ...messageData,
  };
};
