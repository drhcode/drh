import type { PageRow, PageTranslationRow, PageSection } from '@/types/database';
import { NS, seedId } from '../ids';

interface PageSeed {
  slug: string;
  kind: 'system' | 'landing';
  en: Omit<PageTranslationRow, 'page_id' | 'language' | 'is_complete'>;
  sq?: Omit<PageTranslationRow, 'page_id' | 'language' | 'is_complete'>;
}

// ─── Homepage ────────────────────────────────────────────────────────────────
const homeSectionsEn: PageSection[] = [
  {
    type: 'hero',
    eyebrow: 'Digital agency · Albania',
    title: 'Web Development, Mobile Apps & SEO in Albania',
    subtitle: 'Digital products built to perform — in Albania and worldwide.',
    body: 'drh.al is a digital agency specializing in high-performance websites, custom web applications, mobile apps, SEO and performance marketing.\n\nWe combine strategy, design and senior-level development to build digital experiences that are fast, scalable and focused on measurable business growth.',
    primaryCta: 'Start a Project',
    secondaryCta: 'View Our Work',
    note: 'Free strategy call · Reply within 24 hours · Albania & Worldwide',
  },
  {
    type: 'metrics',
    items: [
      { value: '8+', label: 'Years Experience' },
      { value: '100+', label: 'Projects Delivered' },
      { value: '30+', label: 'Global Clients' },
      { value: '95+', label: 'Target Lighthouse Performance' },
    ],
  },
  { type: 'technologies', title: 'The stack we build on' },
  {
    type: 'services',
    title: 'Digital Services Built Around Your Business',
    subtitle:
      'From strategy and design to development and growth, our team handles the entire digital journey under one roof.',
  },
  {
    type: 'projects',
    title: 'Selected Work',
    subtitle: 'Outcomes, not just deliverables.',
    limit: 3,
  },
  {
    type: 'featureGrid',
    title: 'A Digital Partner That Thinks Like an Operator',
    subtitle: 'Six things that shape how every drh.al project is run.',
    items: [
      { title: 'Strategy First', body: 'We start with business goals and customer behavior — not visual trends.' },
      { title: 'Senior-Level Execution', body: 'Projects are handled by experienced developers and digital specialists.' },
      { title: 'Performance by Default', body: 'Speed, responsiveness and Core Web Vitals are part of the architecture from day one.' },
      { title: 'Conversion Focused', body: 'Every section should have a clear purpose and measurable business objective.' },
      { title: 'Built to Scale', body: 'Architecture and technology are selected for long-term maintainability and growth.' },
      { title: 'Clear Communication', body: 'Clear scope, milestones, timelines and transparent communication throughout the project.' },
    ],
  },
  {
    type: 'industries',
    title: 'Built for the Industries We Know Best',
    subtitle: 'Sector knowledge shortens the distance between brief and result.',
  },
  {
    type: 'process',
    title: 'A Clear Path From Idea to Results',
    subtitle: 'Four stages, defined deliverables, no surprises.',
    steps: [
      {
        step: '01',
        title: 'Discovery & Strategy',
        body: 'Goals, audience, competitors, existing problems, technical requirements and the success metrics we will be judged on.',
      },
      {
        step: '02',
        title: 'Design & UX',
        body: 'Information architecture, user flows, wireframes and high-fidelity UI — designed to be built, not just presented.',
      },
      {
        step: '03',
        title: 'Development',
        body: 'Production-grade code optimized for speed, responsiveness, SEO, accessibility, scalability and security.',
      },
      {
        step: '04',
        title: 'Launch & Growth',
        body: 'After launch we measure, improve, optimize and scale through SEO and marketing.',
      },
    ],
  },
  { type: 'testimonials', title: 'What Clients Say' },
  {
    type: 'blog',
    title: 'Insights on Web, Apps & Growth',
    subtitle: 'Practical writing on what we build and what it costs.',
    limit: 3,
  },
  {
    type: 'faq',
    title: 'Questions We Are Asked Before Every Project',
    subtitle: 'If something is missing here, ask us directly.',
    category: 'general',
  },
  {
    type: 'cta',
    title: "Let's Build Something People Remember",
    body: "Tell us what you're building, what isn't working today and where you want to go.\n\nWe'll review your requirements and reply within 24 hours with the recommended next steps.",
    primaryCta: 'Start a Project',
  },
];

