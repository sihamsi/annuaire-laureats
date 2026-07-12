import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import ProfileUpload from "./ProfileUpload";
import LocationMapModal from "../../components/LocationMapModal";
import PromotionSelection from "./PromotionSelection";
import FiliereSelection from "./FiliereSelection";
import { createLaureat, uploadLaureatPhoto, updateLaureat, getLaureatById } from "../../services/laureats.api";
import { getDeviceId } from "../../utils/deviceId";
import { useAuth } from "../../contexts/AuthContext";
import {
  requestNotificationPermissions,
  notifyInscriptionValidated,
  notifyInscriptionRejected,
  setupNotificationListener,
  removeNotificationListener,
} from "../../utils/notifications";
import * as Notifications from "expo-notifications";

// Fonction de secours pour récupérer la province via géocodage inverse (Photon uniquement - compatible CORS)
const getProvinceFromGeocoding = async (latitude: number, longitude: number): Promise<string | null> => {
  try {
    // Utiliser Photon pour le géocodage inverse (compatible CORS, pas de problèmes de blocage)
    const response = await fetch(
      `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}&lang=fr`,
      {
        method: 'GET',
        mode: 'cors',
        headers: { 
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      console.warn(`Photon API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log("🔍 Données Photon reçues:", JSON.stringify(data, null, 2));
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const properties = feature.properties;
      
      console.log("🔍 Propriétés Photon:", JSON.stringify(properties, null, 2));
      
      // Prioriser les champs qui contiennent la PROVINCE plutôt que la RÉGION
      // Photon peut retourner : city (ville/province), county (province), district (district)
      // Éviter : state, region (qui sont des régions administratives)
      let provinceName = properties.city ||        // Ville = souvent le nom de la province
                        properties.county ||       // County = province
                        properties.district ||     // District = peut être la province
                        properties.locality ||     // Localité
                        properties.name;           // Nom du lieu
      
      console.log("🔍 Nom extrait de Photon:", provinceName);
      
      // Si on a une ville, mapper vers la province correspondante
      if (provinceName) {
        // Mapping des villes principales vers leurs provinces
        const cityToProvinceMap: { [key: string]: string } = {
          // Casablanca-Settat
          'Casablanca': 'Casablanca',
          'Settat': 'Settat',
          'Mohammedia': 'Mohammedia',
          'El Jadida': 'El Jadida',
          // Rabat-Salé-Kénitra
          'Rabat': 'Rabat',
          'Salé': 'Salé',
          'Kénitra': 'Kénitra',
          'Témara': 'Témara',
          // Tanger-Tétouan-Al Hoceïma
          'Tanger': 'Tanger',
          'Tétouan': 'Tétouan',
          'Al Hoceïma': 'Al Hoceïma',
          'Larache': 'Larache',
          // Fès-Meknès
          'Fès': 'Fès',
          'Meknès': 'Meknès',
          'Taza': 'Taza',
          // Marrakech-Safi
          'Marrakech': 'Marrakech',
          'Safi': 'Safi',
          'Essaouira': 'Essaouira',
          // Oriental
          'Oujda': 'Oujda',
          'Nador': 'Nador',
          'Berkane': 'Berkane',
          // Béni Mellal-Khénifra
          'Béni Mellal': 'Béni Mellal',
          'Khénifra': 'Khénifra',
          // Draâ-Tafilalet
          'Errachidia': 'Errachidia',
          'Ouarzazate': 'Ouarzazate',
          // Souss-Massa
          'Agadir': 'Agadir',
          'Inezgane': 'Inezgane',
          'Taroudant': 'Taroudant',
          // Guelmim-Oued Noun
          'Guelmim': 'Guelmim',
          // Laâyoune-Sakia El Hamra
          'Laâyoune': 'Laâyoune',
          // Dakhla-Oued Ed-Dahab
          'Dakhla': 'Dakhla'
        };
        
        // Normaliser le nom pour la comparaison
        const normalizedName = provinceName.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim();
        
        console.log("🔍 Nom normalisé:", normalizedName);
        
        // Chercher dans le mapping ville -> province
        for (const [city, province] of Object.entries(cityToProvinceMap)) {
          const normalizedCity = city.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
          
          // Si le nom correspond à une ville connue, retourner sa province
          if (normalizedName === normalizedCity || 
              normalizedName.includes(normalizedCity) || 
              normalizedCity.includes(normalizedName)) {
            console.log("✅ Mapping trouvé:", city, "->", province);
            return province;
          }
        }
        
        // Si pas de mapping trouvé, vérifier si c'est déjà une province (pas une région)
        // Les régions contiennent souvent des tirets multiples ou sont composées
        if (!provinceName.includes('-') || provinceName.split('-').length === 2) {
          // Probablement une province simple, retourner tel quel
          console.log("✅ Province simple trouvée:", provinceName);
          return provinceName;
        }
        
        // Si c'est une région (contient plusieurs tirets), essayer d'extraire la province
        // Ex: "Casablanca-Settat" -> extraire "Casablanca" si on est proche de Casablanca
        console.log("⚠️ Nom semble être une région:", provinceName);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.warn("Erreur géocodage inverse Photon:", error);
    return null;
  }
};

type Filiere = {
  id: number;
  nom: string;
  code?: string;
};

// Couleurs alignées avec le thème web
const COLOR_BG = "#F5F5F0"; // --color-background
const COLOR_PRIMARY = "#6B7F5C"; // --color-primary
const COLOR_PRIMARY_DARK = "#556448"; // --color-primary-dark
const COLOR_PRIMARY_LIGHT = "#8A9B7A"; // --color-primary-light
const COLOR_SECONDARY = "#6B7F5C"; // Utiliser primary comme secondary
const COLOR_WHITE = "#FFFFFF"; // --color-background-white
const COLOR_BLACK = "#2C2C2C"; // --color-text-primary
const COLOR_MUTED = "#666666"; // --color-text-secondary
const COLOR_MUTED_LIGHT = "#999999"; // --color-text-light
const COLOR_SUCCESS = "#4CAF50"; // --color-success
const COLOR_WARNING = "#FF9800"; // --color-warning
const COLOR_ERROR = "#F44336"; // --color-error

// Organismes marocains avec classification par secteur (basés sur LocationMapModal.tsx)
const organismesMaroc = {
  // Organismes publics
  public: [
    { nom: "Office National des Chemins de Fer (ONCF)" },
    { nom: "Office National de l'Électricité et de l'Eau Potable (ONEE)" },
    { nom: "Autoroutes du Maroc (ADM)" },
    { nom: "Office Chérifien des Phosphates (OCP)" },
    { nom: "Caisse de Dépôt et de Gestion (CDG)" },
    { nom: "Royal Air Maroc (RAM)" },
  ],
  // Organismes privés
  privé: [
    { nom: "Maroc Telecom" },
    { nom: "Bank of Africa" },
    { nom: "Attijariwafa Bank" },
    { nom: "BMCE Bank" },
    { nom: "LYDEC" },
    { nom: "REDAL" },
    { nom: "AMENDIS" },
  ],
};

export default function InscriptionScreen() {
  const router = useRouter();
  const { user, login, isAuthenticated } = useAuth();
  const { edit, id: editId, motif } = useLocalSearchParams<{ edit?: string; id?: string; motif?: string }>();
  
  const isEditMode = edit === "true" && editId;
  const editMotif = motif ? decodeURIComponent(motif) : undefined;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Étape 1 - Informations personnelles
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [genre, setGenre] = useState<"Homme" | "Femme" | "">("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Étape 2 - Parcours académique
  const [promotion, setPromotion] = useState("");
  const [filiere, setFiliere] = useState<Filiere | null>(null);

  // Étape 3 - Situation professionnelle
  const [secteur, setSecteur] = useState<"Public" | "Privé" | "">("");
  const [organisme, setOrganisme] = useState("");
  const [autreOrganisme, setAutreOrganisme] = useState("");
  const [showOrganismeModal, setShowOrganismeModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationName, setLocationName] = useState("");
  const [province, setProvince] = useState("");
  const [description, setDescription] = useState("");

  // Statut après soumission
  const [status, setStatus] = useState<"form" | "pending" | "validated" | "rejected">("form");
  const [laureatId, setLaureatId] = useState<number | null>(null);
  const [motifRejet, setMotifRejet] = useState("");
  const [dateSoumission, setDateSoumission] = useState<Date | null>(null);

  // Référence pour éviter les réinitialisations multiples
  const hasInitializedRef = useRef(false);
  const previousAuthStateRef = useRef<boolean | null>(null);

  // Déterminer quels champs peuvent être modifiés selon le(s) motif(s)
  // Les motifs peuvent être séparés par "|" pour permettre plusieurs motifs
  const getEditableFields = (motif?: string): Set<string> => {
    if (!motif) return new Set(['all']); // Si pas de motif, tous les champs modifiables
    
    const editable = new Set<string>();
    // Séparer les motifs par "|"
    const motifs = motif.split('|').map(m => m.trim());
    
    for (const m of motifs) {
      switch (m) {
        case "Nom/Prénom incorrect":
          editable.add('nom');
          editable.add('prenom');
          break;
        case "Promotion incorrecte":
          editable.add('promotion');
          break;
        case "Filière incorrecte":
          editable.add('filiere');
          break;
        case "Compte existant":
          editable.add('email');
          break;
        case "Non-lauréat":
          editable.add('all');
          break;
      }
    }
    
    // Si "Non-lauréat" est dans les motifs, tous les champs sont modifiables
    if (editable.has('all')) {
      return new Set(['all']);
    }
    
    return editable;
  };
  
  const editableFields = getEditableFields(editMotif);
  const isFieldEditable = (field: string): boolean => {
    if (!isEditMode || !editMotif) return true; // En mode création, tout est modifiable
    return editableFields.has('all') || editableFields.has(field);
  };

  // Charger les données en mode édition
  useEffect(() => {
    const loadEditData = async () => {
      if (!isEditMode || !editId) return;
      
      try {
        setLoading(true);
        const data = await getLaureatById(parseInt(editId));
        
        if (data) {
          setNom(data.nom || "");
          setPrenom(data.prenom || "");
          // Convertir le genre depuis le backend (peut être "HOMME", "FEMME", "homme", "femme") vers "Homme" ou "Femme"
          if (data.genre) {
            const genreLower = data.genre.toLowerCase();
            if (genreLower === "homme" || genreLower === "h" || genreLower === "m") {
              setGenre("Homme");
            } else if (genreLower === "femme" || genreLower === "f") {
              setGenre("Femme");
            } else {
              setGenre("");
            }
          } else {
            setGenre("");
          }
          setTelephone(data.telephone || "");
          setEmail(data.email || "");
          setPromotion(data.promotion || "");
          
          // Convertir filiere depuis backend vers format attendu
          if (data.filiere) {
            const filiereCode = typeof data.filiere === 'string' ? data.filiere.toLowerCase() : data.filiere.toString().toLowerCase();
            // Mapper le code vers un objet Filiere
            const filiereMap: Record<string, { id: number; nom: string; code: string }> = {
              'gc': { id: 1, nom: "Génie Civil", code: "GC" },
              'ge': { id: 2, nom: "Génie Électrique", code: "GE" },
              'gi': { id: 3, nom: "Génie Informatique", code: "GI" },
              'glt': { id: 4, nom: "Génie Logistique et Transports", code: "GLT" },
              'ihe': { id: 5, nom: "Ingénierie Hydraulique et Environnement", code: "IHE" },
              'sig': { id: 6, nom: "Sciences de l'Information Géographique", code: "SIG" },
              'met': { id: 10, nom: "Météorologie", code: "MET" },
            };
            const filiereObj = filiereMap[filiereCode];
            if (filiereObj) {
              setFiliere(filiereObj);
            } else {
              // Si le code n'est pas reconnu, créer un objet par défaut
              setFiliere({ id: 99, nom: filiereCode.toUpperCase(), code: filiereCode });
            }
          }
          
          // Secteur
          const secteurBackend = (data.secteur || "").toUpperCase();
          if (secteurBackend === "PUBLIC" || secteurBackend === "PUBL") {
            setSecteur("Public");
          } else if (secteurBackend === "PRIVE" || secteurBackend === "PRIV") {
            setSecteur("Privé");
          }
          
          // Organisme
          const org = data.autreOrganisme || data.organisme || "";
          if (org && !organismesMaroc.public.find(o => o.nom === org) && 
              !organismesMaroc.privé.find(o => o.nom === org)) {
            setOrganisme("Autre");
            setAutreOrganisme(org);
          } else {
            setOrganisme(org || "");
          }
          
          setLatitude(data.latitude ? String(data.latitude) : "");
          setLongitude(data.longitude ? String(data.longitude) : "");
          
          // Extraire locationName depuis description
          if (data.description) {
            const descParts = data.description.split(' - ');
            if (descParts.length > 0) {
              setLocationName(descParts[0]);
              if (descParts.length > 1) {
                setDescription(descParts.slice(1).join(' - '));
              }
            }
          }
          
          setLaureatId(data.id);
          if (data.status === "rejected") {
            setStatus("rejected");
            setMotifRejet(data.motifRejet || "");
          }
        }
      } catch (error) {
        console.error("Erreur chargement données édition:", error);
        Alert.alert("Erreur", "Impossible de charger les données pour modification");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    
    loadEditData();
  }, [isEditMode, editId]);

  // Fonction pour réinitialiser tous les champs du formulaire
  const resetForm = () => {
    console.log("🔄 Réinitialisation du formulaire d'inscription");
    setCurrentStep(1);
    setPhotoUri(null);
    setNom("");
    setPrenom("");
    setGenre("");
    setTelephone("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setPromotion("");
    setFiliere(null);
    setSecteur("");
    setOrganisme("");
    setAutreOrganisme("");
    setShowOrganismeModal(false);
    setShowLocationModal(false);
    setLatitude("");
    setLongitude("");
    setLocationName("");
    setProvince("");
    setDescription("");
    setStatus("form");
    setLaureatId(null);
    setMotifRejet("");
    setDateSoumission(null);
  };

  // Initialisation au montage (une seule fois)
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    
    // Demander les permissions de notification au démarrage (seulement si pas en mode édition)
    if (!isEditMode) {
      requestNotificationPermissions().catch(() => {
        // Ignorer les erreurs de permission (c'est juste un avertissement)
      });
    }
    
    // Si l'utilisateur a déjà un profil (mais pas connecté via AuthContext), vérifier son statut
    if (user?.id && !isEditMode) {
      checkExistingProfile();
    }
  }, []); // Exécuté une seule fois au montage

  // Gérer la redirection et la réinitialisation selon l'état d'authentification
  useEffect(() => {
    // Si l'utilisateur est déjà connecté et pas en mode édition, rediriger vers le profil
    if (isAuthenticated && user?.id && !isEditMode) {
      console.log("✅ Utilisateur déjà connecté, redirection vers le profil");
      router.replace("/(tabs)/profil");
      return;
    }
    
    // Réinitialiser le formulaire seulement si l'utilisateur vient de se déconnecter
    // (changement d'état d'authentification de true à false)
    const wasAuthenticated = previousAuthStateRef.current;
    const justLoggedOut = wasAuthenticated === true && !isAuthenticated;
    
    if (!isEditMode && justLoggedOut) {
      console.log("🔄 Réinitialisation du formulaire après déconnexion");
      resetForm();
    }
    
    // Mettre à jour la référence de l'état d'authentification
    previousAuthStateRef.current = isAuthenticated;
  }, [isAuthenticated, user?.id, isEditMode]);

  // Vérification périodique du statut si en attente
  useEffect(() => {
    if (status === "pending" && laureatId) {
      // Vérifier le statut toutes les 30 secondes
      const interval = setInterval(() => {
        handleCheckStatus();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [status, laureatId]);

  // Écouter les notifications de réponse
  useEffect(() => {
    const subscription = setupNotificationListener((notification) => {
      console.log("Notification reçue:", notification);
      // Si on reçoit une notification de changement de statut, vérifier
      if (notification.request.content.data?.type === "inscription_validated" || 
          notification.request.content.data?.type === "inscription_rejected") {
        if (laureatId) {
          handleCheckStatus();
        }
      }
    });

    return () => {
      removeNotificationListener(subscription);
    };
  }, [laureatId]);

  const checkExistingProfile = async () => {
    try {
      if (!user?.id) return;
      const { getLaureatById } = await import("../../services/laureats.api");
      const data = await getLaureatById(user.id);
      if (data) {
        if (data.status === "pending") {
          setStatus("pending");
        } else if (data.status === "published") {
          setStatus("validated");
        } else if (data.status === "rejected") {
          setStatus("rejected");
          setMotifRejet(data.motifRejet || "");
        }
        setLaureatId(data.id);
        if (data.dateInscription) {
          setDateSoumission(new Date(data.dateInscription));
        }
      }
    } catch (error) {
      // Pas encore inscrit, continuer avec le formulaire
    }
  };

  const validateStep1 = (): boolean => {
    if (!nom.trim()) {
      Alert.alert("Champ requis", "Veuillez saisir votre nom.");
      return false;
    }
    if (!prenom.trim()) {
      Alert.alert("Champ requis", "Veuillez saisir votre prénom.");
      return false;
    }
    if (!genre) {
      Alert.alert("Champ requis", "Veuillez sélectionner votre genre.");
      return false;
    }
    if (!email.trim()) {
      Alert.alert("Champ requis", "Veuillez saisir votre email.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Email invalide", "Veuillez saisir un email valide.");
      return false;
    }
    // Valider le mot de passe seulement en mode création (pas en mode édition)
    if (!isEditMode && !password.trim()) {
      Alert.alert("Champ requis", "Veuillez saisir un mot de passe.");
      return false;
    }
    if (!isEditMode && password.length < 6) {
      Alert.alert("Mot de passe invalide", "Le mot de passe doit contenir au moins 6 caractères.");
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    // En mode édition, ne valider que les champs modifiables selon le motif
    if (isEditMode && editMotif) {
      // Si le motif ne concerne pas l'étape 2, passer directement
      if (!isFieldEditable('promotion') && !isFieldEditable('filiere')) {
        return true; // Pas de validation nécessaire pour cette étape
      }
      // Valider seulement les champs modifiables
      if (isFieldEditable('promotion') && !promotion) {
        Alert.alert("Champ requis", "Veuillez sélectionner votre promotion.");
        return false;
      }
      if (isFieldEditable('filiere') && !filiere) {
        Alert.alert("Champ requis", "Veuillez sélectionner votre filière.");
        return false;
      }
      return true;
    }
    
    // Mode création : validation complète
    if (!promotion) {
      Alert.alert("Champ requis", "Veuillez sélectionner votre promotion.");
      return false;
    }
    if (!filiere) {
      Alert.alert("Champ requis", "Veuillez sélectionner votre filière.");
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    if (!secteur) {
      Alert.alert("Champ requis", "Veuillez sélectionner le secteur.");
      return false;
    }
    if (!organisme) {
      Alert.alert("Champ requis", "Veuillez sélectionner un organisme.");
      return false;
    }
    if (organisme === "Autre..." && !autreOrganisme.trim()) {
      Alert.alert("Champ requis", "Veuillez préciser le nom de l'organisme.");
      return false;
    }
    if (!latitude || !longitude) {
      Alert.alert("Localisation requise", "Veuillez sélectionner la localisation du lieu de travail.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleLocationSelect = async (coords: [number, number], locationName?: string) => {
    console.log("📍 handleLocationSelect appelé avec:", { coords, locationName });
    console.log("📍 Type de locationName:", typeof locationName);
    console.log("📍 locationName est vide?", !locationName || locationName.trim() === "");
    
    setLatitude(coords[0].toFixed(6));
    setLongitude(coords[1].toFixed(6));
    
    // S'assurer que locationName est défini et non vide
    // Si locationName est vide ou "Position sélectionnée", ne pas le sauvegarder
    const finalLocationName = (locationName && locationName.trim() && locationName.trim() !== "Position sélectionnée") 
      ? locationName.trim() 
      : "";
    
    console.log("📍 locationName final après traitement:", finalLocationName);
    console.log("📍 locationName sera sauvegardé?", finalLocationName !== "");
    
    setLocationName(finalLocationName);
    setShowLocationModal(false);
    
    const lat = parseFloat(coords[0].toFixed(6));
    const lng = parseFloat(coords[1].toFixed(6));
    
    // Récupérer la province depuis le backend (priorité)
    let provinceFound = false;
    try {
      const { getProvinceFromCoordinates } = await import("../../services/geolocalisation.api");
      const provinceData = await getProvinceFromCoordinates(lat, lng);
      if (provinceData?.province && provinceData.province !== "Inconnue") {
        setProvince(provinceData.province);
        console.log("✅ Province récupérée depuis le backend:", provinceData.province);
        provinceFound = true;
      } else {
        console.warn("⚠️ Backend: Province non trouvée ou inconnue");
      }
    } catch (error: any) {
      console.warn("⚠️ Backend indisponible ou erreur:", error.message || error);
      // Continuer avec la fonction de secours
    }
    
    // Si le backend n'a pas fonctionné, utiliser la fonction de secours (Photon)
    if (!provinceFound) {
      try {
        console.log("🔄 Tentative de récupération via géocodage alternatif...");
        const provinceName = await getProvinceFromGeocoding(lat, lng);
        if (provinceName) {
          setProvince(provinceName);
          console.log("✅ Province récupérée via géocodage alternatif:", provinceName);
          provinceFound = true;
        } else {
          console.warn("⚠️ Géocodage alternatif: Aucune province trouvée");
        }
      } catch (geocodingError: any) {
        console.warn("⚠️ Erreur géocodage alternatif:", geocodingError.message || geocodingError);
      }
    }
    
    // Si aucune province n'a été trouvée, laisser vide (sera déterminée par le backend lors de la soumission)
    if (!provinceFound) {
      setProvince("");
      console.log("ℹ️ Province non récupérée maintenant, sera déterminée automatiquement lors de la soumission");
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    try {
      setSubmitting(true);
      console.log("📤 Début de la soumission...");

      const deviceId = await getDeviceId();

      // ✅ Convertir en minuscules pour correspondre aux enums backend
      // Backend attend: "homme"/"femme" (GenreType), "public"/"prive" (SecteurType)
      const secteurCode = secteur === "Public" ? "public" : "prive";
      const genreCode = genre === "Homme" ? "homme" : genre === "Femme" ? "femme" : genre.toLowerCase();
      
      // Organismes sont maintenant gérés via autreOrganisme (pas d'ID)
      let autreOrganismeValue: string | null = null;
      
      if (organisme === "Autre...") {
        autreOrganismeValue = autreOrganisme.trim() || null;
      } else if (organisme) {
        // Utiliser le nom de l'organisme comme autreOrganisme
        autreOrganismeValue = organisme;
      }

      // Code filiere en minuscules (ex: "gi", "sig")
      const filiereCode = filiere?.code?.toLowerCase();
      if (!filiereCode) {
        Alert.alert("Erreur", "Veuillez sélectionner une filière.");
        setSubmitting(false);
        return;
      }

      // Stocker le nom de localisation dans description si disponible
      console.log("📦 Préparation payload - locationName:", locationName);
      console.log("📦 Préparation payload - description:", description);
      console.log("📦 locationName est valide?", locationName && locationName.trim() && locationName.trim() !== "Position sélectionnée");
      
      // IMPORTANT: Toujours utiliser locationName pour description si disponible (même si description existe)
      // Le locationName contient l'adresse complète sélectionnée depuis la carte
      // Ne pas utiliser "Position sélectionnée" comme locationName
      const validLocationName = (locationName && locationName.trim() && locationName.trim() !== "Position sélectionnée")
        ? locationName.trim()
        : null;
      
      const descriptionValue = validLocationName
        ? (description.trim() ? `${validLocationName} - ${description.trim()}` : validLocationName)
        : (description.trim() || undefined);
      
      console.log("📦 validLocationName:", validLocationName);
      console.log("📦 descriptionValue final:", descriptionValue);

      // En mode édition, sauvegarder TOUS les champs pour éviter de perdre des données
      // (seulement les champs modifiables selon le motif sont éditables dans l'UI)
      const payload: any = {
        nom: nom.trim(),
        prenom: prenom.trim(),
        genre: genreCode, // "homme" ou "femme" en minuscules
        email: email.trim(),
        promotion: promotion,
        filiere: filiereCode, // "gi", "sig", etc. en minuscules
        secteur: secteurCode, // "public" ou "prive" en minuscules
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };
      
      // Ajouter les champs optionnels seulement s'ils ont une valeur
      if (telephone.trim()) {
        payload.telephone = telephone.trim();
      }
      if (autreOrganismeValue) {
        payload.autreOrganisme = autreOrganismeValue;
      }
      if (descriptionValue) {
        payload.description = descriptionValue;
      }
      
      // Ajouter deviceId, organisme et mot de passe seulement en mode création
      if (!isEditMode) {
        payload.deviceId = deviceId;
        payload.organisme = autreOrganismeValue || ""; // Requis dans LaureatPayload pour création
        payload.password = password; // Ajouter le mot de passe
      }

      console.log("📦 Payload à envoyer:", JSON.stringify(payload, null, 2));

      let newLaureatId: number;
      
      if (isEditMode && editId) {
        // Mode édition : faire un update
        await updateLaureat(parseInt(editId), payload);
        newLaureatId = parseInt(editId);
        console.log("✅ Profil mis à jour avec succès");
      } else {
        // Mode création : créer un nouveau lauréat
        const response = await createLaureat(payload) as any;
        console.log("✅ Réponse du serveur:", response);
        newLaureatId = response?.id;
      }

      setLaureatId(newLaureatId);

      // Upload de la photo si fournie
      if (photoUri && newLaureatId) {
        try {
          await uploadLaureatPhoto(newLaureatId, photoUri);
        } catch (photoError) {
          console.warn("Erreur upload photo:", photoError);
          // Ne pas bloquer la soumission si l'upload de photo échoue
        }
      }

      if (!isEditMode) {
        // Connecter l'utilisateur avec les données du lauréat (seulement en mode création)
        await login({
          id: newLaureatId,
          nom: nom.trim(),
          prenom: prenom.trim(),
          email: email.trim(),
          deviceId: deviceId,
        });
        
        // Rediriger vers la page profil après inscription réussie
        Alert.alert(
          "Inscription soumise",
          "Votre inscription a été soumise avec succès. Elle est en cours de validation par l'administrateur.",
          [
            {
              text: "OK",
              onPress: () => {
                router.replace("/(tabs)/profil");
              }
            }
          ]
        );
      } else {
        // En mode édition, afficher un message de succès
        Alert.alert(
          "Profil mis à jour",
          "Vos modifications ont été enregistrées. Votre profil est en cours de réexamen.",
          [
            {
              text: "OK",
              onPress: () => {
                router.replace("/(tabs)/profil");
              }
            }
          ]
        );
      }
    } catch (error: any) {
      console.error("❌ Erreur soumission inscription:", error);
      console.error("❌ Détails de l'erreur:", JSON.stringify(error, null, 2));
      
      let errorMessage = "Une erreur est survenue lors de la soumission. Veuillez réessayer.";
      
      if (error.message) {
        errorMessage = error.message;
        // Si c'est une erreur JSON du backend, essayer de l'extraire
        try {
          const errorObj = JSON.parse(error.message);
          if (errorObj.error) {
            errorMessage = errorObj.error;
          }
        } catch {
          // Ce n'est pas du JSON, utiliser le message tel quel
        }
      }
      
      Alert.alert("Erreur de soumission", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckStatus = async (idToCheck?: number) => {
    const id = idToCheck || laureatId || user?.id;
    if (!id) return;

    try {
      setLoading(true);
      const { getLaureatById } = await import("../../services/laureats.api");
      const data = await getLaureatById(id);

      if (data) {
        const previousStatus = status;
        
        if (data.status === "published" && previousStatus !== "validated") {
          setStatus("validated");
          // Envoyer une notification de validation
          await notifyInscriptionValidated();
        } else if (data.status === "rejected" && previousStatus !== "rejected") {
          setStatus("rejected");
          const motif = data.motifRejet || "";
          setMotifRejet(motif);
          // Envoyer une notification de rejet avec le motif
          await notifyInscriptionRejected(motif);
        }
      }
    } catch (error) {
      console.error("Erreur vérification statut:", error);
    } finally {
      setLoading(false);
    }
  };

  // Rendu des écrans de statut
  if (status === "pending") {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.statusContainer}>
          <View style={styles.statusIconContainer}>
            <Ionicons name="time-outline" size={80} color={COLOR_WARNING} />
          </View>
          <Text style={styles.statusTitle}>Inscription en cours de validation</Text>
          <Text style={styles.statusMessage}>
            Votre demande d'inscription a été soumise avec succès. Un administrateur va la vérifier sous peu.
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
              <Text style={styles.statusLabel}>Date de soumission</Text>
              <Text style={styles.statusValue}>
                {dateSoumission
                  ? dateSoumission.toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : new Date().toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
              </Text>
            </View>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Pressable
            style={styles.footerButton}
            onPress={() => router.replace("/(tabs)/annuaire")}
          >
            <Text style={styles.footerButtonText}>Revenir à l'accueil</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (status === "validated") {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.statusContainer}>
          <View style={[styles.statusIconContainer, { backgroundColor: "#E8F5E9" }]}>
            <Ionicons name="checkmark-circle" size={80} color={COLOR_SUCCESS} />
          </View>
          <Text style={styles.statusTitle}>Inscription validée !</Text>
          <Text style={styles.statusMessage}>
            Félicitations ! Votre inscription a été approuvée par l'administrateur. Vous pouvez maintenant accéder à toutes les fonctionnalités de l'application.
          </Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>👥</Text>
              <Text style={styles.featureText}>Consulter l'annuaire des lauréats</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>🗺️</Text>
              <Text style={styles.featureText}>Voir la carte géolocalisée</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>💼</Text>
              <Text style={styles.featureText}>Gérer votre profil professionnel</Text>
            </View>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Pressable
            style={[styles.footerButton, { backgroundColor: COLOR_SUCCESS }]}
            onPress={() => router.replace("/(tabs)/annuaire")}
          >
            <Text style={styles.footerButtonText}>Commencer</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (status === "rejected") {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={24} color={COLOR_WHITE} />
          </Pressable>
          <Text style={styles.headerTitle}>{isEditMode ? "Modifier mon profil" : "Inscription"}</Text>
          <View style={{ width: 32 }} />
        </View>
        <ScrollView contentContainerStyle={styles.statusContainer}>
          <View style={[styles.statusIconContainer, { backgroundColor: "#FFEBEE" }]}>
            <Ionicons name="close-circle" size={80} color={COLOR_ERROR} />
          </View>
          <Text style={styles.statusTitle}>Inscription refusée</Text>
          <View style={styles.rejectionCard}>
            <Text style={styles.rejectionTitle}>Motif du rejet :</Text>
            <Text style={styles.rejectionText}>
              {motifRejet || "Les informations fournies ne correspondent pas à nos enregistrements. Veuillez vérifier votre promotion et votre filière."}
            </Text>
          </View>
          <Text style={styles.statusMessage}>
            Vous pouvez modifier vos informations et soumettre à nouveau votre inscription.
          </Text>
        </ScrollView>
        <View style={styles.footer}>
          <View style={styles.footerButtons}>
            <View style={{ marginRight: 12, flex: 1 }}>
              <Pressable
                style={[styles.footerButton, styles.footerButtonSecondary]}
                onPress={() => router.back()}
              >
                <Text style={[styles.footerButtonText, styles.footerButtonTextSecondary]}>Annuler</Text>
              </Pressable>
            </View>
            <View style={{ flex: 1 }}>
              <Pressable
                style={styles.footerButton}
                onPress={() => {
                  // Réinitialiser le statut pour revenir au formulaire
                  setStatus("form");
                  setCurrentStep(1);
                  // Les données restent dans les champs pour permettre la modification
                  // L'utilisateur peut modifier ce qu'il veut et resoumettre
                }}
              >
                <Text style={styles.footerButtonText}>Modifier</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Rendu du formulaire
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header avec gradient */}
      <LinearGradient
        colors={[COLOR_PRIMARY, COLOR_PRIMARY_DARK]}
        style={styles.header}
      >
        <Pressable onPress={handleBack} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color={COLOR_WHITE} />
        </Pressable>
        <Text style={styles.headerTitle}>{isEditMode ? "Modifier mon profil" : "Inscription"}</Text>
        <View style={{ width: 32 }} />
      </LinearGradient>

      {/* Barre de progression */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <View style={styles.progressStepNumber}>
            <Text style={styles.progressStepNumberText}>{currentStep}</Text>
          </View>
          <Text style={styles.progressStepLabel}>
            {currentStep === 1 ? "Informations personnelles" : currentStep === 2 ? "Parcours académique" : "Situation professionnelle"}
          </Text>
        </View>
        <View style={styles.progressBar}>
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              {step > 1 ? <View style={{ width: 8 }} /> : null}
              <View
                style={[
                  styles.progressBarItem,
                  step <= currentStep ? styles.progressBarItemActive : null,
                ]}
              />
            </React.Fragment>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Étape 1 - Informations personnelles */}
        {currentStep === 1 ? (
          <View style={styles.stepContainer}>
            <View style={styles.photoContainer}>
              <ProfileUpload
                onImageUpdate={setPhotoUri}
                onError={(error) => console.warn("Erreur photo:", error)}
                currentImage={photoUri || undefined}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Nom <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, !isFieldEditable('nom') && styles.inputDisabled]}
                value={nom}
                onChangeText={setNom}
                placeholder="Nom"
                placeholderTextColor={COLOR_MUTED}
                editable={isFieldEditable('nom')}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Prénom <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, !isFieldEditable('prenom') && styles.inputDisabled]}
                value={prenom}
                onChangeText={setPrenom}
                placeholder="Prénom"
                placeholderTextColor={COLOR_MUTED}
                editable={isFieldEditable('prenom')}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Genre <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.genreButtons}>
                <Pressable
                  style={[
                    styles.genreButton,
                    genre === "Homme" ? styles.genreButtonActive : null,
                    !isFieldEditable('genre') && styles.genreButtonDisabled,
                  ]}
                  onPress={() => isFieldEditable('genre') && setGenre("Homme")}
                  disabled={!isFieldEditable('genre')}
                >
                  <Text
                    style={[
                      styles.genreButtonText,
                      genre === "Homme" ? styles.genreButtonTextActive : null,
                      !isFieldEditable('genre') && styles.genreButtonTextDisabled,
                    ]}
                  >
                    Homme
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.genreButton,
                    styles.genreButtonLast,
                    genre === "Femme" ? styles.genreButtonActive : null,
                    !isFieldEditable('genre') && styles.genreButtonDisabled,
                  ]}
                  onPress={() => isFieldEditable('genre') && setGenre("Femme")}
                  disabled={!isFieldEditable('genre')}
                >
                  <Text
                    style={[
                      styles.genreButtonText,
                      genre === "Femme" ? styles.genreButtonTextActive : null,
                      !isFieldEditable('genre') && styles.genreButtonTextDisabled,
                    ]}
                  >
                    Femme
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={telephone}
                onChangeText={setTelephone}
                placeholder="+212 6XX XXX XXX"
                placeholderTextColor={COLOR_MUTED}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, !isFieldEditable('email') && styles.inputDisabled]}
                value={email}
                onChangeText={setEmail}
                placeholder="votre.email@example.com"
                placeholderTextColor={COLOR_MUTED}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={isFieldEditable('email')}
              />
            </View>

            {!isEditMode && (
              <View style={styles.field}>
                <Text style={styles.label}>
                  Mot de passe <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Au moins 6 caractères"
                    placeholderTextColor={COLOR_MUTED}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={COLOR_MUTED}
                    />
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        ) : null}

        {/* Étape 2 - Parcours académique */}
        {currentStep === 2 ? (
          <View style={styles.stepContainer}>
            <PromotionSelection
              selectedPromotion={promotion}
              setSelectedPromotion={setPromotion}
              disabled={!isFieldEditable('promotion')}
            />

            <FiliereSelection
              selectedFiliere={filiere}
              setSelectedFiliere={setFiliere}
              disabled={!isFieldEditable('filiere')}
            />

            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Ionicons name="checkmark-circle" size={20} color={COLOR_SECONDARY} />
              </View>
              <Text style={styles.infoText}>
                Ces informations nous permettent de mieux vous connecter avec vos camarades de promotion
              </Text>
            </View>
          </View>
        ) : null}

        {/* Étape 3 - Situation professionnelle */}
        {currentStep === 3 ? (
          <View style={styles.stepContainer}>
            <View style={styles.field}>
              <Text style={styles.label}>Secteur</Text>
              <View style={styles.genreButtons}>
                <Pressable
                  style={[
                    styles.genreButton,
                    secteur === "Public" ? styles.genreButtonActive : null,
                  ]}
                  onPress={() => setSecteur("Public")}
                >
                  <Text
                    style={[
                      styles.genreButtonText,
                      secteur === "Public" ? styles.genreButtonTextActive : null,
                    ]}
                  >
                    Public
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.genreButton,
                    styles.genreButtonLast,
                    secteur === "Privé" ? styles.genreButtonActive : null,
                  ]}
                  onPress={() => setSecteur("Privé")}
                >
                  <Text
                    style={[
                      styles.genreButtonText,
                      secteur === "Privé" ? styles.genreButtonTextActive : null,
                    ]}
                  >
                    Privé
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Organisme / Entreprise <Text style={styles.required}>*</Text>
              </Text>
              <Pressable
                style={styles.selectButton}
                onPress={() => setShowOrganismeModal(true)}
              >
                <Text style={organisme ? styles.selectedText : styles.placeholderText}>
                  {organisme || "Sélectionner un organisme"}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLOR_PRIMARY} />
              </Pressable>
            </View>

            {organisme === "Autre..." ? (
              <View style={styles.field}>
                <Text style={styles.label}>Autre organisme</Text>
                <TextInput
                  style={styles.input}
                  value={autreOrganisme}
                  onChangeText={setAutreOrganisme}
                  placeholder="Si autre, précisez..."
                  placeholderTextColor={COLOR_MUTED}
                />
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>
                Localisation du lieu de travail <Text style={styles.required}>*</Text>
              </Text>
              <Pressable
                style={styles.locationButton}
                onPress={() => {
                  console.log("📍 Bouton localisation pressé - Ouverture du modal");
                  setShowLocationModal(true);
                }}
              >
                <Ionicons name="location" size={32} color={COLOR_MUTED} />
                {locationName ? (
                  <>
                    <Text style={styles.locationButtonText}>{locationName}</Text>
                    <Text style={styles.locationCoords}>
                      Latitude: {latitude}, Longitude: {longitude}
                    </Text>
                  </>
                ) : latitude && longitude ? (
                  <Text style={styles.locationCoords}>
                    Latitude: {latitude}, Longitude: {longitude}
                  </Text>
                ) : (
                  <Text style={styles.locationButtonText}>Appuyez pour géolocaliser</Text>
                )}
              </Pressable>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Province</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={province || "Récupéré automatiquement"}
                editable={false}
                placeholderTextColor={COLOR_MUTED}
              />
              <Text style={styles.helperText}>Récupéré automatiquement</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Parlez-nous de votre parcours professionnel..."
                placeholderTextColor={COLOR_MUTED}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Footer avec boutons */}
      <View style={styles.footer}>
        {currentStep > 1 ? (
          <View style={styles.footerButtons}>
            <View style={{ marginRight: 12, flex: 1 }}>
              <Pressable
                style={[styles.footerButton, styles.footerButtonSecondary]}
                onPress={handleBack}
              >
                <Text style={[styles.footerButtonText, styles.footerButtonTextSecondary]}>
                  Retour
                </Text>
              </Pressable>
            </View>
            {currentStep === 3 ? (
              <Pressable
                style={styles.footerButton}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={COLOR_WHITE} />
                ) : (
                  <Text style={styles.footerButtonText}>Soumettre</Text>
                )}
              </Pressable>
            ) : (
              <View style={{ flex: 1 }}>
                <Pressable 
                  style={styles.footerButton} 
                  onPress={handleNext}
                >
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: "#FFFFFF", textAlign: "center" }}>
                    Suivant
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        ) : (
          <Pressable 
            style={styles.footerButton} 
            onPress={handleNext}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#FFFFFF", textAlign: "center" }}>
              Suivant
            </Text>
          </Pressable>
        )}
      </View>

      {/* Modal sélection organisme */}
      {showOrganismeModal ? (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner un organisme</Text>
              <Pressable onPress={() => setShowOrganismeModal(false)}>
                <Ionicons name="close" size={24} color={COLOR_BLACK} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalList}>
              {/* Organismes filtrés selon le secteur */}
              {(() => {
                const secteurKey = secteur === "Public" ? "public" : secteur === "Privé" ? "privé" : null;
                const organismesToShow = secteurKey ? organismesMaroc[secteurKey as keyof typeof organismesMaroc] || [] : [];
                
                return organismesToShow.map((org, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.modalItem,
                      organisme === org.nom ? styles.modalItemSelected : null,
                    ]}
                    onPress={() => {
                      setOrganisme(org.nom);
                      setShowOrganismeModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        organisme === org.nom ? styles.modalItemTextSelected : null,
                      ]}
                    >
                      {org.nom}
                    </Text>
                    {organisme === org.nom ? (
                      <Ionicons name="checkmark" size={20} color={COLOR_PRIMARY} />
                    ) : null}
                  </Pressable>
                ));
              })()}
              {/* Option "Autre..." */}
              <Pressable
                style={[
                  styles.modalItem,
                  organisme === "Autre..." ? styles.modalItemSelected : null,
                ]}
                onPress={() => {
                  setOrganisme("Autre...");
                  setShowOrganismeModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    organisme === "Autre..." ? styles.modalItemTextSelected : null,
                  ]}
                >
                  Autre...
                </Text>
                {organisme === "Autre..." ? (
                  <Ionicons name="checkmark" size={20} color={COLOR_PRIMARY} />
                ) : null}
              </Pressable>
            </ScrollView>
          </View>
    </View>
      ) : null}

      {/* Modal géolocalisation */}
      <LocationMapModal
        visible={showLocationModal}
        onClose={() => {
          console.log("📍 Modal géolocalisation fermé");
          setShowLocationModal(false);
        }}
        onSelect={handleLocationSelect}
        initialCoordinates={
          latitude && longitude
            ? [parseFloat(latitude), parseFloat(longitude)]
            : undefined
        }
        zoomLevel={10}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_WHITE,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 12,
    paddingBottom: 16,
  },
  headerButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLOR_WHITE,
  },
  progressContainer: {
    backgroundColor: COLOR_WHITE,
    borderBottomWidth: 1,
    borderBottomColor: `${COLOR_MUTED}30`,
    padding: 16,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  progressStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLOR_SECONDARY,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  progressStepNumberText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLOR_WHITE,
  },
  progressStepLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: COLOR_BLACK,
  },
  progressBar: {
    flexDirection: "row",
  },
  progressBarItem: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0", // --color-border
  },
  progressBarItemActive: {
    backgroundColor: COLOR_PRIMARY,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  stepContainer: {
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLOR_BLACK,
    marginBottom: 8,
  },
  required: {
    color: COLOR_ERROR,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0", // --color-border
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: COLOR_WHITE,
    color: COLOR_BLACK,
  },
  inputDisabled: {
    backgroundColor: "#FAFAF5", // --color-background-light
    color: COLOR_MUTED,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    backgroundColor: COLOR_WHITE,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: COLOR_BLACK,
  },
  passwordToggle: {
    padding: 12,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  helperText: {
    fontSize: 12,
    color: COLOR_MUTED,
    marginTop: 4,
  },
  genreButtons: {
    flexDirection: "row",
  },
  genreButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#E0E0E0", // --color-border
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: COLOR_WHITE,
  },
  genreButtonLast: {
    marginLeft: 12,
  },
  genreButtonActive: {
    borderColor: COLOR_PRIMARY,
    backgroundColor: "#E8F5E9", // Vert clair pour correspondre au thème
  },
  genreButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLOR_MUTED,
  },
  genreButtonTextActive: {
    color: COLOR_PRIMARY,
  },
  genreButtonDisabled: {
    backgroundColor: COLOR_BG,
    borderColor: "#E0E0E0",
    opacity: 0.6,
  },
  genreButtonTextDisabled: {
    color: COLOR_MUTED_LIGHT,
  },
  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0", // --color-border
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLOR_WHITE,
  },
  placeholderText: {
    fontSize: 14,
    color: COLOR_MUTED,
  },
  selectedText: {
    fontSize: 14,
    color: COLOR_BLACK,
    fontWeight: "500",
  },
  locationButton: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#E0E0E0", // --color-border
    borderRadius: 10,
    paddingVertical: 32,
    alignItems: "center",
    backgroundColor: COLOR_WHITE,
  },
  locationButtonText: {
    fontSize: 14,
    color: COLOR_MUTED,
  },
  locationCoords: {
    fontSize: 12,
    color: COLOR_MUTED,
    marginTop: 4,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E8F5E9", // Vert clair pour correspondre au thème
    borderWidth: 1,
    borderColor: "#8A9B7A", // --color-primary-light
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
  },
  infoIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#2E7D32", // Vert foncé pour le texte
    lineHeight: 20,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: COLOR_WHITE,
    padding: 16,
  },
  footerButtons: {
    flexDirection: "row",
  },
  footerButton: {
    flex: 1,
    backgroundColor: COLOR_SECONDARY,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  footerButtonSecondary: {
    backgroundColor: COLOR_WHITE,
    borderWidth: 2,
    borderColor: "#E0E0E0", // --color-border
    marginRight: 12,
  },
  footerButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  footerButtonTextSecondary: {
    color: COLOR_BLACK,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLOR_WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLOR_BLACK,
  },
  modalList: {
    padding: 8,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 10,
    marginVertical: 4,
  },
  modalItemSelected: {
    backgroundColor: COLOR_BG,
  },
  modalItemText: {
    fontSize: 16,
    color: COLOR_BLACK,
  },
  modalItemTextSelected: {
    fontWeight: "700",
    color: COLOR_PRIMARY,
  },
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
  },
  statusCard: {
    width: "100%",
    backgroundColor: "#FAFAF5", // --color-background-light
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
  featuresList: {
    width: "100%",
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#FAFAF5", // --color-background-light
    borderRadius: 10,
    marginBottom: 12,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: COLOR_BLACK,
  },
  rejectionCard: {
    width: "100%",
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
  },
  rejectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 8,
  },
  rejectionText: {
    fontSize: 14,
    color: "#78350F",
    lineHeight: 20,
  },
});
