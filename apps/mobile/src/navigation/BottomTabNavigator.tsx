import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { QuranScreen } from '../screens/QuranScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { LibraryScreen } from '../screens/LibraryScreen';

const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: '#121a1f' },
  headerTintColor: '#f5f7f8',
  headerTitleStyle: { fontWeight: '600' as const },
  tabBarStyle: {
    backgroundColor: '#121a1f',
    borderTopColor: '#26343d',
    paddingBottom: 4,
    paddingTop: 4
  },
  tabBarActiveTintColor: '#3b8369',
  tabBarInactiveTintColor: '#8d9aa2'
};

export function BottomTabNavigator() {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Quran"
        component={QuranScreen}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
      />
    </Tab.Navigator>
  );
}
