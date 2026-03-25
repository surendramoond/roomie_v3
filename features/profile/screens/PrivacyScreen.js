import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../../shared/constants/colors';

function PrivacyBlock({ title, description }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      <Text style={styles.blockDescription}>{description}</Text>
    </View>
  );
}

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>Privacy</Text>
        <Text style={styles.title}>Privacy & Data</Text>
        {/* this screen explains current demo behavior so nothing feels hidden */}
        <Text style={styles.subtitle}>
          This frontend demo stores temporary account, listing, saved, and chat data only inside the running app.
        </Text>

        <View style={styles.card}>
          <PrivacyBlock
            title="Temporary Demo Data"
            description="Listings and demo chats you create on the frontend are local mock data and can be cleared on logout."
          />
          <PrivacyBlock
            title="Profile Visibility"
            description="Your display name, location, and bio are shown in the profile area for the current app session."
          />
          <PrivacyBlock
            title="Backend Handoff"
            description="Real privacy rules, storage, and retention policies will be defined once backend services are connected."
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  container: {
    padding: 20,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 8,
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: 18,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 18,
  },
  block: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  blockDescription: {
    marginTop: 6,
    color: colors.textSecondary,
    lineHeight: 21,
  },
});
