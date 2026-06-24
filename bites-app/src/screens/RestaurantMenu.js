import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Image,
  FlatList, ActivityIndicator, SafeAreaView, useColorScheme 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api'; 

export default function RestaurantMenu() {
  const route = useRoute();
  const navigation = useNavigation();
  const systemColorScheme = useColorScheme();
  
  // Get restaurant ID passed from the feed screen
  const { id } = route.params || {}; 

  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    setIsDark(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  // Fetch restaurant and menu data
  useEffect(() => {
    const fetchMenuData = async () => {
      if (!id) return;
      setLoading(true);
      
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [restaurantRes, productsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/restaurants/${id}`, { headers }),
          fetch(`${API_BASE_URL}/api/restaurants/${id}/products`, { headers })
        ]);

        if (restaurantRes.status === 404 || !restaurantRes.ok || !productsRes.ok) {
          navigation.goBack(); // Safely goes back to previous screen if not found
          return;
        }

        const restaurantData = await restaurantRes.json();
        const productsData = await productsRes.json();

        setRestaurant(restaurantData);
        setProducts(productsData);
      } catch (err) {
        console.error("Error fetching menu data:", err);
        navigation.goBack(); // Safely goes back to previous screen on network error
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.centerContainer, isDark && styles.darkBackground]}>
        <ActivityIndicator size="large" color="#00c2e8" />
      </View>
    );
  }

  // Header Component for the list (Hero Image + Info)
  const renderHeader = () => {
    if (!restaurant) return null;
    const hasImage = restaurant.image && restaurant.image.trim() !== '';

    return (
      <View>
        <View style={[
          styles.heroBanner, 
          { backgroundColor: hasImage ? 'transparent' : (isDark ? '#1a1d24' : '#f8f9fa') },
          { borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
        ]}>
          <Image
            source={hasImage ? { uri: restaurant.image } : require('../../assets/icon.png')} 
            style={[styles.heroImage, { resizeMode: hasImage ? 'cover' : 'contain' }]}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.restaurantName, { color: isDark ? '#fff' : '#212529' }]}>{restaurant.name}</Text>
          <Text style={[styles.restaurantSub, { color: isDark ? '#adb5bd' : '#6c757d' }]}>
            {restaurant.cuisine} • {restaurant.address}
          </Text>
        </View>

        <Text style={[styles.menuTitle, { color: isDark ? '#fff' : '#212529' }]}>Menu</Text>
      </View>
    );
  };

  // Menu Product Card Item
  const renderProductItem = ({ item: product }) => {
    const hasImage = product.image && product.image.trim() !== "";

    return (
      <View style={[
        styles.card, 
        { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff' },
        { borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' }
      ]}>
        <View style={styles.cardContent}>
          
          <View style={[styles.textDetails, { maxWidth: hasImage ? '65%' : '100%' }]}>
            <Text style={[styles.productName, { color: isDark ? '#fff' : '#212529' }]}>{product.name}</Text>
            <Text style={styles.productDescription} numberOfLines={3}>{product.description}</Text>
            <Text style={styles.productPrice}>₪{product.price}</Text>
          </View>

          <View style={styles.rightActions}>
            <View style={[styles.imageWrapper, { backgroundColor: hasImage ? 'transparent' : (isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa') }]}>
              <Image 
                source={hasImage ? { uri: product.image } : require('../../assets/icon.png')}
                style={[styles.productImage, { resizeMode: hasImage ? 'cover' : 'contain' }]}
              />
            </View>
          </View>

        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkBackground]}>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        ListHeaderComponent={renderHeader}
        renderItem={renderProductItem}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  darkBackground: { backgroundColor: '#121212' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 30 },
  heroBanner: { width: '100%', height: 200, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1 },
  heroImage: { width: '100%', height: '100%' },
  infoContainer: { alignItems: 'flex-start', padding: 20 },
  restaurantName: { fontSize: 26, fontWeight: 'bold', textAlign: 'left' },
  restaurantSub: { fontSize: 15, marginTop: 5, textAlign: 'left' },
  menuTitle: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 20, marginBottom: 15, textAlign: 'left' },
  card: { marginHorizontal: 15, marginBottom: 15, borderRadius: 16, borderWidth: 1, padding: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'stretch' },
  textDetails: { flex: 1, alignItems: 'flex-start', justifyContent: 'space-between' },
  productName: { fontSize: 18, fontWeight: 'bold' },
  productDescription: { color: '#8c9399', fontSize: 13, textAlign: 'left', marginTop: 4, lineHeight: 18 },
  productPrice: { fontSize: 18, fontWeight: 'bold', color: '#00c2e8', marginTop: 10 },
  rightActions: { width: 110, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  imageWrapper: { width: 110, height: 110, borderRadius: 12, overflow: 'hidden' },
  productImage: { width: '100%', height: '100%' }
});