import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import FriendsScreen from '../screens/FriendsScreen';
import ChatScreen from '../screens/ChatScreen';
import NewGroupScreen from '../screens/NewGroupScreen';
import AuthStack from './auth-stack';

import HeaderNewGroup from '../ui/HeaderNewGroup';
import Header from '../ui/Header';
import HeaderLogout from '../ui/HeaderLogout';
import { palette } from '../ui/theme';
import { useAuth } from '../store/auth';

export type RootStackParamList = {
  MainTabs: undefined;
  Chat: { conversationId: string; title?: string };
  NewGroup: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarStyle: { backgroundColor: palette.card, borderTopColor: palette.border },
        headerStyle: { backgroundColor: palette.card },
        headerTitleStyle: { color: palette.text },
        headerTintColor: palette.text,
      }}
    >
      <Tabs.Screen
        name="ChatsTab"
        component={HomeScreen}
        options={{
          title: 'Chats',
          header: () => <Header title="Chats" right={<HeaderLogout />} />,
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles-outline" color={color} size={size} />,
          tabBarLabel: 'Chats',
        }}
      />
      <Tabs.Screen
        name="FriendsTab"
        component={FriendsScreen}
        options={{
          title: 'Friends',
          header: () => <Header title="Friends" right={<HeaderNewGroup />} />,
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} />,
          tabBarLabel: 'Friends',
        }}
      />
    </Tabs.Navigator>
  );
}

export default function RootNav() {
  const token = useAuth(s => s.token);
  const init = useAuth(s => s.init);

  useEffect(() => { void init(); }, []);

  return (
    <NavigationContainer>
      {!token ? (
        <AuthStack />
      ) : (
        <Stack.Navigator
          screenOptions={{
            contentStyle: { backgroundColor: palette.bg },
          }}
        >
          {/* Tabs hold Chats & Friends so they can't replace each other */}
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />

          {/* Pushed screens */}
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={({ navigation, route }) => ({
              header: () => (
                <Header
                  title={(route.params?.title as string) ?? 'Chat'}
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
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
