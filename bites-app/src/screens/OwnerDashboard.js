import React, { useState, useEffect } from 'react';
import { 
    StyleSheet, Text, View, ScrollView, TouchableOpacity, 
    Image, Alert, ActivityIndicator, SafeAreaView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

export default function OwnerDashboard({ user }) {
    const navigation = useNavigation();
    
    const [restaurants, setRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMyRestaurants = async () => {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert('Error', 'You are not logged in.');
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/restaurants/my-restaurants`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch');
                }

                const data = await response.json();
                setRestaurants(data);
            } catch (error) {
                console.error('Failed to fetch restaurants:', error);
                Alert.alert('Error', 'Failed to load your restaurants.');
            } finally {
                setIsLoading(false);
            }
        };

        const unsubscribe = navigation.addListener('focus', () => {
            fetchMyRestaurants();
        });

        return unsubscribe;
    }, [navigation]);

    const handlePromotionClick = (id, currentStatus) => {
        const title = currentStatus ? 'Cancel promotion?' : 'Promote restaurant?';
        const message = currentStatus 
            ? 'Are you sure you want to stop promoting this restaurant?' 
            : 'Notice: Promoting your restaurant costs 199.90₪ a month. Would you like to activate premium promotion?';

        Alert.alert(title, message, [
            { text: 'Cancel', style: 'cancel' },
            { 
                text: currentStatus ? 'Cancel Promotion' : 'Promote', 
                style: currentStatus ? 'destructive' : 'default',
                onPress: () => confirmPromotionChange(id, currentStatus) 
            }
        ]);
    };

    const confirmPromotionChange = async (id, currentStatus) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/api/restaurants/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ isPromoted: !currentStatus })
            });

            if (response.ok) {
                setRestaurants((prev) =>
                    prev.map((res) =>
                        res._id === id ? { ...res, isPromoted: !currentStatus } : res
                    )
                );
                Alert.alert('Success', currentStatus ? 'Promotion cancelled.' : 'Restaurant promoted!');
                return;
            }
            const errorData = await response.json().catch(() => null);
            Alert.alert('Error', errorData?.error || 'Failed to update promotion status.');
        } catch (error) {
            Alert.alert('Error', 'Server error while updating promotion.');
        }
    };

    const handleDeleteClick = (id) => {
        Alert.alert(
            'Delete restaurant?',
            'Are you sure you want to delete this restaurant? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: () => confirmDelete(id) 
                }
            ]
        );
    };

    const confirmDelete = async (id) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/api/restaurants/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok || response.status === 204) {
                setRestaurants((prev) => prev.filter((res) => res._id !== id));
                Alert.alert('Success', 'Restaurant deleted successfully!');
                return;
            }
            const errorData = await response.json().catch(() => null);
            Alert.alert('Error', errorData?.error || 'Failed to delete restaurant.');
        } catch (error) {
            Alert.alert('Error', 'Server error while deleting restaurant.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                <View style={styles.header}>
                    <Text style={styles.title}>My Restaurants</Text>
                    <TouchableOpacity 
                        style={styles.createButton}
                        onPress={() => navigation.navigate('RestaurantSetupScreen')} 
                    >
                        <Text style={styles.createButtonText}>+ Create New</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#00c2e8" style={{ marginTop: 20 }} />
                    ) : restaurants.length > 0 ? (
                        restaurants.map((res) => (
                            <View key={res._id} style={styles.card}>
                                {res.isPromoted && (
                                    <View style={styles.promotedBadge}>
                                        <Text style={styles.promotedText}>⭐ Promoted</Text>
                                    </View>
                                )}
                                
                                <Image 
                                    source={res.image && res.image.trim() !== '' ? { uri: res.image } : require('../../assets/icon.png')} 
                                    style={[styles.cardImage, (!res.image || res.image.trim() === '') && styles.containImage]} 
                                />
                                
                                <View style={styles.cardBody}>
                                    <Text style={styles.cardTitle}>{res.name}</Text>
                                    <Text style={styles.cardCuisine}>{res.cuisine}</Text>
                                    
                                    <View style={styles.actionButtonsRow}>
                                        <TouchableOpacity 
                                            style={[styles.actionBtn, styles.editBtn]}
                                            onPress={() => navigation.navigate('EditRestaurantScreen', { id: res._id })}
                                        >
                                            <Text style={styles.editBtnText}>Edit</Text>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity 
                                            style={[styles.actionBtn, styles.menuBtn]}
                                            onPress={() => navigation.navigate('RestaurantMenuManagerScreen', { id: res._id })}
                                        >
                                            <Text style={styles.menuBtnText}>Menu</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity 
                                            style={[styles.actionBtn, styles.deleteBtn]}
                                            onPress={() => handleDeleteClick(res._id)}
                                        >
                                            <Text style={styles.deleteBtnText}>Delete</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity 
                                        style={[styles.promoteBtn, res.isPromoted ? styles.promoteBtnActive : styles.promoteBtnInactive]}
                                        onPress={() => handlePromotionClick(res._id, res.isPromoted)}
                                    >
                                        <Text style={[styles.promoteBtnText, !res.isPromoted && styles.promoteBtnTextInactive]}>
                                            {res.isPromoted ? '❌ Cancel Promotion' : '⭐ Promote'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>You don't have any restaurants yet.</Text>
                            <Text style={styles.emptyText}>Create your first one to get started!</Text>
                        </View>
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, marginTop: 10 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#212529' },
    createButton: { backgroundColor: '#00c2e8', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20 },
    createButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    section: { backgroundColor: '#fff', padding: 20, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
    card: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#eee' },
    promotedBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#ffc107', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, zIndex: 2 },
    promotedText: { fontSize: 12, fontWeight: 'bold', color: '#000' },
    cardImage: { width: '100%', height: 150, backgroundColor: '#f1f3f5' },
    containImage: { resizeMode: 'contain', padding: 20 },
    cardBody: { padding: 15 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#212529', marginBottom: 4 },
    cardCuisine: { fontSize: 14, color: '#6c757d', marginBottom: 15 },
    actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 20, alignItems: 'center', marginHorizontal: 4 },
    editBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#007bff' },
    editBtnText: { color: '#007bff', fontWeight: '600' },
    menuBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#6c757d' },
    menuBtnText: { color: '#6c757d', fontWeight: '600' },
    deleteBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#dc3545' },
    deleteBtnText: { color: '#dc3545', fontWeight: '600' },
    promoteBtn: { paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
    promoteBtnActive: { backgroundColor: '#ffc107', elevation: 2 },
    promoteBtnInactive: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#ffc107' },
    promoteBtnText: { fontWeight: 'bold', color: '#000' },
    promoteBtnTextInactive: { color: '#d39e00' },
    emptyState: { alignItems: 'center', paddingVertical: 30 },
    emptyText: { color: '#6c757d', fontSize: 15, textAlign: 'center', marginTop: 5 }
});
