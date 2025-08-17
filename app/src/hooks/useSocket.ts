import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '../api/client';
import { useAuth } from '../store/auth';

export function useSocket() {
  const token = useAuth(s => s.token);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;
    const s = io(API_URL, { auth: { token } });
    socketRef.current = s;
    return () => { s.disconnect(); socketRef.current = null; };
  }, [token]);

  return socketRef;
}
