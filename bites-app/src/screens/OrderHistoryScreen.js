import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '../config/api';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../config/Colors';

const OrderHistoryScreen = () => {
    const navigation = useNavigation();
    const { isDark } = useTheme();
    const theme = isDark ? Colors.dark : Colors.light;

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [screenError, setScreenError] = useState('');
    const sortOrdersNewestFirst = (ordersList) => {
        return [...ordersList].sort((a, b) => {
            const dateA = new Date(a.createdAt || a.date || 0).getTime();
            const dateB = new Date(b.createdAt || b.date || 0).getTime();

            return dateB - dateA;
        });
    };

    const loadOrders = async () => {
        try {
            setIsLoading(true);
            setScreenError('');

            const token = await AsyncStorage.getItem('token');
            const savedUser = await AsyncStorage.getItem('user');
            const parsedUser = savedUser ? JSON.parse(savedUser) : null;

            if (!token || !parsedUser) {
                Alert.alert('Login required', 'Only logged-in users can access order history.', [
                    {
                        text: 'OK',
                        onPress: () => navigation.replace('Login')
                    }
                ]);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/orders`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                setScreenError(data?.error || 'Failed to load orders.');
                return;
            }

            if (Array.isArray(data)) {
                setOrders(sortOrdersNewestFirst(data));
                return;
            }

            if (Array.isArray(data?.orders)) {
                setOrders(sortOrdersNewestFirst(data.orders));
                return;
            }

            setOrders([]);
        } catch (error) {
            console.error('Order history error:', error);
            setScreenError('Could not connect to the server.');
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadOrders();
        }, [])
    );

    const formatDate = (dateValue) => {
        if (!dateValue) return 'Unknown date';

        try {
            return new Date(dateValue).toLocaleString();
        } catch {
            return 'Unknown date';
        }
    };

    const getRestaurantName = (order) => {
        return (
            order?.restaurantName ||
            order?.restaurant?.name ||
            order?.venue?.name ||
            'Restaurant'
        );
    };

    const getOrderItems = (order) => {
        return order?.items || order?.products || [];
    };

    const calculateOrderTotal = (order) => {
        if (typeof order?.totalPrice === 'number') return order.totalPrice;
        if (typeof order?.total === 'number') return order.total;

        const items = getOrderItems(order);

        return items.reduce((sum, item) => {
            const quantity = item?.quantity || 0;
            const price =
                typeof item?.price === 'number'
                    ? item.price
                    : typeof item?.product?.price === 'number'
                        ? item.product.price
                        : 0;

            return sum + quantity * price;
        }, 0);
    };

    const renderOrderItemLine = (item, index) => {
        const itemName = item?.name || item?.product?.name || 'Item';
        const quantity = item?.quantity || 1;
        const price =
            typeof item?.price === 'number'
                ? item.price
                : typeof item?.product?.price === 'number'
                    ? item.product.price
                    : 0;

        return (
            <View key={`${itemName}-${index}`} style={styles.itemRow}>
                <Text style={[styles.itemText, { color: theme.text }]}>
                    {quantity} x {itemName}
                </Text>
                <Text style={[styles.itemPrice, { color: theme.textMuted }]}>
                    ₪{(price * quantity).toFixed(2)}
                </Text>
            </View>
        );
    };

    const renderOrderCard = ({ item }) => {
        const orderItems = getOrderItems(item);
        const total = calculateOrderTotal(item);

        return (
            <View
                style={[
                    styles.orderCard,
                    {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                        borderWidth: isDark ? 1 : 0
                    }
                ]}
            >
                <View style={styles.orderHeader}>
                    <View>
                        <Text style={[styles.restaurantName, { color: theme.text }]}>
                            {getRestaurantName(item)}
                        </Text>
                        <Text style={[styles.orderDate, { color: theme.textMuted }]}>
                            {formatDate(item?.createdAt || item?.date)}
                        </Text>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: theme.inputBg }]}>
                        <Text style={[styles.statusText, { color: theme.text }]}>
                            {item?.status || 'Completed'}
                        </Text>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.itemsContainer}>
                    {orderItems.length > 0 ? (
                        orderItems.map((orderItem, index) => renderOrderItemLine(orderItem, index))
                    ) : (
                        <Text style={[styles.emptyItemsText, { color: theme.textMuted }]}>
                            No items found for this order.
                        </Text>
                    )}
                </View>

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { color: theme.text }]}>Total</Text>
                    <Text style={[styles.totalValue, { color: '#00c2e8' }]}>
                        ₪{total.toFixed(2)}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
            <View style={styles.container}>
                <Text style={[styles.title, { color: theme.text }]}>Your Order History</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                    View your previous orders
                </Text>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#00c2e8" style={styles.loader} />
                ) : screenError ? (
                    <View style={styles.centerBox}>
                        <Text style={styles.errorText}>{screenError}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={loadOrders}
                        >
                            <Text style={styles.retryButtonText}>Try again</Text>
                        </TouchableOpacity>
                    </View>
                ) : orders.length === 0 ? (
                    <View style={styles.centerBox}>
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>
                            No previous orders yet
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                            Once you place orders, they will appear here.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={orders}
                        keyExtractor={(item, index) => item?._id || item?.id || `order-${index}`}
                        renderItem={renderOrderCard}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 12
    },
    title: {
        fontSize: 28,
        fontWeight: '900'
    },
    subtitle: {
        fontSize: 14,
        marginTop: 6,
        marginBottom: 20
    },
    loader: {
        marginTop: 40
    },
    centerBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20
    },
    errorText: {
        color: '#ff4a4a',
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 16
    },
    retryButton: {
        backgroundColor: '#00c2e8',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 14
    },
    retryButtonText: {
        color: '#ffffff',
        fontWeight: '800'
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center'
    },
    listContent: {
        paddingBottom: 30
    },
    orderCard: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    restaurantName: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 6
    },
    orderDate: {
        fontSize: 13
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700'
    },
    divider: {
        height: 1,
        marginVertical: 14
    },
    itemsContainer: {
        gap: 10
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    itemText: {
        fontSize: 14,
        flex: 1,
        marginRight: 12
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600'
    },
    emptyItemsText: {
        fontSize: 14,
        fontStyle: 'italic'
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '800'
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '900'
    }
});

export default OrderHistoryScreen;