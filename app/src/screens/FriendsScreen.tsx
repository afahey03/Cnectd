import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { useNavigation } from '@react-navigation/native';

async function startDm(userId: string) {
  const res = await api.post('/conversations/dm', { otherUserId: userId });
  return res.data.conversation;
}

export default function FriendsScreen() {
  const [query, setQuery] = useState('');
  const nav = useNavigation<any>();

  const search = useQuery({
    queryKey: ['user-search', query],
    enabled: query.length >= 2,
    queryFn: async () => (await api.get('/users/search', { params: { q: query } })).data.results
  });

  const pending = useQuery({
    queryKey: ['pending'],
    queryFn: async () => (await api.get('/friends/pending')).data
  });

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput placeholder="Search usernames…" value={query} onChangeText={setQuery}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }} />
      <FlatList
        data={search.data || []}
        keyExtractor={(i: any) => i.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>@{item.username} • {item.displayName}</Text>
            <Button title="Add" onPress={async () => {
              await api.post('/friends/request', { toUserId: item.id });
              pending.refetch();
            }} />
            <Button
              title="DM"
              onPress={async () => {
                try {
                  const conv = await startDm(item.id);
                  nav.navigate('Chat', { conversationId: conv.id });
                } catch (e) {
                  console.warn('Could not start DM (are you friends yet?)');
                }
              }}
            />
          </View>
        )}
      />
      <Text style={{ marginTop: 16, fontWeight: '700' }}>Incoming</Text>
      <FlatList
        data={pending.data?.incoming || []}
        keyExtractor={(i: any) => i.id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
            <Text>@{item.from.username} • {item.from.displayName}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button title="Accept" onPress={async () => {
                await api.post('/friends/respond', { requestId: item.id, accept: true });
                pending.refetch();
              }} />
              <Button title="Deny" onPress={async () => {
                await api.post('/friends/respond', { requestId: item.id, accept: false });
                pending.refetch();
              }} />
            </View>
          </View>
        )}
      />
      <Text style={{ marginTop: 16, fontWeight: '700' }}>Outgoing</Text>
      <FlatList
        data={pending.data?.outgoing || []}
        keyExtractor={(i: any) => i.id}
        renderItem={({ item }) => (
          <Text style={{ paddingVertical: 8 }}>To @{item.to.username} (pending)</Text>
        )}
      />
    </View>
  );
}
