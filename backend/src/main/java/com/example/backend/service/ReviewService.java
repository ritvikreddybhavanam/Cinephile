package com.example.backend.service;

import com.example.backend.dto.ReviewRequest;
import com.example.backend.entity.Review;
import com.example.backend.entity.User;
import com.example.backend.entity.WatchedMovie;
import com.example.backend.repository.ReviewRepository;
import com.example.backend.repository.WatchedMovieRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final WatchedMovieRepository watchedMovieRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            WatchedMovieRepository watchedMovieRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.watchedMovieRepository = watchedMovieRepository;
    }

    @Transactional
    public Review createReview(
            ReviewRequest request,
            User user
    ) {

        if (request.getMovieId() == null) {
            throw new RuntimeException(
                    "Movie ID is required"
            );
        }

        if (request.getRating() == null) {
            throw new RuntimeException(
                    "Rating is required"
            );
        }

        if (request.getRating() < 0.5 ||
                request.getRating() > 5.0) {

            throw new RuntimeException(
                    "Rating must be between 0.5 and 5.0"
            );
        }

        if (request.getTitle() == null ||
                request.getTitle().isBlank()) {

            throw new RuntimeException(
                    "Review title is required"
            );
        }

        if (request.getContent() == null ||
                request.getContent().isBlank()) {

            throw new RuntimeException(
                    "Review content is required"
            );
        }

        if (request.getMovieTitle() == null ||
                request.getMovieTitle().isBlank()) {

            throw new RuntimeException(
                    "Movie title is required"
            );
        }

        if (reviewRepository
                .findByMovieIdAndUser(
                        request.getMovieId(),
                        user
                )
                .isPresent()) {

            throw new RuntimeException(
                    "You have already reviewed this movie"
            );
        }

        Review review = new Review();

        review.setMovieId(
                request.getMovieId()
        );

        review.setUser(user);

        review.setRating(
                request.getRating()
        );

        review.setTitle(
                request.getTitle()
        );

        review.setContent(
                request.getContent()
        );

        review.setWatchedDate(
                request.getWatchedDate()
        );

        review.setViewingFormat(
                request.getViewingFormat()
        );

        review.setRewatch(
                request.getRewatch() != null
                        ? request.getRewatch()
                        : false
        );

        review.setSpoilers(
                request.getSpoilers() != null
                        ? request.getSpoilers()
                        : false
        );

        review.setVisibility(
                request.getVisibility() != null
                        ? request.getVisibility()
                        : "public"
        );

        Review savedReview =
                reviewRepository.save(review);

        if (!watchedMovieRepository
                .existsByUserAndMovieId(
                        user,
                        request.getMovieId()
                )) {

            WatchedMovie watchedMovie =
                    new WatchedMovie();

            watchedMovie.setUser(user);

            watchedMovie.setMovieId(
                    request.getMovieId()
            );

            watchedMovie.setTitle(
                    request.getMovieTitle()
            );

            watchedMovie.setPoster(
                    request.getPoster()
            );

            watchedMovie.setYear(
                    request.getYear()
            );

            watchedMovie.setGenre(
                    request.getGenre()
            );

            watchedMovie.setService(
                    request.getService()
            );

            watchedMovie.setRating(
                    request.getRating()
            );

            watchedMovieRepository.save(
                    watchedMovie
            );
        }

        return savedReview;
    }

    public List<Review> getMovieReviews(
            Long movieId
    ) {

        return reviewRepository
                .findByMovieIdOrderByCreatedAtDesc(
                        movieId
                );
    }

    public List<Review> getMyReviews(
            User user
    ) {

        return reviewRepository
                .findByUserOrderByCreatedAtDesc(
                        user
                );
    }

    public Review getReview(
            Long reviewId
    ) {

        return reviewRepository
                .findById(reviewId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Review not found"
                        )
                );
    }

    public Review updateReview(
            Long reviewId,
            ReviewRequest request,
            User user
    ) {

        Review review =
                getReview(reviewId);

        if (!review.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You are not allowed to update this review"
            );
        }

        if (request.getRating() == null ||
                request.getRating() < 0.5 ||
                request.getRating() > 5.0) {

            throw new RuntimeException(
                    "Rating must be between 0.5 and 5.0"
            );
        }

        review.setRating(
                request.getRating()
        );

        review.setTitle(
                request.getTitle()
        );

        review.setContent(
                request.getContent()
        );

        review.setWatchedDate(
                request.getWatchedDate()
        );

        review.setViewingFormat(
                request.getViewingFormat()
        );

        if (request.getRewatch() != null) {
            review.setRewatch(
                    request.getRewatch()
            );
        }

        if (request.getSpoilers() != null) {
            review.setSpoilers(
                    request.getSpoilers()
            );
        }

        if (request.getVisibility() != null) {
            review.setVisibility(
                    request.getVisibility()
            );
        }

        return reviewRepository.save(review);
    }

    public void deleteReview(
            Long reviewId,
            User user
    ) {

        Review review =
                getReview(reviewId);

        if (!review.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You are not allowed to delete this review"
            );
        }

        reviewRepository.delete(review);
    }
}
