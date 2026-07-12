import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Filiere = {
  id: number;
  nom: string;
  code?: string; // Code pour le backend (SIG, GI, etc.)
};

type FiliereSelectionProps = {
  selectedFiliere: Filiere | null;
  setSelectedFiliere: React.Dispatch<React.SetStateAction<Filiere | null>>;
  onFiliereChange?: (filiere: Filiere) => void;
  disabled?: boolean;
};

const COLOR_BLACK = "#000000";
const COLOR_MUTED = "#929292";

const FiliereSelection: React.FC<FiliereSelectionProps> = ({
  selectedFiliere,
  setSelectedFiliere,
  onFiliereChange,
  disabled = false,
}) => {
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchFilieres = async () => {
      try {
        // Liste des filières avec codes backend
        setFilieres([
          { id: 1, nom: "Génie Civil", code: "GC" },
          { id: 2, nom: "Génie Électrique", code: "GE" },
          { id: 3, nom: "Génie Informatique", code: "GI" },
          { id: 4, nom: "Génie Logistique et Transports", code: "GLT" },
          { id: 5, nom: "Ingénierie Hydraulique et Environnement", code: "IHE" },
          { id: 6, nom: "Sciences de l'Information Géographique", code: "SIG" },
          { id: 10, nom: "Météorologie", code: "MET" },
          { id: 99, nom: "Autre", code: null },
        ]);
      } catch (error) {
        console.error("Erreur lors de la récupération des filières :", error);
      }
    };

    fetchFilieres();
  }, []);

  const handleSelect = (filiere: Filiere) => {
    setSelectedFiliere(filiere);
    if (onFiliereChange) {
      onFiliereChange(filiere);
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        Filière <Text style={styles.required}>*</Text>
      </Text>
      
      {/* Bouton de sélection */}
      <TouchableOpacity 
        style={[styles.selectButton, disabled && styles.selectButtonDisabled]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <Text style={[selectedFiliere ? styles.selectedText : styles.placeholderText, disabled && styles.disabledText]}>
          {selectedFiliere ? selectedFiliere.nom : "Sélectionnez une filière"}
        </Text>
        <Ionicons name="chevron-down" size={20} color={disabled ? "#CCCCCC" : "#8E9C78"} />
      </TouchableOpacity>

      {/* Modal de sélection */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionnez une filière</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.optionsList}>
              {filieres.map((filiere) => (
                <TouchableOpacity
                  key={filiere.id}
                  style={[
                    styles.optionItem,
                    selectedFiliere?.id === filiere.id && styles.optionItemSelected
                  ]}
                  onPress={() => handleSelect(filiere)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedFiliere?.id === filiere.id && styles.optionTextSelected
                  ]}>
                    {filiere.nom}
                  </Text>
                  {selectedFiliere?.id === filiere.id && (
                    <Ionicons name="checkmark" size={20} color="#8E9C78" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
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
    color: "#D32F2F",
  },
  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  selectButtonDisabled: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E0E0E0",
    opacity: 0.6,
  },
  disabledText: {
    color: "#999999",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#DFECC6",
  },
  optionText: {
    fontSize: 16,
    color: COLOR_BLACK,
  },
  optionTextSelected: {
    fontWeight: "700",
    color: "#8E9C78",
  },
});

export default FiliereSelection;
