import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const toastConfig = {
  success: ({ text1 }: any) => (
    <View style={styles.success}>
      <Icon name="check-circle" size={24} color={colors.success} />
      <Text style={styles.text}>{text1}</Text>
    </View>
  ),
  error: ({ text1 }: any) => (
    <View style={styles.error}>
      <Icon name="error" size={24} color={colors.error} />
      <Text style={styles.text}>{text1}</Text>
    </View>
  ),
  info: ({ text1 }: any) => (
    <View style={styles.info}>
      <Icon name="info" size={24} color={colors.info} />
      <Text style={styles.text}>{text1}</Text>
    </View>
  ),
};

const styles = StyleSheet.create({
  success: {
    height: 60,
    width: '90%',
    backgroundColor: colors.white,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  error: {
    height: 60,
    width: '90%',
    backgroundColor: colors.white,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  info: {
    height: 60,
    width: '90%',
    backgroundColor: colors.white,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
});

