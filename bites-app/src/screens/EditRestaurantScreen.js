import React, { useState, useEffect } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, StyleSheet, 
    ScrollView, ActivityIndicator, Alert, Switch, SafeAreaView 
} from 'react-native';
import { API_BASE_URL } from '../config/api';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../config/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditRestaurantScreen({ route, navigation }) {
    const { id } = route.params;
        const { isDark } = useTheme();
        const theme = isDark ? Colors.dark : Colors.light;

    const [restaurant, setRestaurant] = useState({
        name: '',
        address: '',
        cuisine: '',
        lat: '',
        lng: '',
        description: '',
        phone: '',
        coverImage: '',
        isPromoted: false
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const res = await fetch(`${API_BASE_URL}/api/restaurants/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                
                if (res.ok) {
                    setRestaurant({
                        name: data.name || '',
                        address: data.address || '',
                        cuisine: data.cuisine || '',
                        lat: data.lat ? data.lat.toString() : '',
                        lng: data.lng ? data.lng.toString() : '',
                        description: data.description || '',
                        phone: data.phone || '',
                        coverImage: data.coverImage || '',
                        isPromoted: data.isPromoted || false
                    });
                } else {
                    Alert.alert('Error', 'Could not load restaurant details');
                }
            } catch (error) {
                Alert.alert('Error', 'Network error while loading data.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchRestaurant();
    }, [id]);

    const handleSave = async () => {
        if (
            !restaurant.name.trim() ||
            !restaurant.address.trim() ||
            !restaurant.cuisine.trim() ||
            !restaurant.lat.trim() ||
            !restaurant.lng.trim()
        ) {
            Alert.alert('Error', 'Please fill in all required fields (*).');
            return; 
        }
        try {
            setIsSaving(true);
            const token = await AsyncStorage.getItem('token');
            
            const response = await fetch(`${API_BASE_URL}/api/restaurants/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(restaurant)
            });

            if (response.ok) {
                Alert.alert('Success', 'Restaurant updated successfully!');
                navigation.goBack(); 
            } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.message || 'Failed to update restaurant');
            }
        } catch (error) {
            console.error('Update error:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#00c2e8" />
                <Text style={{marginTop: 10}}>Loading restaurant details...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
             <View style={[styles.header, { backgroundColor: theme.card }]}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Text style={styles.backButtonText}>← Back</Text>
                            </TouchableOpacity>
                            <Text style={[styles.headerTitle, { color: theme.text }]}>Edit Restaurant</Text>
                            <View style={{ width: 60 }} />
                        </View>
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={[styles.formCard, { backgroundColor: theme.card }]}>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>Fields marked with * are required.</Text>

                <Text style={[styles.label, { color: theme.text }]}>Restaurant Name *</Text>
                <TextInput 
                    style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                    value={restaurant.name} 
                    placeholderTextColor={theme.textMuted}
                    onChangeText={(text) => setRestaurant({...restaurant, name: text})}
                />

                <Text style={[styles.label, { color: theme.text }]}>Address *</Text>
                <TextInput 
                    style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                    value={restaurant.address} 
                    placeholderTextColor={theme.textMuted}
                    onChangeText={(text) => setRestaurant({...restaurant, address: text})}
                />

                <Text style={[styles.label, { color: theme.text }]}>Cuisine Type *</Text>
                <TextInput 
                    style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                    value={restaurant.cuisine} 
                    placeholderTextColor={theme.textMuted}
                    onChangeText={(text) => setRestaurant({...restaurant, cuisine: text})}
                />

                <View style={styles.row}>
                    <View style={styles.halfWidth}>
                        <Text style={[styles.label, { color: theme.text }]}>Latitude *</Text>
                        <TextInput 
                            style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                            value={restaurant.lat} 
                            placeholderTextColor={theme.textMuted}
                            keyboardType="numeric"
                            onChangeText={(text) => setRestaurant({...restaurant, lat: text})}
                        />
                    </View>
                    <View style={styles.halfWidth}>
                        <Text style={[styles.label, { color: theme.text }]}>Longitude *</Text>
                        <TextInput 
                            style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                            value={restaurant.lng} 
                            placeholderTextColor={theme.textMuted}
                            keyboardType="numeric"
                            onChangeText={(text) => setRestaurant({...restaurant, lng: text})}
                        />
                    </View>
                </View>

                <Text style={[styles.label, { color: theme.text }]}>Description (Optional)</Text>
                <TextInput 
                    style={[styles.input, styles.textArea, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                    value={restaurant.description} 
                    placeholderTextColor={theme.textMuted}
                    multiline
                    numberOfLines={4}
                    onChangeText={(text) => setRestaurant({...restaurant, description: text})}
                />

                <Text style={[styles.label, { color: theme.text }]}>Phone Number (Optional)</Text>
                <TextInput 
                    style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                    value={restaurant.phone} 
                    placeholderTextColor={theme.textMuted}
                    keyboardType="phone-pad"
                    onChangeText={(text) => setRestaurant({...restaurant, phone: text})}
                />

                <Text style={[styles.label, { color: theme.text }]}>Cover Image URL (Optional)</Text>
                <TextInput 
                    style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                    value={restaurant.coverImage} 
                    placeholderTextColor={theme.textMuted}
                    onChangeText={(text) => setRestaurant({...restaurant, coverImage: text})}
                />

                <View style={styles.promotionCard}>
                    <View style={styles.promotionTextContainer}>
                        <Text style={styles.promotionTitle}>⭐ Promote Your Restaurant</Text>
                        <Text style={styles.promotionSub}>Notice: promoting your restaurant costs 199.90₪ a month.</Text>
                    </View>
                    <Switch
                        value={restaurant.isPromoted}
                        placeholderTextColor={theme.textMuted}
                        onValueChange={(val) => setRestaurant({...restaurant, isPromoted: val})}
                        trackColor={{ false: "#d3d3d3", true: "#ffc107" }}
                        thumbColor={restaurant.isPromoted ? "#ffffff" : "#f4f3f4"}
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                    style={styles.submitButton} 
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.submitButton, { backgroundColor: '#f0f0f0', marginTop: 10 }]} 
                    onPress={() => navigation.goBack()}
                    disabled={isSaving}
                >
                    <Text style={[styles.submitButtonText, { color: '#333' }]}>Cancel</Text>
                </TouchableOpacity>
                </View>

            </View>
        </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingBottom: 15, paddingTop: 45, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
    backButton: { width: 60 },
    backButtonText: { color: '#00c2e8', fontWeight: 'bold', fontSize: 16 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#212529' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    formCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
    subtitle: { color: '#6c757d', marginBottom: 20, fontSize: 14, textAlign: 'center'},
    label: { fontSize: 14, fontWeight: 'bold', color: '#212529', marginBottom: 6 },
    input: { backgroundColor: '#f1f3f5', borderRadius: 10, paddingHorizontal: 15, height: 45, marginBottom: 15, color: '#000' },
    textArea: { height: 80, paddingTop: 12, textAlignVertical: 'top' },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    halfWidth: { width: '48%' },
    promotionCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff8e1', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#ffc107', marginVertical: 15 },
    promotionTextContainer: { flex: 1, paddingRight: 10 },
    promotionTitle: { fontSize: 15, fontWeight: 'bold', color: '#212529' },
    promotionSub: { fontSize: 12, color: '#6c757d', marginTop: 4 },
    submitButton: { backgroundColor: '#00c2e8', borderRadius: 25, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    buttonContainer: { flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', marginTop: 20 } 
});