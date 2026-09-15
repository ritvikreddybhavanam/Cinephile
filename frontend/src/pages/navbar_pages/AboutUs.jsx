import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

const AboutUs = () => {
  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen">
      <Navbar />

      <main className="w-full pt-16 bg-surface min-h-[calc(100vh-280px)]">

        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-margin-sm md:px-margin-md pt-12 md:pt-20 pb-16 md:pb-24 flex flex-col gap-10">

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>

              <span className="font-label-caps text-label-caps tracking-widest text-primary uppercase">
                Cinephilic Archive & Journal
              </span>
            </div>

            <div className="font-label-caps text-label-caps text-text-dim flex items-center gap-2">
              <span>FOUNDED 2019</span>
              <span className="text-surface-muted">•</span>
              <span>EST. 35MM / 70MM / DCP / RESTORATIONS</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 md:gap-12">

            <div className="max-w-3xl flex flex-col gap-5">
              <h1 className="font-display-lg text-display-lg text-text-main tracking-tight font-extrabold">
                About{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-text-main via-on-surface to-primary">
                  Cinephile 🎬
                </span>
              </h1>

              <p className="font-title-md text-title-md text-text-dim font-light leading-relaxed">
                The Definitive Journal for Cinephile 🎬s.
              </p>
            </div>

            <div className="lg:max-w-md bg-surface-container-low/80 backdrop-blur-sm p-6 rounded-xl shadow-xl flex flex-col gap-3">

              <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">
                  movie
                </span>
                Mission Statement
              </span>

              <p className="font-body-lg text-body-lg text-text-main italic leading-snug">
                “Dedicated to the art, preservation, and critique of world
                cinema.”
              </p>

            </div>
          </div>

          {/* Hero Image */}
          <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl group">

            <div
              className="h-[280px] md:h-[420px] w-full bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBnRd6sCUOsJJbcev9pzaKdg67SFxzjDKg5X4oe3RPUZ4eydX33vRWC6bZH-j3HgBt1E-NAw99YoKlT-7bOEY_fjYqMvfrPBf9mEhp65qwP_fIhrI4bDr_k5bxtPoO7iMAxRXAFrEcq2DTFRTUUTo9dG3Oyo1jruXIczaxfbu7qTuL9cxV3LQopsqZfo7H_B6dYOHgzG6R9rbLAf-etJGyx5giS7XaWcS_gzoMwE-L1AVnlICK1SIRH')",
              }}
            ></div>

            <div className="absolute inset-0 bg-gradient-to-t from-surface-deep via-surface-deep/40 to-transparent"></div>

            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">

              <div className="flex flex-col gap-1 max-w-lg">
                <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
                  The Sanctuary
                </span>

                <p className="font-body-sm text-body-sm text-text-main font-medium">
                  A home crafted by critics and restorers to treat moving
                  images with curatorial reverence.
                </p>
              </div>

              <div className="hidden md:flex items-center gap-2 bg-surface-deep/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-text-dim font-metadata text-metadata">
                <span className="material-symbols-outlined text-[15px] text-primary">
                  verified
                </span>
                <span>Independent & Non-Algorithmic</span>
              </div>

            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="w-full bg-surface-container-lowest py-12 md:py-16">

          <div className="max-w-7xl mx-auto px-margin-sm md:px-margin-md">

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">

              <StatCard
                title="Film Index"
                value="840K+"
                icon="local_movies"
                color="text-primary"
                description="Indexed titles across silent, international, and avant-garde catalogs."
              />

              <StatCard
                title="Filmography"
                value="410K+"
                icon="theater_comedy"
                color="text-secondary"
                description="Directors, cinematographers, sound designers, and ensemble cast."
              />

              <StatCard
                title="Discourse"
                value="1.2M+"
                icon="rate_review"
                color="text-rating-star"
                description="Longform essays, logged viewings, and accredited festival critiques."
              />

              <StatCard
                title="Restorations"
                value="98%"
                icon="auto_videocam"
                color="text-primary-fixed-dim"
                description="Coverage index for restored global festival prize-winners & heritage prints."
              />

            </div>
          </div>
        </section>

        {/* Curated Manifesto */}
        <section className="max-w-7xl mx-auto px-margin-sm md:px-margin-md py-16 md:py-24 flex flex-col gap-12">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">

            <div className="flex flex-col gap-2">
              <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
                The Pillars
              </span>

              <h2 className="font-headline-lg text-headline-lg text-text-main font-bold tracking-tight">
                Curated Manifesto
              </h2>
            </div>

            <p className="font-body-sm text-body-sm text-text-dim max-w-md">
              We reject endless recommendation homogeny in favor of thoughtful
              human perspective, archival rigor, and cine-literacy.
            </p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <PillarCard
              number="01 / PERSPECTIVE"
              icon="camera_roll"
              title="Auteur First"
              color="text-primary"
              description="Cinema is the vision of human creators. We elevate directorial intent, deep cinematography breakdowns, screenwriting architecture, and the craft behind every frame over fleeting algorithmic trends."
              link="Director Filmographies"
            />

            <PillarCard
              number="02 / HERITAGE"
              icon="history_edu"
              title="Archival Integrity"
              color="text-secondary"
              description="Preserving film history requires metadata fidelity. We document aspect ratios, camera packages, film stocks, lab restoration notes, and distributor masters to build a living historical index."
              link="Restoration Registry"
            />

            <PillarCard
              number="03 / HORIZONS"
              icon="public"
              title="Global Discovery"
              color="text-primary"
              description="World cinema does not stop at mainstream circuits. From Senegalese anti-colonial epics to Japanese New Wave and contemporary Latin American indies, our catalogs illuminate cross-border storytelling."
              link="Global Cinema Map"
            />

            <PillarCard
              number="04 / VOICE"
              icon="forum"
              title="Community Critique"
              color="text-rating-star"
              description="A space built for discourse that values insight over hot takes. Our community celebrates verified critics, passionate scholars, festival programmers, and curious Cinephile 🎬s sharing nuanced perspectives."
              link="Community Standards"
            />

          </div>
        </section>

        {/* Team Section */}
        <section className="w-full bg-surface-container-lowest/70 py-16 md:py-24">

          <div className="max-w-7xl mx-auto px-margin-sm md:px-margin-md flex flex-col gap-12">

            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">

              <div className="flex flex-col gap-2">
                <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">
                  Leadership & Curators
                </span>

                <h2 className="font-headline-lg text-headline-lg text-text-main font-bold">
                  The Editorial & Archival Team
                </h2>
              </div>

              <span className="font-metadata text-metadata text-text-dim">
                Copenhagen • Paris • Tokyo • Los Angeles
              </span>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <TeamCard
                name="Elena Vance"
                role="EDITOR-IN-CHIEF"
                subtitle="Former Festival Programmer, Cannes Cinephile 🎬s"
                image="https://lh3.googleusercontent.com/aida-public/AB6AXuDXyEyQwgWI60kuH1x_CfF0jMQmHtJE3lsR_IVvQ936ZgxtuSI0QIRj4b5CsL2owqHXV-7VQRXnxiUjTcjj5mk2UPV3vVJXoPNqtT5xcfFYoMzd6asU9g5b-x6DVBY9_739Ivjc-dNmEu7jpXI25K0ex9okCtesZOGjaeeB24gey5jaPHoAnyOeAfEm_GtgLj2bfMPwSPeeSdmauGIt3A7HJIwgcCHe7-uyoyDM9cyyJQmHyCjAVKkT"
                description="Leads critical curation and the quarterly Cinephile 🎬 print monographs. Deep specialist in European post-war realism and modern French cinema."
                stat="42 Monographs Edited"
                icon="menu_book"
                color="text-primary"
              />

              <TeamCard
                name="Marcus K. Chen"
                role="HEAD OF ARCHIVAL INTEGRITY"
                subtitle="Cineteca Bologna Restoration Fellow"
                image="https://lh3.googleusercontent.com/aida-public/AB6AXuBFdOi07wv_coPMhQkebmoQbf9Z7Ts5BylcIaxP6Et_Op7k3HUBcXBZBzA7m3dPBgU5PwPdy1EeXHkt92-wYVb-FfvR9skeQmksdmDI4m4xd9OTNwPAuv_QkRj_W38CjNwCxb7nbipHSk-yh6-fq9iBIEl_Nz6nMJaJuHGrpfy3iFOrf-mxjccecW2-hqJvKaK_6IUrLKu5YCiKCx2ZmxhGt0u-M2NYhOrhcRfCqRLeDxn1FgQfcFFs"
                description="Oversees film preservation data schema, nitrate scanning notes, and studio catalog rights verification across North American and East Asian film registries."
                stat="1,800+ Restorations Logged"
                icon="history"
                color="text-secondary"
              />

              <TeamCard
                name="Soraya Belkacem"
                role="DIRECTOR OF GLOBAL DISCOVERY"
                subtitle="FIPRESCI Juror & Film Historian"
                image="https://lh3.googleusercontent.com/aida-public/AB6AXuCc76jQ7uSOl1CF_PnapgiAelEa_KSikb5nVcZsuMtwI11H3SPP3NJGCPnw9FYVj5ILhygqjR85UJjxIVPC5Pgvzj3il0JaJumRd9tH2cuRklvCLP5Gd25CzdtmvUc631LP550l4rbBeCsnNBG9Dcf36RQdp4qGOQNpcIvQVKbUA6IUuwMkhhRwWRSP45wjzB0_s3ORlJAYBXJrxrDK1c1m3YXCqHWJVtT-EVsIFas7hfIPM74B5tau"
                description="Curates international retrospectives, highlights neglected voices across the global South, and anchors our verified critic review fellowship program."
                stat="68 Nations Represented"
                icon="language"
                color="text-primary-fixed-dim"
              />

            </div>

            {/* Commitment */}
            <div className="mt-4 p-8 rounded-xl bg-surface-container-high/60 backdrop-blur-sm shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

              <div className="flex flex-col gap-2 max-w-2xl">
                <span className="font-label-caps text-label-caps text-primary uppercase tracking-wider">
                  A Commitment to Independence
                </span>

                <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                  Cinephile 🎬 is fully patron- and subscriber-sustained. We carry
                  no tracking cookies, display programmatic banners, or
                  algorithmic sponsored placements. Our sole responsibility is
                  to the cinematic art form and the people who cherish it.
                </p>
              </div>

              <a
                href="#"
                className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-surface-muted text-text-main font-metadata text-metadata hover:bg-surface-bright transition-colors shadow-sm"
              >
                <span>Read the Curatorial Letter</span>

                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </a>

            </div>

          </div>
        </section>

        {/* Community Section */}
        <section className="max-w-7xl mx-auto px-margin-sm md:px-margin-md py-16 md:py-20">

          <div className="bg-surface-container-low rounded-2xl p-8 md:p-12 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-10">

            <div className="flex flex-col gap-4 max-w-xl">

              <span className="font-label-caps text-label-caps text-primary uppercase tracking-wider">
                Community Open Index
              </span>

              <h3 className="font-headline-lg text-headline-lg text-text-main font-bold">
                Contribute to the Archive
              </h3>

              <p className="font-body-sm text-body-sm text-text-dim leading-relaxed">
                Are you a film historian, festival curator, or technical
                colorist? Cinephile 🎬 accepts community contributions for missing
                release prints, lost audio tracks, and rare regional premiere
                documentation.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">

                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-container text-on-primary-container font-headline-lg text-body-sm font-semibold hover:bg-primary transition-colors shadow-md"
                >
                  <span>Submit Archival Notes</span>

                  <span className="material-symbols-outlined text-[18px]">
                    post_add
                  </span>
                </a>

                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-surface-muted text-text-main font-headline-lg text-body-sm font-semibold hover:bg-surface-bright transition-colors"
                >
                  Verified Critic Program
                </a>

              </div>
            </div>

            {/* Progress Circle */}
            <div className="w-full lg:w-80 flex flex-col items-center justify-center p-6 bg-surface-deep rounded-xl shadow-inner gap-4">

              <div className="relative w-36 h-36 flex items-center justify-center">

                <svg
                  className="w-full h-full -rotate-90"
                  viewBox="0 0 120 120"
                >
                  <circle
                    className="text-surface-muted"
                    cx="60"
                    cy="60"
                    fill="transparent"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="8"
                  />

                  <circle
                    className="text-primary"
                    cx="60"
                    cy="60"
                    fill="transparent"
                    r="50"
                    stroke="currentColor"
                    strokeDasharray="314.159"
                    strokeDashoffset="62.8"
                    strokeLinecap="round"
                    strokeWidth="8"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">

                  <span className="font-display-lg text-headline-lg font-bold text-text-main">
                    80%
                  </span>

                  <span className="font-label-caps text-[10px] text-text-dim uppercase tracking-wider">
                    Golden Era 4K
                  </span>

                </div>
              </div>

              <div className="text-center flex flex-col gap-1">

                <span className="font-metadata text-metadata text-text-main font-medium">
                  1945–1975 Restoration Progress
                </span>

                <span className="font-label-caps text-[11px] text-text-dim">
                  4,120 of 5,150 masterpieces catalogued
                </span>

              </div>

            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="w-full pb-16 md:pb-24">

          <div className="max-w-7xl mx-auto px-margin-sm md:px-margin-md">

            <div className="p-8 md:p-12 rounded-2xl bg-surface-container-lowest flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-sm">

              <div className="flex flex-col gap-2 max-w-xl">

                <span className="font-label-caps text-label-caps text-text-dim uppercase tracking-widest">
                  Inquiries & Dispatches
                </span>

                <h4 className="font-title-md text-title-md text-text-main font-semibold">
                  Press, Festivals & Academic Partnerships
                </h4>

                <p className="font-body-sm text-body-sm text-text-dim">
                  Direct your festival credentials, academic research proposals,
                  licensing queries, or editorial submissions to our team.
                </p>

              </div>

              <div className="flex flex-wrap items-center gap-4">

                <a
                  href="mailto:press@filmbuff.org"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-surface-container text-text-main hover:text-primary hover:bg-surface-bright transition-colors font-metadata text-metadata shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    mail
                  </span>

                  press@filmbuff.org
                </a>

                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-surface-container text-text-main hover:text-primary hover:bg-surface-bright transition-colors font-metadata text-metadata shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    contact_support
                  </span>

                  Archival Support Desk
                </a>

              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};


