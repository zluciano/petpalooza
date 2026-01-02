import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { WelcomeScreen, SignInScreen, SignUpScreen } from '../screens/auth';
import { colors } from '../constants/theme';

const Stack = createStackNavigator();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}
