import React, { useState } from 'react';
import {
  Alert, View, Text, TextInput, FlatList, Pressable, ActivityIndicator,
} from 'react-native';
import Screen from '../ui/Screen';
import ListItem from '../ui/ListItem';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { palette } from '../ui/theme';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../store/auth';

function Segments({
  tabs, value, onChange,
}: { tabs: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={{
      flexDirection: 'row', borderRadius: 10, overflow: 'hidden',
      borderWidth: 1, borderColor: palette.border, marginTop: 10, marginBottom: 12
    }}>
      {tabs.map((t, i) => {
        const active = t === value;
        return (
          <Pressable
            key={t}
            onPress={() => onChange(t)}
            style={{
              flex: 1, paddingVertical: 10, alignItems: 'center',
              backgroundColor: active ? palette.card : 'transparent',
              borderRightWidth: i < tabs.length - 1 ? 1 : 0,
              borderRightColor: palette.border,
            }}
          >
            <Text style={{ color: active ? palette.text : palette.textMuted, fontWeight: '700' }}>
              {t}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function FriendsScreen() {
  const nav = useNavigation<any>();
  const me = useAuth(s => s.user);
  const qc = useQueryClient();

  const [tab, setTab] = useState<'Search' | 'Friends' | 'Requests'>('Search');
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const searchQ = useQuery({
    queryKey: ['friends', 'search', q],
    enabled: tab === 'Search' && q.trim().length >= 1,
    queryFn: async () => {
      const query = q.trim();
      const { data } = await api.get(`/users/search?query=${encodeURIComponent(query)}`);
      const arr = Array.isArray(data?.users) ? data.users : [];
      return me ? arr.filter((u: any) => u.id !== me.id) : arr;
    },
    initialData: [],
    staleTime: 30_000,
  });

  const friendsQ = useQuery({
    queryKey: ['friends', 'list'],
    enabled: tab === 'Friends',
    queryFn: async () => {
      const { data } = await api.get('/friends/list');
      return Array.isArray(data?.friends) ? data.friends : [];
    },
    initialData: [],
    staleTime: 10_000,
  });

  const requestsQ = useQuery({
    queryKey: ['friends', 'requests'],
    enabled: tab === 'Requests',
    queryFn: async () => {
      try {
        const { data } = await api.get('/friends/requests');
        return {
          incoming: Array.isArray(data?.incoming) ? data.incoming : [],
          outgoing: Array.isArray(data?.outgoing) ? data.outgoing : [],
        };
      } catch {
        const { data } = await api.get('/friends/pending');
        return {
          incoming: Array.isArray(data?.incoming) ? data.incoming : [],
          outgoing: Array.isArray(data?.outgoing) ? data.outgoing : [],
        };
      }
    },
    initialData: { incoming: [], outgoing: [] },
    staleTime: 10_000,
  });

  const doDM = async (user: any) => {
    if (busyId) return;
    setBusyId(user.id);
    try {
      const res = await api.post('/conversations/dm', { otherUserId: user.id });
      const conv = res.data.conversation;
      nav.navigate('Chat', { conversationId: conv.id, title: user.displayName });
    } catch (e: any) {
      Alert.alert('Could not start DM', e?.response?.data?.error ?? 'Unknown error');
    } finally {
      setBusyId(null);
    }
  };

  const doAdd = async (user: any) => {
    if (busyId) return;
    setBusyId(user.id);
    try {
      await api.post('/friends/request', { toUserId: user.id });
      Alert.alert('Request sent', `Friend request sent to ${user.displayName}`);
      qc.invalidateQueries({ queryKey: ['friends', 'requests'] });
    } catch (e: any) {
      Alert.alert('Could not send', e?.response?.data?.error ?? 'Unknown error');
    } finally {
      setBusyId(null);
    }
  };

  const doRespond = async (requestId: string, accept: boolean) => {
    if (busyId) return;
    setBusyId(requestId);
    try {
      await api.post('/friends/respond', { requestId, accept });
      if (accept) {
        Alert.alert('Friend added', 'You are now friends!');
        qc.invalidateQueries({ queryKey: ['friends', 'list'] });
      }
      qc.invalidateQueries({ queryKey: ['friends', 'requests'] });
    } catch (e: any) {
      Alert.alert('Could not respond', e?.response?.data?.error ?? 'Unknown error');
    } finally {
      setBusyId(null);
    }
  };

  const doUnfriend = async (user: any) => {
    if (busyId) return;
    setBusyId(user.id);
    try {
      await api.post('/friends/remove', { otherUserId: user.id });
      Alert.alert('Removed', `You and ${user.displayName} are no longer friends.`);
      qc.invalidateQueries({ queryKey: ['friends', 'list'] });
      qc.invalidateQueries({ queryKey: ['friends', 'requests'] });
    } catch (e: any) {
      Alert.alert('Could not remove', e?.response?.data?.error ?? 'Unknown error');
    } finally {
      setBusyId(null);
    }
  };

  const renderUserRow = (user: any, actions: 'search' | 'friend') => {
    const isBusy = busyId === user.id;
    return (
      <ListItem
        title={user.displayName}
        subtitle={`@${user.username}`}
        right={(
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {actions === 'search' ? (
              <>
                <Pressable
                  onPress={() => doAdd(user)}
                  disabled={isBusy}
                  hitSlop={10}
                  style={{
                    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8,
                    borderWidth: 1, borderColor: palette.primary, opacity: isBusy ? 0.5 : 1
                  }}
                >
                  <Text style={{ color: palette.primary, fontWeight: '700' }}>
                    {isBusy ? '...' : 'Add'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => doDM(user)}
                  disabled={isBusy}
                  hitSlop={10}
                  style={{
                    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8,
                    backgroundColor: palette.primary, opacity: isBusy ? 0.5 : 1
                  }}
                >
                  <Text style={{ color: '#0A1020', fontWeight: '700' }}>
                    {isBusy ? '...' : 'DM'}
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  onPress={() => doDM(user)}
                  disabled={isBusy}
                  hitSlop={10}
                  style={{
                    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8,
                    backgroundColor: palette.primary, opacity: isBusy ? 0.5 : 1
                  }}
                >
                  <Text style={{ color: '#0A1020', fontWeight: '700' }}>
                    {isBusy ? '...' : 'DM'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    Alert.alert(
                      'Remove friend?',
                      `Unfriend ${user.displayName}?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Remove', style: 'destructive', onPress: () => doUnfriend(user) },
                      ]
                    )
                  }
                  disabled={isBusy}
                  hitSlop={10}
                  style={{
                    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8,
                    borderWidth: 1, borderColor: palette.border, opacity: isBusy ? 0.5 : 1
                  }}
                >
                  <Text style={{ color: palette.textMuted, fontWeight: '700' }}>
                    {isBusy ? '...' : 'Unfriend'}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        )}
      />
    );
  };

  const renderRequestRow = (req: any, kind: 'incoming' | 'outgoing') => {
    const isBusy = busyId === req.id;
    const other =
      kind === 'incoming' ? req.fromUser ?? req.user : req.toUser ?? req.user;
    const title = other?.displayName ?? other?.username ?? 'User';
    const subtitle = other?.username ? `@${other.username}` : kind === 'incoming' ? 'Incoming request' : 'Outgoing request';
    return (
      <ListItem
        title={title}
        subtitle={subtitle}
        right={(
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {kind === 'incoming' ? (
              <>
                <Pressable
                  onPress={() => doRespond(req.id, true)}
                  disabled={isBusy}
                  hitSlop={10}
                  style={{
                    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8,
                    backgroundColor: palette.primary, opacity: isBusy ? 0.5 : 1
                  }}
                >
                  <Text style={{ color: '#0A1020', fontWeight: '700' }}>
                    {isBusy ? '...' : 'Accept'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => doRespond(req.id, false)}
                  disabled={isBusy}
                  hitSlop={10}
                  style={{
                    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8,
                    borderWidth: 1, borderColor: palette.border, opacity: isBusy ? 0.5 : 1
                  }}
                >
                  <Text style={{ color: palette.textMuted, fontWeight: '700' }}>
                    {isBusy ? '...' : 'Deny'}
                  </Text>
                </Pressable>
              </>
            ) : (
              <View style={{
                paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8,
                borderWidth: 1, borderColor: palette.border
              }}>
                <Text style={{ color: palette.textMuted, fontWeight: '700' }}>Pending</Text>
              </View>
            )}
          </View>
        )}
      />
    );
  };

  const SearchSection = (
    <>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search users"
        placeholderTextColor={palette.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          backgroundColor: palette.inputBg, borderWidth: 1, borderColor: palette.border,
          color: palette.text, borderRadius: 10, padding: 12, marginTop: 10
        }}
        returnKeyType="search"
      />
      {searchQ.isFetching && q.trim().length >= 1 && (
        <View style={{ paddingVertical: 6 }}>
          <ActivityIndicator color={palette.primary} />
        </View>
      )}
      <FlatList
        data={searchQ.data as any[]}
        keyExtractor={(u: any) => u.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => renderUserRow(item, 'search')}
        ListEmptyComponent={
          q.trim().length >= 1 && !searchQ.isFetching ? (
            <View style={{ paddingTop: 24 }}>
              <Text style={{ color: palette.textMuted, textAlign: 'center' }}>
                No users found.
              </Text>
            </View>
          ) : null
        }
      />
    </>
  );

  const FriendsSection = (
    <>
      {friendsQ.isFetching && (
        <View style={{ paddingVertical: 6 }}>
          <ActivityIndicator color={palette.primary} />
        </View>
      )}
      <FlatList
        data={friendsQ.data as any[]}
        keyExtractor={(u: any) => u.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => renderUserRow(item, 'friend')}
        ListEmptyComponent={
          !friendsQ.isFetching ? (
            <View style={{ paddingTop: 24 }}>
              <Text style={{ color: palette.textMuted, textAlign: 'center' }}>
                No friends yet. Try the Search tab.
              </Text>
            </View>
          ) : null
        }
      />
    </>
  );

  const RequestsSection = (
    <>
      {requestsQ.isFetching && (
        <View style={{ paddingVertical: 6 }}>
          <ActivityIndicator color={palette.primary} />
        </View>
      )}

      <Text style={{ color: palette.textMuted, marginTop: 6, marginBottom: 4 }}>Incoming</Text>
      <FlatList
        data={(requestsQ.data as any).incoming}
        keyExtractor={(r: any) => r.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => renderRequestRow(item, 'incoming')}
        ListEmptyComponent={
          !requestsQ.isFetching ? (
            <Text style={{ color: palette.textMuted, textAlign: 'center', marginVertical: 8 }}>
              No incoming requests
            </Text>
          ) : null
        }
      />

      <Text style={{ color: palette.textMuted, marginTop: 12, marginBottom: 4 }}>Outgoing</Text>
      <FlatList
        data={(requestsQ.data as any).outgoing}
        keyExtractor={(r: any) => r.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => renderRequestRow(item, 'outgoing')}
        ListEmptyComponent={
          !requestsQ.isFetching ? (
            <Text style={{ color: palette.textMuted, textAlign: 'center', marginVertical: 8 }}>
              No outgoing requests
            </Text>
          ) : null
        }
      />
    </>
  );

  return (
    <Screen>
      <Segments tabs={['Search', 'Friends', 'Requests']} value={tab} onChange={(t) => setTab(t as any)} />
      {tab === 'Search' && SearchSection}
      {tab === 'Friends' && FriendsSection}
      {tab === 'Requests' && RequestsSection}
    </Screen>
  );
}
