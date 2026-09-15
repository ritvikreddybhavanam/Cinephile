package com.example.backend.controller;

import com.example.backend.service.TmdbService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tmdb")
@CrossOrigin(origins = "http://localhost:5173")
public class TmdbController {

    private final TmdbService tmdbService;

    public TmdbController(TmdbService tmdbService) {
        this.tmdbService = tmdbService;
    }

    @GetMapping("/trending")
    public ResponseEntity<String> getTrendingMovies(
            @RequestParam(defaultValue = "1") int page
    ) {
        return ResponseEntity.ok(
                tmdbService.getTrendingMovies(page)
        );
    }

    @GetMapping("/popular")
    public ResponseEntity<String> getPopularMovies() {
        return ResponseEntity.ok(
                tmdbService.getPopularMovies()
        );
    }

    @GetMapping("/movies")
    public ResponseEntity<String> getMovies(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "popularity.desc") String sortBy,
            @RequestParam(required = false) String year,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String rating,
            @RequestParam(required = false) String language
    ) {
        return ResponseEntity.ok(
                tmdbService.getMovies(
                        page,
                        sortBy,
                        year,
                        genre,
                        rating,
                        language
                )
        );
    }

    @GetMapping("/search")
    public ResponseEntity<String> searchMovies(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int page
    ) {
        return ResponseEntity.ok(
                tmdbService.searchMovies(query, page)
        );
    }

    @GetMapping("/movies/{movieId}")
    public ResponseEntity<String> getMovieDetails(
            @PathVariable Long movieId
    ) {
        return ResponseEntity.ok(
                tmdbService.getMovieDetails(movieId)
        );
    }

    @GetMapping("/movies/{movieId}/videos")
    public ResponseEntity<String> getMovieVideos(
            @PathVariable Long movieId
    ) {
        return ResponseEntity.ok(
                tmdbService.getMovieVideos(movieId)
        );
    }

    @GetMapping("/genres")
    public ResponseEntity<String> getGenres() {
        return ResponseEntity.ok(
                tmdbService.getGenres()
        );
    }

    @GetMapping("/movies/{movieId}/credits")
    public ResponseEntity<String> getMovieCredits(
            @PathVariable Long movieId
    ) {
        return ResponseEntity.ok(
                tmdbService.getMovieCredits(movieId)
        );
    }

    @GetMapping("/movies/{movieId}/reviews")
    public ResponseEntity<String> getMovieReviews(
            @PathVariable Long movieId
    ) {
        return ResponseEntity.ok(
                tmdbService.getMovieReviews(movieId)
        );
    }

    @GetMapping("/movies/{movieId}/recommendations")
    public ResponseEntity<String> getMovieRecommendations(
            @PathVariable Long movieId
    ) {
        return ResponseEntity.ok(
                tmdbService.getMovieRecommendations(movieId)
        );
    }

    @GetMapping("/movies/{movieId}/similar")
    public ResponseEntity<String> getSimilarMovies(
            @PathVariable Long movieId
    ) {
        return ResponseEntity.ok(
                tmdbService.getSimilarMovies(movieId)
        );
    }

    @GetMapping("/movies/{movieId}/watch/providers")
    public ResponseEntity<String> getMovieWatchProviders(
            @PathVariable Long movieId
    ) {
        return ResponseEntity.ok(
                tmdbService.getMovieWatchProviders(movieId)
        );
    }

    /*
     * =========================
     * PEOPLE
     * =========================
     */

    @GetMapping("/people/popular")
    public ResponseEntity<String> getPopularPeople(
            @RequestParam(defaultValue = "1") int page
    ) {
        return ResponseEntity.ok(
                tmdbService.getPopularPeople(page)
        );
    }

    @GetMapping("/people/search")
    public ResponseEntity<String> searchPeople(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int page
    ) {
        return ResponseEntity.ok(
                tmdbService.searchPeople(query, page)
        );
    }

    @GetMapping("/person/{personId}")
    public ResponseEntity<String> getPersonDetails(
            @PathVariable Long personId
    ) {
        return ResponseEntity.ok(
                tmdbService.getPersonDetails(personId)
        );
    }

    @GetMapping("/person/{personId}/credits")
    public ResponseEntity<String> getPersonCredits(
            @PathVariable Long personId
    ) {
        return ResponseEntity.ok(
                tmdbService.getPersonCredits(personId)
        );
    }

    @GetMapping("/person/{personId}/images")
    public ResponseEntity<String> getPersonImages(
            @PathVariable Long personId
    ) {
        return ResponseEntity.ok(
                tmdbService.getPersonImages(personId)
        );
    }

    @GetMapping("/person/{personId}/external-ids")
    public ResponseEntity<String> getPersonExternalIds(
            @PathVariable Long personId
    ) {
        return ResponseEntity.ok(
                tmdbService.getPersonExternalIds(personId)
        );
    }

    @GetMapping("languages")
    public List<Map<String, Object>> getLanguages() {
        return tmdbService.getLanguages();
    }

    /*
     * =========================
     * TEST
     * =========================
     */

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("TMDB API is working");
    }

}