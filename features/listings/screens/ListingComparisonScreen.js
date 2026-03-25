import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../../shared/constants/colors';

function ComparisonField({ label, value }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value || 'N/A'}</Text>
    </View>
  );
}

export default function ListingComparisonScreen({ route }) {
  const listings = route.params?.listings || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>Comparison</Text>
        <Text style={styles.title}>Side by Side</Text>
        <Text style={styles.subtitle}>Review your saved options before reaching out.</Text>

        {/* horizontal cards keep the fields aligned when students compare 2 or 3 options */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.compareRow}>
          {listings.map((listing) => (
            <View key={listing.id} style={styles.compareCard}>
              <Image source={{ uri: listing.imageUrls?.[0] || listing.imageUrl }} style={styles.image} />
              <View style={styles.cardBody}>
                <Text style={styles.cardPrice}>{listing.price || 'Price on request'}</Text>
                <Text style={styles.cardTitle}>{listing.title || 'Untitled Listing'}</Text>
                <ComparisonField label="Type" value={listing.type || 'Not specified'} />
                <ComparisonField label="Location" value={listing.location || 'Location not provided'} />
                <ComparisonField
                  label="Distance"
                  value={listing.distanceKm == null ? 'Distance not listed' : `${listing.distanceKm} km from UNBC`}
                />
                <ComparisonField label="Landlord" value={listing.landlordName || 'Roomie User'} />
                <ComparisonField label="Description" value={listing.description || 'No description provided.'} />
              </View>
            </View>
          ))}
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
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
    marginTop: 6,
    marginBottom: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  compareRow: {
    paddingRight: 20,
  },
  compareCard: {
    width: 290,
    marginRight: 14,
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: 'hidden',
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
  cardPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  cardTitle: {
    marginTop: 6,
    marginBottom: 14,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  fieldRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
});
