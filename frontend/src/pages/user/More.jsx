import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import DirectoryTile from "../../components/common/DirectoryTile";

function More() {
    const directoryItems = [
        {
            title: "Movies",
            to: "/movies"
        },
        {
            title: "Genres",
            to: "/genres"
        },
        {
            title: "Trending",
            to: "/trending"
        },
        {
            title: "Box Prediction",
            to: "/box-prediction"
        },
        {
            title: "Favorites",
            to: "/favorites"
        },
        {
            title: "Watchlist",
            to: "/watchlist"
        },
        {
            title: "Watched Films",
            to: "/mywatchedfilms"
        },
        {
            title: "My Reviews",
            to: "/myreviews"
        },
        {
            title: "List",
            to: "/lists"
        },
        {
            title: "People",
            to: "/people"
        },
        {
            title: "Movies By Languages",
            to: "/movies-by-languages"
        }

    ];

    return (
        <div className="min-h-screen flex flex-col bg-[#101418] text-neutral-200 antialiased">
            <Navbar />

            <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-10 flex flex-col justify-center">
                <div className="w-full flex flex-col space-y-4">
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