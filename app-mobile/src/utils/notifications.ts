import * as Notifications from 'expo-notifications';

/** Garante permissão antes de usar */
export async function ensurePermission() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
}

/**
 * Agenda notificação para uma data futura usando TimeIntervalTrigger.
 * - Converte a data alvo em "segundos a partir de agora".
 * - Define 'type' explicitamente para compatibilidade com tipagens do seu SDK.
 */
export async function scheduleLocal(title: string, body: string, triggerDate: Date) {
  await ensurePermission();

  const diffMs = triggerDate.getTime() - Date.now();
  const seconds = Math.max(1, Math.round(diffMs / 1000)); // mínimo 1s no futuro

  const trigger: Notifications.TimeIntervalTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds,
    repeats: false
  };

  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger
  });
}
