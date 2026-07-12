import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { Colors, Spacing, BorderRadius, Shadows, Typography } from "../../constants/theme";
import { getLaureatById } from "../../services/laureats.api";
import { getNotificationsByLaureat, Notification } from "../../services/notifications.api";
import { markAllNotificationsAsViewed } from "../../utils/notificationsStorage";
import Header from "../../components/Header";

// Notification Card Component
function NotificationCard({ type, title, message, time, onPress, actionLabel }: any) {
  const colors = {
    success: {
      bg: Colors.successBg,
      text: Colors.successText,
      icon: 'checkmark-circle' as const,
      iconColor: Colors.success,
    },
    error: {
      bg: Colors.errorBg,
      text: Colors.errorText,
      icon: 'close-circle' as const,
      iconColor: Colors.error,
    },
    info: {
      bg: Colors.infoBg,
      text: Colors.infoText,
      icon: 'information-circle' as const,
      iconColor: Colors.info,
    },
  };

  const colorScheme = colors[type as keyof typeof colors] || colors.info;

  return (
    <View style={[styles.notificationCard, { backgroundColor: Colors.white }]}>
      <View style={styles.notificationHeader}>
        <View style={[styles.iconContainer, { backgroundColor: colorScheme.bg }]}>
          <Ionicons name={colorScheme.icon} size={20} color={colorScheme.iconColor} />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{title}</Text>
          <Text style={styles.notificationMessage}>{message}</Text>
          {time && <Text style={styles.notificationTime}>{time}</Text>}
          {onPress && actionLabel && (
            <Pressable style={styles.actionButton} onPress={onPress}>
              <Text style={styles.actionButtonText}>{actionLabel}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [laureat, setLaureat] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(tabs)/index");
      return;
    }
    loadData();
  }, [isAuthenticated, user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (!user?.id) {
        setLaureat(null);
        setNotifications([]);
        return;
      }
      
      // Charger le profil et les notifications en parallèle
      const [laureatData, notificationsData] = await Promise.all([
        getLaureatById(user.id).catch(() => null),
        getNotificationsByLaureat(user.id),
      ]);
      
      setLaureat(laureatData);
      setNotifications(notificationsData);
      
      // Marquer toutes les notifications comme consultées
      if (notificationsData.length > 0 && user?.id) {
        const relevantNotifications = notificationsData.filter(
          (notif) => notif.type === "VALIDATION" || notif.type === "REJET"
        );
        const notificationIds = relevantNotifications.map((notif) => notif.id);
        if (notificationIds.length > 0) {
          await markAllNotificationsAsViewed(user.id, notificationIds);
        }
      }
    } catch (error: any) {
      console.error("Erreur chargement données:", error);
      setLaureat(null);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Formater les notifications pour l'affichage
  const formatNotifications = () => {
    const formatted: any[] = [];
    
    // Filtrer uniquement les notifications de validation et rejet
    const relevantNotifications = notifications.filter(
      (notif) => notif.type === "VALIDATION" || notif.type === "REJET"
    );
    
    // Trier par date (plus récentes en premier)
    relevantNotifications.sort((a, b) => 
      new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
    
    relevantNotifications.forEach((notif) => {
      if (notif.type === "REJET") {
        // Notification de rejet avec possibilité de modification
        formatted.push({
          type: "error",
          title: "Inscription rejetée",
          message: notif.message,
          time: formatDate(notif.sentAt),
          onPress: () => {
            if (laureat?.id) {
              router.push(`/(tabs)/inscription?edit=true&id=${laureat.id}${laureat.motifRejet ? `&motif=${encodeURIComponent(laureat.motifRejet)}` : ''}`);
            } else {
              router.push("/(tabs)/inscription");
            }
          },
          actionLabel: "Modifier le profil",
        });
      } else if (notif.type === "VALIDATION") {
        // Notification de validation
        formatted.push({
          type: "success",
          title: "Inscription validée",
          message: notif.message,
          time: formatDate(notif.sentAt),
        });
      }
    });
    
    return formatted;
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return "À l'instant";
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
      
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const displayNotifications = formatNotifications();

  return (
    <View style={styles.container}>
      <Header title="Notifications" />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {displayNotifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={64} color={Colors.gray400} />
              <Text style={styles.emptyText}>Aucune notification</Text>
              <Text style={styles.emptySubtext}>
                Vous recevrez une notification lorsque votre inscription sera validée ou rejetée par l'administrateur.
              </Text>
            </View>
          ) : (
            displayNotifications.map((notification, index) => (
              <NotificationCard key={index} {...notification} />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 120,
  },
  notificationCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  iconContainer: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.gray800,
    marginBottom: Spacing.xs,
  },
  notificationMessage: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray600,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray400,
    marginTop: Spacing.xs,
  },
  actionButton: {
    marginTop: Spacing.md,
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.gray500,
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray400,
    marginTop: Spacing.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
});
