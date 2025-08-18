import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from './theme';
import { useAuth } from '../store/auth';

export default function HeaderLogout({ tint }: { tint?: string }) {
  const logout = useAuth(s => s.logout);

  return (
    <TouchableOpacity
      onPress={logout}
      accessibilityLabel="Log out"
      style={{ padding: 8, marginRight: 4 }}
    >
      <Ionicons name="log-out-outline" size={22} color={tint || palette.text} />
    </TouchableOpacity>
  );
}
