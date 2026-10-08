package com.example.backend.dto;

import java.util.List;
import java.util.Map;

public class FilmDiaryStatsResponse {

    private int year;
    private long totalFilmsLogged;
    private long totalRewatches;
    private long totalMinutesWatched;
    private double totalHoursWatched;
    private Double averageRating;

    // Breakdown maps
    private Map<String, Long> ratingDistribution; // "0.5" -> count, "1.0" -> count, etc.
    private List<Map<String, Object>> topGenres;   // [{ "genre": "Sci-Fi", "count": 12 }]
    private List<Map<String, Object>> topDirectors;// [{ "director": "Christopher Nolan", "count": 4 }]
    private List<Map<String, Object>> topVenues;   // [{ "venue": "Cinema", "count": 18 }]
    private List<Map<String, Object>> monthlyActivity; // [{ "month": "Jan", "count": 6 }]

    public FilmDiaryStatsResponse() {
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public long getTotalFilmsLogged() {
        return totalFilmsLogged;
    }

    public void setTotalFilmsLogged(long totalFilmsLogged) {
        this.totalFilmsLogged = totalFilmsLogged;
    }

    public long getTotalRewatches() {
        return totalRewatches;
    }

    public void setTotalRewatches(long totalRewatches) {
        this.totalRewatches = totalRewatches;
    }

    public long getTotalMinutesWatched() {
        return totalMinutesWatched;
    }

    public void setTotalMinutesWatched(long totalMinutesWatched) {
        this.totalMinutesWatched = totalMinutesWatched;
    }

    public double getTotalHoursWatched() {
        return totalHoursWatched;
    }

    public void setTotalHoursWatched(double totalHoursWatched) {
        this.totalHoursWatched = totalHoursWatched;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Map<String, Long> getRatingDistribution() {
        return ratingDistribution;
    }

    public void setRatingDistribution(Map<String, Long> ratingDistribution) {
        this.ratingDistribution = ratingDistribution;
    }

    public List<Map<String, Object>> getTopGenres() {
        return topGenres;
    }

    public void setTopGenres(List<Map<String, Object>> topGenres) {
        this.topGenres = topGenres;
    }

    public List<Map<String, Object>> getTopDirectors() {
        return topDirectors;
    }

    public void setTopDirectors(List<Map<String, Object>> topDirectors) {
        this.topDirectors = topDirectors;
    }

    public List<Map<String, Object>> getTopVenues() {
        return topVenues;
    }

    public void setTopVenues(List<Map<String, Object>> topVenues) {
        this.topVenues = topVenues;
    }

    public List<Map<String, Object>> getMonthlyActivity() {
        return monthlyActivity;
    }

    public void setMonthlyActivity(List<Map<String, Object>> monthlyActivity) {
        this.monthlyActivity = monthlyActivity;
    }
}
