import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { palette } from './theme';

export default function InputBar({
  value, onChangeText, onSend,
}: { value: string; onChangeText: (t: string) => void; onSend: () => void; }) {
  return (
    <View style={{
      flexDirection: 'row', gap: 8, padding: 10, borderTopWidth: 1,
      borderColor: palette.border, backgroundColor: palette.card
    }}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Message…"
        placeholderTextColor={palette.textMuted}
        style={{
          flex: 1, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 20,
          color: palette.text, backgroundColor: palette.inputBg, borderWidth: 1, borderColor: palette.border
        }}
        onSubmitEditing={onSend}
        returnKeyType="send"
        autoCapitalize="sentences"
        autoCorrect
      />
      <TouchableOpacity
        onPress={onSend}
        style={{
          backgroundColor: palette.primary, borderRadius: 16, paddingHorizontal: 14,
          alignItems: 'center', justifyContent: 'center'
        }}>
        <Text style={{ color: '#0A1020', fontWeight: '700' }}>Send</Text>
      </TouchableOpacity>
    </View>
  );
}
