import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Alert, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import CustomButton from '../../../shared/components/CustomButton';
import colors from '../../../shared/constants/colors';
import { useAuth } from '../../auth/hooks/useAuth';
import * as listingService from '../services/listingService';
import { sanitizePhone, validateListingForm } from '../../../shared/utils/validation';

export default function AddScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setType('');
    setDescription('');
    setLocation('');
    setDistanceKm('');
    setSelectedImages([]);
  };

  const pickImage = async () => {
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

  const handleCreateListing = async () => {
    // keep the payload close to the form fields so this screen is easy to trace
    const payload = {
      title,
      price,
      type,
      description,
      location,
      distanceKm,
      imageUrls: selectedImages,
    };

    const validation = validateListingForm(payload);
    if (!validation.valid) {
      Alert.alert('Validation Error', validation.error);
      return;
    }

    setSubmitting(true);
    try {
      await listingService.createListing({
        ...payload,
        landlordName: user?.displayName || 'Roomie User',
        landlordIdentifier: user?.identifier ? sanitizePhone(user.identifier) || user.identifier : '0000000000',
        createdByIdentifier: user?.identifier,
        createdByRole: user?.role,
        createdByUid: user?.id,
      });

      Alert.alert('Listing Posted', 'Your listing is now available in Home.');
      resetForm();
    } catch (error) {
      Alert.alert('Listing Failed', error.message || 'Unable to create the listing right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Post a listing</Text>
        <View style={styles.formCard}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Cozy room near campus"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Price (monthly CAD)</Text>
          <TextInput
            style={styles.input}
            placeholder="650"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            value={price}
            onChangeText={setPrice}
          />

          <Text style={styles.label}>Room Type</Text>
          <TextInput
            style={styles.input}
            placeholder="Shared, Private Room, Basement, Full Suite"
            placeholderTextColor={colors.textMuted}
            value={type}
            onChangeText={setType}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Describe amenities, lease details, and move-in date."
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            placeholder="College Heights, Prince George"
            placeholderTextColor={colors.textMuted}
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.label}>Distance from UNBC (km)</Text>
          <TextInput
            style={styles.input}
            placeholder="2.5"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            value={distanceKm}
            onChangeText={setDistanceKm}
          />

          <CustomButton
            title={selectedImages.length ? 'Add More Photos' : 'Upload Photos'}
            variant="outline"
            onPress={pickImage}
            style={styles.uploadButton}
          />

          {selectedImages.length ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.previewRow}
            >
              {selectedImages.map((imageUri, index) => (
                <View key={`${imageUri}-${index}`} style={styles.previewCard}>
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() =>
                      setSelectedImages((current) => current.filter((_, imageIndex) => imageIndex !== index))
                    }
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
              <Text style={styles.placeholderImageText}>No photos selected yet</Text>
            </View>
          )}

          <CustomButton
            title={submitting ? 'Posting...' : 'Post Listing'}
            onPress={handleCreateListing}
            disabled={submitting}
            style={styles.submitButton}
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    color: colors.textPrimary,
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
  previewImage: {
    width: 220,
    height: 220,
    borderRadius: 14,
  },
  previewRow: {
    gap: 12,
    paddingBottom: 6,
    marginBottom: 16,
  },
  previewCard: {
    position: 'relative',
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
  placeholderImageText: {
    marginTop: 8,
    color: colors.textMuted,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 4,
    height: 54,
    borderRadius: 14,
  },
});
