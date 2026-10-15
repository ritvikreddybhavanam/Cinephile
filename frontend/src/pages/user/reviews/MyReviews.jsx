import { useEffect, useState } from "react";
import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import ReviewCard from "../../../components/review/ReviewCard.jsx";

import {
    getMyReviews,
    deleteReview
} from "../../../services/reviewService.js";

function MyReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getMyReviews();

            const formattedReviews = (Array.isArray(data) ? data : []).map((review) => ({
                ...review,
                id: review.id,
                movieId: review.movieId,
                title: review.title,
                movieTitle: review.movieTitle || review.title,
                year: review.year || (review.watchedDate ? new Date(review.watchedDate).getFullYear() : ""),
                stars: "★".repeat(Math.min(5, Math.floor(review.rating || 0))),
                rating: Number(review.rating || 0).toFixed(1),
                reviewedDate: review.createdAt
                    ? new Date(review.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric"
                    })
                    : "",
                review: review.content,
                likesCount: review.likesCount || 0,
                isLiked: review.isLiked || false,
                commentsCount: review.commentsCount || 0
            }));

            setReviews(formattedReviews);
        } catch (err) {
            console.error("Failed to load reviews:", err);
            setError("Unable to load your reviews.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (review) => {
        console.log("Edit review:", review);
    };

    const handleDelete = async (reviewId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this review?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteReview(reviewId);

            setReviews((currentReviews) =>
                currentReviews.filter(
                    (review) => review.id !== reviewId
                )
            );
        } catch (err) {
            console.error("Failed to delete review:", err);
            setError("Unable to delete review.");
        }
    };

    return (
        <div className="min-h-screen bg-bg text-text font-sans antialiased">
            <Navbar />

            <main className="page-container flex-1 py-8 sm:py-12">
                <div className="section-header mb-8">
                    <div>
                        <p className="label-caps mb-1">Archive</p>
                        <h1 className="font-serif text-fluid-title font-bold text-text">
                            My Reviews
                        </h1>
                    </div>

                    <span className="badge badge-accent">
                        {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
                    </span>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-32 w-full skeleton rounded-xl" />
                        ))}
                    </div>
                ) : reviews.length > 0 ? (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                showMovieHeader={true}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-border bg-surface px-6 py-16 text-center">
                        <span className="material-symbols-outlined text-5xl text-text-3 opacity-40 mb-3">
                            rate_review
                        </span>

                        <h2 className="font-serif text-xl font-semibold text-text">
                            No Reviews Logged Yet
                        </h2>

                        <p className="mt-1.5 text-sm text-text-3">
                            Log your thoughts and critiques on films you have experienced.
                        </p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default MyReviews;