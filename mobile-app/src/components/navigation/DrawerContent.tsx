import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useAuth } from '../../contexts/AuthContext';

const DrawerContent: React.FC<any> = (props) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { label: 'Home', icon: 'home', onPress: () => props.navigation.navigate('HomeTabs') },
    { label: 'My Listings', icon: 'list', onPress: () => props.navigation.navigate('MyListings') },
    { label: 'Favorites', icon: 'favorite', onPress: () => props.navigation.navigate('Favorites') },
    { label: 'Transactions', icon: 'account-balance-wallet', onPress: () => props.navigation.navigate('Transactions') },
    { label: 'Settings', icon: 'settings', onPress: () => props.navigation.navigate('Settings') },
  ];

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Icon name="person" size={40} color={colors.white} />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'guest@example.com'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Icon name={item.icon} size={24} color={colors.text} />
            <Text style={styles.menuText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Icon name="logout" size={24} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
  },
  menu: {
    flex: 1,
    paddingTop: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  menuText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.md,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    padding: spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  logoutText: {
    fontSize: 16,
    color: colors.error,
    marginLeft: spacing.md,
    fontWeight: '600',
  },
});

export default DrawerContent;

