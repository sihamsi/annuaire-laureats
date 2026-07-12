// utils/notifications.ts
// Utilitaires pour les notifications locales
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Demander les permissions de notification
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Permission de notification refusée');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la demande de permission:', error);
    return false;
  }
}

/**
 * Envoyer une notification locale
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: any
): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Notification immédiate
    });

    return notificationId;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
    return null;
  }
}

/**
 * Notification pour inscription validée
 */
export async function notifyInscriptionValidated(): Promise<void> {
  await sendLocalNotification(
    '🎉 Inscription validée !',
    'Félicitations ! Votre inscription a été approuvée par l\'administrateur.',
    { type: 'inscription_validated' }
  );
}

/**
 * Notification pour inscription rejetée
 */
export async function notifyInscriptionRejected(motif?: string): Promise<void> {
  await sendLocalNotification(
    '❌ Inscription refusée',
    motif 
      ? `Votre inscription a été refusée. Motif : ${motif}`
      : 'Votre inscription a été refusée. Vous pouvez la modifier et la soumettre à nouveau.',
    { type: 'inscription_rejected', motif }
  );
}

/**
 * Configurer l'écouteur de notifications (pour navigation)
 */
export function setupNotificationListener(
  onNotificationReceived: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(onNotificationReceived);
}

/**
 * Supprimer l'écouteur de notifications
 */
export function removeNotificationListener(
  subscription: Notifications.Subscription
): void {
  subscription.remove();
}
