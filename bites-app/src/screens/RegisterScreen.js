import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // Required for profile image
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = () => {
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [profileImage, setProfileImage] = useState(null);

    // Password validation logic from your Web code
    const isPasswordValid = (pwd) => {
        const hasLetters = /[a-zA-Z]/.test(pwd);
        const hasNumbers = /\d/.test(pwd);
        return pwd.length >= 8 && hasLetters && hasNumbers;
    };

    const handleImagePick = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true, // Needed to match your Web logic (reader.readAsDataURL)
        });

        if (!result.canceled) {
            setProfileImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };
    const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
        Alert.alert('Permission required', 'Camera permission is required.');
        return;
    }

    const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
    });

    if (!result.canceled) {
        setProfileImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
};

    const handleRegister = async () => {
        // Validation logic
        if (!username || !displayName || !password || !confirmPassword || !profileImage) {
            Alert.alert('Error', 'All fields and profile image are required.');
            return;
        }
        if (!isPasswordValid(password)) {
            Alert.alert('Error', 'Password must be at least 8 chars with letters and numbers.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        try {
            const response = await fetch('http://10.0.2.2:3000/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, displayName, profileImage, role }),
            });

            if (response.ok) {
                Alert.alert('Success', 'Registered successfully!');
            } else {
                Alert.alert('Error', 'Registration failed on server.');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error.');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Sign Up to bites</Text>
            
            <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Display Name" value={displayName} onChangeText={setDisplayName} />
            <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <TextInput style={styles.input} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

            <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
                <Text>{profileImage ? '✓ Image Selected' : '📸 Choose profile picture'}</Text>
            </TouchableOpacity>
            {profileImage && <Image source={{ uri: profileImage }} style={styles.preview} />}

            <View style={styles.roleContainer}>
                <TouchableOpacity style={[styles.roleBtn, role === 'customer' && styles.active]} onPress={() => setRole('customer')}>
                    <Text>Hungry Customer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.roleBtn, role === 'owner' && styles.active]} onPress={() => setRole('owner')}>
                    <Text>Business Owner</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleRegister}>
                <Text style={styles.btnText}>Register Now</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 15, borderRadius: 8, marginBottom: 10 },
    imageButton: { padding: 15, backgroundColor: '#f0f0f0', alignItems: 'center', borderRadius: 8, marginBottom: 10 },
    preview: { width: 100, height: 100, alignSelf: 'center', marginBottom: 10, borderRadius: 50 },
    roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    roleBtn: { padding: 15, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, width: '48%' },
    active: { backgroundColor: '#00c2e8', borderColor: '#00c2e8' },
    submitBtn: { backgroundColor: '#00c2e8', padding: 15, borderRadius: 8, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold' }
});

export default RegisterScreen;