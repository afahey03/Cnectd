import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { api } from '../api/client';
import { useNavigation } from '@react-navigation/native';

export default function NewGroupScreen() {
  const [memberIdsCsv, setMemberIdsCsv] = useState('');
  const [name, setName] = useState('');
  const nav = useNavigation<any>();

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text>Group name (optional)</Text>
      <TextInput value={name} onChangeText={setName}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }} />

      <Text>Enter member user IDs (comma-separated)</Text>
      <TextInput value={memberIdsCsv} onChangeText={setMemberIdsCsv}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }} />

      <Button title="Create Group" onPress={async () => {
        const ids = memberIdsCsv.split(',').map(s => s.trim()).filter(Boolean);
        if (ids.length === 0) { Alert.alert('Add at least one member id'); return; }
        const res = await api.post('/conversations/group', { name: name || undefined, memberIds: ids });
        nav.navigate('Chat', { conversationId: res.data.conversation.id });
      }} />
    </View>
  );
}
