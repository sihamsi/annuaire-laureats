import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
  Platform,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { getLaureatById } from "../../services/laureats.api";
import { getNotificationsByLaureat } from "../../services/notifications.api";
import { mapFiliere, normSecteur, resolvePhotoUrl, formatProvinceName } from "../../utils/helpers";
import { Image } from "react-native";
import { getViewedNotifications, filterUnviewedNotifications } from "../../utils/notificationsStorage";

// Couleurs alignées avec le thème web
const COLOR_BG = "#F5F5F0"; // --color-background
const COLOR_PRIMARY = "#6B7F5C"; // --color-primary
const COLOR_PRIMARY_DARK = "#556448"; // --color-primary-dark
const COLOR_PRIMARY_LIGHT = "#8A9B7A"; // --color-primary-light
const COLOR_WHITE = "#FFFFFF"; // --color-background-white
const COLOR_BLACK = "#2C2C2C"; // --color-text-primary
const COLOR_MUTED = "#666666"; // --color-text-secondary
const COLOR_MUTED_LIGHT = "#999999"; // --color-text-light

type Laureat = {
  id: number;
  nom: string;
  prenom: string;
  genre: string;
  email: string;
  telephone?: string;
  promotion: string;
  filiere: string;
  filiereLabel?: string;
  secteur: string;
  organisme: string;
  province?: string;
  description?: string;
  locationName?: string; // Nom complet de la localisation
  latitude?: number;
  longitude?: number;
  status: string;
  motifRejet?: string;
  dateInscription?: string;
  photoUrl?: string;
  photo?: string;
};

