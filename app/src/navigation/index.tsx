import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import FriendsScreen from '../screens/FriendsScreen';
import ChatScreen from '../screens/ChatScreen';
import NewGroupScreen from '../screens/NewGroupScreen';

import { useAuth } from '../store/auth';
import { useEffect } from 'react';
import Header from '../ui/Header';
import { palette } from '../ui/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNav() {
  const token = useAuth(s => s.token);
  const init = useAuth(s => s.init);

  useEffect(() => { void init(); }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          contentStyle: { backgroundColor: palette.bg },
        }}
      >
        {!token ? (
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                header: () => <Header title="Chats" />,
              }}
            />
            <Stack.Screen
              name="Friends"
              component={FriendsScreen}
              options={({ navigation }) => ({
                header: () => <Header title="Friends" onBack={() => navigation.goBack()} />,
              })}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={({ navigation, route }) => ({
                header: () => (
                  <Header
                    title={route.params?.title ?? 'Chat'}
                    onBack={() => navigation.goBack()}
                  />
                ),
              })}
            />
            <Stack.Screen
              name="NewGroup"
              component={NewGroupScreen}
              options={({ navigation }) => ({
                header: () => <Header title="New Group" onBack={() => navigation.goBack()} />,
              })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
