package com.example.demo.service;

import com.example.demo.entity.InscriptionStatus;
import com.example.demo.entity.Laureat;
import com.example.demo.repository.LaureatRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service pour migrer les comptes validés sans mot de passe
 * Génère automatiquement un mot de passe temporaire pour les comptes PUBLISHED sans password
 * Ce service s'exécute au démarrage de l'application
 */
@Component
@RequiredArgsConstructor
public class PasswordMigrationService implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(PasswordMigrationService.class);
    private final LaureatRepository laureatRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    @Transactional
    public void run(String... args) {
        try {
            migratePasswordsForValidatedAccounts();
        } catch (Exception e) {
            logger.error("Erreur lors de la migration des mots de passe: {}", e.getMessage(), e);
        }
    }

    /**
     * Génère des mots de passe temporaires pour les comptes validés (PUBLISHED) qui n'ont pas de mot de passe
     */
    @Transactional
    public void migratePasswordsForValidatedAccounts() {
        // Récupérer tous les comptes validés sans mot de passe
        List<Laureat> validatedAccountsWithoutPassword = laureatRepository.findAll().stream()
                .filter(laureat -> laureat.getStatus() == InscriptionStatus.PUBLISHED)
                .filter(laureat -> laureat.getPassword() == null || laureat.getPassword().isEmpty())
                .toList();

        if (validatedAccountsWithoutPassword.isEmpty()) {
            logger.info("✅ Aucun compte validé sans mot de passe trouvé.");
            return;
        }

        logger.info("🔄 Migration des mots de passe: {} compte(s) validé(s) sans mot de passe trouvé(s).", 
                validatedAccountsWithoutPassword.size());

        int count = 0;
        for (Laureat laureat : validatedAccountsWithoutPassword) {
            try {
                // Générer un mot de passe temporaire: PrenomNom123!
                String tempPassword = laureat.getPrenom() + laureat.getNom() + "123!";
                String hashedPassword = passwordEncoder.encode(tempPassword);
                laureat.setPassword(hashedPassword);
                laureatRepository.save(laureat);
                count++;
                logger.info("✅ Mot de passe temporaire généré pour le lauréat {} (email: {}). Mot de passe: {}", 
                        laureat.getId(), laureat.getEmail(), tempPassword);
            } catch (Exception e) {
                logger.error("❌ Erreur lors de la génération du mot de passe pour le lauréat {}: {}", 
                        laureat.getId(), e.getMessage());
            }
        }

        logger.info("✅ Migration terminée: {} mot(s) de passe généré(s) avec succès.", count);
    }
}
