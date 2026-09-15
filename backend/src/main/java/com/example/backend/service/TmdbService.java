package com.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class TmdbService {

    private final RestClient restClient;

    public TmdbService(
            @Value("${tmdb.base-url}") String baseUrl,
            @Value("${tmdb.api.token}") String token
    ) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + token
                )
                .defaultHeader(
                        HttpHeaders.ACCEPT,
                        MediaType.APPLICATION_JSON_VALUE
                )
                .build();
    }

    /*
     * =========================
     * MOVIES
     * =========================
     */

    public String getTrendingMovies(int page) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/trending/movie/day")
                        .queryParam("language", "en-US")
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String getPopularMovies() {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/popular")
                        .queryParam("language", "en-US")
                        .queryParam("page", 1)
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String getGenres() {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/genre/movie/list")
                        .queryParam("language", "en-US")
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String getMovieDetails(Long movieId) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/" + movieId)
                        .queryParam("language", "en-US")
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String getMovieVideos(Long movieId) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/" + movieId + "/videos")
                        .queryParam("language", "en-US")
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String getMovies(
            int page,
            String sortBy,
            String year,
            String genre,
            String rating,
            String language
    ) {
        StringBuilder uri = new StringBuilder(
                "/discover/movie?language=en-US" +
                        "&include_adult=false" +
                        "&page=" + page
        );

        if (sortBy != null && !sortBy.isBlank()) {
            uri.append("&sort_by=").append(sortBy);
        }

        if (year != null && !year.isBlank()) {
            uri.append("&primary_release_year=").append(year);
        }

        if (genre != null && !genre.isBlank()) {
            uri.append("&with_genres=").append(genre);
        }

        if (rating != null && !rating.isBlank()) {
            uri.append("&vote_average.gte=").append(rating);
        }

        if (language != null && !language.isBlank()) {
            uri.append("&with_original_language=").append(language);
        }

        return restClient.get()
                .uri(uri.toString())
                .retrieve()
                .body(String.class);
    }

    public String searchMovies(String query, int page) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search/movie")
                        .queryParam("query", query)
                        .queryParam("language", "en-US")
                        .queryParam("include_adult", false)
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String getMovieCredits(Long movieId) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/" + movieId + "/credits")
                        .queryParam("language", "en-US")
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String getMovieReviews(Long movieId) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/" + movieId + "/reviews")
                        .queryParam("language", "en-US")
                        .queryParam("page", 1)
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String getMovieRecommendations(Long movieId) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/" + movieId + "/recommendations")
                        .queryParam("language", "en-US")
                        .queryParam("page", 1)
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String getSimilarMovies(Long movieId) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/" + movieId + "/similar")
                        .queryParam("language", "en-US")
                        .queryParam("page", 1)
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String getMovieWatchProviders(Long movieId) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/" + movieId + "/watch/providers")
                        .build())
                .retrieve()
                .body(String.class);
    }

    /*
     * =========================
     * PEOPLE
     * =========================
     */

    public String getPopularPeople(int page) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/person/popular")
                        .queryParam("language", "en-US")
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String searchPeople(String query, int page) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search/person")
                        .queryParam("query", query)
                        .queryParam("language", "en-US")
                        .queryParam("include_adult", false)
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String getPersonDetails(Long personId) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/person/" + personId)
                        .queryParam("language", "en-US")
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String getPersonCredits(Long personId) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/person/" + personId + "/movie_credits")
                        .queryParam("language", "en-US")
                        .build())
                .retrieve()
                .body(String.class);
    }

    public String getPersonImages(Long personId) {
        return restClient.get()
                .uri("/person/" + personId + "/images")
                .retrieve()
                .body(String.class);
    }

    public String getPersonExternalIds(Long personId) {
        return restClient.get()
                .uri("/person/" + personId + "/external_ids")
                .retrieve()
                .body(String.class);
    }

    public List<Map<String, Object>> getLanguages() {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/configuration/languages")
                        .build())
                .retrieve()
                .body(new org.springframework.core.ParameterizedTypeReference<
                        List<Map<String, Object>>
                        >() {});
    }
}