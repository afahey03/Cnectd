import React from 'react';
import { View, Text } from 'react-native';
import { palette } from './theme';

export default function Bubble({
  mine, content, time, status, showName, name,
}: {
  mine: boolean; content: string; time: string; status?: string; showName?: boolean; name?: string;
}) {
  return (
    <View style={{ paddingVertical: 6, paddingHorizontal: 8 }}>
      {!mine && showName && (
        <Text style={{ fontSize: 11, color: palette.textMuted, marginLeft: 8, marginBottom: 2 }}>{name}</Text>
      )}
      <View style={{
        alignSelf: mine ? 'flex-end' : 'flex-start',
        backgroundColor: mine ? palette.bubbleMine : palette.bubbleOther,
        borderWidth: 1, borderColor: palette.border, paddingVertical: 10, paddingHorizontal: 14,
        borderRadius: 16, maxWidth: '80%',
      }}>
        <Text style={{ fontSize: 16, color: palette.text }}>{content}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, alignSelf: 'flex-end' }}>
          <Text style={{ fontSize: 10, color: palette.textMuted }}>{time}</Text>
          {mine && (
            <Text style={{ fontSize: 10, color: status === 'seen' ? palette.primary : palette.textMuted }}>
              {status ?? 'sent'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
