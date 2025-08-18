import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import Header from '../ui/Header';
import { palette } from '../ui/theme';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: palette.bg },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          header: () => <Header title="Sign in" />,
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          header: () => <Header title="Create account" />,
        }}
      />
    </Stack.Navigator>
  );
}
