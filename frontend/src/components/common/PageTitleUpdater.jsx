import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const BASE_TITLE = "Cinephile";

const ROUTE_DEFINITIONS = [
    { pattern: /^\/$/, title: "Cinephile - Discover & Track Movies", raw: true },
    { pattern: /^\/login\/?$/, title: "Login" },
    { pattern: /^\/register\/?$/, title: "Register" },
    { pattern: /^\/forgot-password\/?$/, title: "Forgot Password" },
    { pattern: /^\/reset-password\/?$/, title: "Reset Password" },
    { pattern: /^\/verify-email\/?$/, title: "Verify Email" },
    { pattern: /^\/dashboard\/?$/, title: "Dashboard" },
    { pattern: /^\/movies\/[^/]+\/review\/?$/, title: "Write Review" },
    { pattern: /^\/movies\/[^/]+\/?$/, title: "Movie Details" },
    { pattern: /^\/movies\/?$/, title: "Movies" },
    { pattern: /^\/trending\/?$/, title: "Trending Movies" },
    { pattern: /^\/new-releases\/?$/, title: "New Releases" },
    { pattern: /^\/genres\/?$/, title: "Genres" },
    { pattern: /^\/mywatchedfilms\/?$/, title: "Watched Films" },
    { pattern: /^\/box-prediction\/?$/, title: "Box Office Prediction" },
    { pattern: /^\/favorites\/?$/, title: "Liked Movies" },
    { pattern: /^\/watchlist\/?$/, title: "Watchlist" },
    { pattern: /^\/write_review\/?$/, title: "Write Review" },
    { pattern: /^\/myreviews\/?$/, title: "My Reviews" },
    { pattern: /^\/person\/[^/]+\/?$/, title: "Person Details" },
    { pattern: /^\/people\/?$/, title: "People" },
    { pattern: /^\/more\/?$/, title: "More" },
    { pattern: /^\/about\/?$/, title: "About Us" },
    { pattern: /^\/community\/?$/, title: "Community Guidelines" },
    { pattern: /^\/privacy\/?$/, title: "Privacy Policy" },
    { pattern: /^\/terms\/?$/, title: "Terms of Service" },
    { pattern: /^\/movies-by-languages\/?$/, title: "Movies by Language" },
    { pattern: /^\/languages\/[^/]+\/?$/, title: "Cinema by Language" },
    { pattern: /^\/language\/[^/]+\/?$/, title: "Cinema by Language" }
];

export function getTitleForPath(pathname, searchParams) {
    // Check if on /movies with search query
    if (pathname === "/movies" && searchParams?.get("search")) {
        const query = searchParams.get("search").trim();
        if (query) {
            return { title: `Search: "${query}"`, raw: false };
        }
    }

    for (const route of ROUTE_DEFINITIONS) {
        if (route.pattern.test(pathname)) {
            return route;
        }
    }

    return { title: BASE_TITLE, raw: true };
}

/**
 * PageTitleUpdater automatically synchronizes the browser tab title
 * with the current route path and query parameters.
 */
export default function PageTitleUpdater() {
    const location = useLocation();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const match = getTitleForPath(location.pathname, searchParams);

        if (match.raw) {
            document.title = match.title;
        } else {
            document.title = `${match.title} - ${BASE_TITLE}`;
        }
    }, [location.pathname, location.search]);

    return null;
}
