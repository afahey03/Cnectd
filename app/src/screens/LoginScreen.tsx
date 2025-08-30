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
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    const u = username.trim().toLowerCase();
    if (!u || !password) return;
    setBusy(true); setErr(null);
    try {
      await login(u, password);
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
        Enter your username and password to continue.
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
        returnKeyType="next"
      />

      <View style={{ position: 'relative' }}>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={palette.textMuted}
          secureTextEntry={!showPw}
          autoCapitalize="none"
          style={{
            backgroundColor: palette.inputBg, borderWidth: 1, borderColor: palette.border,
            color: palette.text, borderRadius: 12, padding: 14, paddingRight: 80
          }}
          onSubmitEditing={onSubmit}
          returnKeyType="go"
        />
        <TouchableOpacity
          onPress={() => setShowPw(s => !s)}
          style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}
        >
          <Text style={{ color: palette.primary, fontWeight: '700' }}>{showPw ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>

      {!!err && <Text style={{ color: palette.danger, textAlign: 'center' }}>{err}</Text>}

      <TouchableOpacity
        onPress={onSubmit}
        disabled={busy || !username.trim() || !password}
        style={{
          backgroundColor: palette.primary,
          borderRadius: 12, padding: 14,
          opacity: busy || !username.trim() || !password ? 0.6 : 1
        }}
      >
        <Text style={{ color: '#0A1020', fontWeight: '800', textAlign: 'center' }}>
          {busy ? 'Signing in…' : 'Sign in'}
        </Text>
      </TouchableOpacity>

      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <Text style={{ color: palette.textMuted }}>
          New here?{' '}
          <Text onPress={() => nav.navigate('Register')} style={{ color: palette.primary, fontWeight: '700' }}>
            Create an account
          </Text>
        </Text>
      </View>
    </Screen>
  );
}
