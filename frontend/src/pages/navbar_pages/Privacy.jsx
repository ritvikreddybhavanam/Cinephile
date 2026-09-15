import { useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

const Privacy = () => {
    useEffect(() => {
        const sections = document.querySelectorAll('article[id^="section-"]');
        const navLinks = document.querySelectorAll(".toc-link");

        const handleScroll = () => {
            let currentSection = "";

            sections.forEach((section) => {
                const sectionTop = section.offsetTop - 120;

                if (window.scrollY >= sectionTop) {
                    currentSection = section.getAttribute("id");
                }
            });

            navLinks.forEach((link) => {
                const href = link.getAttribute("href").replace("#", "");

                if (href === currentSection) {
                    link.classList.add("bg-surface-container", "text-text-main");
                    link.classList.remove("text-on-surface-variant");
                } else {
                    link.classList.remove("bg-surface-container", "text-text-main");
                    link.classList.add("text-on-surface-variant");
                }
            });
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div className="bg-surface text-on-surface antialiased min-h-screen">
            <Navbar />

            <main className="w-full pt-16 bg-surface min-h-[calc(100vh-280px)]">
                <div className="flex flex-col w-full">

                    {/* Ambient Glow */}
                    <div className="relative w-full overflow-hidden">
                        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

                        <div className="max-w-6xl mx-auto px-margin-sm md:px-margin-md py-12 lg:py-20 w-full relative z-10">

                            {/* Breadcrumb */}
                            <div className="flex items-center gap-3 mb-6">
                                <a
                                    href="#"
                                    className="font-label-caps text-label-caps text-text-dim hover:text-primary transition-colors flex items-center gap-1.5"
                                >
                  <span className="material-symbols-outlined text-[16px]">
                    arrow_back
                  </span>
                                    <span>LEGAL REPOSITORY</span>
                                </a>

                                <span className="text-surface-muted text-[10px]">•</span>

                                <span className="font-label-caps text-label-caps text-on-surface-variant">
                  DOC REF // FB-POL-2024-V4
                </span>
                            </div>

                            {/* Header */}
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12">
                                <div className="space-y-4 max-w-2xl">
                                    <h1 className="font-display-lg text-display-lg text-text-main tracking-tight">
                                        Privacy Policy
                                    </h1>

                                    <p className="font-body-lg text-body-lg text-text-dim leading-relaxed">
                                        Our architectural commitment to protecting your film
                                        curation habits, critical thoughts, and digital Cinephile 🎬
                                        footprint.
                                    </p>
                                </div>

                                <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 bg-surface-container-low p-4 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />

                                        <span className="font-label-caps text-label-caps text-text-dim uppercase">
                      Last Updated:{" "}
                                            <strong className="text-text-main font-semibold">
                        October 2024
                      </strong>
                    </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-text-dim text-[14px]">
                      event_available
                    </span>

                                        <span className="font-label-caps text-label-caps text-text-dim uppercase">
                      Effective:{" "}
                                            <strong className="text-text-main font-semibold">
                        January 1, 2024
                      </strong>
                    </span>
                                    </div>
                                </div>
                            </div>

                            {/* Plain English Manifesto */}
                            <div className="bg-surface-container rounded-xl p-6 sm:p-8 mb-16 shadow-md relative overflow-hidden">
                                <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />

                                <div className="flex flex-col lg:flex-row gap-8 lg:items-center justify-between relative z-10">
                                    <div className="space-y-3 max-w-xl">
                                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-muted text-primary font-label-caps text-label-caps">
                      <span
                          className="material-symbols-outlined text-[15px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        verified_user
                      </span>
                                            PLAIN ENGLISH MANIFESTO
                                        </div>

                                        <h2 className="font-title-md text-title-md text-text-main">
                                            A cinematic diary built on uncompromising trust.
                                        </h2>

                                        <p className="font-body-sm text-body-sm text-text-dim leading-relaxed">
                                            We operate Cinephile 🎬 as fellow film collectors. We don't
                                            monetize your midnight re-watches, sell viewing habits to
                                            third-party ad brokers, or lock away your archives. Your
                                            taste is personal, deliberate, and entirely yours.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">

                                        <PrivacyPillar
                                            icon="block"
                                            title="Zero Data Brokerage"
                                            text="We never sell logs, ratings, or watchlists to advertisers."
                                            color="text-primary"
                                        />

                                        <PrivacyPillar
                                            icon="visibility_off"
                                            title="Granular Cloaking"
                                            text="Set individual diary entries or whole vaults to private."
                                            color="text-secondary-container"
                                        />

                                        <PrivacyPillar
                                            icon="file_download"
                                            title="Full Portability"
                                            text="One-click JSON & CSV exports of your entire film history."
                                            color="text-primary-fixed-dim"
                                        />

                                    </div>
                                </div>
                            </div>

                            {/* Main Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                                {/* Table of Contents */}
                                <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                                    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">

                    <span className="font-label-caps text-label-caps text-text-dim tracking-wider uppercase block mb-4">
                      Document Sections
                    </span>

                                        <nav className="flex flex-col space-y-1 text-left">
                                            <TOCLink number="01" text="Information We Collect" id="section-1" />
                                            <TOCLink number="02" text="How We Use Your Data" id="section-2" />
                                            <TOCLink number="03" text="Public vs. Private Visibility" id="section-3" />
                                            <TOCLink number="04" text="Cookies & Streaming Sync" id="section-4" />
                                            <TOCLink number="05" text="Your Rights & Deletion" id="section-5" />
                                            <TOCLink number="06" text="Contact & DPO Inquiries" id="section-6" />
                                        </nav>

                                        {/* Download */}
                                        <div className="mt-8 pt-6 bg-surface-container-low/50 p-4 rounded-lg flex flex-col gap-3">
                                            <div className="flex items-center gap-2 text-text-main">
                        <span className="material-symbols-outlined text-[18px] text-primary">
                          download
                        </span>

                                                <span className="font-metadata text-metadata font-semibold">
                          Download Legal Copy
                        </span>
                                            </div>

                                            <p className="font-body-sm text-body-sm text-text-dim text-xs">
                                                Review this document in portable archival formats for
                                                compliance or record-keeping.
                                            </p>

                                            <div className="flex items-center gap-2 pt-1">
                                                <button
                                                    className="bg-surface-muted hover:bg-surface-container-highest text-text-main px-3 py-1.5 rounded-lg font-label-caps text-label-caps transition-colors"
                                                    type="button"
                                                >
                                                    PDF (340 KB)
                                                </button>

                                                <button
                                                    className="bg-surface-muted hover:bg-surface-container-highest text-text-main px-3 py-1.5 rounded-lg font-label-caps text-label-caps transition-colors"
                                                    type="button"
                                                >
                                                    MARKDOWN
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </aside>

                                {/* Legal Content */}
                                <div className="lg:col-span-8 flex flex-col space-y-16">

                                    {/* Section 1 */}
                                    <section
                                        id="section-1"
                                        className="scroll-mt-24 space-y-6"
                                    >
                                        <SectionHeader number="01" />

                                        <h2 className="font-headline-lg text-headline-lg text-text-main">
                                            Information We Collect
                                        </h2>

                                        <div className="font-body-lg text-body-lg text-on-surface space-y-4 leading-relaxed">
                                            <p>
                                                When you create an account, log your screenings,
                                                publish long-form retrospective reviews, or sync
                                                streaming providers, Cinephile 🎬 gathers distinct
                                                categories of user records necessary to render your
                                                Cinephile 🎬 workspace.
                                            </p>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">

                                                <DataCard
                                                    label="IDENTITY"
                                                    title="Account Credentials"
                                                    text="Email, username, password hashes (via Argon2id), avatar, and public bio."
                                                    status="MANDATORY"
                                                    color="text-primary"
                                                />

                                                <DataCard
                                                    label="CURATION"
                                                    title="Watchlogs & Reviews"
                                                    text="Film logs, 5-star ratings, timestamps, custom lists, and re-watch markers."
                                                    status="USER GENERATED"
                                                    color="text-secondary"
                                                />

                                                <DataCard
                                                    label="SYSTEM"
                                                    title="Device Telemetry"
                                                    text="IP addresses (truncated after 14 days), browser agent, and crash performance logs."
                                                    status="AUTOMATED"
                                                    color="text-tertiary"
                                                />

                                            </div>

                                            <p className="font-body-sm text-body-sm text-text-dim pt-2">
                                                We do not request, process, or store sensitive financial
                                                data. All subscription transactions are mediated through
                                                PCI-DSS Level 1 compliant gateway partners with tokenized
                                                billing representations.
                                            </p>
                                        </div>
                                    </section>

                                    {/* Section 2 */}
                                    <section
                                        id="section-2"
                                        className="scroll-mt-24 space-y-6"
                                    >
                                        <SectionHeader number="02" />

                                        <h2 className="font-headline-lg text-headline-lg text-text-main">
                                            How We Use Your Data
                                        </h2>

                                        <div className="font-body-lg text-body-lg text-on-surface space-y-4 leading-relaxed">
                                            <p>
                                                Cinephile 🎬 utilizes gathered information to engineer a
                                                responsive, deeply tailored film discovery engine and
                                                maintain community integrity.
                                            </p>

                                            <div className="space-y-3 font-body-sm text-body-sm text-on-surface-variant">

                                                <UseCard
                                                    icon="auto_awesome"
                                                    title="Algorithmic Recommendation Engine"
                                                >
                                                    Calculating auteur affinities, genre overlaps, and
                                                    stylistic recommendations based on your historical
                                                    ratings distribution and diary cadence.
                                                </UseCard>

                                                <UseCard
                                                    icon="query_stats"
                                                    title="Aggregated Predictive Box Office & Reception Models"
                                                >
                                                    De-identified, anonymized population metrics
                                                    calculated over millions of data points to evaluate
                                                    box office momentum and festival consensus. No single
                                                    user identity is traceable in these data sets.
                                                </UseCard>

                                                <UseCard
                                                    icon="shield"
                                                    title="Abuse Prevention & Review Bombing Mitigation"
                                                >
                                                    Detecting coordinated astroturfing campaigns,
                                                    synthetic bot accounts, and spam syndication through
                                                    statistical analysis of creation timelines.
                                                </UseCard>

                                            </div>
                                        </div>
                                    </section>

                                    {/* Section 3 */}
                                    <section
                                        id="section-3"
                                        className="scroll-mt-24 space-y-6"
                                    >
                                        <SectionHeader number="03" />

                                        <h2 className="font-headline-lg text-headline-lg text-text-main">
                                            Public vs. Private Visibility
                                        </h2>

                                        <div className="font-body-lg text-body-lg text-on-surface space-y-4 leading-relaxed">
                                            <p>
                                                By nature, Cinephile 🎬 offers social curation, but privacy
                                                is the sovereign choice of each member. You hold
                                                complete administrative autonomy over what the Cinephile 🎬
                                                collective sees.
                                            </p>

                                            <div className="bg-surface-container-low rounded-xl p-6 space-y-4">
                        <span className="font-label-caps text-label-caps text-text-dim block">
                          CURATOR VISIBILITY CONTROLS
                        </span>

                                                <div className="space-y-3">

                                                    <VisibilityRow
                                                        icon="bookmark_border"
                                                        title="Default Watchlist Status"
                                                        value="Configurable: Public / Unlisted / Secret"
                                                        color="text-primary"
                                                    />

                                                    <VisibilityRow
                                                        icon="rate_review"
                                                        title="Diary Timestamps & Venue Details"
                                                        value="Private by Default"
                                                        color="text-secondary"
                                                    />

                                                    <VisibilityRow
                                                        icon="lock"
                                                        title="Account Cloak Mode (Private Profile)"
                                                        value="Available to All Members"
                                                        color="text-tertiary"
                                                        highlight
                                                    />

                                                </div>
                                            </div>

                                            <p className="font-body-sm text-body-sm text-text-dim">
                                                Enabling <strong>Cloak Mode</strong> immediately
                                                terminates RSS feeds associated with your profile,
                                                restricts search index crawlers (via{" "}
                                                <code>noindex</code> headers), and limits diary
                                                visibility strictly to approved mutual followers.
                                            </p>
                                        </div>
                                    </section>

                                    {/* Section 4 */}
                                    <section
                                        id="section-4"
                                        className="scroll-mt-24 space-y-6"
                                    >
                                        <SectionHeader number="04" />

                                        <h2 className="font-headline-lg text-headline-lg text-text-main">
                                            Cookies & Streaming Sync
                                        </h2>

                                        <div className="font-body-lg text-body-lg text-on-surface space-y-4 leading-relaxed">
                                            <p>
                                                Cinephile 🎬 connects with premier cinematic archival APIs,
                                                including <strong>The Movie Database (TMDb)</strong>{" "}
                                                and <strong>JustWatch</strong>, to provide real-time
                                                regional streaming availability across platforms
                                                (Criterion Channel, MUBI, Max, Apple TV, and localized
                                                physical media vendors).
                                            </p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">

                                                <InfoCard
                                                    icon="cookie"
                                                    title="Essential Session Cookies"
                                                    color="text-primary"
                                                >
                                                    Strictly functional tokens enabling secure stateless
                                                    authentication, active dark-mode state retention, and
                                                    CSRF protection tokens. We store zero advertising
                                                    tracking beacons.
                                                </InfoCard>

                                                <InfoCard
                                                    icon="sync_alt"
                                                    title="External Streaming APIs"
                                                    color="text-secondary"
                                                >
                                                    When you link streaming provider preferences, your
                                                    selections are queried client-side against TMDb and
                                                    JustWatch APIs. No credentials to external streaming
                                                    accounts are ever ingested or queried.
                                                </InfoCard>

                                            </div>
                                        </div>
                                    </section>

                                    {/* Section 5 */}
                                    <section
                                        id="section-5"
                                        className="scroll-mt-24 space-y-6"
                                    >
                                        <SectionHeader number="05" />

                                        <h2 className="font-headline-lg text-headline-lg text-text-main">
                                            Your Rights & Data Deletion
                                        </h2>

                                        <div className="font-body-lg text-body-lg text-on-surface space-y-4 leading-relaxed">
                                            <p>
                                                Under the European General Data Protection Regulation
                                                (GDPR), California Consumer Privacy Act (CCPA/CPRA), and
                                                international privacy frameworks, Cinephile 🎬 provides
                                                uniform guarantees universally:
                                            </p>

                                            <div className="space-y-4 bg-surface-container-lowest p-6 rounded-xl">

                                                <RightCard
                                                    icon="file_open"
                                                    title="Right to Portability (One-Click Archive)"
                                                >
                                                    Instantly package your complete history—including
                                                    reviews, diary entries, custom list curation, likes,
                                                    and followers—into open format <code>.JSON</code> and
                                                    standard Letterboxd/IMDb compatible{" "}
                                                    <code>.CSV</code> archives directly from your Account
                                                    Dashboard.
                                                </RightCard>

                                                <div className="h-[1px] bg-surface-container w-full" />

                                                <RightCard
                                                    icon="delete_forever"
                                                    title="Right to Erasure (Complete Account Expungement)"
                                                    danger
                                                >
                                                    Triggering account destruction initiates an immediate
                                                    soft-delete window of 72 hours, followed by immutable
                                                    purging from production relational databases and
                                                    automated cold snapshot expiration within 30 days.
                                                </RightCard>

                                            </div>

                                            <div className="bg-surface-container p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                                                <div className="space-y-1 text-center sm:text-left">
                          <span className="font-title-md text-metadata font-bold text-text-main">
                            Ready to take your data?
                          </span>

                                                    <p className="font-body-sm text-body-sm text-text-dim">
                                                        Export your entire film diary archive instantly to
                                                        your device.
                                                    </p>
                                                </div>

                                                <button
                                                    className="bg-primary-container hover:bg-primary text-on-primary-container font-headline-lg text-label-caps uppercase px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 shadow-sm shrink-0"
                                                    type="button"
                                                >
                          <span className="material-symbols-outlined text-[16px]">
                            archive
                          </span>
                                                    REQUEST DATA DUMP
                                                </button>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Section 6 */}
                                    <section
                                        id="section-6"
                                        className="scroll-mt-24 space-y-6"
                                    >
                                        <SectionHeader number="06" />

                                        <h2 className="font-headline-lg text-headline-lg text-text-main">
                                            Contact Information for Data Inquiries
                                        </h2>

                                        <div className="font-body-lg text-body-lg text-on-surface space-y-4 leading-relaxed">
                                            <p>
                                                If you have questions, regulatory petitions,
                                                vulnerability disclosures, or requests to exercise your
                                                privacy rights, our designated Data Protection Officer
                                                (DPO) can be engaged directly.
                                            </p>

                                            <div className="bg-surface-container rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start justify-between shadow-md">

                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-primary">
                            <span className="material-symbols-outlined text-[20px]">
                              mark_email_read
                            </span>

                                                        <span className="font-label-caps text-label-caps uppercase font-semibold">
                              Direct Legal Channel
                            </span>
                                                    </div>

                                                    <h3 className="font-display-lg text-title-md text-text-main">
                                                        privacy@filmbuff.app
                                                    </h3>

                                                    <p className="font-body-sm text-body-sm text-text-dim max-w-md">
                                                        Cinephile 🎬 Inc. Data Protection Office
                                                        <br />
                                                        Attn: Privacy & Trust Counsel
                                                        <br />
                                                        900 Hollywood Boulevard, Suite 400
                                                        <br />
                                                        Los Angeles, CA 90028, United States
                                                    </p>
                                                </div>

                                                <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                          <span className="font-label-caps text-label-caps text-text-dim uppercase">
                            Standard Response SLA
                          </span>

                                                    <span className="font-headline-lg text-headline-lg text-primary">
                            48 Hours
                          </span>

                                                    <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">
                            For all verified identity requests
                          </span>
                                                </div>

                                            </div>
                                        </div>
                                    </section>

                                </div>
                            </div>

                            {/* Revision Footer */}
                            <div className="mt-20 pt-8 bg-surface-container-lowest p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-text-dim">
                                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    gavel
                  </span>

                                    <span className="font-metadata text-metadata">
                    Cinephile 🎬 Global Privacy Framework v4.2 // Encrypted Storage
                    Standard
                  </span>
                                </div>

                                <a
                                    className="font-label-caps text-label-caps text-text-dim hover:text-primary transition-colors flex items-center gap-1"
                                    href="#section-1"
                                >
                                    TOP OF DOCUMENT
                                    <span className="material-symbols-outlined text-[14px]">
                    arrow_upward
                  </span>
                                </a>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

/* ---------- Components ---------- */

const SectionHeader = ({ number }) => (
    <div className="flex items-center gap-3">
    <span className="font-label-caps text-label-caps text-primary bg-surface-container px-2 py-0.5 rounded">
      SECTION {number}
    </span>

        <div className="h-[1px] flex-1 bg-surface-container" />
    </div>
);

const TOCLink = ({ number, text, id }) => (
    <a
        className="toc-link group flex items-center justify-between py-2 px-3 rounded-lg text-on-surface-variant hover:text-text-main hover:bg-surface-container transition-all"
        href={`#${id}`}
    >
    <span className="font-body-sm text-body-sm flex items-center gap-2.5">
      <span className="font-label-caps text-label-caps text-text-dim group-hover:text-primary">
        {number}
      </span>

        {text}
    </span>

        <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 text-primary transition-opacity">
      chevron_right
    </span>
    </a>
);

const PrivacyPillar = ({ icon, title, text, color }) => (
    <div className="bg-surface-container-low p-4 rounded-lg flex flex-col gap-2 min-w-[170px]">
    <span className={`material-symbols-outlined ${color} text-[24px]`}>
      {icon}
    </span>

        <span className="font-metadata text-metadata text-text-main font-semibold">
      {title}
    </span>

        <span className="font-body-sm text-body-sm text-text-dim text-xs">
      {text}
    </span>
    </div>
);

const DataCard = ({
                      label,
                      title,
                      text,
                      status,
                      color,
                  }) => (
    <div className="bg-surface-container p-5 rounded-xl flex flex-col justify-between">
        <div className="space-y-2">
      <span className={`font-label-caps text-label-caps ${color}`}>
        {label}
      </span>

            <h3 className="font-title-md text-metadata font-semibold text-text-main">
                {title}
            </h3>

            <p className="font-body-sm text-body-sm text-text-dim text-xs">
                {text}
            </p>
        </div>

        <span className="font-label-caps text-label-caps text-on-surface-variant pt-4 text-[10px]">
      {status}
    </span>
    </div>
);

const UseCard = ({ icon, title, children }) => (
    <div className="flex items-start gap-3 bg-surface-container-lowest p-4 rounded-lg">
    <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
      {icon}
    </span>

        <div>
            <strong className="text-text-main font-semibold block mb-0.5">
                {title}
            </strong>

            {children}
        </div>
    </div>
);

const VisibilityRow = ({
                           icon,
                           title,
                           value,
                           color,
                           highlight = false,
                       }) => (
    <div className="flex items-center justify-between gap-4 p-3 bg-surface-container rounded-lg">
        <div className="flex items-center gap-3">
      <span className={`material-symbols-outlined ${color}`}>
        {icon}
      </span>

            <span className="font-body-sm text-body-sm text-text-main">
        {title}
      </span>
        </div>

        <span
            className={`font-label-caps text-label-caps px-2 py-1 rounded ${
                highlight
                    ? "bg-primary-container text-on-primary-container font-semibold"
                    : "bg-surface-muted text-on-surface"
            }`}
        >
      {value}
    </span>
    </div>
);

const InfoCard = ({ icon, title, color, children }) => (
    <div className="bg-surface-container p-5 rounded-xl space-y-3">
        <div className={`flex items-center gap-2 ${color}`}>
      <span className="material-symbols-outlined text-[20px]">
        {icon}
      </span>

            <span className="font-metadata text-metadata font-semibold">
        {title}
      </span>
        </div>

        <p className="font-body-sm text-body-sm text-text-dim">
            {children}
        </p>
    </div>
);

const RightCard = ({
                       icon,
                       title,
                       danger = false,
                       children,
                   }) => (
    <div className="flex items-start gap-4">
        <div
            className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                danger
                    ? "bg-error-container text-on-error-container"
                    : "bg-surface-muted text-text-main"
            }`}
        >
      <span className="material-symbols-outlined text-[18px]">
        {icon}
      </span>
        </div>

        <div className="space-y-1">
            <h3 className="font-title-md text-metadata font-semibold text-text-main">
                {title}
            </h3>

            <p className="font-body-sm text-body-sm text-text-dim">
                {children}
            </p>
        </div>
    </div>
);

export default Privacy;