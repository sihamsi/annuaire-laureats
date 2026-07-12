import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";

// Couleurs alignées avec le thème web
const BLACK = "#2C2C2C"; // --color-text-primary
const ACTIVE = "#6B7F5C"; // --color-primary
const INACTIVE = "#999999"; // --color-text-light

export default function TabsLayout() {
  const { isAuthenticated, isGuestMode } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF", // --color-background-white
          borderTopColor: "#E0E0E0", // --color-border
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarActiveTintColor: "#6B7F5C", // --color-primary
        tabBarInactiveTintColor: "#999999", // --color-text-light
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      {/* Accueil - toujours visible */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* Annuaire - accessible sans authentification */}
      <Tabs.Screen
        name="annuaire"
        options={{
          title: "Annuaire",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />

      {/* Carte - accessible sans authentification */}
      <Tabs.Screen
        name="map"
        options={{
          title: "Carte",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />

      {/* Profil - caché si mode guest, visible sinon */}
      {!isGuestMode && (
      <Tabs.Screen
        name="profil"
        options={{
          title: isAuthenticated ? "Profil" : "Profil",
          tabBarIcon: ({ size, color }) => (
            <Ionicons 
              name={isAuthenticated ? "person-circle" : "person-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      )}

      {/* Inscription - cachée de la barre de navigation (accessible uniquement depuis le profil) */}
      <Tabs.Screen 
        name="inscription" 
        options={{ href: null }} 
      />

      {/* Notifications - cachée de la barre de navigation (accessible uniquement depuis l'icône dans le header) */}
      <Tabs.Screen
        name="notifications"
        options={{ href: null }} 
      />

      {/* cacher TOUT le reste (explore, etc.) */}
      <Tabs.Screen name="filters" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="FiliereSelection" options={{ href: null }} />
      <Tabs.Screen name="PromotionSelection" options={{ href: null }} />
      <Tabs.Screen name="ProfileUpload" options={{ href: null }} />
      <Tabs.Screen name="LocationFieldRN" options={{ href: null }} />
    </Tabs>
  );
}
