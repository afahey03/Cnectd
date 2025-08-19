import React from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import Screen from '../ui/Screen';
import ListItem from '../ui/ListItem';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { useNavigation } from '@react-navigation/native';
import { palette } from '../ui/theme';
import Avatar from '../ui/Avatar';

export default function HomeScreen() {
  const nav = useNavigation<any>();
  const q = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => (await api.get('/conversations/mine')).data.conversations
  });

  const data = q.data ?? [];

  if (!q.isLoading && data.length === 0) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 24 }}>
          <Text style={{ color: palette.text, fontSize: 20, fontWeight: '800' }}>No chats yet</Text>
          <Text style={{ color: palette.textMuted, textAlign: 'center' }}>
            Start a conversation by finding a friend.
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
            <TouchableOpacity
              onPress={() => {
                nav.navigate('FriendsTab');
              }}
              style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: palette.primary }}
            >
              <Text style={{ color: palette.primary, fontWeight: '700' }}>Find friends</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={data}
        keyExtractor={(c: any) => c.id}
        renderItem={({ item }: any) => {
          const isGroup = item.isGroup;
          const otherUsers = item.users || [];

          const title = isGroup
            ? (item.name ? `# ${item.name}` : `Group • ${otherUsers.length} members`)
            : otherUsers.map((u: any) => u.displayName).join(', ');

          const subtitle = item.lastMessage?.content ?? '';

          const avatarLabel = isGroup
            ? (item.name || `Group ${otherUsers.length}`)
            : (otherUsers[0]?.displayName || otherUsers[0]?.username || 'User');

          return (
            <ListItem
              title={title}
              subtitle={subtitle}
              left={<Avatar name={avatarLabel} size={40} />}
              onPress={() => nav.navigate('Chat', { conversationId: item.id, title })}
            />
          );
        }}
      />
    </Screen>
  );
}
