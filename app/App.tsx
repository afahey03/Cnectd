import 'react-native-gesture-handler';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RootNav from './src/navigation';

const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <RootNav />
    </QueryClientProvider>
  );
}
