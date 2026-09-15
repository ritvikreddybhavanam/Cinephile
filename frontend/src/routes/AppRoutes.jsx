import { Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

// Public
import Landing from "../pages/public/Landing.jsx";
import Login from "../pages/public/Login.jsx";
import Register from "../pages/public/Register.jsx";
import ForgotPassword from "../pages/public/ForgotPassword.jsx";
import ResetPassword from "../pages/public/ResetPassword.jsx";

// Authentication
import VerifyEmail from "../pages/Auth/VerifyEmail.jsx";

// Dashboard
import UserDashboard from "../pages/user/dashboard/UserDashboard.jsx";

// Movies
import Movies from "../pages/user/movies/Movies.jsx";
import MovieDetails from "../pages/user/movies/MovieDetails.jsx";
import Trending from "../pages/user/movies/Trending.jsx";
import Genres from "../pages/user/movies/Genres.jsx";
import WatchedFilms from "../pages/user/movies/WatchedFilms.jsx";

// Box Office
import BoxOfficePrediction from "../pages/user/boxoffice/BoxOfficePrediction.jsx";

// Library
import LikedMovies from "../pages/user/library/LikedMovies.jsx";
import Watchlist from "../pages/user/library/Watchlist.jsx";

// People
import PersonDetails from "../pages/user/people/PersonDetails.jsx";

// Reviews
import MyReviews from "../pages/user/reviews/MyReviews.jsx";
import WriteReview from "../pages/user/reviews/WriteReview.jsx";

// More
import More from "../pages/user/More.jsx";

// Navbar Pages
import AboutUs from "../pages/navbar_pages/AboutUs.jsx";
import CommunityGuidelines from "../pages/navbar_pages/CommunityGuidelines.jsx";
import Privacy from "../pages/navbar_pages/Privacy.jsx";
import TermsOfService from "../pages/navbar_pages/TermsOfService.jsx";
import People from "../pages/user/people/People.jsx";
import MoviesLanguage from "../pages/user/movies/MoviesLanguage.jsx";

function AppRoutes() {
    return (
        <Routes>

            {/* ==================== PUBLIC ==================== */}

            <Route path="/" element={<Landing />} />

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            <Route
                path="/forgot-password"
                element={<ForgotPassword />}
            />

            <Route
                path="/reset-password"
                element={<ResetPassword />}
            />


            {/* ==================== AUTHENTICATION ==================== */}

            <Route
                path="/verify-email"
                element={<VerifyEmail />}
            />


            {/* ==================== DASHBOARD ==================== */}

            <Route
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <UserDashboard />
                    </PrivateRoute>
                }
            />


            {/* ==================== MOVIES ==================== */}

            <Route
                path="/movies"
                element={
                    <PrivateRoute>
                        <Movies />
                    </PrivateRoute>
                }
            />

            <Route
                path="/movies/:movieId"
                element={
                    <PrivateRoute>
                        <MovieDetails />
                    </PrivateRoute>
                }
            />

            <Route
                path="/movies/:id/review"
                element={
                    <PrivateRoute>
                        <WriteReview />
                    </PrivateRoute>
                }
            />

            <Route
                path="/trending"
                element={
                    <PrivateRoute>
                        <Trending />
                    </PrivateRoute>
                }
            />

            <Route
                path="/genres"
                element={
                    <PrivateRoute>
                        <Genres />
                    </PrivateRoute>
                }
            />

            <Route
                path="/mywatchedfilms"
                element={
                    <PrivateRoute>
                        <WatchedFilms />
                    </PrivateRoute>
                }
            />


            {/* ==================== BOX OFFICE ==================== */}

            <Route
                path="/box-prediction"
                element={
                    <PrivateRoute>
                        <BoxOfficePrediction />
                    </PrivateRoute>
                }
            />


            {/* ==================== LIBRARY ==================== */}

            <Route
                path="/favorites"
                element={
                    <PrivateRoute>
                        <LikedMovies />
                    </PrivateRoute>
                }
            />

            <Route
                path="/watchlist"
                element={
                    <PrivateRoute>
                        <Watchlist />
                    </PrivateRoute>
                }
            />


            {/* ==================== REVIEWS ==================== */}

            <Route
                path="/write_review"
                element={
                    <PrivateRoute>
                        <WriteReview />
                    </PrivateRoute>
                }
            />

            <Route
                path="/myreviews"
                element={
                    <PrivateRoute>
                        <MyReviews />
                    </PrivateRoute>
                }
            />


            {/* ==================== PEOPLE ==================== */}

            <Route
                path="/person/:id"
                element={
                    <PrivateRoute>
                        <PersonDetails />
                    </PrivateRoute>
                }
            />


            {/* ==================== MORE ==================== */}

            <Route
                path="/more"
                element={
                    <PrivateRoute>
                        <More />
                    </PrivateRoute>
                }
            />


            {/* ==================== NAVBAR / INFORMATION ==================== */}

            <Route
                path="/about"
                element={<AboutUs />}
            />

            <Route
                path="/community"
                element={<CommunityGuidelines />}
            />

            <Route
                path="/privacy"
                element={<Privacy />}
            />

            <Route
                path="/terms"
                element={<TermsOfService />}
            />

            <Route
                path="/people"
                element={
                    <PrivateRoute>
                        <People />
                    </PrivateRoute>
                } />

            <Route
                path="/movies-by-languages"
                element={
                    <PrivateRoute>
                        <MoviesLanguage />
                    </PrivateRoute>
                } />

        </Routes>
    );
}

export default AppRoutes;