export default function ProfilScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [laureat, setLaureat] = useState<Laureat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  const loadNotifications = React.useCallback(async () => {
    try {
      if (!user?.id) return;
      const [notifications, viewedIds] = await Promise.all([
        getNotificationsByLaureat(user.id),
        getViewedNotifications(user.id),
      ]);
      // Filtrer uniquement les notifications de validation et rejet
      const relevantNotifications = notifications.filter(
        (notif) => notif.type === "VALIDATION" || notif.type === "REJET"
      );
      // Filtrer les notifications non consultées
      const unviewedNotifications = filterUnviewedNotifications(relevantNotifications, viewedIds);
      setNotificationCount(unviewedNotifications.length);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
      setNotificationCount(0);
    }
  }, [user?.id]);

  // Recharger les notifications à chaque fois que la page est focus (quand l'utilisateur revient)
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated && user?.id) {
        loadNotifications();
      }
    }, [isAuthenticated, user?.id, loadNotifications])
  );

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Si pas d'utilisateur connecté, ne pas charger le profil
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      // Utiliser l'ID stocké dans AuthContext (pas by-device)
      const data = await getLaureatById(user.id);
      
      if (!data) {
        setLoading(false);
        return;
      }
      
      // Normaliser les données pour l'affichage
      const filiereLabel = mapFiliere(data.filiere) || data.filiere || "";
      // Pour l'affichage dans la carte Formation, utiliser le code filière en minuscules
      const filiereCode = typeof data.filiere === 'string' ? data.filiere.toLowerCase() : (data.filiere?.toString().toLowerCase() || "");
      
      // Extraire le locationName depuis description si disponible
      // Format: "locationName" ou "locationName - description"
      console.log("📋 Chargement profil - data.description:", data.description);
      let locationName = "";
      let descriptionText = "";
      
      if (data.description) {
        // Le locationName est toujours la première partie avant " - " si elle existe
        // Sinon, toute la description est le locationName
        const descParts = data.description.split(' - ');
        
        if (descParts.length > 1) {
          // Format: "locationName - description"
          locationName = descParts[0].trim();
          descriptionText = descParts.slice(1).join(' - ').trim();
        } else {
          // Format: "locationName" (pas de description séparée)
          // Vérifier si c'est une adresse (contient des virgules et des mots-clés d'adresse)
          const fullDesc = data.description.trim();
          const hasCommas = fullDesc.includes(',');
          const hasAddressKeywords = (
            fullDesc.toLowerCase().includes('boulevard') ||
            fullDesc.toLowerCase().includes('rue') ||
            fullDesc.toLowerCase().includes('avenue') ||
            fullDesc.toLowerCase().includes('casablanca') ||
            fullDesc.toLowerCase().includes('rabat') ||
            fullDesc.toLowerCase().includes('marrakech') ||
            fullDesc.toLowerCase().includes('tanger') ||
            fullDesc.toLowerCase().includes('fès') ||
            fullDesc.toLowerCase().includes('arrondissement') ||
            fullDesc.toLowerCase().includes('quartier') ||
            fullDesc.toLowerCase().includes('meknès') ||
            fullDesc.toLowerCase().includes('agadir')
          );
          
          if (hasCommas && hasAddressKeywords) {
            // C'est une adresse complète (locationName)
            locationName = fullDesc;
          } else if (fullDesc.length > 50 || hasCommas) {
            // Probablement une adresse si c'est long ou contient des virgules
            locationName = fullDesc;
          } else {
            // Probablement une description simple, mais on l'utilise quand même comme locationName
            locationName = fullDesc;
          }
        }
      }
      
      console.log("📋 locationName extrait:", locationName);
      console.log("📋 descriptionText extrait:", descriptionText);
      
      const normalizedData = {
        ...data,
        filiere: filiereCode, // Code en minuscules (ex: "gi", "sig")
        filiereLabel: filiereLabel, // Label complet (ex: "Génie informatique")
        secteur: normSecteur(data.secteur) || data.secteur || "",
        organisme: data.autreOrganisme || data.organisme || "",
        locationName: locationName || data.description || "", // Le nom complet du lieu
        description: descriptionText || "", // La description seule (sans locationName)
      };
      
      setLaureat(normalizedData);
    } catch (error: any) {
      // Si c'est un 404, c'est normal (utilisateur non inscrit)
      if (error.message?.includes("404") || error.message?.includes("Not Found")) {
        setLaureat(null);
      } else {
        // Pour les autres erreurs, on les affiche
        console.error("❌ Erreur chargement profil:", error);
        const errorMessage = error.message || "Impossible de charger le profil";
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          label: "En attente de validation",
          icon: "time-outline" as const,
          color: "#FF9800",
          bg: "#FFF3E0",
        };
      case "published":
        return {
          label: "Validé",
          icon: "checkmark-circle" as const,
          color: "#4CAF50",
          bg: "#E8F5E9",
        };
      case "rejected":
        return {
          label: "Rejeté",
          icon: "close-circle" as const,
          color: "#F44336",
          bg: "#FFEBEE",
        };
      default:
        return {
          label: "Inconnu",
          icon: "help-circle" as const,
          color: COLOR_MUTED,
          bg: "#F5F5F5",
        };
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLOR_PRIMARY} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color="#F44336" />
          <Text style={styles.errorTitle}>Erreur de connexion</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHelp}>
            Vérifiez que le backend est démarré sur le port 8080.
          </Text>
          <Pressable
            style={styles.retryButton}
            onPress={loadProfile}
          >
            <View style={styles.iconWithMargin}>
            <Ionicons name="refresh" size={20} color={COLOR_WHITE} />
            </View>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Si l'utilisateur n'est pas connecté, afficher les options de connexion/inscription
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.scrollView}>
        {/* Header fixe avec fond coloré */}
        <View style={styles.topHeader}>
          <Pressable 
            onPress={() => router.back()}
            style={styles.headerIconBtn}
          >
            <Ionicons name="chevron-back" size={24} color={COLOR_WHITE} />
          </Pressable>
          <Text style={styles.topHeaderTitle}>Mon Profil</Text>
          <View style={styles.headerIconBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="person-circle-outline" size={80} color={COLOR_PRIMARY} />
            </View>
            <Text style={styles.emptyTitle}>Bienvenue !</Text>
            <Text style={styles.emptyText}>
              Connectez-vous ou créez un compte pour accéder à votre profil et gérer vos informations.
            </Text>

            {/* Bouton Se connecter */}
            <Pressable
              style={styles.loginButton}
              onPress={() => router.push("/auth/login")}
            >
              <View style={styles.iconWithMargin}>
                <Ionicons name="log-in-outline" size={20} color={COLOR_WHITE} />
              </View>
              <Text style={styles.loginButtonText}>Se connecter</Text>
            </Pressable>

            {/* Bouton S'inscrire */}
            <Pressable
              style={styles.signupButton}
              onPress={() => router.push("/(tabs)/inscription")}
            >
              <View style={styles.iconWithMargin}>
                <Ionicons name="person-add-outline" size={20} color={COLOR_PRIMARY} />
              </View>
              <Text style={styles.signupButtonText}>S'inscrire</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Si pas de profil chargé mais utilisateur connecté
  if (!laureat && !loading && !error) {
    return (
      <View style={styles.scrollView}>
        <View style={styles.topHeader}>
          <Pressable 
            onPress={() => router.back()}
            style={styles.headerIconBtn}
          >
            <Ionicons name="chevron-back" size={24} color={COLOR_WHITE} />
          </Pressable>
          <Text style={styles.topHeaderTitle}>Mon Profil</Text>
          <View style={styles.headerIconBtn} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="person-add-outline" size={80} color={COLOR_PRIMARY} />
            </View>
            <Text style={styles.emptyTitle}>Complétez votre profil</Text>
            <Text style={styles.emptyText}>
              Vous n'avez pas encore de profil. Créez votre compte pour commencer.
            </Text>
            <Pressable
              style={styles.signupButton}
              onPress={() => router.push("/(tabs)/inscription")}
            >
              <View style={styles.iconWithMargin}>
                <Ionicons name="person-add-outline" size={20} color={COLOR_PRIMARY} />
              </View>
              <Text style={styles.signupButtonText}>S'inscrire</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }
  
  // Si on arrive ici sans laureat, c'est une erreur ou en cours de chargement
  if (!laureat) {
    return null;
  }

  const statusInfo = getStatusInfo(laureat.status);
  const initials = `${laureat.nom[0]}${laureat.prenom[0]}`.toUpperCase();

  return (
    <View style={styles.scrollView}>
      {/* Header fixe avec fond coloré */}
      <View style={styles.topHeader}>
        <Pressable 
          onPress={() => router.back()}
          style={styles.headerIconBtn}
        >
          <Ionicons name="chevron-back" size={24} color={COLOR_WHITE} />
        </Pressable>
        <Text style={styles.topHeaderTitle}>Mon Profil</Text>
        {/* Icône de notification qui redirige vers la page notifications */}
        <Pressable
          onPress={() => {
            router.push("/(tabs)/notifications");
          }}
          style={styles.headerIconBtn}
        >
          <Ionicons name="notifications" size={24} color={COLOR_WHITE} />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {notificationCount > 99 ? "99+" : notificationCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar et info */}
        <View style={styles.header}>
          <Image
            source={{ uri: resolvePhotoUrl(laureat.photoUrl || laureat.photo, `${laureat.prenom} ${laureat.nom}`) }}
            style={styles.avatarImage}
            onError={(e) => {
              // Si l'image ne charge pas, utiliser un avatar généré
              e.target.setNativeProps({ source: { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(`${laureat.prenom} ${laureat.nom}`)}` } });
            }}
          />
          {!laureat.photoUrl && !laureat.photo && (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <Text style={styles.name}>
            {laureat.nom} {laureat.prenom}
          </Text>
          <Text style={styles.email}>{laureat.email}</Text>
          
          {/* Badge de statut */}
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <View style={styles.statusIcon}>
            <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
            </View>
            <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>


      {/* Motif de rejet - Style selon le design */}
      {laureat.status?.toLowerCase() === "rejected" && laureat.motifRejet && (
        <View style={styles.rejetCard}>
          <View style={styles.rejetHeader}>
            <Text style={styles.rejetIcon}>⚠️</Text>
            <Text style={styles.rejetTitle}>Inscription refusée</Text>
          </View>
          <Text style={styles.rejetText}>
            Votre inscription a été rejetée pour le motif suivant:{"\n"}
            <Text style={styles.rejetMotif}>"{laureat.motifRejet}"</Text>
          </Text>
          {/* Bouton de modification selon le motif */}
          <Pressable
            style={styles.rejetEditButton}
            onPress={() => {
              if (laureat.id && laureat.motifRejet) {
                router.push(`/(tabs)/inscription?edit=true&id=${laureat.id}&motif=${encodeURIComponent(laureat.motifRejet)}`);
              } else {
                Alert.alert("Erreur", "Impossible de charger le profil pour modification");
              }
            }}
          >
            <View style={styles.iconWithMargin}>
              <Ionicons name="create" size={18} color={COLOR_WHITE} />
            </View>
            <Text style={styles.rejetEditButtonText}>Modifier selon le motif</Text>
          </Pressable>
        </View>
      )}

      {/* Notification d'approbation */}
      {laureat.status?.toLowerCase() === "published" && (
        <View style={styles.approvalCard}>
          <Text style={styles.approvalTitle}>✓ Inscription approuvée</Text>
          <Text style={styles.approvalText}>
            Félicitations ! Vous faites maintenant partie de l'annuaire des lauréats.
          </Text>
        </View>
      )}

      {/* Formation */}
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>📚 Formation</Text>
        <Text style={styles.cardValue}>
          {laureat.filiereLabel || laureat.filiere || "—"} • Promotion {laureat.promotion || "—"}
        </Text>
      </View>

      {/* Poste actuel */}
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>💼 Poste actuel</Text>
        <Text style={styles.cardValue}>{laureat.organisme || "—"}</Text>
        <Text style={styles.cardSubValue}>
          Secteur: {laureat.secteur || "—"}
        </Text>
      </View>

      {/* Localisation */}
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>📍 Localisation</Text>
        {(() => {
          // Construire l'affichage: Nom de l'organisme + Adresse
          const organismeName = laureat.organisme || "";
          const locationName = laureat.locationName && laureat.locationName.trim() && laureat.locationName.trim() !== "Position sélectionnée"
            ? laureat.locationName.trim()
            : (laureat.description && laureat.description.trim() && 
               laureat.description.trim() !== "Position sélectionnée" &&
               !laureat.description.trim().startsWith("Lat:") &&
               !(laureat.description.trim().includes("Lat:") && laureat.description.trim().includes("Lng:"))
               ? laureat.description.trim()
               : null);
          
          if (organismeName && locationName) {
            return (
              <>
                <Text style={styles.cardValue}>{organismeName}</Text>
                <Text style={styles.cardSubValue}>{locationName}</Text>
                {laureat.province && (
                  <Text style={styles.cardSubValue}>{formatProvinceName(laureat.province)}</Text>
                )}
              </>
            );
          } else if (locationName) {
            return (
              <>
                <Text style={styles.cardValue}>{locationName}</Text>
                {laureat.province && (
                  <Text style={styles.cardSubValue}>{formatProvinceName(laureat.province)}</Text>
                )}
              </>
            );
          } else if (organismeName) {
            return (
              <>
                <Text style={styles.cardValue}>{organismeName}</Text>
                {laureat.province && (
                  <Text style={styles.cardSubValue}>{formatProvinceName(laureat.province)}</Text>
                )}
              </>
            );
          } else {
            return (
              <Text style={styles.cardValue}>{formatProvinceName(laureat.province) || "Non déterminée"}</Text>
            );
          }
        })()}
      </View>

      {/* Actions - Bouton de modification uniquement si le profil est publié (published) */}
      {laureat.status?.toLowerCase() === "published" && (
        <Pressable
          style={styles.editButton}
          onPress={() => {
            if (laureat.id) {
              router.push(`/(tabs)/inscription?edit=true&id=${laureat.id}`);
            } else {
              Alert.alert("Erreur", "Impossible de charger le profil pour modification");
            }
          }}
        >
          <View style={styles.iconWithMargin}>
            <Ionicons name="create" size={20} color={COLOR_WHITE} />
          </View>
          <Text style={styles.editButtonText}>Modifier mon profil</Text>
        </Pressable>
      )}

      {laureat.status?.toLowerCase() === "pending" && (
        <View style={styles.helpCard}>
          <View style={styles.helpIcon}>
          <Ionicons name="information-circle" size={20} color={COLOR_PRIMARY} />
          </View>
          <Text style={styles.helpText}>
            Votre inscription est en cours de validation par l'administrateur.
          </Text>
        </View>
      )}

      {/* Bouton de déconnexion - Redirection directe vers l'accueil */}
      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.logoutButtonPressed
        ]}
        onPress={async () => {
          try {
            console.log("🔴 Déconnexion demandée - Début");
            
            // Déconnecter l'utilisateur immédiatement
            if (logout) {
              console.log("🔓 Appel logout()...");
              await logout();
              console.log("✅ Utilisateur déconnecté");
            } else {
              console.error("❌ Fonction logout non disponible");
            }
            
            // Attendre que l'état soit mis à jour
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Rediriger directement vers la page d'accueil (annuaire)
            console.log("🏠 Redirection vers /(tabs)/annuaire");
            router.replace("/(tabs)/annuaire");
          } catch (error: any) {
            console.error("❌ Erreur lors de la déconnexion:", error);
            // Même en cas d'erreur, rediriger vers l'accueil
            router.replace("/(tabs)/annuaire");
          }
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={styles.iconWithMargin}>
          <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
        </View>
        <Text style={styles.logoutButtonText}>Déconnexion</Text>
      </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: COLOR_BG,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLOR_PRIMARY,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 12,
    paddingBottom: 15,
    ...(Platform.OS !== "web" && {
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLOR_WHITE,
  },
  notificationBadgeText: {
    color: COLOR_WHITE,
    fontSize: 10,
    fontWeight: "700",
  },
  topHeaderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLOR_WHITE,
    flex: 1,
    textAlign: "center",
  },
  container: {
    flex: 1,
    backgroundColor: COLOR_BG,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLOR_MUTED,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLOR_BLACK,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: COLOR_MUTED,
    marginTop: 8,
    textAlign: "center",
  },
  inscriptionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR_PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
  },
  inscriptionButtonText: {
    color: COLOR_WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLOR_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    position: "absolute",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    backgroundColor: COLOR_PRIMARY,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
    color: COLOR_WHITE,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: COLOR_BLACK,
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: COLOR_MUTED,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: COLOR_MUTED,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  rejetCard: {
    backgroundColor: "#FEF3C7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  rejetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  rejetIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  rejetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400E",
  },
  rejetText: {
    fontSize: 13,
    color: "#78350F",
    marginBottom: 12,
    lineHeight: 18,
  },
  rejetMotif: {
    fontWeight: "700",
  },
  rejetButton: {
    backgroundColor: COLOR_PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  rejetButtonText: {
    color: COLOR_WHITE,
    fontSize: 14,
    fontWeight: "600",
  },
  rejetEditButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F59E0B",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  rejetEditButtonText: {
    color: COLOR_WHITE,
    fontSize: 14,
    fontWeight: "600",
  },
  approvalCard: {
    backgroundColor: "#D1FAE5",
    borderLeftWidth: 4,
    borderLeftColor: COLOR_PRIMARY,
    padding: 15,
    borderRadius: 12,
    marginBottom: 16,
  },
  approvalTitle: {
    fontWeight: "700",
    color: "#065F46",
    marginBottom: 5,
    fontSize: 14,
  },
  approvalText: {
    fontSize: 13,
    color: "#047857",
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: "#F9FAFB",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 14,
    color: COLOR_MUTED,
  },
  cardSubValue: {
    fontSize: 14,
    color: COLOR_MUTED,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: COLOR_MUTED,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLOR_BLACK,
    textAlign: "right",
    flex: 1,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLOR_PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  editButtonText: {
    color: COLOR_WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  helpCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  helpText: {
    flex: 1,
    fontSize: 12,
    color: COLOR_BLACK,
    lineHeight: 18,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE5E5",
    borderWidth: 1,
    borderColor: "#FF6B6B",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
    opacity: 1,
    minHeight: 50,
    zIndex: 10,
  },
  logoutButtonPressed: {
    opacity: 0.7,
    backgroundColor: "#FFD5D5",
  },
  logoutButtonText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F44336",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: COLOR_BLACK,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 20,
  },
  errorHelp: {
    fontSize: 12,
    color: COLOR_MUTED,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 18,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR_PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: COLOR_WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  iconWithMargin: {
    marginRight: 8,
  },
  statusIcon: {
    marginRight: 6,
  },
  helpIcon: {
    marginRight: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLOR_PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    width: "100%",
    minHeight: 50,
  },
  loginButtonText: {
    color: COLOR_WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  signupButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLOR_WHITE,
    borderWidth: 2,
    borderColor: COLOR_PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    minHeight: 50,
  },
  signupButtonText: {
    color: COLOR_PRIMARY,
    fontSize: 16,
    fontWeight: "600",
  },
});