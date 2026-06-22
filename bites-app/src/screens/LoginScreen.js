import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// This is the initial screen for user authentication
const LoginScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Welcome to Bites App!</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default LoginScreen;