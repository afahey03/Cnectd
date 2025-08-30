import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Screen from '../ui/Screen';
import { palette } from '../ui/theme';
import { useAuth } from '../store/auth';

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/;

export default function RegisterScreen() {
  const register = useAuth(s => s.register);

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pwValid = useMemo(() => PASSWORD_RULE.test(password), [password]);
  const canSubmit = useMemo(() => {
    return !!username.trim() && !!displayName.trim() && pwValid && password === confirm && !busy;
  }, [username, displayName, pwValid, password, confirm, busy]);

  const onSubmit = async () => {
    const u = username.trim().toLowerCase();
    const d = displayName.trim() || username.trim();
    if (!canSubmit) return;
    setBusy(true); setErr(null);
    try {
      await register(u, d, password);
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
        Pick a unique username, your display name, and a strong password.
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
            returnKeyType="next"
          />
          <TouchableOpacity
            onPress={() => setShowPw(s => !s)}
            style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}
          >
            <Text style={{ color: palette.primary, fontWeight: '700' }}>{showPw ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ position: 'relative' }}>
          <TextInput
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Confirm password"
            placeholderTextColor={palette.textMuted}
            secureTextEntry={!showConfirm}
            autoCapitalize="none"
            style={{
              backgroundColor: palette.inputBg, borderWidth: 1, borderColor: palette.border,
              color: palette.text, borderRadius: 12, padding: 14, paddingRight: 80
            }}
            returnKeyType="go"
            onSubmitEditing={onSubmit}
          />
          <TouchableOpacity
            onPress={() => setShowConfirm(s => !s)}
            style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}
          >
            <Text style={{ color: palette.primary, fontWeight: '700' }}>
              {showConfirm ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>

        {!pwValid && password.length > 0 && (
          <Text style={{ color: palette.textMuted, fontSize: 12 }}>
            Password must be 8–20 chars and include at least one lowercase, uppercase, number, and special character.
          </Text>
        )}
        {password !== confirm && confirm.length > 0 && (
          <Text style={{ color: palette.danger, fontSize: 12 }}>
            Passwords do not match.
          </Text>
        )}
      </View>

      {!!err && <Text style={{ color: palette.danger, textAlign: 'center' }}>{err}</Text>}

      <TouchableOpacity
        onPress={onSubmit}
        disabled={!canSubmit}
        style={{
          backgroundColor: palette.primary, borderRadius: 12, padding: 14,
          opacity: canSubmit ? 1 : 0.6
        }}
      >
        <Text style={{ color: '#0A1020', fontWeight: '800', textAlign: 'center' }}>
          {busy ? 'Creating…' : 'Create account'}
        </Text>
      </TouchableOpacity>
    </Screen>
  );
}
