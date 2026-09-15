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

            const formattedReviews = data.map((review) => ({
                id: review.id,
                movieId: review.movieId,
                title: review.title,
                year: review.watchedDate
                    ? new Date(review.watchedDate).getFullYear()
                    : "",
                stars: "★".repeat(
                    Math.floor(review.rating)
                ),
                rating: review.rating.toFixed(1),
                reviewedDate: review.createdAt
                    ? new Date(review.createdAt).toLocaleDateString(
                        "en-US",
                        {
                            month: "short",
                            day: "2-digit",
                            year: "numeric"
                        }
                    )
                    : "",
                review: review.content
            }));

            setReviews(formattedReviews);

        } catch (error) {

            console.error(
                "Failed to load reviews:",
                error
            );

            setError(
                "Unable to load your reviews."
            );

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
                    (review) =>
                        review.id !== reviewId
                )
            );

        } catch (error) {

            console.error(
                "Failed to delete review:",
                error
            );

            setError(
                "Unable to delete review."
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#101418] text-slate-100">

            <Navbar />

            <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">

                <div className="mb-8 flex items-baseline justify-between border-b border-white/10 pb-6">

                    <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-white">
                        My Reviews
                    </h1>

                    <span className="rounded-full border border-[#00e054]/25 bg-[#00e054]/10 px-3 py-1 text-sm font-medium text-[#00e054]">
                        {reviews.length} Reviews
                    </span>

                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {loading ? (

                    <div className="flex min-h-[300px] items-center justify-center">

                        <div className="flex items-center gap-3 text-[#00e054]">

                            <span className="material-symbols-outlined animate-spin">
                                progress_activity
                            </span>

                            Loading reviews...

                        </div>

                    </div>

                ) : reviews.length > 0 ? (

                    <div className="space-y-5">

                        {reviews.map((review) => (

                            <ReviewCard
                                key={review.id}
                                review={review}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />

                        ))}

                    </div>

                ) : (

                    <div className="rounded-xl border border-white/10 bg-[#181c20] px-6 py-16 text-center">

                        <span className="material-symbols-outlined text-5xl text-slate-600">
                            rate_review
                        </span>

                        <h2 className="mt-4 text-xl font-bold text-white">
                            No Reviews Yet
                        </h2>

                        <p className="mt-2 text-sm text-slate-400">
                            Start watching movies and share your thoughts.
                        </p>

                    </div>

                )}

            </main>

            <Footer />

        </div>
    );
}

export default MyReviews;