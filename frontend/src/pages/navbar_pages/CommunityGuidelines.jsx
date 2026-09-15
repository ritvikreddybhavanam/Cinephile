import React, { useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

const CommunityGuidelines = () => {
    const [showModal, setShowModal] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const closeModal = () => {
        setShowModal(false);
        setSubmitted(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="bg-surface text-on-surface antialiased min-h-screen">
            <Navbar />

            <main className="w-full pt-16 bg-surface min-h-screen">
                <div className="relative w-full overflow-hidden">

                    {/* Ambient Glow */}
                    <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-gradient-to-b from-primary/10 via-primary-container/5 to-transparent blur-3xl pointer-events-none -z-10" />

                    <div className="max-w-5xl mx-auto px-margin-sm md:px-margin-md py-12 md:py-20 flex flex-col gap-16">

                        {/* Header */}
                        <section className="flex flex-col gap-6 text-left max-w-3xl">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex w-2 h-2 rounded-full bg-primary animate-pulse" />

                                <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-medium">
                  Standard Protocol • Rev. 2024.04
                </span>
                            </div>

                            <h1 className="font-display-lg text-display-lg text-text-main font-extrabold tracking-tight">
                                Community Guidelines
                            </h1>

                            <p className="font-headline-lg text-title-md text-on-surface-variant font-normal leading-relaxed">
                                Fostering thoughtful criticism, civil debate, and a shared
                                reverence for cinema.
                            </p>

                            <p className="font-body-lg text-body-lg text-text-dim leading-relaxed pt-2">
                                Cinephile 🎬 was founded as an intimate haven for the moving
                                image—a quiet, darkened hall where Cinephile 🎬s, practitioners,
                                and first-time voyeurs dissect visual language, historical
                                weight, and emotional resonance. Our platform prioritizes
                                intentional discourse over reactionary static. Participation
                                implies a shared covenant to preserve the dignity of the
                                conversation.
                            </p>
                        </section>

                        {/* Atmospheric Image */}
                        <section className="w-full relative rounded-xl overflow-hidden bg-surface-deep shadow-2xl">
                            <div className="relative h-64 md:h-72 w-full">
                                <div
                                    className="bg-cover bg-center w-full h-full opacity-60"
                                    style={{
                                        backgroundImage:
                                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDlBUuibC1_z-WsK3oHmFje7hlzLGHoQH-qSwARNk6A7p2-EODMI4vTDXaTxcxYKDdQbz5MjAum7d7hdo3rPD--IZDVwLbAj_x0Pzdxz6anYnY61SM4wHxhf7Vs1tuTSeeVfVFB1Ui9wvMXQuGllXViZtoUv-Z-TEuDe83C6CDtr2bEeMOxIhVXc1FRu-5y8OWqfnko-j4lvworXh_sdX2ho2JB5Hmid-Hry2ZuUfNfkOwhkI8gzVpA')",
                                    }}
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-surface-deep via-surface-deep/60 to-transparent" />

                                <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                                    <div className="flex flex-col gap-1">
                    <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">
                      Core Ethos
                    </span>

                                        <p className="font-title-md text-title-md text-text-main">
                                            A sanctuary engineered for discerning Cinephile 🎬s.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 bg-surface-container/80 backdrop-blur-md px-4 py-2 rounded-lg">
                                        <div className="flex flex-col">
                      <span className="font-label-caps text-label-caps text-text-dim">
                        GLOBAL CRITIC CODE
                      </span>

                                            <span className="font-metadata text-metadata text-text-main">
                        SECTION § 01—04
                      </span>
                                        </div>

                                        <span className="material-symbols-outlined text-primary text-[24px]">
                      verified
                    </span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Pillars */}
                        <section className="flex flex-col gap-8">
                            <div className="flex items-center justify-between">
                                <h2 className="font-headline-lg text-headline-lg text-text-main">
                                    The Pillars
                                </h2>

                                <span className="font-label-caps text-label-caps text-text-dim uppercase tracking-wider">
                  04 Rules of Engagement
                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Pillar
                                    number="01"
                                    icon="diversity_3"
                                    color="text-primary"
                                    title="Respect the Craft & Diverse Voices"
                                    description="Cinema reflects complex cultural lineages. Scrutinize technique, narrative pacing, and ideological themes aggressively—never attack fellow contributors, actors, or crews. We maintain zero tolerance for hate speech, harassment, bad-faith trolling, or bigotry disguised as critical appraisal."
                                    footer="Tone: Rigorous & Constructive"
                                />

                                <Pillar
                                    number="02"
                                    icon="visibility_off"
                                    color="text-secondary"
                                    title="Tag Spoilers Diligently"
                                    description={
                                        <>
                                            The sanctity of discovery is irreplaceable. Whether
                                            discussing a twist in a 1958 French thriller or a
                                            climactic third-act revelation in a contemporary
                                            premiere, always utilize the{" "}
                                            <code className="font-label-caps text-label-caps text-primary px-1.5 py-0.5 rounded bg-surface-deep">
                                                --spoiler--
                                            </code>{" "}
                                            tag. Untagged pivotal twists are actively suppressed.
                                        </>
                                    }
                                    footer="Action: Mandatory Tagging"
                                />

                                <Pillar
                                    number="03"
                                    icon="edit_note"
                                    color="text-primary"
                                    title="Original Thought & Integrity"
                                    description="Write what you see and feel. Plagiarism, algorithmic automated scraping, uncredited regurgitation of academic papers, and coordinated review bombing are fundamentally antithetical to Cinephile 🎬. Accounts running bot syndicates or spamming 1-star brigades face permanent revocation."
                                    footer="Quality: Authentic Authorship"
                                />

                                <Pillar
                                    number="04"
                                    icon="database"
                                    color="text-secondary"
                                    title="Authentic Catalog Curation"
                                    description="Our archive is maintained by community scholars. When contributing metadata, cinematography credits, restoration notes, or aspect ratio data, cross-reference reliable archival registries (BFI, Criterion, AFI). Spurious or intentionally vandalized entries are purged."
                                    footer="Archival: Verified Ingestion"
                                />
                            </div>
                        </section>

                        {/* Moderation */}
                        <section className="flex flex-col gap-8">
                            <div className="flex flex-col gap-2">
                <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">
                  Protocol & Response
                </span>

                                <h2 className="font-headline-lg text-headline-lg text-text-main">
                                    Moderation & Enforcement
                                </h2>

                                <p className="font-body-sm text-body-sm text-text-dim max-w-2xl">
                                    We employ a calibrated, transparent three-stage moderation
                                    pathway. Every enforcement action is reviewed by human film
                                    editors, never solely dictated by automated scripts.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <ModerationCard
                                    stage="STAGE 01"
                                    icon="info"
                                    iconColor="text-rating-star"
                                    title="Formal Advisory"
                                    description="Issued for minor transgressions like accidental untagged spoilers or mildly unconstructive commentary. The member receives an editor note directly outlining the guideline lapse."
                                />

                                <ModerationCard
                                    stage="STAGE 02"
                                    icon="blur_on"
                                    iconColor="text-secondary-container"
                                    title="Content Obfuscation"
                                    description="Infringing reviews, list descriptions, or comments are obscured behind an editorial filter. Account privileges are restricted to read-only for 7 calendar days while appeals are reviewed."
                                    stageColor="text-secondary"
                                />

                                <ModerationCard
                                    stage="STAGE 03"
                                    icon="block"
                                    iconColor="text-error"
                                    title="Account Suspension"
                                    description="Repeated bad-faith participation, coordinated harassment campaigns, or hate speech results in permanent expulsion, IP blacklisting, and removal of all verified critic accreditation."
                                    stageColor="text-error"
                                />
                            </div>
                        </section>

                        {/* Appeals */}
                        <section className="p-8 rounded-xl bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex flex-col gap-2 max-w-xl">
                                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    gavel
                  </span>

                                    <span className="font-title-md text-title-md text-text-main">
                    Appeals & Editorial Review
                  </span>
                                </div>

                                <p className="font-body-sm text-body-sm text-text-dim leading-relaxed">
                                    Believe your essay was erroneously flagged? We honor
                                    context. Authors can trigger a secondary assessment by our
                                    Cinephile 🎬 Trust Panel within 14 days of any enforcement
                                    decision.
                                </p>
                            </div>

                            <div className="flex items-center gap-6 bg-surface-deep px-6 py-4 rounded-lg self-stretch md:self-auto justify-between md:justify-start">
                                <div className="flex flex-col">
                  <span className="font-label-caps text-label-caps text-text-dim uppercase">
                    Median Review Time
                  </span>

                                    <span className="font-headline-lg text-headline-lg text-primary font-bold">
                    4.2
                    <span className="text-sm font-normal text-on-surface-variant ml-1">
                      hrs
                    </span>
                  </span>
                                </div>

                                <div className="w-px h-10 bg-surface-muted" />

                                <div className="flex flex-col">
                  <span className="font-label-caps text-label-caps text-text-dim uppercase">
                    Human Checked
                  </span>

                                    <span className="font-headline-lg text-headline-lg text-text-main font-bold">
                    100
                    <span className="text-sm font-normal text-on-surface-variant ml-0.5">
                      %
                    </span>
                  </span>
                                </div>
                            </div>
                        </section>

                        {/* Report */}
                        <section className="rounded-xl p-8 md:p-12 bg-surface-deep flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
                            <div className="flex flex-col gap-3 max-w-xl">
                                <div className="inline-flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    shield
                  </span>

                                    <span className="font-label-caps text-label-caps text-primary uppercase tracking-wider font-semibold">
                    Community Watch
                  </span>
                                </div>

                                <h3 className="font-headline-lg text-headline-lg text-text-main">
                                    Witness a breach of conduct?
                                </h3>

                                <p className="font-body-sm text-body-sm text-text-dim leading-relaxed">
                                    Help us safeguard the cinema community. Reports are encrypted
                                    and anonymized. Our dispatchers audit reported entries against
                                    our archival standards around the clock.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSubmitted(false);
                                        setShowModal(true);
                                    }}
                                    className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-primary text-on-primary font-metadata text-metadata font-bold flex items-center justify-center gap-2.5 transition-all duration-200 hover:opacity-95 shadow-[0_0_24px_rgba(67,254,109,0.35)] active:scale-[0.98]"
                                >
                  <span className="material-symbols-outlined text-[20px]">
                    flag
                  </span>

                                    <span>Report a Violation</span>
                                </button>

                                <a
                                    href="#"
                                    className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-surface-muted hover:bg-surface-bright text-text-main font-metadata text-metadata transition-colors flex items-center justify-center gap-2"
                                >
                                    Contact Support

                                    <span className="material-symbols-outlined text-[16px]">
                    arrow_forward
                  </span>
                                </a>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Report Modal */}
                {showModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-deep/80 backdrop-blur-md"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) closeModal();
                        }}
                    >
                        <div className="bg-surface-container max-w-md w-full rounded-xl p-6 shadow-2xl flex flex-col gap-5">

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    report
                  </span>

                                    <h4 className="font-title-md text-title-md text-text-main">
                                        File a Report
                                    </h4>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="text-text-dim hover:text-text-main p-1 rounded"
                                >
                  <span className="material-symbols-outlined text-[20px]">
                    close
                  </span>
                                </button>
                            </div>

                            {!submitted ? (
                                <>
                                    <p className="font-body-sm text-body-sm text-text-dim">
                                        Specify the offending URL or contributor handle.
                                        Submissions are reviewed anonymously by our integrity desk.
                                    </p>

                                    <form
                                        onSubmit={handleSubmit}
                                        className="flex flex-col gap-4"
                                    >
                                        <div className="flex flex-col gap-1.5">
                                            <label
                                                htmlFor="violatorUrl"
                                                className="font-label-caps text-label-caps text-on-surface-variant uppercase"
                                            >
                                                Target URL or Review Link
                                            </label>

                                            <input
                                                id="violatorUrl"
                                                required
                                                type="text"
                                                placeholder="filmbuff.org/film/solaris-1972/review/..."
                                                className="px-3.5 py-2.5 rounded bg-surface-deep text-text-main font-body-sm text-body-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-surface-bright"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label
                                                htmlFor="violationType"
                                                className="font-label-caps text-label-caps text-on-surface-variant uppercase"
                                            >
                                                Pillar Infraction
                                            </label>

                                            <select
                                                id="violationType"
                                                className="px-3.5 py-2.5 rounded bg-surface-deep text-text-main font-body-sm text-body-sm outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="harassment">
                                                    1. Harassment / Bad-faith Critique
                                                </option>
                                                <option value="spoiler">
                                                    2. Untagged Crucial Spoilers
                                                </option>
                                                <option value="plagiarism">
                                                    3. Plagiarism or Bot Activity
                                                </option>
                                                <option value="catalog">
                                                    4. Vandalized Metadata / Inaccurate Credits
                                                </option>
                                                <option value="other">Other Violation</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label
                                                htmlFor="notes"
                                                className="font-label-caps text-label-caps text-on-surface-variant uppercase"
                                            >
                                                Context Notes (Optional)
                                            </label>

                                            <textarea
                                                id="notes"
                                                rows="3"
                                                placeholder="Brief contextual synopsis..."
                                                className="px-3.5 py-2.5 rounded bg-surface-deep text-text-main font-body-sm text-body-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-surface-bright resize-none"
                                            />
                                        </div>

                                        <div className="flex items-center justify-end gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className="px-4 py-2 rounded text-text-dim hover:text-text-main font-metadata text-metadata"
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="submit"
                                                className="px-5 py-2 rounded bg-primary text-on-primary font-metadata text-metadata font-bold hover:opacity-90 transition-opacity"
                                            >
                                                Submit Report
                                            </button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[44px]">
                    check_circle
                  </span>

                                    <h5 className="font-title-md text-title-md text-text-main">
                                        Dispatch Received
                                    </h5>

                                    <p className="font-body-sm text-body-sm text-text-dim">
                                        Our team has initiated an archival integrity audit. Thank
                                        you for safeguarding Cinephile 🎬.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="mt-2 px-4 py-2 rounded bg-surface-muted text-text-main font-metadata text-metadata hover:bg-surface-bright"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

/* ---------- Reusable Components ---------- */

const Pillar = ({
                    number,
                    icon,
                    color,
                    title,
                    description,
                    footer,
                }) => {
    return (
        <article className="group p-8 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all duration-300 flex flex-col justify-between relative overflow-hidden shadow-sm">

            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
        <span className="font-display-lg text-display-lg text-text-main font-bold">
          {number}
        </span>
            </div>

            <div className="flex flex-col gap-4">
                <div
                    className={`w-10 h-10 rounded-lg bg-surface-deep flex items-center justify-center ${color}`}
                >
          <span className="material-symbols-outlined text-[22px]">
            {icon}
          </span>
                </div>

                <h3
                    className={`font-title-md text-title-md text-text-main group-hover:${color} transition-colors`}
                >
                    {title}
                </h3>

                <p className="font-body-sm text-body-sm text-text-dim leading-relaxed">
                    {description}
                </p>
            </div>

            <div className="mt-6 pt-4 flex items-center gap-2">
        <span
            className={`inline-block w-1.5 h-1.5 rounded-full ${color.replace(
                "text-",
                "bg-"
            )}`}
        />

                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
          {footer}
        </span>
            </div>
        </article>
    );
};

const ModerationCard = ({
                            stage,
                            icon,
                            iconColor,
                            title,
                            description,
                            stageColor = "text-on-surface",
                        }) => {
    return (
        <div className="p-6 rounded-xl bg-surface-container-low flex flex-col gap-4">
            <div className="flex items-center justify-between">
        <span
            className={`font-label-caps text-label-caps px-2.5 py-1 rounded bg-surface-muted ${stageColor} font-semibold`}
        >
          {stage}
        </span>

                <span
                    className={`material-symbols-outlined ${iconColor} text-[20px]`}
                >
          {icon}
        </span>
            </div>

            <h4 className="font-title-md text-title-md text-text-main">
                {title}
            </h4>

            <p className="font-body-sm text-body-sm text-text-dim leading-relaxed">
                {description}
            </p>
        </div>
    );
};

export default CommunityGuidelines;