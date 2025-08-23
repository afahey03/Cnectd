import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { palette } from './theme';

type Props = {
  mine: boolean;
  content: string;
  time?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'seen';
  showName?: boolean;
  name?: string;
  onLongPress?: () => void;
};

export default function Bubble({
  mine,
  content,
  time,
  status,
  showName,
  name,
  onLongPress,
}: Props) {
  return (
    <View
      style={{
        paddingHorizontal: 12,
        marginVertical: 2,
        alignItems: mine ? 'flex-end' : 'flex-start',
      }}
    >
      {showName && !!name && (
        <Text style={{ color: palette.textMuted, fontSize: 12, marginBottom: 2 }}>
          {name}
        </Text>
      )}

      <Pressable
        onLongPress={onLongPress}
        delayLongPress={250}
        android_ripple={{ color: 'transparent' }}
        hitSlop={8}
        style={{
          maxWidth: '86%',
          borderRadius: 16,
          backgroundColor: mine ? '#1F2A44' : '#121829',
          borderWidth: 1,
          borderColor: palette.border,
          paddingVertical: 8,
          paddingHorizontal: 12,
        }}
      >
        <Text selectable={false} style={{ color: palette.text, fontSize: 16 }}>
          {content}
        </Text>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          {time ? (
            <Text style={{ color: palette.textMuted, fontSize: 11 }}>{time}</Text>
          ) : null}
          {mine && status ? (
            <Text style={{ color: palette.textMuted, fontSize: 11 }}>
              {status === 'sending' ? '…' : status}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}
