import React, { useCallback, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import CustomButton from '../../../shared/components/CustomButton';
import colors from '../../../shared/constants/colors';
import { TAB_ROUTES, STACK_ROUTES } from '../../../shared/constants/navigation';
import { USER_ROLES } from '../../../shared/constants/roles';
import { useAuth } from '../../auth/hooks/useAuth';
import * as listingService from '../../listings/services/listingService';
import * as chatService from '../../chat/services/chatService';

function ProfileLink({ icon, title, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.linkRow} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.linkIconWrap}>
        <Ionicons name={icon} size={18} color={colors.primaryDark} />
      </View>
      <View style={styles.linkCopy}>
        <Text style={styles.linkTitle}>{title}</Text>
        <Text style={styles.linkSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

function StatCard({ value, label }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statInline}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function QuickAction({ icon, title, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.quickTopRow}>
        <View style={styles.quickIconWrap}>
          <Ionicons name={icon} size={18} color={colors.primaryDark} />
        </View>
        <Text style={styles.quickTitle}>{title}</Text>
      </View>
      <Text style={styles.quickSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    chatCount: 0,
    createdCount: 0,
    soldCount: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  const identifier = user?.identifier || 'Guest';
  const displayName = user?.displayName || 'Roomie User';
  const roleLabel = user?.role === USER_ROLES.STUDENT ? 'Student' : 'Landlord';
  const profileImageUri = user?.profileImageUri || '';
  const isStudent = user?.role === USER_ROLES.STUDENT;
  const initials = (displayName || 'RU')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const loadDashboard = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      setLoadingStats(true);
      const [conversations, createdListings] = await Promise.all([
        chatService.getConversations(user),
        listingService.getListingsCreatedByUser(user),
      ]);

      setStats({
        chatCount: conversations.length,
        createdCount: createdListings.length,
        soldCount: createdListings.filter((listing) => listing.isSold).length,
      });
    } finally {
      setLoadingStats(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  const handleLogout = async () => {
    await logout();
  };

  const quickActions = isStudent
    ? [
        {
          icon: 'search-outline',
          title: 'Browse',
          subtitle: 'find rooms',
          onPress: () => navigation.navigate(STACK_ROUTES.MAIN_TABS, { screen: TAB_ROUTES.HOME }),
        },
        {
          icon: 'bookmark-outline',
          title: 'Saved',
          subtitle: 'review shortlist',
          onPress: () => navigation.navigate(STACK_ROUTES.MAIN_TABS, { screen: TAB_ROUTES.SAVED }),
        },
        {
          icon: 'chatbubble-outline',
          title: 'Chat',
          subtitle: 'open messages',
          onPress: () => navigation.navigate(STACK_ROUTES.MAIN_TABS, { screen: TAB_ROUTES.CHAT }),
        },
        {
          icon: 'clipboard-outline',
          title: 'Your Listings',
          subtitle: 'manage posts',
          onPress: () => navigation.navigate(STACK_ROUTES.YOUR_LISTINGS),
        },
      ]
    : [
        {
          icon: 'add-circle-outline',
          title: 'Post',
          subtitle: 'create listing',
          onPress: () => navigation.navigate(STACK_ROUTES.MAIN_TABS, { screen: TAB_ROUTES.ADD }),
        },
        {
          icon: 'home-outline',
          title: 'Market',
          subtitle: 'view active feed',
          onPress: () => navigation.navigate(STACK_ROUTES.MAIN_TABS, { screen: TAB_ROUTES.HOME }),
        },
        {
          icon: 'chatbubble-outline',
          title: 'Chat',
          subtitle: 'check messages',
          onPress: () => navigation.navigate(STACK_ROUTES.MAIN_TABS, { screen: TAB_ROUTES.CHAT }),
        },
        {
          icon: 'clipboard-outline',
          title: 'Your Listings',
          subtitle: 'manage posts',
          onPress: () => navigation.navigate(STACK_ROUTES.YOUR_LISTINGS),
        },
      ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.avatarContainer}>
              {profileImageUri ? (
                <Image source={{ uri: profileImageUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>{initials}</Text>
                </View>
              )}
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{roleLabel}</Text>
              </View>
            </View>

            <View style={styles.identityBlock}>
              <Text style={styles.displayName}>{displayName}</Text>
              <Text style={styles.identifierLabel}>Account</Text>
              <Text style={styles.identifierValue}>{identifier}</Text>
            </View>
          </View>

          <CustomButton
            title="Edit Profile"
            variant="outline"
            onPress={() => navigation.navigate(STACK_ROUTES.EDIT_PROFILE)}
            style={styles.heroEditButton}
            textStyle={styles.heroEditButtonText}
          />
        </View>

        <View style={styles.statsRow}>
          {loadingStats ? (
            <View style={styles.statsLoadingCard}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <>
              <StatCard value={stats.createdCount} label="your listings" />
              <StatCard value={stats.chatCount} label="chats" />
              <StatCard value={stats.soldCount} label="sold" />
            </>
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionHeading}>Quick Actions</Text>
          </View>
          <View style={styles.quickGrid}>
            {quickActions.map((item) => (
              <QuickAction
                key={item.title}
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                onPress={item.onPress}
              />
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionHeading}>About</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={colors.primaryDark} />
            <Text style={styles.meta}>{user?.location || 'Prince George, BC'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={16} color={colors.primaryDark} />
            <Text style={styles.bio}>{user?.bio || 'add a short bio so people know more about you.'}</Text>
          </View>
        </View>

        <View style={styles.linkCard}>
          <ProfileLink
            icon="settings-outline"
            title="App Settings"
            subtitle="Manage notification and app preferences."
            onPress={() => navigation.navigate(STACK_ROUTES.APP_SETTINGS)}
          />
          <ProfileLink
            icon="shield-checkmark-outline"
            title="Privacy"
            subtitle="Review how your demo data is handled."
            onPress={() => navigation.navigate(STACK_ROUTES.PRIVACY)}
          />
          <ProfileLink
            icon="clipboard-outline"
            title="Your Listings"
            subtitle="Edit, delete, or mark your listings as sold."
            onPress={() => navigation.navigate(STACK_ROUTES.YOUR_LISTINGS)}
          />
        </View>

        <CustomButton title="Logout" onPress={handleLogout} style={styles.logoutButton} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#17351D',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroEditButton: {
    marginTop: 18,
    height: 38,
    borderRadius: 14,
    alignSelf: 'flex-start',
    width: 'auto',
    paddingHorizontal: 16,
  },
  heroEditButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  avatarContainer: {
    marginRight: 16,
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarFallback: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.white,
  },
  roleBadge: {
    position: 'absolute',
    bottom: -12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.background,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  identityBlock: {
    flex: 1,
  },
  displayName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  identifierLabel: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  identifierValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statsLoadingCard: {
    flex: 1,
    minHeight: 76,
    borderRadius: 16,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D9E7CF',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.primarySurface,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D9E7CF',
  },
  statInline: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
  },
  sectionHeadingRow: {
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickAction: {
    width: '47%',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: '#DDE9D5',
  },
  quickTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  quickIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  quickSubtitle: {
    marginTop: 0,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 14,
    textAlign: 'center',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 14,
    flex: 1,
  },
  bio: {
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  linkCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 10,
    marginBottom: 18,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  linkIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  linkCopy: {
    flex: 1,
    paddingRight: 12,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  linkSubtitle: {
    marginTop: 4,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  logoutButton: {
    marginTop: 8,
    width: 'auto',
    minWidth: 140,
    paddingHorizontal: 22,
    alignSelf: 'center',
  },
});
