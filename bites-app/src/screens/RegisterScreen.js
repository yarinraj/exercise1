import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    Image,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '../config/api';

const isPasswordValid = (pwd) => {
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);

    return pwd.length >= 8 && hasLetters && hasNumbers;
};

const RegisterScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [profileImage, setProfileImage] = useState(null);

    const [wasSubmitted, setWasSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const [usernameError, setUsernameError] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [confirmTouched, setConfirmTouched] = useState(false);

    const passwordIsValid = isPasswordValid(password);
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    useEffect(() => {
        const trimmedUsername = username.trim();

        if (!trimmedUsername) {
            setUsernameError('');
            setIsCheckingUsername(false);
            return;
        }

        const timeoutId = setTimeout(async () => {
            try {
                setIsCheckingUsername(true);

                const response = await fetch(
                    `${API_BASE_URL}/api/users/check-username/${encodeURIComponent(trimmedUsername)}`
                );

                const data = await response.json().catch(() => null);

                if (response.ok && data?.exists) {
                    setUsernameError('This username is already taken.');
                } else {
                    setUsernameError('');
                }
            } catch (error) {
                console.error('Username check error:', error);
                setUsernameError('Could not check username availability.');
            } finally {
                setIsCheckingUsername(false);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [username]);

    const handleImagePick = async () => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                Alert.alert('Permission required', 'Photo library permission is required.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.2,
                base64: true,
                legacy: true
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setProfileImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
            }
        } catch (error) {
            console.error('Image pick error:', error);
            Alert.alert('Error', 'Could not open photo library.');
        }
    };

    const handleTakePhoto = async () => {
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();

            if (!permission.granted) {
                Alert.alert('Permission required', 'Camera permission is required.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.2,
                base64: true
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setProfileImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
            }
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Error', 'Could not open camera.');
        }
    };

    const validateForm = () => {
        if (
            !username.trim() ||
            !displayName.trim() ||
            !password ||
            !confirmPassword ||
            !profileImage
        ) {
            return false;
        }

        if (usernameError) {
            return false;
        }

        if (!passwordIsValid) {
            return false;
        }

        if (!passwordsMatch) {
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        setWasSubmitted(true);
        setServerError('');

        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);

            const registerUrl = `${API_BASE_URL}/api/users`;

            console.log('Register URL:', registerUrl);
            console.log('Profile image length:', profileImage?.length);
            console.log('Register payload:', {
                username: username.trim(),
                passwordLength: password.length,
                displayName: displayName.trim(),
                hasProfileImage: !!profileImage,
                role
            });

            const response = await fetch(registerUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password,
                    displayName: displayName.trim(),
                    profileImage,
                    role
                })
            });

            console.log('Register status:', response.status);

            const data = await response.json().catch((error) => {
                console.log('Could not parse response JSON:', error);
                return null;
            });

            console.log('Register response data:', data);

            if (response.ok) {
                Alert.alert(
                    'Success',
                    'Registered successfully! Please log in.',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('Login')
                        }
                    ]
                );

                return;
            }

            setServerError(
                data?.error ||
                data?.message ||
                `Registration failed. Status: ${response.status}`
            );
        } catch (error) {
            console.error('Register error:', error);
            setServerError('Network error. Please check if the server is running.');
        } finally {
            setIsLoading(false);
        }
    };

    const usernameInvalid = (wasSubmitted && !username.trim()) || !!usernameError;
    const displayNameInvalid = wasSubmitted && !displayName.trim();

    const passwordInvalid =
        (wasSubmitted || passwordTouched || password.length > 0) &&
        password.length > 0 &&
        !passwordIsValid;

    const confirmInvalid =
        (wasSubmitted || confirmTouched || confirmPassword.length > 0) &&
        confirmPassword.length > 0 &&
        !passwordsMatch;

    const imageInvalid = wasSubmitted && !profileImage;

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.logo}>bites</Text>

                <Text style={styles.title}>Sign Up to bites</Text>

                <Text style={styles.subtitle}>
                    Create your account and start ordering delicious food.
                </Text>

                <View style={styles.card}>
                    {serverError ? (
                        <View style={styles.serverErrorBox}>
                            <Text style={styles.serverErrorText}>⚠️ {serverError}</Text>
                        </View>
                    ) : null}

                    <Text style={styles.label}>USERNAME</Text>
                    <TextInput
                        style={[styles.input, usernameInvalid && styles.inputError]}
                        placeholder="Choose a username"
                        value={username}
                        onChangeText={(text) => {
                            setUsername(text);
                            setUsernameError('');
                            setServerError('');
                        }}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    {isCheckingUsername && (
                        <Text style={styles.hintText}>Checking username...</Text>
                    )}

                    {wasSubmitted && !username.trim() && (
                        <Text style={styles.errorText}>Username is required.</Text>
                    )}

                    {usernameError ? (
                        <Text style={styles.errorText}>{usernameError}</Text>
                    ) : null}

                    <Text style={styles.label}>DISPLAY NAME</Text>
                    <TextInput
                        style={[styles.input, displayNameInvalid && styles.inputError]}
                        placeholder="Enter your public name"
                        value={displayName}
                        onChangeText={(text) => {
                            setDisplayName(text);
                            setServerError('');
                        }}
                    />

                    {displayNameInvalid && (
                        <Text style={styles.errorText}>Display name is required.</Text>
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

                    <Text
                        style={[
                            styles.hintText,
                            passwordInvalid && styles.errorText
                        ]}
                    >
                        Password must be at least 8 characters and include both letters and numbers.
                    </Text>

                    <Text style={styles.label}>CONFIRM PASSWORD</Text>
                    <TextInput
                        style={[styles.input, confirmInvalid && styles.inputError]}
                        placeholder="Repeat your password"
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            setServerError('');
                        }}
                        onBlur={() => setConfirmTouched(true)}
                        secureTextEntry
                    />

                    {confirmInvalid && (
                        <Text style={styles.errorText}>Passwords do not match.</Text>
                    )}

                    <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
                        <Text style={styles.imageButtonText}>
                            {profileImage ? '✓ Image Selected' : '📸 Choose profile picture'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.imageButton} onPress={handleTakePhoto}>
                        <Text style={styles.imageButtonText}>📷 Take photo</Text>
                    </TouchableOpacity>

                    {imageInvalid && (
                        <Text style={styles.errorText}>Profile image is required.</Text>
                    )}

                    {profileImage && (
                        <Image source={{ uri: profileImage }} style={styles.preview} />
                    )}

                    <Text style={styles.label}>SIGN UP AS</Text>

                    <View style={styles.roleContainer}>
                        <TouchableOpacity
                            style={[
                                styles.roleBtn,
                                role === 'customer' && styles.activeRole
                            ]}
                            onPress={() => setRole('customer')}
                        >
                            <Text
                                style={[
                                    styles.roleText,
                                    role === 'customer' && styles.activeRoleText
                                ]}
                            >
                                Hungry Customer
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.roleBtn,
                                role === 'owner' && styles.activeRole
                            ]}
                            onPress={() => setRole('owner')}
                        >
                            <Text
                                style={[
                                    styles.roleText,
                                    role === 'owner' && styles.activeRoleText
                                ]}
                            >
                                Business Owner
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.submitBtn,
                            (isLoading || isCheckingUsername) && styles.disabledButton
                        ]}
                        onPress={handleRegister}
                        disabled={isLoading || isCheckingUsername}
                    >
                        <Text style={styles.btnText}>
                            {isLoading
                                ? 'Registering...'
                                : isCheckingUsername
                                    ? 'Checking username...'
                                    : 'Register Now'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginLinkText}>
                            Already have an account? Login
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#f8f5ef'
    },
    container: {
        padding: 24,
        paddingTop: 56,
        paddingBottom: 40
    },
    logo: {
        fontSize: 44,
        fontWeight: '900',
        color: '#00c2e8',
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 12
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#202125',
        textAlign: 'center',
        marginBottom: 8
    },
    subtitle: {
        color: '#7b8490',
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 24
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 26,
        padding: 22,
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
    hintText: {
        color: '#7b8490',
        fontSize: 12,
        marginTop: 5,
        marginBottom: 4
    },
    imageButton: {
        padding: 15,
        backgroundColor: '#f0f8fb',
        alignItems: 'center',
        borderRadius: 14,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#d6f3f8'
    },
    imageButtonText: {
        fontWeight: '700',
        color: '#202125'
    },
    preview: {
        width: 104,
        height: 104,
        alignSelf: 'center',
        marginTop: 14,
        borderRadius: 52,
        borderWidth: 3,
        borderColor: '#00c2e8'
    },
    roleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
        marginBottom: 20
    },
    roleBtn: {
        paddingVertical: 14,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#dfe3e8',
        borderRadius: 14,
        width: '48%',
        alignItems: 'center',
        backgroundColor: '#ffffff'
    },
    activeRole: {
        backgroundColor: '#00c2e8',
        borderColor: '#00c2e8'
    },
    roleText: {
        color: '#202125',
        fontWeight: '800',
        fontSize: 13,
        textAlign: 'center'
    },
    activeRoleText: {
        color: '#ffffff'
    },
    submitBtn: {
        backgroundColor: '#00c2e8',
        padding: 16,
        borderRadius: 18,
        alignItems: 'center'
    },
    disabledButton: {
        opacity: 0.65
    },
    btnText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 16
    },
    loginLink: {
        alignItems: 'center',
        marginTop: 18
    },
    loginLinkText: {
        color: '#00a6c8',
        fontWeight: '800'
    }
});

export default RegisterScreen;