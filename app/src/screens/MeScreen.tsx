import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, Alert } from 'react-native';
import Screen from '../ui/Screen';
import { palette } from '../ui/theme';
import { useAuth } from '../store/auth';
import { useMutation } from '@tanstack/react-query';
import { api } from '../api/client';
import Avatar from '../ui/Avatar';

const COLOR_CHOICES = ['#4C6FFF', '#12B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#E11D48', '#22C55E'];

export default function MeScreen() {
  const me = useAuth(s => s.user);
  const setUser = useAuth.setState;
  const [displayName, setDisplayName] = useState(me?.displayName ?? '');
  const [color, setColor] = useState<string | undefined>(me?.avatarColor);

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch('/users/me', { displayName, avatarColor: color });
      return data.user;
    },
    onSuccess: (user) => {
      setUser(prev => ({ ...prev, user } as any));
      Alert.alert('Saved', 'Your profile has been updated.');
    },
    onError: (e: any) => {
      Alert.alert('Error', e?.response?.data?.error ?? 'Could not update profile');
    }
  });

  const canSave = (displayName || '').trim().length >= 2 && !mutation.isPending;

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 8 }}>
        <Avatar name={displayName || me?.displayName || me?.username || 'You'} size={72} color={color} />
        <Text style={{ color: palette.textMuted, marginTop: 8 }}>@{me?.username}</Text>
      </View>

      <Text style={{ color: palette.text, fontSize: 16, fontWeight: '700', marginTop: 12 }}>
        Display name
      </Text>
      <TextInput
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Your display name"
        placeholderTextColor={palette.textMuted}
        style={{
          backgroundColor: palette.inputBg,
          borderWidth: 1, borderColor: palette.border,
          color: palette.text, borderRadius: 10, padding: 12, marginTop: 8
        }}
      />

      <Text style={{ color: palette.text, fontSize: 16, fontWeight: '700', marginTop: 18 }}>
        Avatar color
      </Text>
      <FlatList
        data={COLOR_CHOICES}
        keyExtractor={(c) => c}
        numColumns={4}
        contentContainerStyle={{ paddingVertical: 8 }}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
        renderItem={({ item }) => {
          const selected = color === item;
          return (
            <Pressable
              onPress={() => setColor(item)}
              style={{
                width: 64, height: 44, borderRadius: 10, backgroundColor: item,
                borderWidth: selected ? 3 : 1,
                borderColor: selected ? '#fff' : '#00000030',
                alignItems: 'center', justifyContent: 'center'
              }}
            >
              {selected ? <Text style={{ color: '#0A1020', fontWeight: '800' }}>✓</Text> : null}
            </Pressable>
          );
        }}
      />

      <Pressable
        onPress={() => mutation.mutate()}
        disabled={!canSave}
        style={{
          marginTop: 8, backgroundColor: palette.primary, opacity: canSave ? 1 : 0.5,
          borderRadius: 12, padding: 14, alignItems: 'center'
        }}
      >
        <Text style={{ color: '#0A1020', fontWeight: '800' }}>
          {mutation.isPending ? 'Saving…' : 'Save changes'}
        </Text>
      </Pressable>
    </Screen>
  );
}
