import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Screen from '../ui/Screen';
import { palette } from '../ui/theme';
import { useAuth } from '../store/auth';

export default function RegisterScreen() {
  const register = useAuth(s => s.register);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    const u = username.trim().toLowerCase();
    const d = displayName.trim() || username.trim();
    if (!u) return;
    setBusy(true); setErr(null);
    try {
      await register(u, d);
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? 'Could not create account');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen style={{ justifyContent: 'center', gap: 16 }}>
      <Text style={{ color: palette.text, fontSize: 28, fontWeight: '800', textAlign: 'center' }}>Create account</Text>
      <Text style={{ color: palette.textMuted, textAlign: 'center' }}>
        Pick a unique username and your display name.
      </Text>

      <View style={{ gap: 10 }}>
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
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Display name"
          placeholderTextColor={palette.textMuted}
          style={{
            backgroundColor: palette.inputBg, borderWidth: 1, borderColor: palette.border,
            color: palette.text, borderRadius: 12, padding: 14
          }}
          onSubmitEditing={onSubmit}
          returnKeyType="go"
        />
      </View>

      {!!err && <Text style={{ color: palette.danger, textAlign: 'center' }}>{err}</Text>}

      <TouchableOpacity
        onPress={onSubmit}
        disabled={busy}
        style={{ backgroundColor: palette.primary, borderRadius: 12, padding: 14, opacity: busy ? 0.6 : 1 }}
      >
        <Text style={{ color: '#0A1020', fontWeight: '800', textAlign: 'center' }}>
          {busy ? 'Creating…' : 'Create account'}
        </Text>
      </TouchableOpacity>
    </Screen>
  );
}
