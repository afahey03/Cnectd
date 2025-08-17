import axios from 'axios';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({ baseURL: API_URL });

export function setAuthToken(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}
