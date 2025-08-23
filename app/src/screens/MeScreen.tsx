import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, FlatList, Alert, ActivityIndicator } from 'react-native';
import Screen from '../ui/Screen';
import { palette } from '../ui/theme';
import { useAuth } from '../store/auth';
import { useMutation } from '@tanstack/react-query';
import { api } from '../api/client';
import Avatar from '../ui/Avatar';

const COLOR_CHOICES = ['#4C6FFF', '#12B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#E11D48', '#22C55E'];

export default function MeScreen() {
  const user = useAuth(s => s.user);
  const logout = useAuth(s => s.logout);
  const setStore = useAuth.setState;

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [color, setColor] = useState<string | undefined>(user?.avatarColor);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setDisplayName(user?.displayName ?? '');
    setColor(user?.avatarColor);
  }, [user?.displayName, user?.avatarColor]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch('/users/me', { displayName, avatarColor: color });
      return data.user as typeof user;
    },
    onSuccess: (updated) => {
      setStore({ user: updated });
      Alert.alert('Saved', 'Your profile has been updated.');
    },
    onError: (e: any) => {
      Alert.alert('Error', e?.response?.data?.error ?? 'Could not update profile');
    }
  });

  const canSave = (displayName || '').trim().length >= 2 && !saveMutation.isPending;

  const onDelete = () => {
    Alert.alert(
      'Delete account?',
      'This will permanently delete your account. Your messages remain in chats labeled “Deleted User”. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await api.delete('/users/me');
              await logout();
            } catch (e: any) {
              Alert.alert('Failed to delete', e?.response?.data?.error ?? 'Unknown error');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 8 }}>
        <Avatar name={displayName || user?.displayName || user?.username || 'You'} size={72} color={color} />
        <Text style={{ color: palette.textMuted, marginTop: 8 }}>@{user?.username}</Text>
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
        onPress={() => saveMutation.mutate()}
        disabled={!canSave}
        style={{
          marginTop: 8, backgroundColor: palette.primary, opacity: canSave ? 1 : 0.5,
          borderRadius: 12, padding: 14, alignItems: 'center'
        }}
      >
        <Text style={{ color: '#0A1020', fontWeight: '800' }}>
          {saveMutation.isPending ? 'Saving…' : 'Save changes'}
        </Text>
      </Pressable>

      <View style={{ height: 28 }} />

      <Pressable
        onPress={onDelete}
        disabled={deleting}
        style={{
          alignSelf: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 12,
          backgroundColor: '#2B0C0F',
          borderWidth: 1,
          borderColor: '#7F1D1D',
          opacity: deleting ? 0.6 : 1,
        }}
      >
        {deleting ? (
          <ActivityIndicator color="#FCA5A5" />
        ) : (
          <Text style={{ color: '#FCA5A5', fontWeight: '800' }}>Delete Account</Text>
        )}
      </Pressable>

      <View style={{ height: 12 }} />
      <Text style={{ color: palette.textMuted, fontSize: 12, textAlign: 'center' }}>
        Your messages will remain in chats, labeled as “Deleted User”.
      </Text>
    </Screen>
  );
}
