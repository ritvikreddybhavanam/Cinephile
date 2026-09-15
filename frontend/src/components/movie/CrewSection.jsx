function CrewSection({
                         directors,
                         producers,
                         writers
                     }) {
    return (
        <section className="max-w-7xl mx-auto px-6 pb-14">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* DIRECTOR */}
                <div>

                    <h2 className="text-xl font-black mb-4">
                        Director
                    </h2>

                    {directors.length > 0 ? (

                        <div className="space-y-2">

                            {directors.map(
                                (person) => (
                                    <div
                                        key={`${person.id}-${person.job}`}
                                        className="text-gray-300"
                                    >

                                        <span className="font-bold text-white">
                                            {person.name}
                                        </span>

                                        <span className="text-gray-500 ml-2">
                                            {person.job}
                                        </span>

                                    </div>
                                )
                            )}

                        </div>

                    ) : (

                        <p className="text-gray-500">
                            No director information.
                        </p>

                    )}

                </div>

                {/* PRODUCERS */}
                <div>

                    <h2 className="text-xl font-black mb-4">
                        Producers
                    </h2>

                    {producers.length > 0 ? (

                        <div className="space-y-2">

                            {producers.map(
                                (
                                    person,
                                    index
                                ) => (
                                    <div
                                        key={`${person.id}-${person.job}-${index}`}
                                        className="text-gray-300"
                                    >

                                        <span className="font-bold text-white">
                                            {person.name}
                                        </span>

                                        <span className="text-gray-500 ml-2">
                                            {person.job}
                                        </span>

                                    </div>
                                )
                            )}

                        </div>

                    ) : (

                        <p className="text-gray-500">
                            No producer information.
                        </p>

                    )}

                </div>

                {/* WRITERS */}
                <div>

                    <h2 className="text-xl font-black mb-4">
                        Writers
                    </h2>

                    {writers.length > 0 ? (

                        <div className="space-y-2">

                            {writers
                                .slice(0, 8)
                                .map(
                                    (
                                        person,
                                        index
                                    ) => (
                                        <div
                                            key={`${person.id}-${person.job}-${index}`}
                                            className="text-gray-300"
                                        >

                                            <span className="font-bold text-white">
                                                {person.name}
                                            </span>

                                            <span className="text-gray-500 ml-2">
                                                {person.job}
                                            </span>

                                        </div>
                                    )
                                )}

                        </div>

                    ) : (

                        <p className="text-gray-500">
                            No writer information.
                        </p>

                    )}

                </div>

            </div>

        </section>
    );
}

export default CrewSection;