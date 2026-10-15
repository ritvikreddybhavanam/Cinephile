import { useState, useRef } from "react";
import { importCsvFiles, downloadCsv } from "../../services/dataService.js";
import { useToast } from "../../context/ToastContext.jsx";

function ImportExportModal({ isOpen, onClose, onImportComplete }) {
    const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
    const [activeTab, setActiveTab] = useState("import"); // "import" | "export"
    const [sourceType, setSourceType] = useState("letterboxd"); // "letterboxd" | "imdb" | "cinephile"
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const fileInputRef = useRef(null);

    const [errorMessage, setErrorMessage] = useState(null);

    if (!isOpen) return null;

    const addValidFiles = (files) => {
        const valid = [];
        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            const name = f.name.toLowerCase();
            if (name.endsWith(".csv") || name.endsWith(".zip")) {
                valid.push(f);
            }
        }
        if (valid.length === 0) {
            toastError("Please select valid .csv or .zip export files.");
            return;
        }
        setSelectedFiles((prev) => {
            const existingNames = new Set(prev.map((p) => p.name));
            const newAdditions = valid.filter((v) => !existingNames.has(v.name));
            return [...prev, ...newAdditions];
        });
        setImportResult(null);
        setErrorMessage(null);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            addValidFiles(e.target.files);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            addValidFiles(e.dataTransfer.files);
        }
    };

    const removeFile = (indexToRemove) => {
        setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
        setImportResult(null);
        setErrorMessage(null);
    };

    const clearAllFiles = () => {
        setSelectedFiles([]);
        setImportResult(null);
        setErrorMessage(null);
    };

    const handleStartImport = async () => {
        if (selectedFiles.length === 0) {
            toastError("Please select or drop at least one CSV or ZIP file.");
            return;
        }

        try {
            setUploading(true);
            setImportResult(null);
            setErrorMessage(null);
            const result = await importCsvFiles(selectedFiles);
            setImportResult(result);

            if (result.successfulImports > 0) {
                toastSuccess(`Successfully processed ${result.successfulImports} film records across ${selectedFiles.length} file(s)!`);
                if (onImportComplete) onImportComplete();
            } else if (result.warnings && result.warnings.length > 0) {
                setErrorMessage(result.warnings[0]);
                toastError(result.warnings[0]);
            } else {
                setErrorMessage("0 films were imported. Please check that your CSV has a 'Name' or 'Title' column.");
                toastError("No films found in CSV.");
            }
        } catch (err) {
            console.error("Import error:", err);
            const msg =
                err.response?.data?.warnings?.[0] ||
                err.response?.data?.message ||
                (typeof err.response?.data === "string" ? err.response?.data : null) ||
                err.message ||
                "Failed to import data. Please verify your CSV format.";
            setErrorMessage(msg);
            toastError(msg);
        } finally {
            setUploading(false);
        }
    };

    const handleExport = (endpoint, filename) => {
        try {
            toastInfo("Generating export file...");
            downloadCsv(endpoint, filename);
            toastSuccess("Download initiated!");
        } catch (err) {
            toastError("Failed to download CSV.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-2xl rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface-2/40">
                    <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-accent text-2xl">
                            sync_alt
                        </span>
                        <div>
                            <h2 className="text-lg font-serif font-bold text-text">
                                Data Migration & Backup
                            </h2>
                            <p className="text-xs text-text-3">
                                Import multiple CSVs from Letterboxd / IMDb or export your archive
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-text transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border bg-surface px-6 pt-2">
                    <button
                        type="button"
                        onClick={() => { setActiveTab("import"); setImportResult(null); }}
                        className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === "import"
                                ? "border-accent text-accent"
                                : "border-transparent text-text-3 hover:text-text"
                        }`}
                    >
                        <span className="material-symbols-outlined text-base">upload_file</span>
                        Import CSVs & Archives
                    </button>
                    <button
                        type="button"
                        onClick={() => { setActiveTab("export"); setImportResult(null); }}
                        className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === "export"
                                ? "border-accent text-accent"
                                : "border-transparent text-text-3 hover:text-text"
                        }`}
                    >
                        <span className="material-symbols-outlined text-base">download</span>
                        Export Archive
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {activeTab === "import" ? (
                        <div className="space-y-5">
                            {/* Platform selector */}
                            <div>
                                <label className="block text-xs uppercase tracking-wider font-bold text-text-3 mb-2">
                                    Source Platform
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    {[
                                        { id: "letterboxd", name: "Letterboxd", icon: "movie_edit" },
                                        { id: "imdb", name: "IMDb", icon: "star_rate" },
                                        { id: "cinephile", name: "Generic / Mixed", icon: "table_chart" },
                                    ].map((platform) => (
                                        <button
                                            key={platform.id}
                                            type="button"
                                            onClick={() => setSourceType(platform.id)}
                                            className={`flex items-center justify-center gap-2 rounded-xl p-3 border text-xs font-semibold transition-all ${
                                                sourceType === platform.id
                                                    ? "border-accent bg-accent/10 text-accent"
                                                    : "border-border bg-surface-2/60 text-text-2 hover:bg-surface-2"
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-base">{platform.icon}</span>
                                            {platform.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Help guide banner */}
                            <div className="rounded-xl border border-border/80 bg-surface-2/40 p-3.5 text-xs text-text-3 leading-relaxed flex items-start gap-2.5">
                                <span className="material-symbols-outlined text-accent text-lg shrink-0 mt-0.5">info</span>
                                <div>
                                    {sourceType === "letterboxd" && (
                                        <span>
                                            On Letterboxd: <strong>Settings ➔ Import & Export ➔ Export Your Data</strong>. You can drop the entire exported <strong>.zip file</strong> or select multiple files: <code className="text-text font-mono">diary.csv</code>, <code className="text-text font-mono">ratings.csv</code>, <code className="text-text font-mono">watched.csv</code>, and <code className="text-text font-mono">watchlist.csv</code> at once.
                                        </span>
                                    )}
                                    {sourceType === "imdb" && (
                                        <span>
                                            On IMDb: <strong>Your Ratings ➔ Three dots (⋮) ➔ Export</strong>. Upload the downloaded <code className="text-text font-mono">ratings.csv</code> or multiple list exports.
                                        </span>
                                    )}
                                    {sourceType === "cinephile" && (
                                        <span>
                                            Select and upload multiple CSVs containing columns for <code className="text-text font-mono">Name/Title</code>, <code className="text-text font-mono">Year, Rating, Watched Date</code>.
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Drag & Drop Upload Zone */}
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-7 text-center cursor-pointer transition-all ${
                                    selectedFiles.length > 0
                                        ? "border-accent bg-accent/5"
                                        : "border-border hover:border-accent/60 bg-surface-2/20"
                                }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".csv,.zip"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                <span className="material-symbols-outlined text-4xl text-accent mb-2">
                                    {selectedFiles.length > 0 ? "note_add" : "cloud_upload"}
                                </span>

                                <p className="text-sm font-semibold text-text">
                                    Click to select or drag & drop multiple CSV files / ZIP archive
                                </p>
                                <p className="text-xs text-text-3 mt-1">
                                    Select diary.csv, ratings.csv, watchlist.csv or the entire Letterboxd .zip export
                                </p>
                            </div>

                            {/* Selected Files List */}
                            {selectedFiles.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs text-text-3 font-semibold">
                                        <span>Selected Files ({selectedFiles.length})</span>
                                        <button
                                            type="button"
                                            onClick={clearAllFiles}
                                            className="text-red-400 hover:underline"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedFiles.map((file, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 rounded-lg bg-surface-2 border border-border px-3 py-1.5 text-xs shadow-sm"
                                            >
                                                <span className="material-symbols-outlined text-sm text-accent">
                                                    {file.name.endsWith(".zip") ? "folder_zip" : "description"}
                                                </span>
                                                <span className="font-semibold text-text max-w-[160px] truncate">
                                                    {file.name}
                                                </span>
                                                <span className="text-[10px] text-text-3">
                                                    ({(file.size / 1024).toFixed(0)} KB)
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                                    className="text-text-3 hover:text-red-400 transition-colors ml-1"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Error / Warning Alert Banner */}
                            {errorMessage && (
                                <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-200 flex items-start gap-2.5">
                                    <span className="material-symbols-outlined text-red-400 text-lg shrink-0 mt-0.5">
                                        error
                                    </span>
                                    <div className="flex-1">
                                        <p className="font-bold text-red-300">Import Issue Detected</p>
                                        <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setErrorMessage(null)}
                                        className="text-red-400 hover:text-red-200"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>
                            )}

                            {/* Import Results Summary */}
                            {importResult && (
                                <div className="rounded-xl border border-accent/40 bg-accent/10 p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-accent font-bold text-sm">
                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                        Import Summary
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                                        <div className="rounded-lg bg-surface p-2 border border-border">
                                            <div className="text-base font-bold text-text">{importResult.successfulImports}</div>
                                            <div className="text-text-3">Total Matched</div>
                                        </div>
                                        <div className="rounded-lg bg-surface p-2 border border-border">
                                            <div className="text-base font-bold text-accent">{importResult.diaryEntriesAdded}</div>
                                            <div className="text-text-3">Diary Logs</div>
                                        </div>
                                        <div className="rounded-lg bg-surface p-2 border border-border">
                                            <div className="text-base font-bold text-text">{importResult.watchedAdded}</div>
                                            <div className="text-text-3">Watched Films</div>
                                        </div>
                                        <div className="rounded-lg bg-surface p-2 border border-border">
                                            <div className="text-base font-bold text-text">{importResult.watchlistAdded}</div>
                                            <div className="text-text-3">Watchlist Items</div>
                                        </div>
                                    </div>
                                    {importResult.reviewsAdded > 0 && (
                                        <p className="text-xs text-accent font-semibold text-center mt-1">
                                            ✨ Migrated {importResult.reviewsAdded} full reviews into your archive!
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-xs text-text-3">
                                Download your personal Cinephile records in clean, standardized CSV files compatible with Letterboxd and other platforms.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="rounded-xl bg-surface-2 border border-border p-4 flex flex-col justify-between gap-3">
                                    <div>
                                        <span className="material-symbols-outlined text-accent text-2xl mb-1">auto_stories</span>
                                        <h4 className="text-sm font-bold text-text">Film Diary</h4>
                                        <p className="text-[11px] text-text-3 mt-0.5">Logs, viewing dates, rewatches & review notes</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleExport("diary", "cinephile_diary.csv")}
                                        className="btn-primary text-xs py-2 px-3 w-full"
                                    >
                                        Export Diary
                                    </button>
                                </div>

                                <div className="rounded-xl bg-surface-2 border border-border p-4 flex flex-col justify-between gap-3">
                                    <div>
                                        <span className="material-symbols-outlined text-accent text-2xl mb-1">bookmark</span>
                                        <h4 className="text-sm font-bold text-text">Watchlist</h4>
                                        <p className="text-[11px] text-text-3 mt-0.5">All movies queued in your watchlist</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleExport("watchlist", "cinephile_watchlist.csv")}
                                        className="btn-primary text-xs py-2 px-3 w-full"
                                    >
                                        Export Watchlist
                                    </button>
                                </div>

                                <div className="rounded-xl bg-surface-2 border border-border p-4 flex flex-col justify-between gap-3">
                                    <div>
                                        <span className="material-symbols-outlined text-accent text-2xl mb-1">visibility</span>
                                        <h4 className="text-sm font-bold text-text">Watched History</h4>
                                        <p className="text-[11px] text-text-3 mt-0.5">All marked watched films with ratings</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleExport("watched", "cinephile_watched.csv")}
                                        className="btn-primary text-xs py-2 px-3 w-full"
                                    >
                                        Export Watched
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="border-t border-border bg-surface-2/40 px-6 py-4 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-text hover:bg-surface-2 transition-colors"
                    >
                        Close
                    </button>

                    {activeTab === "import" && (
                        <button
                            type="button"
                            onClick={handleStartImport}
                            disabled={selectedFiles.length === 0 || uploading}
                            className="btn-primary text-xs py-2 px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-base">
                                {uploading ? "progress_activity" : "upload"}
                            </span>
                            {uploading ? `Processing ${selectedFiles.length} file(s)...` : `Import ${selectedFiles.length > 0 ? `(${selectedFiles.length}) Files` : "Files"}`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ImportExportModal;
