import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Dimensions, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const { width } = Dimensions.get('window');
const ITEMS_PER_ROW = 2;
const ITEM_WIDTH = (width - spacing.md * 2 - spacing.sm) / ITEMS_PER_ROW;

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  image?: string;
  timeAgo?: string;
  isNegotiable?: boolean;
}

interface RecentListingsProps {
  listings: Listing[];
  onListingPress: (listingId: string) => void;
  isLoading?: boolean;
}

const RecentListings: React.FC<RecentListingsProps> = ({ 
  listings, 
  onListingPress,
  isLoading = false 
}) => {
  const renderItem = ({ item, index }: { item: Listing; index: number }) => (
    <TouchableOpacity
      style={[
        styles.item,
        { marginRight: index % ITEMS_PER_ROW === 0 ? spacing.sm : 0 }
      ]}
      onPress={() => onListingPress(item.id)}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Icon name="image" size={32} color={colors.gray} />
          </View>
        )}
      </View>
      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.price}>₹{item.price.toLocaleString()}</Text>
        <View style={styles.footer}>
          <Icon name="location-on" size={12} color={colors.textLight} />
          <Text style={styles.location} numberOfLines={1}>
            {item.location}
          </Text>
          {item.timeAgo && <Text style={styles.time}>{item.timeAgo}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <Text style={styles.title}>Recent Listings</Text>
  );

  const ListFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={listings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={ITEMS_PER_ROW}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.content}
        scrollEnabled={false}
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
    paddingBottom: spacing.md,
  },
  item: {
    width: ITEM_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 140,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    padding: spacing.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    minHeight: 36,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 11,
    color: colors.textLight,
    marginLeft: spacing.xs,
    flex: 1,
  },
  time: {
    fontSize: 10,
    color: colors.textLight,
    marginLeft: 'auto',
  },
  loadingFooter: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});

export default RecentListings;

