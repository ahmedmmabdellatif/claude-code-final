import React, { useEffect, useRef, useMemo } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import createContextHook from '@nkzw/create-context-hook';
import { trpcClient } from '@/lib/trpc';
import { useAuth } from './AuthContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export interface RealtimeContextValue {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  isOnline: boolean;
}

export const [RealtimeProvider, useRealtime] = createContextHook(() => {
  const [expoPushToken, setExpoPushToken] = React.useState<string | null>(null);
  const [notification, setNotification] = React.useState<Notifications.Notification | null>(null);
  const { user } = useAuth();

  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);
  const heartbeatInterval = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!user?.id || Platform.OS === 'web' || !expoPushToken) return;

    trpcClient.pushTokens.register.mutate({
      userId: user.id,
      token: expoPushToken,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
    }).catch(error => console.error('Failed to register push token:', error));
  }, [user?.id, expoPushToken]);

  useEffect(() => {
    if (!user?.id || Platform.OS === 'web') return;

    trpcClient.messages.updatePresence.mutate({
      userId: user.id,
      status: 'online',
    }).catch(error => console.error('Failed to update presence:', error));

    heartbeatInterval.current = setInterval(() => {
      if (user?.id) {
        trpcClient.messages.heartbeat.mutate({
          userId: user.id,
        }).catch(error => console.error('Heartbeat failed:', error));
      }
    }, 15000);

    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      if (user?.id) {
        trpcClient.messages.updatePresence.mutate({
          userId: user.id,
          status: 'offline',
        }).catch(error => console.error('Failed to update presence:', error));
      }
    };
  }, [user?.id]);

  const value = useMemo<RealtimeContextValue>(() => ({
    expoPushToken,
    notification,
    isOnline: true,
  }), [expoPushToken, notification]);

  return value;
});

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') {
    return null;
  }

  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID || 'your-project-id',
    })).data;
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token || null;
}
