import React, { useState, useCallback, memo } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Palette
// Couleurs alignées avec le thème web
const COLOR_BG = "#F5F5F0"; // --color-background
const COLOR_PRIMARY = "#6B7F5C"; // --color-primary
const COLOR_MUTED = "#666666"; // --color-text-secondary
const COLOR_WHITE = "#FFFFFF"; // --color-background-white
const COLOR_BLACK = "#2C2C2C"; // --color-text-primary

type Props = {
  visible: boolean;
  onClose: () => void;
  initial: any;
  onApply: (filters: any) => void;
  onReset: () => void;
  filieres?: string[];
  promotions?: string[];
  secteurs?: string[];
  provinces?: string[];
};

const GENRES = [
  { code: "m", label: "Masculin" },
  { code: "f", label: "Féminin" },
];

export default function FilterModal({ 
  visible, 
  onClose, 
  initial, 
  onApply, 
  onReset,
  filieres = [],
  promotions = [],
  secteurs = [],
  provinces = []
}: Props) {
  const [filiere, setFiliere] = useState<string>(initial?.filiere ?? "");
  const [promotion, setPromotion] = useState<string>(initial?.promotion ?? "");
  const [secteur, setSecteur] = useState<string>(initial?.secteur ?? "");
  const [genre, setGenre] = useState<string>(initial?.genre ?? "");
  const [organisme, setOrganisme] = useState<string>(initial?.organisme ?? "");
  const [province, setProvince] = useState<string>(initial?.province ?? "");

  // Modals pour les sélections
  const [showFiliereModal, setShowFiliereModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [showSecteurModal, setShowSecteurModal] = useState(false);
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [showOrganismeModal, setShowOrganismeModal] = useState(false);
  const [showProvinceModal, setShowProvinceModal] = useState(false);

  console.log("🎯 FilterModal visible:", visible);
  console.log("🎯 Modals state:", {
    filiere: showFiliereModal,
    promotion: showPromotionModal,
    secteur: showSecteurModal,
    genre: showGenreModal,
    organisme: showOrganismeModal,
    province: showProvinceModal,
  });

  const handleApply = useCallback(() => {
    const f: any = {};
    if (filiere) f.filiere = filiere;
    if (promotion) f.promotion = promotion;
    if (secteur) f.secteur = secteur;
    if (genre) f.genre = genre;
    if (organisme) f.organisme = organisme;
    if (province) f.province = province;

    onApply(f);
    onClose();
  }, [filiere, promotion, secteur, genre, organisme, province, onApply, onClose]);

  const handleReset = useCallback(() => {
    setFiliere("");
    setPromotion("");
    setSecteur("");
    setGenre("");
    setOrganisme("");
    setProvince("");
    onReset();
    onClose();
  }, [onReset, onClose]);

  const activeFiltersCount = [filiere, promotion, secteur, genre, organisme, province].filter(Boolean).length;

  // Si un modal de sélection est ouvert, on cache le modal principal
  const isAnySelectionModalOpen = showFiliereModal || showPromotionModal || showSecteurModal || 
                                   showGenreModal || showOrganismeModal || showProvinceModal;

  return (
    <>
      <Modal 
        visible={visible && !isAnySelectionModalOpen} 
        transparent 
        animationType="slide" 
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Ionicons name="funnel" size={20} color={COLOR_PRIMARY} />
                <Text style={styles.title}>Filtres</Text>
                {activeFiltersCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{activeFiltersCount}</Text>
                  </View>
                )}
              </View>

              <Pressable onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={COLOR_BLACK} />
              </Pressable>
            </View>

            {/* Filtres */}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📚 Informations académiques</Text>
                
                <FilterButton
                  label="Filière"
                  value={FILIERES.find((f) => f.code === filiere)?.label}
                  onPress={() => setShowFiliereModal(true)}
                  onClear={filiere ? () => setFiliere("") : undefined}
                />

                <FilterButton
                  label="Promotion"
                  value={promotion}
                  onPress={() => setShowPromotionModal(true)}
                  onClear={promotion ? () => setPromotion("") : undefined}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💼 Informations professionnelles</Text>
                
                <FilterButton
                  label="Secteur"
                  value={SECTEURS.find((s) => s.code === secteur)?.label}
                  onPress={() => setShowSecteurModal(true)}
                  onClear={secteur ? () => setSecteur("") : undefined}
                />

                <FilterButton
                  label="Organisme"
                  value={organisme}
                  onPress={() => setShowOrganismeModal(true)}
                  onClear={organisme ? () => setOrganisme("") : undefined}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📍 Informations géographiques</Text>
                
                <FilterButton
                  label="Province"
                  value={province}
                  onPress={() => setShowProvinceModal(true)}
                  onClear={province ? () => setProvince("") : undefined}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👤 Informations personnelles</Text>
                
                <FilterButton
                  label="Genre"
                  value={GENRES.find((g) => g.code === genre)?.label}
                  onPress={() => setShowGenreModal(true)}
                  onClear={genre ? () => setGenre("") : undefined}
                />
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              <Pressable onPress={handleReset} style={styles.resetButton}>
                <Ionicons name="refresh" size={18} color={COLOR_PRIMARY} />
                <Text style={styles.resetButtonText}>Réinitialiser</Text>
              </Pressable>

              <Pressable onPress={handleApply} style={styles.applyButton}>
                <Ionicons name="checkmark" size={18} color={COLOR_WHITE} />
                <Text style={styles.applyButtonText}>Appliquer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modals de sélection - Affichés uniquement si le modal principal est visible */}
      {visible && (
        <>
          <SelectionModal
            visible={showFiliereModal}
            title="Sélectionner une filière"
            items={filieres.map((f) => ({ value: f, label: f }))}
            selectedValue={filiere}
            onSelect={(value) => {
              console.log("✅ Filière sélectionnée:", value);
              setFiliere(value);
              setShowFiliereModal(false);
            }}
            onClose={() => {
              console.log("❌ Fermeture modal filière");
              setShowFiliereModal(false);
            }}
          />

          <SelectionModal
            visible={showPromotionModal}
            title="Sélectionner une promotion"
            items={promotions.map((p) => ({ value: p, label: p }))}
            selectedValue={promotion}
            onSelect={(value) => {
              setPromotion(value);
              setShowPromotionModal(false);
            }}
            onClose={() => setShowPromotionModal(false)}
          />

          <SelectionModal
            visible={showSecteurModal}
            title="Sélectionner un secteur"
            items={secteurs.map((s) => ({ 
              value: s === "public" ? "public" : s === "prive" ? "prive" : s, 
              label: s === "public" ? "Public" : s === "prive" ? "Privé" : s 
            }))}
            selectedValue={secteur}
            onSelect={(value) => {
              setSecteur(value);
              setShowSecteurModal(false);
            }}
            onClose={() => setShowSecteurModal(false)}
          />

          <SelectionModal
            visible={showGenreModal}
            title="Sélectionner un genre"
            items={GENRES.map((g) => ({ value: g.code, label: g.label }))}
            selectedValue={genre}
            onSelect={(value) => {
              setGenre(value);
              setShowGenreModal(false);
            }}
            onClose={() => setShowGenreModal(false)}
          />

          <SelectionModal
            visible={showOrganismeModal}
            title="Sélectionner un organisme"
            items={ORGANISMES.map((o) => ({ value: o, label: o }))}
            selectedValue={organisme}
            onSelect={(value) => {
              setOrganisme(value);
              setShowOrganismeModal(false);
            }}
            onClose={() => setShowOrganismeModal(false)}
          />

          <SelectionModal
            visible={showProvinceModal}
            title="Sélectionner une province"
            items={provinces.map((p) => ({ value: p, label: p }))}
            selectedValue={province}
            onSelect={(value) => {
              setProvince(value);
              setShowProvinceModal(false);
            }}
            onClose={() => setShowProvinceModal(false)}
          />
        </>
      )}
    </>
  );
}