const homeSectionsSq: PageSection[] = [
  {
    type: 'hero',
    eyebrow: 'Agjenci dixhitale · Shqipëri',
    title: 'Zhvillim Web, Aplikacione Mobile & SEO në Shqipëri',
    subtitle: 'Produkte dixhitale të ndërtuara për të performuar — në Shqipëri dhe në botë.',
    body: 'drh.al është një agjenci dixhitale e specializuar në website me performancë të lartë, aplikacione web të personalizuara, aplikacione mobile, SEO dhe marketing performance.\n\nKombinojmë strategjinë, dizajnin dhe zhvillimin e nivelit senior për të ndërtuar përvoja dixhitale të shpejta, të shkallëzueshme dhe të fokusuara te rritja e matshme e biznesit.',
    primaryCta: 'Nis një Projekt',
    secondaryCta: 'Shiko Punën Tonë',
    note: 'Konsultë falas · Përgjigje brenda 24 orësh · Shqipëri & Botë',
  },
  {
    type: 'metrics',
    items: [
      { value: '8+', label: 'Vite Eksperiencë' },
      { value: '100+', label: 'Projekte të Dorëzuara' },
      { value: '30+', label: 'Klientë Globalë' },
      { value: '95+', label: 'Performancë Lighthouse e Synuar' },
    ],
  },
  { type: 'technologies', title: 'Teknologjitë mbi të cilat ndërtojmë' },
  {
    type: 'services',
    title: 'Shërbime Dixhitale të Ndërtuara rreth Biznesit Tuaj',
    subtitle:
      'Nga strategjia dhe dizajni te zhvillimi dhe rritja, ekipi ynë mbulon të gjithë udhëtimin dixhital nën një çati.',
  },
  {
    type: 'projects',
    title: 'Punë të Përzgjedhura',
    subtitle: 'Rezultate, jo thjesht dorëzime.',
    limit: 3,
  },
  {
    type: 'featureGrid',
    title: 'Një Partner Dixhital që Mendon si Operator',
    subtitle: 'Gjashtë parime që formësojnë çdo projekt të drh.al.',
    items: [
      { title: 'Strategjia e Para', body: 'Nisim nga objektivat e biznesit dhe sjellja e klientit — jo nga trendet vizuale.' },
      { title: 'Ekzekutim i Nivelit Senior', body: 'Projektet trajtohen nga zhvillues dhe specialistë me eksperiencë.' },
      { title: 'Performanca si Standard', body: 'Shpejtësia, responsiviteti dhe Core Web Vitals janë pjesë e arkitekturës që nga dita e parë.' },
      { title: 'Fokus te Konvertimi', body: 'Çdo seksion duhet të ketë një qëllim të qartë dhe një objektiv të matshëm biznesi.' },
      { title: 'E Ndërtuar për të Shkallëzuar', body: 'Arkitektura dhe teknologjia zgjidhen për mirëmbajtje dhe rritje afatgjatë.' },
      { title: 'Komunikim i Qartë', body: 'Fushëveprim, faza dhe afate të qarta, me komunikim transparent gjatë gjithë projektit.' },
    ],
  },
  {
    type: 'industries',
    title: 'Ndërtuar për Industritë që Njohim më Mirë',
    subtitle: 'Njohja e sektorit e shkurton distancën nga kërkesa te rezultati.',
  },
  {
    type: 'process',
    title: 'Një Rrugë e Qartë nga Ideja te Rezultatet',
    subtitle: 'Katër faza, dorëzime të përcaktuara, pa surpriza.',
    steps: [
      { step: '01', title: 'Zbulim & Strategji', body: 'Objektivat, audienca, konkurrentët, problemet ekzistuese, kërkesat teknike dhe metrikat e suksesit.' },
      { step: '02', title: 'Dizajn & UX', body: 'Arkitektura e informacionit, rrjedhat e përdoruesit, wireframe dhe ndërfaqja finale.' },
      { step: '03', title: 'Zhvillim', body: 'Kod i nivelit produksion, i optimizuar për shpejtësi, responsivitet, SEO, aksesueshmëri, shkallëzim dhe siguri.' },
      { step: '04', title: 'Lansim & Rritje', body: 'Pas lansimit masim, përmirësojmë, optimizojmë dhe rrisim përmes SEO dhe marketingut.' },
    ],
  },
  { type: 'testimonials', title: 'Çfarë Thonë Klientët' },
  {
    type: 'blog',
    title: 'Njohuri mbi Web, Aplikacione & Rritje',
    subtitle: 'Shkrime praktike mbi atë që ndërtojmë dhe sa kushton.',
    limit: 3,
  },
  {
    type: 'faq',
    title: 'Pyetjet që na Bëhen para Çdo Projekti',
    subtitle: 'Nëse mungon diçka këtu, na pyesni direkt.',
    category: 'general',
  },
  {
    type: 'cta',
    title: 'Le të Ndërtojmë Diçka që Njerëzit e Mbajnë Mend',
    body: 'Na tregoni çfarë po ndërtoni, çfarë nuk po funksionon sot dhe ku doni të shkoni.\n\nDo t’i shqyrtojmë kërkesat tuaja dhe do të përgjigjemi brenda 24 orësh me hapat e rekomanduar.',
    primaryCta: 'Nis një Projekt',
  },
];

