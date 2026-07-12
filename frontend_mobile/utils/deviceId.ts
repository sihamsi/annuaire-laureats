import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

const DEVICE_ID_STORAGE_KEY = '@app_device_id';

/**
 * Obtenir un identifiant unique pour l'appareil
 * Utilise plusieurs sources pour garantir un ID unique et persistant
 * Sur le web, utilise localStorage pour persister l'ID
 */
export async function getDeviceId(): Promise<string> {
  try {
    // Sur le web, utiliser localStorage pour persister l'ID
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedId = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
        if (storedId) {
          return storedId;
        }
        // Générer un nouvel ID pour le web
        const webId = `web_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, webId);
        return webId;
      }
      // Fallback si localStorage n'est pas disponible
      return `web_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    // Sur mobile natif, utiliser les APIs natives
    // Essayer d'obtenir l'ID d'installation (le plus fiable)
    if (Application.androidId) {
      return `android_${Application.androidId}`;
    }

    // Pour iOS, utiliser l'identifiant de l'application
    try {
      if (Application.getIosIdForVendorAsync) {
        const iosId = await Application.getIosIdForVendorAsync();
        if (iosId) {
          return `ios_${iosId}`;
        }
      }
    } catch (iosError) {
      // Ignorer l'erreur iOS et continuer avec le fallback
      console.warn('Impossible de récupérer l\'ID iOS:', iosError);
    }

    // Fallback : utiliser une combinaison d'informations de l'appareil
    const deviceInfo = [
      Device.modelName || 'unknown',
      Device.osName || 'unknown',
      Device.osVersion || 'unknown',
      Constants.sessionId || 'unknown',
    ].join('_');

    return `device_${deviceInfo}`;
  } catch (error) {
    console.error('Erreur lors de la récupération du deviceId:', error);
    // Dernier recours : générer un ID aléatoire
    const fallbackId = `random_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Sur le web, sauvegarder dans localStorage
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, fallbackId);
      } catch (e) {
        // Ignorer les erreurs de localStorage
      }
    }
    
    return fallbackId;
  }
}

