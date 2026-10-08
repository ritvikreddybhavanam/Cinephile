package com.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

@Service
public class TmdbService {

    private final RestClient restClient;
    private final ConcurrentHashMap<String, CacheEntry> cache = new ConcurrentHashMap<>();

    private static final String FALLBACK_GENRES =
            "{\"genres\":[{\"id\":28,\"name\":\"Action\"},{\"id\":12,\"name\":\"Adventure\"},{\"id\":16,\"name\":\"Animation\"}," +
            "{\"id\":35,\"name\":\"Comedy\"},{\"id\":80,\"name\":\"Crime\"},{\"id\":99,\"name\":\"Documentary\"}," +
            "{\"id\":18,\"name\":\"Drama\"},{\"id\":10751,\"name\":\"Family\"},{\"id\":14,\"name\":\"Fantasy\"}," +
            "{\"id\":36,\"name\":\"History\"},{\"id\":27,\"name\":\"Horror\"},{\"id\":10402,\"name\":\"Music\"}," +
            "{\"id\":9648,\"name\":\"Mystery\"},{\"id\":10749,\"name\":\"Romance\"},{\"id\":878,\"name\":\"Science Fiction\"}," +
            "{\"id\":10770,\"name\":\"TV Movie\"},{\"id\":53,\"name\":\"Thriller\"},{\"id\":10752,\"name\":\"War\"},{\"id\":37,\"name\":\"Western\"}]}";

    private static final String FALLBACK_MOVIES = "{\"page\":1,\"results\":[],\"total_pages\":1,\"total_results\":0}";
    private static final String FALLBACK_EMPTY_OBJ = "{}";
    private static final String FALLBACK_VIDEOS = "{\"id\":0,\"results\":[]}";
    private static final String FALLBACK_CREDITS = "{\"id\":0,\"cast\":[],\"crew\":[]}";

    private static class CacheEntry {
        final String data;
        final long expiresAt;

        CacheEntry(String data, long expiresAt) {
            this.data = data;
            this.expiresAt = expiresAt;
        }
    }

