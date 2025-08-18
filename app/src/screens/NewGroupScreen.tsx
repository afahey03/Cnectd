import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { useNavigation } from '@react-navigation/native';
import { palette } from '../ui/theme';

type Friend = { id: string; username: string; displayName: string };

export default function NewGroupScreen() {
  const nav = useNavigation<any>();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const friendsQ = useQuery({
    queryKey: ['friends-list'],
    queryFn: async () => {
      const res = await api.get('/friends/list');
      return (res.data.friends ?? []) as Friend[];
    }
  });

  const friends = friendsQ.data || [];

  const selectedIds = useMemo(
    () => Object.keys(selected).filter(id => selected[id]),
    [selected]
  );

  const toggle = (id: string) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const createGroup = async () => {
    if (selectedIds.length < 2) {
      Alert.alert('Pick at least 2 friends', 'Groups require you + at least two others.');
      return;
    }
    try {
      const res = await api.post('/conversations/group', {
        name: name.trim() || undefined,
        memberIds: selectedIds
      });
      const conv = res.data.conversation;
      nav.navigate('Chat', { conversationId: conv.id });
    } catch (e: any) {
      Alert.alert('Could not create group', e?.response?.data?.error ?? 'Unknown error');
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: palette.text }}>New Group</Text>

      <Text style={{ marginTop: 12, fontSize: 16, color: palette.text }}>
        Group name (optional)
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g., Weekend Plans"
        style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginVertical: 8 }}
      />

      <Text style={{ marginTop: 12, fontSize: 16, color: palette.text }}>
        Select friends
      </Text>

      {friendsQ.isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(f) => f.id}
          renderItem={({ item }) => {
            const isSel = !!selected[item.id];
            return (
              <TouchableOpacity onPress={() => toggle(item.id)} activeOpacity={0.7}>
                <View style={{
                  paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between',
                  alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee'
                }}>
                  <View>
                    <Text style={{ color: '#666', fontWeight: '600' }}>{item.displayName}</Text>
                    <Text style={{ color: '#666' }}>@{item.username}</Text>
                  </View>
                  <View style={{
                    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
                    borderColor: isSel ? '#2e7d32' : '#bbb', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isSel ? '#a5d6a7' : 'transparent'
                  }}>
                    {isSel ? <Text>✓</Text> : null}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          style={{ flex: 1, marginBottom: 12 }}
        />
      )}

      <Button title="Create group" onPress={createGroup} />
    </View>
  );
}
