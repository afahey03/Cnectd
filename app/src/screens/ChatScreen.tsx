import React, { useEffect, useRef, useState } from 'react';
import { View, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { api } from '../api/client';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../store/auth';
import Screen from '../ui/Screen';
import Bubble from '../ui/Bubble';
import InputBar from '../ui/InputBar';
import { FlatList } from 'react-native';

type Msg = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender?: { id: string; username: string; displayName: string };
  conversationId: string;
};

type LocalStatus = 'sending' | 'sent' | 'delivered' | 'seen';

const TYPING_TIMEOUT = 1200;
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let t: any; return (...args: Parameters<T>) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

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
      scrollToBottom(false);
    })();
  }, [conversationId]);

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const onNew = (payload: { message: Msg }) => {
      const msg = payload.message;
      if (msg.conversationId !== conversationId) return;
      setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);

      if (msg.senderId !== me?.id) {
        void api.post('/receipts/delivered', { messageId: msg.id });
        void api.post('/receipts/seen', { conversationId, messageId: msg.id });
      }
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
      const mine = messages.find(m => m.id === payload.messageId)?.senderId === me?.id;
      if (!mine) return;
      if (statusMapRef.current[payload.messageId] !== 'seen') {
        statusMapRef.current[payload.messageId] = 'delivered';
        setMessages(prev => [...prev]);
      }
    };

    const onSeen = (payload: { conversationId: string; messageId: string; userId: string }) => {
      if (payload.conversationId !== conversationId) return;
      const mine = messages.find(m => m.id === payload.messageId)?.senderId === me?.id;
      if (!mine) return;
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

      setMessages(prev => {
        const hasServerAlready = prev.some(m => m.id === serverMsg.id);
        if (hasServerAlready) {
          return prev.filter(m => m.id !== tempId);
        }
        return prev.map(m => (m.id === tempId ? serverMsg : m));
      });

      delete statusMapRef.current[tempId];
      statusMapRef.current[serverMsg.id] = 'sent';
    } catch {
      setMessages(prev =>
        prev.map(m => (m.id === tempId ? { ...m, content: `${m.content} (failed)` } : m))
      );
      statusMapRef.current[tempId] = 'sending';
    }
  };

  const renderItem = ({ item }: { item: Msg }) => {
    const isMe = item.senderId === me?.id;
    const time = new Date(item.createdAt).toLocaleTimeString();
    const status = isMe ? (statusMapRef.current[item.id] || 'sent') : undefined;

    return (
      <Bubble
        mine={isMe}
        content={item.content}
        time={time}
        status={status}
        showName={!isMe}
        name={item.sender?.displayName ?? item.sender?.username ?? 'User'}
      />
    );
  };

  const sendTypingStopped = useRef(debounce(() => {
    socketRef.current?.emit('typing', { conversationId, isTyping: false });
  }, TYPING_TIMEOUT)).current;

  const typingNames = Object.values(typingUsers);
  const typingVisible = typingNames.length > 0;


  const scrollToBottom = (animated = false) =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated }), 0);

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View style={{ flex: 1 }}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={renderItem}
            ListHeaderComponent={
              nextCursor ? (
                <View style={{ paddingVertical: 8, alignItems: 'center' }}>
                  <Text onPress={loadEarlier} style={{ color: '#4C6FFF', fontWeight: '600' }}>
                    {loadingMore ? 'Loading…' : 'Load earlier'}
                  </Text>
                </View>
              ) : null
            }
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 8 }}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          />
          {typingVisible && (
            <View style={{ paddingHorizontal: 12, paddingBottom: 4 }}>
              <Text style={{ fontSize: 12, color: '#94A0B4' }}>
                {typingNames.join(', ')} {typingNames.length > 1 ? 'are' : 'is'} typing…
              </Text>
            </View>
          )}
          <InputBar
            value={input}
            onChangeText={(t) => {
              setInput(t);
              socketRef.current?.emit('typing', { conversationId, isTyping: true });
              sendTypingStopped();
            }}
            onSend={send}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
