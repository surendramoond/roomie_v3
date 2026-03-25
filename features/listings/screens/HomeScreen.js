import React, { useCallback, useState } from 'react';
import { ActivityIndicator, View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import ListingCard from '../components/ListingCard';
import colors from '../../../shared/constants/colors';
import * as listingService from '../services/listingService';
import { useAuth } from '../../auth/hooks/useAuth';
import { ROOM_TYPE_FILTER_OPTIONS, ROOM_TYPES } from '../constants/listings';
import { STACK_ROUTES } from '../../../shared/constants/navigation';
import { USER_ROLES } from '../../../shared/constants/roles';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const isStudent = user?.role === USER_ROLES.STUDENT;
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState(ROOM_TYPES.ALL);
  const [maxPrice, setMaxPrice] = useState('');
  const [maxDistance, setMaxDistance] = useState('');
  const [rooms, setRooms] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [createdCount, setCreatedCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const resetFilters = () => {
    setSearch('');
    setTypeFilter(ROOM_TYPES.ALL);
    setMaxPrice('');
    setMaxDistance('');
  };

  const hasActiveFilters =
    Boolean(search.trim()) || typeFilter !== ROOM_TYPES.ALL || Boolean(maxPrice) || Boolean(maxDistance);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [listingsResponse, favoritesResponse, createdListingsResponse] = await Promise.all([
        listingService.getListings(),
        listingService.getFavoriteIds(user),
        listingService.getListingsCreatedByUser(user),
      ]);
      setRooms(listingsResponse);
      setFavoriteIds(favoritesResponse);
      setCreatedCount(createdListingsResponse.length);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filteredRooms = listingService.filterListings({
    listings: rooms,
    search,
    type: typeFilter,
    maxPrice,
    maxDistance,
  });

  const handleToggleFavorite = async (listingId) => {
    if (!isStudent) {
      return;
    }

    const nextIsFavorite = await listingService.toggleFavorite(listingId, user);
    setFavoriteIds((current) =>
      nextIsFavorite ? [...current, listingId] : current.filter((favoriteId) => favoriteId !== listingId)
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Listings</Text>
        <Text style={styles.headerSubtitle}>Browse room options and save the ones you like.</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{filteredRooms.length}</Text>
            <Text style={styles.summaryLabel}>active listings</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{isStudent ? favoriteIds.length : createdCount}</Text>
            <Text style={styles.summaryLabel}>{isStudent ? 'Saved' : 'Total Posted'}</Text>
          </View>
        </View>

        <View style={styles.searchFilterRow}>
          {/* search stays visible, while the rest of the filters tuck into one compact toggle */}
          <View style={styles.searchShell}>
            <Ionicons name="search-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search listings..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.filterToggleButton,
              (showFilters || hasActiveFilters) && styles.filterToggleButtonActive,
            ]}
            onPress={() => setShowFilters((value) => !value)}
            activeOpacity={0.85}
          >
            <Ionicons
              name="options-outline"
              size={18}
              color={showFilters || hasActiveFilters ? colors.white : colors.primaryDark}
            />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filterPanel}>
            <View style={styles.filterPanelHeader}>
              <Text style={styles.filterHeaderText}>Filters</Text>
              {hasActiveFilters && (
                <TouchableOpacity onPress={resetFilters}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.filterRow}>
              <TextInput
                style={styles.filterInput}
                placeholder="Max $"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                value={maxPrice}
                onChangeText={setMaxPrice}
              />
              <TextInput
                style={styles.filterInput}
                placeholder="Max km"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={maxDistance}
                onChangeText={setMaxDistance}
              />
            </View>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={ROOM_TYPE_FILTER_OPTIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const selected = item === typeFilter;
                return (
                  <TouchableOpacity
                    style={[styles.filterChip, selected && styles.filterChipSelected]}
                    onPress={() => setTypeFilter(item)}
                  >
                    <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              style={styles.chipList}
            />
          </View>
        )}
      </View>

      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListingCard
            room={item}
            isFavorite={favoriteIds.includes(item.id)}
            onToggleFavorite={() => handleToggleFavorite(item.id)}
            onPress={() => navigation.navigate(STACK_ROUTES.DETAILS, { room: item })}
            showFavoriteButton={isStudent}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.emptyText}>Loading listings...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={28} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No matches found</Text>
              <Text style={styles.emptyText}>Try clearing filters or widening your price and distance range.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundAlt },
  header: { padding: 20, backgroundColor: colors.background },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySurface,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  summaryItem: {
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#CFE0C3',
    marginHorizontal: 10,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  summaryLabel: {
    marginTop: 1,
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchShell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 44,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  filterToggleButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterToggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPanel: {
    marginTop: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterHeaderText: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  clearText: {
    color: colors.primary,
    fontWeight: '700',
  },
  filterInput: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipList: {
    marginTop: 12,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.surfaceStrong,
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  filterChipTextSelected: {
    color: colors.white,
  },
  listContent: { padding: 15, paddingBottom: 24 },
  emptyState: {
    marginTop: 56,
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
