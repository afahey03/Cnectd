import React from 'react';
import { View, Button, FlatList, Text, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../store/auth';

export default function HomeScreen() {
  const nav = useNavigation<any>();
  const logout = useAuth(s => s.logout);
  const { data, refetch, isFetching } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => (await api.get('/conversations/mine')).data.conversations
  });

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Button title="Logout" onPress={logout} />
      <Button title="Friends" onPress={() => nav.navigate('Friends')} />
      <Button title="New Group" onPress={() => nav.navigate('NewGroup')} />
      <FlatList
        data={data || []}
        refreshing={isFetching}
        onRefresh={refetch}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => nav.navigate('Chat', { conversationId: item.id })}>
            <View style={{ paddingVertical: 12 }}>
              <Text style={{ fontWeight: '600' }}>
                {item.isGroup
                  ? (item.name ? `Group • ${item.name}` : `Group • ${item.users.length} members`)
                  : item.users.map((u: any) => u.displayName).join(', ')
                }
              </Text>
              <Text numberOfLines={1}>{item.messages?.[0]?.content ?? 'No messages yet'}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