// ─── About ───────────────────────────────────────────────────────────────────
const aboutSectionsEn: PageSection[] = [
  {
    type: 'hero',
    eyebrow: 'About drh.al',
    title: 'A Digital Agency From Albania, Building for the World',
    body: 'drh.al is a web development and digital agency based in Albania, working with businesses locally and internationally.\n\nWe design and develop websites, web applications and mobile products — and help businesses grow through SEO and performance marketing.',
    primaryCta: 'Start a Project',
    secondaryCta: 'View Our Work',
  },
  {
    type: 'richText',
    title: 'Our philosophy',
    body: 'Technology should solve real business problems.\n\nThat sentence decides most of what we do. Before we discuss a layout or a framework, we want to know what the business needs to happen: more qualified enquiries, fewer manual steps, a faster path from interest to purchase, a system a team can actually operate.\n\nWe are not a design studio that also writes code. We are a technical and strategic partner that treats design as one part of a larger engineering and commercial decision.',
  },
  {
    type: 'featureGrid',
    title: 'What makes us different',
    items: [
      { title: 'We ask about the business first', body: 'Goals, margins, sales process and constraints come before a single screen is designed.' },
      { title: 'Senior people do the work', body: 'The person who scopes your project is involved in delivering it.' },
      { title: 'We build for handover', body: 'Clear code, documented decisions and full ownership. You are never locked in.' },
      { title: 'We measure what we build', body: 'Analytics, Search Console and lead attribution connected, so results are visible rather than claimed.' },
      { title: 'We say no', body: 'If a feature will not earn its complexity, we will tell you before it is built.' },
      { title: 'We stay after launch', body: 'Launch is the start of the measurement period, not the end of the engagement.' },
    ],
  },
  {
    type: 'richText',
    title: 'Experience',
    body: 'Eight years of building digital products for businesses of very different sizes — from local companies that needed a credible first website to international clients with existing platforms and internal teams.\n\nThat range matters. Working with small businesses teaches you to be economical with scope; working with larger organisations teaches you to be rigorous about architecture, security and handover. We apply both to every project.',
  },
  { type: 'technologies', title: 'Technologies we work with' },
  {
    type: 'process',
    title: 'How we work',
    steps: [
      { step: '01', title: 'Discovery & Strategy', body: 'Goals, audience, competitors, technical requirements and success metrics.' },
      { step: '02', title: 'Design & UX', body: 'Information architecture, user flows, wireframes and high-fidelity UI.' },
      { step: '03', title: 'Development', body: 'Production-grade code optimized for speed, SEO, accessibility, scalability and security.' },
      { step: '04', title: 'Launch & Growth', body: 'Measure, improve, optimize and scale through SEO and marketing.' },
    ],
  },
  {
    type: 'richText',
    title: 'Markets served',
    body: 'We work with clients in Albania — mainly Tirana and the larger commercial centres — and internationally across Europe, with delivered work for clients in Italy.\n\nRemote delivery is our default and it works: written scope, scheduled calls, shared visibility on progress and a single point of contact. We work in English, Albanian and Italian, in a time zone that overlaps fully with the rest of Europe.',
  },
  {
    type: 'cta',
    title: "Let's Build Something People Remember",
    body: 'Tell us what you are building and where you want to go. We reply within 24 hours.',
    primaryCta: 'Start a Project',
  },
];

