import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
    View, Text, Image, TouchableOpacity, StyleSheet,
    Alert, FlatList, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../config/api';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../config/Colors';

const RestaurantMenuManagerScreen = ({ route, navigation }) => {
    const restaurantId = route.params?.id || route.params?.restaurantId;
    const { isDark } = useTheme();
    const theme = isDark ? Colors.dark : Colors.light;

    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: { backgroundColor: theme.card },
            headerTintColor: theme.text,
        });
    }, [navigation, theme]);

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const fetchProducts = async () => {
                if (!restaurantId) return;
                
                try {
                    setIsLoading(true);
                    const response = await fetch(`${API_BASE_URL}/api/restaurants/${restaurantId}/products`);

                    if (!response.ok) {
                        throw new Error('Failed to fetch products');
                    }

                    const data = await response.json();
                    setProducts(data);
                } catch (error) {
                    console.error('Error fetching products:', error);
                    Alert.alert('Error', 'Failed to load dishes.');
                } finally {
                    setIsLoading(false);
                }
            };

            fetchProducts();
        }, [restaurantId])
    );

    const confirmDelete = async (productId) => {
        try {
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert('Error', 'You are not logged in.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/restaurants/${restaurantId}/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok || response.status === 204) {
                setProducts((prevProducts) =>
                    prevProducts.filter((product) => product._id !== productId)
                );
                Alert.alert('Success', 'Dish deleted successfully!');
                return;
            }

            const errorData = await response.json().catch(() => null);
            Alert.alert('Error', errorData?.error || errorData?.message || 'Failed to delete dish.');
        } catch (error) {
            console.error('Delete error:', error);
            Alert.alert('Error', 'Server error while deleting dish.');
        }
    };

    const handleDeleteClick = (productId) => {
        Alert.alert(
            'Delete dish?',
            'Are you sure you want to delete this dish? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => confirmDelete(productId) }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.listItem}>
            <View style={styles.itemInfo}>
                <Image
                    source={item.image && item.image.trim() !== '' ? { uri: item.image } : require('../../assets/icon.png')} 
                    style={styles.itemImage}
                />
                <View>
                    <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                    
                    <Text style={[styles.itemPrice, { color: theme.textMuted }]}>{item.price} ₪</Text>
                </View>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('EditDishScreen', { restaurantId, productId: item._id })}
                >
                    <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteClick(item._id)}
                >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Menu Management</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>Manage the dishes available at your restaurant.</Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Dishes</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('AddDishScreen', { restaurantId })}
                    >
                        <Text style={styles.addButtonText}>+ Add New Dish</Text>
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#00c2e8" style={{ marginTop: 40 }} />
                ) : products.length > 0 ? (
                    <FlatList
                        data={products}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <Text style={[styles.emptyText, { color: theme.textMuted }]}>No dishes found. Click "+ Add New Dish" to get started.</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f5ef', padding: 20 },
    header: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
    title: { fontSize: 26, fontWeight: '900', color: '#202125' },
    subtitle: { fontSize: 14, color: '#7b8490', marginTop: 4, textAlign: 'center' },
    card: { flex: 1, backgroundColor: '#fff', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#202125' },
    addButton: { backgroundColor: '#00c2e8', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
    addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    listContainer: { paddingBottom: 20 },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eaeaea' },
    itemInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    itemImage: { width: 50, height: 50, borderRadius: 10, marginRight: 12, backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#eaeaea' },
    itemName: { fontSize: 16, fontWeight: 'bold', color: '#202125' },
    itemPrice: { fontSize: 14, color: '#7b8490', marginTop: 2 },
    actionButtons: { flexDirection: 'row' },
    editButton: { borderColor: '#00c2e8', borderWidth: 1, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15, marginRight: 8 },
    editButtonText: { color: '#00c2e8', fontWeight: 'bold', fontSize: 12 },
    deleteButton: { borderColor: '#d62828', borderWidth: 1, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15 },
    deleteButtonText: { color: '#d62828', fontWeight: 'bold', fontSize: 12 },
    emptyText: { textAlign: 'center', color: '#7b8490', marginTop: 40, fontSize: 14 }
});

export default RestaurantMenuManagerScreen;
