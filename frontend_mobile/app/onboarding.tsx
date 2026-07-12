import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";

const ONBOARDING_SEEN_KEY = "@onboarding_seen";

const { width } = Dimensions.get("window");

// Couleurs alignées avec le thème web
const COLOR_PRIMARY = "#6B7F5C"; // --color-primary
const COLOR_PRIMARY_DARK = "#556448"; // --color-primary-dark
const COLOR_BG = "#F5F5F0"; // --color-background
const COLOR_BG_LIGHT = "#FAFAF5"; // --color-background-light
const COLOR_WHITE = "#FFFFFF"; // --color-background-white
const COLOR_TEXT = "#2C2C2C"; // --color-text-primary
const COLOR_TEXT_SECONDARY = "#666666"; // --color-text-secondary

// Composant Logo personnalisé avec le style de la page de connexion web
// Logo avec fond vert olive, coins arrondis, silhouette et arcs
const CustomLogo = () => {
  return (
    <View style={styles.customLogoContainer}>
      <View style={styles.logoBackground}>
        <Image 
          source={require("../assets/images/logo-ehtp01.png")} 
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const onboardingData = [
  {
    title: "Rejoignez le réseau",
    description: "Connectez-vous avec des milliers de lauréats à travers le monde",
  },
  {
    title: "Explorez la carte",
    description: "Découvrez où travaillent vos camarades de promotion",
  },
  {
    title: "Partagez votre parcours",
    description: "Mettez à jour votre profil professionnel et restez connecté",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { enableGuestMode } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Marquer l'onboarding comme vu au chargement
  useEffect(() => {
    const markOnboardingSeen = async () => {
      try {
        // Sur le web, utiliser localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(ONBOARDING_SEEN_KEY, "true");
        } else {
          // Sur mobile, utiliser AsyncStorage
          await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, "true");
        }
      } catch (error) {
        console.error("Erreur marquage onboarding:", error);
      }
    };
    markOnboardingSeen();
  }, []);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = () => {
    router.replace("/(tabs)/annuaire");
  };

  const handleGetStarted = async () => {
    try {
      await enableGuestMode();
      router.replace("/(tabs)/");
    } catch (error) {
      console.error("Erreur activation mode guest:", error);
      router.replace("/(tabs)/");
    }
  };

  const currentData = onboardingData[currentIndex];

  return (
    <LinearGradient
      colors={[COLOR_BG, COLOR_BG_LIGHT]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Header avec logo et nom de l'app */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <CustomLogo />
        </View>
        <Text style={styles.appName}>Career Tracker EHTP</Text>
        <Text style={styles.appSubtitle}>Réseau des Lauréats</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{currentData.title}</Text>
        <Text style={styles.description}>{currentData.description}</Text>
        
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {currentIndex < onboardingData.length - 1 ? (
          <>
            <Pressable style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Passer</Text>
            </Pressable>
            <Pressable style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Suivant</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.finalButtons}>
            <Pressable 
              style={styles.registerButton} 
              onPress={() => router.push("/(tabs)/inscription")}
            >
              <Text style={styles.registerButtonText}>S'inscrire</Text>
            </Pressable>
            <Pressable 
              style={styles.loginButton} 
              onPress={() => router.push("/auth/login")}
            >
              <Text style={styles.loginButtonText}>Se connecter</Text>
            </Pressable>
            <Pressable 
              style={styles.exploreButton} 
              onPress={handleGetStarted}
            >
              <Text style={styles.exploreButtonText}>Explorer sans compte</Text>
            </Pressable>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  customLogoContainer: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  logoBackground: {
    width: 80,
    height: 80,
    backgroundColor: "#6B7F5C", // Vert olive (muted olive green) - fond carré avec coins arrondis
    borderRadius: 12, // Coins arrondis (softly rounded corners)
    justifyContent: "center",
    alignItems: "center",
    padding: 10, // Padding pour laisser de l'espace autour du logo
    overflow: "hidden", // S'assurer que le contenu reste dans les limites arrondies
  },
  logoImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent", // Fond transparent pour le logo
    // Le blanc du logo sera remplacé par le fond vert
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: COLOR_TEXT,
    marginBottom: 4,
    fontFamily: "serif",
  },
  appSubtitle: {
    fontSize: 16,
    color: COLOR_TEXT_SECONDARY,
    marginBottom: 8,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLOR_TEXT, // --color-text-primary
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: COLOR_TEXT_SECONDARY, // --color-text-secondary
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  pagination: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: COLOR_PRIMARY, // --color-primary
  },
  inactiveDot: {
    backgroundColor: "#E0E0E0", // --color-border
  },
  buttonContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 12,
  },
  skipButtonText: {
    color: COLOR_TEXT_SECONDARY,
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: COLOR_PRIMARY, // --color-primary
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  nextButtonText: {
    color: COLOR_WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  finalButtons: {
    gap: 12,
  },
  registerButton: {
    backgroundColor: COLOR_PRIMARY, // --color-primary
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  registerButtonText: {
    color: COLOR_WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: COLOR_PRIMARY_DARK, // --color-primary-dark
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  loginButtonText: {
    color: COLOR_WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  exploreButton: {
    borderWidth: 2,
    borderColor: COLOR_PRIMARY, // --color-primary
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: COLOR_WHITE,
  },
  exploreButtonText: {
    color: COLOR_PRIMARY, // --color-primary
    fontSize: 16,
    fontWeight: "600",
  },
});