const aboutSectionsSq: PageSection[] = [
  {
    type: 'hero',
    eyebrow: 'Rreth drh.al',
    title: 'Një Agjenci Dixhitale nga Shqipëria, që Ndërton për Botën',
    body: 'drh.al është një agjenci zhvillimi web dhe dixhitale me bazë në Shqipëri, që punon me biznese vendase dhe ndërkombëtare.\n\nDizajnojmë dhe zhvillojmë website, aplikacione web dhe produkte mobile — dhe ndihmojmë bizneset të rriten përmes SEO dhe marketingut performance.',
    primaryCta: 'Nis një Projekt',
    secondaryCta: 'Shiko Punën Tonë',
  },
  {
    type: 'richText',
    title: 'Filozofia jonë',
    body: 'Teknologjia duhet të zgjidhë probleme reale biznesi.\n\nKjo fjali përcakton shumicën e asaj që bëjmë. Para se të flasim për një layout apo një framework, duam të dimë çfarë i duhet biznesit të ndodhë: më shumë kërkesa të kualifikuara, më pak hapa manualë, një rrugë më e shpejtë nga interesi te blerja.\n\nNuk jemi një studio dizajni që shkruan edhe kod. Jemi një partner teknik dhe strategjik që e trajton dizajnin si një pjesë të një vendimi më të gjerë inxhinierik dhe tregtar.',
  },
  {
    type: 'featureGrid',
    title: 'Çfarë na bën ndryshe',
    items: [
      { title: 'Pyesim së pari për biznesin', body: 'Objektivat, marzhet, procesi i shitjes dhe kufizimet vijnë para çdo ekrani.' },
      { title: 'Punën e bëjnë njerëz senior', body: 'Personi që përcakton projektin tuaj është i përfshirë në dorëzimin e tij.' },
      { title: 'Ndërtojmë për dorëzim', body: 'Kod i qartë, vendime të dokumentuara dhe pronësi e plotë. Nuk mbeteni kurrë të varur.' },
      { title: 'Masim atë që ndërtojmë', body: 'Analitika, Search Console dhe atribuimi i kontakteve të lidhura, që rezultatet të shihen.' },
      { title: 'Themi jo', body: 'Nëse një funksion nuk e justifikon kompleksitetin, jua themi para se të ndërtohet.' },
      { title: 'Qëndrojmë pas lansimit', body: 'Lansimi është fillimi i periudhës së matjes, jo fundi i bashkëpunimit.' },
    ],
  },
  {
    type: 'richText',
    title: 'Eksperienca',
    body: 'Tetë vite duke ndërtuar produkte dixhitale për biznese me madhësi shumë të ndryshme — nga kompani vendase që kishin nevojë për një website të parë të besueshëm, te klientë ndërkombëtarë me platforma dhe ekipe të brendshme.\n\nKy diapazon ka rëndësi. Puna me biznese të vogla të mëson të jesh ekonomik me fushëveprimin; puna me organizata më të mëdha të mëson të jesh rigoroz me arkitekturën, sigurinë dhe dorëzimin.',
  },
  { type: 'technologies', title: 'Teknologjitë me të cilat punojmë' },
  {
    type: 'process',
    title: 'Si punojmë',
    steps: [
      { step: '01', title: 'Zbulim & Strategji', body: 'Objektivat, audienca, konkurrentët, kërkesat teknike dhe metrikat e suksesit.' },
      { step: '02', title: 'Dizajn & UX', body: 'Arkitektura e informacionit, rrjedhat, wireframe dhe ndërfaqja finale.' },
      { step: '03', title: 'Zhvillim', body: 'Kod produksioni i optimizuar për shpejtësi, SEO, aksesueshmëri, shkallëzim dhe siguri.' },
      { step: '04', title: 'Lansim & Rritje', body: 'Masim, përmirësojmë, optimizojmë dhe rrisim përmes SEO dhe marketingut.' },
    ],
  },
  {
    type: 'richText',
    title: 'Tregjet ku shërbejmë',
    body: 'Punojmë me klientë në Shqipëri — kryesisht në Tiranë dhe qendrat kryesore tregtare — dhe ndërkombëtarisht në Evropë, me punë të dorëzuar për klientë në Itali.\n\nDorëzimi në distancë është standardi ynë dhe funksionon: fushëveprim me shkrim, takime të planifikuara, dukshmëri e përbashkët mbi progresin dhe një pikë e vetme kontakti. Punojmë në anglisht, shqip dhe italisht.',
  },
  {
    type: 'cta',
    title: 'Le të Ndërtojmë Diçka që Njerëzit e Mbajnë Mend',
    body: 'Na tregoni çfarë po ndërtoni dhe ku doni të shkoni. Përgjigjemi brenda 24 orësh.',
    primaryCta: 'Nis një Projekt',
  },
];

