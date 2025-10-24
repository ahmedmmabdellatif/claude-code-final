import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { trpc, trpcClient } from '@/lib/trpc';
import { AuthProvider } from '@/contexts/AuthContext';
import { RealtimeProvider } from '@/contexts/RealtimeContext';
import { ErrorBoundary, ToastManager, OfflineBanner } from '@/components';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="role-selector" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="client" />
      <Stack.Screen name="coach" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RealtimeProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                  <RootLayoutNav />
                  <OfflineBanner />
                  <ToastManager />
                </View>
              </GestureHandlerRootView>
            </RealtimeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}
