// Mandatory! Must be the first line in the file for drawer gestures to work
import 'react-native-gesture-handler';

import React, { useState } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem
} from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import the cart context provider
import { CartProvider } from './src/context/CartContext';

// Import all application screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import WelcomeScreen from './src/screens/WelcomeScreen'; // The new Landing Page
import HomeScreen from './src/screens/HomeScreen';       // The Restaurants Feed
import RestaurantMenu from './src/screens/RestaurantMenu';
import OwnerDashboard from './src/screens/OwnerDashboard';
import RestaurantSetupScreen from './src/screens/RestaurantSetupScreen';
import EditRestaurantScreen from './src/screens/EditRestaurantScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// --- Custom Drawer Content with Guest Logic ---
const CustomDrawerContent = (props) => {
  const { onLogout, user } = props;
  
  // Check if current user is a guest (null)
  const isGuest = !user;

  const handleAuthAction = () => {
    if (isGuest) {
      // If guest, send them back to Login screen
      props.navigation.replace('Login');
    } else {
      // If logged in, prompt logout confirmation
      Alert.alert('Logout', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout }
      ]);
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />

      <DrawerItem
        label={isGuest ? "Login" : "Logout"}
        onPress={handleAuthAction}
        labelStyle={{
          color: isGuest ? '#00c2e8' : '#d62828', // Blue for Guest, Red for User
          fontWeight: 'bold'
        }}
      />
    </DrawerContentScrollView>
  );
};

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogout = async (stackNavigation) => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');

    setUser(null);

    stackNavigation.replace('Login');
  };

  // --- Drawer Navigator Wrapper ---
  const DrawerNavigator = ({ navigation }) => {
    return (
      <Drawer.Navigator
        drawerContent={(props) => (
          <CustomDrawerContent
            {...props}
            user={user} // Explicitly pass the user state here!
            onLogout={() => handleLogout(navigation)}
          />
        )}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff'
          },
          headerTintColor: '#202125',
          headerTitleStyle: {
            fontWeight: '900'
          },
          drawerActiveTintColor: '#00c2e8',
          drawerInactiveTintColor: '#202125',
          drawerLabelStyle: {
            fontWeight: '700'
          }
        }}
      >
        <Drawer.Screen
          name="Welcome"
          options={{
            title: 'Home',
            drawerLabel: 'Home'
          }}
        >
          {(props) => <WelcomeScreen {...props} user={user} />}
        </Drawer.Screen>

        <Drawer.Screen
          name="Home"
          options={{
            title: 'Restaurants',
            drawerLabel: 'Restaurants'
          }}
        >
          {(props) => <HomeScreen {...props} user={user} />}
        </Drawer.Screen>
        {user?.role === 'owner' && (
           <Drawer.Screen name="Owner Dashboard"> 
            {(props) => <OwnerDashboard {...props} user={user} />}
          </Drawer.Screen>
        )}
       
      </Drawer.Navigator>
    );
  };

  return (
  <CartProvider>
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} setUser={setUser} />}
        </Stack.Screen>

        <Stack.Screen name="Register">
          {(props) => <RegisterScreen {...props} />}
        </Stack.Screen>

        {/* Main application with Drawer */}
        <Stack.Screen name="MainApp" component={DrawerNavigator} />

        {/* Restaurant menu detail page - sits on top of the drawer */}
        <Stack.Screen name="RestaurantMenu" component={RestaurantMenu} />

        <Stack.Screen name="RestaurantSetupScreen" >
          {(props) => <RestaurantSetupScreen {...props} />}
        </Stack.Screen>

        <Stack.Screen name="EditRestaurantScreen" >
          {(props) => <EditRestaurantScreen {...props} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  </CartProvider>
  );
}