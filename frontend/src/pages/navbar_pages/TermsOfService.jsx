import React, { useEffect } from "react";
import Navbar from "../../components/layout/Navbar.jsx";
import Footer from "../../components/layout/Footer.jsx";

const TermsOfService = () => {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute("id");

                        document
                            .querySelectorAll("#legal-toc .toc-link")
                            .forEach((link) => {
                                if (link.getAttribute("href") === `#${id}`) {
                                    link.classList.add(
                                        "bg-surface-container",
                                        "text-text-main"
                                    );
                                    link.classList.remove("text-text-dim");
                                } else {
                                    link.classList.remove(
                                        "bg-surface-container",
                                        "text-text-main"
                                    );
                                    link.classList.add("text-text-dim");
                                }
                            });
                    }
                });
            },
            {
                rootMargin: "-20% 0px -70% 0px",
            }
        );

        const sections = document.querySelectorAll("article section[id]");

        sections.forEach((section) => observer.observe(section));

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div className="dark">
            <Navbar />

            <main className="w-full pt-16 bg-surface min-h-[calc(100vh-280px)]">
                <div className="flex flex-col w-full">

                    {/* Hero Section */}
                    <section className="relative w-full overflow-hidden bg-surface py-16 md:py-24">
                        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

                        <div className="max-w-7xl mx-auto px-margin-sm md:px-margin-md relative z-10">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12">
                                <div className="max-w-3xl flex flex-col gap-4">
                                    <div className="inline-flex items-center gap-2.5 self-start bg-surface-container px-3.5 py-1.5 rounded-full">
                                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#00e054]"></span>

                                        <span className="font-label-caps text-label-caps uppercase tracking-wider text-primary">
                      Version 2.4 • Effective October 2024
                    </span>
                                    </div>

                                    <h1 className="font-display-lg text-display-lg text-text-main tracking-tight font-extrabold">
                                        Terms of Service
                                    </h1>

                                    <p className="font-body-lg text-body-lg text-text-dim max-w-2xl leading-relaxed">
                                        The agreement governing your use of the Cinephile 🎬 platform,
                                        community Cinephile 🎬 spaces, and cinema archive services.
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 bg-surface-container-low px-5 py-4 rounded-xl self-start md:self-auto">
                                    <div className="w-10 h-10 rounded-lg bg-surface-muted flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[22px]">
                      gavel
                    </span>
                                    </div>

                                    <div className="flex flex-col">
                    <span className="font-metadata text-metadata text-text-main font-semibold">
                      Legal Custodian
                    </span>

                                        <span className="font-label-caps text-label-caps text-text-dim">
                      Cinephile 🎬 Archive Inc.
                    </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
                                <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3.5">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    verified_user
                  </span>

                                    <div className="flex flex-col">
                    <span className="font-label-caps text-label-caps text-text-dim uppercase tracking-wider">
                      Review Ownership
                    </span>

                                        <span className="font-metadata text-metadata text-text-main font-medium">
                      100% Retained by Author
                    </span>
                                    </div>
                                </div>

                                <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3.5">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    lock_clock
                  </span>

                                    <div className="flex flex-col">
                    <span className="font-label-caps text-label-caps text-text-dim uppercase tracking-wider">
                      Data Protection
                    </span>

                                        <span className="font-metadata text-metadata text-text-main font-medium">
                      Standard 256-bit AES
                    </span>
                                    </div>
                                </div>

                                <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3.5">
                  <span className="material-symbols-outlined text-tertiary-container text-[20px]">
                    replay
                  </span>

                                    <div className="flex flex-col">
                    <span className="font-label-caps text-label-caps text-text-dim uppercase tracking-wider">
                      Patron Renewal
                    </span>

                                        <span className="font-metadata text-metadata text-text-main font-medium">
                      Monthly / Cancel Anytime
                    </span>
                                    </div>
                                </div>

                                <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3.5">
                  <span className="material-symbols-outlined text-primary-fixed text-[20px]">
                    public
                  </span>

                                    <div className="flex flex-col">
                    <span className="font-label-caps text-label-caps text-text-dim uppercase tracking-wider">
                      API Governance
                    </span>

                                        <span className="font-metadata text-metadata text-text-main font-medium">
                      Rate Limits Enforced
                    </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Content */}
                    <section className="w-full bg-surface py-10">
                        <div className="max-w-7xl mx-auto px-margin-sm md:px-margin-md">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                                {/* Sidebar */}
                                <aside className="hidden lg:block lg:col-span-4">
                                    <div className="sticky top-24 bg-surface-container-low rounded-xl p-6 flex flex-col gap-6 shadow-md">

                                        <div className="flex items-center justify-between">
                      <span className="font-label-caps text-label-caps uppercase tracking-wider text-text-dim">
                        Document Index
                      </span>

                                            <span className="font-label-caps text-label-caps text-primary bg-surface-container px-2 py-0.5 rounded">
                        7 Clauses
                      </span>
                                        </div>

                                        <nav
                                            className="flex flex-col gap-1.5"
                                            id="legal-toc"
                                        >
                                            {[
                                                ["01", "acceptance", "Acceptance of Terms"],
                                                ["02", "accounts", "User Accounts & Security"],
                                                ["03", "community", "Community Conduct & Content"],
                                                ["04", "metadata", "Film Metadata & IP"],
                                                ["05", "subscriptions", "Pro & Patron Subscriptions"],
                                                ["06", "liability", "Limitation of Liability"],
                                                ["07", "governing-law", "Governing Law & Disputes"],
                                            ].map(([number, id, title]) => (
                                                <a
                                                    key={id}
                                                    className="toc-link group flex items-center gap-3 px-3 py-2 rounded-lg text-text-dim hover:text-text-main hover:bg-surface-container transition-all"
                                                    href={`#${id}`}
                                                >
                          <span className="font-label-caps text-label-caps text-primary group-hover:translate-x-0.5 transition-transform">
                            {number}
                          </span>

                                                    <span className="font-metadata text-metadata">
                            {title}
                          </span>
                                                </a>
                                            ))}
                                        </nav>

                                        <div className="pt-4 bg-surface-container p-4 rounded-lg flex flex-col gap-2">
                      <span className="font-label-caps text-label-caps text-text-dim uppercase">
                        Legal Inquiries
                      </span>

                                            <p className="font-body-sm text-body-sm text-text-dim leading-snug">
                                                Need specific clarification on our archival license?
                                            </p>

                                            <a
                                                className="font-metadata text-metadata text-primary hover:underline self-start pt-1"
                                                href="mailto:legal@filmbuff.app"
                                            >
                                                legal@filmbuff.app →
                                            </a>
                                        </div>
                                    </div>
                                </aside>

                                {/* Article */}
                                <article className="lg:col-span-8 flex flex-col gap-16 max-w-2xl text-on-surface">

                                    <section
                                        className="scroll-mt-24 flex flex-col gap-4"
                                        id="acceptance"
                                    >
                                        <SectionHeader
                                            number="01"
                                            title="Acceptance of Terms"
                                        />

                                        <p className="font-body-lg text-body-lg text-text-dim leading-relaxed">
                                            By accessing, browsing, creating an account on, or
                                            integrating with the Cinephile 🎬 web application, mobile
                                            clients, and connected Application Programming Interfaces
                                            (“APIs”), you acknowledge that you have read, understood,
                                            and agree to be bound by these Terms of Service.
                                        </p>

                                        <p className="font-body-lg text-body-lg text-text-dim leading-relaxed">
                                            If you are accepting these terms on behalf of a production
                                            company, film festival, publication, or other legal entity,
                                            you represent and warrant that you possess full authority
                                            to bind said entity to these terms. If you do not accept
                                            these terms in their entirety, you must discontinue
                                            platform use immediately.
                                        </p>

                                        <InfoBox
                                            icon="terminal"
                                            title="API & Automated Access Rule"
                                        >
                                            Scraping platform assets without an authenticated Patron
                                            API token or outside declared rate limits is explicitly
                                            prohibited.
                                        </InfoBox>
                                    </section>

                                    <section
                                        className="scroll-mt-24 flex flex-col gap-4"
                                        id="accounts"
                                    >
                                        <SectionHeader
                                            number="02"
                                            title="User Accounts & Security"
                                        />

                                        <p className="font-body-lg text-body-lg text-text-dim leading-relaxed">
                                            To log film diary entries, publish critical reviews,
                                            compile curated lists, and interact with the Cinephile 🎬
                                            community, you must establish an account. You agree to
                                            provide accurate, truthful, and up-to-date credential
                                            information during setup.
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
                                            <InfoCard
                                                title="Account Safeguards"
                                                text="You bear exclusive responsibility for maintaining the confidentiality of your credentials and all actions taken via your session."
                                            />

                                            <InfoCard
                                                title="Two-Factor Authentication"
                                                text="Mandatory for all verified critics, festival programmers, and platform patrons with write permissions on curated indexes."
                                                secondary
                                            />
                                        </div>

                                        <p className="font-body-lg text-body-lg text-text-dim leading-relaxed">
                                            Notify{" "}
                                            <span className="text-primary font-metadata text-metadata">
                        security@filmbuff.app
                      </span>{" "}
                                            without delay if you detect any unauthorized breach or
                                            credential compromise. Cinephile 🎬 cannot and will not be
                                            liable for losses arising from your failure to safeguard
                                            authentication factors.
                                        </p>
                                    </section>

                                    <section
                                        className="scroll-mt-24 flex flex-col gap-4"
                                        id="community"
                                    >
                                        <SectionHeader
                                            number="03"
                                            title="Community Conduct & Content Ownership"
                                        />

                                        <p className="font-body-lg text-body-lg text-text-dim leading-relaxed">
                                            Cinephile 🎬 is founded on rigorous, respectful dialogue
                                            among cinema enthusiasts. We defend freedom of critical
                                            expression while maintaining strict barriers against
                                            malicious disruption.
                                        </p>

                                        <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-4">
                      <span className="font-metadata text-metadata text-text-main font-semibold uppercase tracking-wider">
                        The Author-First Guarantee
                      </span>

                                            <p className="font-body-sm text-body-sm text-text-dim leading-relaxed">
                                                <strong className="text-text-main">
                                                    Your reviews belong entirely to you.
                                                </strong>{" "}
                                                You retain full copyright ownership of all original
                                                reviews, essays, ratings, and list commentaries you
                                                author on Cinephile 🎬.
                                            </p>

                                            <p className="font-body-sm text-body-sm text-text-dim leading-relaxed">
                                                By publishing, you grant Cinephile 🎬 a non-exclusive,
                                                worldwide, royalty-free license to display, index,
                                                format, and redistribute your public content across the
                                                platform and our search engines solely for the purpose
                                                of operating and promoting the community.
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-2 pt-2">
                      <span className="font-label-caps text-label-caps text-text-dim uppercase tracking-wider">
                        Unacceptable Behaviors
                      </span>

                                            <ul className="flex flex-col gap-2.5 font-body-sm text-body-sm text-text-dim">
                                                {[
                                                    "Review bombing, coordinated rating manipulation, or automated bot campaigns.",
                                                    "Harassment, hate speech, doxxing, or personal attacks directed at critics or film practitioners.",
                                                    "Publishing unflagged narrative spoilers without our platform standard spoiler warning wrapper.",
                                                ].map((item) => (
                                                    <li
                                                        key={item}
                                                        className="flex items-start gap-2.5"
                                                    >
                            <span className="material-symbols-outlined text-error text-[18px] mt-0.5">
                              block
                            </span>

                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </section>

                                    <section
                                        className="scroll-mt-24 flex flex-col gap-4"
                                        id="metadata"
                                    >
                                        <SectionHeader
                                            number="04"
                                            title="Film Metadata & Intellectual Property"
                                        />

                                        <p className="font-body-lg text-body-lg text-text-dim leading-relaxed">
                                            Cinephile 🎬 synthesizes data from varied bibliographic and
                                            cinema repositories. All movie posters, stills,
                                            promotional backdrops, and studio identifiers remain the
                                            copyrighted intellectual property of their respective
                                            copyright holders, distributors, and production houses.
                                        </p>

                                        <div className="bg-surface-container-low p-5 rounded-xl flex items-center justify-between gap-6">
                                            <div className="flex flex-col gap-1">
                        <span className="font-metadata text-metadata text-text-main font-semibold">
                          TMDb & Archival Acknowledgement
                        </span>

                                                <p className="font-body-sm text-body-sm text-text-dim leading-normal">
                                                    Certain factual metadata, including cast listings,
                                                    release dates, and synopses, is powered by The Movie
                                                    Database (TMDb) API but is not endorsed or certified
                                                    by TMDb.
                                                </p>
                                            </div>

                                            <span className="font-label-caps text-label-caps text-primary px-3 py-1.5 bg-surface-container rounded-lg shrink-0">
                        TMDB API V3
                      </span>
                                        </div>

                                        <p className="font-body-lg text-body-lg text-text-dim leading-relaxed">
                                            The Cinephile 🎬 name, stylized logotype, curated index
                                            algorithms, user interface layouts, and custom codebases
                                            are the exclusive proprietary property of Cinephile 🎬 Inc.
                                        </p>
                                    </section>

                                    <section
                                        className="scroll-mt-24 flex flex-col gap-4"
                                        id="subscriptions"
                                    >
                                        <SectionHeader
                                            number="05"
                                            title="Pro & Patron Subscriptions"
                                        />

                                        <p className="font-body-lg text-body-lg text-text-dim leading-relaxed">
                                            Cinephile 🎬 offers premium tier memberships (“Pro” and
                                            “Patron”) providing advanced analytics, personalized
                                            year-in-review compilations, ad-free viewing, and
                                            prioritized feature requests.
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
                                            <SubscriptionCard
                                                title="Billing Rhythm"
                                                value="Auto-renewing"
                                                text="Billed on the recurring anniversary date until formally cancelled via dashboard."
                                            />

                                            <SubscriptionCard
                                                title="Refund Window"
                                                value="14-Day Money Back"
                                                text="Full refund granted upon written request within 14 days of initial annual tier enrollment."
                                            />

                                            <SubscriptionCard
                                                title="Cancellations"
                                                value="Immediate Effect"
                                                text="Retain all active patron features through the remainder of the prepaid cycle."
                                            />
                                        </div>
                                    </section>

                                    <section
                                        className="scroll-mt-24 flex flex-col gap-4"
                                        id="liability"
                                    >
                                        <SectionHeader
                                            number="06"
                                            title="Limitation of Liability & Termination"
                                        />

                                        <p className="font-body-lg text-body-lg text-text-dim leading-relaxed">
                                            Cinephile 🎬 and all catalog materials are provided on an
                                            “AS IS” and “AS AVAILABLE” basis without express or
                                            implied warranties. We make no warranty that service will
                                            be completely uninterrupted, timely, secure, or devoid of
                                            editorial errors.
                                        </p>

                                        <p className="font-body-lg text-body-lg text-text-dim leading-relaxed">
                                            In no event shall Cinephile 🎬 Inc., its officers, directors,
                                            or employees be liable for indirect, incidental, punitive,
                                            or consequential damages resulting from lost review data,
                                            service outages, or unauthorized account penetrations.
                                        </p>

                                        <div className="bg-surface-container-low p-4 rounded-xl flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">
                        info
                      </span>

                                            <p className="font-body-sm text-body-sm text-text-dim leading-normal">
                                                Cinephile 🎬 reserves the unilateral right to suspend,
                                                demote, or terminate accounts violating community codes
                                                of conduct without prior notice or prorated liability.
                                            </p>
                                        </div>
                                    </section>

                                    <section
                                        className="scroll-mt-24 flex flex-col gap-4"
                                        id="governing-law"
                                    >
                                        <SectionHeader
                                            number="07"
                                            title="Governing Law & Dispute Resolution"
                                        />

                                        <p className="font-body-lg text-body-lg text-text-dim leading-relaxed">
                                            These terms and any claims stemming from platform usage
                                            shall be governed by and construed under the laws of the
                                            State of California and applicable United States federal
                                            law, without giving effect to conflicts of law doctrines.
                                        </p>

                                        <p className="font-body-lg text-body-lg text-text-dim leading-relaxed">
                                            Any dispute, controversy, or claim arising under or
                                            relating to these terms shall be resolved exclusively
                                            through final and binding confidential arbitration
                                            administered by JAMS in Los Angeles, California, before a
                                            single neutral arbitrator.
                                        </p>
                                    </section>

                                    {/* Contact Legal */}
                                    <div className="bg-surface-container-low rounded-2xl p-8 relative overflow-hidden shadow-lg mt-8">
                                        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

                                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                            <div className="flex flex-col gap-2">
                        <span className="font-label-caps text-label-caps text-primary uppercase tracking-wider">
                          Assistance & Clarity
                        </span>

                                                <h3 className="font-title-md text-title-md text-text-main font-bold">
                                                    Questions regarding our terms?
                                                </h3>

                                                <p className="font-body-sm text-body-sm text-text-dim">
                                                    Our internal legal counsel and data protection team
                                                    will respond within 48 business hours.
                                                </p>
                                            </div>

                                            <a
                                                className="px-6 py-3 rounded-lg bg-primary text-on-primary font-metadata text-metadata font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_16px_rgba(0,224,84,0.3)] shrink-0"
                                                href="mailto:legal@filmbuff.app"
                                            >
                                                Contact legal@filmbuff.app
                                            </a>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

const SectionHeader = ({ number, title }) => (
    <div className="flex items-center gap-3">
    <span className="font-label-caps text-label-caps text-primary bg-surface-container px-2.5 py-1 rounded">
      SECTION {number}
    </span>

        <h2 className="font-headline-lg text-title-md text-text-main tracking-tight font-bold">
            {title}
        </h2>
    </div>
);

const InfoBox = ({ icon, title, children }) => (
    <div className="bg-surface-container-low p-5 rounded-xl flex items-start gap-4">
    <span className="material-symbols-outlined text-primary text-[24px] mt-0.5">
      {icon}
    </span>

        <div className="flex flex-col gap-1">
      <span className="font-metadata text-metadata text-text-main font-semibold">
        {title}
      </span>

            <p className="font-body-sm text-body-sm text-text-dim leading-normal">
                {children}
            </p>
        </div>
    </div>
);

const InfoCard = ({ title, text, secondary = false }) => (
    <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2">
    <span className="font-metadata text-metadata text-text-main font-semibold flex items-center gap-2">
      <span
          className={`w-1.5 h-1.5 rounded-full ${
              secondary ? "bg-secondary" : "bg-primary"
          }`}
      ></span>

        {title}
    </span>

        <p className="font-body-sm text-body-sm text-text-dim leading-relaxed">
            {text}
        </p>
    </div>
);

const SubscriptionCard = ({ title, value, text }) => (
    <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-1.5">
    <span className="font-label-caps text-label-caps text-primary uppercase">
      {title}
    </span>

        <span className="font-metadata text-metadata text-text-main font-medium">
      {value}
    </span>

        <p className="font-body-sm text-body-sm text-text-dim">
            {text}
        </p>
    </div>
);

const FooterColumn = ({ title, links }) => (
    <div className="flex flex-col gap-3">
    <span className="font-title-md text-metadata uppercase tracking-wider text-text-main">
      {title}
    </span>

        <div className="flex flex-col gap-2.5">
            {links.map((link) => (
                <a
                    key={link}
                    className="font-body-sm text-body-sm text-text-dim hover:text-primary transition-colors"
                    href="#"
                >
                    {link}
                </a>
            ))}
        </div>
    </div>
);

export default TermsOfService;