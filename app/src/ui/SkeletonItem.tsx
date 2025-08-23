import React from 'react';
import { View } from 'react-native';
import { palette, radius } from './theme';

export default function SkeletonItem() {
  return (
    <View style={{ paddingVertical: 10, paddingHorizontal: 12 }}>
      <View style={{ height: 16, width: '50%', backgroundColor: palette.inputBg, borderRadius: radius.sm, marginBottom: 8 }} />
      <View style={{ height: 12, width: '30%', backgroundColor: palette.inputBg, borderRadius: radius.sm }} />
    </View>
  );
}