// ─── SEO landing pages (spec §97) ────────────────────────────────────────────
interface LandingSeed {
  slug: string;
  title: string;
  eyebrow: string;
  h1: string;
  intro: string;
  bodyTitle: string;
  body: string;
  gridTitle: string;
  grid: { title: string; body: string }[];
  seoTitle: string;
  seoDescription: string;
}

const landings: LandingSeed[] = [
  {
    slug: 'web-development-albania',
    title: 'Web Development Albania',
    eyebrow: 'Web development · Albania',
    h1: 'Web Development in Albania',
    intro:
      'We build websites and web applications for Albanian businesses and for international companies that want senior development at European standards. Strategy, design and engineering handled by one team.',
    bodyTitle: 'What web development actually costs you when it is done badly',
    body: 'Most businesses in Albania do not have a website problem. They have a lead problem, and the website is where it shows.\n\nA site built on a heavy template with no measurement in place cannot tell you which pages produce enquiries, why visitors leave, or whether last month was better than the one before it. Every marketing decision after that is a guess.\n\nWe build the opposite: sites with a clear conversion path, performance handled during the build, a CMS your team controls, and analytics wired to real business outcomes. That is the difference between a website that exists and one that earns.',
    gridTitle: 'What we build',
    grid: [
      { title: 'Business & corporate websites', body: 'Multi-page sites with a CMS, structured service pages and a clear enquiry path.' },
      { title: 'Landing pages', body: 'Single-purpose pages built for a specific campaign or search intent.' },
      { title: 'Multilingual websites', body: 'Albanian and English (or more) with correct hreflang and independent metadata.' },
      { title: 'Next.js & React builds', body: 'Modern rendering, excellent Core Web Vitals and a maintainable component system.' },
      { title: 'WordPress builds', body: 'Custom themes without marketplace bloat, built for editors who publish weekly.' },
      { title: 'Custom functionality', body: 'Calculators, booking, portals, integrations — the parts a template cannot do.' },
    ],
    seoTitle: 'Web Development Albania | Websites & Web Apps | drh.al',
    seoDescription:
      'Web development in Albania for businesses that need results. Next.js, React and WordPress websites with performance, SEO and conversion tracking built in.',
  },
  {
    slug: 'web-design-albania',
    title: 'Web Design Albania',
    eyebrow: 'Web design · Albania',
    h1: 'Web Design in Albania',
    intro:
      'Design that starts from your customer and your commercial goal, not from a template gallery. We design interfaces that are clear, credible and built to be developed.',
    bodyTitle: 'Design is a business decision before it is a visual one',
    body: 'A good-looking site that does not convert is an expensive brochure. Design decides what a visitor sees first, how much they have to read before they understand the offer, and how obvious the next step is.\n\nWe start with the audience and the decision they are trying to make. Then we design a structure around that decision — hierarchy, typography, spacing and imagery that make the important thing unmissable and the secondary things quiet.\n\nEverything we design is specified for development: states, breakpoints, edge cases and a component system, so what launches matches what was approved.',
    gridTitle: 'What design includes',
    grid: [
      { title: 'UX research & architecture', body: 'Audience, competitors, and a site structure that matches how people actually search.' },
      { title: 'Wireframes & user flows', body: 'Structure agreed before visual design, which is where most rework is avoided.' },
      { title: 'High-fidelity interface design', body: 'Complete screens across breakpoints, with real content rather than placeholders.' },
      { title: 'Design systems', body: 'Type scale, colour, spacing and components defined once and reused everywhere.' },
      { title: 'Brand & visual identity', body: 'A visual language that makes the company look like what it actually is.' },
      { title: 'Accessible by default', body: 'Contrast, focus states, tap targets and reduced motion treated as requirements.' },
    ],
    seoTitle: 'Web Design Albania | UI/UX & Website Design | drh.al',
    seoDescription:
      'Web design in Albania focused on clarity and conversion. UX research, wireframes, high-fidelity interface design and design systems built for development.',
  },
  {
    slug: 'web-development-tirana',
    title: 'Web Development Tirana',
    eyebrow: 'Web development · Tirana',
    h1: 'Web Development in Tirana',
    intro:
      'Working with businesses across Tirana — from professional practices and clinics to construction firms, retailers and hospitality groups — plus international clients who work with us remotely.',
    bodyTitle: 'What Tirana businesses usually need first',
    body: 'The commercial market in Tirana is competitive and increasingly search-driven. Customers compare three or four options on their phone before contacting any of them, which puts a lot of weight on speed, clarity and credibility.\n\nIn practice, the first fixes are usually the same: a site that loads quickly on mobile data, service pages that answer real questions instead of listing adjectives, a Google Business Profile that is complete and active, and enquiry tracking so you know which channel produced the call.\n\nWe do that work in order of commercial impact, starting with whatever is losing you enquiries today.',
    gridTitle: 'How we work with Tirana clients',
    grid: [
      { title: 'In-person or remote', body: 'Meet in Tirana when it helps; work remotely when it is faster.' },
      { title: 'Bilingual delivery', body: 'Albanian and English content, correctly separated for search.' },
      { title: 'Local search visibility', body: 'Business Profile, local landing pages and location signals that hold up.' },
      { title: 'Mobile-first performance', body: 'Built for the mobile connections your customers actually browse on.' },
      { title: 'Enquiry tracking', body: 'Calls, forms and WhatsApp clicks measured so marketing can be judged fairly.' },
      { title: 'Ongoing support', body: 'Maintenance and iteration after launch, month to month.' },
    ],
    seoTitle: 'Web Development Tirana | Websites for Tirana Businesses | drh.al',
    seoDescription:
      'Web development in Tirana: fast mobile-first websites, bilingual content, local SEO and enquiry tracking for businesses across the capital.',
  },
  {
    slug: 'wordpress-development-albania',
    title: 'WordPress Development Albania',
    eyebrow: 'WordPress · Albania',
    h1: 'WordPress Development in Albania',
    intro:
      'Custom WordPress builds without the weight. Purpose-built themes, only the plugins that earn their place, and an editing experience your team will actually use.',
    bodyTitle: 'Why most WordPress sites get slow',
    body: 'WordPress is not slow. Sites become slow because a multipurpose theme loads code for features you never use, and because twenty plugins each add their own scripts and database queries to every page.\n\nOur approach is the opposite: a custom theme containing only what your site needs, structured content types instead of page-builder soup, and a short, deliberate plugin list. Images are handled properly, scripts are loaded only where required, and caching is a strategy rather than a plugin you install at the end.\n\nThe result is a site that stays fast as it grows — and an admin that makes sense to whoever updates it on a Tuesday afternoon.',
    gridTitle: 'WordPress services',
    grid: [
      { title: 'Custom theme development', body: 'Built from scratch for your content, not adapted from a marketplace demo.' },
      { title: 'WooCommerce stores', body: 'Catalogue, checkout, payments, shipping and revenue tracking.' },
      { title: 'Custom plugins', body: 'Specific functionality built cleanly instead of forced through a generic plugin.' },
      { title: 'Multilingual WordPress', body: 'Albanian and English properly separated, with correct hreflang.' },
      { title: 'Performance rescue', body: 'Auditing and fixing existing sites that have become slow over time.' },
      { title: 'Maintenance & security', body: 'Updates, backups, monitoring and hardening on a monthly plan.' },
    ],
    seoTitle: 'WordPress Development Albania | Custom Themes & WooCommerce | drh.al',
    seoDescription:
      'WordPress development in Albania: custom themes, WooCommerce, custom plugins, multilingual sites and performance work — without template bloat.',
  },
  {
    slug: 'mobile-app-development-albania',
    title: 'Mobile App Development Albania',
    eyebrow: 'Mobile apps · Albania',
    h1: 'Mobile App Development in Albania',
    intro:
      'iOS and Android applications built with React Native, including the API, authentication, notifications, payments and store deployment.',
    bodyTitle: 'Most app projects fail on scope, not on code',
    body: 'The common failure is not technical. It is building version one as if it were version five: too many features, none of them finished well, and a release date that keeps moving.\n\nWe start by identifying the single job the app does that makes someone open it again tomorrow. That becomes version one. Everything else is sequenced behind it, informed by how the first release is actually used.\n\nOn the engineering side, we build the API and data model alongside the app, so authentication, sync, notifications and payments are designed together rather than retrofitted.',
    gridTitle: 'What is included',
    grid: [
      { title: 'iOS & Android', body: 'One React Native codebase serving both platforms, with native modules where needed.' },
      { title: 'Backend & API', body: 'The data model, authentication and business logic behind the app.' },
      { title: 'Push notifications', body: 'Designed as part of the product rather than bolted on afterwards.' },
      { title: 'Payments & subscriptions', body: 'In-app purchases and payment providers, integrated and tested.' },
      { title: 'Store deployment', body: 'App Store and Google Play submission, review requirements and releases.' },
      { title: 'Post-launch iteration', body: 'Usage measured, then the roadmap adjusted to what people actually do.' },
    ],
    seoTitle: 'Mobile App Development Albania | iOS & Android | drh.al',
    seoDescription:
      'Mobile app development in Albania. React Native iOS and Android apps with backend, authentication, push notifications, payments and store deployment.',
  },
  {
    slug: 'seo-albania',
    title: 'SEO Albania',
    eyebrow: 'SEO · Albania',
    h1: 'SEO in Albania',
    intro:
      'Technical, local and content SEO focused on the searches that produce enquiries — reported against leads rather than positions.',
    bodyTitle: 'Rankings are not the deliverable',
    body: 'It is possible to rank well for terms that never produce a single enquiry. It happens constantly, because volume is easy to report and commercial intent is harder to work on.\n\nWe start from the opposite end: which searches indicate someone is ready to buy, what would have to be true for your site to deserve those positions, and what is blocking it today. Usually the answer involves technical problems first — indexation, speed, structure — then content that genuinely answers the query better than what currently ranks.\n\nReporting is tied to Search Console and to leads in the CRM, so you can see which pages and which queries produce business, not just traffic.',
    gridTitle: 'What SEO includes',
    grid: [
      { title: 'Technical SEO', body: 'Crawlability, indexation, structured data, Core Web Vitals and site architecture.' },
      { title: 'Local SEO', body: 'Google Business Profile, location pages and local signals for Tirana and beyond.' },
      { title: 'Keyword & intent research', body: 'Prioritised by commercial value, not by search volume alone.' },
      { title: 'Content strategy', body: 'Pages and articles that answer the questions buyers ask before they enquire.' },
      { title: 'Internal linking', body: 'Structure that distributes authority to the pages that earn revenue.' },
      { title: 'Reporting on leads', body: 'Search Console and analytics connected to actual enquiries every month.' },
    ],
    seoTitle: 'SEO Albania | Technical, Local & Content SEO | drh.al',
    seoDescription:
      'SEO in Albania focused on qualified traffic: technical SEO, local SEO for Tirana, keyword research, content strategy and reporting tied to leads.',
  },
];

