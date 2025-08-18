import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, Alert, ActivityIndicator } from 'react-native';
import Screen from '../ui/Screen';
import ListItem from '../ui/ListItem';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { palette } from '../ui/theme';
import { useNavigation } from '@react-navigation/native';

type Friend = { id: string; username: string; displayName: string };

export default function NewGroupScreen() {
  const nav = useNavigation<any>();
  const [name, setName] = useState('');
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const friendsQ = useQuery({
    queryKey: ['friends', 'list'],
    queryFn: async () => {
      const { data } = await api.get('/friends/list');
      return (Array.isArray(data?.friends) ? data.friends : []) as Friend[];
    },
    initialData: [] as Friend[],
    staleTime: 10_000,
  });

  const filteredFriends = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const list = friendsQ.data ?? [];
    if (!q) return list;
    return list.filter(
      (f) =>
        f.displayName.toLowerCase().includes(q) ||
        f.username.toLowerCase().includes(q)
    );
  }, [filter, friendsQ.data]);

  const toggle = (id: string) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((id) => selected[id]),
    [selected]
  );

  const defaultName = useMemo(() => {
    if (!selectedIds.length || !friendsQ.data?.length) return '';
    const names = friendsQ.data
      .filter((f) => selectedIds.includes(f.id))
      .map((f) => f.displayName);
    const base = names.slice(0, 3).join(', ');
    return names.length > 3 ? `${base} +${names.length - 3}` : base;
  }, [selectedIds, friendsQ.data]);

  const canCreate = selectedIds.length > 0 && !submitting;

  const create = async () => {
    if (!selectedIds.length) return Alert.alert('Pick at least one friend');
    const finalName = name.trim() || defaultName || 'Group';
    try {
      setSubmitting(true);
      const res = await api.post('/conversations/group', {
        name: finalName,
        memberIds: selectedIds,
      });
      const conv = res.data.conversation;
      nav.replace('Chat', { conversationId: conv.id, title: `# ${conv.name || finalName}` });
    } catch (e: any) {
      Alert.alert('Could not create group', e?.response?.data?.error ?? 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      {/* Title */}
      <Text style={{ color: palette.text, fontSize: 22, fontWeight: '800', marginTop: 8 }}>
        New Group
      </Text>

      {/* Group name input */}
      <Text style={{ color: palette.text, fontSize: 16, fontWeight: '700', marginTop: 16 }}>
        Group name (optional)
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={defaultName ? `e.g. ${defaultName}` : 'e.g. Weekend Plans'}
        placeholderTextColor={palette.textMuted}
        style={{
          backgroundColor: palette.inputBg,
          borderWidth: 1,
          borderColor: palette.border,
          color: palette.text,
          borderRadius: 10,
          padding: 12,
          marginTop: 8,
        }}
        returnKeyType="done"
      />

      {/* Filter input */}
      <Text style={{ color: palette.text, fontSize: 16, fontWeight: '700', marginTop: 18 }}>
        Select friends
      </Text>
      <TextInput
        value={filter}
        onChangeText={setFilter}
        placeholder="Filter friends"
        placeholderTextColor={palette.textMuted}
        style={{
          backgroundColor: palette.inputBg,
          borderWidth: 1,
          borderColor: palette.border,
          color: palette.text,
          borderRadius: 10,
          padding: 12,
          marginTop: 8,
          marginBottom: 8,
        }}
        returnKeyType="search"
      />

      {/* Loading indicator */}
      {friendsQ.isFetching && (
        <View style={{ paddingVertical: 6 }}>
          <ActivityIndicator color={palette.primary} />
        </View>
      )}

      {/* Friends list */}
      <FlatList
        data={filteredFriends}
        keyExtractor={(u) => u.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const isOn = !!selected[item.id];
          return (
            <ListItem
              title={item.displayName}
              subtitle={`@${item.username}`}
              right={
                <Pressable
                  onPress={() => toggle(item.id)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: isOn ? palette.primary : palette.border,
                    backgroundColor: isOn ? palette.primary : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      color: isOn ? '#0A1020' : palette.textMuted,
                      fontWeight: '700',
                    }}
                  >
                    {isOn ? 'Selected' : 'Select'}
                  </Text>
                </Pressable>
              }
            />
          );
        }}
        ListEmptyComponent={
          !friendsQ.isFetching ? (
            <Text style={{ color: palette.textMuted, textAlign: 'center', marginTop: 16 }}>
              {filter ? 'No matches.' : 'You have no friends yet.'}
            </Text>
          ) : null
        }
        style={{ marginTop: 4 }}
      />

      {/* Create button */}
      <Pressable
        onPress={create}
        disabled={!canCreate}
        style={{
          marginTop: 16,
          marginBottom: 12,
          backgroundColor: palette.primary,
          opacity: canCreate ? 1 : 0.5,
          borderRadius: 12,
          padding: 14,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#0A1020', fontWeight: '800' }}>
          {submitting ? 'Creating…' : 'Create Group'}
        </Text>
      </Pressable>
    </Screen>
  );
}
