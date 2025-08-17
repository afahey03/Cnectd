import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity } from 'react-native';
import Screen from '../ui/Screen';
import ListItem from '../ui/ListItem';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { palette } from '../ui/theme';
import { useNavigation } from '@react-navigation/native';

export default function FriendsScreen() {
  const nav = useNavigation<any>();
  const [q, setQ] = useState('');
  const search = useQuery({
    queryKey: ['search', q],
    queryFn: async () => q ? (await api.get(`/users/search?query=${encodeURIComponent(q)}`)).data.users : [],
  });

  return (
    <Screen>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search users"
        placeholderTextColor={palette.textMuted}
        style={{
          backgroundColor: palette.inputBg, borderWidth: 1, borderColor: palette.border,
          color: palette.text, borderRadius: 10, padding: 12, marginVertical: 10
        }}
      />
      <FlatList
        data={search.data ?? []}
        keyExtractor={(u: any) => u.id}
        renderItem={({ item }: any) => (
          <ListItem
            title={item.displayName}
            subtitle={`@${item.username}`}
            right={(
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={async () => { await api.post('/friends/request', { toUserId: item.id }); }}
                  style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: palette.primary }}
                >
                  <Text style={{ color: palette.primary, fontWeight: '700' }}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      const res = await api.post('/conversations/dm', { otherUserId: item.id });
                      const conv = res.data.conversation;
                      const title = item.displayName;
                      nav.navigate('Chat', { conversationId: conv.id, title });
                    } catch { }
                  }}
                  style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: palette.primary }}
                >
                  <Text style={{ color: '#0A1020', fontWeight: '700' }}>DM</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      />
    </Screen>
  );
}