const landingSections = (l: LandingSeed): PageSection[] => [
  {
    type: 'hero',
    eyebrow: l.eyebrow,
    title: l.h1,
    body: l.intro,
    primaryCta: 'Start a Project',
    secondaryCta: 'View Our Work',
    note: 'Free strategy call · Reply within 24 hours',
  },
  { type: 'richText', title: l.bodyTitle, body: l.body },
  { type: 'featureGrid', title: l.gridTitle, items: l.grid },
  { type: 'projects', title: 'Selected Work', limit: 3 },
  { type: 'process', title: 'How a project runs', steps: [
    { step: '01', title: 'Discovery & Strategy', body: 'Goals, audience, competitors and success metrics.' },
    { step: '02', title: 'Design & UX', body: 'Architecture, flows, wireframes and high-fidelity UI.' },
    { step: '03', title: 'Development', body: 'Production code optimised for speed, SEO, accessibility and security.' },
    { step: '04', title: 'Launch & Growth', body: 'Measure, improve and scale through SEO and marketing.' },
  ] },
  { type: 'faq', title: 'Common questions', category: 'general' },
  {
    type: 'cta',
    title: "Let's Build Something People Remember",
    body: 'Tell us what you need and we will reply within 24 hours with recommended next steps.',
    primaryCta: 'Start a Project',
  },
];

