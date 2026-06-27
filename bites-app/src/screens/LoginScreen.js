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
import { useCart } from '../context/CartContext';

const base64UrlDecode = (base64Url) => {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    while (base64.length % 4) {
        base64 += '=';
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';

    for (let block = 0, charCode, idx = 0, map = chars; base64.charAt(idx | 0) || (map = '=', idx % 1); output += String.fromCharCode(255 & (block >> ((-2 * idx) & 6)))) {
        charCode = map.indexOf(base64.charAt(idx += 3 / 4));

        if (charCode < 0) {
            throw new Error('Invalid base64 string');
        }

        block = (block << 6) | charCode;
    }

    try {
        return decodeURIComponent(
            output
                .split('')
                .map((char) => {
                    return `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`;
                })
                .join('')
        );
    } catch {
        return output;
    }
};

const decodeJwtPayload = (token) => {
    const payload = token.split('.')[1];

    if (!payload) {
        throw new Error('Invalid token structure');
    }

    return JSON.parse(base64UrlDecode(payload));
};

const LoginScreen = ({ navigation, setUser }) => {
    const { refreshCartKey } = useCart();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [wasSubmitted, setWasSubmitted] = useState(false);
    const [usernameTouched, setUsernameTouched] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const usernameTrimmed = username.trim();

    const usernameInvalid =
        (wasSubmitted || usernameTouched) &&
        usernameTrimmed.length === 0;

    const passwordInvalid =
        (wasSubmitted || passwordTouched) &&
        password.length === 0;

    const isFormValid = usernameTrimmed.length > 0 && password.length > 0;
    // Handle guest login - bypass authentication and navigate to the main app
  const handleGuestLogin = async () => {
    // Ensure user state is explicitly null for guest mode
    await AsyncStorage.removeItem('user'); 
    await refreshCartKey();
    
    // Navigate directly to the Drawer navigator wrapper
    navigation.replace('MainApp');
  };

    const handleLogin = async () => {
        setWasSubmitted(true);
        setServerError('');

        if (!isFormValid) {
            return;
        }

        try {
            setIsLoading(true);

            const loginUrl = `${API_BASE_URL}/api/tokens`;

            console.log('Login URL:', loginUrl);
            console.log('Login payload:', {
                username: usernameTrimmed,
                passwordLength: password.length
            });

            const tokenResponse = await fetch(loginUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: usernameTrimmed,
                    password
                })
            });

            console.log('Login status:', tokenResponse.status);

            const tokenData = await tokenResponse.json().catch((error) => {
                console.log('Could not parse login response JSON:', error);
                return null;
            });

            console.log('Login response data:', tokenData);

            if (!tokenResponse.ok || !tokenData?.token) {
                setServerError(
                    tokenData?.error ||
                    tokenData?.message ||
                    'Invalid username or password.'
                );
                return;
            }

            const token = tokenData.token;

            const loggedInUser = {
                _id: tokenData.user._id,
                username: tokenData.user.username,
                displayName: tokenData.user.displayName,
                role: tokenData.user.role || 'customer',
                profileImage: '' 
            };

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(loggedInUser));
            await refreshCartKey();

            if (setUser) {
                setUser(loggedInUser);
            }

            Alert.alert('Success', 'Logged in successfully.', [
                {
                    text: 'OK',
                    onPress: () => navigation.replace('MainApp')
                }
            ]);
            } catch (error) {
            console.error('Login error:', error);
            setServerError('Network error. Please check that the server is running.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.logoArea}>
                <Text style={styles.logo}>bites</Text>

                <Text style={styles.title}>Welcome Back!</Text>

                <Text style={styles.subtitle}>
                    Log in to continue your delicious journey.
                </Text>
            </View>
            {/* Guest Login Button */}
        <TouchableOpacity 
          onPress={handleGuestLogin} 
          style={{ marginTop: 20, alignItems: 'center', padding: 10 }}
        >
          <Text style={{ color: '#00c2e8', fontWeight: 'bold', fontSize: 16 }}>
            Continue as Guest
          </Text>
        </TouchableOpacity>

            <View style={styles.card}>
                {serverError ? (
                    <View style={styles.serverErrorBox}>
                        <Text style={styles.serverErrorText}>⚠️ {serverError}</Text>
                    </View>
                ) : null}

                <Text style={styles.label}>USERNAME</Text>
                <TextInput
                    style={[styles.input, usernameInvalid && styles.inputError]}
                    placeholder="Enter your username"
                    value={username}
                    onChangeText={(text) => {
                        setUsername(text);
                        setServerError('');
                    }}
                    onBlur={() => setUsernameTouched(true)}
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
                    onChangeText={(text) => {
                        setPassword(text);
                        setServerError('');
                    }}
                    onBlur={() => setPasswordTouched(true)}
                    secureTextEntry
                />

                {passwordInvalid && (
                    <Text style={styles.errorText}>Password is required.</Text>
                )}

                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        isLoading && styles.disabledButton
                    ]}
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
                    <Text style={styles.linkText}>
                        Don&apos;t have an account? Sign up
                    </Text>
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
    serverErrorBox: {
        backgroundColor: '#fff5f5',
        borderWidth: 1,
        borderColor: '#ffb3b3',
        borderRadius: 14,
        padding: 12,
        marginBottom: 14
    },
    serverErrorText: {
        color: '#d62828',
        fontWeight: '700'
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
        marginTop: 5,
        marginBottom: 4
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