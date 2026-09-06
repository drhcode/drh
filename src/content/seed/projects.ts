import type {
  ProjectMediaRow,
  ProjectRow,
  ProjectTranslationRow,
} from '@/types/database';
import { NS, seedId } from '../ids';
import { industryIdBySlug } from './industries';

/**
 * Initial portfolio entries (spec §101).
 *
 * Deliberately contains NO invented outcome metrics, testimonials, awards or
 * client quotes — see spec §100. Case studies describe scope, architecture and
 * delivery only. Real numbers are added by the team from
 * /admin/projects/[id] → Result Metrics once they are verified.
 */

interface ProjectSeed {
  slug: string;
  client_name: string;
  industry: string;
  country: string;
  project_date: string;
  website_url: string | null;
  featured: boolean;
  technologies: string[];
  services: string[];
  gallery: number;
  en: Omit<ProjectTranslationRow, 'project_id' | 'language' | 'is_complete'>;
  sq: Omit<ProjectTranslationRow, 'project_id' | 'language' | 'is_complete'>;
}

const defs: ProjectSeed[] = [
  {
    slug: 'ersk-shpk',
    client_name: 'ERSK SHPK',
    industry: 'construction',
    country: 'Albania',
    project_date: '2024-06-01',
    website_url: null,
    featured: true,
    technologies: ['wordpress', 'php', 'javascript'],
    services: ['web-development', 'ui-ux-design', 'wordpress-development'],
    gallery: 3,
    en: {
      title: 'A corporate website for an Albanian construction company',
      short_description:
        'A WordPress build for a construction firm, structured around completed projects, services and direct enquiries.',
      overview:
        'ERSK SHPK is a construction company operating in Albania. The brief was a corporate website that presents the company credibly to private clients and institutional buyers, keeps completed work visible, and makes it straightforward to get in touch.\n\nThe site is built on WordPress so the team can maintain project entries, service descriptions and contact details themselves, without a developer in the loop for routine updates.',
      challenge:
        'Construction is bought on evidence. A prospective client wants to see comparable work, understand the scope a company can handle, and reach a decision-maker quickly — usually from a phone.\n\nThe site therefore had to do three things well: present completed projects in a consistent, scannable structure; explain services without construction jargon; and stay fast on mobile connections, where most first visits happen.',
      solution:
        'We designed a content structure around two core entities: services and projects. Every project uses the same fields — type of work, location, scope and photography — so entries stay consistent no matter who adds them.\n\nThe interface keeps typography large and the layout uncluttered, with contact details reachable from any page. Enquiry forms capture project type and location up front so the first phone call starts with context rather than questions.',
      development:
        'The build uses a custom WordPress theme rather than a marketplace template, which keeps the page weight low and the admin experience specific to how this team works. Project and service entries are custom post types with defined fields.\n\nImages are generated in modern formats at multiple sizes and lazy-loaded below the fold. Page structure uses semantic HTML with organisation and breadcrumb structured data, and the site is configured for indexing with a generated sitemap and canonical URLs.',
      results_text:
        'Verified performance and business results for this project will be published here once measured. drh.al does not publish outcome figures it has not confirmed.',
      seo_title: 'ERSK SHPK — Construction Company Website | drh.al Case Study',
      seo_description:
        'Case study: a WordPress corporate website for ERSK SHPK, an Albanian construction company — project portfolio structure, service pages and enquiry-focused design.',
    },
    sq: {
      title: 'Një website korporativ për një kompani ndërtimi shqiptare',
      short_description:
        'Një ndërtim WordPress për një kompani ndërtimi, i strukturuar rreth projekteve të përfunduara, shërbimeve dhe kërkesave direkte.',
      overview:
        'ERSK SHPK është një kompani ndërtimi që operon në Shqipëri. Kërkesa ishte një website korporativ që e paraqet kompaninë në mënyrë të besueshme para klientëve privatë dhe institucionalë, mban të dukshme punën e përfunduar dhe e bën kontaktin të thjeshtë.\n\nFaqja është ndërtuar mbi WordPress, që ekipi të mirëmbajë vetë projektet, përshkrimet e shërbimeve dhe të dhënat e kontaktit, pa pasur nevojë për zhvillues për përditësimet rutinë.',
      challenge:
        'Ndërtimi blihet mbi prova. Një klient potencial dëshiron të shohë punë të krahasueshme, të kuptojë fushëveprimin që kompania mund të mbulojë dhe të arrijë shpejt te një vendimmarrës — zakonisht nga telefoni.\n\nPrandaj faqja duhej të bënte mirë tri gjëra: të paraqiste projektet e përfunduara në një strukturë të qëndrueshme; të shpjegonte shërbimet pa zhargon teknik; dhe të mbetej e shpejtë në lidhje celulare.',
      solution:
        'Dizajnuam një strukturë përmbajtjeje rreth dy entiteteve kryesore: shërbimeve dhe projekteve. Çdo projekt përdor të njëjtat fusha — lloji i punës, vendndodhja, fushëveprimi dhe fotografia — që hyrjet të mbeten të njëtrajtshme.\n\nNdërfaqja mban tipografi të madhe dhe një layout të pastër, me kontaktet të arritshme nga çdo faqe. Formularët kapin llojin dhe vendndodhjen e projektit që në fillim.',
      development:
        'Ndërtimi përdor një temë WordPress të personalizuar dhe jo një template të gatshme, gjë që mban peshën e faqes të ulët dhe përvojën e administrimit specifike për këtë ekip. Projektet dhe shërbimet janë custom post types me fusha të përcaktuara.\n\nImazhet gjenerohen në formate moderne në disa përmasa dhe ngarkohen me vonesë. Struktura përdor HTML semantik me të dhëna të strukturuara dhe faqja është konfiguruar me sitemap dhe URL kanonike.',
      results_text:
        'Rezultatet e verifikuara të performancës dhe biznesit për këtë projekt do të publikohen këtu pasi të maten. drh.al nuk publikon shifra të pakonfirmuara.',
      seo_title: 'ERSK SHPK — Website për Kompani Ndërtimi | Rast Studimi drh.al',
      seo_description:
        'Rast studimi: një website korporativ WordPress për ERSK SHPK, kompani ndërtimi shqiptare — strukturë portofoli, faqe shërbimesh dhe dizajn i fokusuar te kërkesat.',
    },
  },
  {
    slug: 'bia',
    client_name: 'BIA',
    industry: 'saas',
    country: 'Italy',
    project_date: '2024-11-01',
    website_url: null,
    featured: true,
    technologies: ['nextjs', 'javascript', 'react'],
    services: ['web-app-development', 'web-development', 'ui-ux-design'],
    gallery: 3,
    en: {
      title: 'A Next.js digital platform for an Italian client',
      short_description:
        'A React and Next.js platform built for speed, structured content and a clean, maintainable front end.',
      overview:
        'BIA is a digital platform delivered for a client in Italy. The engagement covered interface design and front-end engineering on a modern React stack, with a focus on load performance and a component structure the client can extend.\n\nNext.js was chosen for server rendering and routing, which keeps the platform fast on first load while leaving room for interactive, application-like sections.',
      challenge:
        'Platforms tend to accumulate weight. Every new section adds components, scripts and images, and without discipline the experience degrades until the product feels slower each quarter.\n\nThe goal was an architecture that stays fast as the platform grows: predictable rendering, a component library that is reused rather than duplicated, and a clear boundary between content and interface.',
      solution:
        'We built a component system first — typography, spacing, layout primitives and interface elements defined once and composed everywhere. Pages are assembled from those pieces, so a new section is a composition rather than a new set of styles.\n\nServer rendering handles the content-heavy views, while interactive areas load their JavaScript only where it is actually needed.',
      development:
        'The front end is built with Next.js and React. Rendering strategy is chosen per route: static generation where content is stable, server rendering where it is not, and client interactivity isolated to the components that require it.\n\nImages are served in modern formats with explicit dimensions to avoid layout shift, fonts are self-hosted and preloaded, and the bundle is split so a visitor downloads only the code for the page they opened.',
      results_text:
        'Verified performance and business results for this project will be published here once measured.',
      seo_title: 'BIA — Next.js Digital Platform | drh.al Case Study',
      seo_description:
        'Case study: a Next.js and React digital platform built for an Italian client, with a reusable component system and performance-first rendering strategy.',
    },
    sq: {
      title: 'Një platformë dixhitale me Next.js për një klient italian',
      short_description:
        'Një platformë React dhe Next.js e ndërtuar për shpejtësi, përmbajtje të strukturuar dhe një front-end të mirëmbajtshëm.',
      overview:
        'BIA është një platformë dixhitale e dorëzuar për një klient në Itali. Angazhimi përfshiu dizajnin e ndërfaqes dhe inxhinierinë front-end mbi një stack modern React, me fokus te performanca e ngarkimit dhe një strukturë komponentësh që klienti mund ta zgjerojë.\n\nNext.js u zgjodh për renderim në server dhe routing, gjë që e mban platformën të shpejtë në ngarkimin e parë.',
      challenge:
        'Platformat priren të grumbullojnë peshë. Çdo seksion i ri shton komponentë, skripte dhe imazhe, dhe pa disiplinë përvoja degradon derisa produkti ndihet më i ngadaltë çdo tremujor.\n\nQëllimi ishte një arkitekturë që mbetet e shpejtë ndërsa platforma rritet: renderim i parashikueshëm, një bibliotekë komponentësh që ripërdoret, dhe një kufi i qartë mes përmbajtjes dhe ndërfaqes.',
      solution:
        'Fillimisht ndërtuam një sistem komponentësh — tipografia, hapësirat, elementët e layout-it dhe të ndërfaqes të përcaktuar një herë dhe të kompozuar kudo. Faqet montohen nga këto pjesë, ndaj një seksion i ri është kompozim dhe jo një grup i ri stilesh.\n\nRenderimi në server mbulon pamjet me shumë përmbajtje, ndërsa zonat interaktive ngarkojnë JavaScript vetëm aty ku nevojitet.',
      development:
        'Front-end-i është ndërtuar me Next.js dhe React. Strategjia e renderimit zgjidhet për çdo route: gjenerim statik aty ku përmbajtja është e qëndrueshme, renderim në server aty ku nuk është, dhe interaktivitet i izoluar te komponentët që e kërkojnë.\n\nImazhet shërbehen në formate moderne me përmasa eksplicite për të shmangur zhvendosjen e layout-it, fontet janë të vetëstrehuara dhe bundle-i ndahet sipas faqeve.',
      results_text:
        'Rezultatet e verifikuara për këtë projekt do të publikohen këtu pasi të maten.',
      seo_title: 'BIA — Platformë Dixhitale me Next.js | Rast Studimi drh.al',
      seo_description:
        'Rast studimi: një platformë dixhitale Next.js dhe React për një klient italian, me sistem komponentësh të ripërdorshëm dhe strategji renderimi për performancë.',
    },
  },
  {
    slug: 'techcamp-polimi',
    client_name: 'TECHCAMP POLIMI',
    industry: 'education',
    country: 'Italy',
    project_date: '2025-03-01',
    website_url: null,
    featured: true,
    technologies: ['wordpress', 'php', 'javascript'],
    services: ['web-development', 'wordpress-development', 'ui-ux-design'],
    gallery: 3,
    en: {
      title: 'A programme website for an education provider in Milan',
      short_description:
        'A WordPress site for an education programme, structured around courses, schedules and enrolment enquiries.',
      overview:
        'TECHCAMP POLIMI is an education programme based in Milan, Italy. The website presents the programme structure, sessions and practical information for prospective participants, and channels enquiries into a single, manageable flow.\n\nBecause the content changes with each intake, the site is built so that dates, sessions and programme details are edited by the team rather than by a developer.',
      challenge:
        'Education websites have a recurring problem: content that is correct in September and misleading by January. Session dates, availability and programme details change every cycle, and every change that requires a developer is a change that gets delayed.\n\nAt the same time, prospective participants need very specific information quickly — what the programme covers, who it is for, when it runs, and how to apply.',
      solution:
        'We modelled the content around the programme cycle. Sessions, dates and details are structured entries, not paragraphs buried in a page, so updating an intake is a form, not a rebuild.\n\nThe page structure answers enrolment questions in order of importance: what it is, who it is for, what it covers, when it runs, and how to apply — with the enquiry path visible throughout.',
      development:
        'The site is a custom WordPress build with structured content types for programme information, so editing stays consistent between intakes. Templates are shared across sections to keep the visual language uniform.\n\nThe front end is optimised for the mobile-first audience: compressed modern image formats, deferred non-critical scripts and semantic markup with structured data for the organisation and its programmes.',
      results_text:
        'Verified performance and business results for this project will be published here once measured.',
      seo_title: 'TECHCAMP POLIMI — Education Programme Website | drh.al Case Study',
      seo_description:
        'Case study: a WordPress website for TECHCAMP POLIMI, an education programme in Milan — structured programme content, editable intakes and enrolment-focused design.',
    },
    sq: {
      title: 'Një website programi për një ofrues arsimi në Milano',
      short_description:
        'Një faqe WordPress për një program arsimor, e strukturuar rreth kurseve, orareve dhe kërkesave për regjistrim.',
      overview:
        'TECHCAMP POLIMI është një program arsimor me bazë në Milano, Itali. Website-i paraqet strukturën e programit, sesionet dhe informacionin praktik për pjesëmarrësit potencialë, dhe i kanalizon kërkesat në një rrjedhë të vetme të menaxhueshme.\n\nMeqë përmbajtja ndryshon me çdo cikël, faqja është ndërtuar që datat, sesionet dhe detajet të redaktohen nga ekipi dhe jo nga një zhvillues.',
      challenge:
        'Faqet arsimore kanë një problem të përsëritur: përmbajtje që është e saktë në shtator dhe e gabuar në janar. Datat, disponueshmëria dhe detajet ndryshojnë çdo cikël, dhe çdo ndryshim që kërkon zhvillues është një ndryshim që vonohet.\n\nNjëkohësisht, pjesëmarrësit potencialë kërkojnë shpejt informacion shumë specifik — çfarë mbulon programi, për kë është, kur zhvillohet dhe si aplikohet.',
      solution:
        'E modeluam përmbajtjen sipas ciklit të programit. Sesionet, datat dhe detajet janë hyrje të strukturuara, jo paragrafë të fshehur brenda një faqeje, ndaj përditësimi i një cikli është një formular, jo një rindërtim.\n\nStruktura e faqes u përgjigjet pyetjeve sipas rëndësisë: çfarë është, për kë është, çfarë mbulon, kur zhvillohet dhe si aplikohet.',
      development:
        'Faqja është një ndërtim i personalizuar WordPress me tipe përmbajtjeje të strukturuara për informacionin e programit. Template-t ndahen mes seksioneve për ta mbajtur gjuhën vizuale uniforme.\n\nFront-end-i është optimizuar për audiencë mobile-first: formate moderne imazhesh, skripte jokritike të shtyra dhe markup semantik me të dhëna të strukturuara.',
      results_text:
        'Rezultatet e verifikuara për këtë projekt do të publikohen këtu pasi të maten.',
      seo_title: 'TECHCAMP POLIMI — Website Programi Arsimor | Rast Studimi drh.al',
      seo_description:
        'Rast studimi: një website WordPress për TECHCAMP POLIMI, program arsimor në Milano — përmbajtje e strukturuar, cikle të redaktueshme dhe dizajn i fokusuar te regjistrimi.',
    },
  },
];

