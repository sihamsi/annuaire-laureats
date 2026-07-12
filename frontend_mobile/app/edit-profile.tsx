import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import LocationMapModal from "../components/LocationMapModal";
import { getLaureatById, updateLaureat, uploadLaureatPhoto } from "../services/laureats.api";
import { useAuth } from "../contexts/AuthContext";
import { mapFiliere } from "../utils/helpers";

type Secteur = "Public" | "Privé" | "";
type Organisme =
  | ""
  | "OCP"
  | "ONEE"
  | "ONCF"
  | "Maroc Telecom"
  | "Bank of Africa"
  | "Attijariwafa Bank"
  | "BMCE Bank"
  | "Ministère de l'Equipement"
  | "Ministère de l'Intérieur"
  | "LYDEC"
  | "REDAL"
  | "AMENDIS"
  | "CDG"
  | "RAM"
  | "Autre";

/* 🎨 Palette - Alignée avec le thème web */
const COLOR_BG = "#F5F5F0"; // --color-background
const COLOR_PRIMARY = "#6B7F5C"; // --color-primary
const COLOR_PRIMARY_DARK = "#556448"; // --color-primary-dark
const COLOR_PRIMARY_LIGHT = "#8A9B7A"; // --color-primary-light
const COLOR_WHITE = "#FFFFFF"; // --color-background-white
const COLOR_BLACK = "#2C2C2C"; // --color-text-primary
const COLOR_MUTED = "#666666"; // --color-text-secondary
const COLOR_MUTED_LIGHT = "#999999"; // --color-text-light

