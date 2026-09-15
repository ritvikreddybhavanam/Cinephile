import CastCard from "./CastCard";

function CastSection({ cast }) {
    return (
        <section className="content-card">
            <div className="section-header">
                <h2>Top Cast</h2>

                <button className="text-button">
                    View Full Cast
                </button>
            </div>

            <div className="cast-list">
                {cast.map((actor) => (
                    <CastCard
                        key={actor.id}
                        actor={actor}
                    />
                ))}
            </div>
        </section>
    );
}

export default CastSection;