    public TmdbService(
            @Value("${tmdb.base-url}") String baseUrl,
            @Value("${tmdb.api.token}") String token
    ) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(6));
        requestFactory.setReadTimeout(Duration.ofSeconds(10));

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
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

    private String getFromTmdb(String cacheKey, long ttlSeconds, Supplier<String> supplier, String fallbackJson) {
        CacheEntry entry = cache.get(cacheKey);
        long now = System.currentTimeMillis();
        if (entry != null && now < entry.expiresAt) {
            return entry.data;
        }

        try {
            String data = supplier.get();
            if (data != null && !data.isBlank()) {
                cache.put(cacheKey, new CacheEntry(data, now + (ttlSeconds * 1000L)));
                return data;
            }
        } catch (Exception e) {
            System.err.println("TMDB call failed for [" + cacheKey + "]: " + e.getMessage());
            if (entry != null) {
                return entry.data;
            }
        }

        return fallbackJson;
    }

    /*
     * =========================
     * MOVIES
     * =========================
     */

    public String getTrendingMovies(int page) {
        return getFromTmdb("trending_" + page, 1800, () ->
                restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/trending/movie/day")
                                .queryParam("language", "en-US")
                                .queryParam("page", page)
                                .build())
                        .retrieve()
                        .body(String.class),
                FALLBACK_MOVIES
        );
    }

    public String getPopularMovies() {
        return getFromTmdb("popular_1", 1800, () ->
                restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/movie/popular")
                                .queryParam("language", "en-US")
                                .queryParam("page", 1)
                                .build())
                        .retrieve()
                        .body(String.class),
                FALLBACK_MOVIES
        );
    }

    public String getGenres() {
        return getFromTmdb("genres_list", 86400, () ->
                restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/genre/movie/list")
                                .queryParam("language", "en-US")
                                .build())
                        .retrieve()
                        .body(String.class),
                FALLBACK_GENRES
        );
    }

    public String getMovieDetails(Long movieId) {
        return getFromTmdb("movie_details_" + movieId, 3600, () ->
                restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/movie/" + movieId)
                                .queryParam("language", "en-US")
                                .queryParam("append_to_response", "credits,videos,images,recommendations,similar,keywords,watch/providers,release_dates")
                                .build())
                        .retrieve()
                        .body(String.class),
                FALLBACK_EMPTY_OBJ
        );
    }

    public String getMovieVideos(Long movieId) {
        return getFromTmdb("movie_videos_" + movieId, 3600, () ->
                restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/movie/" + movieId + "/videos")
                                .queryParam("language", "en-US")
                                .build())
                        .retrieve()
                        .body(String.class),
                FALLBACK_VIDEOS
        );
    }

    public String getMovies(
            int page,
            String sortBy,
            String year,
            String genre,
            String rating,
            String language
    ) {
        return getMovies(page, sortBy, year, genre, rating, language, null, null, null, null, null, null);
    }

    public String getMovies(
            int page,
            String sortBy,
            String year,
            String genre,
            String rating,
            String language,
            String fromDate,
            String toDate
    ) {
        return getMovies(page, sortBy, year, genre, rating, language, fromDate, toDate, null, null, null, null);
    }

    public String getMovies(
            int page,
            String sortBy,
            String year,
            String genre,
            String rating,
            String language,
            String fromDate,
            String toDate,
            String withWatchProviders,
            String watchRegion,
            Integer runtimeLte,
            Integer runtimeGte
    ) {
        String cacheKey = "movies_" + page + "_" + sortBy + "_" + year + "_" + genre + "_" + rating + "_" + language + "_" + fromDate + "_" + toDate + "_" + withWatchProviders + "_" + watchRegion + "_" + runtimeLte + "_" + runtimeGte;

        return getFromTmdb(cacheKey, 1800, () -> {
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

            if (fromDate != null && !fromDate.isBlank()) {
                uri.append("&primary_release_date.gte=").append(fromDate);
            }

            if (toDate != null && !toDate.isBlank()) {
                uri.append("&primary_release_date.lte=").append(toDate);
            }

            if (withWatchProviders != null && !withWatchProviders.isBlank()) {
                uri.append("&with_watch_providers=").append(withWatchProviders);
                if (watchRegion != null && !watchRegion.isBlank()) {
                    uri.append("&watch_region=").append(watchRegion);
                } else {
                    uri.append("&watch_region=US");
                }
            }

            if (runtimeLte != null && runtimeLte > 0) {
                uri.append("&with_runtime.lte=").append(runtimeLte);
            }

            if (runtimeGte != null && runtimeGte > 0) {
                uri.append("&with_runtime.gte=").append(runtimeGte);
            }

            return restClient.get()
                    .uri(uri.toString())
                    .retrieve()
                    .body(String.class);
        }, FALLBACK_MOVIES);
    }

    public String searchMovies(String query, int page) {
        return getFromTmdb("search_" + query + "_" + page, 600, () ->
                restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/search/movie")
                                .queryParam("query", query)
                                .queryParam("language", "en-US")
                                .queryParam("include_adult", false)
                                .queryParam("page", page)
                                .build())
                        .retrieve()
                        .body(String.class),
                FALLBACK_MOVIES
        );
    }

    public String getMovieCredits(Long movieId) {
        return getFromTmdb("credits_" + movieId, 3600, () -> {
            try {
                return restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/movie/" + movieId + "/credits")
                                .build())
                        .retrieve()
                        .body(String.class);
            } catch (Exception e) {
                return restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/movie/" + movieId + "/credits")
                                .queryParam("language", "en-US")
                                .build())
                        .retrieve()
                        .body(String.class);
            }
        }, FALLBACK_CREDITS);
    }

    public String getMovieReviews(Long movieId) {
        return getFromTmdb("reviews_" + movieId, 1800, () ->
                restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/movie/" + movieId + "/reviews")
                                .queryParam("language", "en-US")
                                .queryParam("page", 1)
                                .build())
                        .retrieve()
                        .body(String.class),
                FALLBACK_MOVIES
        );
    }

    public String getMovieRecommendations(Long movieId) {
        return getFromTmdb("recs_" + movieId, 1800, () ->
                restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/movie/" + movieId + "/recommendations")
                                .queryParam("language", "en-US")
                                .queryParam("page", 1)
                                .build())
                        .retrieve()
                        .body(String.class),
                FALLBACK_MOVIES
        );
    }

    public String getSimilarMovies(Long movieId) {
        return getFromTmdb("similar_" + movieId, 1800, () ->
                restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/movie/" + movieId + "/similar")
                                .queryParam("language", "en-US")
                                .queryParam("page", 1)
                                .build())
                        .retrieve()
                        .body(String.class),
                FALLBACK_MOVIES
        );
    }

    public String getMovieWatchProviders(Long movieId) {
        return getFromTmdb("providers_" + movieId, 3600, () ->
                restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/movie/" + movieId + "/watch/providers")
                                .build())
                        .retrieve()
                        .body(String.class),
                FALLBACK_EMPTY_OBJ
        );
    }

    public String getMovieImages(Long movieId) {
        return getFromTmdb("movie_images_" + movieId, 3600, () ->
                restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/movie/" + movieId + "/images")
                                .build())
                        .retrieve()
                        .body(String.class),
                FALLBACK_EMPTY_OBJ
        );
    }

    public String getMovieKeywords(Long movieId) {
        return getFromTmdb("keywords_" + movieId, 3600, () ->
                restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/movie/" + movieId + "/keywords")
                                .build())
                        .retrieve()
                        .body(String.class),
                FALLBACK_EMPTY_OBJ
        );
    }

    public String getMovieReleaseDates(Long movieId) {
        return getFromTmdb("release_dates_" + movieId, 3600, () ->
                restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/movie/" + movieId + "/release_dates")
                                .build())
                        .retrieve()
                        .body(String.class),
                FALLBACK_EMPTY_OBJ
        );
    }

    /*
     * =========================
     * PEOPLE
     * =========================
     */

    public String getPopularPeople(int page) {
        return getFromTmdb("people_popular_" + page, 1800, () ->
                restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/person/popular")
                                .queryParam("language", "en-US")
                                .queryParam("page", page)
                                .build())
                        .retrieve()
                        .body(String.class),
                FALLBACK_MOVIES
        );
    }

    public String searchPeople(String query, int page) {
        return getFromTmdb("people_search_" + query + "_" + page, 600, () ->
                restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/search/person")
                                .queryParam("query", query)
                                .queryParam("language", "en-US")
                                .queryParam("include_adult", false)
                                .queryParam("page", page)
                                .build())
                        .retrieve()
                        .body(String.class),
                FALLBACK_MOVIES
        );
    }

    public String getPersonDetails(Long personId) {
        return getFromTmdb("person_" + personId, 3600, () ->
                restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/person/" + personId)
                                .queryParam("language", "en-US")
                                .build())
                        .retrieve()
                        .body(String.class),
                FALLBACK_EMPTY_OBJ
        );
    }

    public String getPersonCredits(Long personId) {
        return getFromTmdb("person_credits_" + personId, 3600, () ->
                restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/person/" + personId + "/movie_credits")
                                .queryParam("language", "en-US")
                                .build())
                        .retrieve()
                        .body(String.class),
                FALLBACK_CREDITS
        );
    }

    public String getPersonImages(Long personId) {
        return getFromTmdb("person_images_" + personId, 3600, () ->
                restClient.get()
                        .uri("/person/" + personId + "/images")
                        .retrieve()
                        .body(String.class),
                FALLBACK_EMPTY_OBJ
        );
    }

    public String getPersonExternalIds(Long personId) {
        return getFromTmdb("person_ext_ids_" + personId, 3600, () ->
                restClient.get()
                        .uri("/person/" + personId + "/external_ids")
                        .retrieve()
                        .body(String.class),
                FALLBACK_EMPTY_OBJ
        );
    }

    public List<Map<String, Object>> getLanguages() {
        try {
            return restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/configuration/languages")
                            .build())
                    .retrieve()
                    .body(new org.springframework.core.ParameterizedTypeReference<
                            List<Map<String, Object>>
                            >() {});
        } catch (Exception e) {
            System.err.println("TMDB getLanguages failed: " + e.getMessage());
            return List.of(Map.of("iso_639_1", "en", "english_name", "English", "name", "English"));
        }
    }

    public String getTopMoviesByLanguage(String language) {
        return getFromTmdb("top_lang_" + language, 1800, () ->
                restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/discover/movie")
                                .queryParam("language", "en-US")
                                .queryParam("with_original_language", language)
                                .queryParam("sort_by", "popularity.desc")
                                .queryParam("include_adult", false)
                                .queryParam("page", 1)
                                .build())
                        .retrieve()
                        .body(String.class),
                FALLBACK_MOVIES
        );
    }
}