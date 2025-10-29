import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const { width } = Dimensions.get('window');
const ITEMS_PER_ROW = 4;
const ITEM_WIDTH = (width - spacing.md * 2 - spacing.sm * (ITEMS_PER_ROW - 1)) / ITEMS_PER_ROW;

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface CategoryGridProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onCategorySelect }) => {
  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => onCategorySelect(item.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
        <Icon name={item.icon} size={28} color={item.color} />
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categories</Text>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        numColumns={ITEMS_PER_ROW}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  content: {
    paddingBottom: spacing.sm,
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: spacing.sm,
  },
  item: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default CategoryGrid;

