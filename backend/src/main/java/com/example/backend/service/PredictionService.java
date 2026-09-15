package com.example.backend.service;

import com.example.backend.dto.PredictionRequest;
import com.example.backend.dto.PredictionResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class PredictionService {

    private final RestTemplate restTemplate = new RestTemplate();

    private final String pythonApiUrl =
            "http://127.0.0.1:8000/predict";

    public PredictionResponse predict(PredictionRequest request) {

        Map<String, Object> requestBody = new HashMap<>();

        requestBody.put("title", request.getTitle());
        requestBody.put("budget", request.getBudget());
        requestBody.put("runtime", request.getRuntime());
        requestBody.put("release_year", request.getReleaseYear());
        requestBody.put("release_month", request.getReleaseMonth());
        requestBody.put(
                "original_language",
                request.getOriginalLanguage()
        );
        requestBody.put(
                "main_country",
                request.getMainCountry()
        );
        requestBody.put("genres", request.getGenres());

        ResponseEntity<Map> response =
                restTemplate.postForEntity(
                        pythonApiUrl,
                        requestBody,
                        Map.class
                );

        Map<String, Object> responseBody =
                response.getBody();

        String title =
                (String) responseBody.get("title");

        double predictedRevenue =
                ((Number) responseBody.get(
                        "predicted_revenue"
                )).doubleValue();

        double predictedRevenueMillions =
                ((Number) responseBody.get(
                        "predicted_revenue_millions"
                )).doubleValue();

        return new PredictionResponse(
                title,
                predictedRevenue,
                predictedRevenueMillions
        );
    }
}