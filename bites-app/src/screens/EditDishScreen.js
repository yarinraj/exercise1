import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../config/Colors';

const EditDishScreen = ({ route, navigation }) => {
    const { restaurantId, productId } = route.params || {};
    const { isDark } = useTheme();
    const theme = isDark ? Colors.dark : Colors.light;

    useLayoutEffect(() => {
            navigation.setOptions({
                headerStyle: { backgroundColor: theme.card },
                headerTintColor: theme.text,
            });
        }, [navigation, theme]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        image: ''
    });

    const [isFetching, setIsFetching] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchDish = async () => {
            if (!restaurantId || !productId) return;
            
            try {
                const response = await fetch(`${API_BASE_URL}/api/restaurants/${restaurantId}/products/${productId}`);
                if (!response.ok) throw new Error('Failed to fetch dish data');

                const data = await response.json();
                setFormData({
                    name: data.name || '',
                    description: data.description || '',
                    price: data.price ? data.price.toString() : '',
                    image: data.image || ''
                });
            } catch (error) {
                Alert.alert('Error', 'Failed to load dish data');
                navigation.goBack();
            } finally {
                setIsFetching(false);
            }
        };

        fetchDish();
    }, [restaurantId, productId]);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrorMsg('');
    };

    const handleSubmit = async () => {
        if (!formData.name.trim() || !formData.price.trim()) {
            setErrorMsg('Please fill in the required fields (*)');
            return;
        }

        if (formData.image.trim()) {
            const urlPattern = /^(https?:\/\/)/i;
            if (!urlPattern.test(formData.image.trim())) {
                setErrorMsg('Please enter a valid URL starting with http:// or https://');
                return;
            }
        }

        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('token');

            const response = await fetch(`${API_BASE_URL}/api/restaurants/${restaurantId}/products/${productId}`, {
                method: 'PATCH',
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
                Alert.alert('Success', 'Dish updated successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                const errorData = await response.json();
                setErrorMsg(errorData.error || 'Update failed');
            }
        } catch (error) {
            setErrorMsg('Server error, please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color="#00c2e8" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            style={[styles.container, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>Edit Dish</Text>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>Fields marked with * are required.</Text>
                </View>

                <View style={[styles.card, { backgroundColor: theme.card }]}>
                    {errorMsg ? <Text style={[styles.errorText, { color: theme.danger }]}>❌ {errorMsg}</Text> : null}

                    <Text style={[styles.label, { color: theme.text }]}>Dish Name *</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                        value={formData.name}
                        placeholderTextColor={theme.textMuted}
                        onChangeText={(text) => handleChange('name', text)}
                    />

                    <Text style={[styles.label, { color: theme.text }]}>Price (₪) *</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                        value={formData.price}
                        placeholderTextColor={theme.textMuted}
                        onChangeText={(text) => handleChange('price', text)}
                        keyboardType="numeric"
                    />

                    <Text style={[styles.label, { color: theme.text }]}>Description (Optional)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                        value={formData.description}
                        placeholderTextColor={theme.textMuted}
                        onChangeText={(text) => handleChange('description', text)}
                        multiline
                        numberOfLines={3}
                    />

                    <Text style={[styles.label, { color: theme.text }]}>Image URL (Optional)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                        value={formData.image}
                        placeholderTextColor={theme.textMuted}
                        onChangeText={(text) => handleChange('image', text)}
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
                            <Text style={styles.submitText}>Update Dish</Text>
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

export default EditDishScreen;