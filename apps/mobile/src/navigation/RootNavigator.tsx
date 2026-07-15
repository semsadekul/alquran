import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { SurahReaderScreen } from '../screens/SurahReaderScreen';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen 
        name="SurahReader" 
        component={SurahReaderScreen} 
        options={{ 
          headerShown: true, 
          headerStyle: { backgroundColor: '#121a1f' },
          headerTintColor: '#f5f7f8',
          headerTitleStyle: { fontWeight: '600' }
        }} 
      />
    </Stack.Navigator>
  );
}
