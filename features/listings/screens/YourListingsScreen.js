import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../../shared/constants/colors';
import CustomButton from '../../../shared/components/CustomButton';
import { STACK_ROUTES, TAB_ROUTES } from '../../../shared/constants/navigation';
import { useAuth } from '../../auth/hooks/useAuth';
import * as listingService from '../services/listingService';

function StatusPill({ sold }) {
  return (
    <View style={[styles.statusPill, sold ? styles.statusPillSold : styles.statusPillActive]}>
      <Text style={[styles.statusText, sold ? styles.statusTextSold : styles.statusTextActive]}>
        {sold ? 'Sold' : 'Active'}
      </Text>
    </View>
  );
}

export default function YourListingsScreen({ navigation }) {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadListings = useCallback(async () => {
    if (!user) {
      setListings([]);
      return;
    }

    try {
      setLoading(true);
      const response = await listingService.getListingsCreatedByUser(user);
      setListings(response);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadListings();
    }, [loadListings])
  );

  const handleDelete = (listing) => {
    Alert.alert(
      'Delete listing',
      `Delete "${listing.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoadingId(listing.id);
              await listingService.deleteListing({ listingId: listing.id, user });
              await loadListings();
            } catch (error) {
              Alert.alert('Delete failed', error.message || 'Unable to delete this listing right now.');
            } finally {
              setLoadingId(null);
            }
          },
        },
      ]
    );
  };

  const handleToggleSold = async (listing) => {
    try {
      setLoadingId(listing.id);
      await listingService.setListingSoldStatus({
        listingId: listing.id,
        isSold: !listing.isSold,
        user,
      });
      await loadListings();
    } catch (error) {
      Alert.alert('Update failed', error.message || 'Unable to update this listing right now.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Manage</Text>
        <Text style={styles.title}>Your Listings</Text>
        <Text style={styles.subtitle}>
          Review everything you have posted, edit details, delete old posts, or mark listings as sold.
        </Text>
        <CustomButton
          title="Create New Listing"
          onPress={() => navigation.navigate(STACK_ROUTES.MAIN_TABS, { screen: TAB_ROUTES.ADD })}
          style={styles.createButton}
        />
      </View>

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const busy = loadingId === item.id;

          return (
            <View style={styles.card}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate(STACK_ROUTES.DETAILS, { room: item })}
              >
                <Image source={{ uri: item.imageUrls?.[0] || item.imageUrl }} style={styles.image} />
              </TouchableOpacity>

              <View style={styles.cardBody}>
                <View style={styles.topRow}>
                  <Text style={styles.price}>{item.price}</Text>
                  <StatusPill sold={item.isSold} />
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMeta}>
                  {item.type} • {item.distanceKm == null ? 'Distance not listed' : `${item.distanceKm} km`}
                </Text>
                <Text style={styles.cardLocation}>{item.location}</Text>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate(STACK_ROUTES.EDIT_LISTING, { listing: item })}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="create-outline" size={16} color={colors.primaryDark} />
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleToggleSold(item)}
                    activeOpacity={0.85}
                    disabled={busy}
                  >
                    <Ionicons
                      name={item.isSold ? 'refresh-outline' : 'checkmark-done-outline'}
                      size={16}
                      color={colors.primaryDark}
                    />
                    <Text style={styles.actionText}>{item.isSold ? 'Mark Active' : 'Mark Sold'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(item)}
                    activeOpacity={0.85}
                    disabled={busy}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.danger} />
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.emptyText}>Loading your listings...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="home-outline" size={30} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No listings yet</Text>
              <Text style={styles.emptyText}>Create your first listing and it will show up here for editing.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  header: {
    padding: 20,
    backgroundColor: colors.background,
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
  },
  createButton: {
    marginTop: 14,
    height: 46,
    borderRadius: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: '100%',
    height: 180,
  },
  cardBody: {
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusPillActive: {
    backgroundColor: colors.primarySoft,
  },
  statusPillSold: {
    backgroundColor: '#FCE8E7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextActive: {
    color: colors.primaryDark,
  },
  statusTextSold: {
    color: colors.danger,
  },
  cardTitle: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardMeta: {
    marginTop: 6,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  cardLocation: {
    marginTop: 4,
    color: colors.textMuted,
  },
  actionRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  actionText: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#FCE8E7',
  },
  deleteText: {
    color: colors.danger,
    fontWeight: '700',
  },
  emptyState: {
    marginTop: 70,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyText: {
    marginTop: 6,
    lineHeight: 20,
    textAlign: 'center',
    color: colors.textSecondary,
  },
});
