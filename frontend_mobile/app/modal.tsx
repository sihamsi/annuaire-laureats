import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Image,
  ScrollView,
  Modal as RNModal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getLaureatById } from "../services/laureats.api";
import LocationMapModal from "../components/LocationMapModal";

// ✅ Palette (comme ton inscription)
const COLOR_BG = "#DFECC6";
const COLOR_PRIMARY = "#8E9C78";
const COLOR_MUTED = "#929292";
const COLOR_WHITE = "#FFFFFF";
const COLOR_BLACK = "#000000";

type Laureat = {
  id: number;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  promotion?: string;
  filiere?: string;
  organisme?: string;
  secteur?: string;
  province?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  photoUri?: string | null;
  genre?: string;
};

export default function LaureatDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const id = params?.id ? String(params.id) : null;

  const [item, setItem] = useState<Laureat | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMapModal, setShowMapModal] = useState(false);

  const fullName = useMemo(() => {
    if (!item) return "";
    return `${item.nom ?? ""} ${item.prenom ?? ""}`.trim();
  }, [item]);

  const subtitle = useMemo(() => {
    if (!item) return "";
    const filiereLabel = item.filiere ? mapFiliere(item.filiere) : "—";
    const promo = item.promotion ? item.promotion : "—";
    return `${filiereLabel} | Promotion : ${promo}`;
  }, [item]);

  // ✅ Image par défaut si pas de photo
  const avatarSource = useMemo(() => {
    if (item?.photoUri && item.photoUri.trim().length > 0) {
      return { uri: item.photoUri };
    }
    return null;
  }, [item?.photoUri]);

  const initials = useMemo(() => {
    const n = (item?.nom ?? "").trim();
    const p = (item?.prenom ?? "").trim();
    const a = n ? n[0].toUpperCase() : "";
    const b = p ? p[0].toUpperCase() : "";
    return (a + b) || "LK";
  }, [item]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        if (!id) return;

        const data = await getLaureatById(id);
        if (!data) throw new Error("Impossible de charger les détails.");

        setItem(data);
      } catch (e: any) {
        console.error("❌ Erreur chargement détails:", e);
        setItem(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const goBack = () => router.back();

  const goMap = () => {
    if (!item?.latitude || !item?.longitude) return;
    setShowMapModal(true);
  };

  const handleMapClose = () => {
    setShowMapModal(false);
  };


  return (
    <View style={styles.screen}>
      {/* ✅ Header SIMPLE (pas de bleu) : retour + titre */}
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={20} color={COLOR_BLACK} />
        </Pressable>

        <Text style={styles.headerTitle} numberOfLines={1}>
          Détails
        </Text>

        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : !item ? (
        <View style={{ padding: 16 }}>
          <Text style={{ fontWeight: "800" }}>Lauréat introuvable</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator
        >
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            {avatarSource ? (
              <Image source={avatarSource} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
          </View>

          {/* Nom + sous-titre */}
          <View style={styles.centerBlock}>
            <Text style={styles.name}>{fullName || "—"}</Text>
            <Text style={styles.subTitle}>{subtitle}</Text>
          </View>

          {/* ✅ Fiche infos (UNE seule fois, pas de duplication) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>À propos</Text>

            <InfoRow icon="mail-outline" value={item.email || "—"} />
            <InfoRow icon="call-outline" value={item.telephone || "—"} />
            <InfoRow icon="business-outline" value={item.organisme || "—"} />
            <InfoRow icon="briefcase-outline" value={item.secteur || "—"} />
            <InfoRow icon="location-outline" value={item.province || "—"} />
            <InfoRow
              icon="information-circle-outline"
              value={item.description || "—"}
            />
          </View>

          {/* ✅ En dessous de la fiche : Voir sur carte */}
          <View style={{ marginTop: 12, paddingHorizontal: 16 }}>
            <Pressable
              onPress={goMap}
              disabled={!item.latitude || !item.longitude}
              style={[
                styles.mapBtn,
                (!item.latitude || !item.longitude) && { opacity: 0.45 },
              ]}
            >
              <Ionicons name="location" size={18} color={COLOR_WHITE} />
              <Text style={styles.mapBtnText}>Voir sur la carte</Text>
            </Pressable>

            {!item.latitude || !item.longitude ? (
              <Text style={styles.mapHint}>
                Position non disponible (latitude/longitude manquantes).
              </Text>
            ) : null}
          </View>
        </ScrollView>
      )}

      {/* Modal pour afficher la carte */}
      {item?.latitude && item?.longitude && (
        <LocationMapModal
          visible={showMapModal}
          onClose={handleMapClose}
          onSelect={(coords) => {
            // Mode lecture seule, on ne fait rien sur sélection
            handleMapClose();
          }}
          initialCoordinates={[item.latitude, item.longitude]}
          zoomLevel={15}
        />
      )}
    </View>
  );
}

/** ✅ Ligne info (icône + valeur) */
function InfoRow({ icon, value }: { icon: any; value: string }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={18} color={COLOR_PRIMARY} />
      <Text style={styles.rowText} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLOR_BG },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  // ✅ Header sans bleu
  header: {
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLOR_BG,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLOR_WHITE,
    borderWidth: 1,
    borderColor: "rgba(142,156,120,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLOR_BLACK,
    maxWidth: 180,
  },

  avatarWrap: {
    alignSelf: "center",
    marginTop: 10,
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: COLOR_WHITE,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  avatarImg: { width: 86, height: 86, borderRadius: 43 },
  avatarFallback: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: COLOR_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: { color: COLOR_WHITE, fontWeight: "900", fontSize: 24 },

  centerBlock: { alignItems: "center", paddingHorizontal: 16, marginTop: 10 },
  name: { fontSize: 20, fontWeight: "900", color: COLOR_BLACK },
  subTitle: {
    marginTop: 6,
    color: COLOR_MUTED,
    fontSize: 12,
    textAlign: "center",
  },

  card: {
    marginTop: 14,
    marginHorizontal: 16,
    backgroundColor: COLOR_WHITE,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(142,156,120,0.35)",
  },
  cardTitle: { fontWeight: "900", marginBottom: 10, color: COLOR_BLACK },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  rowText: { flex: 1, color: COLOR_BLACK, fontSize: 13, lineHeight: 18 },

  // ✅ Voir sur carte (en dessous de la fiche)
  mapBtn: {
    height: 48,
    borderRadius: 16,
    backgroundColor: COLOR_PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  mapBtnText: { color: COLOR_WHITE, fontWeight: "900", fontSize: 14 },
  mapHint: {
    marginTop: 8,
    color: COLOR_MUTED,
    fontSize: 12,
    textAlign: "center",
  },
});