/* =========================
   STAT CARD
========================= */

const StatCard = ({
  title,
  value,
  icon,
  color,
  description,
}) => {
  return (
    <div className="bg-surface-container/40 hover:bg-surface-container/70 transition-all p-6 rounded-xl flex flex-col gap-2 shadow-sm">

      <div className="flex items-center justify-between">

        <span className="font-label-caps text-label-caps text-text-dim uppercase">
          {title}
        </span>

        <span className={`material-symbols-outlined ${color} text-[20px]`}>
          {icon}
        </span>

      </div>

      <div className="font-display-lg text-headline-lg font-bold text-text-main tracking-tight">
        {value}
      </div>

      <p className="font-body-sm text-body-sm text-text-dim">
        {description}
      </p>

    </div>
  );
};


/* =========================
   PILLAR CARD
========================= */

const PillarCard = ({
  number,
  icon,
  title,
  color,
  description,
  link,
}) => {
  return (
    <div className="bg-surface-container-low hover:bg-surface-container transition-all duration-300 rounded-xl p-6 flex flex-col justify-between gap-8 group shadow-md">

      <div className="flex flex-col gap-4">

        <div className="flex items-center justify-between">

          <span className="font-label-caps text-label-caps text-text-dim">
            {number}
          </span>

          <span
            className={`w-8 h-8 rounded-lg bg-surface-muted/50 flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {icon}
            </span>
          </span>

        </div>

        <h3 className="font-title-md text-title-md text-text-main font-semibold">
          {title}
        </h3>

        <p className="font-body-sm text-body-sm text-text-dim leading-relaxed">
          {description}
        </p>

      </div>

      <div
        className={`pt-4 flex items-center gap-2 ${color} font-metadata text-metadata`}
      >
        <span>{link}</span>

        <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
          arrow_forward
        </span>
      </div>

    </div>
  );
};


/* =========================
   TEAM CARD
========================= */

const TeamCard = ({
  name,
  role,
  subtitle,
  image,
  description,
  stat,
  icon,
  color,
}) => {
  return (
    <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-5 shadow-sm hover:bg-surface-container transition-colors">

      <div className="flex items-center gap-4">

        <img
          className="w-16 h-16 rounded-full object-cover shadow-sm ring-2 ring-surface-muted"
          src={image}
          alt={name}
        />

        <div className="flex flex-col">

          <h3 className="font-title-md text-title-md text-text-main font-bold">
            {name}
          </h3>

          <span className={`font-label-caps text-label-caps ${color}`}>
            {role}
          </span>

          <span className="font-metadata text-metadata text-text-dim">
            {subtitle}
          </span>

        </div>
      </div>

      <p className="font-body-sm text-body-sm text-text-dim leading-relaxed">
        {description}
      </p>

      <div className="flex items-center gap-2 text-text-dim font-label-caps text-label-caps pt-2">

        <span className="material-symbols-outlined text-[16px]">
          {icon}
        </span>

        <span>{stat}</span>

      </div>

    </div>
  );
};

export default AboutUs;