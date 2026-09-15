function CastCard({ actor }) {
    return (
        <div className="cast-card">
            <img
                src={actor.image}
                alt={actor.name}
            />

            <h4>{actor.name}</h4>

            <p>{actor.character}</p>
        </div>
    );
}

export default CastCard;
