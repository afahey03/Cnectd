import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import RootNav from './src/navigation';
import { darkTheme } from './src/ui/theme';

const qc = new QueryClient();

export default function App() {
  const scheme = useColorScheme();
  return (
    <QueryClientProvider client={qc}>
      <PaperProvider theme={darkTheme}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <RootNav />
      </PaperProvider>
    </QueryClientProvider>
  );
}
