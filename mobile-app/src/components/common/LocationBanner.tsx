import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface LocationBannerProps {
  location: string;
  onChangeLocation: () => void;
}

const LocationBanner: React.FC<LocationBannerProps> = ({ 
  location, 
  onChangeLocation 
}) => {
  return (
    <View style={styles.container}>
      <Icon name="location-on" size={20} color={colors.accent} />
      <Text style={styles.locationText}>{location}</Text>
      <TouchableOpacity onPress={onChangeLocation} style={styles.changeButton}>
        <Text style={styles.changeText}>Change</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  locationText: {
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  changeButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 6,
  },
  changeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default LocationBanner;

