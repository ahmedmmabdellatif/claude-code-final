import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
}

export async function registerForPushNotificationsAsync(): Promise<PushNotificationToken | null> {
  if (Platform.OS === 'web') {
    console.log('Push notifications are not available on web');
    return null;
  }

  let token: string;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission not granted for push notifications');
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    console.log('Must use physical device for Push Notifications');
    return null;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#58CC02',
    });
  }

  return {
    token,
    platform: Platform.OS as 'ios' | 'android',
  };
}

export async function schedulePushNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
  seconds: number = 60
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: { seconds } as any,
  });

  return notificationId;
}

export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null,
  });

  return notificationId;
}

export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getBadgeCount(): Promise<number> {
  if (Platform.OS === 'web') {
    return 0;
  }
  return await Notifications.getBadgeCountAsync();
}

export async function setBadgeCount(count: number): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  await Notifications.setBadgeCountAsync(count);
}

export async function clearBadgeCount(): Promise<void> {
  await setBadgeCount(0);
}

export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

export type NotificationType = 
  | 'workout_reminder'
  | 'meal_reminder'
  | 'checkin_reminder'
  | 'new_message'
  | 'plan_updated'
  | 'achievement'
  | 'low_adherence';

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export const NotificationTemplates: Record<NotificationType, (data: any) => NotificationPayload> = {
  workout_reminder: (data) => ({
    type: 'workout_reminder',
    title: '💪 Time to Train!',
    body: `Your ${data.workoutName} workout is scheduled for today`,
    data: { taskId: data.taskId },
  }),
  
  meal_reminder: (data) => ({
    type: 'meal_reminder',
    title: '🍽️ Meal Time!',
    body: `Don't forget your ${data.mealName}`,
    data: { mealId: data.mealId },
  }),
  
  checkin_reminder: (data) => ({
    type: 'checkin_reminder',
    title: '📊 Weekly Check-in Due',
    body: 'Time to log your weight and progress photos',
    data: {},
  }),
  
  new_message: (data) => ({
    type: 'new_message',
    title: `💬 New message from ${data.senderName}`,
    body: data.messagePreview,
    data: { conversationId: data.conversationId },
  }),
  
  plan_updated: (data) => ({
    type: 'plan_updated',
    title: '🎯 Plan Updated!',
    body: `Your coach has updated your ${data.planType} plan`,
    data: { planId: data.planId },
  }),
  
  achievement: (data) => ({
    type: 'achievement',
    title: `🏆 ${data.achievementTitle}`,
    body: data.achievementMessage,
    data: { achievementId: data.achievementId },
  }),
  
  low_adherence: (data) => ({
    type: 'low_adherence',
    title: '⚠️ Stay on Track!',
    body: `You've missed ${data.missedWorkouts} workouts this week. Let's get back on track!`,
    data: {},
  }),
};

export async function sendTemplateNotification(
  type: NotificationType,
  data: any
): Promise<string> {
  const notification = NotificationTemplates[type](data);
  return sendLocalNotification(notification.title, notification.body, notification.data);
}

export function useNotificationHandlers() {
  const handleNotificationReceived = (notification: Notifications.Notification) => {
    console.log('Notification received:', notification);
  };

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    console.log('Notification response:', response);
    const notificationData = response.notification.request.content.data as any;
    const type = notificationData?.type;

    switch (type) {
      case 'new_message':
        break;
      case 'plan_updated':
        break;
      case 'workout_reminder':
        break;
      default:
        break;
    }
  };

  return {
    handleNotificationReceived,
    handleNotificationResponse,
  };
}
