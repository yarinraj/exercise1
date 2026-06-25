import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Image,
    TouchableOpacity,
    SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../config/api';
import SearchOverlay from './SearchOverlay';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../config/Colors';

const HomeScreen = ({ user }) => {
    const navigation = useNavigation();
    
    // Get current theme state (true for dark, false for light)
    const { isDark } = useTheme();
    // Select the active color palette based on the theme state
    const theme = isDark ? Colors.dark : Colors.light;
    
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchVisible, setSearchVisible] = useState(false);

    // Fetch restaurants from your backend when the screen loads
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
    }, []);

    // Helper function to format image URLs properly for the mobile emulator
    const formatImageUrl = (url) => {
        if (!url) {
            return null; // Return null if no image exists so we can use the local asset fallback
        }

        // Case 1: URL is absolute and contains localhost (needs replacement for Android Emulator)
        if (url.startsWith('http://localhost') || url.startsWith('https://localhost')) {
            return url.replace('localhost', '10.0.2.2');
        }

        // Case 2: URL is already a full external web address
        if (url.startsWith('http')) {
            return url;
        }

        // Case 3: URL is a relative path (e.g., /uploads/image.png or uploads/image.png)
        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        return `${API_BASE_URL}${cleanPath}`;
    };

    // Inside your HomeScreen component, update renderRestaurantCard:
    const renderRestaurantCard = ({ item }) => {
        const rawImage = item.imageUrl || item.image;
        const formattedUrl = formatImageUrl(rawImage);

        // Dynamically choose between remote URL or local asset require
        const imageSource = formattedUrl
            ? { uri: formattedUrl }
            : require('../../assets/icon.png');

        return (
            <TouchableOpacity 
                // Apply dynamic background and border based on theme
                style={[
                    styles.card, 
                    { 
                        backgroundColor: theme.card, 
                        borderColor: theme.border, 
                        borderWidth: isDark ? 1 : 0 // Only show border in dark mode (matches web CSS)
                    }
                ]}
                onPress={() => navigation.navigate('RestaurantMenu', { id: item._id || item.id })}
            >
                <Image
                    source={imageSource}
                    style={[
                        styles.cardImage,
                        // Apply dynamic background for missing images
                        !formattedUrl && { backgroundColor: theme.inputBg, padding: 15 }
                    ]}
                    resizeMode={formattedUrl ? 'cover' : 'contain'}
                />
                <View style={styles.cardInfo}>
                    {/* Dynamic text color for restaurant name */}
                    <Text style={[styles.restaurantName, { color: theme.text }]}>
                        {item.name}
                    </Text>
                    {/* Dynamic muted text color for description */}
                    <Text style={[styles.restaurantDescription, { color: theme.textMuted }]} numberOfLines={2}>
                        {item.description}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        // Apply dynamic background color to the main container
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            
            {/* Apply dynamic card background to the header. Remove shadow in dark mode for better look */}
            <View style={[styles.header, { backgroundColor: theme.card, shadowOpacity: isDark ? 0 : 0.05 }]}>
                <Text style={styles.logo}>bites</Text>
                <Text style={styles.welcomeText}>
                    Welcome back, {user?.displayName || user?.username || 'Guest'}! 🍕
                </Text>
                <TouchableOpacity
                    // Apply dynamic input background to the search button
                    style={[styles.searchButton, { backgroundColor: theme.inputBg }]}
                    onPress={() => setSearchVisible(true)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.searchEmoji}>🔍</Text>
                    <Text style={styles.placeholder}>Search restaurants or dishes...</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Apply dynamic text color to section title */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Browsing Restaurants</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#00c2e8" style={styles.loader} />
                ) : error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : (
                    <FlatList
                        data={restaurants}
                        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
                        renderItem={renderRestaurantCard}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
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
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f5ef', // Kept as fallback, overridden by dynamic style
    },
    header: {
        padding: 24,
        paddingTop: 8,
        paddingBottom: 16,
        backgroundColor: '#ffffff', // Kept as fallback
        borderBottomLeftRadius: 26,
        borderBottomRightRadius: 26,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 3,
        marginBottom: 12,
    },
    logo: {
        fontSize: 32,
        fontWeight: '900',
        color: '#00c2e8',
        fontStyle: 'italic',
        marginBottom: 5,
    },
    welcomeText: {
        fontSize: 16,
        color: '#7b8490',
        fontWeight: '600',
    },
    searchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f3f5', // Kept as fallback
        marginTop: 12,
        paddingHorizontal: 16,
        height: 46,
        borderRadius: 24, 
    },
    searchEmoji: {
        marginRight: 10,
        fontSize: 16,
    },
    placeholder: {
        color: '#7b8490',
        fontSize: 15,
        fontWeight: '500',
    },
    content: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#202125', // Kept as fallback
        paddingHorizontal: 24,
        marginBottom: 15,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
    },
    errorText: {
        color: '#ff4a4a',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
    listContainer: {
        paddingHorizontal: 24,
        paddingBottom: 30,
    },
    card: {
        backgroundColor: '#ffffff', // Kept as fallback
        borderRadius: 20,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4,
    },
    cardImage: {
        width: '100%',
        height: 160,
        backgroundColor: '#eaeaea',
    },
    cardInfo: {
        padding: 18,
    },
    restaurantName: {
        fontSize: 19,
        fontWeight: '800',
        color: '#202125', // Kept as fallback
        marginBottom: 6,
    },
    restaurantDescription: {
        fontSize: 14,
        color: '#7b8490', // Kept as fallback
        lineHeight: 20,
    },
});

export default HomeScreen;