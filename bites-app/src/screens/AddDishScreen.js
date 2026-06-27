import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

const AddDishScreen = ({ route, navigation }) => {
    const { restaurantId } = route.params || {};

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        image: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrorMsg(''); 
    };

    const handleSubmit = async () => {
        if (!formData.name.trim() || !formData.price.trim()) {
            setErrorMsg('Please fill in the required fields (Name, Price)!');
            return;
        }

        if (formData.image.trim()) {
            const urlPattern = /^(https?:\/\/)/i;
            if (!urlPattern.test(formData.image.trim())) {
                setErrorMsg('Please enter a valid URL starting with http:// or https://');
                return;
            }
        }

        if (!restaurantId) {
            Alert.alert('Error', 'Restaurant ID is missing.');
            return;
        }

        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('token');

            const response = await fetch(`${API_BASE_URL}/api/restaurants/${restaurantId}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                    price: Number(formData.price),
                    image: formData.image.trim()
                })
            });

            if (response.ok) {
                Alert.alert('Success', 'Dish added successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                const errorData = await response.json();
                setErrorMsg(errorData.error || 'Failed to add dish');
            }
        } catch (error) {
            setErrorMsg('Server error, please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Add New Dish</Text>
                    <Text style={styles.subtitle}>Fields marked with * are required.</Text>
                </View>

                <View style={styles.card}>
                    {errorMsg ? <Text style={styles.errorText}>❌ {errorMsg}</Text> : null}

                    <Text style={styles.label}>Dish Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.name}
                        onChangeText={(text) => handleChange('name', text)}
                        placeholder="Enter dish name"
                    />

                    <Text style={styles.label}>Price (₪) *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.price}
                        onChangeText={(text) => handleChange('price', text)}
                        placeholder="0"
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Description (Optional)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.description}
                        onChangeText={(text) => handleChange('description', text)}
                        placeholder="Enter description"
                        multiline
                        numberOfLines={3}
                    />

                    <Text style={styles.label}>Image URL (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.image}
                        onChangeText={(text) => handleChange('image', text)}
                        placeholder="https://example.com/image.jpg"
                        keyboardType="url"
                        autoCapitalize="none"
                    />

                    <TouchableOpacity 
                        style={[styles.submitButton, isLoading && styles.disabledButton]} 
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitText}>Add Dish</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f5ef' },
    scrollContent: { padding: 24, flexGrow: 1, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 28, fontWeight: '900', color: '#202125' },
    subtitle: { fontSize: 14, color: '#7b8490', marginTop: 4 },
    card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 },
    label: { fontSize: 13, fontWeight: '800', color: '#202125', marginTop: 16, marginBottom: 8 },
    input: { borderWidth: 1, borderColor: '#dfe3e8', borderRadius: 12, padding: 14, fontSize: 15, backgroundColor: '#fff' },
    textArea: { height: 80, textAlignVertical: 'top' },
    submitButton: { backgroundColor: '#00c2e8', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 24 },
    disabledButton: { opacity: 0.7 },
    submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    errorText: { color: '#d62828', marginBottom: 10, textAlign: 'center', fontWeight: '600' }
});

export default AddDishScreen;