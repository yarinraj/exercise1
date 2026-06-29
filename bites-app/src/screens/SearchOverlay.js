import React, { useState, useEffect } from 'react';
import {
    StyleSheet, Text, View, TextInput, TouchableOpacity,
    ScrollView, Image, ActivityIndicator, Modal, SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

// 1. Import our dynamic theme tools
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../config/Colors'; 

export default function SearchOverlay({ visible, onClose, user }) {
    const navigation = useNavigation();
    
    // 2. Extract active theme
    const { isDark } = useTheme();
    const theme = isDark ? Colors.dark : Colors.light;

    const [searchQuery, setSearchQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState([]);
    const [liveResults, setLiveResults] = useState({ restaurants: [], items: [] });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            const loadRecentSearches = async () => {
                if (!user || !user.username) {
                    setRecentSearches([]);
                    return;
                }
                try {
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
            setSearchQuery('');
            setLiveResults({ restaurants: [], items: [] });
        }
    }, [visible, user]);

    // Live Search with Debounce
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

                        const finalId = matchedRestaurant ? matchedRestaurant._id : (product.restaurantId || null);

                        return {
                            ...product,
                            restaurantId: finalId,
                            restaurantName: matchedRestaurant ? matchedRestaurant.name : (product.restaurantName || 'Restaurant'),
                            restaurantAddress: matchedRestaurant ? matchedRestaurant.address : (product.restaurantAddress || 'Address available')
                        };
                    });

                    setLiveResults({ restaurants: restaurants, items: mappedItems });
                }
            } catch (error) {
                console.error("Error fetching live search results:", error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    const saveSearch = async (queryStr) => {
        if (!queryStr.trim()) return;
        const updated = [queryStr, ...recentSearches.filter(s => s !== queryStr)].slice(0, 5);
        setRecentSearches(updated);

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
            {/* 3. Apply Dynamic Background to Main Container */}
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>

                {/* Search Input Header */}
                <View style={[styles.headerRow, { borderBottomColor: theme.border }]}>
                    <View style={[styles.searchBarWrapper, { backgroundColor: theme.inputBg }]}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            placeholder="Search restaurants or dishes..."
                            placeholderTextColor={theme.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleEnterSearch}
                            returnKeyType="search"
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Text style={[styles.clearIcon, { color: theme.textMuted }]}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={[styles.closeButtonText, { color: theme.primary }]}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollBody}>
                    {isLoading && (
                        <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 20 }} />
                    )}

                    {/* Recent Searches */}
                    {isQueryEmpty && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Searches</Text>
                            {recentSearches.length > 0 ? (
                                recentSearches.map((search, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.recentItem, { borderBottomColor: theme.border }]}
                                        onPress={() => setSearchQuery(search)}
                                    >
                                        <Text style={[styles.clockIcon, { color: theme.textMuted }]}>🕒</Text>
                                        <Text style={[styles.recentText, { color: theme.text }]}>{search}</Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={[styles.emptyText, { color: theme.textMuted }]}>No recent searches yet.</Text>
                            )}
                        </View>
                    )}

                    {/* Search Results */}
                    {!isQueryEmpty && !isLoading && (
                        <View>
                            {liveResults.restaurants.length === 0 && liveResults.items.length === 0 && (
                                <Text style={[styles.emptyText, { color: theme.textMuted }]}>No results found for "{searchQuery}"</Text>
                            )}

                            {/* Places / Restaurants Section */}
                            {liveResults.restaurants.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Places</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                                        {liveResults.restaurants.map((restaurant) => (
                                            <TouchableOpacity
                                                key={restaurant._id}
                                                style={[
                                                    styles.venueCard, 
                                                    { backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDark ? 1 : 0 }
                                                ]}
                                                onPress={() => handleItemClick(restaurant._id, restaurant.name)}
                                            >
                                                <Image
                                                    source={restaurant.image ? { uri: restaurant.image } : require('../../assets/icon.png')}
                                                    style={[styles.venueImage, { backgroundColor: theme.inputBg }]}
                                                />
                                                <Text style={[styles.venueName, { color: theme.text }]} numberOfLines={1}>{restaurant.name}</Text>
                                                <Text style={[styles.venueSub, { color: theme.textMuted }]} numberOfLines={1}>
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
                                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Related Items</Text>
                                    {liveResults.items.map((product) => (
                                        <TouchableOpacity
                                            key={product._id}
                                            style={[
                                                styles.productCard, 
                                                { backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDark ? 1 : 0 }
                                            ]}
                                            onPress={() => handleItemClick(product, product.name)}
                                        >
                                            <Image
                                                source={product.image ? { uri: product.image } : require('../../assets/icon.png')}
                                                style={[styles.productImage, { backgroundColor: theme.inputBg }]}
                                            />
                                            <View style={styles.productInfo}>
                                                <Text style={[styles.productName, { color: theme.text }]}>{product.name}</Text>
                                                <Text style={[styles.productMeta, { color: theme.textMuted }]} numberOfLines={1}>
                                                    {product.restaurantName} • {product.restaurantAddress}
                                                </Text>
                                                <Text style={[styles.productPrice, { color: theme.primary }]}>₪{product.price}</Text>
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
    container: { flex: 1 },
    headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1 },
    searchBarWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 24, paddingHorizontal: 15, height: 45 },
    searchIcon: { marginRight: 8, fontSize: 16 },
    clearIcon: { marginLeft: 8, fontSize: 16 },
    input: { flex: 1, fontSize: 16, paddingVertical: 0 },
    closeButton: { marginLeft: 15 },
    closeButtonText: { fontSize: 16, fontWeight: '600' },
    scrollBody: { paddingBottom: 30 },
    section: { marginTop: 20, paddingHorizontal: 15 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    recentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
    clockIcon: { marginRight: 12, fontSize: 16 },
    recentText: { fontSize: 16 },
    emptyText: { textAlign: 'center', marginTop: 30, fontSize: 15, paddingHorizontal: 30 },
    horizontalScroll: { flexDirection: 'row', paddingBottom: 10 },
    venueCard: { width: 140, marginRight: 15, borderRadius: 12, padding: 8 },
    venueImage: { width: '100%', height: 95, borderRadius: 8 },
    venueName: { fontSize: 14, fontWeight: 'bold', marginTop: 8 },
    venueSub: { fontSize: 12, marginTop: 2 },
    productCard: { flexDirection: 'row', padding: 12, borderRadius: 12, marginBottom: 10, alignItems: 'center' },
    productImage: { width: 70, height: 70, borderRadius: 8, marginRight: 15 },
    productInfo: { flex: 1 },
    productName: { fontSize: 16, fontWeight: 'bold' },
    productMeta: { fontSize: 13, marginVertical: 3 },
    productPrice: { fontSize: 15, fontWeight: 'bold' }
});