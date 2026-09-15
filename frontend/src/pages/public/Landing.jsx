import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import movieImage from "../../assets/images/image1.png";

import {Link} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";



const Landing = () => {
    const {token} = useContext(AuthContext);
    return (
        <div className="min-h-screen overflow-x-hidden bg-[#0a0a0a] font-body-md text-body-md antialiased">
            <Navbar />

            <main>
                <section className="relative flex h-[819px] min-h-[600px] w-full items-center">
                    <div className="absolute inset-0 z-0">
                        <img
                            src={movieImage}
                            alt="Cinematic Hero Backdrop"
                            className="h-full w-full object-cover"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-surface-deep via-surface-deep/80 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-surface-deep via-surface-deep/60 to-transparent" />
                    </div>

                    <div className="relative z-10 mx-auto w-full max-w-[1400px] px-margin-mobile md:px-margin-desktop">
                        <div className="max-w-2xl">
                            <h1 className="mb-stack-md font-display-lg text-display-lg text-on-surface">
                                Discover Movies.
                                <br />
                                <span className="text-primary">
                                    Share Your Perspective.
                                </span>
                            </h1>

                            <p className="mb-stack-lg font-body-lg text-body-lg text-on-surface-variant">
                                Immerse yourself in a curated gallery of cinematic
                                excellence. Discover, rate, and meticulously catalog
                                the films that move you in an environment designed
                                for true Cinephile 🎬s.
                            </p>

                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Link to="/genres" className="cursor-pointer hover:underline">
                                    <button
                                        type="button"
                                        className="rounded-DEFAULT bg-primary-container px-8 py-3 font-title-md text-title-md text-on-primary-fixed transition-colors hover:bg-primary-fixed"
                                    >
                                        Explore Movies
                                    </button>
                                </Link>

                                {
                                    token ? "" :
                                        <Link to="/register">
                                            <button type="button" className="rounded-DEFAULT border border-border-subtle bg-transparent px-8 py-3 font-title-md text-title-md text-on-surface transition-colors hover:bg-surface-variant">
                                                Join Cinephile 🎬
                                            </button>
                                        </Link>
                                }
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Landing;
