import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../../shared/components/CustomButton';
import colors from '../../../shared/constants/colors';
import { useAuth } from '../../auth/hooks/useAuth';
import * as chatService from '../../chat/services/chatService';
import * as listingService from '../services/listingService';
import { STACK_ROUTES } from '../../../shared/constants/navigation';
import { USER_ROLES } from '../../../shared/constants/roles';

export default function DetailScreen({ route, navigation }) {
  const { room } = route.params;
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const isStudent = user?.role === USER_ROLES.STUDENT;
  const isOwnListing = user?.id === room.createdByUid || user?.identifier === room.landlordIdentifier;
  const contactLabel = room?.createdByRole === USER_ROLES.STUDENT ? 'Contact Poster' : 'Contact Landlord';
  const ownerLabel = room?.createdByRole === USER_ROLES.STUDENT ? 'Posted by' : 'Landlord';
  const [isFavorite, setIsFavorite] = useState(false);
  const imageUrls = (Array.isArray(room?.imageUrls) && room.imageUrls.length ? room.imageUrls : [room?.imageUrl]).filter(
    Boolean
  );
  const priceLabel = room?.price || 'Price on request';
  const titleLabel = room?.title || 'Untitled Listing';
  const typeLabel = room?.type || 'Not specified';
  const distanceLabel = room?.distanceKm == null ? 'Distance not listed' : `${room.distanceKm} km from UNBC`;
  const locationLabel = room?.location || 'Location not provided';
  const descriptionLabel = room?.description || 'No description provided.';
  const ownerName = room?.landlordName || 'Roomie User';

  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (!isStudent) {
        setIsFavorite(false);
        return;
      }

      const favorite = await listingService.isFavorite(room.id, user);
      setIsFavorite(favorite);
    };

    loadFavoriteStatus();
  }, [isStudent, room.id, user]);

  const openMap = async () => {
    if (!room?.location || room.location === 'Location not provided') {
      Alert.alert('Location unavailable', 'This listing does not include a map location yet.');
      return;
    }

    const encodedLocation = encodeURIComponent(room.location);
    const candidateUrls =
      Platform.OS === 'ios'
        ? [
            `http://maps.apple.com/?q=${encodedLocation}`,
            `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`,
          ]
        : [`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`];

    try {
      for (const url of candidateUrls) {
        const supported = await Linking.canOpenURL(url);

        if (supported) {
          await Linking.openURL(url);
          return;
        }
      }

      Alert.alert('Map unavailable', 'Unable to open maps on this device right now.');
    } catch (error) {
      Alert.alert('Map unavailable', error?.message || 'Unable to open maps on this device right now.');
    }
  };

  const handleToggleFavorite = async () => {
    if (!isStudent) {
      return;
    }

    const nextFavorite = await listingService.toggleFavorite(room.id, user);
    setIsFavorite(nextFavorite);
  };

  const handleContactLandlord = async () => {
    // first tap creates a demo conversation if one does not exist yet
    const conversation = await chatService.ensureConversationForListing({
      listingId: room.id,
      listingTitle: room.title,
      landlordName: room.landlordName,
      landlordIdentifier: room.landlordIdentifier,
      landlordUid: room.createdByUid,
      requesterIdentifier: user?.identifier || 'guest',
      requesterName: user?.displayName || user?.identifier || 'Student',
      requesterUid: user?.id,
    });

    if (!conversation) {
      Alert.alert('Unable to open chat', 'Please try again.');
      return;
    }

    navigation.navigate(STACK_ROUTES.CHAT_ROOM, {
      conversationId: conversation.id,
      participantName: conversation.landlordName,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {imageUrls.map((imageUri, index) => (
          <Image
            key={`${imageUri}-${index}`}
            source={{ uri: imageUri }}
            style={[styles.image, { width }]}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      {isStudent && (
        <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite}>
          <Ionicons
            name={isFavorite ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={isFavorite ? colors.primaryDark : colors.textSecondary}
          />
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        <View style={styles.kickerRow}>
          <Text style={styles.kicker}>Listing Details</Text>
          <Text style={styles.kicker}>{typeLabel}</Text>
        </View>
        <Text style={styles.price}>{priceLabel}</Text>
        <Text style={styles.title}>{titleLabel}</Text>
        <Text style={styles.meta}>{`${typeLabel} • ${distanceLabel}`}</Text>
        <Text style={styles.location}>{locationLabel}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.desc}>{descriptionLabel}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{ownerLabel}</Text>
          <Text style={styles.landlord}>{ownerName}</Text>
        </View>

        <TouchableOpacity style={styles.mapButton} onPress={openMap}>
          <Ionicons name="location" size={20} color={colors.white} />
          <Text style={styles.mapButtonText}>View on Map</Text>
        </TouchableOpacity>

        {isStudent && !isOwnListing && (
          <CustomButton title={contactLabel} onPress={handleContactLandlord} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundAlt },
  image: { height: 250, backgroundColor: colors.surfaceMuted },
  favoriteButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 20 },
  kickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  kicker: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  price: { fontSize: 28, fontWeight: 'bold', color: colors.primary },
  title: { fontSize: 22, fontWeight: '600', marginVertical: 8, color: colors.textPrimary },
  meta: { fontSize: 14, color: colors.textSecondary },
  location: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  section: { marginVertical: 18 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: colors.textPrimary },
  desc: { fontSize: 16, color: colors.textSecondary, lineHeight: 24 },
  landlord: { fontSize: 16, color: colors.textPrimary },
  mapButton: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  mapButtonText: { color: colors.white, fontWeight: 'bold', marginLeft: 10 },
});
