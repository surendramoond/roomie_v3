import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../../shared/constants/colors';

function SettingRow({ title, description, value, onValueChange }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingCopy}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#C9D2C0', true: '#8FC287' }}
        thumbColor={colors.white}
      />
    </View>
  );
}

export default function AppSettingsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [listingAlerts, setListingAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>Settings</Text>
        <Text style={styles.title}>App Settings</Text>
        {/* these toggles are frontend-only for now, but the state shape is ready for real settings later */}
        <Text style={styles.subtitle}>Control alerts and basic app preferences for your frontend demo account.</Text>

        <View style={styles.card}>
          <SettingRow
            title="Push Notifications"
            description="Get notified when new messages and listing activity appear."
            value={pushEnabled}
            onValueChange={setPushEnabled}
          />
          <SettingRow
            title="Listing Alerts"
            description="Show updates when saved listings change price or availability."
            value={listingAlerts}
            onValueChange={setListingAlerts}
          />
          <SettingRow
            title="Marketing Emails"
            description="Receive product tips and periodic housing updates from Roomie."
            value={marketingEmails}
            onValueChange={setMarketingEmails}
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingCopy: {
    flex: 1,
    paddingRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  settingDescription: {
    marginTop: 4,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
