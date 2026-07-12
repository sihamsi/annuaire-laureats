import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { getValidatedMapPoints } from "../services/laureats.api";

export default function LaureatsMap({
  items,
  onSelect,
}: {
  items: any[];
  onSelect: (l: any) => void;
}) {
  const [points, setPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const data = await getValidatedMapPoints();
        setPoints(Array.isArray(data) ? data : []);
      } catch (e) {
        // on ignore ici (pas bloquant)
        setPoints([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // ✅ fallback simple Expo Go : affiche des "points" comme mini-carte
  return (
    <View style={{ borderWidth: 1, borderRadius: 14, padding: 10 }}>
      <Text style={{ fontWeight: "900", marginBottom: 6 }}>
        (Map placeholder) {points.length} lauréats
      </Text>

      {loading && <ActivityIndicator />}

      {points.slice(0, 6).map((p) => (
        <Pressable
          key={String(p.id)}
          onPress={() => onSelect(p)}
          style={{ paddingVertical: 6, borderTopWidth: 1 }}
        >
          <Text style={{ fontWeight: "800" }}>
            📍 {p.nom} {p.prenom}
          </Text>
          <Text style={{ opacity: 0.75 }}>
            {p.province ?? "—"} • {p.promotion ?? "—"} • {p.filiere ?? "—"}
          </Text>
          <Text style={{ opacity: 0.6 }}>
            lat: {p.latitude} / lon: {p.longitude}
          </Text>
        </Pressable>
      ))}

      <Text style={{ marginTop: 8, opacity: 0.6, fontSize: 12 }}>
        Carte réelle activable via Development Build (react-native-maps).
      </Text>
    </View>
  );
}
