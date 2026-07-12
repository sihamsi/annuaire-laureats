import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius, Shadows, Typography } from "../constants/theme";

export default function SuccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* ✅ Icône de succès (checkmark vert dans un cercle vert clair) */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={96} color={Colors.success} />
        </View>
        
        {/* ✅ Titre */}
        <Text style={styles.title}>Inscription envoyée !</Text>
        
        {/* ✅ Message */}
        <Text style={styles.message}>
          Votre demande est en attente de validation par l'administrateur. Vous serez notifié une fois votre profil approuvé.
        </Text>
        
        {/* ✅ Bouton retour à l'accueil */}
        <Pressable
          style={styles.button}
          onPress={() => router.replace("/(tabs)/index")}
        >
          <Text style={styles.buttonText}>Retour à l'accueil</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.successBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.gray800,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray600,
    textAlign: 'center',
    marginBottom: Spacing.xxl * 2,
    lineHeight: Typography.fontSize.base * 1.5,
    paddingHorizontal: Spacing.lg,
  },
  button: {
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl * 2,
    borderRadius: BorderRadius.md,
    ...Shadows.md,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
});
