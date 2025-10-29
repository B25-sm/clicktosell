import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.75;

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  image?: string;
  isNegotiable?: boolean;
  featured?: boolean;
}

interface FeaturedListingsProps {
  listings: Listing[];
  onListingPress: (listingId: string) => void;
}

const FeaturedListings: React.FC<FeaturedListingsProps> = ({ listings, onListingPress }) => {
  const renderItem = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => onListingPress(item.id)}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Icon name="image" size={48} color={colors.gray} />
          </View>
        )}
        {item.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
      </View>
      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{item.price.toLocaleString()}</Text>
          {item.isNegotiable && (
            <View style={styles.negotiableBadge}>
              <Text style={styles.negotiableText}>Negotiable</Text>
            </View>
          )}
        </View>
        <View style={styles.locationRow}>
          <Icon name="location-on" size={16} color={colors.textLight} />
          <Text style={styles.location}>{item.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Featured Listings</Text>
      <FlatList
        data={listings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        snapToInterval={ITEM_WIDTH + spacing.md}
        decelerationRate="fast"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  content: {
    paddingHorizontal: spacing.md,
  },
  item: {
    width: ITEM_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginRight: spacing.md,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
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
  featuredBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
  },
  details: {
    padding: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: spacing.sm,
  },
  negotiableBadge: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  negotiableText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: spacing.xs,
  },
});

export default FeaturedListings;

