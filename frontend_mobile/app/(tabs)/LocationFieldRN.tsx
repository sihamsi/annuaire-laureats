import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import LocationMapModal from "../../components/LocationMapModal"; // adapte le chemin

interface LocationFieldProps {
  value: string;                        // "lat,lng" dans ton formulaire
  onChange: (value: string) => void;    // setValue
  coordinates?: [number, number] | null;
}

const LocationFieldRN: React.FC<LocationFieldProps> = ({
  value,
  onChange,
  coordinates,
}) => {
  const [openLocationPicker, setOpenLocationPicker] = useState(false);
  const [currentLocation, setCurrentLocation] =
    useState<[number, number] | null>(null);
  const [lastProvinceCoords, setLastProvinceCoords] =
    useState<[number, number] | null>(null);

  // Synchroniser currentLocation avec value ("lat,lng")
  useEffect(() => {
    if (value) {
      const [lat, lng] = value.split(",").map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        setCurrentLocation([lat, lng]);
      }
    }
  }, [value]);

  // Mettre à jour quand coordinates change (comme Ionic)
  useEffect(() => {
    if (coordinates && !isEqual(coordinates, lastProvinceCoords)) {
      setCurrentLocation(coordinates);
      setLastProvinceCoords(coordinates);
      onChange(`${coordinates[0]},${coordinates[1]}`);
    }
  }, [coordinates]);

  const handleLocationSelect = (coords: [number, number]) => {
    setCurrentLocation(coords);
    onChange(`${coords[0]},${coords[1]}`);
    setOpenLocationPicker(false);
  };

  const formatLocationDisplay = (location: [number, number]) =>
    `Lat: ${location[0].toFixed(6)}, Lng: ${location[1].toFixed(6)}`;

  function isEqual(
    coords1: [number, number] | null,
    coords2: [number, number] | null
  ): boolean {
    if (!coords1 || !coords2) return false;
    return coords1[0] === coords2[0] && coords1[1] === coords2[1];
  }

  const displayText =
    currentLocation ? formatLocationDisplay(currentLocation) : "Choisir une localisation";

  return (
    <View>
      {/* Champ "Localisation" cliquable */}
      <TouchableOpacity
        style={styles.fieldContainer}
        onPress={() => setOpenLocationPicker(true)}
      >
        <MaterialIcons name="place" size={18} color="#1d4ed8" />
        <Text style={styles.label}>Localisation</Text>
        <Text style={styles.value} numberOfLines={1}>
          {displayText}
        </Text>
      </TouchableOpacity>

      {/* Modal Carte */}
      <LocationMapModal
        visible={openLocationPicker}
        onClose={() => setOpenLocationPicker(false)}
        onSelect={handleLocationSelect}
        initialCoordinates={currentLocation || undefined}
        zoomLevel={10}
      />
    </View>
  );
};

export default LocationFieldRN;

const styles = StyleSheet.create({
  fieldContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "column",
    gap: 4,
    elevation: 1,
  },
  label: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#1f2937",
    marginTop: 2,
  },
  value: {
    fontWeight: "500",
    fontSize: 13,
    color: "#111827",
    marginTop: 4,
  },
});
