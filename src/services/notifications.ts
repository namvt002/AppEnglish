import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  getNudgeConfig,
  listReminderSlots,
} from '../db/repository';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let channelReady = false;

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android' || channelReady) return;
  await Notifications.setNotificationChannelAsync('study-default', {
    name: 'Nhắc học',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
  });
  channelReady = true;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  await ensureAndroidChannel();
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

function padTime(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Reschedule all local notifications from SQLite (call after DB changes). */
export async function rescheduleAllNotifications(): Promise<void> {
  await ensureAndroidChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();

  const slots = await listReminderSlots();
  const nudge = await getNudgeConfig();

  const channelId = Platform.OS === 'android' ? 'study-default' : undefined;

  for (const slot of slots) {
    await Notifications.scheduleNotificationAsync({
      identifier: `study-${slot.id}`,
      content: {
        title: 'Đến giờ học tiếng Anh',
        body: `Hãy mở app và điểm danh — khung giờ ${padTime(slot.hour, slot.minute)}`,
        sound: true,
        ...(channelId ? { android: { channelId } } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: slot.hour,
        minute: slot.minute,
        ...(channelId ? { channelId } : {}),
      },
    });
  }

  if (nudge.enabled) {
    await Notifications.scheduleNotificationAsync({
      identifier: 'nudge-not-checked-in',
      content: {
        title: 'Bạn đã điểm danh chưa?',
        body: 'Nếu chưa học hôm nay, mở app và bấm “Điểm danh hôm nay” để giữ chuỗi ngày.',
        sound: true,
        ...(channelId ? { android: { channelId } } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: nudge.hour,
        minute: nudge.minute,
        ...(channelId ? { channelId } : {}),
      },
    });
  }
}
