import React, { useEffect, useState, useRef } from "react";
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
// L'annuaire est accessible sans authentification
// import { useAuth } from "../../contexts/AuthContext";
import { useFilters } from "../../contexts/FiltersContext";
import { Colors, Spacing, BorderRadius, Shadows, Typography } from "../../constants/theme";
import { getAllFiltres } from "../../services/filtres.api";
import { getLaureatsByStatut } from "../../services/laureats.api";
import { getOrganismes } from "../../services/organismes.api";
import { getGeolocalisationLaureats } from "../../services/geolocalisation.api";
import { normalize, mapFiliere, normSecteur, normGenre, resolvePhotoUrl, formatProvinceName } from "../../utils/helpers";
import { Image } from "react-native";

// ✅ Composant ligne du tableau
function TableRow({ item, onViewMap }: { item: any; onViewMap: () => void }) {
  const filierePromotion = `${item.filiereLabel || item.filiere || "—"}${item.promotion ? ` - ${item.promotion}` : ""}`;
  
  return (
    <View style={styles.tableRow}>
      <View style={styles.tableCell}>
        <Text style={styles.tableCellName}>{item.prenom} {item.nom}</Text>
        <Text style={styles.tableCellDescription} numberOfLines={1}>
          {item.description || "—"}
        </Text>
      </View>
      
      <View style={styles.tableCell}>
        <Text style={styles.tableCellText}>
          {filierePromotion}
        </Text>
      </View>
      
      <View style={styles.tableCell}>
        <View style={styles.tableCellProvince}>
          <Ionicons name="location" size={14} color={Colors.gray400} />
          <Text style={styles.tableCellText}>{formatProvinceName(item.province) || "—"}</Text>
        </View>
      </View>
      
      <View style={[styles.tableCell, styles.tableCellCenter]}>
        {item.status === "published" &&
        Number.isFinite(item.lat) &&
        Number.isFinite(item.lon) ? (
          <Pressable
            onPress={onViewMap}
            style={styles.viewMapButton}
          >
            <Ionicons name="navigate" size={16} color={Colors.white} />
            <Text style={styles.viewMapButtonText}>Carte</Text>
          </Pressable>
        ) : (
          <Text style={styles.noLocationText}>—</Text>
        )}
      </View>
    </View>
  );
}


