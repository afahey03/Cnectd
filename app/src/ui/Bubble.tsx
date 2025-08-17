import React from 'react';
import { View, Text } from 'react-native';
import { colors } from './theme';

export default function Bubble({
  mine,
  content,
  time,
  status, // 'sending'|'sent'|'delivered'|'seen'|undefined
  showName,
  name,
}: {
  mine: boolean;
  content: string;
  time: string;
  status?: string;
  showName?: boolean;
  name?: string;
}) {
  return (
    <View style={{ paddingVertical: 6, paddingHorizontal: 8 }}>
      {!mine && showName && (
        <Text style={{ fontSize: 11, color: '#94A0B4', marginLeft: 8, marginBottom: 2 }}>
          {name}
        </Text>
      )}
      <View style={{
        alignSelf: mine ? 'flex-end' : 'flex-start',
        backgroundColor: mine ? colors.bubbleMineSoft : colors.bubbleOther,
        borderWidth: 1,
        borderColor: mine ? 'rgba(0,0,0,0.05)' : colors.border,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 16,
        maxWidth: '80%',
      }}>
        <Text style={{ fontSize: 16, color: mine ? '#0B0D12' : '#E6E9F2' }}>{content}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, alignSelf: 'flex-end' }}>
          <Text style={{ fontSize: 10, color: mine ? '#4A4A4A' : '#94A0B4' }}>{time}</Text>
          {mine && (
            <Text style={{ fontSize: 10, color: status === 'seen' ? colors.primary : '#94A0B4' }}>
              {status ?? 'sent'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
