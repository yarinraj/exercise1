import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

const LoginScreen = ({ navigation, setUser }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [wasSubmitted, setWasSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setWasSubmitted(true);

        if (!username.trim() || !password) {
            Alert.alert('Login failed', 'Please enter both username and password.');
            return;
        }

        try {
            setIsLoading(true);

            const response = await fetch(`${API_BASE_URL}/api/tokens`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password
                })
            });

            const data = await response.json().catch(() => null);

            if (!response.ok || !data?.token) {
                Alert.alert(
                    'Login failed',
                    data?.error || 'Invalid username or password.'
                );
                return;
            }

            const loggedInUser = {
                username: username.trim()
            };

            await AsyncStorage.setItem('token', data.token);
            await AsyncStorage.setItem('user', JSON.stringify(loggedInUser));

            if (setUser) {
                setUser(loggedInUser);
            }

            Alert.alert('Success', 'Logged in successfully.');
            navigation.replace('Home');
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert(
                'Network error',
                'Login failed. Please check that the server is running.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const usernameInvalid = wasSubmitted && !username.trim();
    const passwordInvalid = wasSubmitted && !password;

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.logoArea}>
                <Text style={styles.logo}>bites</Text>
                <Text style={styles.title}>Welcome Back!</Text>
                <Text style={styles.subtitle}>Log in to continue your delicious journey.</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>USERNAME</Text>
                <TextInput
                    style={[styles.input, usernameInvalid && styles.inputError]}
                    placeholder="Enter your username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {usernameInvalid && (
                    <Text style={styles.errorText}>Username is required.</Text>
                )}

                <Text style={styles.label}>PASSWORD</Text>
                <TextInput
                    style={[styles.input, passwordInvalid && styles.inputError]}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                {passwordInvalid && (
                    <Text style={styles.errorText}>Password is required.</Text>
                )}

                <TouchableOpacity
                    style={[styles.submitButton, isLoading && styles.disabledButton]}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    <Text style={styles.submitText}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text style={styles.linkText}>Don&apos;t have an account? Sign up</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#f8f5ef',
        justifyContent: 'center',
        padding: 24
    },
    logoArea: {
        alignItems: 'center',
        marginBottom: 28
    },
    logo: {
        fontSize: 46,
        fontWeight: '900',
        color: '#00c2e8',
        fontStyle: 'italic',
        marginBottom: 18
    },
    title: {
        fontSize: 30,
        fontWeight: '900',
        color: '#202125',
        marginBottom: 8
    },
    subtitle: {
        color: '#7b8490',
        fontSize: 15,
        textAlign: 'center'
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 26,
        padding: 24,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 5
    },
    label: {
        fontSize: 13,
        fontWeight: '800',
        color: '#202125',
        marginBottom: 8,
        marginTop: 10
    },
    input: {
        borderWidth: 1,
        borderColor: '#dfe3e8',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        backgroundColor: '#ffffff'
    },
    inputError: {
        borderColor: '#ff4a4a',
        backgroundColor: '#fff5f5'
    },
    errorText: {
        color: '#ff4a4a',
        fontSize: 12,
        marginTop: 5
    },
    submitButton: {
        backgroundColor: '#00c2e8',
        paddingVertical: 15,
        borderRadius: 18,
        alignItems: 'center',
        marginTop: 24
    },
    disabledButton: {
        opacity: 0.65
    },
    submitText: {
        color: '#ffffff',
        fontWeight: '900',
        fontSize: 16
    },
    linkButton: {
        alignItems: 'center',
        marginTop: 18
    },
    linkText: {
        color: '#00a6c8',
        fontWeight: '700'
    }
});

export default LoginScreen;