import type { IndustryRow, IndustryTranslationRow } from '@/types/database';
import { NS, seedId } from '../ids';

interface IndustrySeed {
  slug: string;
  icon_key: string;
  featured: boolean;
  en: Omit<IndustryTranslationRow, 'industry_id' | 'language' | 'is_complete'>;
  sq: Omit<IndustryTranslationRow, 'industry_id' | 'language' | 'is_complete'>;
}

const defs: IndustrySeed[] = [
  {
    slug: 'construction',
    icon_key: 'hard-hat',
    featured: true,
    en: {
      title: 'Roofing & Construction',
      hero_title: 'Websites That Win Construction Contracts',
      hero_subtitle: 'Digital presence for contractors, roofers and construction firms in Albania and abroad.',
      description:
        'Construction buyers check credibility before they call. A clear project record, honest photography and fast answers to the questions that decide a contract matter more than decoration.',
      problems: [
        { title: 'Work that is invisible online', body: 'Years of completed projects exist only in a phone gallery, so credibility has to be rebuilt in every conversation.' },
        { title: 'Enquiries with no detail', body: 'Contact forms that ask for a name and message produce calls that waste an hour qualifying.' },
        { title: 'Invisible in local search', body: 'Competitors appear for "roofing" or "construction company" searches in your city and you do not.' },
      ],
      solutions: [
        { title: 'A project record that sells', body: 'Structured project pages with scope, location, timeline and photography — the proof a buyer needs.' },
        { title: 'Qualifying enquiry forms', body: 'Project type, scale, location and timeline captured up front, so your first call is already informed.' },
        { title: 'Local search visibility', body: 'Service and location pages, Google Business Profile and local schema that put you in the map results.' },
      ],
      cta_title: 'Ready to turn completed projects into new contracts?',
      cta_body: 'Tell us about your company and the work you want more of.',
      seo_title: 'Web Design for Construction & Roofing Companies | drh.al',
      seo_description:
        'Websites for construction and roofing companies in Albania: project portfolios, qualifying enquiry forms and local SEO that generates contract enquiries.',
    },
    sq: {
      title: 'Ndërtim & Çati',
      hero_title: 'Website që Fitojnë Kontrata Ndërtimi',
      hero_subtitle: 'Prani dixhitale për kontraktorë dhe kompani ndërtimi në Shqipëri dhe jashtë saj.',
      description:
        'Blerësit në ndërtim kontrollojnë kredibilitetin para se të telefonojnë. Një historik i qartë projektesh, fotografi e ndershme dhe përgjigje të shpejta kanë më shumë rëndësi se dekorimi.',
      problems: [
        { title: 'Punë që nuk duket online', body: 'Vite projektesh të përfunduara ekzistojnë vetëm në galerinë e telefonit.' },
        { title: 'Kërkesa pa detaje', body: 'Formularë që kërkojnë vetëm emër dhe mesazh sjellin telefonata që harxhojnë një orë për kualifikim.' },
        { title: 'Të padukshëm në kërkimin lokal', body: 'Konkurrentët shfaqen për kërkime si “kompani ndërtimi” në qytetin tuaj, ju jo.' },
      ],
      solutions: [
        { title: 'Një portofol që shet', body: 'Faqe projektesh të strukturuara me fushëveprim, vendndodhje, afat dhe fotografi — provat që i duhen blerësit.' },
        { title: 'Formularë që kualifikojnë', body: 'Lloji i projektit, përmasa, vendndodhja dhe afati mblidhen që në fillim.' },
        { title: 'Dukshmëri në kërkimin lokal', body: 'Faqe shërbimesh dhe vendndodhjesh, Google Business Profile dhe schema lokale.' },
      ],
      cta_title: 'Gati t’i ktheni projektet e përfunduara në kontrata të reja?',
      cta_body: 'Na tregoni për kompaninë tuaj dhe punën që doni të keni më shumë.',
      seo_title: 'Website për Kompani Ndërtimi dhe Çatish | drh.al',
      seo_description:
        'Website për kompani ndërtimi në Shqipëri: portofol projektesh, formularë kualifikues dhe SEO lokal që gjeneron kërkesa për kontrata.',
    },
  },
  {
    slug: 'real-estate',
    icon_key: 'building',
    featured: true,
    en: {
      title: 'Real Estate',
      hero_title: 'Property Websites Built for Enquiries',
      hero_subtitle: 'Listing platforms and agency websites for the Albanian and international property market.',
      description:
        'Property buyers compare fast and decide slowly. Your site has to load instantly on mobile, make search effortless, and give a serious buyer a reason to trust the agency behind the listing.',
      problems: [
        { title: 'Listings that are slow to browse', body: 'Heavy galleries and unoptimised images lose mobile buyers before the second property.' },
        { title: 'Manual listing management', body: 'Updating properties means emailing a developer, so the site is always out of date.' },
        { title: 'International buyers unserved', body: 'A single-language site with local-only context loses the diaspora and foreign investor audience.' },
      ],
      solutions: [
        { title: 'Fast, filterable search', body: 'Location, price, size and type filters with optimised images that stay quick on mobile data.' },
        { title: 'A listing CMS your agents run', body: 'Add, edit, feature and archive properties without touching code.' },
        { title: 'Multilingual by design', body: 'Albanian and English content with correct hreflang, so both audiences find you in search.' },
      ],
      cta_title: 'Want a property site that generates viewings?',
      cta_body: 'Tell us about your portfolio and target buyers.',
      seo_title: 'Real Estate Website Development Albania | drh.al',
      seo_description:
        'Real estate websites and listing platforms in Albania: fast property search, an agent-friendly CMS, multilingual content and enquiry-focused design.',
    },
    sq: {
      title: 'Pasuri të Paluajtshme',
      hero_title: 'Website Pronash të Ndërtuara për Kërkesa',
      hero_subtitle: 'Platforma listimesh dhe website agjencish për tregun shqiptar dhe atë ndërkombëtar.',
      description:
        'Blerësit e pronave krahasojnë shpejt dhe vendosin ngadalë. Faqja juaj duhet të ngarkohet menjëherë në celular dhe t’i japë blerësit një arsye për të besuar agjencinë.',
      problems: [
        { title: 'Listime të ngadalta për t’u shfletuar', body: 'Galeri të rënda dhe imazhe të paoptimizuara humbasin blerësit para pronës së dytë.' },
        { title: 'Menaxhim manual i listimeve', body: 'Përditësimi i pronave kërkon një zhvillues, prandaj faqja është gjithmonë e vjetëruar.' },
        { title: 'Blerësit ndërkombëtarë të pashërbyer', body: 'Një faqe njëgjuhëshe humbet diasporën dhe investitorët e huaj.' },
      ],
      solutions: [
        { title: 'Kërkim i shpejtë me filtra', body: 'Filtra për vendndodhje, çmim, sipërfaqe dhe tip, me imazhe të optimizuara për celular.' },
        { title: 'Një CMS që e drejtojnë agjentët', body: 'Shtoni, redaktoni dhe arkivoni prona pa prekur kodin.' },
        { title: 'Shumëgjuhësh nga dizajni', body: 'Përmbajtje shqip dhe anglisht me hreflang të saktë.' },
      ],
      cta_title: 'Doni një faqe pronash që gjeneron vizita?',
      cta_body: 'Na tregoni për portofolin dhe blerësit që synoni.',
      seo_title: 'Zhvillim Website për Pasuri të Paluajtshme Shqipëri | drh.al',
      seo_description:
        'Website dhe platforma listimesh pronash në Shqipëri: kërkim i shpejtë, CMS për agjentët, përmbajtje shumëgjuhëshe dhe dizajn i fokusuar te kërkesat.',
    },
  },
  {
    slug: 'medical-dental',
    icon_key: 'stethoscope',
    featured: true,
    en: {
      title: 'Medical & Dental',
      hero_title: 'Clinic Websites That Fill the Appointment Book',
      hero_subtitle: 'Digital presence for clinics, dental practices and medical specialists.',
      description:
        'Patients choose a clinic on trust and convenience. Clear treatment information, visible credentials and a booking path that takes seconds do more for a practice than any advertising campaign.',
      problems: [
        { title: 'Booking friction', body: 'Appointments depend on a phone line that nobody answers during procedures.' },
        { title: 'Treatments explained poorly', body: 'Patients arrive uninformed, or never arrive, because the site does not answer their real questions.' },
        { title: 'Missing from local search', body: 'Patients searching for a specialist nearby never see the clinic.' },
      ],
      solutions: [
        { title: 'Booking that takes seconds', body: 'Online appointment requests or scheduling integration, with confirmations handled automatically.' },
        { title: 'Treatment pages that inform', body: 'Procedure, expectations, recovery and pricing guidance — written to reduce anxiety.' },
        { title: 'Local and specialist visibility', body: 'Location pages, Google Business Profile and medical schema so nearby patients find you.' },
      ],
      cta_title: 'Want more of the right patients?',
      cta_body: 'Tell us about your clinic and the treatments you want to grow.',
      seo_title: 'Medical & Dental Clinic Website Development | drh.al',
      seo_description:
        'Websites for clinics and dental practices in Albania: online booking, clear treatment information and local SEO that brings in new patients.',
    },
    sq: {
      title: 'Mjekësi & Dentistri',
      hero_title: 'Website Klinikash që Mbushin Axhendën',
      hero_subtitle: 'Prani dixhitale për klinika, praktika dentare dhe specialistë mjekësorë.',
      description:
        'Pacientët zgjedhin një klinikë mbi besimin dhe lehtësinë. Informacion i qartë për trajtimet dhe një rrugë rezervimi që zgjat sekonda bëjnë më shumë se çdo fushatë reklamimi.',
      problems: [
        { title: 'Pengesa në rezervim', body: 'Takimet varen nga një linjë telefonike që nuk përgjigjet gjatë procedurave.' },
        { title: 'Trajtime të shpjeguara keq', body: 'Pacientët vijnë të painformuar, ose nuk vijnë fare.' },
        { title: 'Mungesë në kërkimin lokal', body: 'Pacientët që kërkojnë një specialist afër nuk e shohin klinikën.' },
      ],
      solutions: [
        { title: 'Rezervim në pak sekonda', body: 'Kërkesa online për takim ose integrim me sistem planifikimi, me konfirmime automatike.' },
        { title: 'Faqe trajtimesh që informojnë', body: 'Procedura, pritshmëritë, rikuperimi dhe orientim mbi çmimet.' },
        { title: 'Dukshmëri lokale dhe specialistike', body: 'Faqe vendndodhjesh, Google Business Profile dhe schema mjekësore.' },
      ],
      cta_title: 'Doni më shumë pacientë të duhur?',
      cta_body: 'Na tregoni për klinikën dhe trajtimet që doni të rrisni.',
      seo_title: 'Zhvillim Website për Klinika Mjekësore dhe Dentare | drh.al',
      seo_description:
        'Website për klinika dhe praktika dentare në Shqipëri: rezervime online, informacion i qartë për trajtimet dhe SEO lokal që sjell pacientë të rinj.',
    },
  },
  {
    slug: 'hospitality',
    icon_key: 'utensils',
    featured: true,
    en: {
      title: 'Restaurants & Hospitality',
      hero_title: 'Hospitality Websites That Fill Tables and Rooms',
      hero_subtitle: 'For restaurants, hotels and hospitality groups in Albania and the region.',
      description:
        'Hospitality decisions are made on a phone, often minutes before booking. Menu, photos, location and availability have to be one tap away — and the site has to work on a weak mobile connection.',
      problems: [
        { title: 'Menus locked in PDFs', body: 'A PDF menu is unreadable on mobile and invisible to search engines.' },
        { title: 'Bookings lost to platforms', body: 'Every reservation through a third party costs commission that direct booking would keep.' },
        { title: 'Seasonal updates need a developer', body: 'Changing hours or a menu takes days instead of minutes.' },
      ],
      solutions: [
        { title: 'Menus as real content', body: 'Structured, searchable, instantly editable menus that also work for SEO.' },
        { title: 'Direct booking', body: 'Reservation forms or booking-engine integration that keep the margin with you.' },
        { title: 'Self-service updates', body: 'Hours, menus, events and photos managed by your team from the admin.' },
      ],
      cta_title: 'Want more direct bookings?',
      cta_body: 'Tell us about your venue and your busiest season.',
      seo_title: 'Restaurant & Hotel Website Development Albania | drh.al',
      seo_description:
        'Hospitality websites in Albania: editable menus, direct booking, fast mobile performance and local SEO for restaurants and hotels.',
    },
    sq: {
      title: 'Restorante & Mikpritje',
      hero_title: 'Website Mikpritjeje që Mbushin Tavolina dhe Dhoma',
      hero_subtitle: 'Për restorante, hotele dhe grupe mikpritjeje në Shqipëri dhe rajon.',
      description:
        'Vendimet në mikpritje merren nga telefoni, shpesh minuta para rezervimit. Menuja, fotot, vendndodhja dhe disponueshmëria duhet të jenë një prekje larg.',
      problems: [
        { title: 'Menu të mbyllura në PDF', body: 'Një menu PDF është e palexueshme në celular dhe e padukshme për motorët e kërkimit.' },
        { title: 'Rezervime të humbura te platformat', body: 'Çdo rezervim përmes palëve të treta ka komision që rezervimi direkt do ta ruante.' },
        { title: 'Përditësimet sezonale kërkojnë zhvillues', body: 'Ndryshimi i orareve apo i menusë zgjat ditë në vend të minutave.' },
      ],
      solutions: [
        { title: 'Menu si përmbajtje reale', body: 'Menu të strukturuara, të kërkueshme dhe të redaktueshme menjëherë.' },
        { title: 'Rezervim direkt', body: 'Formularë rezervimi ose integrim me sistem rezervimesh që ruajnë marzhin tuaj.' },
        { title: 'Përditësime vetëshërbimi', body: 'Oraret, menutë, eventet dhe fotot menaxhohen nga ekipi juaj.' },
      ],
      cta_title: 'Doni më shumë rezervime direkte?',
      cta_body: 'Na tregoni për lokalin tuaj dhe sezonin më të ngarkuar.',
      seo_title: 'Zhvillim Website për Restorante dhe Hotele Shqipëri | drh.al',
      seo_description:
        'Website mikpritjeje në Shqipëri: menu të redaktueshme, rezervim direkt, performancë e shpejtë në celular dhe SEO lokal.',
    },
  },
  {
    slug: 'legal',
    icon_key: 'scale',
    featured: false,
    en: {
      title: 'Legal & Professional Services',
      hero_title: 'Websites for Firms Sold on Credibility',
      hero_subtitle: 'For law firms, accountants, consultants and professional practices.',
      description:
        'Professional services are bought on confidence. The website has to demonstrate expertise clearly, respect confidentiality, and make the first contact feel low-risk.',
      problems: [
        { title: 'Expertise that is not visible', body: 'Deep specialist knowledge reduced to a generic "About us" paragraph.' },
        { title: 'No qualified enquiry path', body: 'Enquiries arrive with no matter type, so partners spend time triaging.' },
        { title: 'Losing search to directories', body: 'Aggregator sites rank for the practice areas that should be yours.' },
      ],
      solutions: [
        { title: 'Practice area pages', body: 'A dedicated, substantive page per specialism — the pages that earn search visibility.' },
        { title: 'Structured intake', body: 'Enquiry forms that capture matter type and urgency while respecting confidentiality.' },
        { title: 'Authority content', body: 'Insight articles that answer the questions clients ask before they engage.' },
      ],
      cta_title: 'Want enquiries from better-qualified clients?',
      cta_body: 'Tell us about your practice areas and target clients.',
      seo_title: 'Law Firm & Professional Services Web Development | drh.al',
      seo_description:
        'Websites for law firms and professional services in Albania: practice area pages, structured enquiry intake and content that builds authority.',
    },
    sq: {
      title: 'Shërbime Ligjore & Profesionale',
      hero_title: 'Website për Firma që Shiten mbi Kredibilitetin',
      hero_subtitle: 'Për studio ligjore, kontabilistë, konsulentë dhe praktika profesionale.',
      description:
        'Shërbimet profesionale blihen mbi besimin. Website-i duhet të demonstrojë ekspertizë qartë, të respektojë konfidencialitetin dhe ta bëjë kontaktin e parë të lehtë.',
      problems: [
        { title: 'Ekspertizë që nuk duket', body: 'Njohuri të thella specialistike të reduktuara në një paragraf “Rreth nesh”.' },
        { title: 'Pa rrugë kërkese të kualifikuar', body: 'Kërkesat vijnë pa llojin e çështjes, ndaj partnerët harxhojnë kohë duke i klasifikuar.' },
        { title: 'Humbje e kërkimit ndaj direktorive', body: 'Faqet grumbulluese renditen për fushat që duhet të ishin tuajat.' },
      ],
      solutions: [
        { title: 'Faqe për fushat e praktikës', body: 'Një faqe e dedikuar dhe substanciale për çdo specializim.' },
        { title: 'Marrje e strukturuar e kërkesave', body: 'Formularë që kapin llojin dhe urgjencën duke respektuar konfidencialitetin.' },
        { title: 'Përmbajtje autoriteti', body: 'Artikuj që u përgjigjen pyetjeve që klientët bëjnë para se të angazhohen.' },
      ],
      cta_title: 'Doni kërkesa nga klientë më të kualifikuar?',
      cta_body: 'Na tregoni për fushat e praktikës dhe klientët që synoni.',
      seo_title: 'Zhvillim Website për Studio Ligjore dhe Shërbime Profesionale | drh.al',
      seo_description:
        'Website për studio ligjore dhe shërbime profesionale në Shqipëri: faqe fushash praktike, marrje e strukturuar kërkesash dhe përmbajtje autoriteti.',
    },
  },
  {
    slug: 'fitness-wellness',
    icon_key: 'dumbbell',
    featured: false,
    en: {
      title: 'Fitness & Wellness',
      hero_title: 'Websites That Convert Interest Into Memberships',
      hero_subtitle: 'For gyms, studios, trainers and wellness brands.',
      description:
        'Fitness decisions are emotional and time-limited. The moment someone decides to start, the schedule, the price and the sign-up have to be immediately available.',
      problems: [
        { title: 'Schedules hidden or stale', body: 'Class times posted only on social media, out of date within a week.' },
        { title: 'Sign-up friction', body: 'A prospect ready to join is asked to visit in person or call during working hours.' },
        { title: 'Pricing that is never shown', body: 'Hiding prices filters out serious prospects, not just price shoppers.' },
      ],
      solutions: [
        { title: 'Live schedule and booking', body: 'Class timetable and booking that your team updates in seconds.' },
        { title: 'Membership sign-up online', body: 'Trials, memberships and payments handled without a phone call.' },
        { title: 'Honest pricing pages', body: 'Clear plans and what is included — the fastest way to qualify enquiries.' },
      ],
      cta_title: 'Want to convert more first-time visitors?',
      cta_body: 'Tell us about your studio and membership model.',
      seo_title: 'Gym & Fitness Website Development Albania | drh.al',
      seo_description:
        'Websites for gyms, studios and wellness brands in Albania: live class schedules, online sign-up, clear pricing and local SEO.',
    },
    sq: {
      title: 'Fitnes & Mirëqenie',
      hero_title: 'Website që e Kthejnë Interesin në Anëtarësime',
      hero_subtitle: 'Për palestra, studio, trajnerë dhe brande mirëqenieje.',
      description:
        'Vendimet për fitnesin janë emocionale dhe me afat të shkurtër. Në momentin që dikush vendos të fillojë, orari, çmimi dhe regjistrimi duhet të jenë menjëherë të disponueshme.',
      problems: [
        { title: 'Oraret e fshehura ose të vjetruara', body: 'Oraret e klasave publikohen vetëm në rrjete sociale dhe vjetërohen brenda javës.' },
        { title: 'Pengesa në regjistrim', body: 'Një i interesuar i gatshëm duhet të vijë personalisht ose të telefonojë brenda orarit.' },
        { title: 'Çmime që nuk tregohen kurrë', body: 'Fshehja e çmimeve largon të interesuarit seriozë, jo vetëm ata që kërkojnë lirë.' },
      ],
      solutions: [
        { title: 'Orar dhe rezervim live', body: 'Orari i klasave dhe rezervimi që ekipi juaj i përditëson në sekonda.' },
        { title: 'Anëtarësim online', body: 'Prova, anëtarësime dhe pagesa pa telefonatë.' },
        { title: 'Faqe çmimesh të ndershme', body: 'Plane të qarta dhe çfarë përfshihet — mënyra më e shpejtë për të kualifikuar kërkesat.' },
      ],
      cta_title: 'Doni të konvertoni më shumë vizitorë të parë?',
      cta_body: 'Na tregoni për studion dhe modelin e anëtarësimit.',
      seo_title: 'Zhvillim Website për Palestra dhe Fitnes Shqipëri | drh.al',
      seo_description:
        'Website për palestra, studio dhe brande mirëqenieje në Shqipëri: orare live, regjistrim online, çmime të qarta dhe SEO lokal.',
    },
  },
  {
    slug: 'automotive',
    icon_key: 'car',
    featured: false,
    en: {
      title: 'Automotive',
      hero_title: 'Automotive Websites Built for Enquiries and Bookings',
      hero_subtitle: 'For dealerships, service centres and automotive specialists.',
      description:
        'Vehicle buyers research extensively and decide quickly. Inventory has to be current, searchable and fast — and a service booking should never require a phone call.',
      problems: [
        { title: 'Stale inventory', body: 'Vehicles sold weeks ago still listed, which destroys trust on the first visit.' },
        { title: 'Service bookings by phone only', body: 'Every booking costs staff time and some are simply lost.' },
        { title: 'Poor mobile experience', body: 'Buyers browse from a phone on a forecourt, where a heavy site fails.' },
      ],
      solutions: [
        { title: 'Inventory your team controls', body: 'Add, update and remove vehicles with photos and specs in minutes.' },
        { title: 'Online service booking', body: 'Service type, vehicle and preferred time captured before the customer arrives.' },
        { title: 'Fast mobile browsing', body: 'Optimised images and filtering that stay quick on mobile connections.' },
      ],
      cta_title: 'Want more qualified vehicle enquiries?',
      cta_body: 'Tell us about your dealership or service centre.',
      seo_title: 'Automotive & Dealership Web Development Albania | drh.al',
      seo_description:
        'Automotive websites in Albania: manageable vehicle inventory, online service booking and fast mobile browsing for dealerships and service centres.',
    },
    sq: {
      title: 'Automjete',
      hero_title: 'Website Automjetesh të Ndërtuara për Kërkesa dhe Rezervime',
      hero_subtitle: 'Për tregtarë automjetesh, qendra servisi dhe specialistë.',
      description:
        'Blerësit e automjeteve hulumtojnë gjerësisht dhe vendosin shpejt. Inventari duhet të jetë i përditësuar, i kërkueshëm dhe i shpejtë.',
      problems: [
        { title: 'Inventar i vjetëruar', body: 'Automjete të shitura javë më parë ende të listuara, gjë që shkatërron besimin.' },
        { title: 'Rezervime servisi vetëm me telefon', body: 'Çdo rezervim kushton kohë stafi dhe disa humbasin krejt.' },
        { title: 'Përvojë e dobët në celular', body: 'Blerësit shfletojnë nga telefoni, ku një faqe e rëndë dështon.' },
      ],
      solutions: [
        { title: 'Inventar që e kontrollon ekipi juaj', body: 'Shtoni, përditësoni dhe hiqni automjete me foto dhe specifika brenda minutash.' },
        { title: 'Rezervim servisi online', body: 'Lloji i shërbimit, automjeti dhe ora e preferuar mblidhen paraprakisht.' },
        { title: 'Shfletim i shpejtë në celular', body: 'Imazhe të optimizuara dhe filtrim që mbeten të shpejtë.' },
      ],
      cta_title: 'Doni kërkesa më të kualifikuara?',
      cta_body: 'Na tregoni për pikën tuaj të shitjes ose servisin.',
      seo_title: 'Zhvillim Website Automjetesh Shqipëri | drh.al',
      seo_description:
        'Website automjetesh në Shqipëri: inventar i menaxhueshëm, rezervim servisi online dhe shfletim i shpejtë në celular.',
    },
  },
  {
    slug: 'ecommerce',
    icon_key: 'shopping-bag',
    featured: true,
    en: {
      title: 'E-commerce & Retail',
      hero_title: 'Online Stores Built to Sell, Not Just to Exist',
      hero_subtitle: 'For retailers and brands selling in Albania and across borders.',
      description:
        'Retail online is decided by details: how fast the catalogue loads, how few steps the checkout takes, and whether the customer trusts you with a card at the last screen.',
      problems: [
        { title: 'Checkout abandonment', body: 'Too many steps, surprise shipping costs and payment options customers do not recognise.' },
        { title: 'Catalogue that cannot scale', body: 'Search and filtering break down as the product count grows.' },
        { title: 'No revenue attribution', body: 'Marketing spend is judged on clicks because purchases are not tracked properly.' },
      ],
      solutions: [
        { title: 'A checkout designed to complete', body: 'Fewer steps, transparent totals, guest checkout and familiar payment methods.' },
        { title: 'Catalogue architecture', body: 'Product data, variants, filters and search that stay fast at scale.' },
        { title: 'Full revenue tracking', body: 'E-commerce events wired to analytics and ads so every channel is judged on revenue.' },
      ],
      cta_title: 'Want a store that converts?',
      cta_body: 'Tell us what you sell and where the funnel breaks today.',
      seo_title: 'E-commerce & Retail Web Development Albania | drh.al',
      seo_description:
        'E-commerce websites for retailers in Albania: optimised checkout, scalable catalogues, multilingual stores and complete revenue tracking.',
    },
    sq: {
      title: 'E-commerce & Shitje me Pakicë',
      hero_title: 'Dyqane Online të Ndërtuara për të Shitur',
      hero_subtitle: 'Për tregtarë dhe brande që shesin në Shqipëri dhe përtej kufijve.',
      description:
        'Shitja online vendoset nga detajet: sa shpejt ngarkohet katalogu, sa pak hapa ka checkout-i dhe nëse klienti ju beson kartën në ekranin e fundit.',
      problems: [
        { title: 'Braktisje e checkout-it', body: 'Shumë hapa, kosto transporti të papritura dhe metoda pagese që klientët nuk i njohin.' },
        { title: 'Katalog që nuk shkallëzohet', body: 'Kërkimi dhe filtrimi dështojnë kur rriten produktet.' },
        { title: 'Pa atribuim të ardhurash', body: 'Shpenzimi i marketingut gjykohet nga klikimet sepse blerjet nuk gjurmohen si duhet.' },
      ],
      solutions: [
        { title: 'Një checkout i dizajnuar për t’u përfunduar', body: 'Më pak hapa, totale transparente, blerje si vizitor dhe metoda pagese të njohura.' },
        { title: 'Arkitekturë katalogu', body: 'Të dhëna produktesh, variante, filtra dhe kërkim që mbeten të shpejta.' },
        { title: 'Gjurmim i plotë i të ardhurave', body: 'Evente e-commerce të lidhura me analitikën dhe reklamat.' },
      ],
      cta_title: 'Doni një dyqan që konverton?',
      cta_body: 'Na tregoni çfarë shisni dhe ku prishet funnel-i sot.',
      seo_title: 'Zhvillim E-commerce dhe Retail Shqipëri | drh.al',
      seo_description:
        'Website e-commerce për tregtarë në Shqipëri: checkout i optimizuar, katalogje të shkallëzueshme, dyqane shumëgjuhëshe dhe gjurmim i plotë.',
    },
  },
  {
    slug: 'saas',
    icon_key: 'cloud',
    featured: false,
    en: {
      title: 'SaaS',
      hero_title: 'Product Sites and Platforms for SaaS Companies',
      hero_subtitle: 'For founders and product teams building software businesses.',
      description:
        'SaaS lives or dies on activation. The marketing site has to explain the product in one screen, and the product itself has to get a new user to value before they lose interest.',
      problems: [
        { title: 'The product is hard to explain', body: 'Visitors leave the homepage without understanding what the software does.' },
        { title: 'Slow to ship', body: 'A fragile codebase makes every new feature more expensive than the last.' },
        { title: 'Onboarding drop-off', body: 'Sign-ups happen but users never reach the moment the product proves itself.' },
      ],
      solutions: [
        { title: 'A marketing site that converts', body: 'Positioning, product clarity, pricing and trial sign-up designed as one funnel.' },
        { title: 'An architecture built to ship', body: 'TypeScript, PostgreSQL and a structure that keeps feature velocity high.' },
        { title: 'Instrumented onboarding', body: 'Activation events tracked so you can see exactly where new users stall.' },
      ],
      cta_title: 'Building a software product?',
      cta_body: 'Tell us where you are — pre-launch, scaling, or rebuilding.',
      seo_title: 'SaaS Web Development & Product Sites | drh.al',
      seo_description:
        'SaaS development and marketing sites: React and Next.js platforms, conversion-focused product pages and instrumented onboarding.',
    },
    sq: {
      title: 'SaaS',
      hero_title: 'Faqe Produkti dhe Platforma për Kompani SaaS',
      hero_subtitle: 'Për themelues dhe ekipe produkti që ndërtojnë biznese software.',
      description:
        'SaaS jeton ose vdes nga aktivizimi. Faqja e marketingut duhet ta shpjegojë produktin në një ekran, dhe produkti duhet ta çojë përdoruesin te vlera para se të humbasë interesin.',
      problems: [
        { title: 'Produkti është i vështirë për t’u shpjeguar', body: 'Vizitorët largohen pa kuptuar çfarë bën software-i.' },
        { title: 'I ngadaltë për të nxjerrë funksione', body: 'Një kod i brishtë e bën çdo funksion të ri më të shtrenjtë se i mëparshmi.' },
        { title: 'Braktisje gjatë onboarding-ut', body: 'Regjistrimet ndodhin, por përdoruesit nuk arrijnë kurrë te momenti i vlerës.' },
      ],
      solutions: [
        { title: 'Një faqe marketingu që konverton', body: 'Pozicionimi, qartësia e produktit, çmimet dhe regjistrimi si një funnel i vetëm.' },
        { title: 'Arkitekturë e ndërtuar për shpejtësi', body: 'TypeScript, PostgreSQL dhe një strukturë që mban ritmin e zhvillimit.' },
        { title: 'Onboarding i matur', body: 'Evente aktivizimi të gjurmuara që të shihni ku ndalen përdoruesit e rinj.' },
      ],
      cta_title: 'Po ndërtoni një produkt software?',
      cta_body: 'Na tregoni ku jeni — para lansimit, në rritje, apo duke rindërtuar.',
      seo_title: 'Zhvillim SaaS dhe Faqe Produkti | drh.al',
      seo_description:
        'Zhvillim SaaS dhe faqe marketingu: platforma React dhe Next.js, faqe produkti të fokusuara te konvertimi dhe onboarding i matur.',
    },
  },
  {
    slug: 'education',
    icon_key: 'graduation-cap',
    featured: false,
    en: {
      title: 'Education',
      hero_title: 'Websites and Platforms for Education Providers',
      hero_subtitle: 'For schools, academies, training providers and course creators.',
      description:
        'Education buyers — students, parents and employers — need clarity on outcomes, cost and dates. The site has to make enrolment obvious and the programme credible.',
      problems: [
        { title: 'Programmes described vaguely', body: 'Course pages that list topics but never state the outcome or who it is for.' },
        { title: 'Enrolment handled by email', body: 'Applications tracked in an inbox, with no visibility on where each candidate stands.' },
        { title: 'Multilingual audiences', body: 'International students cannot access the information they need to apply.' },
      ],
      solutions: [
        { title: 'Programme pages that convert', body: 'Outcomes, curriculum, schedule, price and admission requirements, clearly structured.' },
        { title: 'Structured applications', body: 'Online enrolment forms feeding a pipeline your admissions team can actually manage.' },
        { title: 'Multilingual delivery', body: 'Independent content per language with correct hreflang for international reach.' },
      ],
      cta_title: 'Want to fill more course places?',
      cta_body: 'Tell us about your programmes and enrolment cycle.',
      seo_title: 'Education & Training Website Development | drh.al',
      seo_description:
        'Websites and platforms for schools, academies and training providers: clear programme pages, online enrolment and multilingual content.',
    },
    sq: {
      title: 'Arsim',
      hero_title: 'Website dhe Platforma për Ofrues Arsimi',
      hero_subtitle: 'Për shkolla, akademi, ofrues trajnimesh dhe krijues kursesh.',
      description:
        'Blerësit në arsim — studentë, prindër dhe punëdhënës — kërkojnë qartësi mbi rezultatet, koston dhe datat. Faqja duhet ta bëjë regjistrimin të qartë dhe programin të besueshëm.',
      problems: [
        { title: 'Programe të përshkruara në mënyrë të paqartë', body: 'Faqe kursesh që listojnë tema por nuk thonë kurrë rezultatin apo për kë janë.' },
        { title: 'Regjistrim përmes email-it', body: 'Aplikimet ndiqen në inbox, pa dukshmëri se ku ndodhet secili kandidat.' },
        { title: 'Audienca shumëgjuhëshe', body: 'Studentët ndërkombëtarë nuk gjejnë informacionin që u duhet për të aplikuar.' },
      ],
      solutions: [
        { title: 'Faqe programesh që konvertojnë', body: 'Rezultatet, kurrikula, orari, çmimi dhe kriteret e pranimit, të strukturuara qartë.' },
        { title: 'Aplikime të strukturuara', body: 'Formularë regjistrimi online që ushqejnë një pipeline të menaxhueshëm.' },
        { title: 'Shpërndarje shumëgjuhëshe', body: 'Përmbajtje e pavarur për çdo gjuhë me hreflang të saktë.' },
      ],
      cta_title: 'Doni të mbushni më shumë vende në kurse?',
      cta_body: 'Na tregoni për programet dhe ciklin e regjistrimeve.',
      seo_title: 'Zhvillim Website për Arsim dhe Trajnime | drh.al',
      seo_description:
        'Website dhe platforma për shkolla, akademi dhe ofrues trajnimesh: faqe programesh të qarta, regjistrim online dhe përmbajtje shumëgjuhëshe.',
    },
  },
];

export const industries: IndustryRow[] = defs.map((d, i) => ({
  id: seedId(NS.industry, i + 1),
  slug: d.slug,
  icon_key: d.icon_key,
  cover_image: null,
  status: 'published',
  featured: d.featured,
  sort_order: i,
}));

export const industryTranslations: IndustryTranslationRow[] = defs.flatMap((d, i) => {
  const industry_id = seedId(NS.industry, i + 1);
  return (['en', 'sq'] as const).map((language) => ({
    ...d[language],
    industry_id,
    language,
    og_title: null,
    og_description: null,
    is_complete: true,
  }));
});

export const industryIdBySlug = new Map(industries.map((i) => [i.slug, i.id]));
