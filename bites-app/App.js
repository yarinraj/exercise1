import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

const Stack = createNativeStackNavigator();

const HomeScreen = ({ user }) => {
  return null;
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