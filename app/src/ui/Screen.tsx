import React from 'react';
import { SafeAreaView, View, ViewProps } from 'react-native';
import { palette } from './theme';

export default function Screen(props: ViewProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>
      <View {...props} style={[{ flex: 1, paddingHorizontal: 16 }, props.style]} />
    </SafeAreaView>
  );
}