// ─── Contact ─────────────────────────────────────────────────────────────────
const contactHeroEn: PageSection = {
  type: 'hero',
  eyebrow: 'Start a project',
  title: "Tell Us What You're Building",
  body: 'Have an idea, an existing website that needs improvement or a digital product ready for its next stage?\n\nTell us about your project. We’ll review your requirements and reply within 24 hours with the recommended next steps.',
};

const contactHeroSq: PageSection = {
  type: 'hero',
  eyebrow: 'Nis një projekt',
  title: 'Na Tregoni Çfarë Po Ndërtoni',
  body: 'Keni një ide, një website ekzistues që kërkon përmirësim, ose një produkt dixhital gati për fazën tjetër?\n\nNa tregoni për projektin tuaj. Do t’i shqyrtojmë kërkesat dhe do të përgjigjemi brenda 24 orësh me hapat e rekomanduar.',
};

const defs: PageSeed[] = [
  {
    slug: 'home',
    kind: 'system',
    en: {
      title: 'Home',
      sections: homeSectionsEn,
      seo_title: 'Web Development Albania | Websites, Apps & SEO | drh.al',
      seo_description:
        'drh.al is a web development agency in Albania building high-performance websites, web apps and mobile apps with SEO and digital marketing for businesses worldwide.',
      og_title: null,
      og_description: null,
    },
    sq: {
      title: 'Kreu',
      sections: homeSectionsSq,
      seo_title: 'Zhvillim Web Shqipëri | Website, Aplikacione & SEO | drh.al',
      seo_description:
        'drh.al është një agjenci zhvillimi web në Shqipëri që ndërton website me performancë të lartë, aplikacione web dhe mobile, me SEO dhe marketing dixhital.',
      og_title: null,
      og_description: null,
    },
  },
  {
    slug: 'about',
    kind: 'system',
    en: {
      title: 'About',
      sections: aboutSectionsEn,
      seo_title: 'About drh.al | Digital Agency in Albania | drh.al',
      seo_description:
        'drh.al is a web development and digital agency based in Albania, building websites, web applications and mobile products for clients locally and internationally.',
      og_title: null,
      og_description: null,
    },
    sq: {
      title: 'Rreth nesh',
      sections: aboutSectionsSq,
      seo_title: 'Rreth drh.al | Agjenci Dixhitale në Shqipëri | drh.al',
      seo_description:
        'drh.al është një agjenci zhvillimi web dhe dixhitale me bazë në Shqipëri, që ndërton website, aplikacione web dhe produkte mobile për klientë vendas dhe ndërkombëtarë.',
      og_title: null,
      og_description: null,
    },
  },
  {
    slug: 'contact',
    kind: 'system',
    en: {
      title: 'Contact',
      sections: [contactHeroEn],
      seo_title: 'Start a Project | Contact drh.al',
      seo_description:
        'Tell us about your project. drh.al replies within 24 hours with recommended next steps for websites, web apps, mobile apps, SEO and digital marketing.',
      og_title: null,
      og_description: null,
    },
    sq: {
      title: 'Kontakt',
      sections: [contactHeroSq],
      seo_title: 'Nis një Projekt | Kontakto drh.al',
      seo_description:
        'Na tregoni për projektin tuaj. drh.al përgjigjet brenda 24 orësh me hapat e rekomanduar për website, aplikacione web, aplikacione mobile dhe SEO.',
      og_title: null,
      og_description: null,
    },
  },
  ...landings.map<PageSeed>((l) => ({
    slug: l.slug,
    kind: 'landing' as const,
    en: {
      title: l.title,
      sections: landingSections(l),
      seo_title: l.seoTitle,
      seo_description: l.seoDescription,
      og_title: null,
      og_description: null,
    },
  })),
];

export const pages: PageRow[] = defs.map((d, i) => ({
  id: seedId(NS.page, i + 1),
  slug: d.slug,
  kind: d.kind,
  status: 'published',
  is_indexable: true,
  canonical_url: null,
  og_image: null,
  sort_order: i,
}));

export const pageTranslations: PageTranslationRow[] = defs.flatMap((d, i) => {
  const page_id = seedId(NS.page, i + 1);
  const rows: PageTranslationRow[] = [
    { ...d.en, page_id, language: 'en', is_complete: true },
  ];
  if (d.sq) rows.push({ ...d.sq, page_id, language: 'sq', is_complete: true });
  return rows;
});

export const landingSlugs = landings.map((l) => l.slug);
