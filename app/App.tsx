import 'react-native-gesture-handler';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider, adaptNavigationTheme } from 'react-native-paper';
import RootNav from './src/navigation';
import { darkTheme, lightTheme } from './src/ui/theme';
import { useColorScheme } from 'react-native';

const qc = new QueryClient();

export default function App() {
  const scheme = useColorScheme() || 'light';
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  return (
    <QueryClientProvider client={qc}>
      <PaperProvider theme={theme}>
        <RootNav />
      </PaperProvider>
    </QueryClientProvider>
  );
}
