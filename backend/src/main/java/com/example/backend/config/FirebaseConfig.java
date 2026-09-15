package com.example.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initializeFirebase() throws Exception {

        InputStream serviceAccount =
                getClass()
                        .getClassLoader()
                        .getResourceAsStream(
                                "firebase-service-account.json"
                        );

        if (serviceAccount == null) {
            throw new RuntimeException(
                    "Firebase service account JSON file not found"
            );
        }

        FirebaseOptions options =
                FirebaseOptions.builder()
                        .setCredentials(
                                GoogleCredentials.fromStream(
                                        serviceAccount
                                )
                        )
                        .build();

        FirebaseApp.initializeApp(options);
    }
}