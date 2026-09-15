package com.example.backend.controller;

import com.example.backend.dto.PredictionRequest;
import com.example.backend.service.PredictionService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prediction")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(
            PredictionService predictionService
    ) {
        this.predictionService = predictionService;
    }

    @PostMapping("/predict")
    public ResponseEntity<?> predict(
            @RequestBody PredictionRequest request
    ) {

        System.out.println(
                "PREDICTION CONTROLLER REACHED"
        );

        return ResponseEntity.ok(
                predictionService.predict(request)
        );
    }
}