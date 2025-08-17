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

const TYPING_TIMEOUT = 1200;
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let t: any; return (...args: Parameters<T>) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

type LocalStatus = 'sending' | 'sent' | 'delivered' | 'seen';

export default function ChatScreen() {
  const { params }: any = useRoute();
  const { conversationId } = params;
  const socketRef = useSocket();
  const me = useAuth(s => s.user);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<Msg>>(null);

  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const statusMapRef = useRef<Record<string, LocalStatus>>({});

  useEffect(() => {
    (async () => {
      const res = await api.get(`/messages/${conversationId}`);
      setMessages(res.data.messages);
      setNextCursor(res.data.nextCursor ?? null);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 0);
    })();
  }, [conversationId]);

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const onNew = (payload: { message: Msg }) => {
      const msg = payload.message;
      if (msg.conversationId !== conversationId) return;

      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    };


    const onTyping = (payload: { userId: string; displayName: string; isTyping: boolean }) => {
      if (!payload || payload.userId === me?.id) return;
      setTypingUsers(prev => {
        const next = { ...prev };
        if (payload.isTyping) next[payload.userId] = payload.displayName;
        else delete next[payload.userId];
        return next;
      });
    };

    const onDelivered = (payload: { messageId: string; toUserId: string }) => {
      const msg = messages.find(m => m.id === payload.messageId);
      if (!msg || msg.senderId !== me?.id) return;
      const current = statusMapRef.current[payload.messageId] || 'sent';
      if (current !== 'seen') {
        statusMapRef.current[payload.messageId] = 'delivered';
        setMessages(prev => [...prev]);
      }
    };

    const onSeen = (payload: { conversationId: string; messageId: string; userId: string }) => {
      if (payload.conversationId !== conversationId) return;
      const msg = messages.find(m => m.id === payload.messageId);
      if (!msg || msg.senderId !== me?.id) return;
      statusMapRef.current[payload.messageId] = 'seen';
      setMessages(prev => [...prev]);
    };

    s.on('msg:new', onNew);
    s.on('typing', onTyping);
    s.on('msg:delivered', onDelivered);
    s.on('msg:seen', onSeen);

    return () => {
      s.off('msg:new', onNew);
      s.off('typing', onTyping);
      s.off('msg:delivered', onDelivered);
      s.off('msg:seen', onSeen);
    };
  }, [socketRef.current, conversationId, me?.id, messages]);

  const loadEarlier = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await api.get(`/messages/${conversationId}`, { params: { cursor: nextCursor } });
      const older: Msg[] = res.data.messages as Msg[];
      setMessages(prev => [...older, ...prev]);
      setNextCursor(res.data.nextCursor ?? null);
    } finally {
      setLoadingMore(false);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !me) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic: Msg = {
      id: tempId,
      content: text,
      createdAt: new Date().toISOString(),
      senderId: me.id,
      sender: { id: me.id, username: me.username, displayName: me.displayName } as any,
      conversationId
    };
    statusMapRef.current[tempId] = 'sending';
    setMessages(prev => [...prev, optimistic]);
    setInput('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      const res = await api.post(`/messages/${conversationId}`, { content: text });
      const serverMsg: Msg = res.data.message;

      setMessages(prev => prev.map(m => (m.id === tempId ? serverMsg : m)));
      delete statusMapRef.current[tempId];
      statusMapRef.current[serverMsg.id] = 'sent';
    } catch {
      setMessages(prev => prev.map(m => (m.id === tempId ? { ...m, content: `${m.content} (failed)` } : m)));
      statusMapRef.current[tempId] = 'sending';
    }
  };

  const renderItem = ({ item }: { item: Msg }) => {
    const isMe = item.senderId === me?.id;
    const time = new Date(item.createdAt).toLocaleTimeString();
    const myStatus = isMe ? (statusMapRef.current[item.id] || 'sent') : null;

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

          {isMe && (
            <Text style={{ fontSize: 10, color: '#888', marginTop: 2, alignSelf: 'flex-end' }}>
              {{
                sending: 'sending…',
                sent: 'sent',
                delivered: 'delivered',
                seen: 'seen'
              }[myStatus!]}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const sendTypingStopped = useRef(debounce(() => {
    socketRef.current?.emit('typing', { conversationId, isTyping: false });
  }, TYPING_TIMEOUT)).current;

  function onChangeTextWithTyping(text: string) {
    setInput(text);
    socketRef.current?.emit('typing', { conversationId, isTyping: true });
    sendTypingStopped();
  }

  const typingNames = Object.values(typingUsers);
  const typingVisible = typingNames.length > 0;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          ListHeaderComponent={
            nextCursor ? (
              <View style={{ paddingVertical: 8, alignItems: 'center' }}>
                <Button title={loadingMore ? 'Loading…' : 'Load earlier'} onPress={loadEarlier} disabled={loadingMore} />
              </View>
            ) : null
          }
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          contentContainerStyle={{ padding: 8, paddingBottom: 12 }}
        />

        {typingVisible && (
          <View style={{ paddingHorizontal: 12, paddingBottom: 4 }}>
            <Text style={{ fontSize: 12, color: '#666' }}>
              {typingNames.join(", ")} {typingNames.length > 1 ? "are" : "is"} typing…
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 8, padding: 8, borderTopWidth: 1, borderColor: '#eee' }}>
          <TextInput
            value={input}
            onChangeText={onChangeTextWithTyping}
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
