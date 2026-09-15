import React from "react";

const MovieFilterBar = ({
                            genre,
                            setGenre,
                            year,
                            setYear,
                            rating,
                            setRating,
                            sort,
                            setSort,
                            genreOptions,
                            yearOptions,
                            ratingOptions,
                            resultCount,
                        }) => {
    const sortOptions = [
        "Featured",
        "Popular",
        "Newest",
        "Top Rated",
    ];

    return (
        <section className="filter-bar">

            <div className="filter-left">

                <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="filter-select"
                >
                    {genreOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>

                <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="filter-select"
                >
                    {yearOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>

                <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="filter-select"
                >
                    {ratingOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>

                <span className="result-count">
          Showing <strong>{resultCount}</strong> Titles
        </span>

            </div>

            <div className="sort-buttons">

                {sortOptions.map((option) => (
                    <button
                        key={option}
                        className={sort === option ? "sort-active" : ""}
                        onClick={() => setSort(option)}
                    >
                        {option}
                    </button>
                ))}

            </div>

        </section>
    );
};

export default MovieFilterBar;