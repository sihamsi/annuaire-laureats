package com.example.demo.config;

import com.example.demo.entity.Utilisateur;
import com.example.demo.repository.UtilisateurRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class CreateAdminOnce {

    @Bean
    CommandLineRunner createAdmin(UtilisateurRepository repo) {
        return args -> {

            if (repo.findByEmail("admin@ehtp.ac.ma").isPresent()) {
                System.out.println("Admin already exists");
                return;
            }

            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

            Utilisateur admin = new Utilisateur();
            admin.setUsername("admin");
            admin.setEmail("admin@ehtp.ac.ma");
            admin.setRole("admin");
            admin.setPassword(encoder.encode("admin123"));

            repo.save(admin);

            System.out.println("=================================");
            System.out.println("ADMIN CREATED");
            System.out.println("Email: admin@ehtp.ac.ma");
            System.out.println("Password: admin123");
            System.out.println("=================================");
        };
    }
}
