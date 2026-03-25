import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../shared/constants/colors';

export default function ListingCard({
  room,
  isFavorite,
  onPress,
  onToggleFavorite,
  showFavoriteButton = true,
}) {
  const primaryImage = room?.imageUrls?.[0] || room?.imageUrl;
  const priceLabel = room?.price || 'Price on request';
  const titleLabel = room?.title || 'Untitled Listing';
  const typeLabel = room?.type || 'Not specified';
  const distanceLabel = room?.distanceKm == null ? 'Distance not listed' : `${room.distanceKm} km`;
  const locationLabel = room?.location || 'Location not provided';
  const ownerLabel = room?.landlordName || 'Roomie User';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <Image source={{ uri: primaryImage }} style={styles.image} />
      {showFavoriteButton && (
        <TouchableOpacity style={styles.favoriteButton} onPress={onToggleFavorite}>
          <Ionicons
            name={isFavorite ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isFavorite ? colors.primaryDark : colors.textSecondary}
          />
        </TouchableOpacity>
      )}

      <View style={styles.info}>
        <Text style={styles.price}>{priceLabel}</Text>
        <Text style={styles.title}>{titleLabel}</Text>
        <Text style={styles.meta}>{`${typeLabel}  •  ${distanceLabel}`}</Text>
        <Text style={styles.location}>{locationLabel}</Text>
        <Text style={styles.landlord}>{ownerLabel}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 18,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6ECE2',
    shadowColor: '#17351D',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 142,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    padding: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  title: {
    fontSize: 15,
    color: colors.textPrimary,
    marginTop: 3,
    fontWeight: '600',
  },
  meta: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 3,
  },
  location: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 1,
  },
  landlord: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '700',
    marginTop: 8,
  },
});
