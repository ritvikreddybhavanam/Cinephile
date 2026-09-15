function MovieDetails({ details }) {
    return (
        <section className="movie-details">
            <h3>Details</h3>

            <div className="detail-row">
                <span>Director</span>
                <strong>{details.director}</strong>
            </div>

            <div className="detail-row">
                <span>Writers</span>

                <strong>
                    {details.writers.map((writer) => (
                        <span key={writer}>
                            {writer}
                            <br />
                        </span>
                    ))}
                </strong>
            </div>

            <div className="detail-row">
                <span>Box Office</span>

                <strong>{details.boxOffice}</strong>
            </div>
        </section>
    );
}

export default MovieDetails;