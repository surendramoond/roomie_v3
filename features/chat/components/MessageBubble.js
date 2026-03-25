import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../../shared/constants/colors';
import { USER_ROLES } from '../../../shared/constants/roles';

export default function MessageBubble({ message, userRole }) {
  const expectedOwnSenderType = userRole === USER_ROLES.LANDLORD ? 'landlord' : 'student';
  const isOwnMessage = message.senderType === expectedOwnSenderType;
  const isSystemMessage = message.senderType === 'system';

  if (isSystemMessage) {
    // system notes sit in the middle so they do not feel like either person's message
    return (
      <View style={styles.systemContainer}>
        <Text style={styles.systemText}>{message.text}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isOwnMessage ? styles.ownContainer : styles.otherContainer]}>
      <Text style={styles.sender}>{message.senderName}</Text>
      <Text style={[styles.text, isOwnMessage && styles.ownText]}>{message.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  ownContainer: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  otherContainer: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceMuted,
  },
  sender: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    color: colors.textSecondary,
  },
  text: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  ownText: {
    color: colors.white,
  },
  systemContainer: {
    alignSelf: 'center',
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginBottom: 12,
  },
  systemText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
