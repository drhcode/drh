import type { Language } from '@/types/database';

/**
 * Legal pages.
 *
 * Written to describe what this application actually does — the data the lead
 * form collects, the salted-hash rate limiting, the consent-gated analytics —
 * rather than generic boilerplate. drh.al should still have these reviewed by
 * a lawyer before launch; the content is editable from /admin/pages.
 */

export const LEGAL_LAST_UPDATED = '2026-01-01';

export interface LegalDocument {
  title: string;
  intro: string;
  html: string;
}

type LegalSlug = 'privacy' | 'terms' | 'cookies';

const privacyEn = `
<h2>Who we are</h2>
<p>drh.al is a digital agency based in Albania. For the purposes of the GDPR we are the data controller for personal data collected through this website. You can reach us at <a href="mailto:info@drh.al">info@drh.al</a> or on +355 68 204 1518.</p>

<h2>What we collect, and why</h2>
<h3>When you submit a project enquiry</h3>
<p>The project brief form collects your name, email address and project details, and optionally your phone number, company, website and an attached document. We use this to respond to your enquiry, prepare a proposal and keep a record of the conversation. The legal basis is our legitimate interest in responding to a business enquiry you initiated, and steps taken at your request prior to entering a contract.</p>
<p>We also store attribution data with your enquiry: the page you landed on, the page you submitted from, the referring site, any campaign (UTM) parameters, a coarse country and city derived at the network edge, and a device category. This tells us which channels produce genuine enquiries. It is business analytics, not profiling, and it is never used to make automated decisions about you.</p>

<h3>When you subscribe to our newsletter</h3>
<p>We store your email address, your language preference and where you subscribed from. Consent is the legal basis, and you can withdraw it at any time using the unsubscribe link in any email.</p>

<h3>Analytics and advertising</h3>
<p>We use Google Analytics 4, and may use Google Ads, Meta Pixel and Microsoft Clarity. <strong>None of these load until you accept the matching cookie category.</strong> If you reject optional cookies, no analytics or advertising script is loaded at all.</p>
<p>We also record a small number of first-party events — such as a case study being viewed or a contact link being clicked — without cookies and without any identifier that could single you out.</p>

<h2>What we do not do</h2>
<ul>
  <li>We do not store full IP addresses for analytics. Rate limiting uses a one-way hash of your IP combined with a salt that rotates daily, which cannot be reversed to an address.</li>
  <li>We do not sell personal data.</li>
  <li>We do not use your project brief to train machine learning models.</li>
  <li>We do not send marketing email to people who only submitted a project enquiry.</li>
</ul>

<h2>Who processes data on our behalf</h2>
<p>We use a small number of processors, each under a data processing agreement:</p>
<ul>
  <li><strong>Supabase</strong> — database and file storage for enquiries and website content.</li>
  <li><strong>Resend</strong> — delivery of transactional email (your confirmation and our internal notification).</li>
  <li><strong>Cloudflare Turnstile</strong> — spam protection on our forms.</li>
  <li><strong>Vercel</strong> — website hosting and delivery.</li>
  <li><strong>Google</strong> and <strong>Meta</strong> — analytics and advertising measurement, only with your consent.</li>
</ul>
<p>Where a processor is outside the EEA, transfers rely on the European Commission's Standard Contractual Clauses.</p>

<h2>How long we keep it</h2>
<ul>
  <li>Project enquiries: up to 36 months from our last contact, so we can pick up a conversation that resumes later.</li>
  <li>Newsletter subscriptions: until you unsubscribe.</li>
  <li>Rate limiting hashes: deleted after 24 hours.</li>
  <li>Analytics data: according to the retention period configured in the relevant platform.</li>
</ul>

<h2>Your rights</h2>
<p>You have the right to access, correct, delete, restrict or object to the processing of your personal data, and the right to data portability. Where processing is based on consent, you can withdraw it at any time. Email <a href="mailto:info@drh.al">info@drh.al</a> and we will respond within 30 days. You also have the right to complain to your local data protection authority — in Albania, the Information and Data Protection Commissioner.</p>

<h2>Security</h2>
<p>Data is transmitted over TLS and stored in a database protected by row level security, with access limited to authorised team members. Uploaded documents are stored in a private bucket that is not publicly readable.</p>

<h2>Changes</h2>
<p>If we change this policy we will update the date at the top of this page.</p>
`;

