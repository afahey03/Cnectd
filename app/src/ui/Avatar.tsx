import React from 'react';
import { View, Text } from 'react-native';

export default function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: '#2B2F3A', alignItems: 'center', justifyContent: 'center'
    }}>
      <Text style={{ color: '#E6E9F2', fontWeight: '700' }}>{initials}</Text>
    </View>
  );
}
