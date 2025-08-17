import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import FriendsScreen from '../screens/FriendsScreen';
import ChatScreen from '../screens/ChatScreen';
import NewGroupScreen from '../screens/NewGroupScreen';
import { useAuth } from '../store/auth';
import { useEffect } from 'react';

const Stack = createNativeStackNavigator();

export default function RootNav() {
  const token = useAuth(s => s.token);
  const init = useAuth(s => s.init);

  useEffect(() => { void init(); }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!token ? (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }
          } />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Friends" component={FriendsScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="NewGroup" component={NewGroupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
