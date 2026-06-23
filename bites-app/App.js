import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import all application screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import WelcomeScreen from './src/screens/WelcomeScreen'; // The new Landing Page
import HomeScreen from './src/screens/HomeScreen';       // The Restaurants Feed

// Initialize the stack navigator
const Stack = createNativeStackNavigator();

export default function App() {
  // Global state to hold the logged-in user's details
  const [user, setUser] = useState(null);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false // Hide the default top navigation bar for all screens
        }}
      >
        {/* Authentication Screens */}
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} setUser={setUser} />}
        </Stack.Screen>

        <Stack.Screen name="Register">
          {(props) => <RegisterScreen {...props} />}
        </Stack.Screen>

        {/* Main Application Screens */}
        
        {/* Step 1: The Landing / Welcome Page */}
        <Stack.Screen name="Welcome">
          {(props) => <WelcomeScreen {...props} user={user} />}
        </Stack.Screen>

        {/* Step 2: The Restaurants Feed */}
        <Stack.Screen name="Home">
          {(props) => <HomeScreen {...props} user={user} />}
        </Stack.Screen>

      </Stack.Navigator>
    </NavigationContainer>
  );
}