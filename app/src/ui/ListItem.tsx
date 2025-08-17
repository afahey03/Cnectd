import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Avatar from './Avatar';
import { palette } from './theme';

export default function ListItem({
  title, subtitle, onPress, right,
}: { title: string; subtitle?: string; onPress?: () => void; right?: React.ReactNode }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12,
        borderBottomWidth: 1, borderBottomColor: palette.border
      }}>
        <Avatar name={title} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: palette.text, fontWeight: '700' }} numberOfLines={1}>{title}</Text>
          {!!subtitle && (
            <Text style={{ color: palette.textMuted }} numberOfLines={1}>{subtitle}</Text>
          )}
        </View>
        {right ?? null}
      </View>
    </TouchableOpacity>
  );
}
