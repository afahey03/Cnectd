import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  Button,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { api } from '../api/client';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../store/auth';

type Msg = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender?: { id: string; username: string; displayName: string };
  conversationId: string;
};

export default function ChatScreen() {
  const { params }: any = useRoute();
  const { conversationId } = params;
  const socketRef = useSocket();
  const me = useAuth(s => s.user);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<Msg>>(null);

  // initial load
  useEffect(() => {
    (async () => {
      const res = await api.get(`/messages/${conversationId}`);
      setMessages(res.data.messages);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 0);
    })();
  }, [conversationId]);

  // realtime
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;
    const onNew = (payload: { message: Msg }) => {
      if (payload.message.conversationId === conversationId) {
        setMessages(prev => [...prev, payload.message]);
        // scroll on new message
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
      }
    };
    s.on('msg:new', onNew);
    return () => { s.off('msg:new', onNew); };
  }, [socketRef.current, conversationId]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    await api.post(`/messages/${conversationId}`, { content: text });
    // server emits msg:new which updates the list
  };

  const renderItem = ({ item }: { item: Msg }) => {
    const isMe = item.senderId === me?.id;
    const time = new Date(item.createdAt).toLocaleTimeString();
    return (
      <View style={{ paddingVertical: 4, paddingHorizontal: 8 }}>
        {!isMe && (
          <Text style={{ fontSize: 11, color: '#666', marginLeft: 8 }}>
            {item.sender?.displayName ?? item.sender?.username ?? 'User'}
          </Text>
        )}
        <View
          style={{
            alignSelf: isMe ? 'flex-end' : 'flex-start',
            backgroundColor: isMe ? '#DCF8C6' : '#FFFFFF',
            borderWidth: 1,
            borderColor: '#e5e5e5',
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 16,
            maxWidth: '80%',
          }}
        >
          <Text style={{ fontSize: 16 }}>{item.content}</Text>
          <Text style={{ fontSize: 10, color: '#666', marginTop: 4, alignSelf: 'flex-end' }}>
            {time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // adjust if header covers input
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          contentContainerStyle={{ padding: 8, paddingBottom: 12 }}
        />

        <View style={{ flexDirection: 'row', gap: 8, padding: 8, borderTopWidth: 1, borderColor: '#eee' }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Message…"
            style={{ borderWidth: 1, borderColor: '#ddd', flex: 1, padding: 12, borderRadius: 20 }}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <Button title="Send" onPress={send} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
