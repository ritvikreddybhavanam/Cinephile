import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import DirectoryTile from "../../components/common/DirectoryTile";

function More() {
    const directoryItems = [
        { title: "Films", to: "/movies" },
        { title: "Genres", to: "/genres" },
        { title: "Trending Cinema", to: "/trending" },
        { title: "New Releases", to: "/new-releases" },
        { title: "Box Office Intelligence", to: "/box-prediction" },
        { title: "Favourite Films", to: "/favorites" },
        { title: "Watchlist Queue", to: "/watchlist" },
        { title: "Logged Films", to: "/mywatchedfilms" },
        { title: "My Reviews", to: "/myreviews" },
        { title: "Curated Lists", to: "/lists" },
        { title: "Directors & Artists", to: "/people" },
        { title: "Cinema By Language", to: "/movies-by-languages" },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-bg text-text antialiased font-sans">
            <Navbar />

            <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
                <div className="section-header mb-8">
                    <div>
                        <p className="label-caps mb-1">Index</p>
                        <h1 className="section-title text-3xl sm:text-4xl">
                            Platform Directory
                        </h1>
                    </div>
                </div>

                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {directoryItems.map((item) => (
                        <DirectoryTile
                            key={item.title}
                            title={item.title}
                            to={item.to}
                        />
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default More;