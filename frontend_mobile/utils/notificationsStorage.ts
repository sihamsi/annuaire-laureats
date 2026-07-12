import AsyncStorage from "@react-native-async-storage/async-storage";

const VIEWED_NOTIFICATIONS_KEY = "@viewed_notifications";

/**
 * Récupère les IDs des notifications consultées pour un utilisateur
 */
export async function getViewedNotifications(userId: number): Promise<number[]> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Sur le web
      const key = `${VIEWED_NOTIFICATIONS_KEY}_${userId}`;
      const viewed = window.localStorage.getItem(key);
      return viewed ? JSON.parse(viewed) : [];
    }

    // Sur mobile natif
    const key = `${VIEWED_NOTIFICATIONS_KEY}_${userId}`;
    const viewed = await AsyncStorage.getItem(key);
    return viewed ? JSON.parse(viewed) : [];
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications consultées:", error);
    return [];
  }
}

/**
 * Marque toutes les notifications d'un utilisateur comme consultées
 */
export async function markAllNotificationsAsViewed(userId: number, notificationIds: number[]): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Sur le web
      const key = `${VIEWED_NOTIFICATIONS_KEY}_${userId}`;
      const existing = await getViewedNotifications(userId);
      const updated = [...new Set([...existing, ...notificationIds])];
      window.localStorage.setItem(key, JSON.stringify(updated));
      return;
    }

    // Sur mobile natif
    const key = `${VIEWED_NOTIFICATIONS_KEY}_${userId}`;
    const existing = await getViewedNotifications(userId);
    const updated = [...new Set([...existing, ...notificationIds])];
    await AsyncStorage.setItem(key, JSON.stringify(updated));
  } catch (error) {
    console.error("Erreur lors du marquage des notifications comme consultées:", error);
  }
}

/**
 * Filtre les notifications pour ne garder que celles non consultées
 */
export function filterUnviewedNotifications(
  notifications: any[],
  viewedIds: number[]
): any[] {
  return notifications.filter((notif) => !viewedIds.includes(notif.id));
}
