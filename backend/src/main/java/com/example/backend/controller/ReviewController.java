package com.example.backend.controller;

import com.example.backend.dto.ReviewRequest;
import com.example.backend.entity.Review;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtService;
import com.example.backend.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:5173")
public class ReviewController {

    private final ReviewService reviewService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public ReviewController(
            ReviewService reviewService,
            JwtService jwtService,
            UserRepository userRepository
    ) {
        this.reviewService = reviewService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createReview(
            @RequestHeader(value = "Authorization", required = false)
            String authorizationHeader,
            @RequestBody ReviewRequest request
    ) {

        try {

            User user = getUserFromToken(authorizationHeader);

            Review review =
                    reviewService.createReview(request, user);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(reviewResponse(review));

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<?> getMovieReviews(
            @PathVariable Long movieId
    ) {

        try {

            List<Review> reviews =
                    reviewService.getMovieReviews(movieId);

            return ResponseEntity.ok(reviews);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyReviews(
            @RequestHeader(value = "Authorization", required = false)
            String authorizationHeader
    ) {

        try {

            User user = getUserFromToken(authorizationHeader);

            List<Review> reviews =
                    reviewService.getMyReviews(user);

            List<ReviewResponse> responses =
                    reviews.stream()
                            .map(this::reviewResponse)
                            .toList();

            return ResponseEntity.ok(responses);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<?> getReview(
            @PathVariable Long reviewId
    ) {

        try {

            Review review =
                    reviewService.getReview(reviewId);

            return ResponseEntity.ok(
                    reviewResponse(review)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<?> updateReview(
            @PathVariable Long reviewId,
            @RequestHeader(value = "Authorization", required = false)
            String authorizationHeader,
            @RequestBody ReviewRequest request
    ) {

        try {

            User user = getUserFromToken(authorizationHeader);

            Review review =
                    reviewService.updateReview(
                            reviewId,
                            request,
                            user
                    );

            return ResponseEntity.ok(
                    reviewResponse(review)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(
            @PathVariable Long reviewId,
            @RequestHeader(value = "Authorization", required = false)
            String authorizationHeader
    ) {

        try {

            User user = getUserFromToken(authorizationHeader);

            reviewService.deleteReview(
                    reviewId,
                    user
            );

            return ResponseEntity.ok(
                    "Review deleted successfully"
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    private User getUserFromToken(String authorizationHeader) {

        if (authorizationHeader == null ||
                !authorizationHeader.startsWith("Bearer ")) {

            throw new RuntimeException(
                    "Authorization token is missing"
            );
        }

        String token =
                authorizationHeader.substring(7);

        if (!jwtService.isTokenValid(token)) {

            throw new RuntimeException(
                    "Invalid or expired token"
            );
        }

        String email =
                jwtService.extractEmail(token);

        return userRepository
                .findByEmailaddress(email)
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );
    }

    private ReviewResponse reviewResponse(Review review) {

        return new ReviewResponse(
                review.getId(),
                review.getMovieId(),
                review.getUser().getId(),
                review.getUser().getFirstname(),
                review.getUser().getLastname(),
                review.getRating(),
                review.getTitle(),
                review.getContent(),
                review.getWatchedDate(),
                review.getViewingFormat(),
                review.getRewatch(),
                review.getSpoilers(),
                review.getVisibility(),
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }

    public record ReviewResponse(
            Long id,
            Long movieId,
            Long userId,
            String firstname,
            String lastname,
            Double rating,
            String title,
            String content,
            java.time.LocalDate watchedDate,
            String viewingFormat,
            Boolean rewatch,
            Boolean spoilers,
            String visibility,
            java.time.LocalDateTime createdAt,
            java.time.LocalDateTime updatedAt
    ) {
    }
}