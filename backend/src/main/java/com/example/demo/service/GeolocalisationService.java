package com.example.demo.service;

import com.example.demo.repository.ProvinceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeolocalisationService {

    private static final Logger logger = LoggerFactory.getLogger(GeolocalisationService.class);
    private final ProvinceRepository provinceRepository;
    private final JdbcTemplate jdbcTemplate;

    public GeolocalisationService(ProvinceRepository provinceRepository, JdbcTemplate jdbcTemplate) {
        this.provinceRepository = provinceRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    // Identifier la province à partir d'un point (lat/lon)
    public Map<String, String> identifierProvince(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            throw new IllegalArgumentException("Latitude et longitude sont obligatoires");
        }

        try {
            logger.debug("Tentative d'identification de province pour lat={}, lon={}", latitude, longitude);
            
            // 1) Chercher province qui contient le point
            String province = provinceRepository
                    .findProvinceNameContainingPoint(latitude, longitude)
                    // 2) fallback: province la plus proche
                    .orElseGet(() -> {
                        logger.debug("Aucune province ne contient le point, recherche de la province la plus proche");
                        return provinceRepository
                                .findNearestProvinceName(latitude, longitude)
                                .orElse("Inconnue");
                    });

            logger.info("Province identifiée: {} pour lat={}, lon={}", province, latitude, longitude);

            Map<String, String> result = new HashMap<>();
            result.put("latitude", latitude.toString());
            result.put("longitude", longitude.toString());
            result.put("province", province);
            result.put("message", "Province identifiée avec succès");
            return result;
        } catch (Exception e) {
            logger.error("Erreur lors de l'identification de la province pour lat={}, lon={}: {}", 
                    latitude, longitude, e.getMessage(), e);
            throw new RuntimeException("Erreur lors de l'identification de la province: " + e.getMessage(), e);
        }
    }

    // Récupérer les lauréats avec coordonnées + province + organisme
    public List<Map<String, Object>> getLaureatsAvecCoordonnees(boolean publishedOnly) {
        String baseSql = """
                    SELECT
                        l.id,
                        l.nom,
                        l.prenom,
                        l.filiere,
                        l.promotion,
                        l.status,
                        l.latitude,
                        l.longitude,
                        l.organisme_id,
                        l.autre_organisme,
                        p.nom AS province,
                        o.nom AS organisme_nom
                    FROM laureat l
                    LEFT JOIN province p ON p.id = l.province_id
                    LEFT JOIN organisme o ON o.id = l.organisme_id
                    WHERE l.latitude IS NOT NULL AND l.longitude IS NOT NULL
                """;

        if (publishedOnly) {
            baseSql += " AND LOWER(l.status) = 'published' ";
        }

        baseSql += " ORDER BY l.id DESC ";

        return jdbcTemplate.queryForList(baseSql);
    }

    // ✅ Récupérer toutes les provinces en GeoJSON
    public String getProvincesAsGeoJSON() {
        try {
            String geoJSON = provinceRepository.findAllAsGeoJSON();
            return geoJSON != null ? geoJSON : "{\"type\":\"FeatureCollection\",\"features\":[]}";
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des provinces en GeoJSON: {}", e.getMessage(), e);
            return "{\"type\":\"FeatureCollection\",\"features\":[]}";
        }
    }

    // Province d'un lauréat (depuis province_id)
    public Map<String, Object> getProvinceForLaureat(Long laureatId) {
        if (laureatId == null) {
            throw new IllegalArgumentException("laureatId est obligatoire");
        }

        String sql = """
                    SELECT
                        l.id AS laureat_id,
                        l.nom,
                        l.prenom,
                        l.latitude,
                        l.longitude,
                        p.nom AS province
                    FROM laureat l
                    LEFT JOIN province p ON p.id = l.province_id
                    WHERE l.id = ?
                    LIMIT 1
                """;

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, laureatId);
        if (rows.isEmpty()) {
            throw new IllegalArgumentException("Lauréat introuvable avec id: " + laureatId);
        }
        return rows.get(0);
    }
}
