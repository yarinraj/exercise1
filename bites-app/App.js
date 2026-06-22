import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

const Stack = createNativeStackNavigator();

const HomeScreen = ({ user }) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f5ef',
        padding: 24
      }}
    >
      <Text
        style={{
          fontSize: 42,
          fontWeight: '900',
          color: '#00c2e8',
          fontStyle: 'italic',
          marginBottom: 16
        }}
      >
        bites
      </Text>

      <Text
        style={{
          fontSize: 22,
          fontWeight: '900',
          color: '#202125',
          marginBottom: 8
        }}
      >
        Logged in successfully
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: '#7b8490',
          textAlign: 'center'
        }}
      >
        Welcome {user?.displayName || user?.username || 'User'}
      </Text>
    </View>
  );
};

export default function App() {
  const [user, setUser] = useState(null);

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

        <Stack.Screen name="Home">
          {(props) => <HomeScreen {...props} user={user} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}