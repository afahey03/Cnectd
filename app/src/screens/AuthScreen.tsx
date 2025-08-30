import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Screen from '../ui/Screen';
import { palette } from '../ui/theme';
import { api } from '../api/client';
import { useAuth } from '../store/auth';

export default function AuthScreen() {
  const { setAuth } = useAuth.getState() as any;

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const name = username.trim().toLowerCase();
    const pw = password;
    if (!name || !pw) return;

    try {
      setSubmitting(true);

      const avail = await api.get(`/auth/check-username/${name}`);

      let res;
      if (avail.data?.available) {
        res = await api.post('/auth/register', {
          username: name,
          displayName: (displayName || username).trim(),
          password: pw,
        });
      } else {
        res = await api.post('/auth/login', { username: name, password: pw });
      }

      setAuth(res.data.user, res.data.token);
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ??
        'Could not continue. Check your username/password and try again.';
      Alert.alert('Oops', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = username.trim().length >= 3 && password.length >= 8 && !submitting;

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'center', gap: 18 }}
      >
        <Text style={{ color: palette.text, fontSize: 28, fontWeight: '800', textAlign: 'center' }}>
          Cnectd
        </Text>
        <Text style={{ color: palette.textMuted, textAlign: 'center', marginBottom: 8 }}>
          Pick a unique username (or log in if it exists)
        </Text>

        <View style={{ gap: 10 }}>
          <TextInput
            value={username}
            onChangeText={(t) => setUsername(t.toLowerCase())}
            placeholder="@username"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={palette.textMuted}
            style={{
              backgroundColor: palette.inputBg,
              borderWidth: 1,
              borderColor: palette.border,
              color: palette.text,
              borderRadius: 12,
              padding: 14,
            }}
          />

          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Display name"
            placeholderTextColor={palette.textMuted}
            style={{
              backgroundColor: palette.inputBg,
              borderWidth: 1,
              borderColor: palette.border,
              color: palette.text,
              borderRadius: 12,
              padding: 14,
            }}
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={palette.textMuted}
            style={{
              backgroundColor: palette.inputBg,
              borderWidth: 1,
              borderColor: palette.border,
              color: palette.text,
              borderRadius: 12,
              padding: 14,
            }}
            secureTextEntry
          />

          <Text style={{ color: palette.textMuted, fontSize: 12, marginTop: -4 }}>
            8–20 chars with upper, lower, number & special character.
          </Text>
        </View>

        <TouchableOpacity
          onPress={submit}
          disabled={!canSubmit}
          style={{
            backgroundColor: palette.primary,
            borderRadius: 12,
            padding: 14,
            marginTop: 6,
            opacity: canSubmit ? 1 : 0.6,
          }}
        >
          <Text style={{ color: '#0A1020', fontWeight: '800', textAlign: 'center' }}>
            {submitting ? 'Continuing…' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Screen>
  );
}
