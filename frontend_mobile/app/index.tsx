// app/index.tsx
// Point d'entrée - Redirige toujours vers onboarding en premier
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function IndexScreen() {
  const router = useRouter();
  const { isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    
    // Toujours rediriger vers l'onboarding en premier
    console.log("🔄 Redirection vers l'onboarding");
    router.replace("/onboarding");
  }, [isLoading, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6B7F5C" />
      <Text style={styles.text}>Chargement...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F0",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginTop: 16,
    color: "#6B7F5C",
    fontSize: 14,
  },
});
