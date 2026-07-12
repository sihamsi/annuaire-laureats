// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/http";

const AuthContext = createContext(null);

const TOKEN_KEY = "token";
const USER_KEY = "user";

function safeParseJSON(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function readUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw || raw === "null" || raw === "undefined") return null;
  const u = safeParseJSON(raw);
  if (!u) return null;
  // adapte si besoin
  if (u.id || u.email) return u;
  return null;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readUser());
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) || ""
  );
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(readUser())
  );

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
      headers: { "Content-Type": "application/json" },
    });

    instance.interceptors.request.use((config) => {
      const t = localStorage.getItem(TOKEN_KEY);
      if (t) config.headers.Authorization = `Bearer ${t}`;
      return config;
    });

    return instance;
  }, []);

  const syncAuth = () => {
    const u = readUser();
    const t = localStorage.getItem(TOKEN_KEY) || "";
    setUser(u);
    setToken(t);
    setIsAuthenticated(Boolean(u));
  };

  useEffect(() => {
    // ⚠️ éviter le bug "token fantôme" : si pas de user, on nettoie le token
    const u = readUser();
    if (!u) {
      localStorage.removeItem(TOKEN_KEY);
      setToken("");
    }
    syncAuth();

    const onStorage = () => syncAuth();
    const onAuthChanged = () => syncAuth();

    window.addEventListener("storage", onStorage);
    window.addEventListener("auth-changed", onAuthChanged);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth-changed", onAuthChanged);
    };
  }, []);

  /**
   * ✅ LOGIN dynamique (API)
   * Support pour login admin local avec credentials admin@ehtp.ac.ma / admin123
   * Support pour login lauréat via /api/laureats/login
   */
  const login = async (email, password) => {
    try {
      // Vérification des credentials admin
      if (email === "admin@ehtp.ac.ma" && password === "admin123") {
        const adminUser = {
          id: 1,
          email: "admin@ehtp.ac.ma",
          role: "admin",
          name: "Administrateur",
        };
        const adminToken = "admin_token_" + Date.now();

        localStorage.setItem(TOKEN_KEY, adminToken);
        localStorage.setItem(USER_KEY, JSON.stringify(adminUser));

        // Mise à jour immédiate de l'état
        syncAuth();
        window.dispatchEvent(new Event("auth-changed"));
        return adminUser;
      }

      // Tentative de connexion lauréat via /api/laureats/login
      try {
        const res = await api.post("/api/laureats/login", { email, password });
        const laureat = res?.data;

        if (!laureat || !laureat.id) {
          throw new Error("Réponse serveur invalide: données manquantes.");
        }

        // Stocker les informations du lauréat (sans role admin)
        const laureatUser = {
          id: laureat.id,
          email: laureat.email,
          nom: laureat.nom,
          prenom: laureat.prenom,
          role: "laureat", // Pour différencier des admins
          photoUrl: laureat.photoUrl,
          promotion: laureat.promotion,
          filiere: laureat.filiere,
          secteur: laureat.secteur,
        };
        const laureatToken = "laureat_token_" + Date.now();

        localStorage.setItem(TOKEN_KEY, laureatToken);
        localStorage.setItem(USER_KEY, JSON.stringify(laureatUser));

        syncAuth();
        window.dispatchEvent(new Event("auth-changed"));
        return laureatUser;
      } catch (laureatError) {
        // Si l'erreur vient du backend lauréat, extraire le message d'erreur
        const errorData = laureatError?.response?.data;
        const errorMessage = errorData?.error || errorData?.message || laureatError?.message;
        
        // Propager l'erreur avec le message du backend
        if (errorMessage) {
          throw new Error(errorMessage);
        }
        
        // Si pas de message spécifique, propager l'erreur générique
        throw new Error("Erreur lors de la connexion. Vérifiez vos identifiants.");
      }
    } catch (err) {
      // Vérifier d'abord le message d'erreur dans response.data.error (format backend)
      const errorData = err?.response?.data;
      const msg =
        errorData?.error ||
        errorData?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Email ou mot de passe incorrect.";
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event("auth-changed"));
  };

  const value = {
    api,
    user,
    token,
    isAuthenticated,
    isAdmin: user?.role === "admin" || user?.role === "ADMIN",
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
