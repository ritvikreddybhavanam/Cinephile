import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";

import PersonHero from "../../../components/person/PersonHero.jsx";
import PersonStats from "../../../components/person/PersonStats.jsx";
import KnownFor from "../../../components/person/KnownFor.jsx";
import Filmography from "../../../components/person/Filmography.jsx";
import PersonSidebar from "../../../components/person/PersonSidebar.jsx";
import PersonPhotos from "../../../components/person/PersonPhotos.jsx";

import {
    getPersonDetails,
    getPersonCredits,
    getPersonImages,
    getPersonExternalIds
} from "../../../services/personService.js";
import useDocumentTitle from "../../../hooks/useDocumentTitle.js";

function PersonDetails() {
    const { id } = useParams();

    const [person, setPerson] = useState(null);
    useDocumentTitle(person ? person.name : "Person Details");
    const [credits, setCredits] = useState(null);
    const [images, setImages] = useState(null);
    const [externalIds, setExternalIds] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) {
            return;
        }

        const loadPerson = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    personData,
                    creditsData,
                    imagesData,
                    externalData
                ] = await Promise.all([
                    getPersonDetails(id),
                    getPersonCredits(id),
                    getPersonImages(id),
                    getPersonExternalIds(id)
                ]);

                setPerson(personData);
                setCredits(creditsData);
                setImages(imagesData);
                setExternalIds(externalData);

            } catch (error) {
                console.error(
                    "Failed to load person:",
                    error
                );

                setError(
                    "Failed to load person information."
                );
            } finally {
                setLoading(false);
            }
        };

        loadPerson();
    }, [id]);

    if (loading) {
        return (
            <>
                <Navbar />

                <main className="min-h-screen bg-[#0B0D0F] pt-24 flex items-center justify-center">

                    <div className="flex flex-col items-center gap-4">

                        <div className="w-10 h-10 border-4 border-[#2C3440] border-t-[#C9A86A] rounded-full animate-spin" />

                        <p className="text-[#99AABB]">
                            Loading person from TMDB...
                        </p>

                    </div>

                </main>

                <Footer />
            </>
        );
    }

    if (error || !person) {
        return (
            <>
                <Navbar />

                <main className="min-h-screen bg-[#0B0D0F] pt-24 flex items-center justify-center">

                    <div className="text-center">

                        <span className="material-symbols-outlined text-5xl text-[#99AABB]">
                            person_off
                        </span>

                        <h1 className="text-2xl font-bold text-white mt-4">
                            Person Not Found
                        </h1>

                        <p className="text-[#99AABB] mt-2">
                            {error || "No TMDB data was found."}
                        </p>

                    </div>

                </main>

                <Footer />
            </>
        );
    }

    return (
        <div className="bg-bg text-text min-h-screen font-sans antialiased">
            <Navbar />

            <main className="w-full">
                <div className="relative w-full overflow-hidden">
                    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12 relative z-10">

                        <PersonHero person={person} />

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-start">

                            <section className="lg:col-span-7 bg-surface border border-border p-6 md:p-8 rounded-lg shadow-card">

                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-serif text-2xl font-semibold text-text">
                                            Biography
                                        </h2>
                                    </div>

                                    <span className="badge badge-accent text-[10px]">
                                        TMDB
                                    </span>
                                </div>

                                <p className="text-sm text-text-2 leading-relaxed whitespace-pre-line">
                                    {person.biography ||
                                        "No biography available for this artist."}
                                </p>

                            </section>

                            <PersonStats
                                credits={credits}
                            />
                        </div>

                        <KnownFor
                            credits={credits}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14">

                            <Filmography
                                credits={credits}
                            />

                            <PersonSidebar
                                person={person}
                                externalIds={externalIds}
                            />

                        </div>

                        <PersonPhotos
                            images={images}
                        />

                    </div>

                </div>

            </main>

            <Footer />

        </div>
    );
}

export default PersonDetails;