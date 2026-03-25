import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../../shared/components/CustomButton';
import colors from '../../../shared/constants/colors';
import { useAuth } from '../hooks/useAuth';
import { sanitizePhone, validateSignupFields } from '../../../shared/utils/validation';
import { USER_ROLE_OPTIONS, USER_ROLES } from '../../../shared/constants/roles';

export default function SignupScreen({ navigation, route }) {
  const { signup } = useAuth();
  const [role, setRole] = useState(route?.params?.role || USER_ROLES.STUDENT); // pre-fill role from login
  const [displayName, setDisplayName] = useState('');
  const [identifier, setIdentifier] = useState(''); // email for students, phone for landlords
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const isStudent = role === USER_ROLES.STUDENT;

  // validate first so the mock auth layer only gets clean data
  const handleSignup = async () => {
    const validation = validateSignupFields({ displayName, role, identifier, password, confirmPassword });
    if (!validation.valid) {
      Alert.alert('Validation Error', validation.error);
      return;
    }

    setLoading(true);
    try {
      await signup(identifier, role, password, displayName.trim());
    } catch (error) {
      Alert.alert('Signup Failed', error.message || 'Unable to create your account right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundOrbLarge} />
      <View style={styles.backgroundOrbSmall} />

      <KeyboardAvoidingView
        style={styles.keyboardShell}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={18} color={colors.primaryDark} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.heroSection}>
            <Text style={styles.title}>Create your account</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.tabContainer}>
              {USER_ROLE_OPTIONS.map((r) => {
                const selected = role === r;
                const iconName = r === USER_ROLES.STUDENT ? 'school-outline' : 'business-outline';

                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.tab, selected && styles.activeTab]}
                    onPress={() => setRole(r)}
                    activeOpacity={0.9}
                  >
                    <Ionicons
                      name={iconName}
                      size={16}
                      color={selected ? colors.white : colors.primaryDark}
                    />
                    <Text style={selected ? styles.activeTabText : styles.tabText}>{r}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Full Name</Text>
            {/* name is used right away on profile, chat, and listing cards */}
            <View style={styles.inputShell}>
              <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Your full name"
                placeholderTextColor={colors.textMuted}
                value={displayName}
                onChangeText={setDisplayName}
              />
            </View>

            <Text style={styles.inputLabel}>{isStudent ? 'UNBC Email' : 'Phone Number'}</Text>
            {/* students use campus email, landlords use phone for now */}
            <View style={styles.inputShell}>
              <Ionicons
                name={isStudent ? 'mail-outline' : 'call-outline'}
                size={18}
                color={colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder={isStudent ? 'user@unbc.ca' : '2505551234'}
                placeholderTextColor={colors.textMuted}
                value={identifier}
                onChangeText={(value) =>
                  setIdentifier(role === USER_ROLES.LANDLORD ? sanitizePhone(value) : value)
                }
                keyboardType={role === USER_ROLES.LANDLORD ? 'phone-pad' : 'email-address'}
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputShell}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((current) => !current)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputShell}>
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Repeat your password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword((current) => !current)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <CustomButton
              title={loading ? 'Creating Account...' : 'Create Account'}
              onPress={handleSignup}
              disabled={loading}
              style={styles.primaryButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primarySurface,
  },
  keyboardShell: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingVertical: 18,
  },
  backgroundOrbLarge: {
    position: 'absolute',
    top: -50,
    left: -20,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#DCECCF',
  },
  backgroundOrbSmall: {
    position: 'absolute',
    bottom: 140,
    right: -25,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E9F4E1',
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.white,
    marginBottom: 18,
  },
  backButtonText: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  heroSection: {
    marginBottom: 22,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: -0.8,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#17351D',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF3EA',
    borderRadius: 16,
    padding: 6,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  activeTab: { backgroundColor: colors.primary },
  tabText: { color: colors.primaryDark, fontWeight: '700' },
  activeTabText: { color: colors.white, fontWeight: '700' },
  inputLabel: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 14,
  },
  primaryButton: {
    marginTop: 6,
    height: 54,
    borderRadius: 14,
  },
});
