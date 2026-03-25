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
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../../shared/components/CustomButton';
import colors from '../../../shared/constants/colors';
import { useAuth } from '../hooks/useAuth';
import { sanitizePhone, validateIdentifierForRole } from '../../../shared/utils/validation';
import { AUTH_ROUTES } from '../../../shared/constants/navigation';
import { USER_ROLE_OPTIONS, USER_ROLES } from '../../../shared/constants/roles';

export default function LoginScreen({ navigation }) {
  const { height } = useWindowDimensions();
  const { login } = useAuth();
  const [role, setRole] = useState(USER_ROLES.STUDENT);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // shorter phones get a tighter version of this layout so the footer action still fits
  const isCompactScreen = height < 850;

  const handleLogin = async () => {
    // validation happens here so the service can stay pretty reusable
    const validation = validateIdentifierForRole({ role, identifier });
    if (!validation.valid) {
      Alert.alert('Validation Error', validation.error);
      return;
    }

    if (!password.trim()) {
      Alert.alert('Validation Error', 'Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await login(identifier, role, password);
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Unable to log in right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    // carry the picked role into signup so the next screen feels faster
    navigation.navigate(AUTH_ROUTES.SIGNUP, { role });
  };

  const isStudent = role === USER_ROLES.STUDENT;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundOrbLarge} />
      <View style={styles.backgroundOrbSmall} />

      <KeyboardAvoidingView
        style={styles.keyboardShell}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, isCompactScreen && styles.scrollContentCompact]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.heroSection, isCompactScreen && styles.heroSectionCompact]}>
            <Text style={[styles.title, isCompactScreen && styles.titleCompact]}>Roomie</Text>
            <Text style={[styles.headline, isCompactScreen && styles.headlineCompact]}>
              Find your next room with less chaos.
            </Text>
          </View>

          <View style={[styles.card, isCompactScreen && styles.cardCompact]}>
            <View style={[styles.tabContainer, isCompactScreen && styles.tabContainerCompact]}>
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

            {/* this field flips between email and phone based on the selected role */}
            <View style={[styles.inputBlock, isCompactScreen && styles.inputBlockCompact]}>
              <Text style={styles.inputLabel}>{isStudent ? 'UNBC Email' : 'Phone Number'}</Text>
              <View style={[styles.inputShell, isCompactScreen && styles.inputShellCompact]}>
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
            </View>

            <View style={[styles.inputBlock, isCompactScreen && styles.inputBlockCompact]}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputShell, isCompactScreen && styles.inputShellCompact]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
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
            </View>

            <CustomButton
              title={loading ? 'Logging in...' : 'Login'}
              onPress={handleLogin}
              disabled={loading}
              style={[styles.loginButton, isCompactScreen && styles.loginButtonCompact]}
            />

            <View style={[styles.dividerContainer, isCompactScreen && styles.dividerContainerCompact]}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.secondaryAction, isCompactScreen && styles.secondaryActionCompact]}
              onPress={handleSignup}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryActionText}>Create a new account</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7F1',
  },
  keyboardShell: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingVertical: 18,
    justifyContent: 'center',
  },
  scrollContentCompact: {
    paddingVertical: 12,
  },
  backgroundOrbLarge: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#D6E8C8',
  },
  backgroundOrbSmall: {
    position: 'absolute',
    bottom: 120,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E4F0DB',
  },
  heroSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  heroSectionCompact: {
    marginBottom: 16,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: -1,
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: 34,
  },
  headline: {
    marginTop: 8,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headlineCompact: {
    marginTop: 6,
    fontSize: 20,
    lineHeight: 26,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#17351D',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  cardCompact: {
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF3EA',
    borderRadius: 16,
    padding: 6,
    marginBottom: 18,
  },
  tabContainerCompact: {
    marginBottom: 14,
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
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  activeTabText: {
    color: colors.white,
    fontWeight: '700',
  },
  inputBlock: {
    marginBottom: 8,
  },
  inputBlockCompact: {
    marginBottom: 4,
  },
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
  },
  inputShellCompact: {
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 14,
  },
  loginButton: {
    height: 54,
    borderRadius: 14,
  },
  loginButtonCompact: {
    height: 50,
  },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  dividerContainerCompact: {
    marginVertical: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: 10, color: colors.textMuted, fontSize: 14 },
  secondaryAction: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingTop: 6,
  },
  secondaryActionCompact: {
    paddingTop: 2,
  },
  secondaryActionText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
