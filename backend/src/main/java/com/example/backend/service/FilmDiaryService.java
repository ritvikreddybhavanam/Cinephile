package com.example.backend.service;

import com.example.backend.dto.FilmDiaryStatsResponse;
import com.example.backend.dto.FilmLogRequest;
import com.example.backend.entity.FilmLog;
import com.example.backend.entity.User;
import com.example.backend.repository.FilmLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FilmDiaryService {

    private final FilmLogRepository filmLogRepository;

    public FilmDiaryService(FilmLogRepository filmLogRepository) {
        this.filmLogRepository = filmLogRepository;
    }

    @Transactional(readOnly = true)
    public List<FilmLog> getDiaryByUser(User user) {
        return filmLogRepository.findByUserOrderByWatchedDateDescCreatedAtDesc(user);
    }

    @Transactional(readOnly = true)
    public List<FilmLog> getDiaryByUserAndMonth(User user, int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return filmLogRepository.findByUserAndWatchedDateBetweenOrderByWatchedDateDescCreatedAtDesc(user, start, end);
    }

    @Transactional
    public FilmLog logFilm(FilmLogRequest request, User user) {
        FilmLog log = new FilmLog();
        log.setUser(user);
        log.setMovieId(request.getMovieId());
        log.setTitle(request.getTitle());
        log.setPoster(request.getPoster());
        log.setYear(request.getYear());
        log.setGenre(request.getGenre());
        log.setRuntime(request.getRuntime() != null && request.getRuntime() > 0 ? request.getRuntime() : 110);
        log.setRating(request.getRating());
        log.setWatchedDate(request.getWatchedDate() != null ? request.getWatchedDate() : LocalDate.now());
        log.setRewatch(request.isRewatch());
        log.setVenueOrPlatform(request.getVenueOrPlatform() != null && !request.getVenueOrPlatform().isBlank()
                ? request.getVenueOrPlatform() : "Streaming");
        log.setReviewNotes(request.getReviewNotes());
        log.setDirector(request.getDirector());

        return filmLogRepository.save(log);
    }

    @Transactional
    public FilmLog updateLog(Long logId, FilmLogRequest request, User user) {
        FilmLog log = filmLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("Diary entry not found"));

        if (!log.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to edit this diary entry");
        }

        if (request.getTitle() != null) log.setTitle(request.getTitle());
        if (request.getPoster() != null) log.setPoster(request.getPoster());
        if (request.getYear() != null) log.setYear(request.getYear());
        if (request.getGenre() != null) log.setGenre(request.getGenre());
        if (request.getRuntime() != null) log.setRuntime(request.getRuntime());
        if (request.getRating() != null) log.setRating(request.getRating());
        if (request.getWatchedDate() != null) log.setWatchedDate(request.getWatchedDate());
        log.setRewatch(request.isRewatch());
        if (request.getVenueOrPlatform() != null) log.setVenueOrPlatform(request.getVenueOrPlatform());
        if (request.getReviewNotes() != null) log.setReviewNotes(request.getReviewNotes());
        if (request.getDirector() != null) log.setDirector(request.getDirector());

        return filmLogRepository.save(log);
    }

    @Transactional
    public void deleteLog(Long logId, User user) {
        FilmLog log = filmLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("Diary entry not found"));

        if (!log.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this diary entry");
        }

        filmLogRepository.delete(log);
    }

    @Transactional(readOnly = true)
    public List<Integer> getAvailableYears(User user) {
        List<Integer> years = filmLogRepository.findDistinctYearsByUser(user);
        if (years.isEmpty()) {
            return List.of(LocalDate.now().getYear());
        }
        return years;
    }

    @Transactional(readOnly = true)
    public FilmDiaryStatsResponse getStatsForYear(User user, int year) {
        List<FilmLog> logs = filmLogRepository.findByUserAndYear(user, year);

        FilmDiaryStatsResponse stats = new FilmDiaryStatsResponse();
        stats.setYear(year);
        stats.setTotalFilmsLogged(logs.size());

        long rewatches = logs.stream().filter(FilmLog::isRewatch).count();
        stats.setTotalRewatches(rewatches);

        long totalMinutes = logs.stream()
                .mapToLong(l -> l.getRuntime() != null ? l.getRuntime() : 110L)
                .sum();
        stats.setTotalMinutesWatched(totalMinutes);
        stats.setTotalHoursWatched(Math.round((totalMinutes / 60.0) * 10.0) / 10.0);

        List<Double> validRatings = logs.stream()
                .map(FilmLog::getRating)
                .filter(Objects::nonNull)
                .toList();

        if (!validRatings.isEmpty()) {
            double avg = validRatings.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            stats.setAverageRating(Math.round(avg * 10.0) / 10.0);
        } else {
            stats.setAverageRating(null);
        }

        // Rating distribution (0.5 to 5.0)
        Map<String, Long> ratingDist = new LinkedHashMap<>();
        for (double r = 0.5; r <= 5.0; r += 0.5) {
            String label = String.format(Locale.US, "%.1f", r);
            double target = r;
            long count = validRatings.stream()
                    .filter(val -> Math.abs(val - target) < 0.01)
                    .count();
            ratingDist.put(label, count);
        }
        stats.setRatingDistribution(ratingDist);

        // Top genres breakdown
        Map<String, Long> genreCounts = new HashMap<>();
        for (FilmLog l : logs) {
            if (l.getGenre() != null && !l.getGenre().isBlank()) {
                String[] parts = l.getGenre().split(",");
                for (String p : parts) {
                    String clean = p.trim();
                    if (!clean.isEmpty()) {
                        genreCounts.put(clean, genreCounts.getOrDefault(clean, 0L) + 1);
                    }
                }
            }
        }
        List<Map<String, Object>> topGenres = genreCounts.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(8)
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("genre", e.getKey());
                    m.put("count", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());
        stats.setTopGenres(topGenres);

        // Top directors
        Map<String, Long> directorCounts = new HashMap<>();
        for (FilmLog l : logs) {
            if (l.getDirector() != null && !l.getDirector().isBlank()) {
                String dir = l.getDirector().trim();
                directorCounts.put(dir, directorCounts.getOrDefault(dir, 0L) + 1);
            }
        }
        List<Map<String, Object>> topDirectors = directorCounts.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(6)
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("director", e.getKey());
                    m.put("count", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());
        stats.setTopDirectors(topDirectors);

        // Top viewing venues/platforms
        Map<String, Long> venueCounts = new HashMap<>();
        for (FilmLog l : logs) {
            if (l.getVenueOrPlatform() != null && !l.getVenueOrPlatform().isBlank()) {
                String ven = l.getVenueOrPlatform().trim();
                venueCounts.put(ven, venueCounts.getOrDefault(ven, 0L) + 1);
            }
        }
        List<Map<String, Object>> topVenues = venueCounts.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(6)
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("venue", e.getKey());
                    m.put("count", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());
        stats.setTopVenues(topVenues);

        // Monthly activity distribution
        Map<Integer, Long> monthCounts = logs.stream()
                .collect(Collectors.groupingBy(l -> l.getWatchedDate().getMonthValue(), Collectors.counting()));

        List<Map<String, Object>> monthly = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            Map<String, Object> monthMap = new HashMap<>();
            String name = java.time.Month.of(m).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            monthMap.put("month", name);
            monthMap.put("count", monthCounts.getOrDefault(m, 0L));
            monthly.add(monthMap);
        }
        stats.setMonthlyActivity(monthly);

        return stats;
    }
}
