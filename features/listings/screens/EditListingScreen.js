import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import colors from '../../../shared/constants/colors';
import CustomButton from '../../../shared/components/CustomButton';
import { useAuth } from '../../auth/hooks/useAuth';
import * as listingService from '../services/listingService';

export default function EditListingScreen({ navigation, route }) {
  const { user } = useAuth();
  const listing = route.params?.listing;
  const initialImages = useMemo(
    () => (Array.isArray(listing?.imageUrls) && listing.imageUrls.length ? listing.imageUrls : [listing?.imageUrl].filter(Boolean)),
    [listing]
  );

  const [title, setTitle] = useState(listing?.title || '');
  const [price, setPrice] = useState(listing?.priceAmount ? String(listing.priceAmount) : '');
  const [type, setType] = useState(listing?.type === 'Not specified' ? '' : listing?.type || '');
  const [description, setDescription] = useState(
    listing?.description === 'No description provided.' ? '' : listing?.description || ''
  );
  const [location, setLocation] = useState(
    listing?.location === 'Location not provided' ? '' : listing?.location || ''
  );
  const [distanceKm, setDistanceKm] = useState(listing?.distanceKm == null ? '' : String(listing.distanceKm));
  const [selectedImages, setSelectedImages] = useState(initialImages);
  const [saving, setSaving] = useState(false);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need permission to access your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      const nextImages = result.assets
        .map((asset) => {
          const mimeType = asset.mimeType || 'image/jpeg';
          return asset.base64 ? `data:${mimeType};base64,${asset.base64}` : asset.uri;
        })
        .filter(Boolean);

      setSelectedImages((current) => [...current, ...nextImages]);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await listingService.updateListing({
        listingId: listing.id,
        updates: {
          title,
          price,
          type,
          description,
          location,
          distanceKm,
          imageUrls: selectedImages,
        },
        user,
      });

      Alert.alert('Listing updated', 'Your changes have been saved.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Update failed', error.message || 'Unable to update this listing right now.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Edit</Text>
        <Text style={styles.title}>Update Listing</Text>
        <Text style={styles.subtitle}>Change any details, adjust the photos, and save when you are ready.</Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>Title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Untitled Listing" />

          <Text style={styles.label}>Price (monthly CAD)</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            keyboardType="number-pad"
            placeholder="Price on request"
          />

          <Text style={styles.label}>Room Type</Text>
          <TextInput style={styles.input} value={type} onChangeText={setType} placeholder="Not specified" />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            placeholder="No description provided."
          />

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Location not provided"
          />

          <Text style={styles.label}>Distance from UNBC (km)</Text>
          <TextInput
            style={styles.input}
            value={distanceKm}
            onChangeText={setDistanceKm}
            keyboardType="decimal-pad"
            placeholder="Distance not listed"
          />

          <CustomButton
            title={selectedImages.length ? 'Add More Photos' : 'Upload Photos'}
            variant="outline"
            onPress={pickImages}
            style={styles.uploadButton}
          />

          {selectedImages.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewRow}>
              {selectedImages.map((imageUri, index) => (
                <View key={`${imageUri}-${index}`} style={styles.previewCard}>
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setSelectedImages((current) => current.filter((_, imageIndex) => imageIndex !== index))}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="close" size={16} color={colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={28} color={colors.textMuted} />
              <Text style={styles.placeholderText}>No photos selected</Text>
            </View>
          )}

          <CustomButton
            title={saving ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            disabled={saving}
            style={styles.saveButton}
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
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  content: {
    padding: 20,
    paddingBottom: 30,
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
    marginBottom: 18,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 18,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  multilineInput: {
    minHeight: 96,
    paddingTop: 12,
  },
  uploadButton: {
    marginBottom: 12,
  },
  previewRow: {
    gap: 12,
    paddingBottom: 6,
    marginBottom: 16,
  },
  previewCard: {
    position: 'relative',
  },
  previewImage: {
    width: 220,
    height: 220,
    borderRadius: 14,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderImage: {
    height: 170,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    marginTop: 8,
    color: colors.textMuted,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 4,
    height: 54,
    borderRadius: 14,
  },
});