export const projects: ProjectRow[] = defs.map((d, i) => ({
  id: seedId(NS.project, i + 1),
  slug: d.slug,
  client_name: d.client_name,
  client_logo: null,
  industry_id: industryIdBySlug.get(d.industry) ?? null,
  country: d.country,
  project_date: d.project_date,
  cover_image: `/media/projects/${d.slug}-cover.svg`,
  cover_image_mobile: null,
  og_image: null,
  canonical_url: null,
  website_url: d.website_url,
  featured: d.featured,
  status: 'published',
  is_indexable: true,
  sort_order: i,
  testimonial_id: null,
  view_count: 0,
  published_at: `${d.project_date}T09:00:00.000Z`,
}));

export const projectTranslations: ProjectTranslationRow[] = defs.flatMap((d, i) => {
  const project_id = seedId(NS.project, i + 1);
  return (['en', 'sq'] as const).map((language) => ({
    ...d[language],
    project_id,
    language,
    og_title: null,
    og_description: null,
    is_complete: true,
  }));
});

export const projectMedia: ProjectMediaRow[] = defs.flatMap((d, i) =>
  Array.from({ length: d.gallery }, (_, g) => ({
    id: seedId(NS.projectMedia, (i + 1) * 100 + g + 1),
    project_id: seedId(NS.project, i + 1),
    media_id: null,
    url: `/media/projects/${d.slug}-${g + 1}.svg`,
    alt_en: `${d.client_name} — interface detail ${g + 1}`,
    alt_sq: `${d.client_name} — detaj i ndërfaqes ${g + 1}`,
    caption: null,
    width: 1600,
    height: 1000,
    sort_order: g,
  })),
);

export const projectTechnologies = defs.flatMap((d, i) =>
  d.technologies.map((slug) => ({ project_id: seedId(NS.project, i + 1), technology_slug: slug })),
);

export const projectServices = defs.flatMap((d, i) =>
  d.services.map((slug) => ({ project_id: seedId(NS.project, i + 1), service_slug: slug })),
);
