package com.example.backend.repository;

import com.example.backend.entity.Review;
import com.example.backend.entity.ReviewComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewCommentRepository extends JpaRepository<ReviewComment, Long> {
    List<ReviewComment> findByReviewOrderByCreatedAtAsc(Review review);
    long countByReview(Review review);
    void deleteByReview(Review review);
}
