import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { useAuth } from '../store/auth';
import { api } from '../api/client';
import { useQuery } from '@tanstack/react-query';

export default function AuthScreen() {
  const register = useAuth(s => s.register);
  const login = useAuth(s => s.login);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');

  const { data } = useQuery({
    queryKey: ['check-username', username],
    enabled: username.length >= 3,
    queryFn: async () => {
      try {
        const res = await api.get(`/auth/check-username/${username}`);
        return res.data;
      } catch {
        return { available: false };
      }
    }
  });

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: '700' }}>Cnectd</Text>
      <Text>Pick a unique username (or login if it exists)</Text>

      <TextInput
        placeholder="username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />
      <TextInput
        placeholder="display name (for new users)"
        value={displayName}
        onChangeText={setDisplayName}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />

      {username.length >= 3 && (
        <Text style={{ color: data?.available ? 'green' : 'red' }}>
          {data?.available ? 'Available (Register)' : 'Taken (Login)'}
        </Text>
      )}

      <Button
        title={data?.available ? 'Register' : 'Login'}
        onPress={() =>
          data?.available
            ? register(username, displayName || username)
            : login(username)
        }
        disabled={username.length < 3}
      />
    </View>
  );
}
