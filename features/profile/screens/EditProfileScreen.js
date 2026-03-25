import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import CustomButton from '../../../shared/components/CustomButton';
import colors from '../../../shared/constants/colors';
import { useAuth } from '../../auth/hooks/useAuth';

export default function EditProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [location, setLocation] = useState(user?.location || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileImageUri, setProfileImageUri] = useState(user?.profileImageUri || '');
  const [saving, setSaving] = useState(false);

  const initials = (displayName || 'RU')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need permission to access your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const mimeType = asset.mimeType || 'image/jpeg';
      const nextImage = asset.base64 ? `data:${mimeType};base64,${asset.base64}` : asset.uri;
      setProfileImageUri(nextImage);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Validation Error', 'Name is required.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        location: location.trim(),
        bio: bio.trim(),
        profileImageUri,
      });

      Alert.alert('Profile Updated', 'Your profile has been updated.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Update Failed', error.message || 'Unable to save your profile right now.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardShell}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 88 }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="always"
          automaticallyAdjustKeyboardInsets
        >
          {/* extra bottom padding keeps the save button reachable above the keyboard */}
          <Text style={styles.eyebrow}>Profile</Text>
          <Text style={styles.title}>Edit your profile</Text>
          <Text style={styles.subtitle}>Update your photo, name, bio, and location.</Text>

          <View style={styles.photoCard}>
            <View style={styles.avatarShell}>
              {profileImageUri ? (
                <Image source={{ uri: profileImageUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>{initials}</Text>
                </View>
              )}
            </View>
            <View style={styles.photoCopy}>
              <Text style={styles.photoTitle}>Profile photo</Text>
            </View>
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.photoActionButton} onPress={handlePickImage} activeOpacity={0.85}>
                <Ionicons name="camera-outline" size={16} color={colors.primaryDark} />
                <Text style={styles.photoActionText}>{profileImageUri ? 'Change' : 'Add'}</Text>
              </TouchableOpacity>
              {!!profileImageUri && (
                <TouchableOpacity
                  style={[styles.photoActionButton, styles.removePhotoButton]}
                  onPress={() => setProfileImageUri('')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} />

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Prince George, BC"
          />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={bio}
            onChangeText={setBio}
            multiline
            textAlignVertical="top"
            placeholder="Tell others about what you're looking for."
          />

          <CustomButton title={saving ? 'Saving...' : 'Save Changes'} onPress={handleSave} disabled={saving} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  keyboardShell: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
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
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: 22,
  },
  photoCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  avatarShell: {
    alignSelf: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
  },
  photoCopy: {
    alignItems: 'center',
    marginBottom: 14,
  },
  photoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  photoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  photoActionText: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  removePhotoButton: {
    paddingHorizontal: 12,
    backgroundColor: '#FCE8E7',
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
    marginBottom: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  multilineInput: {
    minHeight: 120,
    paddingTop: 12,
  },
});
