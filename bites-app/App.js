// Mandatory! Must be the first line in the file for drawer gestures to work
import 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { Colors } from './src/config/Colors'; // Imported from config folder
import React, { useState } from 'react';
import { Alert, Switch, View, Text } from 'react-native';
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
import FloatingCartIcon from './src/components/FloatingCartIcon';

// Import all application screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import WelcomeScreen from './src/screens/WelcomeScreen'; 
import HomeScreen from './src/screens/HomeScreen';       
import RestaurantMenu from './src/screens/RestaurantMenu';
import OwnerDashboard from './src/screens/OwnerDashboard';
import RestaurantSetupScreen from './src/screens/RestaurantSetupScreen';
import EditRestaurantScreen from './src/screens/EditRestaurantScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';

import { createNavigationContainerRef } from '@react-navigation/native';
export const navigationRef = createNavigationContainerRef();

// Initialize the stack navigator
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// --- Custom Drawer Content with Dynamic Theme Layout ---
const CustomDrawerContent = (props) => {
  const { onLogout, user } = props;
  
  // Get active theme state and color palette
  const { isDark, toggleTheme } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  
  const isGuest = !user;

  const handleAuthAction = () => {
    if (isGuest) {
      props.navigation.replace('Login');
    } else {
      Alert.alert('Logout', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout }
      ]);
    }
  };

  return (
    // Style applied directly to the ScrollView container background
    <DrawerContentScrollView {...props} style={{ backgroundColor: theme.background }}>
      <DrawerItemList {...props} />

      {/* Theme Toggle Container with dynamic border */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        marginTop: 10
      }}>
        {/* Dynamic text color prevents it from disappearing in dark mode */}
        <Text style={{
          fontWeight: 'bold',
          color: theme.text
        }}>
          Dark Mode
        </Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: '#7b8490', true: '#00c2e8' }}
          thumbColor={'#ffffff'}
        />
      </View>

      {/* Dynamic Action Button */}
      <DrawerItem
        label={isGuest ? "Login" : "Logout"}
        onPress={handleAuthAction}
        labelStyle={{
          color: isGuest ? '#00c2e8' : theme.danger,
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

  // --- Drawer Navigator Wrapper with Dynamic screenOptions ---
  const DrawerNavigator = ({ navigation }) => {
    // Access the current theme inside the navigator wrapper
    const { isDark } = useTheme();
    const theme = isDark ? Colors.dark : Colors.light;

    return (
      <Drawer.Navigator
        drawerContent={(props) => (
          <CustomDrawerContent
            {...props}
            user={user}
            onLogout={() => handleLogout(navigation)}
          />
        )}
        screenOptions={{
          // Dynamic Header configuration
          headerStyle: { backgroundColor: theme.card },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '900' },
          
          // Dynamic Drawer side panel navigation look
          drawerStyle: { backgroundColor: theme.background, width: 240 },
          drawerActiveTintColor: '#00c2e8',
          drawerInactiveTintColor: theme.text,
          drawerLabelStyle: { fontWeight: '700' }
        }}
      >
        <Drawer.Screen
          name="Welcome"
          options={{ title: 'Home', drawerLabel: 'Home' }}
        >
          {(props) => <WelcomeScreen {...props} user={user} />}
        </Drawer.Screen>

        <Drawer.Screen
          name="Home"
          options={{ title: 'Restaurants', drawerLabel: 'Restaurants' }}
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
    <ThemeProvider user={user}>
      <CartProvider>
        <NavigationContainer ref={navigationRef}>
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

            <Stack.Screen name="RestaurantMenu">
              {(props) => <RestaurantMenu {...props} />}
            </Stack.Screen>

        <Stack.Screen name="RestaurantSetupScreen" >
          {(props) => <RestaurantSetupScreen {...props} />}
        </Stack.Screen>

        <Stack.Screen name="EditRestaurantScreen" >
          {(props) => <EditRestaurantScreen {...props} />}
        </Stack.Screen>
            <Stack.Screen name="Checkout">
              {(props) => <CheckoutScreen {...props} />}
            </Stack.Screen>
          </Stack.Navigator>

          <FloatingCartIcon />
        </NavigationContainer>
      </CartProvider>
    </ThemeProvider>
  );
}