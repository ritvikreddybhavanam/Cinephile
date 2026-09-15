import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import DirectoryTile from "../../../components/common/DirectoryTile.jsx";
import { useEffect, useState } from "react";
import { getLanguages } from "../../../services/movieService.js";

function MoviesLanguage() {
    const [languages, setLanguages] = useState([]);

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const data = await getLanguages();
                setLanguages(data);
            } catch (error) {
                console.error("Failed to fetch languages:", error);
            }
        };

        fetchLanguages();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-[#101418] text-neutral-200 antialiased">
            <Navbar />

            <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-10 flex flex-col justify-center">
                <div className="w-full flex flex-col space-y-4">
                    {languages.map((item) => (
                        <DirectoryTile
                            key={item.iso_639_1}
                            title={item.english_name}
                            to={`/movies?language=${item.iso_639_1}`}
                        />
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default MoviesLanguage;