// Composant bouton de filtre (optimisé avec memo)
const FilterButton = memo(({
  label,
  value,
  onPress,
  onClear,
}: {
  label: string;
  value?: string;
  onPress: () => void;
  onClear?: () => void;
}) => {
  const handlePress = useCallback(() => {
    console.log(`🔘 Clic sur filtre: ${label}`);
    onPress();
  }, [label, onPress]);

  return (
    <View style={styles.filterButton}>
      <TouchableOpacity style={styles.filterButtonMain} onPress={handlePress} activeOpacity={0.7}>
        <Text style={styles.filterLabel}>{label}</Text>
        <View style={styles.filterRight}>
          <Text style={value ? styles.filterValueActive : styles.filterValueEmpty}>
            {value || "Tous"}
          </Text>
          <Ionicons name="chevron-down" size={16} color={COLOR_MUTED} />
        </View>
      </TouchableOpacity>
      {onClear && (
        <TouchableOpacity style={styles.clearButton} onPress={onClear} activeOpacity={0.7}>
          <Ionicons name="close-circle" size={18} color={COLOR_MUTED} />
        </TouchableOpacity>
      )}
    </View>
  );
});

// Modal de sélection générique (optimisé)
const SelectionModal = memo(({
  visible,
  title,
  items,
  selectedValue,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  items: { value: string; label: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) => {
  console.log(`📋 SelectionModal "${title}" visible:`, visible, `(${items.length} items)`);

  const renderItem = useCallback(({ item }: { item: { value: string; label: string } }) => (
    <TouchableOpacity
      style={[
        styles.selectionItem,
        item.value === selectedValue && styles.selectionItemActive,
      ]}
      onPress={() => {
        console.log(`✅ Sélection: ${item.label} (${item.value})`);
        onSelect(item.value);
      }}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.selectionItemText,
          item.value === selectedValue && styles.selectionItemTextActive,
        ]}
      >
        {item.label}
      </Text>
      {item.value === selectedValue && (
        <Ionicons name="checkmark" size={20} color={COLOR_PRIMARY} />
      )}
    </TouchableOpacity>
  ), [selectedValue, onSelect]);

  const keyExtractor = useCallback((item: { value: string; label: string }) => item.value, []);

  const ItemSeparator = useCallback(() => <View style={styles.separator} />, []);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.selectionOverlay}>
        <View style={styles.selectionContainer}>
          <View style={styles.selectionHeader}>
            <Text style={styles.selectionTitle}>{title}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={COLOR_BLACK} />
            </Pressable>
          </View>

          <FlatList
            data={items}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={ItemSeparator}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
          />
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    backgroundColor: COLOR_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLOR_BLACK,
  },
  badge: {
    backgroundColor: COLOR_PRIMARY,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: COLOR_WHITE,
    fontSize: 12,
    fontWeight: "700",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLOR_WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLOR_BLACK,
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR_WHITE,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterButtonMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLOR_BLACK,
  },
  filterRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterValueEmpty: {
    fontSize: 13,
    color: COLOR_MUTED,
  },
  filterValueActive: {
    fontSize: 13,
    color: COLOR_PRIMARY,
    fontWeight: "600",
  },
  clearButton: {
    padding: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  resetButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLOR_WHITE,
    borderWidth: 1,
    borderColor: COLOR_PRIMARY,
  },
  resetButtonText: {
    color: COLOR_PRIMARY,
    fontSize: 15,
    fontWeight: "700",
  },
  applyButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLOR_PRIMARY,
  },
  applyButtonText: {
    color: COLOR_WHITE,
    fontSize: 15,
    fontWeight: "700",
  },
  selectionOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  selectionContainer: {
    backgroundColor: COLOR_WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
  },
  selectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLOR_BLACK,
  },
  selectionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  selectionItemActive: {
    backgroundColor: "#F0F4EC",
  },
  selectionItemText: {
    fontSize: 14,
    color: COLOR_BLACK,
    flex: 1,
  },
  selectionItemTextActive: {
    color: COLOR_PRIMARY,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
});
