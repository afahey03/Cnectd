import { create } from 'zustand';
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { palette, radius } from './theme';

type ToastState = { msg: string | null; show: (m: string) => void; clear: () => void; };
export const useToast = create<ToastState>(set => ({
  msg: null,
  show: (m) => set({ msg: m }),
  clear: () => set({ msg: null }),
}));

export function ToastHost() {
  const msg = useToast(s => s.msg);
  const clear = useToast(s => s.clear);
  const y = useRef(new Animated.Value(60)).current;

  useEffect(() => {
    if (!msg) return;
    Animated.sequence([
      Animated.timing(y, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(y, { toValue: 60, duration: 180, useNativeDriver: true }),
    ]).start(() => clear());
  }, [msg]);

  if (!msg) return null;

  return (
    <Animated.View style={{
      position: 'absolute', left: 16, right: 16, bottom: 28,
      transform: [{ translateY: y }], zIndex: 1000
    }}>
      <View style={{
        backgroundColor: palette.card, borderColor: palette.border, borderWidth: 1,
        borderRadius: radius.lg, paddingVertical: 10, paddingHorizontal: 14, alignSelf: 'center'
      }}>
        <Text style={{ color: palette.text }}>{msg}</Text>
      </View>
    </Animated.View>
  );
}
