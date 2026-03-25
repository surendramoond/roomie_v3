import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import colors from '../shared/constants/colors';
import { STACK_ROUTES, TAB_ROUTES } from '../shared/constants/navigation';
import { USER_ROLES } from '../shared/constants/roles';

import HomeScreen from '../features/listings/screens/HomeScreen';
import AddScreen from '../features/listings/screens/AddScreen';
import SavedScreen from '../features/listings/screens/SavedScreen';
import ListingComparisonScreen from '../features/listings/screens/ListingComparisonScreen';
import YourListingsScreen from '../features/listings/screens/YourListingsScreen';
import EditListingScreen from '../features/listings/screens/EditListingScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import DetailScreen from '../features/listings/screens/DetailScreen';
import ChatListScreen from '../features/chat/screens/ChatListScreen';
import ChatScreen from '../features/chat/screens/ChatScreen';
import EditProfileScreen from '../features/profile/screens/EditProfileScreen';
import AppSettingsScreen from '../features/profile/screens/AppSettingsScreen';
import PrivacyScreen from '../features/profile/screens/PrivacyScreen';
import { useAuth } from '../features/auth/hooks/useAuth';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const iconMap = {
  [TAB_ROUTES.HOME]: ['home', 'home-outline'],
  [TAB_ROUTES.ADD]: ['add-circle', 'add-circle-outline'],
  [TAB_ROUTES.CHAT]: ['chatbubble', 'chatbubble-outline'],
  [TAB_ROUTES.SAVED]: ['bookmark', 'bookmark-outline'],
  [TAB_ROUTES.PROFILE]: ['person', 'person-outline'],
};

function BottomTabs() {
  const { user } = useAuth();
  const isStudent = user?.role === USER_ROLES.STUDENT;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size, color }) => {
          const iconName = iconMap[route.name]?.[focused ? 0 : 1] || 'help-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        lazy: true,
        freezeOnBlur: true,
      })}
    >
      <Tab.Screen name={TAB_ROUTES.HOME} component={HomeScreen} />
      <Tab.Screen name={TAB_ROUTES.ADD} component={AddScreen} />
      <Tab.Screen name={TAB_ROUTES.CHAT} component={ChatListScreen} />
      {isStudent && <Tab.Screen name={TAB_ROUTES.SAVED} component={SavedScreen} />}
      <Tab.Screen name={TAB_ROUTES.PROFILE} component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={STACK_ROUTES.MAIN_TABS} component={BottomTabs} />
      {/* these screens open on top of the tabs so users keep the main flow underneath */}
      <Stack.Screen
        name={STACK_ROUTES.DETAILS}
        component={DetailScreen}
        options={{
          headerShown: true,
          title: 'Property Details',
          headerBackTitle: 'Home',
          headerTintColor: colors.primary,
        }}
      />
      <Stack.Screen
        name={STACK_ROUTES.LISTING_COMPARISON}
        component={ListingComparisonScreen}
        options={{
          headerShown: true,
          title: '',
          headerBackTitle: 'Saved',
          headerTintColor: colors.primary,
        }}
      />
      <Stack.Screen
        name={STACK_ROUTES.CHAT_ROOM}
        component={ChatScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params?.participantName || TAB_ROUTES.CHAT,
          headerTintColor: colors.primary,
        })}
      />
      <Stack.Screen
        name={STACK_ROUTES.YOUR_LISTINGS}
        component={YourListingsScreen}
        options={{ headerShown: true, title: 'Your Listings', headerTintColor: colors.primary }}
      />
      <Stack.Screen
        name={STACK_ROUTES.EDIT_LISTING}
        component={EditListingScreen}
        options={{ headerShown: true, title: 'Edit Listing', headerTintColor: colors.primary }}
      />
      <Stack.Screen
        name={STACK_ROUTES.EDIT_PROFILE}
        component={EditProfileScreen}
        options={{ headerShown: true, title: 'Edit Profile', headerTintColor: colors.primary }}
      />
      <Stack.Screen
        name={STACK_ROUTES.APP_SETTINGS}
        component={AppSettingsScreen}
        options={{ headerShown: true, title: 'App Settings', headerTintColor: colors.primary }}
      />
      <Stack.Screen
        name={STACK_ROUTES.PRIVACY}
        component={PrivacyScreen}
        options={{ headerShown: true, title: 'Privacy', headerTintColor: colors.primary }}
      />
    </Stack.Navigator>
  );
}
