import React, { useEffect, useState } from 'react';
import { View, TextInput, FlatList, Text, Button } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { api } from '../api/client';
import { useSocket } from '../hooks/useSocket';

export default function ChatScreen() {
  const { params }: any = useRoute();
  const { conversationId } = params;
  const socketRef = useSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    (async () => {
      const res = await api.get(`/messages/${conversationId}`);
      setMessages(res.data.messages);
    })();
  }, [conversationId]);

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;
    const onNew = (payload: any) => {
      if (payload.message.conversationId === conversationId) {
        setMessages(prev => [...prev, payload.message]);
      }
    };
    s.on('msg:new', onNew);
    return () => { s.off('msg:new', onNew); };
  }, [socketRef.current, conversationId]);

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 6 }}>
            <Text style={{ opacity: 0.6, fontSize: 12 }}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
            <Text>{item.content}</Text>
          </View>
        )}
      />
      <View style={{ flexDirection: 'row', columnGap: 8 }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Message…"
          style={{ borderWidth: 1, flex: 1, padding: 12, borderRadius: 8 }}
        />
        <Button title="Send" onPress={async () => {
          const text = input.trim();
          if (!text) return;
          await api.post(`/messages/${conversationId}`, { content: text });
          setInput('');
        }} />
      </View>
    </View>
  );
}
