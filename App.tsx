import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import { CleppyProvider, useCleppy } from './src/context/CleppyContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { setApiKey } from './src/services/claudeService';
import HomeScreen from './src/screens/HomeScreen';
import AuthScreen from './src/screens/AuthScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DetailScreen from './src/screens/DetailScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { colors, isDark } = useTheme();
  const { setApiKey: setContextApiKey } = useCleppy();

  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('cleppy_api_key');
      if (savedKey) {
        setApiKey(savedKey);
        setContextApiKey(savedKey);
      }
    } catch {}
  }, [setContextApiKey]);

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: isDark ? '#1a1a2e' : colors.surface },
            headerTintColor: colors.accent,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Cleppy' }}
          />
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ title: 'ログイン' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: '設定' }}
          />
          <Stack.Screen
            name="Detail"
            component={DetailScreen}
            options={{ title: '詳細' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <CleppyProvider>
        <ThemeProvider>
          <AppNavigator />
        </ThemeProvider>
      </CleppyProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
