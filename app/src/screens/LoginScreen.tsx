import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Screen from '../ui/Screen';
import { palette } from '../ui/theme';
import { useAuth } from '../store/auth';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const nav = useNavigation<any>();
  const login = useAuth(s => s.login);
  const [username, setUsername] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    const u = username.trim().toLowerCase();
    if (!u) return;
    setBusy(true); setErr(null);
    try {
      await login(u);
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? 'Could not sign in');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen style={{ justifyContent: 'center', gap: 16 }}>
      <Text style={{ color: palette.text, fontSize: 28, fontWeight: '800', textAlign: 'center' }}>Welcome back</Text>
      <Text style={{ color: palette.textMuted, textAlign: 'center' }}>
        Enter your username to continue.
      </Text>

      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="@username"
        placeholderTextColor={palette.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          backgroundColor: palette.inputBg, borderWidth: 1, borderColor: palette.border,
          color: palette.text, borderRadius: 12, padding: 14
        }}
        onSubmitEditing={onSubmit}
        returnKeyType="go"
      />

      {!!err && <Text style={{ color: palette.danger, textAlign: 'center' }}>{err}</Text>}

      <TouchableOpacity
        onPress={onSubmit}
        disabled={busy}
        style={{ backgroundColor: palette.primary, borderRadius: 12, padding: 14, opacity: busy ? 0.6 : 1 }}
      >
        <Text style={{ color: '#0A1020', fontWeight: '800', textAlign: 'center' }}>
          {busy ? 'Signing in…' : 'Sign in'}
        </Text>
      </TouchableOpacity>

      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <Text style={{ color: palette.textMuted }}>
          New here?{' '}
          <Text
            onPress={() => nav.navigate('Register')}
            style={{ color: palette.primary, fontWeight: '700' }}
          >
            Create an account
          </Text>
        </Text>
      </View>
    </Screen>
  );
}
