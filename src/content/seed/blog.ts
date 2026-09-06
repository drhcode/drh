import type {
  BlogCategoryRow,
  BlogPostRow,
  BlogTranslationRow,
} from '@/types/database';
import { NS, seedId } from '../ids';
import { serviceIdBySlug } from './services';

export const blogCategories: BlogCategoryRow[] = [
  { slug: 'web-development', name_en: 'Web Development', name_sq: 'Zhvillim Web' },
  { slug: 'seo', name_en: 'SEO', name_sq: 'SEO' },
  { slug: 'web-apps', name_en: 'Web Apps & Mobile Apps', name_sq: 'Aplikacione Web & Mobile' },
  { slug: 'design', name_en: 'Design', name_sq: 'Dizajn' },
].map((c, i) => ({ id: seedId(NS.blogCategory, i + 1), sort_order: i, ...c }));

const categoryId = (slug: string) => blogCategories.find((c) => c.slug === slug)!.id;

/** ~200 words per minute, rounded up, minimum 1. */
export function readingTime(html: string): number {
  const words = html
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const post1En = `
<p>It is the first question almost every business asks, and the honest answer is that price follows scope, not page count. A five-page site with custom functionality can cost more than a twenty-page brochure site. What follows is how we actually price work in 2026, and what moves a project from one band to the next.</p>

<h2>The short answer</h2>
<table>
  <thead><tr><th>Type of project</th><th>Typical range</th></tr></thead>
  <tbody>
    <tr><td>Single landing page, one language</td><td>Under €2,000</td></tr>
    <tr><td>Business website, custom design, CMS</td><td>€2,000 – €5,000</td></tr>
    <tr><td>Multilingual corporate site, SEO groundwork</td><td>€5,000 – €15,000</td></tr>
    <tr><td>E-commerce store or custom web application</td><td>€15,000 – €30,000</td></tr>
    <tr><td>Platform, SaaS product, complex integrations</td><td>€30,000+</td></tr>
  </tbody>
</table>
<p>These are ranges for work built to a professional standard: custom design, hand-written code or a purpose-built theme, a CMS your team can use, performance work and SEO fundamentals. They are not the price of a marketplace template with content pasted in.</p>

<h2>What actually drives the price</h2>

<h3>1. Design: template, adapted, or original</h3>
<p>Using an existing template is the cheapest route and it shows — most of the cost saved is paid back later in performance problems and in looking like four competitors. An original design costs more up front because it starts from your audience and your content rather than from a demo layout.</p>

<h3>2. Number of unique page templates</h3>
<p>Twenty pages that share four templates cost far less than eight pages that each need their own layout. When you request a quote, count distinct <em>templates</em>, not pages.</p>

<h3>3. Languages</h3>
<p>A second language is not a translation plugin. It is a second set of content, metadata, URLs and navigation, plus correct <code>hreflang</code> so search engines serve the right version. Expect a genuinely bilingual site to add roughly 20–35% to a build, most of which is content work rather than code.</p>

<h3>4. Custom functionality</h3>
<p>Booking systems, calculators, member areas, dashboards, integrations with a CRM or ERP — anything with business logic behind it — move a project from a website budget into a software budget. This is where the €15,000 line usually gets crossed.</p>

<h3>5. Content</h3>
<p>The most common cause of delay in Albania and everywhere else. If copy, photography and product data are ready, the project moves. If they are not, someone has to produce them, and that is a real cost whether it appears on the invoice or in the timeline.</p>

<h2>What should always be included</h2>
<ul>
  <li>Mobile-first responsive layouts, tested on real devices</li>
  <li>Core Web Vitals addressed during the build, not after</li>
  <li>A CMS for the content you change regularly</li>
  <li>Basic on-page SEO: titles, descriptions, headings, structured data, sitemap</li>
  <li>Analytics and conversion tracking that actually records enquiries</li>
  <li>SSL, backups, and a documented handover</li>
  <li>Ownership of the code, the design and every account</li>
</ul>
<p>If a quote does not include these, it is not cheaper — it is smaller.</p>

<h2>Ongoing costs to plan for</h2>
<p>Budget for hosting (roughly €10–€60 per month depending on stack and traffic), a domain (€10–€30 per year), and maintenance if you want updates, monitoring and backups handled for you. If you are running Google Ads or SEO, that is a separate monthly line — and it should be judged on cost per qualified lead, not on traffic.</p>

<h2>How to compare two quotes properly</h2>
<p>Put them side by side and ask four questions: What is the deliverable, exactly? Who owns the result? What happens after launch? And what is <em>not</em> included? A price is only comparable once those four answers are.</p>

<h2>How we quote</h2>
<p>We do not publish a rate card, because a number without a scope is meaningless. We ask what the site has to achieve, what exists today, and what constraints you are working within. Then we send a fixed price against a written scope, so you know what you are buying before you commit.</p>
`;

const post1Sq = `
<p>Është pyetja e parë që bën pothuajse çdo biznes, dhe përgjigjja e ndershme është se çmimi ndjek fushëveprimin, jo numrin e faqeve. Një faqe me pesë seksione dhe funksionalitet të personalizuar mund të kushtojë më shumë se një faqe njëzet-faqëshe prezantuese. Ja si e vlerësojmë ne punën në 2026 dhe çfarë e zhvendos një projekt nga një nivel në tjetrin.</p>

<h2>Përgjigjja e shkurtër</h2>
<table>
  <thead><tr><th>Lloji i projektit</th><th>Diapazoni tipik</th></tr></thead>
  <tbody>
    <tr><td>Një landing page, një gjuhë</td><td>Nën €2,000</td></tr>
    <tr><td>Website biznesi, dizajn i personalizuar, CMS</td><td>€2,000 – €5,000</td></tr>
    <tr><td>Faqe korporative shumëgjuhëshe, bazë SEO</td><td>€5,000 – €15,000</td></tr>
    <tr><td>Dyqan e-commerce ose aplikacion web</td><td>€15,000 – €30,000</td></tr>
    <tr><td>Platformë, produkt SaaS, integrime komplekse</td><td>€30,000+</td></tr>
  </tbody>
</table>
<p>Këto janë diapazone për punë të ndërtuar me standard profesional: dizajn i personalizuar, kod i shkruar posaçërisht, një CMS që ekipi juaj mund ta përdorë, punë për performancën dhe bazat e SEO. Nuk janë çmimi i një template-i të gatshëm me përmbajtje të ngjitur brenda.</p>

<h2>Çfarë e përcakton vërtet çmimin</h2>

<h3>1. Dizajni: template, i përshtatur, apo origjinal</h3>
<p>Përdorimi i një template-i ekzistues është rruga më e lirë dhe duket — pjesa më e madhe e kursimit paguhet më vonë me probleme performance dhe duke u dukur si katër konkurrentë të tjerë.</p>

<h3>2. Numri i template-ve unike</h3>
<p>Njëzet faqe që ndajnë katër template kushtojnë shumë më pak se tetë faqe që kërkojnë secila layout-in e vet. Kur kërkoni ofertë, numëroni <em>template</em>, jo faqe.</p>

<h3>3. Gjuhët</h3>
<p>Një gjuhë e dytë nuk është një plugin përkthimi. Është një grup i dytë përmbajtjeje, metadatash, URL-sh dhe navigimi, plus <code>hreflang</code> i saktë. Prisni që një faqe vërtet dygjuhëshe të shtojë rreth 20–35% mbi ndërtimin.</p>

<h3>4. Funksionaliteti i personalizuar</h3>
<p>Sisteme rezervimi, llogaritës, zona anëtarësh, dashboard, integrime me CRM ose ERP — çdo gjë me logjikë biznesi pas saj — e zhvendos projektin nga një buxhet website në një buxhet software.</p>

<h3>5. Përmbajtja</h3>
<p>Shkaku më i zakonshëm i vonesave. Nëse teksti, fotografia dhe të dhënat e produkteve janë gati, projekti ecën. Nëse jo, dikush duhet t’i prodhojë, dhe kjo është një kosto reale.</p>

<h2>Çfarë duhet të përfshihet gjithmonë</h2>
<ul>
  <li>Layout responsiv mobile-first, i testuar në pajisje reale</li>
  <li>Core Web Vitals të trajtuara gjatë ndërtimit</li>
  <li>Një CMS për përmbajtjen që ndryshoni rregullisht</li>
  <li>SEO bazë on-page: tituj, përshkrime, të dhëna të strukturuara, sitemap</li>
  <li>Analitikë dhe gjurmim konvertimesh që regjistron vërtet kërkesat</li>
  <li>SSL, backup dhe një dorëzim i dokumentuar</li>
  <li>Pronësi mbi kodin, dizajnin dhe çdo llogari</li>
</ul>

<h2>Kosto të vazhdueshme për të planifikuar</h2>
<p>Planifikoni hosting (rreth €10–€60 në muaj), domain (€10–€30 në vit) dhe mirëmbajtje nëse doni përditësime, monitorim dhe backup. Nëse zhvilloni Google Ads ose SEO, kjo është një zë i veçantë mujor — dhe duhet gjykuar mbi koston për kontakt të kualifikuar.</p>

<h2>Si i krahasoni dy oferta si duhet</h2>
<p>Vendosini krah për krah dhe bëni katër pyetje: Cili është saktësisht produkti i dorëzuar? Kush e zotëron rezultatin? Çfarë ndodh pas lansimit? Dhe çfarë <em>nuk</em> përfshihet?</p>

<h2>Si e kuotojmë ne</h2>
<p>Nuk publikojmë listë çmimesh, sepse një numër pa fushëveprim është i pakuptimtë. Pyesim çfarë duhet të arrijë faqja, çfarë ekziston sot dhe me çfarë kufizimesh punoni. Pastaj dërgojmë një çmim fiks mbi një fushëveprim me shkrim.</p>
`;

const post2En = `
<p>If your customers are in Tirana, most of your search opportunity is local. Someone typing "dentist near me", "avokat Tiranë" or "roofing company Tirana" is close to a decision — and local results are decided by a different set of signals than national rankings. Here is the sequence we work through.</p>

<h2>1. Google Business Profile is the foundation</h2>
<p>For local queries, your Business Profile is frequently more important than your website. Complete every field, not the minimum:</p>
<ul>
  <li>Exact business name — resist the temptation to stuff keywords into it</li>
  <li>Precise category, plus secondary categories that genuinely apply</li>
  <li>Address and service area, consistent to the character with your website</li>
  <li>Opening hours, including holiday hours</li>
  <li>Real photographs of the premises, team and work</li>
  <li>Services and products listed individually</li>
</ul>
<p>Then keep it alive. Profiles that post updates, answer questions and respond to reviews perform better than profiles that were completed once and abandoned.</p>

<h2>2. Make NAP consistency boring</h2>
<p>Name, address and phone number must match exactly everywhere they appear: your website footer, your Business Profile, directories, social profiles. "Rr. Myslym Shyri" in one place and "Rruga Myslym Shyri" in another is a small inconsistency that dilutes a signal you are otherwise working hard to build.</p>

<h2>3. Build real location and service pages</h2>
<p>A single "Services" page cannot rank for eight different services. Give each service its own page with genuine content: what it involves, who it is for, what it costs or how pricing works, and what happens next.</p>
<p>The same applies to locations — but only where you genuinely operate. Generating a page for every city in Albania with the name swapped out is the fastest way to build a site full of near-duplicate pages that Google will ignore. Two strong location pages beat twenty thin ones.</p>

<h2>4. Answer questions in Albanian and English</h2>
<p>Tirana searches happen in both languages, often from the same person. If you serve international clients or the diaspora, publish both properly — separate URLs, independent metadata, and <code>hreflang</code> tags so Google knows which version to show whom. A machine-translated duplicate helps nobody.</p>

<h2>5. Reviews: ask, respond, never fabricate</h2>
<p>Review volume and recency both matter. Ask satisfied customers directly, at the moment the work is finished. Respond to every review, including the critical ones — a measured reply to a complaint reassures the next reader more than a wall of five stars.</p>
<p>Do not buy reviews and do not write them yourself. Beyond the platform risk, marking up fake ratings in structured data is a policy violation that can cost you rich results entirely.</p>

<h2>6. Get the technical basics right</h2>
<ul>
  <li><strong>LocalBusiness structured data</strong> with your real address, hours and contact details</li>
  <li><strong>Mobile performance</strong> — local searches skew heavily to phones, often on mobile data</li>
  <li><strong>Click-to-call</strong> phone numbers as real <code>tel:</code> links</li>
  <li><strong>An embedded map</strong> and clear directions</li>
  <li><strong>Fast LCP</strong> — the hero image is usually the culprit</li>
</ul>

<h2>7. Earn local relevance</h2>
<p>Links and mentions from Albanian sources — local business associations, suppliers, partners, chambers of commerce, local press covering something you genuinely did — carry more weight for local visibility than generic international directories.</p>

<h2>8. Measure enquiries, not positions</h2>
<p>Connect Search Console and analytics, then track what matters: calls, form submissions, WhatsApp clicks and direction requests. A position that does not produce enquiries is a metric, not a result. Review your top queries monthly and write content against the questions people are actually asking.</p>

<h2>A realistic timeline</h2>
<p>Business Profile improvements can show within weeks. Content and technical work typically take two to four months to compound. Anyone promising page one in thirty days is either targeting queries nobody searches or is not being straight with you.</p>
`;

const post3En = `
<p>Founders ask this early, usually before there is enough information to answer it well. The right sequence depends on how people will use the product, not on which platform sounds more ambitious.</p>

<h2>Start with the usage pattern</h2>
<p>Three questions settle most of the decision:</p>
<ol>
  <li><strong>How often will someone use it?</strong> Daily, habitual use justifies an app. Occasional use rarely survives the install step.</li>
  <li><strong>Where are they when they use it?</strong> On the move, one-handed, possibly offline — that is mobile. At a desk, alongside other tools — that is web.</li>
  <li><strong>Do you need device capabilities?</strong> Camera, GPS, Bluetooth, background location, reliable push. If the core function depends on one of these, you need an app.</li>
</ol>

<h2>Why a web app is usually first</h2>
<ul>
  <li><strong>Nothing to install.</strong> A link is the entire onboarding step, which matters enormously before anyone trusts you.</li>
  <li><strong>You ship when you want.</strong> No review queue between a fix and your users.</li>
  <li><strong>One codebase, every device.</strong> Desktop and mobile browsers from the same build.</li>
  <li><strong>Cheaper to validate.</strong> You find out whether people want it before paying for two platforms.</li>
  <li><strong>Searchable.</strong> Web apps can be found on Google. App Store search is a far narrower door.</li>
</ul>
<p>For most B2B tools, dashboards, marketplaces, portals and booking systems, the web is the right first move — and often the only move you need.</p>

<h2>When a mobile app genuinely wins</h2>
<ul>
  <li>Daily, habitual use where a home-screen icon changes behaviour</li>
  <li>Push notifications that are core to the product, not a marketing add-on</li>
  <li>Hardware access: camera, sensors, GPS, Bluetooth, offline storage</li>
  <li>Consumer products where the store itself is a distribution channel</li>
  <li>Field work with unreliable connectivity</li>
</ul>

<h2>The middle path: an installable web app</h2>
<p>A progressive web app installs to the home screen, works offline and — on both Android and iOS — supports web push. For a large share of products, that closes most of the gap at a fraction of the cost. It is not a full substitute: deep hardware integration, background processing and store presence still require native. But as a step between "website" and "two native apps", it is frequently the right one.</p>

<h2>A sequence that usually works</h2>
<ol>
  <li><strong>Web app first.</strong> Prove the core workflow with real users.</li>
  <li><strong>Make it installable.</strong> Add offline support and push once usage justifies it.</li>
  <li><strong>Go native when the data says so.</strong> When mobile usage dominates and users ask for an app, build it — with a validated product rather than a guess.</li>
</ol>

<h2>What it costs to be wrong</h2>
<p>Building a mobile app first and discovering the product is really a desktop workflow is an expensive lesson: two store submissions, two review cycles and a codebase built around the wrong constraints. Building web-first and later adding an app is a much cheaper order of operations, because the API, the data model and the business logic carry over intact.</p>

<h2>The one question worth asking</h2>
<p>Would someone open this on their phone tomorrow morning without being reminded? If the honest answer is no, build the web app first.</p>
`;

interface PostSeed {
  slug: string;
  category: string;
  service: string;
  featured: boolean;
  published_at: string;
  en: { title: string; excerpt: string; content: string; seo_title: string; seo_description: string };
  sq?: { title: string; excerpt: string; content: string; seo_title: string; seo_description: string };
}

const defs: PostSeed[] = [
  {
    slug: 'how-much-does-a-website-cost-in-albania-2026',
    category: 'web-development',
    service: 'web-development',
    featured: true,
    published_at: '2026-01-14T09:00:00.000Z',
    en: {
      title: 'How Much Does a Website Cost in Albania in 2026?',
      excerpt:
        'Real price ranges for business websites, multilingual corporate sites, e-commerce and custom applications — and the five factors that actually move a quote from one band to the next.',
      content: post1En,
      seo_title: 'How Much Does a Website Cost in Albania in 2026? | drh.al',
      seo_description:
        'Website costs in Albania in 2026: real price ranges for business sites, multilingual corporate websites, e-commerce and web applications, and what drives the price.',
    },
    sq: {
      title: 'Sa Kushton një Website në Shqipëri në 2026?',
      excerpt:
        'Diapazone reale çmimesh për website biznesi, faqe korporative shumëgjuhëshe, e-commerce dhe aplikacione të personalizuara — dhe pesë faktorët që e zhvendosin ofertën.',
      content: post1Sq,
      seo_title: 'Sa Kushton një Website në Shqipëri në 2026? | drh.al',
      seo_description:
        'Kostoja e një website në Shqipëri në 2026: diapazone reale çmimesh për faqe biznesi, korporative shumëgjuhëshe, e-commerce dhe aplikacione web.',
    },
  },
  {
    slug: 'local-seo-for-tirana-businesses-2026-playbook',
    category: 'seo',
    service: 'seo',
    featured: true,
    published_at: '2026-02-04T09:00:00.000Z',
    en: {
      title: 'Local SEO for Tirana Businesses: A 2026 Playbook',
      excerpt:
        'A practical sequence for ranking in local search in Tirana: Business Profile, NAP consistency, real location pages, bilingual content, reviews and the technical basics.',
      content: post2En,
      seo_title: 'Local SEO for Tirana Businesses: 2026 Playbook | drh.al',
      seo_description:
        'A practical local SEO playbook for businesses in Tirana: Google Business Profile, NAP consistency, service and location pages, bilingual content and reviews.',
    },
  },
  {
    slug: 'web-app-vs-mobile-app-which-should-you-build-first',
    category: 'web-apps',
    service: 'web-app-development',
    featured: false,
    published_at: '2026-02-25T09:00:00.000Z',
    en: {
      title: 'Web App vs. Mobile App: Which Should You Build First?',
      excerpt:
        'How usage frequency, context and device capabilities decide the order — and why building web-first is usually the cheaper path to the same destination.',
      content: post3En,
      seo_title: 'Web App vs Mobile App: Which to Build First? | drh.al',
      seo_description:
        'Web app or mobile app first? How usage frequency, context and device capabilities decide, plus the installable web app middle path and a sequence that works.',
    },
  },
];

export const blogPosts: BlogPostRow[] = defs.map((d, i) => ({
  id: seedId(NS.blogPost, i + 1),
  slug: d.slug,
  category_id: categoryId(d.category),
  author_id: null,
  author_name: 'drh.al',
  featured_image: `/media/blog/${d.slug}.svg`,
  og_image: null,
  status: 'published',
  featured: d.featured,
  is_indexable: true,
  published_at: d.published_at,
  reading_time: readingTime(d.en.content),
  view_count: 0,
  related_service_id: serviceIdBySlug.get(d.service) ?? null,
}));

export const blogTranslations: BlogTranslationRow[] = defs.flatMap((d, i) => {
  const post_id = seedId(NS.blogPost, i + 1);
  const rows: BlogTranslationRow[] = [
    {
      post_id,
      language: 'en',
      title: d.en.title,
      excerpt: d.en.excerpt,
      content_html: d.en.content,
      seo_title: d.en.seo_title,
      seo_description: d.en.seo_description,
      og_title: null,
      og_description: null,
      is_complete: true,
    },
  ];
  // Posts without an Albanian translation are intentionally left untranslated so
  // the admin translation-status UI and the "do not expose incomplete
  // translations to search engines" rule (spec §10) are exercised by real data.
  if (d.sq) {
    rows.push({
      post_id,
      language: 'sq',
      title: d.sq.title,
      excerpt: d.sq.excerpt,
      content_html: d.sq.content,
      seo_title: d.sq.seo_title,
      seo_description: d.sq.seo_description,
      og_title: null,
      og_description: null,
      is_complete: true,
    });
  }
  return rows;
});
