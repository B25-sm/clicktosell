import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// import Header from '../../components/layout/Header';
// import SearchBar from '../../components/search/SearchBar';
// import CategoryGrid from '../../components/categories/CategoryGrid';
// import FeaturedListings from '../../components/listings/FeaturedListings';
// import RecentListings from '../../components/listings/RecentListings';
// import LocationBanner from '../../components/common/LocationBanner';
import LoadingScreen from '../../components/ui/LoadingScreen';
import ErrorMessage from '../../components/ui/ErrorMessage';

import { useHomeData } from '../../hooks/useHomeData';
import { useLocation } from '../../hooks/useLocation';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const {
    categories,
    featuredListings,
    recentListings,
    isLoading,
    error,
    refreshData,
  } = useHomeData();

  const { currentLocation, requestLocation } = useLocation();
  const [refreshing, setRefreshing] = useState(false);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  // Request location permission on first load
  useEffect(() => {
    requestLocation();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const handleSearch = (query: string) => {
    // Navigate to search screen with query
    // This would be implemented with navigation
    console.log('Search query:', query);
  };

  const handleCategorySelect = (categoryId: string) => {
    // Navigate to category listings
    console.log('Selected category:', categoryId);
  };

  const handleListingPress = (listingId: string) => {
    // Navigate to listing details
    console.log('Selected listing:', listingId);
  };

  if (isLoading && !featuredListings.length && !recentListings.length) {
    return <LoadingScreen />;
  }

  if (error && !featuredListings.length && !recentListings.length) {
    return (
      <View style={styles.container}>
        <Header />
        <ErrorMessage
          message={error}
          onRetry={refreshData}
          style={styles.errorContainer}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={colors.primary}
        barStyle="light-content"
        translucent={false}
      />
      
      {/* <Header /> */}
      
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* <LocationBanner /> */}
        {/* <SearchBar /> */}
        {/* <CategoryGrid /> */}
        {/* <FeaturedListings /> */}
        {/* <RecentListings /> */}
        
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
            Welcome to Classifieds App! 🎉
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>
            Home Screen with beautiful UI coming soon...
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>
            Brand Colors: Midnight Blue #0A0F2C, Warm Gold #FFD100
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  section: {
    marginBottom: spacing.lg,
  },
  lastSection: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.xl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
});

export default HomeScreen;



