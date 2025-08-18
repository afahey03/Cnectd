import React from 'react';
import { View, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette } from './theme';

export default function Screen(props: ViewProps) {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: palette.bg }}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <View {...props} style={[{ flex: 1, paddingHorizontal: 16 }, props.style]} />
    </SafeAreaView>
  );
}
