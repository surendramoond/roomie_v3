import React, { useCallback, useState } from 'react';
import { ActivityIndicator, View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../../shared/constants/colors';
import { useAuth } from '../../auth/hooks/useAuth';
import * as listingService from '../services/listingService';
import { STACK_ROUTES } from '../../../shared/constants/navigation';
import { USER_ROLES } from '../../../shared/constants/roles';
import CustomButton from '../../../shared/components/CustomButton';

export default function SavedScreen({ navigation }) {
  const { user } = useAuth();
  const [savedListings, setSavedListings] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSaved = useCallback(async () => {
    if (user?.role !== USER_ROLES.STUDENT) {
      setSavedListings([]);
      setFavoriteIds([]);
      return;
    }

    try {
      setLoading(true);
      const [listingsResponse, favoriteIdResponse] = await Promise.all([
        listingService.getListings(),
        listingService.getFavoriteIds(user),
      ]);
      setSavedListings(listingsResponse.filter((listing) => favoriteIdResponse.includes(listing.id)));
      setFavoriteIds(favoriteIdResponse);
      setSelectedIds((current) => current.filter((id) => favoriteIdResponse.includes(id)));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadSaved();
    }, [loadSaved])
  );

  const handleToggleFavorite = async (listingId) => {
    await listingService.toggleFavorite(listingId, user);
    setFavoriteIds((current) => current.filter((favoriteId) => favoriteId !== listingId));
    setSavedListings((current) => current.filter((listing) => listing.id !== listingId));
    setSelectedIds((current) => current.filter((selectedId) => selectedId !== listingId));
  };

  const handleToggleSelection = (listingId) => {
    setSelectedIds((current) => {
      if (current.includes(listingId)) {
        return current.filter((id) => id !== listingId);
      }

      // comparison is capped at 3 so the side by side screen stays readable
      if (current.length >= 3) {
        return current;
      }

      return [...current, listingId];
    });
  };

  const handleCompare = () => {
    const selectedListings = savedListings.filter((listing) => selectedIds.includes(listing.id));
    navigation.navigate(STACK_ROUTES.LISTING_COMPARISON, {
      listings: selectedListings,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Saved Listings</Text>
          <View style={styles.compareCard}>
          <Text style={styles.compareTitle}>Compare Shortlist</Text>
          <Text style={styles.compareSubtitle}>Select listings to compare.</Text>
          <CustomButton
            title={selectedIds.length >= 2 ? `Compare ${selectedIds.length} Listings` : 'Select 2 Listings to Compare'}
            onPress={handleCompare}
            disabled={selectedIds.length < 2}
            style={styles.compareButton}
          />
        </View>
      </View>

      <FlatList
        data={savedListings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.savedCardWrap}>
            <View
              style={[
                styles.savedRow,
                selectedIds.includes(item.id) && styles.savedRowActive,
              ]}
            >
              <TouchableOpacity
                style={styles.savedRowContent}
                activeOpacity={0.85}
                onPress={() => navigation.navigate(STACK_ROUTES.DETAILS, { room: item })}
              >
                <View style={styles.savedTopRow}>
                  <Text style={styles.savedPrice}>{item.price}</Text>
                  <TouchableOpacity
                    onPress={() => handleToggleFavorite(item.id)}
                    activeOpacity={0.85}
                    style={styles.savedIconButton}
                  >
                    <Ionicons name="bookmark" size={18} color={colors.primaryDark} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.savedTitle}>{item.title}</Text>
                <Text style={styles.savedMeta}>{`${item.type} • ${item.distanceKm} km from UNBC`}</Text>
                <Text style={styles.savedLocation}>{item.location}</Text>
                <Text style={styles.savedLandlord}>{item.landlordName}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.selectBoxWrap}
                onPress={() => handleToggleSelection(item.id)}
                activeOpacity={0.85}
              >
                <View style={[styles.selectBox, selectedIds.includes(item.id) && styles.selectBoxActive]}>
                  {selectedIds.includes(item.id) && <Ionicons name="checkmark" size={18} color={colors.white} />}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.emptyText}>Loading saved listings...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="bookmark-outline" size={30} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No saved listings yet</Text>
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
    padding: 18,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  compareCard: {
    marginTop: 12,
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    padding: 14,
  },
  compareTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  compareSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  compareButton: {
    marginTop: 10,
    height: 44,
    borderRadius: 12,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 24,
  },
  savedCardWrap: {
    marginBottom: 10,
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  savedRowActive: {
    backgroundColor: colors.primarySurface,
    borderColor: '#BFD5B2',
  },
  savedRowContent: {
    flex: 1,
    paddingRight: 12,
  },
  savedTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savedPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  savedIconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedTitle: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  savedMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  savedLocation: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textMuted,
  },
  savedLandlord: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  selectBoxWrap: {
    width: 54,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    paddingLeft: 8,
  },
  selectBox: {
    width: 30,
    height: 30,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  selectBoxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  emptyState: {
    marginTop: 60,
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
    textAlign: 'center',
    marginTop: 6,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
