import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface HeaderProps {
  title?: string;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title = 'Classifieds',
  onMenuPress,
  onNotificationPress,
  rightIcon,
  onRightIconPress,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {onMenuPress && (
          <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
            <Icon name="menu" size={28} color={colors.white} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.rightSection}>
        {rightIcon && onRightIconPress && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.iconButton}>
            <Icon name={rightIcon} size={28} color={colors.white} />
          </TouchableOpacity>
        )}
        {onNotificationPress && (
          <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
            <Icon name="notifications" size={28} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingTop: Platform.OS === 'android' ? spacing.md : spacing.lg,
    height: Platform.OS === 'android' ? 56 : 64,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: spacing.xs,
    marginHorizontal: spacing.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.sm,
  },
});

export default Header;

