import { useState } from "react";

import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";

import InputField from "../../../components/boxoffice/InputField.jsx";
import SelectField from "../../../components/boxoffice/SelectField.jsx";
import TerritoryCard from "../../../components/boxoffice/TerritoryCard.jsx";

import { runPrediction as sendPrediction } from "../../../services/predictionService.js";

function BoxOfficePrediction() {
    const [movieTitle, setMovieTitle] = useState("Chronicles of Aethelgard");
    const [budget, setBudget] = useState("$165,000,000");
    const [runtime, setRuntime] = useState("148 min");

    const [releaseYear, setReleaseYear] = useState("2026");
    const [releaseMonth, setReleaseMonth] = useState("July");

    const [language, setLanguage] = useState("English (US)");
    const [country, setCountry] = useState("United States");

    const [genres, setGenres] = useState([
        "Action",
        "Adventure",
        "Science Fiction"
    ]);

    const [isPredicting, setIsPredicting] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [error, setError] = useState("");

    const allGenres = [
        "Action",
        "Adventure",
        "Science Fiction",
        "Animation",
        "Comedy",
        "Crime",
        "Documentary",
        "Drama",
        "Family",
        "Fantasy",
        "History",
        "Horror",
        "Music",
        "Mystery",
        "Romance",
        "Thriller",
        "War",
        "Western"
    ];

    const toggleGenre = (genre) => {
        setGenres((currentGenres) => {
            if (currentGenres.includes(genre)) {
                return currentGenres.filter(
                    (item) => item !== genre
                );
            }

            return [...currentGenres, genre];
        });
    };

    const getReleaseMonthNumber = (month) => {
        const months = {
            January: 1,
            February: 2,
            March: 3,
            April: 4,
            May: 5,
            June: 6,
            July: 7,
            August: 8,
            September: 9,
            October: 10,
            November: 11,
            December: 12
        };

        return months[month];
    };

    const getLanguageCode = (selectedLanguage) => {
        const languages = {
            "English (US)": "en",
            "English (UK)": "en",
            French: "fr",
            Spanish: "es",
            Japanese: "ja",
            Korean: "ko",
            German: "de",
            Hindi: "hi",
            Mandarin: "zh"
        };

        return languages[selectedLanguage] || "en";
    };

    const getCountryName = (selectedCountry) => {
        const countries = {
            "United States": "United States of America",
            "United Kingdom": "United Kingdom",
            Canada: "Canada",
            France: "France",
            "South Korea": "South Korea",
            Japan: "Japan",
            Germany: "Germany",
            Australia: "Australia"
        };

        return countries[selectedCountry] || selectedCountry;
    };

    const runPrediction = async (event) => {
        if (event) {
            event.preventDefault();
        }

        setIsPredicting(true);
        setError("");
        setPrediction(null);

        try {
            const budgetValue = Number(
                budget.replace(/[$,]/g, "")
            );

            const runtimeValue = Number(
                runtime.replace(/\D/g, "")
            );

            if (!movieTitle.trim()) {
                throw new Error(
                    "Movie title is required."
                );
            }

            if (!budgetValue || budgetValue <= 0) {
                throw new Error(
                    "Please enter a valid production budget."
                );
            }

            if (!runtimeValue || runtimeValue <= 0) {
                throw new Error(
                    "Please enter a valid runtime."
                );
            }

            if (!genres.length) {
                throw new Error(
                    "Please select at least one genre."
                );
            }

            const requestBody = {
                title: movieTitle.trim(),
                budget: budgetValue,
                runtime: runtimeValue,
                releaseYear: Number(releaseYear),
                releaseMonth:
                    getReleaseMonthNumber(releaseMonth),
                originalLanguage:
                    getLanguageCode(language),
                mainCountry:
                    getCountryName(country),
                genres: genres
            };

            console.log(
                "Prediction request:",
                requestBody
            );

            const data =
                await sendPrediction(requestBody);

            console.log(
                "Prediction response:",
                data
            );

            setPrediction(data);

        } catch (error) {
            console.error(
                "Prediction error:",
                error
            );

            setPrediction(null);

            setError(
                error.message ||
                "Unable to generate the prediction. Please make sure the backend services are running."
            );
        } finally {
            setIsPredicting(false);
        }
    };

    const budgetValue = Number(
        budget.replace(/[$,]/g, "")
    );

    const predictedRevenue = prediction
        ? Number(prediction.predictedRevenue)
        : 0;

    const predictionMultiplier =
        predictedRevenue > 0 &&
        budgetValue > 0
            ? (
                predictedRevenue /
                budgetValue
            ).toFixed(2)
            : null;

    return (
        <div className="w-full bg-surface min-h-screen">

            <Navbar />

            <section className="relative w-full overflow-hidden bg-surface-deep">

                <div className="absolute -top-40 left-1/4 w-[600px] h-[350px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

                <div className="absolute top-20 right-10 w-[450px] h-[300px] bg-secondary-container/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-margin-sm md:px-margin-md pt-8 pb-10 relative z-10">

                    <div className="max-w-3xl">

                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-muted/60 backdrop-blur-md mb-3">

                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />

                            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                                Box Office Prediction
                            </span>

                        </div>

                        <h1 className="font-display-lg text-display-lg text-text-main tracking-tight font-extrabold">
                            Box Office Prediction
                        </h1>

                        <p className="font-body-lg text-body-lg text-text-dim mt-3 leading-relaxed">
                            Enter the movie details below to estimate its worldwide box office revenue.
                        </p>

                    </div>

                </div>

            </section>

            <div className="max-w-7xl mx-auto px-margin-sm md:px-margin-md py-8 w-full">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    <div className="lg:col-span-7 flex flex-col gap-6">

                        <div className="bg-surface-container-low p-6 md:p-8 rounded-xl">

                            <div className="flex items-center justify-between pb-6 mb-6">

                                <div className="flex items-center gap-3">

                                    <span className="w-8 h-8 rounded-lg bg-surface-muted flex items-center justify-center text-primary">

                                        <span className="material-symbols-outlined text-[20px]">
                                            movie_filter
                                        </span>

                                    </span>

                                    <div>

                                        <h2 className="font-title-md text-title-md font-bold text-text-main">
                                            Movie Information
                                        </h2>

                                        <p className="font-body-sm text-body-sm text-text-dim">
                                            Enter the information required to generate the revenue estimate.
                                        </p>

                                    </div>

                                </div>

                            </div>

                            <form
                                onSubmit={runPrediction}
                                className="flex flex-col gap-5"
                            >

                                <InputField
                                    label="Movie Title"
                                    value={movieTitle}
                                    onChange={(e) =>
                                        setMovieTitle(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter the movie title..."
                                    icon="title"
                                    required
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <InputField
                                        label="Production Budget (USD)"
                                        value={budget}
                                        onChange={(e) =>
                                            setBudget(
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. $150,000,000"
                                        icon="attach_money"
                                        required
                                    />

                                    <InputField
                                        label="Runtime"
                                        value={runtime}
                                        onChange={(e) =>
                                            setRuntime(
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. 148 min"
                                        icon="schedule"
                                        badge="MINUTES"
                                        required
                                    />

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <SelectField
                                        label="Release Year"
                                        value={releaseYear}
                                        onChange={(e) =>
                                            setReleaseYear(
                                                e.target.value
                                            )
                                        }
                                        icon="calendar_today"
                                        options={[
                                            {
                                                value: "2025",
                                                label: "2025"
                                            },
                                            {
                                                value: "2026",
                                                label: "2026"
                                            },
                                            {
                                                value: "2027",
                                                label: "2027"
                                            },
                                            {
                                                value: "2028",
                                                label: "2028"
                                            },
                                            {
                                                value: "2024",
                                                label: "2024 (Retrospective)"
                                            }
                                        ]}
                                    />

                                    <SelectField
                                        label="Release Month"
                                        value={releaseMonth}
                                        onChange={(e) =>
                                            setReleaseMonth(
                                                e.target.value
                                            )
                                        }
                                        icon="event"
                                        options={[
                                            {
                                                value: "January",
                                                label: "January"
                                            },
                                            {
                                                value: "February",
                                                label: "February"
                                            },
                                            {
                                                value: "March",
                                                label: "March"
                                            },
                                            {
                                                value: "April",
                                                label: "April"
                                            },
                                            {
                                                value: "May",
                                                label: "May"
                                            },
                                            {
                                                value: "June",
                                                label: "June"
                                            },
                                            {
                                                value: "July",
                                                label: "July"
                                            },
                                            {
                                                value: "August",
                                                label: "August"
                                            },
                                            {
                                                value: "September",
                                                label: "September"
                                            },
                                            {
                                                value: "October",
                                                label: "October"
                                            },
                                            {
                                                value: "November",
                                                label: "November"
                                            },
                                            {
                                                value: "December",
                                                label: "December"
                                            }
                                        ]}
                                    />

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <SelectField
                                        label="Original Language"
                                        value={language}
                                        onChange={(e) =>
                                            setLanguage(
                                                e.target.value
                                            )
                                        }
                                        icon="translate"
                                        options={[
                                            {
                                                value: "English (US)",
                                                label: "English (US)"
                                            },
                                            {
                                                value: "English (UK)",
                                                label: "English (UK)"
                                            },
                                            {
                                                value: "French",
                                                label: "French"
                                            },
                                            {
                                                value: "Spanish",
                                                label: "Spanish"
                                            },
                                            {
                                                value: "Japanese",
                                                label: "Japanese"
                                            },
                                            {
                                                value: "Korean",
                                                label: "Korean"
                                            },
                                            {
                                                value: "German",
                                                label: "German"
                                            },
                                            {
                                                value: "Hindi",
                                                label: "Hindi"
                                            },
                                            {
                                                value: "Mandarin",
                                                label: "Mandarin"
                                            }
                                        ]}
                                    />

                                    <SelectField
                                        label="Production Country"
                                        value={country}
                                        onChange={(e) =>
                                            setCountry(
                                                e.target.value
                                            )
                                        }
                                        icon="public"
                                        options={[
                                            {
                                                value: "United States",
                                                label: "United States"
                                            },
                                            {
                                                value: "United Kingdom",
                                                label: "United Kingdom"
                                            },
                                            {
                                                value: "Canada",
                                                label: "Canada"
                                            },
                                            {
                                                value: "France",
                                                label: "France"
                                            },
                                            {
                                                value: "South Korea",
                                                label: "South Korea"
                                            },
                                            {
                                                value: "Japan",
                                                label: "Japan"
                                            },
                                            {
                                                value: "Germany",
                                                label: "Germany"
                                            },
                                            {
                                                value: "Australia",
                                                label: "Australia"
                                            }
                                        ]}
                                    />

                                </div>

                                <div className="flex flex-col gap-2.5 pt-2">

                                    <div className="flex items-center justify-between">

                                        <label className="font-metadata text-metadata text-on-surface font-semibold">
                                            Genres
                                        </label>

                                        <span className="font-body-sm text-body-sm text-text-dim text-xs">
                                            Select one or more genres:
                                        </span>

                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-1">

                                        {allGenres.map(
                                            (genre) => {

                                                const selected =
                                                    genres.includes(
                                                        genre
                                                    );

                                                return (
                                                    <button
                                                        key={genre}
                                                        type="button"
                                                        onClick={() =>
                                                            toggleGenre(
                                                                genre
                                                            )
                                                        }
                                                        className={`
                                                            px-3.5 py-1.5
                                                            rounded-full
                                                            font-metadata
                                                            text-metadata
                                                            transition-all
                                                            flex items-center
                                                            gap-1.5
                                                            ${
                                                            selected
                                                                ? "bg-primary text-on-primary font-semibold shadow-sm"
                                                                : "bg-surface-muted text-on-surface hover:bg-surface-bright"
                                                        }
                                                        `}
                                                    >

                                                        {selected && (
                                                            <span className="material-symbols-outlined text-[16px]">
                                                                check
                                                            </span>
                                                        )}

                                                        <span>
                                                            {genre}
                                                        </span>

                                                    </button>
                                                );
                                            }
                                        )}

                                    </div>

                                </div>

                                <div className="pt-4">

                                    <button
                                        type="submit"
                                        disabled={
                                            isPredicting
                                        }
                                        className="group w-full py-4 px-6 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline-lg text-title-md font-bold tracking-tight transition-all duration-200 shadow-[0_4px_24px_rgba(67,254,109,0.25)] hover:shadow-[0_6px_32px_rgba(67,254,109,0.4)] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70"
                                    >

                                        <span className="material-symbols-outlined text-[24px] group-hover:rotate-12 transition-transform duration-300">

                                            {isPredicting
                                                ? "sync"
                                                : "smart_toy"}

                                        </span>

                                        <span>
                                            {isPredicting
                                                ? "Generating Prediction..."
                                                : "Predict Box Office"}
                                        </span>

                                        {!isPredicting && (
                                            <span className="material-symbols-outlined text-[20px] ml-1 group-hover:translate-x-1 transition-transform">
                                                bolt
                                            </span>
                                        )}

                                    </button>

                                </div>

                            </form>

                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3">

                                <span className="material-symbols-outlined text-[20px]">
                                    error
                                </span>

                                <p className="font-body-sm text-body-sm">
                                    {error}
                                </p>

                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                            <TerritoryCard
                                icon="public"
                                title="Worldwide"
                                description="Global box-office estimate"
                            />

                            <TerritoryCard
                                icon="calculate"
                                title="Revenue Estimate"
                                description="Based on entered parameters"
                                iconClass="text-secondary-container"
                            />

                        </div>

                    </div>

                    <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">

                        <div className="flex flex-col gap-5">

                            <div className="bg-surface-container-low p-6 md:p-8 rounded-xl shadow-md relative overflow-hidden">

                                <div className="absolute -right-12 -top-12 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

                                <div className="flex items-center justify-between pb-6">

                                    <div className="flex items-center gap-2.5">

                                        <span className="material-symbols-outlined text-primary text-[22px]">
                                            insights
                                        </span>

                                        <h2 className="font-title-md text-title-md font-bold text-text-main">
                                            Prediction Result
                                        </h2>

                                    </div>

                                    <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full font-label-caps text-label-caps font-semibold">

                                        <span className="material-symbols-outlined text-[14px]">
                                            verified
                                        </span>

                                        <span>
                                            Model Result
                                        </span>

                                    </div>

                                </div>

                                {error && (
                                    <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">

                                        <div className="flex items-start gap-2">

                                            <span className="material-symbols-outlined text-[20px]">
                                                error
                                            </span>

                                            <span className="font-body-sm text-body-sm">
                                                {error}
                                            </span>

                                        </div>

                                    </div>
                                )}

                                <div className="bg-surface-deep p-6 rounded-xl relative overflow-hidden flex flex-col items-center text-center">

                                    <span className="font-label-caps text-label-caps text-text-dim uppercase tracking-wider mb-2">
                                        Estimated Worldwide Box Office Revenue
                                    </span>

                                    <div className="font-display-lg text-[44px] md:text-display-lg text-primary font-extrabold tracking-tight leading-none drop-shadow-[0_0_24px_rgba(67,254,109,0.35)] my-2">

                                        {prediction
                                            ? `$${Number(
                                                prediction.predictedRevenueMillions
                                            ).toFixed(2)} Million`
                                            : "—"}

                                    </div>

                                    <div className="inline-flex items-center gap-2 mt-3 px-3.5 py-1.5 bg-surface-container rounded-lg font-label-caps text-label-caps text-on-surface">

                                        <span className="text-text-dim">
                                            Exact Computed Figure:
                                        </span>

                                        <span className="font-bold text-primary font-metadata tracking-normal">

                                            {prediction
                                                ? `Estimated Revenue: $${Number(
                                                    prediction.predictedRevenue
                                                ).toLocaleString(
                                                    "en-US",
                                                    {
                                                        maximumFractionDigits: 2
                                                    }
                                                )}`
                                                : "—"}

                                        </span>

                                    </div>

                                    <div className="w-full mt-6 pt-4 bg-surface-container-lowest/70 p-3 rounded-lg flex items-center justify-between font-metadata text-metadata">

                                        <div className="text-left">

                                            <span className="text-text-dim block text-xs font-label-caps">
                                                ESTIMATED MULTIPLIER
                                            </span>

                                            <span className="font-bold text-text-main">

                                                {predictionMultiplier
                                                    ? `${predictionMultiplier}x Production Budget`
                                                    : "—"}

                                            </span>

                                        </div>

                                        <div className="text-right">

                                            <span className="text-text-dim block text-xs font-label-caps">
                                                PREDICTED REVENUE
                                            </span>

                                            <span className="font-semibold text-primary">

                                                {prediction
                                                    ? `$${Number(
                                                        prediction.predictedRevenueMillions
                                                    ).toFixed(2)}M`
                                                    : "—"}

                                            </span>

                                        </div>

                                    </div>

                                </div>

                                <div className="mt-6 flex flex-col gap-3">

                                    <div className="flex items-center justify-between">

                                        <h3 className="font-title-md text-body-lg font-bold text-text-main">
                                            Additional Information
                                        </h3>

                                        <span className="font-label-caps text-[11px] text-text-dim uppercase">
                                            Prediction Parameters
                                        </span>

                                    </div>

                                    <div className="bg-surface-deep rounded-xl p-4">

                                        <div className="py-2.5 flex items-center justify-between text-body-sm font-body-sm">

                                            <span className="text-text-dim flex items-center gap-2">

                                                <span className="material-symbols-outlined text-[16px]">
                                                    theaters
                                                </span>

                                                Movie

                                            </span>

                                            <span className="font-bold text-text-main text-right">
                                                {movieTitle ||
                                                    "Untitled Film"}
                                            </span>

                                        </div>

                                        <div className="py-2.5 flex items-center justify-between text-body-sm font-body-sm">

                                            <span className="text-text-dim flex items-center gap-2">

                                                <span className="material-symbols-outlined text-[16px]">
                                                    date_range
                                                </span>

                                                Release

                                            </span>

                                            <span className="font-medium text-text-main">
                                                {releaseMonth}{" "}
                                                {releaseYear}
                                            </span>

                                        </div>

                                        <div className="py-2.5 flex items-center justify-between text-body-sm font-body-sm">

                                            <span className="text-text-dim flex items-center gap-2">

                                                <span className="material-symbols-outlined text-[16px]">
                                                    account_balance
                                                </span>

                                                Budget

                                            </span>

                                            <span className="font-medium text-text-main font-label-caps">
                                                {budget}
                                            </span>

                                        </div>

                                        <div className="py-2.5 flex items-start justify-between text-body-sm font-body-sm gap-4">

                                            <span className="text-text-dim flex items-center gap-2 whitespace-nowrap">

                                                <span className="material-symbols-outlined text-[16px]">
                                                    category
                                                </span>

                                                Genres

                                            </span>

                                            <div className="flex flex-wrap gap-1.5 justify-end">

                                                {genres.length > 0 ? (
                                                    genres.map(
                                                        (genre) => (
                                                            <span
                                                                key={genre}
                                                                className="bg-surface-container px-2 py-0.5 rounded text-xs text-primary font-medium"
                                                            >
                                                                {genre}
                                                            </span>
                                                        )
                                                    )
                                                ) : (
                                                    <span className="text-text-dim text-xs">
                                                        None selected
                                                    </span>
                                                )}

                                            </div>

                                        </div>

                                        <div className="py-2.5 flex items-center justify-between text-body-sm font-body-sm">

                                            <span className="text-text-dim flex items-center gap-2">

                                                <span className="material-symbols-outlined text-[16px]">
                                                    language
                                                </span>

                                                Language

                                            </span>

                                            <span className="font-medium text-text-main">
                                                {language}
                                            </span>

                                        </div>

                                        <div className="py-2.5 flex items-center justify-between text-body-sm font-body-sm">

                                            <span className="text-text-dim flex items-center gap-2">

                                                <span className="material-symbols-outlined text-[16px]">
                                                    flag
                                                </span>

                                                Production Country

                                            </span>

                                            <span className="font-medium text-text-main">
                                                {country}
                                            </span>

                                        </div>

                                    </div>

                                </div>

                                <div className="mt-6 bg-surface-deep p-4 rounded-xl">

                                    <div className="flex items-center justify-between mb-3">

                                        <span className="font-label-caps text-label-caps text-text-dim uppercase tracking-wider">
                                            Prediction Summary
                                        </span>

                                        <span className="font-label-caps text-[11px] text-primary">
                                            MODEL OUTPUT
                                        </span>

                                    </div>

                                    <div className="grid grid-cols-2 gap-3">

                                        <div className="bg-surface-container p-3 rounded-lg">

                                            <span className="block text-xs font-label-caps text-text-dim mb-1">
                                                BUDGET
                                            </span>

                                            <span className="font-bold text-text-main">
                                                {budget}
                                            </span>

                                        </div>

                                        <div className="bg-surface-container p-3 rounded-lg">

                                            <span className="block text-xs font-label-caps text-text-dim mb-1">
                                                ESTIMATED REVENUE
                                            </span>

                                            <span className="font-bold text-primary">

                                                {prediction
                                                    ? `$${Number(
                                                        prediction.predictedRevenueMillions
                                                    ).toFixed(2)}M`
                                                    : "—"}

                                            </span>

                                        </div>

                                    </div>

                                </div>

                                <div className="mt-6 p-4 rounded-xl bg-surface-deep/80 text-text-dim flex items-start gap-3">

                                    <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">
                                        info
                                    </span>

                                    <p className="font-body-sm text-body-sm leading-snug">

                                        <strong className="text-text-main font-medium">
                                            Disclaimer:
                                        </strong>{" "}

                                        This is an estimated box-office prediction. Actual revenue may vary based on audience response, marketing, distribution, release timing, competition, and other factors.

                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            <Footer />

        </div>
    );
}

export default BoxOfficePrediction;