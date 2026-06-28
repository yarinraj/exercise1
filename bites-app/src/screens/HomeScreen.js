import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Image,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location'; 
import { API_BASE_URL } from '../config/api';
import SearchOverlay from './SearchOverlay';

const HomeScreen = ({ user }) => {
    const navigation = useNavigation();
    
    // States for data
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchVisible, setSearchVisible] = useState(false);

    // States for filtering & location 
    const [activeFilter, setActiveFilter] = useState('all');
    const [userLocation, setUserLocation] = useState(null);
    const [locationDenied, setLocationDenied] = useState(false);
    const [maxDistance, setMaxDistance] = useState(10); 

    // Fetch user location
    useEffect(() => {
        const getUserLocation = async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setLocationDenied(true);
                    return;
                }

                let location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                
                setUserLocation({
                    lat: location.coords.latitude,
                    lng: location.coords.longitude
                });
                setLocationDenied(false);
            } catch (err) {
                console.log("Location fetching failed (likely emulator issue):", err.message);
                setLocationDenied(true);
            }
        };

        getUserLocation();
    }, []);

    // Fetch restaurants from backend
    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/restaurants`);
                const data = await response.json();

                if (response.ok) {
                    setRestaurants(data);
                } else {
                    setError('Failed to fetch restaurants.');
                }
            } catch (err) {
                console.error('Network error fetching restaurants:', err);
                setError('Could not connect to the server.');
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();

        // Refresh data when returning to screen
        const unsubscribe = navigation.addListener('focus', () => {
            fetchRestaurants();
        });

        return unsubscribe;
    }, [navigation]);

    const getRealDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const R = 6371; 
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return parseFloat((R * c).toFixed(1));
    };

    // Handle filter button press
    const handleFilterClick = (filterType) => {
        if (filterType === 'nearby' && locationDenied) {
            Alert.alert(
                "Location Required",
                "Location access is required to view nearby restaurants. Please enable permissions in your phone settings."
            );
            return;
        }
        setActiveFilter(filterType);
    };

    // Filter and Map the restaurants
    const filteredRestaurants = restaurants
        .map(restaurant => {
            const distance = userLocation && restaurant.lat && restaurant.lng
                ? getRealDistance(userLocation.lat, userLocation.lng, restaurant.lat, restaurant.lng)
                : null;

            return {
                ...restaurant,
                calculatedDistance: distance
            };
        })
        .filter(restaurant => {
            if (activeFilter === 'nearby') {
                if (locationDenied || restaurant.calculatedDistance === null) return false;
                if (restaurant.calculatedDistance > maxDistance) return false;
            }

            if (activeFilter === 'promoted' && restaurant.isPromoted !== true) {
                return false;
            }

            if (activeFilter === 'top') {
                const rating = restaurant.averageRating ?? restaurant.rating ?? 0;
                if (rating < 4.0) return false;
            }
            
            return true;
        });

    // Helper function to format image URLs properly for the mobile emulator
    const formatImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http://localhost') || url.startsWith('https://localhost')) {
            return url.replace('localhost', '10.0.2.2');
        }
        if (url.startsWith('http')) return url;
        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        return `${API_BASE_URL}${cleanPath}`;
    };

    // --- RENDER PROMOTED CARD ---
    const renderPromotedCard = ({ item }) => {
        const rawImage = item.imageUrl || item.image;
        const formattedUrl = formatImageUrl(rawImage);
        const imageSource = formattedUrl ? { uri: formattedUrl } : require('../../assets/icon.png');

        return (
            <TouchableOpacity
                style={styles.promotedCard}
                onPress={() => navigation.navigate('RestaurantMenu', { id: item._id || item.id })}
                activeOpacity={0.85}
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={imageSource}
                        style={[styles.promotedImage, !formattedUrl && { backgroundColor: '#f0f8fb' }]}
                        resizeMode={formattedUrl ? 'cover' : 'contain'}
                    />
                    <View style={styles.promotedTag}>
                        <Text style={styles.promotedTagText}>Promoted</Text>
                    </View>
                </View>

                <View style={styles.promotedInfo}>
                    <Text style={styles.promotedName} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <View style={styles.promotedBottomRow}>
                        <Text style={styles.promotedCuisine} numberOfLines={1}>
                            {item.cuisine || 'Restaurant'}
                        </Text>
                        {item.averageRating ? (
                            <View style={[styles.ratingBadge, { paddingHorizontal: 6, paddingVertical: 2 }]}>
                                <Text style={[styles.ratingText, { fontSize: 11 }]}>⭐ {item.averageRating}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // --- RENDER REGULAR CARD ---
    const renderRestaurantCard = ({ item }) => {
        const rawImage = item.imageUrl || item.image;
        const formattedUrl = formatImageUrl(rawImage);
        const imageSource = formattedUrl ? { uri: formattedUrl } : require('../../assets/icon.png');

        return (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('RestaurantMenu', { id: item._id || item.id })}>
                <Image
                    source={imageSource}
                    style={[styles.cardImage, !formattedUrl && { backgroundColor: '#f0f8fb', padding: 15 }]}
                    resizeMode={formattedUrl ? 'cover' : 'contain'}
                />
                <View style={styles.cardInfo}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.restaurantName}>{item.name}</Text>
                        {item.averageRating ? (
                            <View style={styles.ratingBadge}>
                                <Text style={styles.ratingText}>⭐ {item.averageRating}</Text>
                            </View>
                        ) : null}
                    </View>

                    {item.address ? (
                        <Text style={styles.distanceText}>📍 {item.address}</Text>
                    ) : null}
                </View>
            </TouchableOpacity>
        );
    };

    // Get strictly promoted restaurants for the top carousel
    const promotedRestaurants = restaurants.filter(r => r.isPromoted);

    // --- RENDER LIST HEADER (Carousel + Filters) ---
    const renderListHeader = () => (
        <View style={styles.headerContainer}>
            {/* Promoted Carousel */}
            {promotedRestaurants.length > 0 && (
                <View style={styles.promotedSection}>
                    <Text style={[styles.sectionTitle, { paddingHorizontal: 24, marginBottom: 15 }]}>
                        Featured & Promoted ✨
                    </Text>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={promotedRestaurants}
                        keyExtractor={(item) => `promoted-${item._id || item.id}`}
                        renderItem={renderPromotedCard}
                        contentContainerStyle={styles.promotedListContainer}
                    />
                </View>
            )}

            {/* Title and Count */}
            <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Browsing</Text>
                <Text style={styles.countBadge}>{filteredRestaurants.length} Places</Text>
            </View>

            {/* Filter Buttons */}
            <View style={styles.filterContainer}>
                <TouchableOpacity 
                    style={[styles.filterBtn, activeFilter === 'all' && styles.activeFilterBtn]}
                    onPress={() => handleFilterClick('all')}
                >
                    <Text style={[styles.filterBtnText, activeFilter === 'all' && styles.activeFilterBtnText]}>All</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.filterBtn, activeFilter === 'nearby' && styles.activeFilterBtn]}
                    onPress={() => handleFilterClick('nearby')}
                >
                    <Text style={[styles.filterBtnText, activeFilter === 'nearby' && styles.activeFilterBtnText]}>📍 Nearby</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.filterBtn, activeFilter === 'promoted' && styles.activeFilterBtn]}
                    onPress={() => handleFilterClick('promoted')}
                >
                    <Text style={[styles.filterBtnText, activeFilter === 'promoted' && styles.activeFilterBtnText]}>⭐ Promoted</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.filterBtn, activeFilter === 'top' && styles.activeFilterBtn]}
                    onPress={() => handleFilterClick('top')}
                >
                    <Text style={[styles.filterBtnText, activeFilter === 'top' && styles.activeFilterBtnText]}>🏆 Top Rated</Text>
                </TouchableOpacity>
            </View>

            {/* Distance Selector (Only shows when 'nearby' is active) */}
            {activeFilter === 'nearby' && !locationDenied && (
                <View style={styles.distanceSelectorContainer}>
                    <Text style={styles.distanceSelectorText}>Within: </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {[5, 10, 20].map(dist => (
                            <TouchableOpacity 
                                key={dist} 
                                style={[styles.distanceChip, maxDistance === dist && styles.activeDistanceChip]}
                                onPress={() => setMaxDistance(dist)}
                            >
                                <Text style={[styles.distanceChipText, maxDistance === dist && styles.activeDistanceChipText]}>
                                    {dist} km
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Top Header Section */}
            <View style={styles.header}>
                <Text style={styles.logo}>bites</Text>
                <Text style={styles.welcomeText}>
                    Welcome back, {user?.displayName || user?.username || 'Guest'}! 🍕
                </Text>
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => setSearchVisible(true)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.searchEmoji}>🔍</Text>
                    <Text style={styles.placeholder}>Search restaurants or dishes...</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Feed */}
                {loading ? (
                    <ActivityIndicator size="large" color="#00c2e8" style={styles.loader} />
                ) : error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : (
                    <FlatList
                        data={filteredRestaurants}
                        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
                        ListHeaderComponent={renderListHeader}
                        renderItem={renderRestaurantCard}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No restaurants match your filters. 🍽️</Text>
                            </View>
                        )}
                    />
                )}
            </View>
            
            <SearchOverlay
                visible={searchVisible}
                onClose={() => setSearchVisible(false)}
                user={user}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8f5ef' },
    header: { padding: 24, paddingTop: 8, paddingBottom: 16, backgroundColor: '#ffffff', borderBottomLeftRadius: 26, borderBottomRightRadius: 26, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 3, marginBottom: 12 },
    logo: { fontSize: 32, fontWeight: '900', color: '#00c2e8', fontStyle: 'italic', marginBottom: 5 },
    welcomeText: { fontSize: 16, color: '#7b8490', fontWeight: '600' },
    searchButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f3f5', marginTop: 12, paddingHorizontal: 16, height: 46, borderRadius: 24 },
    searchEmoji: { marginRight: 10, fontSize: 16 },
    placeholder: { color: '#7b8490', fontSize: 15, fontWeight: '500' },
    content: { flex: 1 },
    headerContainer: { paddingBottom: 5 },
    
    // Carousel Styles
    promotedSection: { marginBottom: 10 },
    promotedListContainer: { paddingLeft: 24, paddingRight: 8, paddingBottom: 15 },
    promotedCard: { width: 240, backgroundColor: '#ffffff', borderRadius: 20, marginRight: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
    imageContainer: { position: 'relative', width: '100%', height: 130 },
    promotedImage: { width: '100%', height: '100%', backgroundColor: '#eaeaea' },
    promotedTag: { position: 'absolute', top: 10, left: 10, backgroundColor: '#ff4a4a', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    promotedTagText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
    promotedInfo: { padding: 14 },
    promotedName: { fontSize: 16, fontWeight: '800', marginBottom: 4, color: '#202125' },
    promotedBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    promotedCuisine: { fontSize: 12, color: '#7b8490', flex: 1, marginRight: 10 },

    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 15 },
    sectionTitle: { fontSize: 22, fontWeight: '900', color: '#202125' },
    countBadge: { backgroundColor: '#e9ecef', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: 'bold', color: '#495057' },
    filterContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, marginBottom: 15 },
    filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#dee2e6', backgroundColor: '#fff', marginRight: 8, marginBottom: 8 },
    activeFilterBtn: { backgroundColor: '#00c2e8', borderColor: '#00c2e8' },
    filterBtnText: { color: '#495057', fontWeight: '600', fontSize: 13 },
    activeFilterBtnText: { color: '#fff' },
    distanceSelectorContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 20 },
    distanceSelectorText: { fontSize: 14, color: '#7b8490', fontWeight: '600', marginRight: 10 },
    distanceChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, backgroundColor: '#e9ecef', marginRight: 8 },
    activeDistanceChip: { backgroundColor: '#202125' },
    distanceChipText: { fontSize: 12, color: '#495057', fontWeight: 'bold' },
    activeDistanceChipText: { color: '#fff' },
    loader: { flex: 1, justifyContent: 'center' },
    errorText: { color: '#ff4a4a', textAlign: 'center', marginTop: 20, fontSize: 16 },
    emptyContainer: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#7b8490', fontSize: 16, fontWeight: '600', textAlign: 'center' },
    listContainer: { paddingBottom: 30 },
    
    // Regular Card Styles
    card: { backgroundColor: '#ffffff', borderRadius: 20, marginBottom: 20, marginHorizontal: 24, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
    cardImage: { width: '100%', height: 160, backgroundColor: '#eaeaea' },
    cardInfo: { padding: 18 },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
    restaurantName: { fontSize: 19, fontWeight: '800', color: '#202125', flex: 1 },
    ratingBadge: { backgroundColor: '#fff3cd', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
    ratingText: { fontSize: 12, fontWeight: 'bold', color: '#856404' },
    distanceText: { fontSize: 13, color: '#00c2e8', fontWeight: 'bold', marginTop: 4 }
});

export default HomeScreen;