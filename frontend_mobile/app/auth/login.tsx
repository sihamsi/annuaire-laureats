import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getDeviceId } from "../../utils/deviceId";
import { useAuth } from "../../contexts/AuthContext";
import { API_BASE_URL, apiGet } from "../../services/api";

const COLOR_BG = "#DFECC6";
const COLOR_PRIMARY = "#8E9C78";
const COLOR_WHITE = "#FFFFFF";
const COLOR_BLACK = "#000000";
const COLOR_MUTED = "#929292";
const COLOR_WARNING = "#FF9800";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPendingStatus, setShowPendingStatus] = useState(false);

  // Si l'utilisateur est déjà connecté, rediriger vers le profil
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log("✅ Utilisateur déjà connecté, redirection vers l'annuaire");
      router.replace("/(tabs)/annuaire");
    }
  }, [isAuthenticated, user?.id]);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Erreur", "Veuillez saisir votre email");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Erreur", "Veuillez saisir votre mot de passe");
      return;
    }

    try {
      setLoading(true);

      // Récupérer le deviceId
      const deviceId = await getDeviceId();
      console.log("🔑 DeviceId:", deviceId);

      // Connexion avec email et mot de passe
      const url = `/api/laureats/login`;
      console.log("📡 Connexion - URL:", `${API_BASE_URL}${url}`);
      console.log("📧 Email:", email);

      try {
        const { apiPost } = await import("../../services/api");
        const laureat = await apiPost<any>(url, { email, password });

        // Connexion réussie
        await login({
          id: laureat.id,
          nom: laureat.nom,
          prenom: laureat.prenom,
          email: laureat.email,
          deviceId: deviceId,
          photoUrl: laureat.photoUrl,
        });

        Alert.alert("Connexion réussie", `Bienvenue ${laureat.prenom} !`);
        router.replace("/(tabs)/annuaire");
      } catch (apiError: any) {
        // Vérifier si le compte est en cours de validation
        if (apiError.message.includes("en cours de validation") || 
            apiError.message.includes("Votre inscription est en cours de validation")) {
          setShowPendingStatus(true);
          return;
        }
        
        if (apiError.message.includes("404") || apiError.message.includes("Erreur API 404") || 
            apiError.message.includes("401") || apiError.message.includes("UNAUTHORIZED")) {
          // Vérifier si c'est une erreur de credentials ou de compte non trouvé
          const errorText = apiError.message.toLowerCase();
          if (errorText.includes("email ou mot de passe incorrect") || 
              errorText.includes("not found") ||
              errorText.includes("401")) {
            Alert.alert(
              "Connexion échouée",
              "Email ou mot de passe incorrect. Voulez-vous créer un compte ?",
              [
                { text: "Annuler", style: "cancel" },
                { text: "Créer un compte", onPress: () => router.push("/(tabs)/inscription") },
              ]
            );
          } else {
            throw apiError;
          }
        } else if (apiError.message.includes("rejetée")) {
          Alert.alert(
            "Inscription rejetée",
            apiError.message || "Votre inscription a été rejetée."
          );
        } else {
          throw apiError;
        }
      }
    } catch (error: any) {
      console.error("❌ Erreur connexion:", error);
      Alert.alert(
        "Erreur de connexion",
        `Impossible de se connecter au serveur.\n\nDétails: ${error.message || error}\n\nVérifiez que:\n- Le backend est démarré\n- Vous êtes sur le même réseau WiFi\n- URL: ${API_BASE_URL}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Interface pour le statut "en cours de validation"
  if (showPendingStatus) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable 
            onPress={() => setShowPendingStatus(false)} 
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={COLOR_BLACK} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.statusContainer}>
          <View style={styles.statusIconContainer}>
            <Ionicons name="time-outline" size={80} color={COLOR_WARNING} />
          </View>
          <Text style={styles.statusTitle}>Compte en cours de validation</Text>
          <Text style={styles.statusMessage}>
            Votre inscription est actuellement en cours de validation par un administrateur. 
            Vous recevrez une notification une fois votre compte validé.
          </Text>
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Statut</Text>
              <View style={[styles.statusBadge, { backgroundColor: "#FFF3E0" }]}>
                <Text style={[styles.statusBadgeText, { color: COLOR_WARNING }]}>En attente</Text>
              </View>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Email</Text>
              <Text style={styles.statusValue}>{email}</Text>
            </View>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Pressable
            style={styles.footerButton}
            onPress={() => {
              setShowPendingStatus(false);
              setEmail("");
              setPassword("");
            }}
          >
            <Text style={styles.footerButtonText}>Retour à la connexion</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={COLOR_BLACK} />
          </Pressable>
        </View>

        {/* Titre */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>
            Connectez-vous avec votre email et mot de passe
          </Text>
        </View>

        {/* Formulaire */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={COLOR_MUTED} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="votre.email@example.com"
                placeholderTextColor={COLOR_MUTED}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={COLOR_MUTED} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Votre mot de passe"
                placeholderTextColor={COLOR_MUTED}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={{ padding: 4 }}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={COLOR_MUTED}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLOR_WHITE} />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            style={styles.registerButton}
            onPress={() => router.push("/(tabs)/inscription")}
          >
            <Text style={styles.registerButtonText}>Créer un nouveau compte</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_BG,
  },

  contentContainer: {
    padding: 24,
    paddingTop: 12,
  },

  header: {
    marginBottom: 24,
  },

  backButton: {
    padding: 4,
  },

  titleContainer: {
    marginBottom: 32,
  },

  title: {
    fontSize: 32,
    fontWeight: "900",
    color: COLOR_BLACK,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: COLOR_MUTED,
  },

  form: {
    gap: 20,
  },

  inputContainer: {
    gap: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: COLOR_BLACK,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR_WHITE,
    borderWidth: 1,
    borderColor: "#D8D8D8",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: COLOR_BLACK,
  },

  loginButton: {
    backgroundColor: COLOR_PRIMARY,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
  },

  loginButtonDisabled: {
    opacity: 0.6,
  },

  loginButtonText: {
    color: COLOR_WHITE,
    fontSize: 16,
    fontWeight: "800",
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D8D8D8",
  },

  dividerText: {
    fontSize: 12,
    color: COLOR_MUTED,
    fontWeight: "600",
  },

  registerButton: {
    backgroundColor: COLOR_WHITE,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLOR_PRIMARY,
  },

  registerButtonText: {
    color: COLOR_PRIMARY,
    fontSize: 16,
    fontWeight: "800",
  },
  // Styles pour l'interface "en cours de validation"
  statusContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  statusIconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#FFF3E0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLOR_BLACK,
    marginBottom: 16,
    textAlign: "center",
  },
  statusMessage: {
    fontSize: 14,
    color: COLOR_MUTED,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  statusCard: {
    width: "100%",
    backgroundColor: "#FAFAF5",
    borderRadius: 10,
    padding: 16,
    marginBottom: 32,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: COLOR_MUTED,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "500",
    color: COLOR_BLACK,
    flex: 1,
    textAlign: "right",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
    backgroundColor: COLOR_BG,
  },
  footerButton: {
    backgroundColor: COLOR_PRIMARY,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  footerButtonText: {
    color: COLOR_WHITE,
    fontSize: 16,
    fontWeight: "800",
  },
});