const privacySq = `
<h2>Kush jemi</h2>
<p>drh.al është një agjenci dixhitale me bazë në Shqipëri. Për qëllime të GDPR-së, ne jemi kontrolluesi i të dhënave për të dhënat personale të mbledhura përmes këtij website-i. Mund të na kontaktoni në <a href="mailto:info@drh.al">info@drh.al</a> ose në +355 68 204 1518.</p>

<h2>Çfarë mbledhim dhe pse</h2>
<h3>Kur dërgoni një kërkesë projekti</h3>
<p>Formulari mbledh emrin, adresën e email-it dhe detajet e projektit tuaj, dhe opsionalisht numrin e telefonit, kompaninë, website-in dhe një dokument të bashkëngjitur. I përdorim për t’iu përgjigjur kërkesës, për të përgatitur një ofertë dhe për të mbajtur një regjistrim të bisedës.</p>
<p>Bashkë me kërkesën ruajmë edhe të dhëna atribuimi: faqja ku keni zbritur, faqja nga e dërguat, faqja referuese, parametrat e fushatës (UTM), shteti dhe qyteti i përafërt, si dhe kategoria e pajisjes. Kjo na tregon cilat kanale sjellin kërkesa reale. Është analitikë biznesi, jo profilizim.</p>

<h3>Kur abonoheni në newsletter</h3>
<p>Ruajmë adresën e email-it, gjuhën tuaj dhe burimin e abonimit. Baza ligjore është pëlqimi dhe mund ta tërhiqni në çdo kohë.</p>

<h3>Analitika dhe reklamat</h3>
<p>Përdorim Google Analytics 4 dhe mund të përdorim Google Ads, Meta Pixel dhe Microsoft Clarity. <strong>Asnjëra prej tyre nuk ngarkohet para se ju të pranoni kategorinë përkatëse të cookies.</strong></p>

<h2>Çfarë nuk bëjmë</h2>
<ul>
  <li>Nuk ruajmë adresa IP të plota për analitikë. Kufizimi i shpejtësisë përdor një hash njëkahësh me kripë që ndryshon çdo ditë.</li>
  <li>Nuk shesim të dhëna personale.</li>
  <li>Nuk përdorim përshkrimin e projektit tuaj për të trajnuar modele.</li>
  <li>Nuk dërgojmë email marketingu te personat që kanë dërguar vetëm një kërkesë projekti.</li>
</ul>

<h2>Kush i përpunon të dhënat për ne</h2>
<ul>
  <li><strong>Supabase</strong> — bazë të dhënash dhe ruajtje skedarësh.</li>
  <li><strong>Resend</strong> — dërgimi i email-eve transaksionale.</li>
  <li><strong>Cloudflare Turnstile</strong> — mbrojtje kundër spam-it.</li>
  <li><strong>Vercel</strong> — strehimi i website-it.</li>
  <li><strong>Google</strong> dhe <strong>Meta</strong> — analitikë dhe matje reklamash, vetëm me pëlqimin tuaj.</li>
</ul>

<h2>Sa kohë i mbajmë</h2>
<ul>
  <li>Kërkesat e projekteve: deri në 36 muaj nga kontakti i fundit.</li>
  <li>Abonimet: derisa të çregjistroheni.</li>
  <li>Hash-et e kufizimit: fshihen pas 24 orësh.</li>
</ul>

<h2>Të drejtat tuaja</h2>
<p>Keni të drejtë të aksesoni, korrigjoni, fshini, kufizoni ose kundërshtoni përpunimin e të dhënave tuaja, si dhe të drejtën e transferueshmërisë. Shkruani në <a href="mailto:info@drh.al">info@drh.al</a> dhe përgjigjemi brenda 30 ditësh. Keni gjithashtu të drejtë të ankoheni te Komisioneri për të Drejtën e Informimit dhe Mbrojtjen e të Dhënave Personale.</p>

<h2>Siguria</h2>
<p>Të dhënat transmetohen përmes TLS dhe ruhen në një bazë të dhënash të mbrojtur me row level security. Dokumentet e ngarkuara ruhen në një hapësirë private.</p>
`;

