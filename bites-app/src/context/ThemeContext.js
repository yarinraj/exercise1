import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the context
export const ThemeContext = createContext();

// Create the provider component
export const ThemeProvider = ({ children, user }) => {
    const systemColorScheme = useColorScheme(); // Gets the OS default (dark/light)
    const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

    // Load saved theme when the component mounts or user changes
    useEffect(() => {
        const loadTheme = async () => {
            if (!user || !user.username) {
                // For guests, default to system preference
                setIsDark(systemColorScheme === 'dark');
                return;
            }
            
            try {
                // Use a user-specific key to prevent theme conflicts between different accounts
                const savedTheme = await AsyncStorage.getItem(`theme_${user.username}`);
                if (savedTheme !== null) {
                    setIsDark(savedTheme === 'dark');
                } else {
                    setIsDark(systemColorScheme === 'dark');
                }
            } catch (error) {
                console.error("Error loading theme preference:", error);
            }
        };
        loadTheme();
    }, [user, systemColorScheme]);

    // Function to toggle and save the theme
    const toggleTheme = async () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        
        if (user && user.username) {
            try {
                await AsyncStorage.setItem(`theme_${user.username}`, newTheme ? 'dark' : 'light');
            } catch (error) {
                console.error("Error saving theme preference:", error);
            }
        }
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook to easily use the theme in any screen
export const useTheme = () => useContext(ThemeContext);  