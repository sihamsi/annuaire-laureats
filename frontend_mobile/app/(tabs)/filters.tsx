import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import Header from "../../components/Header";
import { Colors, Spacing, BorderRadius, Shadows, Typography } from "../../constants/theme";
import { getAllFiltres } from "../../services/filtres.api";
import { getOrganismes } from "../../services/organismes.api";
import { useFilters } from "../../contexts/FiltersContext";
import { mapFiliere, normSecteur, normGenre } from "../../utils/helpers";
import { Ionicons } from "@expo/vector-icons";

// Organismes marocains avec classification par secteur (basés sur inscription.tsx)
const organismesMaroc = {
  public: [
    { nom: "Office National des Chemins de Fer (ONCF)" },
    { nom: "Office National de l'Électricité et de l'Eau Potable (ONEE)" },
    { nom: "Autoroutes du Maroc (ADM)" },
    { nom: "Office Chérifien des Phosphates (OCP)" },
    { nom: "Caisse de Dépôt et de Gestion (CDG)" },
    { nom: "Royal Air Maroc (RAM)" },
  ],
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

// Liste des filières (comme dans FiliereSelection)
const filieresList = [
  { id: 1, nom: "Génie Civil", code: "GC" },
  { id: 2, nom: "Génie Électrique", code: "GE" },
  { id: 3, nom: "Génie Informatique", code: "GI" },
  { id: 4, nom: "Génie Logistique et Transports", code: "GLT" },
  { id: 5, nom: "Ingénierie Hydraulique et Environnement", code: "IHE" },
  { id: 6, nom: "Sciences de l'Information Géographique", code: "SIG" },
  { id: 10, nom: "Météorologie", code: "MET" },
];

// Composant de sélection avec modal
function FilterSelectField({ 
  title, 
  value, 
  placeholder, 
  onPress, 
  options = [],
  onSelect,
  selectedValue 
}: any) {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>{title}</Text>
      <TouchableOpacity 
        style={styles.selectButton}
        onPress={onPress}
      >
        <Text style={value ? styles.selectedText : styles.placeholderText}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={Colors.secondary} />
      </TouchableOpacity>
    </View>
  );
}

