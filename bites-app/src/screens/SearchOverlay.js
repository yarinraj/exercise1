import React, { useState, useEffect } from 'react';
import {
    StyleSheet, Text, View, TextInput, TouchableOpacity,
    ScrollView, Image, ActivityIndicator, Modal, SafeAreaView, useColorScheme
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

// Added 'user' prop to handle user-specific history
export default function SearchOverlay({ visible, onClose, user }) {
    const navigation = useNavigation();
    const systemColorScheme = useColorScheme();
    const isDark = systemColorScheme === 'dark';

    const [searchQuery, setSearchQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState([]);
    const [liveResults, setLiveResults] = useState({ restaurants: [], items: [] });
    const [isLoading, setIsLoading] = useState(false);

    // Load recent searches from AsyncStorage based on the specific user
    useEffect(() => {
        if (visible) {
            const loadRecentSearches = async () => {
                // If it's a guest user, keep recent searches empty
                if (!user || !user.username) {
                    setRecentSearches([]);
                    return;
                }

                try {
                    // Create a unique storage key for the specific user
                    const userStorageKey = `recent_searches_${user.username}`;
                    const savedSearches = await AsyncStorage.getItem(userStorageKey);
                    
                    if (savedSearches) {
                        setRecentSearches(JSON.parse(savedSearches));
                    } else {
                        setRecentSearches([]);
                    }
                } catch (error) {
                    console.error("Error loading recent searches:", error);
                }
            };
            loadRecentSearches();
        } else {
            // Clear input and results when overlay closes
            setSearchQuery('');
            setLiveResults({ restaurants: [], items: [] });
        }
    }, [visible, user]);

    // Live Search with Debounce (300ms)
    useEffect(() => {
        if (!searchQuery || searchQuery.trim() === '') {
            setLiveResults({ restaurants: [], items: [] });
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/restaurants/search?q=${encodeURIComponent(searchQuery)}`);
                if (response.ok) {
                    const data = await response.json();
                    const restaurants = data.restaurants || [];
                    const rawItems = data.relatedProducts || [];

                    const mappedItems = rawItems.map(product => {
                        const matchedRestaurant = restaurants.find(r =>
                            r._id === product.restaurantId ||
                            r._id === product.restaurant_id ||
                            r.name === product.restaurantName 
                        );

                        // Extract the final ID
                        const finalId = matchedRestaurant
                            ? matchedRestaurant._id
                            : (product.restaurantId || null);

                        return {
                            ...product,
                            restaurantId: finalId,
                            restaurantName: matchedRestaurant ? matchedRestaurant.name : (product.restaurantName || 'Restaurant'),
                            restaurantAddress: matchedRestaurant ? matchedRestaurant.address : (product.restaurantAddress || 'Address available')
                        };
                    });

                    setLiveResults({
                        restaurants: restaurants,
                        items: mappedItems
                    });
                }
            } catch (error) {
                console.error("Error fetching live search results:", error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    // Save search query specific to the logged-in user
    const saveSearch = async (queryStr) => {
        if (!queryStr.trim()) return;
        
        // Update local state for immediate UI feedback (even for guests during the session)
        const updated = [queryStr, ...recentSearches.filter(s => s !== queryStr)].slice(0, 5);
        setRecentSearches(updated);

        // Only persist to AsyncStorage if it's a logged-in user
        if (user && user.username) {
            try {
                const userStorageKey = `recent_searches_${user.username}`;
                await AsyncStorage.setItem(userStorageKey, JSON.stringify(updated));
            } catch (error) {
                console.error("Error saving search:", error);
            }
        }
    };

    const handleItemClick = (item, name) => {
        const restaurantId = typeof item === 'string' ? item : item?.restaurantId;

        if (!restaurantId) {
            alert(`Missing restaurant link for "${name}".`);
            return;
        }

        saveSearch(name);
        onClose();

        navigation.navigate('RestaurantMenu', { id: restaurantId });
    };

    const handleEnterSearch = () => {
        const queryStr = searchQuery.trim();
        if (!queryStr) return;

        saveSearch(queryStr);
        if (liveResults.restaurants.length === 1) {
            const restaurant = liveResults.restaurants[0];
            handleItemClick(restaurant._id || restaurant.id, restaurant.name);
        }
    };

    const isQueryEmpty = !searchQuery || searchQuery.trim() === '';

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>

                {/* Search Input Header */}
                <View style={styles.headerRow}>
                    <View style={[styles.searchBarWrapper, isDark && styles.darkInputWrapper]}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={[styles.input, isDark && styles.darkText]}
                            placeholder="Search restaurants or dishes..."
                            placeholderTextColor={isDark ? '#aaa' : '#6c757d'}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleEnterSearch}
                            returnKeyType="search"
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Text style={styles.clearIcon}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={[styles.closeButtonText, { color: isDark ? '#00c2e8' : '#007bff' }]}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollBody}>
                    {isLoading && (
                        <ActivityIndicator size="small" color="#00c2e8" style={{ marginTop: 20 }} />
                    )}

                    {/* Recent Searches */}
                    {isQueryEmpty && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Recent Searches</Text>
                            {recentSearches.length > 0 ? (
                                recentSearches.map((search, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.recentItem}
                                        onPress={() => setSearchQuery(search)}
                                    >
                                        <Text style={styles.clockIcon}>🕒</Text>
                                        <Text style={[styles.recentText, isDark && styles.darkText]}>{search}</Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={styles.emptyText}>No recent searches yet.</Text>
                            )}
                        </View>
                    )}

                    {/* Search Results */}
                    {!isQueryEmpty && !isLoading && (
                        <View>
                            {liveResults.restaurants.length === 0 && liveResults.items.length === 0 && (
                                <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
                            )}

                            {/* Places / Restaurants Section */}
                            {liveResults.restaurants.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Places</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                                        {liveResults.restaurants.map((restaurant) => (
                                            <TouchableOpacity
                                                key={restaurant._id}
                                                style={[styles.venueCard, isDark && styles.darkCard]}
                                                onPress={() => handleItemClick(restaurant._id, restaurant.name)}
                                            >
                                                <Image
                                                    source={restaurant.image ? { uri: restaurant.image } : require('../../assets/icon.png')}
                                                    style={styles.venueImage}
                                                />
                                                <Text style={[styles.venueName, isDark && styles.darkText]} numberOfLines={1}>{restaurant.name}</Text>
                                                <Text style={styles.venueSub} numberOfLines={1}>
                                                    {Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : restaurant.cuisine}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            {/* Related Items Section */}
                            {liveResults.items.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Related Items</Text>
                                    {liveResults.items.map((product) => (
                                        <TouchableOpacity
                                            key={product._id}
                                            style={[styles.productCard, isDark && styles.darkCard]}
                                            onPress={() => handleItemClick(product, product.name)}
                                        >
                                            <Image
                                                source={product.image ? { uri: product.image } : require('../../assets/icon.png')}
                                                style={styles.productImage}
                                            />
                                            <View style={styles.productInfo}>
                                                <Text style={[styles.productName, isDark && styles.darkText]}>{product.name}</Text>
                                                <Text style={styles.productMeta} numberOfLines={1}>
                                                    {product.restaurantName} • {product.restaurantAddress}
                                                </Text>
                                                <Text style={styles.productPrice}>₪{product.price}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    darkContainer: { backgroundColor: '#121212' },
    headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
    searchBarWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f3f5', borderRadius: 24, paddingHorizontal: 15, height: 45 },
    darkInputWrapper: { backgroundColor: '#1a1d24' },
    searchIcon: { marginRight: 8, fontSize: 16 },
    clearIcon: { marginLeft: 8, fontSize: 16, color: '#888' },
    input: { flex: 1, fontSize: 16, color: '#000', paddingVertical: 0 },
    darkText: { color: '#fff' },
    closeButton: { marginLeft: 15 },
    closeButtonText: { fontSize: 16, fontWeight: '600' },
    scrollBody: { paddingBottom: 30 },
    section: { marginTop: 20, paddingHorizontal: 15 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    recentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f1f3f5' },
    clockIcon: { marginRight: 12, fontSize: 16, color: '#888' },
    recentText: { fontSize: 16 },
    emptyText: { textAlign: 'center', color: '#6c757d', marginTop: 30, fontSize: 15, paddingHorizontal: 30 },
    horizontalScroll: { flexDirection: 'row', paddingBottom: 10 },
    venueCard: { width: 140, marginRight: 15, backgroundColor: '#fff', borderRadius: 12, padding: 8, borderVerticalWidth: 1, borderWidth: 1, borderColor: '#f1f3f5' },
    darkCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)' },
    venueImage: { width: '100%', height: 95, borderRadius: 8, backgroundColor: '#eee' },
    venueName: { fontSize: 14, fontWeight: 'bold', marginTop: 8 },
    venueSub: { fontSize: 12, color: '#6c757d', marginTop: 2 },
    productCard: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#f1f3f5', alignItems: 'center' },
    productImage: { width: 70, height: 70, borderRadius: 8, backgroundColor: '#eee', marginRight: 15 },
    productInfo: { flex: 1 },
    productName: { fontSize: 16, fontWeight: 'bold' },
    productMeta: { fontSize: 13, color: '#6c757d', marginVertical: 3 },
    productPrice: { fontSize: 15, fontWeight: 'bold', color: '#00c2e8' }
});