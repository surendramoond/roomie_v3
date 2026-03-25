import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../features/auth/hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import colors from '../shared/constants/colors';

export default function AppNavigator() {
  const { user, authReady } = useAuth();

  if (!authReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.backgroundAlt,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return user ? <MainNavigator /> : <AuthNavigator />;
}
