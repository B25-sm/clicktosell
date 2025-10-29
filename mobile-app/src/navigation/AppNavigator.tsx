import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';

// Main Screens
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/search/SearchScreen';
import ListingDetailsScreen from '../screens/listings/ListingDetailsScreen';
import PostAdScreen from '../screens/listings/PostAdScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import FavoritesScreen from '../screens/favorites/FavoritesScreen';
import MyListingsScreen from '../screens/listings/MyListingsScreen';
import TransactionsScreen from '../screens/transactions/TransactionsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

// Drawer Component
import DrawerContent from '../components/navigation/DrawerContent';

// Navigation Types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OTPVerification: { phone: string; type: 'register' | 'forgot' };
};

export type MainStackParamList = {
  HomeTabs: undefined;
  ListingDetails: { listingId: string };
  PostAd: undefined;
  Chat: { chatId: string; userName: string };
  Search: { query?: string; category?: string };
  Profile: { userId?: string };
  EditProfile: undefined;
  MyListings: undefined;
  Transactions: undefined;
  Settings: undefined;
  Notifications: undefined;
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  PostAd: undefined;
  Chat: undefined;
  Profile: undefined;
};

const AuthStack = createStackNavigator<AuthStackParamList>();
const MainStack = createStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const Drawer = createDrawerNavigator();

// Auth Navigator
const AuthNavigator: React.FC = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: colors.white,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <AuthStack.Screen 
      name="Login" 
      component={LoginScreen}
      options={{ headerShown: false }}
    />
    <AuthStack.Screen 
      name="Register" 
      component={RegisterScreen}
      options={{ title: 'Create Account' }}
    />
    <AuthStack.Screen 
      name="ForgotPassword" 
      component={ForgotPasswordScreen}
      options={{ title: 'Reset Password' }}
    />
    <AuthStack.Screen 
      name="OTPVerification" 
      component={OTPVerificationScreen}
      options={{ title: 'Verify Phone' }}
    />
  </AuthStack.Navigator>
);

// Tab Navigator
const TabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.gray,
      tabBarStyle: {
        backgroundColor: colors.white,
        borderTopColor: colors.lightGray,
        paddingBottom: 5,
        height: 60,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
      },
      headerShown: false,
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="home" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Search"
      component={SearchScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="search" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="PostAd"
      component={PostAdScreen}
      options={{
        tabBarLabel: 'Sell',
        tabBarIcon: ({ color, size }) => (
          <Icon name="add-circle" size={size + 4} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Chat"
      component={ChatListScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="chat" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="person" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

// Main Navigator
const MainNavigator: React.FC = () => (
  <MainStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: colors.white,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <MainStack.Screen
      name="HomeTabs"
      component={TabNavigator}
      options={{ headerShown: false }}
    />
    <MainStack.Screen
      name="ListingDetails"
      component={ListingDetailsScreen}
      options={{ title: 'Listing Details' }}
    />
    <MainStack.Screen
      name="Chat"
      component={ChatScreen}
      options={({ route }) => ({ 
        title: route.params?.userName || 'Chat' 
      })}
    />
    <MainStack.Screen
      name="Search"
      component={SearchScreen}
      options={{ title: 'Search' }}
    />
    <MainStack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
    <MainStack.Screen
      name="MyListings"
      component={MyListingsScreen}
      options={{ title: 'My Listings' }}
    />
    <MainStack.Screen
      name="Transactions"
      component={TransactionsScreen}
      options={{ title: 'Transactions' }}
    />
    <MainStack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ title: 'Settings' }}
    />
  </MainStack.Navigator>
);

// Drawer Navigator (for additional navigation)
const DrawerNavigator: React.FC = () => (
  <Drawer.Navigator
    drawerContent={(props) => <DrawerContent {...props} />}
    screenOptions={{
      headerShown: false,
      drawerStyle: {
        backgroundColor: colors.white,
        width: 280,
      },
      drawerActiveTintColor: colors.primary,
      drawerInactiveTintColor: colors.gray,
    }}
  >
    <Drawer.Screen
      name="MainApp"
      component={MainNavigator}
      options={{
        drawerIcon: ({ color }) => (
          <Icon name="home" size={24} color={color} />
        ),
        drawerLabel: 'Home',
      }}
    />
    <Drawer.Screen
      name="Favorites"
      component={FavoritesScreen}
      options={{
        drawerIcon: ({ color }) => (
          <Icon name="favorite" size={24} color={color} />
        ),
        drawerLabel: 'Favorites',
      }}
    />
    <Drawer.Screen
      name="MyListings"
      component={MyListingsScreen}
      options={{
        drawerIcon: ({ color }) => (
          <Icon name="list" size={24} color={color} />
        ),
        drawerLabel: 'My Listings',
      }}
    />
    <Drawer.Screen
      name="Transactions"
      component={TransactionsScreen}
      options={{
        drawerIcon: ({ color }) => (
          <Icon name="account-balance-wallet" size={24} color={color} />
        ),
        drawerLabel: 'Transactions',
      }}
    />
    <Drawer.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        drawerIcon: ({ color }) => (
          <Icon name="settings" size={24} color={color} />
        ),
        drawerLabel: 'Settings',
      }}
    />
  </Drawer.Navigator>
);

// App Navigator
const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading screen
  }

  return isAuthenticated ? <DrawerNavigator /> : <AuthNavigator />;
};

export default AppNavigator;