const organismes: Organisme[] = [
  "Autre",
  "AMENDIS",
  "Attijariwafa Bank",
  "Bank of Africa",
  "BMCE Bank",
  "CDG",
  "LYDEC",
  "Maroc Telecom",
  "Ministère de l'Equipement",
  "Ministère de l'Intérieur",
  "OCP",
  "ONEE",
  "ONCF",
  "RAM",
  "REDAL",
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id, motif } = useLocalSearchParams<{ id: string; motif?: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Déterminer quels champs peuvent être modifiés selon le motif
  const getEditableFields = (motif?: string): Set<string> => {
    if (!motif) return new Set(['all']); // Si pas de motif, tous les champs modifiables
    
    const editable = new Set<string>();
    
    switch (motif) {
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
        // Tous les champs peuvent être modifiés
        editable.add('all');
        break;
      default:
        editable.add('all');
    }
    
    return editable;
  };
  
  const editableFields = getEditableFields(motif);
  const isFieldEditable = (field: string): boolean => {
    return editableFields.has('all') || editableFields.has(field);
  };

  // --- Champs (affichés)
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [genre, setGenre] = useState("");
  const [promotion, setPromotion] = useState("");
  const [filiere, setFiliere] = useState("");

  // --- Champs modifiables
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");

  const [secteur, setSecteur] = useState("");
  const [organisme, setOrganisme] = useState("");
  const [autreOrganisme, setAutreOrganisme] = useState("");
  const [province, setProvince] = useState("");

  const [description, setDescription] = useState("");

  // --- Localisation (modifiable via carte)
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [locationName, setLocationName] = useState<string>("");
  const [showMap, setShowMap] = useState(false);
  
  // --- Photo
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  
  // --- Modals
  const [showSecteurModal, setShowSecteurModal] = useState(false);
  const [showOrganismeModal, setShowOrganismeModal] = useState(false);

  const initials = useMemo(() => {
    const a = (nom?.trim()?.[0] || "").toUpperCase();
    const b = (prenom?.trim()?.[0] || "").toUpperCase();
    return (a + b) || "LK";
  }, [nom, prenom]);

  /* Charger profil */
  useEffect(() => {
    const load = async () => {
      if (!id) {
        Alert.alert("Erreur", "ID manquant");
        router.back();
        return;
      }

      try {
        setLoading(true);
        
        // 🔒 Vérifier que c'est bien SON profil via user.id
        if (!user?.id) {
          Alert.alert("Erreur", "Vous n'êtes pas connecté.");
          router.back();
          return;
        }
        
        // Vérifier que l'ID demandé correspond au profil de l'utilisateur
        if (user.id !== parseInt(id as string)) {
          Alert.alert("Accès refusé", "Vous ne pouvez modifier que votre propre profil.");
          router.back();
          return;
        }
        
        const data = await getLaureatById(id);
        if (!data) throw new Error("Impossible de charger le profil");

        // lecture seule (affiché)
        setNom(data.nom ?? "");
        setPrenom(data.prenom ?? "");
        setGenre(data.genre ?? "");
        setPromotion(data.promotion ?? "");
        setFiliere(data.filiere ?? "");

        // modifiable
        setTelephone(data.telephone ?? "");
        setEmail(data.email ?? "");

        // Convertir secteur depuis backend (PUBLIC/PRIVE) vers format affichage (Public/Privé)
        const secteurBackend = (data.secteur ?? "").toUpperCase();
        if (secteurBackend === "PUBLIC") {
          setSecteur("Public");
        } else if (secteurBackend === "PRIVE") {
          setSecteur("Privé");
        } else {
          setSecteur("");
        }
        setProvince(data.province ?? "");
        setLatitude(data.latitude ? String(data.latitude) : "");
        setLongitude(data.longitude ? String(data.longitude) : "");
        setDescription(data.description ?? "");
        // Extraire locationName depuis description si disponible
        // Format: "locationName" ou "locationName - description"
        if (data.description) {
          const descParts = data.description.split(' - ');
          if (descParts.length > 0) {
            setLocationName(descParts[0]);
          }
        }

        // organisme: si c'est pas dans la liste => Autre
        const org = (data.organisme ?? "").trim();
        if (org && !organismes.includes(org as Organisme)) {
          setOrganisme("Autre");
          setAutreOrganisme(org);
        } else {
          setOrganisme((org || "") as Organisme);
          setAutreOrganisme("");
        }
      } catch (e: any) {
        Alert.alert("Erreur", e?.message ?? "Erreur de chargement");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  /* Enregistrer */
  const onSave = async () => {
    console.log("🔘 Bouton Valider cliqué");
    console.log("🔘 État saving:", saving);
    if (!id) {
      console.warn("⚠️ ID manquant");
      return;
    }

    // validations
    if (!email.trim()) {
      Alert.alert("Champs requis", "Email obligatoire.");
      return;
    }
    if (!secteur) {
      Alert.alert("Champs requis", "Veuillez choisir un secteur.");
      return;
    }
    if (!organisme) {
      Alert.alert("Champs requis", "Veuillez choisir un organisme.");
      return;
    }
    if (organisme === "Autre" && !autreOrganisme.trim()) {
      Alert.alert("Champs requis", "Veuillez préciser le nom de l'organisme.");
      return;
    }
    if (!latitude.trim() || !longitude.trim()) {
      Alert.alert("Localisation requise", "Veuillez choisir la localisation GPS.");
      return;
    }

    try {
      setSaving(true);

      // ✅ Convertir secteur pour le backend (en minuscules pour correspondre aux enums)
      const secteurCode = secteur === "Public" ? "public" : "prive";

      // Stocker le nom de localisation dans description si disponible (même logique que inscription)
      console.log("📦 Préparation payload (edit-profile) - locationName:", locationName);
      console.log("📦 Préparation payload (edit-profile) - description:", description);
      console.log("📦 locationName est valide?", locationName && locationName.trim() && locationName.trim() !== "Position sélectionnée");
      
      // IMPORTANT: Toujours utiliser locationName pour description si disponible (même si description existe)
      // Le locationName contient l'adresse complète sélectionnée depuis la carte
      // Ne pas utiliser "Position sélectionnée" comme locationName
      const validLocationName = (locationName && locationName.trim() && locationName.trim() !== "Position sélectionnée")
        ? locationName.trim()
        : null;
      
      const descriptionValue = validLocationName
        ? (description.trim() ? `${validLocationName} - ${description.trim()}` : validLocationName)
        : (description.trim() || null);
      
      console.log("📦 validLocationName (edit-profile):", validLocationName);
      console.log("📦 descriptionValue final (edit-profile):", descriptionValue);

      const payload = {
        telephone: telephone.trim() || null,
        email: email.trim(),
        secteur: secteurCode, // "public" ou "prive" en minuscules
        autreOrganisme: organisme === "Autre" ? autreOrganisme.trim() : null,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        description: descriptionValue,
        // Note: organismeId sera géré côté backend si nécessaire
      };

      console.log("📤 Mise à jour profil - Payload:", JSON.stringify(payload, null, 2));

      await updateLaureat(parseInt(id as string), payload);

      // Upload de la photo si modifiée
      if (photoUri) {
        await uploadLaureatPhoto(parseInt(id as string), photoUri);
      }

      Alert.alert(
        "Succès ✅",
        "Profil modifié avec succès. Les modifications seront réexaminées par l'administrateur.",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(tabs)/index");
              // Navigation vers le tab profil après un court délai
              setTimeout(() => {
                router.push("/(tabs)/profil");
              }, 100);
            },
          },
        ]
      );
    } catch (e: any) {
      console.error("Erreur mise à jour profil:", e);
      Alert.alert("Erreur", e?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission refusée",
        "L'accès à la galerie est nécessaire pour ajouter une photo."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleLocationSelect = async (coords: [number, number], locationName?: string) => {
    console.log("📍 handleLocationSelect (edit-profile) appelé avec:", { coords, locationName });
    console.log("📍 Type de locationName:", typeof locationName);
    console.log("📍 locationName est vide?", !locationName || locationName.trim() === "");
    
    setLatitude(coords[0].toFixed(6));
    setLongitude(coords[1].toFixed(6));
    
    // S'assurer que locationName est défini et non vide
    // Si locationName est vide ou "Position sélectionnée", ne pas le sauvegarder
    const finalLocationName = (locationName && locationName.trim() && locationName.trim() !== "Position sélectionnée") 
      ? locationName.trim() 
      : "";
    
    console.log("📍 locationName final après traitement (edit-profile):", finalLocationName);
    console.log("📍 locationName sera sauvegardé?", finalLocationName !== "");
    
    setLocationName(finalLocationName);
    setShowMap(false);
    
    const lat = parseFloat(coords[0].toFixed(6));
    const lng = parseFloat(coords[1].toFixed(6));
    
    // Récupérer la province depuis le backend (priorité)
    let provinceFound = false;
    try {
      const { getProvinceFromCoordinates } = await import("../services/geolocalisation.api");
      const provinceData = await getProvinceFromCoordinates(lat, lng);
      if (provinceData?.province && provinceData.province !== "Inconnue") {
        setProvince(provinceData.province);
        console.log("✅ Province récupérée depuis le backend (edit-profile):", provinceData.province);
        provinceFound = true;
      } else {
        console.warn("⚠️ Backend: Province non trouvée ou inconnue");
      }
    } catch (error: any) {
      console.warn("⚠️ Backend indisponible ou erreur:", error.message || error);
    }
    
    // Si aucune province n'a été trouvée, laisser vide (sera déterminée par le backend lors de la soumission)
    if (!provinceFound) {
      setProvince("");
      console.log("ℹ️ Province non récupérée maintenant (edit-profile), sera déterminée automatiquement lors de la soumission");
    }
  };

  const handleGetLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "Impossible de récupérer votre position sans autorisation."
        );
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLatitude(loc.coords.latitude.toFixed(6));
      setLongitude(loc.coords.longitude.toFixed(6));
      Alert.alert("Localisation récupérée ✅");
    } catch (error) {
      console.error("Erreur GPS:", error);
      Alert.alert("Erreur", "Impossible de récupérer la localisation GPS");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      {/* Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.headerIconBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLOR_WHITE} />
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle}>Modifier le profil</Text>
        <View style={styles.headerIconBtn} />
      </View>

      {loading ? (
        <View style={{ paddingTop: 40 }}>
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Avatar + Identité */}
          <View style={styles.topBlock}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.nameText}>{nom} {prenom}</Text>
            <Text style={styles.subText}>
              {filiere ? (mapFiliere(filiere) || filiere) : "—"} | Promotion : {promotion || "—"}
            </Text>

            {/* Identité lecture seule */}
            <View style={styles.readOnlyRow}>
              <Ionicons name="person-outline" size={16} color={COLOR_PRIMARY} />
              <Text style={styles.readOnlyText}>Genre : {genre || "—"}</Text>
            </View>
          </View>

          {/* Formulaire */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Informations modifiables</Text>

            {/* Téléphone */}
            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              style={styles.input}
              value={telephone}
              onChangeText={setTelephone}
              placeholder="Ex : 0612345678"
              placeholderTextColor={COLOR_MUTED}
              keyboardType="phone-pad"
            />

            {/* Email */}
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="exemple@domaine.com"
              placeholderTextColor={COLOR_MUTED}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {/* Secteur */}
            <Text style={styles.label}>Secteur <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => setShowSecteurModal(true)}
            >
              <Text style={secteur ? styles.selectedText : styles.placeholderText}>
                {secteur || "Sélectionner"}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLOR_PRIMARY} />
            </TouchableOpacity>

            {/* Organisme */}
            <Text style={styles.label}>Organisme / Entreprise <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => setShowOrganismeModal(true)}
            >
              <Text style={organisme ? styles.selectedText : styles.placeholderText}>
                {organisme || "Sélectionner"}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLOR_PRIMARY} />
            </TouchableOpacity>

            {organisme === "Autre" && (
              <>
                <Text style={styles.label}>Autre organisme *</Text>
                <TextInput
                  style={styles.input}
                  value={autreOrganisme}
                  onChangeText={setAutreOrganisme}
                  placeholder="Nom de l'organisme"
                  placeholderTextColor={COLOR_MUTED}
                />
              </>
            )}

            {/* Photo de profil */}
            <Text style={styles.label}>Photo de profil</Text>
            <TouchableOpacity
              style={styles.photoUpload}
              onPress={handlePickImage}
            >
              {photoUri ? (
                <Text style={styles.photoPreviewText}>Photo sélectionnée ✓</Text>
              ) : (
                <>
                  <Ionicons name="camera" size={48} color={COLOR_PRIMARY} />
                  <Text style={styles.photoUploadText}>Cliquez pour changer la photo</Text>
                  <Text style={styles.photoUploadHint}>JPG, PNG (Max 5MB)</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Localisation - même interface que inscription */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Localisation du lieu de travail <Text style={styles.required}>*</Text>
              </Text>
              <Pressable
                style={styles.locationButton}
                onPress={() => setShowMap(true)}
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

            {/* Province (automatique, désactivée) */}
            <View style={styles.field}>
              <Text style={styles.label}>Province</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={province || "Récupéré automatiquement"}
                editable={false}
                placeholderTextColor={COLOR_MUTED}
              />
            </View>

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Décrivez votre poste, activité, etc."
              placeholderTextColor={COLOR_MUTED}
              multiline
            />
          </View>

          {/* Valider */}
          <Pressable 
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]} 
            onPress={() => {
              console.log("🔘 Pressable Valider pressé, saving:", saving);
              if (!saving) {
                onSave();
              }
            }}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={COLOR_WHITE} size="small" />
            ) : (
              <Text style={styles.saveText}>Valider</Text>
            )}
          </Pressable>

          <Text style={styles.hint}>
            * Champs obligatoires. La localisation se choisit via la carte.
          </Text>
        </ScrollView>
      )}

      {/* Map modal */}
      <LocationMapModal
        visible={showMap}
        onClose={() => setShowMap(false)}
        onSelect={handleLocationSelect}
        initialCoordinates={latitude && longitude ? [parseFloat(latitude), parseFloat(longitude)] : undefined}
      />

      {/* Modal Secteur */}
      <Modal
        visible={showSecteurModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSecteurModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionnez un secteur</Text>
              <TouchableOpacity onPress={() => setShowSecteurModal(false)}>
                <Ionicons name="close" size={24} color={COLOR_BLACK} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.optionsList}>
              {["Public", "Privé"].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.optionItem,
                    secteur === s && styles.optionItemSelected
                  ]}
                  onPress={() => {
                    setSecteur(s as Secteur);
                    setShowSecteurModal(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    secteur === s && styles.optionTextSelected
                  ]}>
                    {s}
                  </Text>
                  {secteur === s && (
                    <Ionicons name="checkmark" size={20} color={COLOR_PRIMARY} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Organisme */}
      <Modal
        visible={showOrganismeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOrganismeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionnez un organisme</Text>
              <TouchableOpacity onPress={() => setShowOrganismeModal(false)}>
                <Ionicons name="close" size={24} color={COLOR_BLACK} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.optionsList}>
              {organismes.map((o) => (
                <TouchableOpacity
                  key={o}
                  style={[
                    styles.optionItem,
                    organisme === o && styles.optionItemSelected
                  ]}
                  onPress={() => {
                    setOrganisme(o as Organisme);
                    setShowOrganismeModal(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    organisme === o && styles.optionTextSelected
                  ]}>
                    {o}
                  </Text>
                  {organisme === o && (
                    <Ionicons name="checkmark" size={20} color={COLOR_PRIMARY} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: COLOR_BG 
  },

  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 12,
    paddingHorizontal: 16,
    paddingBottom: 15,
    backgroundColor: COLOR_PRIMARY,
    ...(Platform.OS !== "web" && {
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  topHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLOR_WHITE,
  },

  container: { padding: 16, paddingBottom: 30 },

  topBlock: {
    alignItems: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLOR_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: COLOR_WHITE,
  },
  avatarText: { color: COLOR_WHITE, fontWeight: "900", fontSize: 26 },
  nameText: { marginTop: 10, fontSize: 18, fontWeight: "900", color: COLOR_BLACK },
  subText: { marginTop: 4, fontSize: 12, color: COLOR_MUTED, textAlign: "center" },

  readOnlyRow: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    backgroundColor: COLOR_WHITE,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(142,156,120,0.35)",
  },
  readOnlyText: { color: COLOR_BLACK, fontWeight: "700", fontSize: 12 },

  card: {
    backgroundColor: COLOR_WHITE,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(142,156,120,0.35)",
  },
  sectionTitle: {
    fontWeight: "900",
    color: COLOR_BLACK,
    marginBottom: 10,
    fontSize: 14,
  },
  label: { fontWeight: "700", marginTop: 12, marginBottom: 6, color: COLOR_BLACK },

  input: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    backgroundColor: COLOR_WHITE,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLOR_BLACK,
  },
  textArea: { height: 110, textAlignVertical: "top" },

  required: {
    color: "#D32F2F",
  },

  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    backgroundColor: COLOR_WHITE,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  placeholderText: {
    color: COLOR_MUTED,
    fontSize: 14,
  },
  selectedText: {
    color: COLOR_BLACK,
    fontSize: 14,
    fontWeight: "600",
  },

  photoUpload: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLOR_WHITE,
    minHeight: 150,
  },
  photoPreviewText: {
    fontSize: 14,
    color: COLOR_PRIMARY,
    fontWeight: "600",
  },
  photoUploadText: {
    marginTop: 10,
    fontSize: 14,
    color: COLOR_MUTED,
    fontWeight: "500",
  },
  photoUploadHint: {
    marginTop: 5,
    fontSize: 12,
    color: COLOR_MUTED,
  },

  mapLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    gap: 12,
  },
  mapLocationButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLOR_WHITE,
    flex: 1,
    textAlign: "center",
  },
  mapLocationButtonHint: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },

  coordsDisplay: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  coordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  coordLabel: {
    fontSize: 13,
    color: COLOR_MUTED,
    fontWeight: "500",
  },
  coordValue: {
    fontSize: 13,
    color: COLOR_BLACK,
    fontWeight: "600",
  },

  mapSelectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLOR_WHITE,
    borderWidth: 1,
    borderColor: COLOR_PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  mapSelectButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLOR_PRIMARY,
  },

  inputDisabled: {
    backgroundColor: "#F3F4F6",
    color: COLOR_MUTED,
  },

  modalOverlay: {
    flex: 1,
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
  optionsList: {
    padding: 8,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 10,
    marginVertical: 4,
  },
  optionItemSelected: {
    backgroundColor: COLOR_BG,
  },
  optionText: {
    fontSize: 16,
    color: COLOR_BLACK,
  },
  optionTextSelected: {
    fontWeight: "700",
    color: COLOR_PRIMARY,
  },
  locationButton: {
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLOR_BG,
    minHeight: 120,
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLOR_BLACK,
    marginTop: 8,
    textAlign: "center",
  },
  locationCoords: {
    fontSize: 11,
    color: COLOR_MUTED,
    marginTop: 4,
    textAlign: "center",
  },

  saveBtn: {
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: COLOR_PRIMARY,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    opacity: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveText: { 
    color: COLOR_WHITE, 
    fontWeight: "900", 
    fontSize: 16,
    letterSpacing: 0.5,
  },

  hint: { marginTop: 10, color: COLOR_MUTED, fontSize: 11, textAlign: "center" },
});
