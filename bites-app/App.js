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

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import WelcomeScreen from './src/screens/WelcomeScreen'; // The new Landing Page
import HomeScreen from './src/screens/HomeScreen';       // The Restaurants Feed
import RestaurantMenu from './src/screens/RestaurantMenu';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const { onLogout } = props;

  const handleLogoutPress = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: onLogout
      }
    ]);
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />

      <DrawerItem
        label="Logout"
        onPress={handleLogoutPress}
        labelStyle={{
          color: '#d62828',
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

  const DrawerNavigator = ({ navigation }) => {
    return (
      <Drawer.Navigator
        drawerContent={(props) => (
          <CustomDrawerContent
            {...props}
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
      </Drawer.Navigator>
    );
  };

  return (
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

        {/* Restaurant menu detail page */}
        <Stack.Screen name="RestaurantMenu">
          {(props) => <RestaurantMenu {...props} />}
        </Stack.Screen>

      </Stack.Navigator>
    </NavigationContainer>
  );
}