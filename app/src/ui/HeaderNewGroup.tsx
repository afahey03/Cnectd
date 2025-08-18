import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from './theme';
import { useNavigation } from '@react-navigation/native';

export default function HeaderNewGroup({ tint }: { tint?: string }) {
  const nav = useNavigation<any>();
  return (
    <TouchableOpacity
      onPress={() => nav.navigate('NewGroup')}
      accessibilityLabel="New Group"
      style={{ padding: 8, marginRight: 4 }}
    >
      <Ionicons name="add-circle-outline" size={24} color={tint || palette.text} />
    </TouchableOpacity>
  );
}