const cookiesEn = `
<h2>How we use cookies</h2>
<p>We keep cookie use to a minimum. Nothing beyond what the site needs to function is set until you choose to allow it.</p>

<h2>Categories</h2>
<h3>Necessary</h3>
<p>Required for the site to work. These remember your theme preference, your language, and your cookie choices themselves. They set no third-party cookie and cannot be switched off.</p>

<h3>Analytics</h3>
<p>Google Analytics 4 and Microsoft Clarity, used to understand which pages are useful and where visitors get stuck. Loaded only if you accept this category.</p>

<h3>Marketing</h3>
<p>Google Ads and Meta Pixel, used to measure whether an advertising campaign produced an enquiry. Loaded only if you accept this category.</p>

<h2>Changing your mind</h2>
<p>Select <strong>Cookie Settings</strong> in the footer at any time to review or change your choices. Rejecting optional cookies prevents the corresponding scripts from loading at all — they are not loaded and then disabled.</p>

<h2>What we store locally</h2>
<p>Your theme preference, your cookie choices and basic campaign attribution are kept in your browser's local storage rather than in cookies. They stay on your device and are only sent to us if you submit an enquiry, so we can tell which channel it came from.</p>
`;

const cookiesSq = `
<h2>Si i përdorim cookies</h2>
<p>Përdorimin e cookies e mbajmë në minimum. Asgjë përtej asaj që i duhet faqes për të funksionuar nuk vendoset pa zgjedhjen tuaj.</p>

<h2>Kategoritë</h2>
<h3>Të nevojshme</h3>
<p>Të domosdoshme për funksionimin e faqes. Mbajnë mend temën, gjuhën dhe vetë zgjedhjet tuaja për cookies. Nuk vendosin asnjë cookie të palës së tretë dhe nuk mund të çaktivizohen.</p>

<h3>Analitikë</h3>
<p>Google Analytics 4 dhe Microsoft Clarity, për të kuptuar cilat faqe janë të dobishme. Ngarkohen vetëm nëse e pranoni këtë kategori.</p>

<h3>Marketing</h3>
<p>Google Ads dhe Meta Pixel, për të matur nëse një fushatë solli një kërkesë. Ngarkohen vetëm nëse e pranoni këtë kategori.</p>

<h2>Ndryshimi i zgjedhjes</h2>
<p>Zgjidhni <strong>Preferencat e Cookies</strong> në fund të faqes në çdo kohë. Refuzimi i cookies opsionale i pengon skriptet përkatëse të ngarkohen fare.</p>

<h2>Çfarë ruajmë lokalisht</h2>
<p>Preferenca e temës, zgjedhjet për cookies dhe atribuimi bazë i fushatave ruhen në local storage të shfletuesit tuaj, jo në cookies.</p>
`;

const termsEn = `
<h2>Scope</h2>
<p>These terms cover use of the drh.al website. Client work is governed by the separate written agreement or statement of work signed for that project; where the two differ, the signed agreement takes precedence.</p>

<h2>Using this website</h2>
<p>You may browse, read and share this site freely. You may not scrape it at a rate that degrades service for others, attempt to gain unauthorised access to the admin area or any API, or submit content through our forms that is unlawful or infringing.</p>

<h2>Content and intellectual property</h2>
<p>The design, code, text and images on this site are owned by drh.al or used with permission. Client names and marks shown in case studies remain the property of their owners and are used to describe work delivered.</p>
<p>You may quote or link to our articles with attribution and a link to the original page. Republishing an article in full without permission is not permitted.</p>

<h2>Ownership of client work</h2>
<p>For projects we deliver: on final payment, ownership of the design, source code and content produced for the project transfers to the client, along with access to every account created for it. This is stated here because we are asked often, but the binding terms are in the project agreement.</p>

<h2>Enquiries and proposals</h2>
<p>Submitting a project brief does not create a contract. Prices, timelines and scope discussed before a signed agreement are estimates. Any figures published on this site — including the price ranges in our articles — are indicative guidance, not an offer.</p>

<h2>No warranty on published guidance</h2>
<p>Articles and guides on this site are provided for information. They are not legal, financial or professional advice, and outcomes described for one project do not imply the same outcome for another.</p>

<h2>Third-party links</h2>
<p>We link to external sites we consider useful. We do not control them and are not responsible for their content or practices.</p>

<h2>Liability</h2>
<p>This website is provided as-is. To the extent permitted by law, drh.al is not liable for indirect or consequential loss arising from use of this website. Nothing here limits liability that cannot be limited by law.</p>

<h2>Governing law</h2>
<p>These terms are governed by the laws of Albania. For client engagements, the governing law is whatever the project agreement specifies.</p>

<h2>Contact</h2>
<p>Questions about these terms: <a href="mailto:info@drh.al">info@drh.al</a>.</p>
`;

