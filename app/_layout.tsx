import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <GestureHandlerRootView style={styles.container}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="event/[id]" options={{ 
          presentation: 'card', 
          animation: 'slide_from_right' 
        }} />
        <Stack.Screen name="modal/cash-out" options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom' 
        }} />
        <Stack.Screen name="modal/change-password" options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom' 
        }} />
        <Stack.Screen name="modal/event-settings" options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom' 
        }} />
        <Stack.Screen name="modal/create-event" options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom' 
        }} />
        <Stack.Screen name="modal/info" options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom' 
        }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});