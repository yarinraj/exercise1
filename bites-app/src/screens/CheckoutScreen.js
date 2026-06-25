import React, { useState } from 'react';
import {View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, ActivityIndicator} from 'react-native';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CheckoutScreen = ({ navigation, user }) => {
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const { cartItems, totalPrice, totalItems, clearCart, activeRestaurantId, showToast } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const DELIVERY_FEE = 12;
    const finalAmount = totalPrice + DELIVERY_FEE;

    const formatImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http://localhost') || url.startsWith('https://localhost')) {
            return url.replace('localhost', '10.0.2.2');
        }
        if (url.startsWith('http')) return url;
        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        return `${API_BASE_URL}${cleanPath}`;
    };

    // Main function to submit the order payload to the backend gateway
    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) {
            showToast('Your cart is empty', 'error');
            return;
        }

        try {
            setIsSubmitting(true);

            const savedUser = await AsyncStorage.getItem('user');
            const parsedUser = savedUser ? JSON.parse(savedUser) : null;
            const finalUserId = parsedUser?.userId || parsedUser?._id || parsedUser?.id || user?.userId || user?._id || 'guest_user';

            // Construct the payload allowing both authenticated users and guests to order
            const orderPayload = {
                userId: finalUserId,
                restaurantId: activeRestaurantId,
                
                products: cartItems.map(item => ({
                    productId: item._id || item.id, 
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                
                totalPrice: finalAmount,
                status: 'pending'
            };

            const response = await fetch(`${API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderPayload)
            });

            if (response.ok) {
                await clearCart(); 
                setShowSuccessModal(true); 
            } else {
                const errorData = await response.json().catch(() => null);
                console.log('Server Error Data:', errorData);
                showToast(errorData?.error || errorData?.message || 'Failed to submit order', 'error');
            }
        } catch (error) {
            console.error('Order submission error:', error);
            showToast('Network error. Failed to connect to server.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderCartItem = ({ item }) => {
        const formattedUrl = formatImageUrl(item.imageUrl || item.image);
        const imageSource = formattedUrl ? { uri: formattedUrl } : require('../../assets/icon.png');

        return (
            <View style={styles.itemCard}>
                <Image 
                    source={imageSource} 
                    style={styles.itemImage} 
                    resizeMode={formattedUrl ? 'cover' : 'contain'} 
                />
                <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>×{item.quantity}</Text>
                    <Text style={styles.brandPrice}>₪{item.price}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Area */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={{ width: 60 }}/> 
            </View>

            {/* Main Order Items Summary list */}
            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                
                <FlatList
                    data={cartItems}
                    keyExtractor={(item) => item._id}
                    renderItem={renderCartItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No items in your cart.</Text>
                    }
                />
            </View>

            {/* Financial Summary & Action Sticky Footer */}
            <View style={styles.footerCard}>
                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Subtotal</Text>
                    <Text style={styles.priceValue}>₪{totalPrice}</Text>
                </View>
                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Delivery Fee</Text>
                    <Text style={styles.priceValue}>₪{DELIVERY_FEE}</Text>
                </View>
                <View style={[styles.priceRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalValue}>₪{finalAmount}</Text>
                </View>

                <TouchableOpacity 
                    style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                    onPress={handlePlaceOrder}
                    disabled={isSubmitting || cartItems.length === 0}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Place Order • ₪{finalAmount}</Text>
                    )}
                </TouchableOpacity>
            </View>
                {showSuccessModal && (
                    <View style={styles.modalOverlay}>
                    <View style={styles.successBox}>
                        <Text style={styles.successIcon}>🎉</Text>
                        <Text style={styles.successTitle}>order confirmed</Text>
                        <Text style={styles.successMessage}>The shipment is on its way to you</Text>
                        
                        <TouchableOpacity 
                        style={styles.closeModalButton}
                        onPress={() => {
                            setShowSuccessModal(false);
                            navigation.popToTop();
                        }}
                        >
                        <Text style={styles.closeModalText}>Back to restaurants feed</Text>
                        </TouchableOpacity>
                    </View>
                    </View>
                )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f5ef',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        paddingTop: 40,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderColor: '#dfe3e8',
    },
    backButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    backButtonText: {
        color: '#00c2e8',
        fontWeight: '700',
        fontSize: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#202125',
    },
    content: {
        flex: 1,
        paddingTop: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#202125',
        paddingHorizontal: 24,
        marginBottom: 15,
        textAlign: 'left',
    },
    listContainer: {
        paddingHorizontal: 24,
    },
    itemCard: {
        flexDirection: 'row', 
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 12,
        marginBottom: 14,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 10,
        backgroundColor: '#eaeaea',
    },
    itemDetails: {
        flex: 1,
        marginLeft: 14, 
        alignItems: 'flex-start',
    },
    itemName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#202125',
        marginBottom: 4,
        textAlign: 'left',
    },
    itemMeta: {
        fontSize: 14,
        color: '#7b8490',
    },
    brandPrice: {
        color: '#00c2e8', 
        fontWeight: '800',
    },
    emptyText: {
        textAlign: 'center',
        color: '#7b8490',
        marginTop: 40,
        fontSize: 16,
    },
    footerCard: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        padding: 24,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: -5 },
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    priceLabel: {
        color: '#7b8490',
        fontSize: 15,
        fontWeight: '600',
    },
    priceValue: {
        color: '#202125',
        fontSize: 15,
        fontWeight: '700',
    },
    totalRow: {
        borderTopWidth: 1,
        borderColor: '#dfe3e8',
        paddingTop: 12,
        marginBottom: 20,
    },
    totalLabel: {
        color: '#202125',
        fontSize: 17,
        fontWeight: '900',
    },
    totalValue: {
        color: '#00c2e8',
        fontSize: 18,
        fontWeight: '900',
    },
    submitButton: {
        backgroundColor: '#00c2e8',
        padding: 16,
        borderRadius: 18,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '900',
    },
    modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center', 
    alignItems: 'center',     
    zIndex: 9999,             
  },
  successBox: {
    width: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10, 
  },
  successIcon: {
    fontSize: 55,
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
  },
  closeModalButton: {
    backgroundColor: '#00c2e8',
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 25,
    width: '100%', 
    alignItems: 'center',
  },
  closeModalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;