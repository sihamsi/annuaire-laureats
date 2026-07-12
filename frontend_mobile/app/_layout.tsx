// app/_layout.tsx
import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { FiltersProvider } from "../contexts/FiltersContext";
import { View, ActivityIndicator, Text } from "react-native";

// Couleurs alignées avec le thème web
const COLOR_BG = "#F5F5F0"; // --color-background
const COLOR_PRIMARY = "#6B7F5C"; // --color-primary

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "auth";
    const inTabsGroup = segments[0] === "(tabs)";
    const inOnboarding = segments[0] === "onboarding";

    // Si on est sur l'onboarding, ne pas rediriger
    if (inOnboarding) {
      return;
    }

    // Rediriger depuis auth vers annuaire si déjà connecté
    if (isAuthenticated && inAuthGroup) {
      router.push("/(tabs)/annuaire" as any);
    }

    // Ne pas rediriger depuis tabs vers onboarding
    // L'utilisateur peut accéder à l'app même sans être authentifié (mode guest)
  }, [isAuthenticated, segments, isLoading, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLOR_BG, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <ActivityIndicator size="large" color={COLOR_PRIMARY} />
        <Text style={{ marginTop: 16, color: COLOR_PRIMARY, fontSize: 14 }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* ✅ Écran d'accueil - Redirige vers onboarding ou tabs selon le statut */}
      <Stack.Screen name="index" />

      {/* ✅ Écran d'onboarding avec logo et nom de l'app */}
      <Stack.Screen name="onboarding" />

      {/* ✅ Écrans d'authentification */}
      <Stack.Screen name="auth/login" />

      {/* ✅ Écrans principaux (avec écran de bienvenue intégré dans index) */}
      <Stack.Screen name="(tabs)" />

      {/* ✅ Pages hors barre (détails, édition, etc.) */}
      <Stack.Screen name="modal" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="success" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <FiltersProvider>
        <RootLayoutNav />
      </FiltersProvider>
    </AuthProvider>
  );
}
