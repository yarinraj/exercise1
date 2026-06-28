import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '../config/api';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../config/Colors';
import { useCart } from '../context/CartContext';

export default function RestaurantMenu() {
  const { cartItems, addToCart, updateQuantity, showToast } = useCart();
  const { isDark } = useTheme();

  const theme = isDark ? Colors.dark : Colors.light;

  const route = useRoute();
  const navigation = useNavigation();

  const { id } = route.params || {};

  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartTrigger, setCartTrigger] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // --- Rating State ---
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    const fetchMenuData = async () => {
      if (!id) return;

      setLoading(true);

      try {
        const token = await AsyncStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // בדיקה האם המשתמש מחובר (קיים טוקן)
        setIsLoggedIn(!!token);

        const [restaurantRes, productsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/restaurants/${id}`, { headers }),
          fetch(`${API_BASE_URL}/api/restaurants/${id}/products`, { headers })
        ]);

        if (restaurantRes.status === 404 || !restaurantRes.ok || !productsRes.ok) {
          navigation.goBack();
          return;
        }

        const restaurantData = await restaurantRes.json();
        const productsData = await productsRes.json();

        setRestaurant(restaurantData);
        setProducts(productsData);
      } catch (err) {
        console.error('Error fetching menu data:', err);
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, [id, navigation]);

  // --- Submit Rating Function ---
  const submitRating = async () => {
    if (userRating === 0) {
      Alert.alert('Hold on', 'Please select a star rating before submitting.');
      return;
    }

    setIsSubmittingRating(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'You must be logged in to rate.');
        setIsSubmittingRating(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/restaurants/${id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: userRating
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // עדכון סטייט המערכת עם הממוצע החדש שחזר מהשרת
        setRestaurant(prev => ({
          ...prev,
          averageRating: result.averageRating,
          ratings: result.ratings
        }));

        setRatingModalVisible(false);
        setUserRating(0);
        if (showToast) showToast('Thank you for your rating!', 'success');
      } else {
        Alert.alert('Error', 'Could not submit your rating. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      Alert.alert('Error', 'Network error. Could not submit rating.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary || '#00c2e8'} />
      </View>
    );
  }

  const renderHeader = () => {
    if (!restaurant) return null;

    const hasImage = restaurant.image && restaurant.image.trim() !== '';
    const ratingCount = restaurant.ratings?.length || 0;
    const avgRating = restaurant.averageRating ? Number(restaurant.averageRating).toFixed(1) : 'New';

    return (
      <View>
        <View
          style={[
            styles.heroBanner,
            {
              backgroundColor: hasImage ? 'transparent' : theme.inputBg,
              borderBottomColor: theme.border,
              borderBottomWidth: 1
            }
          ]}
        >
          <Image
            source={hasImage ? { uri: restaurant.image } : require('../../assets/icon.png')}
            style={[styles.heroImage, { resizeMode: hasImage ? 'cover' : 'contain' }]}
          />
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.restaurantName, { color: theme.text }]}>
              {restaurant.name}
            </Text>
            
            {/* Rating Badge */}
            <View style={[styles.ratingBadge, { backgroundColor: isDark ? '#10243d' : '#e8f9fd', borderColor: theme.border }]}>
               <Text style={styles.ratingBadgeText}>⭐ {avgRating}</Text>
               {ratingCount > 0 && (
                  <Text style={[styles.ratingCountText, { color: theme.textMuted }]}>({ratingCount})</Text>
               )}
            </View>
          </View>

          <Text style={[styles.restaurantSub, { color: theme.textMuted || theme.mutedText || '#7b8490' }]}>
            {restaurant.cuisine} • {restaurant.address}
          </Text>
          
          {/* כפתור דירוג - מוצג אך ורק אם המשתמש מחובר */}
          {isLoggedIn && (
            <TouchableOpacity 
              style={styles.rateButton} 
              onPress={() => setRatingModalVisible(true)}
            >
              <Text style={styles.rateButtonText}>Rate Restaurant</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.menuTitle, { color: theme.text }]}>Menu</Text>
      </View>
    );
  };

  const renderProductItem = ({ item: product }) => {
    const hasImage = product.image && product.image.trim() !== '';
    const productId = product._id || product.id;

    const cartItem = cartItems
      ? cartItems.find((ci) => (ci._id || ci.id) === productId)
      : null;

    const quantity = cartItem ? cartItem.quantity : 0;

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            borderWidth: isDark ? 1 : 0
          }
        ]}
      >
        <View style={styles.cardContent}>
          <View style={[styles.textDetails, { maxWidth: hasImage ? '65%' : '100%' }]}>
            <Text style={[styles.productName, { color: theme.text }]}>
              {product.name}
            </Text>

            <Text
              style={[
                styles.productDescription,
                { color: theme.textMuted || theme.mutedText || '#7b8490' }
              ]}
              numberOfLines={3}
            >
              {product.description}
            </Text>

            <Text style={styles.productPrice}>₪{product.price}</Text>
          </View>

          <View style={styles.rightActions}>
            <View
              style={[
                styles.imageWrapper,
                { backgroundColor: hasImage ? 'transparent' : theme.inputBg }
              ]}
            >
              <Image
                source={hasImage ? { uri: product.image } : require('../../assets/icon.png')}
                style={[styles.productImage, { resizeMode: hasImage ? 'cover' : 'contain' }]}
              />
            </View>

            <View style={styles.quantityContainer}>
              {quantity === 0 ? (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    addToCart(product, id);
                    setCartTrigger((prev) => prev + 1);
                  }}
                >
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={styles.stepButton}
                    onPress={() => {
                      if (cartItem) {
                        const targetId = cartItem._id || cartItem.id;
                        const currentQty = cartItem.quantity || 1;

                        updateQuantity(targetId, currentQty - 1);
                        setCartTrigger((prev) => prev + 1);

                        if (showToast) {
                          showToast('Dish removed from cart.', 'info');
                        }
                      }
                    }}
                  >
                    <Text style={styles.stepButtonText}>-</Text>
                  </TouchableOpacity>

                  <Text style={styles.quantityText}>{quantity}</Text>

                  <TouchableOpacity
                    style={styles.stepButton}
                    onPress={() => {
                      addToCart(product, id);
                      setCartTrigger((prev) => prev + 1);
                    }}
                  >
                    <Text style={styles.stepButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const totalItemsInCart = cartItems
    ? cartItems.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  const totalPrice = cartItems
    ? cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity
        style={[
          styles.floatingBackButton,
          {
            backgroundColor: isDark ? 'rgba(9, 24, 45, 0.95)' : 'rgba(255, 255, 255, 0.9)'
          }
        ]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.floatingBackButtonText}>← Back</Text>
      </TouchableOpacity>

      <FlatList
        data={products}
        extraData={cartTrigger}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        ListHeaderComponent={renderHeader}
        renderItem={renderProductItem}
        contentContainerStyle={styles.listContent}
      />

      {totalItemsInCart > 0 && (
        <TouchableOpacity
          style={styles.cartBar}
          onPress={() => navigation.navigate('Checkout')}
        >
          <View style={styles.cartBarContent}>
            <View style={styles.cartCountBadge}>
              <Text style={styles.cartCountText}>{totalItemsInCart}</Text>
            </View>

            <Text style={styles.cartBarText}>View Basket</Text>

            <Text style={styles.cartBarPrice}>₪{totalPrice}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* --- Rating Modal (רק כוכבים, בלי תיבת טקסט) --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={ratingModalVisible}
        onRequestClose={() => setRatingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Rate {restaurant?.name}</Text>
            
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                  <Text style={[styles.starEmoji, { opacity: star <= userRating ? 1 : 0.3 }]}>
                    ⭐
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => {
                  setRatingModalVisible(false);
                  setUserRating(0);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton, isSubmittingRating && { opacity: 0.7 }]} 
                onPress={submitRating}
                disabled={isSubmittingRating}
              >
                {isSubmittingRating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 120 },
  heroBanner: { width: '100%', height: 200, justifyContent: 'center', alignItems: 'center' },
  heroImage: { width: '100%', height: '100%' },
  infoContainer: { alignItems: 'flex-start', padding: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  restaurantName: { fontSize: 26, fontWeight: 'bold', flex: 1, textAlign: 'left' },
  restaurantSub: { fontSize: 15, marginTop: 5, textAlign: 'left' },
  menuTitle: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 20, marginBottom: 15, textAlign: 'left' },
  
  // Rating Styles
  ratingBadge: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  ratingBadgeText: { color: '#00a6c8', fontSize: 13, fontWeight: '900' },
  ratingCountText: { fontSize: 11, marginLeft: 4, fontWeight: '700' },
  rateButton: { marginTop: 12, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(0, 194, 232, 0.1)', borderRadius: 8 },
  rateButtonText: { color: '#00c2e8', fontWeight: 'bold', fontSize: 14 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', padding: 24, borderRadius: 20, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 25, gap: 10 },
  starEmoji: { fontSize: 36 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 10 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f1f3f5' },
  cancelButtonText: { color: '#7b8490', fontWeight: 'bold', fontSize: 16 },
  submitButton: { backgroundColor: '#00c2e8' },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Existing Styles...
  card: { marginHorizontal: 15, marginBottom: 15, borderRadius: 16, padding: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'stretch' },
  textDetails: { flex: 1, alignItems: 'flex-start', justifyContent: 'space-between' },
  productName: { fontSize: 18, fontWeight: 'bold' },
  productDescription: { fontSize: 13, textAlign: 'left', marginTop: 4, lineHeight: 18 },
  productPrice: { fontSize: 18, fontWeight: 'bold', color: '#00c2e8', marginTop: 10 },
  rightActions: { width: 110, alignItems: 'center', justifyContent: 'space-between', marginRight: 15 },
  imageWrapper: { width: 110, height: 110, borderRadius: 12, overflow: 'hidden' },
  productImage: { width: '100%', height: '100%' },
  quantityContainer: { marginTop: 10, width: '100%', alignItems: 'center' },
  addButton: { backgroundColor: '#00c2e8', width: 35, height: 35, borderRadius: 17.5, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  addButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold', bottom: 1 },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#00c2e8', borderRadius: 20, paddingHorizontal: 8, height: 35, width: '95%', elevation: 2 },
  stepButton: { paddingHorizontal: 5, height: '100%', justifyContent: 'center' },
  stepButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  quantityText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cartBar: { position: 'absolute', bottom: 28, left: 20, right: 20, backgroundColor: '#00c2e8', borderRadius: 25, paddingVertical: 14, paddingHorizontal: 22, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 5.3 },
  cartBarContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartCountBadge: { backgroundColor: 'rgba(255, 255, 255, 0.25)', borderRadius: 15, paddingHorizontal: 12, paddingVertical: 4, justifyContent: 'center', alignItems: 'center' },
  cartCountText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cartBarText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  cartBarPrice: { color: '#fff', fontSize: 17, fontWeight: '700' },
  floatingBackButton: { position: 'absolute', top: 40, left: 20, zIndex: 9999, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 5 },
  floatingBackButtonText: { color: '#00c2e8', fontWeight: '800', fontSize: 15 }
});