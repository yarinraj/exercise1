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
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../config/Colors';

const HomeScreen = ({ user }) => {
    const navigation = useNavigation();

    const { isDark } = useTheme();
    const theme = isDark ? Colors.dark : Colors.light;

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
        const fetchRestaurants = async () => {
            try {
                setLoading(true);
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
        
        useEffect(() => {
            fetchRestaurants();
        }, []);
    
        

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

    useEffect(() => {
        // Add navigation listener to re-fetch data every time the screen comes into focus
        const unsubscribe = navigation.addListener('focus', () => {
            fetchRestaurants();
        });

        // Clean up the listener when component unmounts
        return unsubscribe;
    }, [navigation]);

    const getRestaurantRatingText = (restaurant) => {
        const rating = Number(restaurant.averageRating || 0);

        if (!rating) {
            return 'New';
        }

        return rating.toFixed(1);
    };

    const renderRatingBadge = (restaurant) => {
        const ratingCount = restaurant.ratings?.length || 0;

        return (
            <View
                style={[
                    styles.ratingBadge,
                    {
                        backgroundColor: isDark ? '#10243d' : '#e8f9fd',
                        borderColor: theme.border
                    }
                ]}
            >
                <Text style={styles.ratingBadgeText}>
                    ⭐ {getRestaurantRatingText(restaurant)}
                </Text>

                {ratingCount > 0 && (
                    <Text style={[styles.ratingCountText, { color: theme.textMuted }]}>
                        ({ratingCount})
                    </Text>
                )}
            </View>
        );
    };

    const renderRestaurantCard = ({ item }) => {
        const rawImage = item.imageUrl || item.image;
        const formattedUrl = formatImageUrl(rawImage);
        const restaurantId = item._id || item.id;

        const imageSource = formattedUrl
            ? { uri: formattedUrl }
            : require('../../assets/icon.png');

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                        borderWidth: isDark ? 1 : 0
                    }
                ]}
                onPress={() => navigation.navigate('RestaurantMenu', { id: restaurantId })}
                activeOpacity={0.85}
            >
                <Image
                    source={imageSource}
                    style={[
                        styles.cardImage,
                        !formattedUrl && {
                            backgroundColor: theme.inputBg,
                            padding: 15
                        }
                    ]}
                    resizeMode={formattedUrl ? 'cover' : 'contain'}
                />

                <View style={styles.cardInfo}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={[styles.restaurantName, { color: theme.text }]}>
                                {item.name}
                        </Text>
                    </View>

                    {item.address ? (
                        <Text style={styles.distanceText}>📍 {item.address}</Text>
                    ) : null}
                    <View style={styles.cardTopRow}>
                        <View style={styles.restaurantTextArea}>
                            <Text
                                style={[
                                    styles.restaurantDescription,
                                    { color: theme.textMuted }
                                ]}
                                numberOfLines={2}
                            >
                                {item.description}
                            </Text>
                        </View>

                        {renderRatingBadge(item)}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <View
                style={[
                    styles.header,
                    {
                        backgroundColor: theme.card,
                        shadowOpacity: isDark ? 0 : 0.05
                    }
                ]}
            >
                <Text style={styles.logo}>bites</Text>

                <Text style={[styles.welcomeText, { color: theme.textMuted }]}>
                    Welcome back, {user?.displayName || user?.username || 'Guest'}! 🍕
                </Text>

                <TouchableOpacity
                    style={[styles.searchButton, { backgroundColor: theme.inputBg }]}
                    onPress={() => setSearchVisible(true)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.searchEmoji}>🔍</Text>

                    <Text style={[styles.placeholder, { color: theme.textMuted }]}>
                        Search restaurants or dishes...
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.sectionHeaderRow}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Browsing Restaurants</Text>
                    <Text style={styles.countBadge}>{filteredRestaurants.length} Places</Text>
                </View>

                {/* Filter Buttons */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity 
                        style={[styles.filterBtn, activeFilter === 'all' && styles.activeFilterBtn]}
                        onPress={() => handleFilterClick('all')}
                    >
                        <Text style={[styles.filterBtnText, activeFilter === 'all' && styles.activeFilterBtnText]}>All Places</Text>
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
                        <Text style={styles.distanceSelectorText}>Showing within: </Text>
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
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Browsing Restaurants
                </Text>

                {/* Feed */}
                {loading ? (
                    <ActivityIndicator size="large" color="#00c2e8" style={styles.loader} />
                ) : error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : filteredRestaurants.length > 0 ? (
                    <FlatList
                        data={filteredRestaurants}
                        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
                        renderItem={renderRestaurantCard}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No restaurants match your filters. 🍽️</Text>
                    </View>
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
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 10 },
    sectionTitle: { fontSize: 22, fontWeight: '900', color: '#202125' },
    countBadge: { backgroundColor: '#e9ecef', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: 'bold', color: '#495057' },
    filterContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, marginBottom: 15,},
    filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#dee2e6', backgroundColor: '#fff',marginRight: 8, marginBottom: 8 },
    activeFilterBtn: { backgroundColor: '#00c2e8', borderColor: '#00c2e8' },
    filterBtnText: { color: '#495057', fontWeight: '600', fontSize: 14 },
    activeFilterBtnText: { color: '#fff' },
    filterScroll: { paddingHorizontal: 20, alignItems: 'center' },
    filterBtnText: { color: '#495057', fontWeight: '600', fontSize: 14 },
    activeFilterBtnText: { color: '#fff' },
    distanceSelectorContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 15 },
    distanceSelectorText: { fontSize: 14, color: '#7b8490', fontWeight: '600', marginRight: 10 },
    distanceChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, backgroundColor: '#e9ecef', marginRight: 8 },
    activeDistanceChip: { backgroundColor: '#202125' },
    distanceChipText: { fontSize: 12, color: '#495057', fontWeight: 'bold' },
    activeDistanceChipText: { color: '#fff' },
    loader: { flex: 1, justifyContent: 'center' },
    errorText: { color: '#ff4a4a', textAlign: 'center', marginTop: 20, fontSize: 16 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyText: { color: '#7b8490', fontSize: 16, fontWeight: '600', textAlign: 'center' },
    listContainer: { paddingHorizontal: 24, paddingBottom: 30 },
    card: { backgroundColor: '#ffffff', borderRadius: 20, marginBottom: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
    cardImage: { width: '100%', height: 160, backgroundColor: '#eaeaea' },
    cardInfo: { padding: 18 },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
    restaurantName: { fontSize: 19, fontWeight: '800', color: '#202125', flex: 1 },
    ratingText: { fontSize: 12, fontWeight: 'bold', color: '#856404' },
    restaurantDescription: { fontSize: 14, color: '#7b8490', lineHeight: 20 },
    distanceText: { fontSize: 13, color: '#00c2e8', fontWeight: 'bold', marginTop: 8 },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12
    },
    restaurantTextArea: {
        flex: 1
    },
    restaurantDescription: {
        fontSize: 14,
        color: '#7b8490',
        lineHeight: 20
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        minWidth: 76,
        justifyContent: 'center'
    },
    ratingBadgeText: {
        color: '#00a6c8',
        fontSize: 13,
        fontWeight: '900'
    },
    ratingCountText: {
        fontSize: 11,
        marginLeft: 4,
        fontWeight: '700'
    }
});

export default HomeScreen;