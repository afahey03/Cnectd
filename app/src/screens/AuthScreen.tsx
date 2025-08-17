import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import Screen from '../ui/Screen';
import { palette } from '../ui/theme';
import { api } from '../api/client';
import { useAuth } from '../store/auth';

export default function AuthScreen() {
  const { setAuth } = useAuth.getState() as any;
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');

  const submit = async () => {
    const name = username.trim().toLowerCase();
    if (!name) return;
    try {
      // try register; if taken, login
      const avail = await api.get(`/auth/check-username/${name}`);
      let res;
      if (avail.data?.available) {
        res = await api.post('/auth/register', { username: name, displayName: displayName || username });
      } else {
        res = await api.post('/auth/login', { username: name });
      }
      setAuth(res.data.user, res.data.token);
    } catch (e) { }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'center', gap: 18 }}
      >
        <Text style={{ color: palette.text, fontSize: 28, fontWeight: '800', textAlign: 'center' }}>Cnectd</Text>
        <Text style={{ color: palette.textMuted, textAlign: 'center', marginBottom: 8 }}>
          Pick a unique username (or login if it exists)
        </Text>

        <View style={{ gap: 10 }}>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="@username"
            placeholderTextColor={palette.textMuted}
            style={{
              backgroundColor: palette.inputBg, borderWidth: 1, borderColor: palette.border,
              color: palette.text, borderRadius: 12, padding: 14
            }}
          />
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Display name"
            placeholderTextColor={palette.textMuted}
            style={{
              backgroundColor: palette.inputBg, borderWidth: 1, borderColor: palette.border,
              color: palette.text, borderRadius: 12, padding: 14
            }}
          />
        </View>

        <TouchableOpacity onPress={submit} style={{
          backgroundColor: palette.primary, borderRadius: 12, padding: 14, marginTop: 6
        }}>
          <Text style={{ color: '#0A1020', fontWeight: '800', textAlign: 'center' }}>Continue</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Screen>
  );
}
