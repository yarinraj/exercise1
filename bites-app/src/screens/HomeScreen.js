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

    const { isDark } = useTheme();
    const theme = isDark ? Colors.dark : Colors.light;

    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchVisible, setSearchVisible] = useState(false);

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

        // Fetch data on initial mount
        fetchRestaurants();

        // Add navigation listener to re-fetch data every time the screen comes into focus
        const unsubscribe = navigation.addListener('focus', () => {
            fetchRestaurants();
        });

        // Clean up the listener when component unmounts
        return unsubscribe;
    }, [navigation]);

    const formatImageUrl = (url) => {
        if (!url) {
            return null;
        }

        if (url.startsWith('http://localhost') || url.startsWith('https://localhost')) {
            return url.replace('localhost', '10.0.2.2');
        }

        if (url.startsWith('http')) {
            return url;
        }

        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        return `${API_BASE_URL}${cleanPath}`;
    };

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
                    <View style={styles.cardTopRow}>
                        <View style={styles.restaurantTextArea}>
                            <Text style={[styles.restaurantName, { color: theme.text }]}>
                                {item.name}
                            </Text>

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
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Browsing Restaurants
                </Text>

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
        backgroundColor: '#f8f5ef'
    },
    header: {
        padding: 24,
        paddingTop: 8,
        paddingBottom: 16,
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: 26,
        borderBottomRightRadius: 26,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 3,
        marginBottom: 12
    },
    logo: {
        fontSize: 32,
        fontWeight: '900',
        color: '#00c2e8',
        fontStyle: 'italic',
        marginBottom: 5
    },
    welcomeText: {
        fontSize: 16,
        color: '#7b8490',
        fontWeight: '600'
    },
    searchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f3f5',
        marginTop: 12,
        paddingHorizontal: 16,
        height: 46,
        borderRadius: 24
    },
    searchEmoji: {
        marginRight: 10,
        fontSize: 16
    },
    placeholder: {
        color: '#7b8490',
        fontSize: 15,
        fontWeight: '500'
    },
    content: {
        flex: 1
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#202125',
        paddingHorizontal: 24,
        marginBottom: 15
    },
    loader: {
        flex: 1,
        justifyContent: 'center'
    },
    errorText: {
        color: '#ff4a4a',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16
    },
    listContainer: {
        paddingHorizontal: 24,
        paddingBottom: 30
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4
    },
    cardImage: {
        width: '100%',
        height: 160,
        backgroundColor: '#eaeaea'
    },
    cardInfo: {
        padding: 18
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12
    },
    restaurantTextArea: {
        flex: 1
    },
    restaurantName: {
        fontSize: 19,
        fontWeight: '800',
        color: '#202125',
        marginBottom: 6
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