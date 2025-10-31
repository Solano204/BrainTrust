package com.braintrust.containerapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = {
            "com.braintrust.containerapp",
        "com.braintrust.identity",
        "com.braintrust.education",
        "com.braintrust.aidetectition",  // FIX TYPO: aidetectition
        "com.braintrust.shared"
})
@EntityScan(basePackages = {
        "com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities",
        "com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities",
        "com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.entities"
})
@EnableJpaRepositories(basePackages = {
        // Point to the package containing all your JpaRepository interfaces
        "com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories",
        "com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories",
        "com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.repositories"
        // Add all your repository packages here
})
@EnableScheduling // ✅ AGREGAR ESTO
public class BrainTrustApplication {
    public static void main(String[] args) {
        SpringApplication.run(BrainTrustApplication.class, args);
    }
}