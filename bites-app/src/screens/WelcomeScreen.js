import React, { useRef, useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ImageBackground, 
    Animated, 
    Easing,
    Dimensions
} from 'react-native';

// Get screen dimensions for responsive layout
const { height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation, user }) => {
    // Animation system for spinning the center logo
    const spinValue = useRef(new Animated.Value(0)).current;
    const [isSpinning, setIsSpinning] = useState(false);

    const handleLogoSpin = () => {
        // Prevent multiple clicks while the animation is running
        if (isSpinning) return; 
        setIsSpinning(true);

        // Reset animation value
        spinValue.setValue(0);
        
        // Start rotation animation
        Animated.timing(spinValue, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease), // Smooth easing similar to CSS
            useNativeDriver: true, // Crucial for smooth performance on mobile
        }).start(() => setIsSpinning(false));
    };

    // Interpolate animation value (0 to 1) into degrees (0deg to 360deg)
    const spin = spinValue.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: ['0deg', '90deg', '180deg', '270deg', '360deg']
    });

    return (
        <View style={styles.container}>
            <ImageBackground 
                // IMPORTANT: Ensure 'homepage4.png' is copied from 'wolt-frontend/public' 
                // and placed into the Expo 'assets' folder.
                source={require('../../assets/homepage4.png')} 
                style={styles.background}
                resizeMode="cover"
            >
                {/* Semi-transparent white gradient overlay */}
                <View style={styles.overlay} />

                {/* Top Title Card */}
                <View style={styles.titleCard}>
                    <Text style={styles.title}>Welcome!</Text>
                    <Text style={styles.subtitle}>
                        {user 
                            ? 'This is your main Dashboard / Home Page.' 
                            : 'Explore restaurants and order your favorite food.'}
                    </Text>
                </View>

                {/* Clickable and Spinning Center Logo */}
                <View style={styles.logoWrapper}>
                    <TouchableOpacity activeOpacity={0.9} onPress={handleLogoSpin}>
                        <Animated.Image 
                            // Ensure 'icon.png' is in the 'assets' folder
                            source={require('../../assets/icon.png')} 
                            style={[styles.logo, { transform: [{ rotateY: spin }] }]} 
                        />
                    </TouchableOpacity>
                </View>

                {/* Bottom Action Buttons */}
                <View style={styles.actionsCard}>
                    <TouchableOpacity 
                        style={styles.button} 
                        // Navigates to the restaurant feed screen
                        onPress={() => navigation.navigate('Home')} 
                    >
                        <Text style={styles.buttonText}>Go to Restaurants Feed</Text>
                    </TouchableOpacity>

                    {/* Show only if the logged-in user is an owner */}
                    {user?.role === 'owner' && (
                        <TouchableOpacity 
                            style={styles.button} 
                            onPress={() => navigation.navigate('Owner Dashboard')}
                        >
                            <Text style={styles.buttonText}>My Restaurants</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.22)', 
    },
    titleCard: {
        position: 'absolute',
        top: height * 0.1, 
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 24,
        zIndex: 2,
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#202125',
        marginBottom: 8,
        textShadowColor: 'rgba(255, 255, 255, 0.95)',
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 14,
    },
    subtitle: {
        fontSize: 18,
        color: '#5f6872',
        textAlign: 'center',
        textShadowColor: 'rgba(255, 255, 255, 0.95)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    logoWrapper: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [
            { translateX: -115 }, 
            { translateY: -115 }  
        ],
        zIndex: 4,
    },
    logo: {
        width: 230,
        height: 230,
        resizeMode: 'contain',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
    },
    actionsCard: {
        position: 'absolute',
        bottom: 50,
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 24,
        zIndex: 3,
    },
    button: {
        backgroundColor: '#00c2e8', 
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 50, 
        width: '80%',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 5, 
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default WelcomeScreen;