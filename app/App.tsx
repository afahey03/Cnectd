import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootNav from './src/navigation';
import { darkTheme } from './src/ui/theme';

const qc = new QueryClient();

export default function App() {
  const scheme = useColorScheme();

  return (
    <QueryClientProvider client={qc}>
      <PaperProvider theme={darkTheme}>
        <SafeAreaProvider>
          {/* Keep content below the status bar */}
          <StatusBar barStyle="light-content" backgroundColor={darkTheme.colors.background as string} translucent={false} />
          <RootNav />
        </SafeAreaProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
