import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  deviceId: string;
  photoUrl?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuestMode: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  enableGuestMode: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "@auth_user";
const GUEST_MODE_KEY = "@guest_mode";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Charger l'utilisateur et le mode guest au démarrage
  useEffect(() => {
    loadUser();
    loadGuestMode();
  }, []);

  const loadGuestMode = async () => {
    try {
      // Sur le web, utiliser localStorage directement
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const guestMode = window.localStorage.getItem(GUEST_MODE_KEY);
          setIsGuestMode(guestMode === "true");
        } catch (e) {
          console.error("Erreur chargement mode guest (localStorage):", e);
        }
        return;
      }

      // Sur mobile natif, utiliser AsyncStorage
      const guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
      setIsGuestMode(guestMode === "true");
    } catch (error) {
      console.error("Erreur chargement mode guest:", error);
    }
  };

  const loadUser = async () => {
    try {
      // Sur le web, utiliser localStorage directement (plus rapide)
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const userData = window.localStorage.getItem(AUTH_STORAGE_KEY);
          if (userData) {
            setUser(JSON.parse(userData));
          }
        } catch (e) {
          console.error("Erreur chargement utilisateur (localStorage):", e);
        }
        setIsLoading(false);
        return;
      }

      // Sur mobile natif, utiliser AsyncStorage avec timeout
      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          // Ne pas logger comme warning, c'est normal si AsyncStorage est lent
          resolve();
        }, 2000); // Réduit à 2 secondes
      });

      const loadPromise = (async () => {
        const userData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (userData) {
          setUser(JSON.parse(userData));
        }
      })();

      await Promise.race([loadPromise, timeoutPromise]);
    } catch (error) {
      console.error("Erreur chargement utilisateur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User) => {
    try {
      // Désactiver le mode guest lors de la connexion
      // Sur le web, utiliser localStorage directement
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
        window.localStorage.removeItem(GUEST_MODE_KEY);
        setUser(userData);
        setIsGuestMode(false);
        console.log("✅ Utilisateur connecté:", userData.email);
        return;
      }

      // Sur mobile natif, utiliser AsyncStorage
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
      setUser(userData);
      setIsGuestMode(false);
      console.log("✅ Utilisateur connecté:", userData.email);
    } catch (error) {
      console.error("Erreur connexion:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Sur le web, utiliser localStorage directement
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        window.localStorage.removeItem(GUEST_MODE_KEY);
        setUser(null);
        setIsGuestMode(false);
        console.log("✅ Utilisateur déconnecté");
        return;
      }

      // Sur mobile natif, utiliser AsyncStorage
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
      setUser(null);
      setIsGuestMode(false);
      console.log("✅ Utilisateur déconnecté");
    } catch (error) {
      console.error("Erreur déconnexion:", error);
      throw error;
    }
  };

  const enableGuestMode = async () => {
    try {
      // Sur le web, utiliser localStorage directement
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(GUEST_MODE_KEY, "true");
        setIsGuestMode(true);
        console.log("✅ Mode guest activé");
        return;
      }

      // Sur mobile natif, utiliser AsyncStorage
      await AsyncStorage.setItem(GUEST_MODE_KEY, "true");
      setIsGuestMode(true);
      console.log("✅ Mode guest activé");
    } catch (error) {
      console.error("Erreur activation mode guest:", error);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const updatedUser = { ...user, ...userData } as User;
      
      // Sur le web, utiliser localStorage directement
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
        setUser(updatedUser);
        console.log("✅ Utilisateur mis à jour");
        return;
      }

      // Sur mobile natif, utiliser AsyncStorage
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      console.log("✅ Utilisateur mis à jour");
    } catch (error) {
      console.error("Erreur mise à jour utilisateur:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isGuestMode,
        login,
        logout,
        updateUser,
        enableGuestMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

