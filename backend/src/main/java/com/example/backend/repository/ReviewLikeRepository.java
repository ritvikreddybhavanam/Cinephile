package com.example.backend.repository;

import com.example.backend.entity.Review;
import com.example.backend.entity.ReviewLike;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Long> {
    long countByReview(Review review);
    boolean existsByReviewAndUser(Review review, User user);
    Optional<ReviewLike> findByReviewAndUser(Review review, User user);
    void deleteByReviewAndUser(Review review, User user);
    void deleteByReview(Review review);
}
