package com.braintrust.containerapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {
        "com.braintrust.containerapp",
        "com.braintrust.identity",
        "com.braintrust.education",
        "com.braintrust.aidetectition",  // FIX TYPO: aidetectition
        "com.braintrust.shared"
})
public class BrainTrustApplication {
    public static void main(String[] args) {
        SpringApplication.run(BrainTrustApplication.class, args);
    }
}