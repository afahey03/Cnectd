import React from 'react';
import { View, Text } from 'react-native';
import { palette } from './theme';

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i) | 0;
  return Math.abs(h);
}

const colors = [
  '#4C6FFF', '#12B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#E11D48', '#22C55E'
];

export default function Avatar({
  name,
  size = 36,
  rounded = true,
  color,
}: { name: string; size?: number; rounded?: boolean; color?: string }) {
  const initials = name
    .split(' ')
    .map(s => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const bg = color || colors[hash(name) % colors.length];
  const radius = rounded ? size / 2 : 8;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#00000030',
      }}
    >
      <Text style={{ color: '#0A1020', fontWeight: '800', fontSize: Math.round(size * 0.42) }}>
        {initials || '?'}
      </Text>
    </View>
  );
}