export default function DirectoryScreen() {
  const router = useRouter();
  // L'annuaire est accessible sans authentification
  const { filters: sharedFilters } = useFilters();
  const [search, setSearch] = useState("");
  const [laureats, setLaureats] = useState<any[]>([]);
  const [filteredLaureats, setFilteredLaureats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ 1) Charger filtres + laureats (accessible sans authentification)
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [filtresRes, publishedRes, organismesRes, geoRes] =
          await Promise.all([
            getAllFiltres(),
            getLaureatsByStatut("published"),
            getOrganismes(),
            getGeolocalisationLaureats(),
          ]);

        const fdata = (filtresRes as any)?.data || filtresRes || {};

        const organismes = Array.isArray((organismesRes as any)?.data)
          ? (organismesRes as any).data
          : Array.isArray(organismesRes)
          ? organismesRes
          : [];
        const organismesMap = new Map(
          organismes.map((org: any) => [org.id, org.nom])
        );

        const geoList = Array.isArray((geoRes as any)?.data)
          ? (geoRes as any).data
          : Array.isArray(geoRes)
          ? geoRes
          : [];
        const provinceMap = new Map(
          geoList.map((item: any) => [item.id, item.province])
        );
        const geoCoordsMap = new Map(
          geoList.map((item: any) => [
            item.id,
            { lat: Number(item.latitude), lon: Number(item.longitude) },
          ])
        );

        const normalizeLaureats = (list: any[]) =>
          list.map((l: any) => {
            const fullname = `${l.prenom || ""} ${l.nom || ""}`.trim();

            const organismeNom =
              l.autreOrganisme ||
              organismesMap.get(l.organismeId) ||
              l.organisme ||
              "";

            const filiereLabel = mapFiliere(l.filiere);
            const secteurNorm = normSecteur(l.secteur);
            const genreNorm = normGenre(l.genre);

            const geoCoords = geoCoordsMap.get(l.id) as { lat: number; lon: number } | undefined;
            const lat = geoCoords?.lat ?? (Number.isFinite(Number(l.latitude || l.lat)) ? Number(l.latitude || l.lat) : null);
            const lon = geoCoords?.lon ?? (Number.isFinite(Number(l.longitude || l.lon)) ? Number(l.longitude || l.lon) : null);

            return {
              ...l,
              organisme: organismeNom,
              province: l.province || provinceMap.get(l.id) || "",
              filiereLabel,
              secteurNorm,
              genreNorm,
              lat: Number.isFinite(lat) ? lat : null,
              lon: Number.isFinite(lon) ? lon : null,
            };
          });

        const publishedList = Array.isArray((publishedRes as any)?.data)
          ? (publishedRes as any).data
          : Array.isArray(publishedRes)
          ? publishedRes
          : [];

        // Annuaire mobile : seulement les lauréats publiés
        const allLaureats = normalizeLaureats(publishedList).map((l: any) => ({
          ...l,
          status: "published",
        }));

        setLaureats(allLaureats);
        setFilteredLaureats(allLaureats);
    } catch (error: any) {
        console.error("❌ Erreur lors du chargement des lauréats:", error);
        setLaureats([]);
        setFilteredLaureats([]);
    } finally {
      setLoading(false);
    }
    })();
  }, [sharedFilters]);

  // ✅ 2) Filtrage (identique au web)
  useEffect(() => {
    let filtered = laureats;

    if (search) {
      const s = normalize(search);
      filtered = filtered.filter(
        (l: any) =>
          normalize(l.nom).includes(s) ||
          normalize(l.prenom).includes(s) ||
          normalize(l.email || "").includes(s) ||
          normalize(l.description || "").includes(s)
      );
    }

    if (sharedFilters.filiere) {
      const f = normalize(sharedFilters.filiere);
      filtered = filtered.filter(
        (l: any) =>
          normalize(l.filiereLabel) === f ||
          normalize(mapFiliere(l.filiere)) === f
      );
    }

    if (sharedFilters.promotion) {
      filtered = filtered.filter(
        (l: any) => String(l.promotion) === String(sharedFilters.promotion)
      );
    }

    if (sharedFilters.secteur) {
      const s = normSecteur(sharedFilters.secteur);
      filtered = filtered.filter((l: any) => l.secteurNorm === s);
    }

    if (sharedFilters.genre) {
      const g = normGenre(sharedFilters.genre);
      filtered = filtered.filter((l: any) => l.genreNorm === g);
    }

    if (sharedFilters.province) {
      filtered = filtered.filter(
        (l: any) => normalize(l.province) === normalize(sharedFilters.province)
      );
    }

    setFilteredLaureats(filtered);
    setCurrentPage(1); // Reset à la page 1 quand les filtres changent
  }, [search, sharedFilters, laureats]);

  // ✅ Pagination (identique au web)
  const totalPages = Math.ceil(filteredLaureats.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLaureats = filteredLaureats.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };


  // ✅ Générer les numéros de page (identique au web)
    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
    const maxVisible = 7;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
    <View style={styles.container}>
      <Header title="Annuaire" />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={Colors.gray400} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un lauréat..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={Colors.gray400}
          />
        </View>
          <Pressable
          style={styles.filterButton}
          onPress={() => router.push("/(tabs)/filters")}
        >
          <Ionicons name="filter" size={18} color={Colors.secondary} />
          <Text style={styles.filterButtonText}>Filtres</Text>
        </Pressable>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      ) : (
        <>
          {/* ✅ Tableau (comme le web) */}
          <ScrollView style={styles.tableScrollView} showsVerticalScrollIndicator>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <View style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderText}>Nom & Prénom</Text>
                </View>
                <View style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderText}>Filière - Promotion</Text>
                </View>
                <View style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderText}>Province</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.tableHeaderCellCenter]}>
                  <Text style={styles.tableHeaderText}>Carte</Text>
                </View>
              </View>

              {paginatedLaureats.length > 0 ? (
                paginatedLaureats.map((item) => (
                  <TableRow
                    key={String(item.id)}
                    item={item}
                    onViewMap={() => {
                      router.push({
                        pathname: "/(tabs)/map",
                        params: {
                          lat: String(item.lat),
                          lon: String(item.lon),
                          laureatId: String(item.id),
                        },
                      });
                    }}
                  />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="people-outline" size={64} color={Colors.gray400} />
                  <Text style={styles.emptyText}>Aucun lauréat trouvé</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* ✅ Pagination (comme le web) */}
          {filteredLaureats.length > 0 && totalPages > 1 && (
            <View style={styles.paginationContainer}>
              <Text style={styles.paginationInfo}>
                Affichage de <Text style={styles.paginationBold}>{startIndex + 1}</Text> à{" "}
                <Text style={styles.paginationBold}>
                  {Math.min(endIndex, filteredLaureats.length)}
                </Text>{" "}
                sur <Text style={styles.paginationBold}>{filteredLaureats.length}</Text> lauréat(s)
            </Text>

              <View style={styles.paginationControls}>
                <Pressable
                  onPress={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={[
                    styles.paginationButton,
                    currentPage === 1 && styles.paginationButtonDisabled,
                  ]}
                >
                  <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? Colors.gray400 : Colors.gray700} />
          </Pressable>

                {getPageNumbers().map((page, index) => {
                  if (page === "...") {
              return (
                      <Text key={`ellipsis-${index}`} style={styles.paginationEllipsis}>
                  ...
                </Text>
              );
            }

                  const isActive = page === currentPage;
            return (
              <Pressable
                      key={page}
                      onPress={() => goToPage(page as number)}
                      style={[
                        styles.paginationButton,
                        styles.paginationButtonPage,
                        isActive && styles.paginationButtonActive,
                      ]}
              >
                <Text
                        style={[
                          styles.paginationButtonText,
                          isActive && styles.paginationButtonTextActive,
                        ]}
                      >
                        {page}
                </Text>
              </Pressable>
            );
          })}

          <Pressable
                  onPress={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={[
                    styles.paginationButton,
                    currentPage === totalPages && styles.paginationButtonDisabled,
                  ]}
                >
                  <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? Colors.gray400 : Colors.gray700} />
          </Pressable>
        </View>
      </View>
          )}
              </>
            )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  searchContainer: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.gray800,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.infoBg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  filterButtonText: {
    color: Colors.secondary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableContainer: {
    backgroundColor: Colors.white,
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.gray100,
    borderBottomWidth: 2,
    borderBottomColor: Colors.gray200,
  },
  tableHeaderCell: {
    flex: 1,
    padding: Spacing.md,
  },
  tableHeaderCellPhoto: {
    flex: 0.5,
    maxWidth: 80,
  },
  photoThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.gray200,
  },
  tableHeaderCellCenter: {
    alignItems: 'center',
  },
  tableHeaderText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.gray700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    backgroundColor: Colors.white,
  },
  tableCell: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  tableCellCenter: {
    alignItems: 'center',
  },
  tableCellName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.gray900,
    marginBottom: Spacing.xs,
  },
  tableCellDescription: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray500,
  },
  tableCellText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray700,
  },
  tableCellProvince: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryDark, // Vert comme le web (bg-green-700 = #059669)
    ...Shadows.sm,
  },
  viewMapButtonText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.white,
    fontWeight: Typography.fontWeight.semibold,
  },
  noLocationText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray400,
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: Spacing.xxl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.gray500,
    marginTop: Spacing.lg,
  },
  paginationContainer: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  paginationInfo: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray700,
    marginBottom: Spacing.md,
  },
  paginationBold: {
    fontWeight: Typography.fontWeight.semibold,
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  paginationButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gray300,
    backgroundColor: Colors.white,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationButtonDisabled: {
    backgroundColor: Colors.gray100,
    borderColor: Colors.gray200,
  },
  paginationButtonPage: {
    paddingHorizontal: Spacing.md,
  },
  paginationButtonActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  paginationButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray700,
  },
  paginationButtonTextActive: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.semibold,
  },
  paginationEllipsis: {
    padding: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: Colors.gray500,
  },
  tableScrollView: {
    flex: 1,
  },
});
