import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type PromotionSelectionProps = {
  selectedPromotion: string;
  setSelectedPromotion: (value: string) => void;
  onPromotionChange?: (value: string) => void;
  disabled?: boolean;
};

const PromotionSelection: React.FC<PromotionSelectionProps> = ({
  selectedPromotion,
  setSelectedPromotion,
  onPromotionChange,
  disabled = false,
}) => {
  const [promotions] = useState<string[]>([
      "2025",
      "2024",
      "2023",
      "2022",
      "2021",
      "2020",
      "2019",
      "2018",
      "2017",
      "2016",
      "2015",
      "2014",
      "2013",
      "2012",
      "2011",
      "2010",
      "Autre...",
    ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [autrePromotion, setAutrePromotion] = useState("");
  const [showAutreInput, setShowAutreInput] = useState(false);
  const [promotionError, setPromotionError] = useState<string>("");

  // Si "Autre..." est sélectionné depuis la liste, afficher le champ de saisie
  // Ne pas utiliser useEffect pour éviter de fermer le champ pendant la saisie

  const handleSelect = (value: string) => {
    if (value === "Autre...") {
      setSelectedPromotion("Autre...");
      setShowAutreInput(true);
      setPromotionError("");
      setModalVisible(false);
    } else {
      setSelectedPromotion(value);
      setShowAutreInput(false);
      setAutrePromotion("");
      setPromotionError("");
      if (onPromotionChange) {
        onPromotionChange(value);
      }
      setModalVisible(false);
    }
  };

  const handleAutreChange = (value: string) => {
    // Permettre la saisie libre - ne pas bloquer pendant la frappe
    setAutrePromotion(value);
    setPromotionError("");
    
      const trimmedValue = value.trim();
      
    // Si le champ est vide, garder "Autre..." comme sélection
    if (!trimmedValue) {
        setSelectedPromotion("Autre...");
        if (onPromotionChange) {
          onPromotionChange("Autre...");
        }
      return;
    }
    
    // Mettre à jour selectedPromotion avec la valeur saisie (même si incomplète)
    // Cela permet de garder la valeur et de ne pas fermer le champ
    setSelectedPromotion(trimmedValue);
    
    // Validation seulement quand l'utilisateur a tapé au moins 4 caractères
    if (trimmedValue.length >= 4) {
      const year = parseInt(trimmedValue, 10);
      
      if (isNaN(year)) {
        // Pas un nombre valide
        setPromotionError("Veuillez entrer une année valide");
      } else if (year >= 2010 && year <= 2025) {
        // Année déjà dans la liste de base
        setPromotionError("Veuillez sélectionner cette année dans la liste ci-dessus");
      } else {
        // Année valide - utiliser la valeur saisie
        setPromotionError("");
        if (onPromotionChange) {
          onPromotionChange(trimmedValue);
        }
      }
    } else {
      // Pendant la saisie (moins de 4 caractères), pas d'erreur
      // Mettre à jour la valeur mais ne pas appeler onPromotionChange
    }
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        Promotion <Text style={styles.required}>*</Text>
      </Text>
      
      {/* Bouton de sélection ou champ de saisie */}
      {showAutreInput ? (
        <View>
          <TextInput
            style={[
              styles.input,
              promotionError ? styles.inputError : null
            ]}
            placeholder="Entrez votre promotion (autres années)"
            value={autrePromotion}
            onChangeText={handleAutreChange}
            keyboardType="numeric"
          />
          {promotionError ? (
            <Text style={styles.errorText}>{promotionError}</Text>
          ) : null}
          <TouchableOpacity 
            style={styles.changeButton}
            onPress={() => {
              setShowAutreInput(false);
              setSelectedPromotion("");
              setAutrePromotion("");
              setPromotionError("");
              if (onPromotionChange) {
                onPromotionChange("");
              }
            }}
          >
            <Text style={styles.changeButtonText}>Changer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={[styles.selectButton, disabled && styles.selectButtonDisabled]}
          onPress={() => !disabled && setModalVisible(true)}
          disabled={disabled}
        >
          <Text style={[selectedPromotion ? styles.selectedText : styles.placeholderText, disabled && styles.disabledText]}>
            {selectedPromotion || "Sélectionnez une promotion"}
          </Text>
          <Ionicons name="chevron-down" size={20} color={disabled ? "#CCCCCC" : "#8E9C78"} />
        </TouchableOpacity>
      )}

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
              <Text style={styles.modalTitle}>Sélectionnez une promotion</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.optionsList}>
              {promotions.map((promo) => (
                <TouchableOpacity
                  key={promo}
                  style={[
                    styles.optionItem,
                    selectedPromotion === promo && styles.optionItemSelected
                  ]}
                  onPress={() => handleSelect(promo)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedPromotion === promo && styles.optionTextSelected
                  ]}>
                    {promo}
                  </Text>
                  {selectedPromotion === promo && (
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
    color: "#000000",
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
    color: "#929292",
    fontSize: 14,
  },
  selectedText: {
    color: "#000000",
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
    color: "#000000",
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
    color: "#000000",
  },
  optionTextSelected: {
    fontWeight: "700",
    color: "#8E9C78",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 14,
    color: "#000000",
  },
  changeButton: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  changeButtonText: {
    color: "#8E9C78",
    fontSize: 14,
    fontWeight: "600",
  },
  inputError: {
    borderColor: "#D32F2F",
    borderWidth: 1,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default PromotionSelection;
