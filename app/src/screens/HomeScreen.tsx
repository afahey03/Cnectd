import React from 'react';
import { View, FlatList } from 'react-native';
import Screen from '../ui/Screen';
import ListItem from '../ui/ListItem';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const nav = useNavigation<any>();
  const q = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => (await api.get('/conversations/mine')).data.conversations
  });

  return (
    <Screen>
      <FlatList
        data={q.data ?? []}
        keyExtractor={(c: any) => c.id}
        renderItem={({ item }: any) => {
          const title = item.isGroup
            ? (item.name ? `# ${item.name}` : `Group • ${item.users.length} members`)
            : item.users.map((u: any) => u.displayName).join(', ');
          const subtitle = item.lastMessage?.content ?? '';
          return (
            <ListItem
              title={title}
              subtitle={subtitle}
              onPress={() => nav.navigate('Chat', { conversationId: item.id, title })}
            />
          );
        }}
      />
    </Screen>
  );
}
