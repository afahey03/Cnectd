import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { headerHeight, palette } from './theme';

export default function Header({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: palette.card }}>
      <View
        style={{
          height: headerHeight,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: palette.card,
          borderBottomWidth: 1,
          borderBottomColor: palette.border,
          paddingHorizontal: 12,
        }}
      >
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={{ padding: 8, marginRight: 6 }}>
            <Ionicons name="chevron-back" size={22} color={palette.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 38 }} />
        )}

        <Text
          style={{ flex: 1, color: palette.text, fontSize: 18, fontWeight: '700' }}
          numberOfLines={1}
        >
          {title}
        </Text>

        <View style={{ minWidth: 38, alignItems: 'flex-end' }}>{right ?? null}</View>
      </View>
    </SafeAreaView>
  );
}
