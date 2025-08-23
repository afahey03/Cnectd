import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api, setAuthToken } from '../api/client';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

type User = { id: string; username: string; displayName: string; avatarColor?: string };

type AuthState = {
  user: User | null;
  token: string | null;
  deviceId: string | null;
  init: () => Promise<void>;
  register: (username: string, displayName: string) => Promise<void>;
  login: (username: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  deviceId: null,

  init: async () => {
    let deviceId = await SecureStore.getItemAsync('deviceId');
    if (!deviceId) {
      deviceId = uuidv4();
      await SecureStore.setItemAsync('deviceId', deviceId);
    }
    const token = await SecureStore.getItemAsync('token');
    if (token) setAuthToken(token);
    set({ token, deviceId });
    if (token) {
      try {
        const me = await api.get('/users/me').then(r => r.data.user as User);
        set({ user: me });
      } catch {
        await SecureStore.deleteItemAsync('token');
        setAuthToken(null);
        set({ token: null, user: null });
      }
    }
  },

  register: async (username, displayName) => {
    const res = await api.post('/auth/register', { username, displayName });
    const { token, user } = res.data as { token: string; user: User };
    await SecureStore.setItemAsync('token', token);
    setAuthToken(token);
    set({ token, user });
  },

  login: async (username) => {
    try {
      const res = await api.post('/auth/login', { username });
      const { token, user } = res.data as { token: string; user: User };
      await SecureStore.setItemAsync('token', token);
      setAuthToken(token);
      set({ token, user });
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Could not sign in';
      if (e?.response?.status === 410) {
        await SecureStore.deleteItemAsync('token');
        setAuthToken(null);
        set({ token: null, user: null });
      }
      throw new Error(msg);
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    setAuthToken(null);
    set({ token: null, user: null });
  }
}));
