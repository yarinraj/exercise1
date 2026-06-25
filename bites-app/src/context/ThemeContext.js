import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children, user }) => {
    const systemColorScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

    useEffect(() => {
        const loadTheme = async () => {
            if (!user || !user.username) {
                setIsDark(systemColorScheme === 'dark');
                return;
            }
            
            try {
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

    // --- NEW: Function to force reset the theme to system default ---
    const resetTheme = () => {
        setIsDark(systemColorScheme === 'dark');
    };

    return (
        // Make sure to add resetTheme to the exported value here!
        <ThemeContext.Provider value={{ isDark, toggleTheme, resetTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);