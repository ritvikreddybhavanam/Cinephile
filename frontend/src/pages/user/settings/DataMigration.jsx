import { useState } from "react";
import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import ImportExportModal from "../../../components/common/ImportExportModal.jsx";
import useDocumentTitle from "../../../hooks/useDocumentTitle.js";

function DataMigration() {
    useDocumentTitle("Data Migration & Backup");
    const [isModalOpen, setIsModalOpen] = useState(true);

    return (
        <div className="min-h-screen bg-bg text-text flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 py-12">
                <div className="text-center max-w-2xl mx-auto mb-8">
                    <span className="material-symbols-outlined text-4xl text-accent mb-2">
                        sync_alt
                    </span>
                    <h1 className="text-3xl font-serif font-bold text-text mb-2">
                        Import & Export Data
                    </h1>
                    <p className="text-sm text-text-3">
                        Seamlessly migrate your complete watching history, film diary, ratings, and watchlists from Letterboxd or IMDb into Cinephile.
                    </p>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary mt-6 text-sm py-2.5 px-6 inline-flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-base">upload_file</span>
                        Open Migration Hub
                    </button>
                </div>
            </main>
            <ImportExportModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
            <Footer />
        </div>
    );
}

export default DataMigration;
