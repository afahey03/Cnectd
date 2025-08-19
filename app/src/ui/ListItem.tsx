import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Avatar from './Avatar';
import { palette } from './theme';

export default function ListItem({
  title, subtitle, onPress, left, right,
}: {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  left?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: palette.border,
      }}
    >
      {left ? <View style={{ marginRight: 12 }}>{left}</View> : null}

      <View style={{ flex: 1 }}>
        <Text style={{ color: palette.text, fontWeight: '700' }} numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text style={{ color: palette.textMuted }} numberOfLines={1}>{subtitle}</Text>
        ) : null}
      </View>

      {right ? <View style={{ marginLeft: 12 }}>{right}</View> : null}
    </Pressable>
  );
}

