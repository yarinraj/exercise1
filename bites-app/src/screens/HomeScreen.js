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

const HomeScreen = ({ user }) => {
    const navigation = useNavigation();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch restaurants from your backend when the screen loads
    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                // Adjust the endpoint if your Node.js route is different
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
        <TouchableOpacity style={styles.card}
        onPress={() => navigation.navigate('RestaurantMenu', { id: item._id || item.id })} // Navigates and passes the restaurant ID
        >
            <Image 
                source={imageSource} 
                style={[
                    styles.cardImage,
                    // Optional: add a subtle background tint only when showing the logo
                    !formattedUrl && { backgroundColor: '#f0f8fb', padding: 15 } 
                ]} 
                // Cover for restaurant photos, Contain to keep the logo perfectly proportioned
                resizeMode={formattedUrl ? 'cover' : 'contain'} 
            />
            <View style={styles.cardInfo}>
                <Text style={styles.restaurantName}>{item.name}</Text>
                <Text style={styles.restaurantDescription} numberOfLines={2}>
                    {item.description}
                </Text>
            </View>
        </TouchableOpacity>
    );
};
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.logo}>bites</Text>
                <Text style={styles.welcomeText}>
                    Welcome back, {user?.displayName || user?.username || 'Guest'}! 🍕
                </Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Browsing Restaurants</Text>
                
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f5ef',
    },
    header: {
        padding: 24,
        paddingTop: 40,
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: 26,
        borderBottomRightRadius: 26,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 3,
        marginBottom: 20,
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
    content: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#202125',
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
        backgroundColor: '#ffffff',
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
        color: '#202125',
        marginBottom: 6,
    },
    restaurantDescription: {
        fontSize: 14,
        color: '#7b8490',
        lineHeight: 20,
    },
});

export default HomeScreen;