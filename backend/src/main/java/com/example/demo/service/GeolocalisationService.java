package com.example.demo.service;

import com.example.demo.repository.ProvinceRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeolocalisationService {

    private final ProvinceRepository provinceRepository;
    private final JdbcTemplate jdbcTemplate;

    public GeolocalisationService(ProvinceRepository provinceRepository, JdbcTemplate jdbcTemplate) {
        this.provinceRepository = provinceRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    // Identifier la province à partir d’un point (lat/lon)
    public Map<String, String> identifierProvince(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            throw new IllegalArgumentException("Latitude et longitude sont obligatoires");
        }

        // 1) Chercher province qui contient le point
        String province = provinceRepository
                .findProvinceNameContainingPoint(latitude, longitude)
                // 2) fallback: province la plus proche
                .orElseGet(() -> provinceRepository
                        .findNearestProvinceName(latitude, longitude)
                        .orElse("Inconnue"));

        Map<String, String> result = new HashMap<>();
        result.put("latitude", latitude.toString());
        result.put("longitude", longitude.toString());
        result.put("province", province);
        result.put("message", "Province identifiée avec succès");
        return result;
    }

    // Récupérer les lauréats avec coordonnées + province (via province_id déjà
    // calculé par trigger)
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
                        p.nom AS province
                    FROM laureat l
                    LEFT JOIN province p ON p.id = l.province_id
                    WHERE l.latitude IS NOT NULL AND l.longitude IS NOT NULL
                """;

        if (publishedOnly) {
            baseSql += " AND LOWER(l.status) = 'published' ";
        }

        baseSql += " ORDER BY l.id DESC ";

        return jdbcTemplate.queryForList(baseSql);
    }

    // Province d’un lauréat (depuis province_id)
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
