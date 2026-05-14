import * as Notifications from 'expo-notifications';

let configured = false;

export async function notifyChallengeWaiting(count: number) {
  if (count <= 0) return;

  try {
    if (!configured) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      configured = true;
    }

    const permission = await Notifications.getPermissionsAsync();
    let status = permission.status;

    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }

    if (status !== 'granted') return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚔️ Challenge Waiting',
        body: `You have ${count} challenge${count > 1 ? 's' : ''} waiting.`,
        sound: true,
      },
      trigger: null,
    });
  } catch {}
}