// Composant Promotion avec saisie personnalisée
function PromotionFilter({ options, selected, onSelect }: any) {
  const [customYear, setCustomYear] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    // Si la valeur sélectionnée n'est pas dans les options, c'est une valeur personnalisée
    if (selected && !options.includes(selected)) {
      setCustomYear(selected);
      setShowCustomInput(true);
    } else {
      setCustomYear("");
      setShowCustomInput(false);
    }
  }, [selected, options]);

  const handleCustomYearChange = (text: string) => {
    // Ne permettre que les chiffres et limiter à 4 caractères (année)
    const numericText = text.replace(/[^0-9]/g, '').slice(0, 4);
    setCustomYear(numericText);
    if (numericText.length === 4) {
      onSelect(numericText);
    } else if (numericText.length === 0) {
      onSelect("");
    }
  };

  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>Promotion</Text>
      <View style={styles.optionsContainer}>
        {options.map((option: string) => {
          const isSelected = selected === option && !showCustomInput;
          return (
            <Pressable
              key={option}
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonSelected,
              ]}
              onPress={() => {
                onSelect(option);
                setShowCustomInput(false);
                setCustomYear("");
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
      
      {/* Champ de saisie personnalisée */}
      <View style={styles.customInputContainer}>
        <Text style={styles.customInputLabel}>Ou saisir une autre date :</Text>
        <TextInput
          style={[
            styles.customInput,
            showCustomInput && styles.customInputActive
          ]}
          placeholder="Ex: 2019"
          value={customYear}
          onChangeText={handleCustomYearChange}
          keyboardType="numeric"
          maxLength={4}
          onFocus={() => {
            if (selected && options.includes(selected)) {
              onSelect("");
            }
            setShowCustomInput(true);
          }}
        />
      </View>
    </View>
  );
}

// Filter Section Component (pour Genre, Secteur - garde le système actuel)
function FilterSection({ title, options, selected, onSelect }: any) {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option: string) => {
          const isSelected = selected === option;
          return (
            <Pressable
              key={option}
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonSelected,
              ]}
              onPress={() => onSelect(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function FiltersScreen() {
  const router = useRouter();
  const { filters, setFilters, resetFilters } = useFilters();
  const [localFilters, setLocalFilters] = useState<any>(filters);
  const [promotions, setPromotions] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>(['Homme', 'Femme']);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [provinceMap, setProvinceMap] = useState<Map<string, string>>(new Map()); // Map: nom nettoyé -> nom original
  
  // Modals
  const [showFiliereModal, setShowFiliereModal] = useState(false);
  const [showOrganismeModal, setShowOrganismeModal] = useState(false);
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [selectedSecteur, setSelectedSecteur] = useState<string>("");
  const [customOrganisme, setCustomOrganisme] = useState<string>("");

  useEffect(() => {
    loadFilters();
  }, []);

  // ✅ Synchroniser les filtres locaux avec les filtres globaux
  useEffect(() => {
    setLocalFilters(filters);
    // Déterminer le secteur sélectionné pour les organismes
    if (filters.secteur) {
      const secteurNorm = filters.secteur === 'public' ? 'Public' : filters.secteur === 'prive' ? 'Privé' : filters.secteur;
      setSelectedSecteur(secteurNorm);
    } else {
      setSelectedSecteur("");
    }
  }, [filters]);

  // Fonction pour nettoyer les noms de provinces
  const cleanProvinceName = (province: string): string => {
    if (!province) return "";
    // Retirer le préfixe "Province " si présent
    let cleaned = province.replace(/^Province\s+/i, '').trim();
    // Retirer le préfixe "de " si présent
    cleaned = cleaned.replace(/^de\s+/i, '').trim();
    return cleaned;
  };

  // Fonction pour vérifier si c'est une préfecture
  const isPrefecture = (province: string): boolean => {
    if (!province) return false;
    const lower = province.toLowerCase();
    // Détecter les préfectures (contiennent "Préfecture" ou sont des préfectures connues)
    return lower.includes("préfecture") || 
           lower.includes("prefecture") ||
           lower.includes("préf.") ||
           lower.includes("pref.");
  };

  const loadFilters = async () => {
    try {
      const data = await getAllFiltres();
      if (data.promotions) setPromotions(data.promotions);
      if (data.provinces) {
        // Filtrer les préfectures et nettoyer les noms
        const map = new Map<string, string>();
        const seenCleaned = new Set<string>(); // Pour éviter les doublons après nettoyage
        const cleanedProvinces = data.provinces
          .filter((p: string) => !isPrefecture(p)) // Exclure les préfectures
          .map((p: string) => {
            const cleaned = cleanProvinceName(p);
            if (cleaned.length > 0 && !seenCleaned.has(cleaned)) {
              // Créer une correspondance entre le nom nettoyé et le nom original
              // Si plusieurs provinces se nettoient en la même valeur, garder seulement la première
              seenCleaned.add(cleaned);
              map.set(cleaned, p);
              return cleaned;
            }
            return null;
          })
          .filter((p: string | null): p is string => p !== null); // Retirer les null
        setProvinces(cleanedProvinces);
        setProvinceMap(map);
      }
    } catch (error) {
      console.error("Erreur chargement filtres:", error);
    }
  };

  const handleSelect = (type: string, value: string) => {
    setLocalFilters((prev: any) => {
      if (prev[type] === value) {
        const newFilters = { ...prev };
        delete newFilters[type];
        return newFilters;
      }
      return { ...prev, [type]: value };
    });
  };

  const handleFiliereSelect = (filiere: any) => {
    handleSelect('filiere', filiere.nom);
    setShowFiliereModal(false);
  };

  const handleSecteurSelect = (value: string) => {
    const normalized = normSecteur(value === 'Public' ? 'public' : value === 'Privé' ? 'prive' : value);
    handleSelect('secteur', normalized);
    setSelectedSecteur(value);
    // Réinitialiser l'organisme si le secteur change
    if (localFilters.organisme) {
      handleSelect('organisme', '');
    }
  };

  const handleOrganismeSelect = (organisme: string) => {
    handleSelect('organisme', organisme);
    setCustomOrganisme("");
    setShowOrganismeModal(false);
  };

  const handleCustomOrganismeChange = (text: string) => {
    setCustomOrganisme(text);
    if (text.trim().length > 0) {
      handleSelect('organisme', text.trim());
    } else {
      handleSelect('organisme', '');
    }
  };

  const handleProvinceSelect = (cleanedProvince: string) => {
    // Utiliser le nom original pour le filtrage (ou le nom nettoyé si pas de correspondance)
    const originalProvince = provinceMap.get(cleanedProvince) || cleanedProvince;
    handleSelect('province', originalProvince);
    setShowProvinceModal(false);
  };

  const handleApply = () => {
    // ✅ Normaliser les filtres avant de les appliquer
    const normalizedFilters: any = {};
    
    if (localFilters.filiere) {
      normalizedFilters.filiere = localFilters.filiere;
    }
    
    if (localFilters.promotion) {
      normalizedFilters.promotion = String(localFilters.promotion);
    }
    
    if (localFilters.secteur) {
      normalizedFilters.secteur = localFilters.secteur;
    }
    
    if (localFilters.organisme) {
      normalizedFilters.organisme = localFilters.organisme;
    }
    
    if (localFilters.genre) {
      normalizedFilters.genre = normGenre(localFilters.genre === 'Homme' ? 'm' : localFilters.genre === 'Femme' ? 'f' : localFilters.genre);
    }
    
    if (localFilters.province) {
      normalizedFilters.province = localFilters.province;
    }
    
    // Appliquer les filtres normalisés
    setFilters(normalizedFilters);
    
    // ✅ Navigation vers la carte pour afficher les résultats des filtres
    router.push("/(tabs)/map");
  };

  const handleReset = () => {
    setLocalFilters({});
    resetFilters();
    setSelectedSecteur("");
    router.push("/(tabs)/map");
  };

  // Obtenir les organismes selon le secteur sélectionné
  const getOrganismesForSecteur = () => {
    if (selectedSecteur === "Public") {
      return organismesMaroc.public.map(org => org.nom);
    } else if (selectedSecteur === "Privé") {
      return organismesMaroc.privé.map(org => org.nom);
    }
    return [];
  };

  return (
    <View style={styles.container}>
      <Header title="Filtres" />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filière - Modal */}
        <FilterSelectField
          title="Filière"
          value={localFilters.filiere}
          placeholder="Sélectionnez une filière"
          onPress={() => setShowFiliereModal(true)}
        />

        {/* Promotion - Avec saisie personnalisée */}
        <PromotionFilter
          options={promotions.length > 0 ? promotions : ['2024', '2023', '2022', '2021', '2020']}
          selected={localFilters.promotion}
          onSelect={(value: string) => handleSelect('promotion', value)}
        />

        {/* Secteur - Garde le système actuel */}
        <FilterSection
          title="Secteur"
          options={['Public', 'Privé']}
          selected={localFilters.secteur ? (localFilters.secteur === 'public' ? 'Public' : localFilters.secteur === 'prive' ? 'Privé' : localFilters.secteur) : undefined}
          onSelect={handleSecteurSelect}
        />

        {/* Organisme - Modal (affiché seulement si secteur sélectionné) */}
        {selectedSecteur && (
          <FilterSelectField
            title="Organisme"
            value={localFilters.organisme}
            placeholder="Sélectionnez un organisme"
            onPress={() => setShowOrganismeModal(true)}
          />
        )}

        {/* Genre - Garde le système actuel */}
        <FilterSection
          title="Genre"
          options={genres}
          selected={localFilters.genre ? (localFilters.genre === 'm' ? 'Homme' : localFilters.genre === 'f' ? 'Femme' : localFilters.genre) : undefined}
          onSelect={(value: string) => {
            const normalized = normGenre(value === 'Homme' ? 'm' : value === 'Femme' ? 'f' : value);
            handleSelect('genre', normalized);
          }}
        />

        {/* Province - Modal */}
        <FilterSelectField
          title="Province"
          value={localFilters.province ? cleanProvinceName(localFilters.province) : undefined}
          placeholder="Sélectionnez une province"
          onPress={() => setShowProvinceModal(true)}
        />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <Pressable style={styles.resetButton} onPress={handleReset}>
            <Ionicons name="refresh-outline" size={20} color={Colors.gray700} />
            <Text style={styles.resetButtonText}>Réinitialiser</Text>
          </Pressable>
          <Pressable style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Appliquer</Text>
          </Pressable>
        </View>
      </View>

      {/* Modal Filière */}
      <Modal
        visible={showFiliereModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFiliereModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionnez une filière</Text>
              <TouchableOpacity onPress={() => setShowFiliereModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {filieresList.map((filiere) => (
                <TouchableOpacity
                  key={filiere.id}
                  style={[
                    styles.modalOptionItem,
                    localFilters.filiere === filiere.nom && styles.modalOptionItemSelected
                  ]}
                  onPress={() => handleFiliereSelect(filiere)}
                >
                  <Text style={[
                    styles.modalOptionText,
                    localFilters.filiere === filiere.nom && styles.modalOptionTextSelected
                  ]}>
                    {filiere.nom}
                  </Text>
                  {localFilters.filiere === filiere.nom && (
                    <Ionicons name="checkmark" size={20} color={Colors.secondary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
              <Text style={styles.modalTitle}>Sélectionnez un organisme ({selectedSecteur})</Text>
              <TouchableOpacity onPress={() => setShowOrganismeModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {getOrganismesForSecteur().map((organisme) => {
                const isSelected = localFilters.organisme === organisme && !customOrganisme;
                return (
                  <TouchableOpacity
                    key={organisme}
                    style={[
                      styles.modalOptionItem,
                      isSelected && styles.modalOptionItemSelected
                    ]}
                    onPress={() => handleOrganismeSelect(organisme)}
                  >
                    <Text style={[
                      styles.modalOptionText,
                      isSelected && styles.modalOptionTextSelected
                    ]}>
                      {organisme}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={Colors.secondary} />
                    )}
                  </TouchableOpacity>
                );
              })}
              
              {/* Champ de saisie pour organisme personnalisé */}
              <View style={styles.customInputContainer}>
                <Text style={styles.customInputLabel}>Ou saisir un autre organisme :</Text>
                <TextInput
                  style={[
                    styles.customInput,
                    customOrganisme && styles.customInputActive
                  ]}
                  placeholder="Ex: Nom de l'organisme"
                  value={customOrganisme}
                  onChangeText={handleCustomOrganismeChange}
                  onFocus={() => {
                    // Désélectionner l'organisme de la liste si un est sélectionné
                    if (localFilters.organisme && getOrganismesForSecteur().includes(localFilters.organisme)) {
                      handleSelect('organisme', '');
                    }
                  }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Province */}
      <Modal
        visible={showProvinceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProvinceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionnez une province</Text>
              <TouchableOpacity onPress={() => setShowProvinceModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {provinces.length > 0 ? provinces.map((province, index) => {
                // Les provinces sont déjà nettoyées lors du chargement
                // Utiliser le nom original comme clé pour garantir l'unicité
                const originalProvince = provinceMap.get(province) || province;
                const isSelected = localFilters.province === originalProvince || localFilters.province === province;
                return (
                  <TouchableOpacity
                    key={`province-${originalProvince}-${index}`}
                    style={[
                      styles.modalOptionItem,
                      isSelected && styles.modalOptionItemSelected
                    ]}
                    onPress={() => handleProvinceSelect(province)}
                  >
                    <Text style={[
                      styles.modalOptionText,
                      isSelected && styles.modalOptionTextSelected
                    ]}>
                      {province}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={Colors.secondary} />
                    )}
                  </TouchableOpacity>
                );
              }) : (
                <Text style={styles.modalEmptyText}>Aucune province disponible</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  filterSection: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  filterSectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.gray800,
    marginBottom: Spacing.md,
  },
  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  selectedText: {
    color: Colors.gray800,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  placeholderText: {
    color: Colors.gray500,
    fontSize: Typography.fontSize.base,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.md,
  },
  optionButtonSelected: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.infoBg,
  },
  optionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray700,
  },
  optionTextSelected: {
    color: Colors.secondary,
    fontWeight: Typography.fontWeight.semibold,
  },
  customInputContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  customInputLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray700,
    marginBottom: Spacing.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  customInput: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.gray800,
  },
  customInputActive: {
    borderColor: Colors.secondary,
    borderWidth: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.gray300,
    backgroundColor: Colors.white,
  },
  resetButtonText: {
    color: Colors.gray700,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  applyButton: {
    flex: 1,
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  applyButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.gray800,
  },
  modalList: {
    padding: Spacing.sm,
  },
  modalOptionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginVertical: 4,
  },
  modalOptionItemSelected: {
    backgroundColor: Colors.infoBg,
  },
  modalOptionText: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray800,
  },
  modalOptionTextSelected: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.secondary,
  },
  modalEmptyText: {
    textAlign: "center",
    color: Colors.gray500,
    padding: Spacing.xl,
    fontSize: Typography.fontSize.base,
  },
});
