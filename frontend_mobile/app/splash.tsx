import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect après 3 secondes (optionnel)
    const timer = setTimeout(() => {
      router.replace("/onboarding");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="people" size={80} color="#3b82f6" />
          </View>
        </View>
        
        <Text style={styles.title}>Career Tracker EHTP</Text>
        <Text style={styles.subtitle}>Réseau des Lauréats</Text>
        
        <Pressable 
          style={styles.startButton}
          onPress={() => router.replace("/onboarding")}
        >
          <Text style={styles.startButtonText}>Commencer</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#3b82f6",
  },
  content: {
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoCircle: {
    width: 160,
    height: 160,
    backgroundColor: "#FFFFFF",
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 48,
    textAlign: "center",
  },
  startButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "600",
  },
});