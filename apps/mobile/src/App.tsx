import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './navigation/RootNavigator';

const queryClient = new QueryClient();

const theme = {
  dark: true,
  colors: {
    primary: '#3b8369',
    background: '#0b1114',
    card: '#121a1f',
    text: '#f5f7f8',
    border: '#26343d',
    notification: '#d8b35d'
  }
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer theme={theme}>
        <RootNavigator />
        <StatusBar style="light" />
      </NavigationContainer>
    </QueryClientProvider>
  );
}
