import React from 'react';
import { View, TextInput, Button, Platform } from 'react-native';

export default function InputBar({
  value, onChangeText, onSend,
}: {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, padding: 8, borderTopWidth: 1, borderColor: '#1E2430' }}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Message…"
        placeholderTextColor="#666"
        style={{
          borderWidth: 1,
          borderColor: '#2A3344',
          flex: 1,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 20,
          color: '#111',
          backgroundColor: '#fff'
        }}
        onSubmitEditing={onSend}
        returnKeyType="send"
        autoCapitalize="sentences"
        autoCorrect
      />
      <Button title="Send" onPress={onSend} />
    </View>
  );
}