const termsSq = `
<h2>Fushëveprimi</h2>
<p>Këto kushte mbulojnë përdorimin e website-it drh.al. Puna me klientët rregullohet nga marrëveshja e veçantë me shkrim e nënshkruar për atë projekt; në rast mospërputhjeje, marrëveshja e nënshkruar ka përparësi.</p>

<h2>Përdorimi i këtij website-i</h2>
<p>Mund ta shfletoni, lexoni dhe shpërndani lirisht. Nuk lejohet nxjerrja automatike e të dhënave me ritëm që dëmton shërbimin, tentativa për akses të paautorizuar në zonën e administrimit ose në API, dhe dërgimi i përmbajtjes së paligjshme përmes formularëve tanë.</p>

<h2>Përmbajtja dhe pronësia intelektuale</h2>
<p>Dizajni, kodi, tekstet dhe imazhet e kësaj faqeje janë pronë e drh.al ose përdoren me leje. Emrat dhe shenjat e klientëve në rastet e studimit mbeten pronë e zotëruesve të tyre.</p>
<p>Mund të citoni ose të lidheni me artikujt tanë me atribuim dhe një lidhje te faqja origjinale. Ribotimi i plotë pa leje nuk lejohet.</p>

<h2>Pronësia e punës për klientët</h2>
<p>Për projektet që dorëzojmë: me pagesën përfundimtare, pronësia e dizajnit, kodit burimor dhe përmbajtjes kalon te klienti, së bashku me aksesin te çdo llogari e krijuar për projektin.</p>

<h2>Kërkesat dhe ofertat</h2>
<p>Dërgimi i një kërkese nuk krijon kontratë. Çmimet, afatet dhe fushëveprimi i diskutuar para një marrëveshjeje të nënshkruar janë vlerësime. Shifrat e publikuara në këtë faqe janë orientuese, jo ofertë.</p>

<h2>Pa garanci për udhëzimet e publikuara</h2>
<p>Artikujt në këtë faqe janë për informim. Nuk janë këshillë ligjore, financiare ose profesionale.</p>

<h2>Lidhjet e palëve të treta</h2>
<p>Lidhemi me faqe të jashtme që i konsiderojmë të dobishme. Nuk i kontrollojmë dhe nuk jemi përgjegjës për përmbajtjen e tyre.</p>

<h2>Përgjegjësia</h2>
<p>Ky website ofrohet “siç është”. Në masën e lejuar nga ligji, drh.al nuk mban përgjegjësi për humbje indirekte që rrjedhin nga përdorimi i tij.</p>

<h2>Ligji i zbatueshëm</h2>
<p>Këto kushte rregullohen nga legjislacioni i Republikës së Shqipërisë.</p>

<h2>Kontakt</h2>
<p>Pyetje rreth këtyre kushteve: <a href="mailto:info@drh.al">info@drh.al</a>.</p>
`;

const documents: Record<LegalSlug, Record<Language, LegalDocument>> = {
  privacy: {
    en: {
      title: 'Privacy Policy',
      intro:
        'What drh.al collects through this website, why, how long we keep it and what you can ask us to do about it.',
      html: privacyEn,
    },
    sq: {
      title: 'Politika e Privatësisë',
      intro:
        'Çfarë mbledh drh.al përmes këtij website-i, pse, sa kohë e mbajmë dhe çfarë mund të kërkoni ju.',
      html: privacySq,
    },
  },
  cookies: {
    en: {
      title: 'Cookie Policy',
      intro: 'Which cookies this site uses, what each category does, and how to change your choice.',
      html: cookiesEn,
    },
    sq: {
      title: 'Politika e Cookies',
      intro:
        'Cilat cookies përdor kjo faqe, çfarë bën secila kategori dhe si ta ndryshoni zgjedhjen tuaj.',
      html: cookiesSq,
    },
  },
  terms: {
    en: {
      title: 'Terms of Service',
      intro: 'The terms that apply to using this website, and how they relate to client agreements.',
      html: termsEn,
    },
    sq: {
      title: 'Kushtet e Shërbimit',
      intro:
        'Kushtet që zbatohen për përdorimin e këtij website-i dhe si lidhen me marrëveshjet me klientët.',
      html: termsSq,
    },
  },
};

export function getLegalDocument(slug: LegalSlug, language: Language): LegalDocument {
  return documents[slug][language] ?? documents[slug].en;
}

export const LEGAL_SLUGS: LegalSlug[] = ['privacy', 'terms', 'cookies'];
