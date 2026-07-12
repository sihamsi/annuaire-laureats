import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../contexts/AuthContext";
import { getLaureatsByStatut } from "../../services/laureats.api";
import { getNotificationsByLaureat } from "../../services/notifications.api";

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    loadStats();
    if (isAuthenticated && user?.id) {
      loadNotifications();
    }
  }, [isAuthenticated, user?.id]);

  const loadStats = async () => {
    try {
      const [publishedRes, pendingRes] = await Promise.all([
        getLaureatsByStatut("published"),
        getLaureatsByStatut("pending"),
      ]);

      const published = Array.isArray((publishedRes as any)?.data) 
        ? (publishedRes as any).data.length
        : Array.isArray(publishedRes) 
        ? publishedRes.length 
        : 0;

      const pending = Array.isArray((pendingRes as any)?.data) 
        ? (pendingRes as any).data.length
        : Array.isArray(pendingRes) 
        ? pendingRes.length 
        : 0;

      setStats({
        total: published + pending,
        published,
        pending,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      if (!user?.id) return;
      const notifications = await getNotificationsByLaureat(user.id);
      // Compter uniquement les notifications de validation et rejet (non lues)
      const relevantNotifications = notifications.filter(
        (notif) => notif.type === "VALIDATION" || notif.type === "REJET"
      );
      setNotificationCount(relevantNotifications.length);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
      setNotificationCount(0);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header avec gradient */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              {isAuthenticated ? `Bonjour, ${user?.prenom || ""}` : "Bienvenue"}
            </Text>
            {!isAuthenticated && (
              <Text style={styles.subtitle}>
                Réseau des Lauréats EHTP
              </Text>
            )}
          </View>
          
          {isAuthenticated && (
            <Pressable 
              style={styles.notificationButton}
              onPress={() => router.push("/(tabs)/notifications")}
            >
              <Ionicons name="notifications" size={24} color="#FFFFFF" />
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </Text>
                </View>
              )}
            </Pressable>
          )}
        </View>

        {/* Statistiques dans le header */}
        <View style={styles.statsCard}>
          <View style={styles.statsContent}>
            <View style={styles.statsIcon}>
              <Ionicons name="people" size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.statsNumber}>
                {loading ? "..." : stats.total.toLocaleString()}
              </Text>
              <Text style={styles.statsLabel}>Lauréats inscrits</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Accès rapide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accès rapide</Text>
          
          <View style={styles.quickAccessGrid}>
            <Pressable 
              style={styles.quickAccessCard}
              onPress={() => router.push("/(tabs)/annuaire")}
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: "#E8F5E9" }]}>
                <Ionicons name="people" size={24} color="#6B7F5C" />
              </View>
              <Text style={styles.quickAccessTitle}>Annuaire</Text>
              <Text style={styles.quickAccessDescription}>Consulter les membres</Text>
            </Pressable>

            <Pressable 
              style={styles.quickAccessCard}
              onPress={() => router.push("/(tabs)/map")}
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: "#E8F5E9" }]}>
                <Ionicons name="map" size={24} color="#6B7F5C" />
              </View>
              <Text style={styles.quickAccessTitle}>Carte</Text>
              <Text style={styles.quickAccessDescription}>Vue géographique</Text>
            </Pressable>
          </View>
        </View>

        {/* Statistiques détaillées */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          
          <View style={styles.statisticsCard}>
            <Text style={styles.statisticsTitle}>Répartition par secteur</Text>
            
            <View style={styles.progressSection}>
              <View style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Public</Text>
                  <Text style={styles.progressValue}>65%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: "65%", backgroundColor: "#6B7F5C" }]} />
                </View>
              </View>
              
              <View style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Privé</Text>
                  <Text style={styles.progressValue}>35%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: "35%", backgroundColor: "#8A9B7A" }]} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {!isAuthenticated && (
          <View style={styles.section}>
            <View style={styles.ctaCard}>
              <View style={styles.ctaIcon}>
                <Ionicons name="person-add" size={32} color="#6B7F5C" />
              </View>
              <Text style={styles.ctaTitle}>Rejoignez le réseau</Text>
              <Text style={styles.ctaDescription}>
                Inscrivez-vous pour accéder à toutes les fonctionnalités et rester connecté avec vos camarades
              </Text>
              <Pressable 
                style={styles.ctaButton}
                onPress={() => router.push("/(tabs)/inscription")}
              >
                <Text style={styles.ctaButtonText}>S'inscrire maintenant</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F0", // --color-background
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 80,
    backgroundColor: "#6B7F5C", // --color-primary
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  statsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 16,
    backdropFilter: "blur(10px)",
  },
  statsContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  statsIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 12,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statsLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  content: {
    flex: 1,
    marginTop: -60,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  quickAccessGrid: {
    flexDirection: "row",
    gap: 16,
  },
  quickAccessCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  quickAccessDescription: {
    fontSize: 12,
    color: "#6b7280",
  },
  statisticsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statisticsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  progressSection: {
    gap: 12,
  },
  progressItem: {
    gap: 4,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  ctaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  ctaIcon: {
    width: 64,
    height: 64,
    backgroundColor: "#E8F5E9", // --color-success-bg (vert clair)
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  ctaDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: "#6B7F5C", // --color-primary
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});