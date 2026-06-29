import React, { useState } from 'react';
import { 
    StyleSheet, Text, View, TextInput, TouchableOpacity, 
    ScrollView, Alert, Switch, SafeAreaView, ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../config/Colors';

export default function RestaurantSetupScreen() {
    const navigation = useNavigation();
    const { isDark } = useTheme();
    const theme = isDark ? Colors.dark : Colors.light;

    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        cuisine: '',
        description: '',
        phone: '',
        image: '',
        lat: '',
        lng: '',
        isPromoted: false
    });

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.name || !formData.address || !formData.cuisine || formData.lat === '' || formData.lng === '') {
            Alert.alert('Missing Info', 'Please fill in all required fields: Name, Address, Cuisine, Latitude, Longitude.');
            return false;
        }

        if (formData.image) {
            const urlPattern = /^(https?:\/\/)/i;
            if (!urlPattern.test(formData.image)) {
                Alert.alert('Invalid URL', 'Please enter a valid image URL starting with http:// or https://');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'You are not logged in.');
                setIsLoading(false);
                return;
            }

            const payload = {
                ...formData,
                lat: parseFloat(formData.lat),
                lng: parseFloat(formData.lng)
            };

            const response = await fetch(`${API_BASE_URL}/api/restaurants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                Alert.alert('Success!', 'Restaurant created successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() } 
                ]);
            } else {
                const errorData = await response.json().catch(() => null);
                Alert.alert('Error', errorData?.error || errorData?.message || 'Failed to create restaurant.');
            }
        } catch (error) {
            console.error('Create restaurant error:', error);
            Alert.alert('Error', 'Server error, please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.card }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Create Restaurant</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.formCard, { backgroundColor: theme.card }]}>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>Fields marked with * are required.</Text>

                    <Text style={[styles.label, { color: theme.text }]}>Restaurant Name *</Text>
                    <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]} value={formData.name} placeholderTextColor={theme.textMuted} onChangeText={(val) => handleChange('name', val)} placeholder="Enter restaurant name" />

                    <Text style={[styles.label, { color: theme.text }]}>Address *</Text>
                    <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]} value={formData.address} placeholderTextColor={theme.textMuted} onChangeText={(val) => handleChange('address', val)} placeholder="Full address" />

                    <Text style={[styles.label, { color: theme.text }]}>Cuisine Type *</Text>
                    <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]} value={formData.cuisine} placeholderTextColor={theme.textMuted} onChangeText={(val) => handleChange('cuisine', val)} placeholder="e.g., Italian, Sushi, Burger" />

                    <View style={styles.row}>
                        <View style={styles.halfWidth}>
                            <Text style={[styles.label, { color: theme.text }]}>Latitude *</Text>
                            <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]} value={formData.lat} placeholderTextColor={theme.textMuted} onChangeText={(val) => handleChange('lat', val)} placeholder="32.0853" keyboardType="numeric" />
                        </View>
                        <View style={styles.halfWidth}>
                            <Text style={[styles.label, { color: theme.text }]}>Longitude *</Text>
                            <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]} value={formData.lng} placeholderTextColor={theme.textMuted} onChangeText={(val) => handleChange('lng', val)} placeholder="34.7818" keyboardType="numeric" />
                        </View>
                    </View>

                    <Text style={[styles.label, { color: theme.text }]}>Description (Optional)</Text>
                    <TextInput   
                    style={[styles.input, styles.textArea, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]} 
                    value={formData.description} 
                    placeholderTextColor={theme.textMuted}
                    onChangeText={(val) => handleChange('description', val)} placeholder="Tell us about your place" multiline numberOfLines={3} />

                    <Text style={[styles.label, { color: theme.text }]}>Phone Number (Optional)</Text>
                    <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]} value={formData.phone} placeholderTextColor={theme.textMuted} onChangeText={(val) => handleChange('phone', val)} placeholder="Phone number" keyboardType="phone-pad" />

                    <Text style={[styles.label, { color: theme.text }]}>Cover Image URL (Optional)</Text>
                    <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]} value={formData.image} placeholderTextColor={theme.textMuted} onChangeText={(val) => handleChange('image', val)} placeholder="https://example.com/cover.jpg" keyboardType="url" autoCapitalize="none" />

                    <View style={styles.promotionCard}>
                        <View style={styles.promotionTextContainer}>
                            <Text style={styles.promotionTitle}>⭐ Promote Your Restaurant</Text>
                            <Text style={styles.promotionSub}>Notice: promoting your restaurant costs 199.90₪ a month.</Text>
                        </View>
                        <Switch
                            value={formData.isPromoted}
                            onValueChange={(val) => handleChange('isPromoted', val)}
                            trackColor={{ false: '#d3d3d3', true: '#ffc107' }}
                            thumbColor={formData.isPromoted ? '#ffffff' : '#f4f3f4'}
                        />
                    </View>

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Create Restaurant</Text>
                        )}
                    </TouchableOpacity>
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
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});