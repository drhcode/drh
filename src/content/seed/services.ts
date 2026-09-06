import type { ServiceRow, ServiceTranslationRow } from '@/types/database';
import { NS, seedId } from '../ids';

interface ServiceSeed {
  slug: string;
  icon_key: string;
  featured: boolean;
  technologies: string[];
  en: Omit<ServiceTranslationRow, 'service_id' | 'language' | 'is_complete'>;
  sq: Omit<ServiceTranslationRow, 'service_id' | 'language' | 'is_complete'>;
}

const defs: ServiceSeed[] = [
  {
    slug: 'web-development',
    icon_key: 'code',
    featured: true,
    technologies: ['react', 'nextjs', 'typescript', 'nodejs', 'tailwind'],
    en: {
      title: 'Web Design & Development',
      headline: 'Web Development in Albania for Ambitious Businesses',
      short_description:
        'Fast, modern and conversion-focused websites engineered around your business objectives.',
      full_description:
        'We build business websites the way we would build a product: with a clear goal, a defined audience and measurable outcomes. Every page is designed to answer a visitor question and move them one step closer to contacting you.\n\nOur sites are built on React and Next.js, or on WordPress where an editorial workflow matters more than custom logic. In both cases the result is the same — fast, accessible, easy to maintain, and structured so search engines can read it properly from day one.',
      benefits: [
        {
          title: 'Built around a business goal',
          body: 'We define what the site has to achieve before choosing a single layout — leads, bookings, applications or qualified enquiries.',
        },
        {
          title: 'Performance as an architecture decision',
          body: 'Core Web Vitals are handled in the build, not patched afterwards with a caching plugin.',
        },
        {
          title: 'Editable without a developer',
          body: 'The content your team changes weekly lives in a CMS. The code stays stable.',
        },
        {
          title: 'Multilingual from the start',
          body: 'Albanian and English (or any other pair) with correct hreflang, independent metadata and clean URLs.',
        },
      ],
      features: [
        'Business and corporate websites',
        'High-intent landing pages',
        'Multilingual websites with correct hreflang',
        'Next.js and React websites',
        'Headless and traditional CMS setups',
        'Custom functionality and business logic',
        'Third-party and API integrations',
        'Analytics, tracking and conversion measurement',
      ],
      process: [
        { step: '01', title: 'Discovery & Strategy', body: 'Goals, audience, competitors, technical requirements and the metrics that define success.' },
        { step: '02', title: 'Design & UX', body: 'Information architecture, user flows, wireframes and a high-fidelity interface.' },
        { step: '03', title: 'Development', body: 'Production-grade code optimised for speed, responsiveness, SEO, accessibility and security.' },
        { step: '04', title: 'Launch & Growth', body: 'Measure real behaviour after launch, then improve and scale through SEO and marketing.' },
      ],
      cta_title: 'Need a website that actually performs?',
      cta_body: 'Tell us about your business and we will come back within 24 hours with a recommended approach, scope and timeline.',
      seo_title: 'Web Development Albania | Websites Built to Perform | drh.al',
      seo_description:
        'Web development in Albania for businesses that need speed, structure and results. Next.js, React and WordPress websites built around clear business goals.',
    },
    sq: {
      title: 'Dizajn & Zhvillim Web',
      headline: 'Zhvillim Website në Shqipëri për Biznese Ambicioze',
      short_description:
        'Website të shpejtë, modernë dhe të fokusuar te konvertimi, ndërtuar rreth objektivave të biznesit tuaj.',
      full_description:
        'Ne e ndërtojmë një website biznesi ashtu siç ndërtohet një produkt: me një qëllim të qartë, një audiencë të përcaktuar dhe rezultate të matshme. Çdo faqe është menduar t’i përgjigjet një pyetjeje të vizitorit dhe ta afrojë atë një hap më pranë kontaktit me ju.\n\nFaqet tona ndërtohen mbi React dhe Next.js, ose mbi WordPress kur puna editoriale ka më shumë rëndësi se logjika e personalizuar. Në të dyja rastet rezultati është i njëjtë — i shpejtë, i aksesueshëm, i lehtë për t’u mirëmbajtur dhe i strukturuar që motorët e kërkimit ta lexojnë saktë që nga dita e parë.',
      benefits: [
        { title: 'Ndërtuar rreth një qëllimi biznesi', body: 'Përcaktojmë çfarë duhet të arrijë faqja para se të zgjedhim një layout — kontakte, rezervime, aplikime ose kërkesa të kualifikuara.' },
        { title: 'Performanca si vendim arkitekture', body: 'Core Web Vitals trajtohen gjatë ndërtimit, jo më pas me një plugin cache.' },
        { title: 'E ndryshueshme pa zhvillues', body: 'Përmbajtja që ekipi juaj e ndryshon çdo javë qëndron në CMS. Kodi mbetet i qëndrueshëm.' },
        { title: 'Shumëgjuhësh që nga fillimi', body: 'Shqip dhe anglisht (ose çdo çift tjetër) me hreflang të saktë, metadata të pavarura dhe URL të pastra.' },
      ],
      features: [
        'Website biznesi dhe korporate',
        'Landing page me qëllim të lartë konvertimi',
        'Website shumëgjuhësh me hreflang të saktë',
        'Website me Next.js dhe React',
        'Konfigurime CMS headless dhe tradicionale',
        'Funksionalitet dhe logjikë biznesi e personalizuar',
        'Integrime me palë të treta dhe API',
        'Analitika, gjurmim dhe matje konvertimesh',
      ],
      process: [
        { step: '01', title: 'Zbulim & Strategji', body: 'Objektivat, audienca, konkurrentët, kërkesat teknike dhe metrikat që përcaktojnë suksesin.' },
        { step: '02', title: 'Dizajn & UX', body: 'Arkitektura e informacionit, rrjedhat e përdoruesit, wireframe dhe ndërfaqja finale.' },
        { step: '03', title: 'Zhvillim', body: 'Kod i nivelit produksion, i optimizuar për shpejtësi, responsivitet, SEO, aksesueshmëri dhe siguri.' },
        { step: '04', title: 'Lansim & Rritje', body: 'Masim sjelljen reale pas lansimit, pastaj përmirësojmë dhe rrisim përmes SEO dhe marketingut.' },
      ],
      cta_title: 'Ju duhet një website që vërtet performon?',
      cta_body: 'Na tregoni për biznesin tuaj dhe ne kthehemi brenda 24 orësh me qasjen, fushëveprimin dhe afatin e rekomanduar.',
      seo_title: 'Zhvillim Website Shqipëri | Faqe që Performojnë | drh.al',
      seo_description:
        'Zhvillim website në Shqipëri për biznese që kërkojnë shpejtësi, strukturë dhe rezultate. Faqe me Next.js, React dhe WordPress rreth qëllimeve të qarta të biznesit.',
    },
  },
  {
    slug: 'web-app-development',
    icon_key: 'layers',
    featured: true,
    technologies: ['react', 'nextjs', 'typescript', 'nodejs', 'supabase', 'postgresql'],
    en: {
      title: 'Custom Web Applications',
      headline: 'Custom Web Application Development',
      short_description:
        'Scalable React and Next.js applications including SaaS platforms, dashboards, marketplaces and internal systems.',
      full_description:
        'When a website is not enough, you need software. We design and build web applications that carry real business logic — authentication, roles, permissions, data models, workflows, integrations and reporting.\n\nWe work in TypeScript end to end, on top of PostgreSQL, with an architecture chosen for the next three years rather than the next three weeks. That means clear data relationships, server-side authorisation, and a codebase your future team can actually read.',
      benefits: [
        { title: 'A data model that holds up', body: 'Relational schema design, proper constraints and indexes — the part that decides whether year two is painful.' },
        { title: 'Security enforced on the server', body: 'Row level security, server-side permission checks and validated inputs. Never a hidden button as a security model.' },
        { title: 'Built to be handed over', body: 'Strong typing, predictable structure and documentation, so you are never locked to one agency.' },
        { title: 'Integrated, not isolated', body: 'Payments, CRMs, ERPs, email and analytics connected through well-defined APIs.' },
      ],
      features: [
        'SaaS platforms',
        'Analytics dashboards and reporting tools',
        'Internal tools and admin panels',
        'Marketplaces',
        'Customer and client portals',
        'Booking and scheduling platforms',
        'API-driven systems and integrations',
        'Workflow and automation platforms',
      ],
      process: [
        { step: '01', title: 'Discovery & Strategy', body: 'Map the workflow that exists today, the constraints around it and what success has to look like.' },
        { step: '02', title: 'Design & UX', body: 'Data model, user roles, key screens and the flows that carry the most business value.' },
        { step: '03', title: 'Development', body: 'Iterative delivery in TypeScript with authentication, permissions, testing and observability.' },
        { step: '04', title: 'Launch & Growth', body: 'Onboarding, monitoring and a roadmap for the features that follow the first release.' },
      ],
      cta_title: 'Have a platform in mind?',
      cta_body: 'Send us the problem you are trying to solve. We will reply with an architecture direction and a realistic scope.',
      seo_title: 'Custom Web Application Development | React & Next.js | drh.al',
      seo_description:
        'Custom web application development with React, Next.js, TypeScript and PostgreSQL. SaaS platforms, dashboards, portals and internal tools built to scale.',
    },
    sq: {
      title: 'Aplikacione Web të Personalizuara',
      headline: 'Zhvillim Aplikacionesh Web të Personalizuara',
      short_description:
        'Aplikacione të shkallëzueshme me React dhe Next.js: platforma SaaS, dashboard, marketplace dhe sisteme të brendshme.',
      full_description:
        'Kur një website nuk mjafton, ju duhet software. Ne dizajnojmë dhe ndërtojmë aplikacione web që mbajnë logjikë reale biznesi — autentikim, role, leje, modele të dhënash, rrjedha pune, integrime dhe raportim.\n\nPunojmë me TypeScript nga fillimi në fund, mbi PostgreSQL, me një arkitekturë të zgjedhur për tre vitet e ardhshme dhe jo për tre javët e ardhshme. Kjo do të thotë marrëdhënie të qarta të dhënash, autorizim në server dhe një kod që ekipi juaj i ardhshëm mund ta lexojë.',
      benefits: [
        { title: 'Një model të dhënash që qëndron', body: 'Dizajn skeme relacionale, kufizime dhe indekse të sakta — pjesa që vendos nëse viti i dytë do të jetë i dhimbshëm.' },
        { title: 'Siguri e zbatuar në server', body: 'Row level security, kontrolle lejesh në server dhe validim i të dhënave. Kurrë një buton i fshehur si model sigurie.' },
        { title: 'E ndërtuar për t’u dorëzuar', body: 'Tipizim i fortë, strukturë e parashikueshme dhe dokumentim, që të mos jeni kurrë të varur nga një agjenci e vetme.' },
        { title: 'E integruar, jo e izoluar', body: 'Pagesa, CRM, ERP, email dhe analitika të lidhura përmes API-ve të mirëpërcaktuara.' },
      ],
      features: [
        'Platforma SaaS',
        'Dashboard analitike dhe mjete raportimi',
        'Mjete të brendshme dhe panele administrimi',
        'Marketplace',
        'Portale klientësh',
        'Platforma rezervimesh dhe planifikimi',
        'Sisteme dhe integrime të bazuara në API',
        'Platforma automatizimi dhe rrjedhash pune',
      ],
      process: [
        { step: '01', title: 'Zbulim & Strategji', body: 'Hartëzojmë rrjedhën aktuale të punës, kufizimet dhe si duhet të duket suksesi.' },
        { step: '02', title: 'Dizajn & UX', body: 'Modeli i të dhënave, rolet e përdoruesve, ekranet kryesore dhe rrjedhat me vlerën më të madhe.' },
        { step: '03', title: 'Zhvillim', body: 'Dorëzim iterativ në TypeScript me autentikim, leje, testim dhe monitorim.' },
        { step: '04', title: 'Lansim & Rritje', body: 'Onboarding, monitorim dhe një plan për funksionet pas versionit të parë.' },
      ],
      cta_title: 'Keni një platformë në mendje?',
      cta_body: 'Na dërgoni problemin që doni të zgjidhni. Ju kthejmë përgjigje me një drejtim arkitekture dhe një fushëveprim realist.',
      seo_title: 'Zhvillim Aplikacionesh Web | React & Next.js | drh.al',
      seo_description:
        'Zhvillim aplikacionesh web të personalizuara me React, Next.js, TypeScript dhe PostgreSQL. Platforma SaaS, dashboard, portale dhe mjete të brendshme.',
    },
  },
  {
    slug: 'mobile-app-development',
    icon_key: 'smartphone',
    featured: true,
    technologies: ['react-native', 'typescript', 'nodejs', 'supabase'],
    en: {
      title: 'Mobile App Development',
      headline: 'Mobile App Development in Albania for iOS and Android',
      short_description:
        'High-quality iOS and Android applications designed around performance and usability.',
      full_description:
        'Mobile is where habit forms. We build applications that people can open every day without friction — fast startup, offline tolerance, predictable navigation and interface patterns that match the platform instead of fighting it.\n\nWe usually build with React Native so one well-structured codebase serves both App Store and Google Play, with native modules where a feature genuinely requires them.',
      benefits: [
        { title: 'One codebase, two platforms', body: 'React Native keeps iOS and Android in step, which keeps both cost and release cycles under control.' },
        { title: 'Backed by a real API', body: 'Authentication, data sync, push notifications and payments designed together with the app, not bolted on later.' },
        { title: 'Store-ready delivery', body: 'We handle App Store and Google Play submission, review requirements and release configuration.' },
        { title: 'Performance you can feel', body: 'Startup time, list rendering and network behaviour are measured, not assumed.' },
      ],
      features: [
        'iOS applications',
        'Android applications',
        'React Native cross-platform development',
        'API and backend integrations',
        'Authentication and user accounts',
        'Push notifications',
        'In-app payments and subscriptions',
        'App Store deployment',
        'Google Play deployment',
      ],
      process: [
        { step: '01', title: 'Discovery & Strategy', body: 'Define the core job the app does on day one and what can wait for version two.' },
        { step: '02', title: 'Design & UX', body: 'Platform-aware navigation, key flows and a high-fidelity interface for both platforms.' },
        { step: '03', title: 'Development', body: 'Cross-platform build with the backend, notifications, payments and analytics wired in.' },
        { step: '04', title: 'Launch & Growth', body: 'Store submission, release management and iteration based on real usage data.' },
      ],
      cta_title: 'Planning a mobile product?',
      cta_body: 'Tell us who it is for and what it has to do. We will come back with scope, platform advice and a timeline.',
      seo_title: 'Mobile App Development Albania | iOS & Android | drh.al',
      seo_description:
        'Mobile app development in Albania. iOS and Android applications built with React Native, including APIs, authentication, push notifications and store deployment.',
    },
    sq: {
      title: 'Zhvillim Aplikacionesh Mobile',
      headline: 'Zhvillim Aplikacionesh Mobile në Shqipëri për iOS dhe Android',
      short_description:
        'Aplikacione cilësore iOS dhe Android, të dizajnuara rreth performancës dhe përdorshmërisë.',
      full_description:
        'Mobile është vendi ku formohet zakoni. Ne ndërtojmë aplikacione që njerëzit mund t’i hapin çdo ditë pa pengesa — nisje e shpejtë, tolerancë ndaj mungesës së internetit, navigim i parashikueshëm dhe modele ndërfaqeje që përputhen me platformën.\n\nZakonisht ndërtojmë me React Native, që një kod i strukturuar mirë të shërbejë si për App Store ashtu edhe për Google Play, me module native aty ku një funksion i kërkon vërtet.',
      benefits: [
        { title: 'Një kod, dy platforma', body: 'React Native i mban iOS dhe Android në hap, duke kontrolluar kostot dhe ciklet e lansimit.' },
        { title: 'I mbështetur nga një API real', body: 'Autentikim, sinkronizim të dhënash, njoftime push dhe pagesa të dizajnuara bashkë me aplikacionin.' },
        { title: 'Gati për dyqanet', body: 'Ne kujdesemi për dorëzimin në App Store dhe Google Play, kërkesat e rishikimit dhe konfigurimin e publikimit.' },
        { title: 'Performancë që ndihet', body: 'Koha e nisjes, renderimi i listave dhe sjellja e rrjetit maten, nuk supozohen.' },
      ],
      features: [
        'Aplikacione iOS',
        'Aplikacione Android',
        'Zhvillim cross-platform me React Native',
        'Integrime me API dhe backend',
        'Autentikim dhe llogari përdoruesish',
        'Njoftime push',
        'Pagesa dhe abonime brenda aplikacionit',
        'Publikim në App Store',
        'Publikim në Google Play',
      ],
      process: [
        { step: '01', title: 'Zbulim & Strategji', body: 'Përcaktojmë punën kryesore që bën aplikacioni ditën e parë dhe çfarë mund të presë për versionin e dytë.' },
        { step: '02', title: 'Dizajn & UX', body: 'Navigim sipas platformës, rrjedhat kryesore dhe ndërfaqja finale për të dyja platformat.' },
        { step: '03', title: 'Zhvillim', body: 'Ndërtim cross-platform me backend, njoftime, pagesa dhe analitikë të integruara.' },
        { step: '04', title: 'Lansim & Rritje', body: 'Dorëzimi në dyqane, menaxhimi i publikimeve dhe përmirësime bazuar në përdorimin real.' },
      ],
      cta_title: 'Po planifikoni një produkt mobile?',
      cta_body: 'Na tregoni për kë është dhe çfarë duhet të bëjë. Ju kthehemi me fushëveprim, këshillë platforme dhe afat.',
      seo_title: 'Zhvillim Aplikacionesh Mobile Shqipëri | iOS & Android | drh.al',
      seo_description:
        'Zhvillim aplikacionesh mobile në Shqipëri. Aplikacione iOS dhe Android me React Native, përfshirë API, autentikim, njoftime push dhe publikim në dyqane.',
    },
  },
  {
    slug: 'wordpress-development',
    icon_key: 'wordpress',
    featured: true,
    technologies: ['wordpress', 'woocommerce', 'php', 'javascript'],
    en: {
      title: 'WordPress & WooCommerce',
      headline: 'WordPress Development in Albania Without Template Limits',
      short_description:
        'Custom WordPress development, WooCommerce stores and advanced functionality without template limitations.',
      full_description:
        'Most WordPress problems are not WordPress problems — they are the result of a bloated theme and twenty plugins doing the work of two. We build WordPress sites the disciplined way: a clean custom theme, only the plugins that earn their place, and content structures that editors understand.\n\nThe result is a site your team can update daily, that loads quickly on mobile, and that does not degrade every time someone adds a page.',
      benefits: [
        { title: 'Custom themes, not marketplace bloat', body: 'Only the code your site needs, which is why performance holds up over time.' },
        { title: 'An editor experience people use', body: 'Custom fields and content blocks that match how your team actually writes.' },
        { title: 'Performance and Core Web Vitals', body: 'Image handling, caching strategy and script discipline built in from the start.' },
        { title: 'Maintained and secure', body: 'Update routines, backups and hardening — the boring work that avoids the expensive week.' },
      ],
      features: [
        'Custom WordPress websites',
        'Custom themes built from scratch',
        'Elementor-based builds where a page builder fits',
        'WooCommerce stores',
        'Custom plugin development',
        'Multilingual WordPress websites',
        'Performance optimisation and Core Web Vitals',
        'API and third-party integrations',
        'Ongoing maintenance and support',
      ],
      process: [
        { step: '01', title: 'Discovery & Strategy', body: 'Audit the current site, the editorial workflow and the functionality that actually matters.' },
        { step: '02', title: 'Design & UX', body: 'Page structures, content models and the interface for the templates you will reuse.' },
        { step: '03', title: 'Development', body: 'Custom theme, content fields, integrations and performance work.' },
        { step: '04', title: 'Launch & Growth', body: 'Migration, redirects, training for your editors and ongoing maintenance.' },
      ],
      cta_title: 'WordPress site holding you back?',
      cta_body: 'Send us the URL. We will tell you honestly whether it should be improved or rebuilt.',
      seo_title: 'WordPress Development Albania | Custom Themes & WooCommerce | drh.al',
      seo_description:
        'WordPress development in Albania: custom themes, WooCommerce stores, custom plugins, multilingual sites and performance optimisation without template limits.',
    },
    sq: {
      title: 'WordPress & WooCommerce',
      headline: 'Zhvillim WordPress në Shqipëri pa Kufijtë e Template-ve',
      short_description:
        'Zhvillim i personalizuar WordPress, dyqane WooCommerce dhe funksionalitet i avancuar pa kufizimet e template-ve.',
      full_description:
        'Shumica e problemeve me WordPress nuk janë probleme të WordPress — janë rezultat i një teme të rënduar dhe njëzet plugin-ave që bëjnë punën e dy prej tyre. Ne ndërtojmë me disiplinë: një temë e pastër e personalizuar, vetëm plugin-at që e meritojnë vendin, dhe struktura përmbajtjeje që redaktorët i kuptojnë.\n\nRezultati është një faqe që ekipi juaj mund ta përditësojë çdo ditë, që ngarkohet shpejt në celular dhe që nuk degradon sa herë shtohet një faqe e re.',
      benefits: [
        { title: 'Tema të personalizuara, jo template të rënduara', body: 'Vetëm kodi që faqja juaj ka nevojë — prandaj performanca qëndron me kalimin e kohës.' },
        { title: 'Një përvojë redaktimi që përdoret vërtet', body: 'Fusha dhe blloqe përmbajtjeje që përputhen me mënyrën si shkruan ekipi juaj.' },
        { title: 'Performancë dhe Core Web Vitals', body: 'Trajtimi i imazheve, strategjia e cache dhe disiplina e skripteve që nga fillimi.' },
        { title: 'E mirëmbajtur dhe e sigurt', body: 'Rutina përditësimi, backup dhe forcim sigurie — puna e mërzitshme që shmang javën e shtrenjtë.' },
      ],
      features: [
        'Website të personalizuar WordPress',
        'Tema të ndërtuara nga e para',
        'Ndërtime me Elementor kur page builder-i ka kuptim',
        'Dyqane WooCommerce',
        'Zhvillim plugin-ash të personalizuar',
        'Website WordPress shumëgjuhësh',
        'Optimizim performance dhe Core Web Vitals',
        'Integrime me API dhe palë të treta',
        'Mirëmbajtje dhe mbështetje e vazhdueshme',
      ],
      process: [
        { step: '01', title: 'Zbulim & Strategji', body: 'Auditojmë faqen aktuale, rrjedhën editoriale dhe funksionalitetin që ka vërtet rëndësi.' },
        { step: '02', title: 'Dizajn & UX', body: 'Strukturat e faqeve, modelet e përmbajtjes dhe ndërfaqja për template-t e ripërdorshme.' },
        { step: '03', title: 'Zhvillim', body: 'Temë e personalizuar, fusha përmbajtjeje, integrime dhe punë për performancën.' },
        { step: '04', title: 'Lansim & Rritje', body: 'Migrim, ridrejtime, trajnim për redaktorët tuaj dhe mirëmbajtje e vazhdueshme.' },
      ],
      cta_title: 'Faqja WordPress po ju pengon?',
      cta_body: 'Na dërgoni URL-në. Ju themi ndershmërisht nëse duhet përmirësuar apo rindërtuar.',
      seo_title: 'Zhvillim WordPress Shqipëri | Tema të Personalizuara & WooCommerce | drh.al',
      seo_description:
        'Zhvillim WordPress në Shqipëri: tema të personalizuara, dyqane WooCommerce, plugin-a, faqe shumëgjuhëshe dhe optimizim performance pa kufijtë e template-ve.',
    },
  },
  {
    slug: 'ecommerce-development',
    icon_key: 'shopping-cart',
    featured: false,
    technologies: ['woocommerce', 'wordpress', 'nextjs', 'php', 'typescript'],
    en: {
      title: 'E-commerce Development',
      headline: 'E-commerce Development Built Around Conversion',
      short_description:
        'WooCommerce stores and custom storefronts engineered around checkout, catalogue and repeat purchase.',
      full_description:
        'An online store is a system, not a page. Catalogue structure, search, product data, checkout, shipping rules, payment methods, stock and tax all have to work together — and every one of them can quietly cost you revenue.\n\nWe build stores on WooCommerce or as custom storefronts, then instrument them properly so you can see exactly where purchases are being lost.',
      benefits: [
        { title: 'Checkout treated as the product', body: 'Fewer steps, clearer costs, saved progress and payment options your customers expect.' },
        { title: 'Catalogue that scales', body: 'Product data, variants, filters and search that still work at a thousand SKUs.' },
        { title: 'Operations connected', body: 'Stock, shipping, invoicing and fulfilment integrated with the tools you already run.' },
        { title: 'Measured revenue', body: 'Full e-commerce tracking so every channel is judged on revenue, not clicks.' },
      ],
      features: [
        'WooCommerce store development',
        'Custom storefronts',
        'Payment gateway integration',
        'Product and catalogue management',
        'Checkout optimisation',
        'Inventory and ERP integrations',
        'Shipping and delivery rules',
        'Multilingual and multi-currency stores',
        'Conversion and revenue tracking',
      ],
      process: [
        { step: '01', title: 'Discovery & Strategy', body: 'Catalogue, margins, logistics, payment methods and the customer journey you need to support.' },
        { step: '02', title: 'Design & UX', body: 'Category structure, product page, cart and a checkout designed to remove friction.' },
        { step: '03', title: 'Development', body: 'Store build, integrations, tax and shipping logic, plus full tracking.' },
        { step: '04', title: 'Launch & Growth', body: 'Launch, monitor funnel drop-off and improve the steps that cost the most revenue.' },
      ],
      cta_title: 'Ready to sell more online?',
      cta_body: 'Tell us about your products and current setup. We will identify where the revenue is leaking.',
      seo_title: 'E-commerce Development Albania | WooCommerce & Custom Stores | drh.al',
      seo_description:
        'E-commerce development in Albania. WooCommerce stores and custom storefronts with optimised checkout, integrations, multilingual support and revenue tracking.',
    },
    sq: {
      title: 'Zhvillim E-commerce',
      headline: 'Zhvillim E-commerce i Ndërtuar rreth Konvertimit',
      short_description:
        'Dyqane WooCommerce dhe storefront të personalizuar, të ndërtuar rreth checkout-it, katalogut dhe blerjeve të përsëritura.',
      full_description:
        'Një dyqan online është një sistem, jo një faqe. Struktura e katalogut, kërkimi, të dhënat e produkteve, checkout-i, rregullat e transportit, metodat e pagesës, stoku dhe taksat duhet të funksionojnë së bashku — dhe secila prej tyre mund t’ju kushtojë të ardhura pa u vënë re.\n\nNdërtojmë dyqane mbi WooCommerce ose si storefront të personalizuar, pastaj i pajisim me matje të sakta që të shihni saktësisht ku humbasin blerjet.',
      benefits: [
        { title: 'Checkout-i trajtohet si produkt', body: 'Më pak hapa, kosto më të qarta, progres i ruajtur dhe opsione pagese që klientët i presin.' },
        { title: 'Katalog që shkallëzohet', body: 'Të dhëna produktesh, variante, filtra dhe kërkim që funksionojnë edhe me një mijë SKU.' },
        { title: 'Operacione të lidhura', body: 'Stoku, transporti, faturimi dhe përmbushja të integruara me mjetet që përdorni tashmë.' },
        { title: 'Të ardhura të matura', body: 'Gjurmim i plotë e-commerce, që çdo kanal të gjykohet nga të ardhurat, jo nga klikimet.' },
      ],
      features: [
        'Zhvillim dyqanesh WooCommerce',
        'Storefront të personalizuar',
        'Integrim i sistemeve të pagesave',
        'Menaxhim produktesh dhe katalogu',
        'Optimizim i checkout-it',
        'Integrime me inventar dhe ERP',
        'Rregulla transporti dhe dërgese',
        'Dyqane shumëgjuhëshe dhe shumëvalutore',
        'Gjurmim konvertimesh dhe të ardhurash',
      ],
      process: [
        { step: '01', title: 'Zbulim & Strategji', body: 'Katalogu, marzhet, logjistika, metodat e pagesës dhe udhëtimi i klientit që duhet mbështetur.' },
        { step: '02', title: 'Dizajn & UX', body: 'Struktura e kategorive, faqja e produktit, shporta dhe një checkout pa pengesa.' },
        { step: '03', title: 'Zhvillim', body: 'Ndërtimi i dyqanit, integrimet, logjika e taksave dhe transportit, plus gjurmim i plotë.' },
        { step: '04', title: 'Lansim & Rritje', body: 'Lansimi, monitorimi i braktisjes në funnel dhe përmirësimi i hapave më të kushtueshëm.' },
      ],
      cta_title: 'Gati të shisni më shumë online?',
      cta_body: 'Na tregoni për produktet dhe konfigurimin aktual. Ne identifikojmë ku po humbasin të ardhurat.',
      seo_title: 'Zhvillim E-commerce Shqipëri | WooCommerce & Dyqane të Personalizuara | drh.al',
      seo_description:
        'Zhvillim e-commerce në Shqipëri. Dyqane WooCommerce dhe storefront të personalizuar me checkout të optimizuar, integrime dhe gjurmim të ardhurash.',
    },
  },
  {
    slug: 'ui-ux-design',
    icon_key: 'palette',
    featured: true,
    technologies: ['react', 'nextjs', 'tailwind'],
    en: {
      title: 'UI/UX & Brand Design',
      headline: 'UI/UX and Brand Design for Digital Products',
      short_description:
        'Digital identities and product experiences designed to communicate trust and simplify user journeys.',
      full_description:
        'Good design is mostly good decisions: what to show first, what to remove, and what a person is trying to do on this screen. We design interfaces that are calm and legible, with a visual identity that makes a company look like what it actually is.\n\nEvery design we produce is built to be implemented — real components, real states, real content, handed over in a system your developers can use.',
      benefits: [
        { title: 'Research before pixels', body: 'We look at the audience, the competitors and the actual user task before opening a design file.' },
        { title: 'A system, not a set of screens', body: 'Type scale, spacing, colour and components defined once and reused everywhere.' },
        { title: 'Designed for implementation', body: 'States, breakpoints and edge cases specified — so the build matches the design.' },
        { title: 'Accessible by default', body: 'Contrast, focus states, tap targets and reduced-motion support treated as requirements.' },
      ],
      features: [
        'UX research and information architecture',
        'User flows and wireframes',
        'High-fidelity interface design',
        'Design systems and component libraries',
        'Brand identity and visual language',
        'Landing page and conversion design',
        'Mobile and responsive design',
        'Design-to-development handover',
      ],
      process: [
        { step: '01', title: 'Discovery & Strategy', body: 'Audience, competitive landscape, current friction points and the outcome the design must support.' },
        { step: '02', title: 'Design & UX', body: 'Architecture, flows, wireframes, then a high-fidelity interface and a reusable system.' },
        { step: '03', title: 'Development', body: 'We implement the design ourselves or support your team through handover.' },
        { step: '04', title: 'Launch & Growth', body: 'Watch how people actually use it and refine the screens that matter most.' },
      ],
      cta_title: 'Need design that survives development?',
      cta_body: 'Show us what you have today. We will tell you what to keep, what to fix and what to rethink.',
      seo_title: 'UI/UX Design Albania | Product & Brand Design | drh.al',
      seo_description:
        'UI/UX and brand design in Albania. Research-led product design, design systems and interfaces built to be implemented, accessible and conversion-focused.',
    },
    sq: {
      title: 'Dizajn UI/UX & Brand',
      headline: 'Dizajn UI/UX dhe Brand për Produkte Dixhitale',
      short_description:
        'Identitete dixhitale dhe përvoja produkti të dizajnuara për të ndërtuar besim dhe për të thjeshtuar udhëtimin e përdoruesit.',
      full_description:
        'Dizajni i mirë është kryesisht vendime të mira: çfarë të shfaqet e para, çfarë të hiqet dhe çfarë po përpiqet të bëjë personi në këtë ekran. Ne dizajnojmë ndërfaqe të qeta dhe të lexueshme, me një identitet vizual që e bën kompaninë të duket ashtu siç është vërtet.\n\nÇdo dizajn që prodhojmë është i ndërtuar për t’u implementuar — komponentë realë, gjendje reale, përmbajtje reale, të dorëzuara në një sistem që zhvilluesit tuaj mund ta përdorin.',
      benefits: [
        { title: 'Kërkim para pikselave', body: 'Shikojmë audiencën, konkurrentët dhe detyrën reale të përdoruesit para se të hapim një skedar dizajni.' },
        { title: 'Një sistem, jo një grup ekranesh', body: 'Shkalla tipografike, hapësirat, ngjyrat dhe komponentët përcaktohen një herë dhe ripërdoren kudo.' },
        { title: 'Dizajn për implementim', body: 'Gjendjet, breakpoint-et dhe rastet kufitare të specifikuara — që ndërtimi të përputhet me dizajnin.' },
        { title: 'I aksesueshëm si standard', body: 'Kontrasti, fokusi, zonat e prekjes dhe reduced-motion trajtohen si kërkesa.' },
      ],
      features: [
        'Kërkim UX dhe arkitekturë informacioni',
        'Rrjedha përdoruesi dhe wireframe',
        'Dizajn ndërfaqeje me besnikëri të lartë',
        'Sisteme dizajni dhe biblioteka komponentësh',
        'Identitet brandi dhe gjuhë vizuale',
        'Dizajn landing page dhe konvertimi',
        'Dizajn mobile dhe responsiv',
        'Dorëzim nga dizajni te zhvillimi',
      ],
      process: [
        { step: '01', title: 'Zbulim & Strategji', body: 'Audienca, konkurrenca, pengesat aktuale dhe rezultati që dizajni duhet të mbështesë.' },
        { step: '02', title: 'Dizajn & UX', body: 'Arkitektura, rrjedhat, wireframe, pastaj ndërfaqja finale dhe një sistem i ripërdorshëm.' },
        { step: '03', title: 'Zhvillim', body: 'E implementojmë vetë dizajnin ose mbështesim ekipin tuaj gjatë dorëzimit.' },
        { step: '04', title: 'Lansim & Rritje', body: 'Vëzhgojmë si përdoret vërtet dhe përmirësojmë ekranet më të rëndësishme.' },
      ],
      cta_title: 'Ju duhet dizajn që mbijeton zhvillimin?',
      cta_body: 'Na tregoni çfarë keni sot. Ju themi çfarë të mbani, çfarë të rregulloni dhe çfarë të rimendoni.',
      seo_title: 'Dizajn UI/UX Shqipëri | Dizajn Produkti & Brandi | drh.al',
      seo_description:
        'Dizajn UI/UX dhe brand në Shqipëri. Dizajn produkti i bazuar në kërkim, sisteme dizajni dhe ndërfaqe të ndërtuara për implementim dhe konvertim.',
    },
  },
  {
    slug: 'seo',
    icon_key: 'search',
    featured: true,
    technologies: ['nextjs', 'wordpress'],
    en: {
      title: 'SEO & Performance Marketing',
      headline: 'SEO in Albania Focused on Qualified Traffic',
      short_description:
        'SEO, Google Ads and Meta Ads focused on qualified traffic, leads, revenue and measurable growth.',
      full_description:
        'Rankings are a means, not the goal. We work on the searches that indicate someone is ready to buy, then make sure your site deserves to win them — technically, structurally and in the quality of what it says.\n\nThat means fixing crawl and speed problems first, building pages that answer real questions properly, earning relevance through content and internal links, and reporting on leads rather than vanity positions.',
      benefits: [
        { title: 'Commercial intent first', body: 'We prioritise the queries that produce enquiries, not the ones that produce screenshots.' },
        { title: 'Technical foundations', body: 'Crawlability, indexation, structured data, Core Web Vitals and internal linking, handled properly.' },
        { title: 'Local visibility in Albania', body: 'Google Business Profile, local landing pages and location signals for Tirana and beyond.' },
        { title: 'Reporting you can act on', body: 'Search Console and analytics tied back to leads, so you know which pages earn the business.' },
      ],
      features: [
        'Technical SEO audits and fixes',
        'Local SEO for Albania and Tirana',
        'On-page SEO and content optimisation',
        'Keyword and search intent research',
        'Content strategy and editorial planning',
        'Structured data and schema markup',
        'Core Web Vitals and performance',
        'Internal linking architecture',
        'Google Search Console setup and monitoring',
        'Monthly reporting tied to leads',
      ],
      process: [
        { step: '01', title: 'Discovery & Strategy', body: 'Technical audit, keyword and competitor research, and a priority list ranked by commercial value.' },
        { step: '02', title: 'Design & UX', body: 'Page structures and templates that satisfy search intent and convert the visitor once they arrive.' },
        { step: '03', title: 'Development', body: 'Technical fixes, schema, performance work and the content build.' },
        { step: '04', title: 'Launch & Growth', body: 'Continuous measurement, content expansion and iteration against real query data.' },
      ],
      cta_title: 'Want traffic that turns into enquiries?',
      cta_body: 'Send us your domain and target market. We will come back with the highest-value opportunities we can see.',
      seo_title: 'SEO Albania | Technical, Local & Content SEO | drh.al',
      seo_description:
        'SEO services in Albania focused on qualified traffic and leads: technical SEO, local SEO for Tirana, content strategy, schema and Core Web Vitals.',
    },
    sq: {
      title: 'SEO & Marketing Performance',
      headline: 'SEO në Shqipëri i Fokusuar te Trafiku i Kualifikuar',
      short_description:
        'SEO, Google Ads dhe Meta Ads të fokusuara te trafiku i kualifikuar, kontaktet, të ardhurat dhe rritja e matshme.',
      full_description:
        'Renditjet janë një mjet, jo qëllimi. Ne punojmë me kërkimet që tregojnë se dikush është gati të blejë, pastaj sigurohemi që faqja juaj e meriton t’i fitojë — teknikisht, strukturalisht dhe në cilësinë e asaj që thotë.\n\nKjo do të thotë: fillimisht rregullojmë problemet e indeksimit dhe shpejtësisë, ndërtojmë faqe që u përgjigjen pyetjeve reale, fitojmë relevancë përmes përmbajtjes dhe lidhjeve të brendshme, dhe raportojmë për kontaktet, jo për pozicione dekorative.',
      benefits: [
        { title: 'Së pari qëllimi tregtar', body: 'Prioritet u japim kërkimeve që sjellin kërkesa reale, jo atyre që sjellin screenshot.' },
        { title: 'Themele teknike', body: 'Indeksueshmëria, të dhënat e strukturuara, Core Web Vitals dhe lidhjet e brendshme, të trajtuara si duhet.' },
        { title: 'Dukshmëri lokale në Shqipëri', body: 'Google Business Profile, faqe lokale dhe sinjale vendndodhjeje për Tiranën dhe më gjerë.' },
        { title: 'Raportim mbi të cilin veproni', body: 'Search Console dhe analitika të lidhura me kontaktet, që të dini cilat faqe sjellin biznes.' },
      ],
      features: [
        'Auditime dhe rregullime SEO teknike',
        'SEO lokal për Shqipërinë dhe Tiranën',
        'SEO on-page dhe optimizim përmbajtjeje',
        'Kërkim fjalësh kyçe dhe qëllimi kërkimor',
        'Strategji përmbajtjeje dhe planifikim editorial',
        'Të dhëna të strukturuara dhe schema markup',
        'Core Web Vitals dhe performancë',
        'Arkitekturë e lidhjeve të brendshme',
        'Konfigurim dhe monitorim i Search Console',
        'Raportim mujor i lidhur me kontaktet',
      ],
      process: [
        { step: '01', title: 'Zbulim & Strategji', body: 'Audit teknik, kërkim fjalësh kyçe dhe konkurrentësh, dhe një listë prioritetesh sipas vlerës tregtare.' },
        { step: '02', title: 'Dizajn & UX', body: 'Struktura faqesh që plotësojnë qëllimin e kërkimit dhe konvertojnë vizitorin.' },
        { step: '03', title: 'Zhvillim', body: 'Rregullime teknike, schema, punë për performancën dhe ndërtimi i përmbajtjes.' },
        { step: '04', title: 'Lansim & Rritje', body: 'Matje e vazhdueshme, zgjerim i përmbajtjes dhe përmirësime mbi të dhëna reale kërkimi.' },
      ],
      cta_title: 'Doni trafik që kthehet në kërkesa?',
      cta_body: 'Na dërgoni domain-in dhe tregun tuaj. Ju kthehemi me mundësitë me vlerën më të lartë që shohim.',
      seo_title: 'SEO Shqipëri | SEO Teknik, Lokal dhe Përmbajtjeje | drh.al',
      seo_description:
        'Shërbime SEO në Shqipëri të fokusuara te trafiku i kualifikuar: SEO teknik, SEO lokal për Tiranën, strategji përmbajtjeje, schema dhe Core Web Vitals.',
    },
  },
  {
    slug: 'google-ads',
    icon_key: 'target',
    featured: false,
    technologies: [],
    en: {
      title: 'Google Ads',
      headline: 'Google Ads Management Built Around Profitable Growth',
      short_description:
        'Search and Performance Max campaigns managed against conversion data, not impressions.',
      full_description:
        'Paid search works when three things line up: the right queries, a landing page that answers them, and conversion tracking you can trust. Most underperforming accounts are missing at least one.\n\nWe build campaigns around commercial intent, keep waste out with disciplined negative keyword work, and report on cost per qualified lead — the number that actually decides whether the channel is worth running.',
      benefits: [
        { title: 'Tracking before spend', body: 'We verify conversion tracking first. Optimising against bad data is worse than not optimising.' },
        { title: 'Intent-led structure', body: 'Campaigns and ad groups organised around how people search, so the ad matches the query.' },
        { title: 'Waste control', body: 'Continuous negative keyword work and placement exclusions to protect the budget.' },
        { title: 'Landing pages that convert', body: 'We build the page as well as the campaign, so traffic lands somewhere that earns the click.' },
      ],
      features: [
        'Search campaign strategy and build',
        'Performance Max campaigns',
        'Conversion tracking implementation',
        'Landing page design and development',
        'Keyword research and match type strategy',
        'Negative keyword management',
        'Budget and bid optimisation',
        'ROAS and cost-per-lead reporting',
      ],
      process: [
        { step: '01', title: 'Discovery & Strategy', body: 'Offer, margins, target market and what a qualified lead is actually worth to you.' },
        { step: '02', title: 'Design & UX', body: 'Landing pages built for the specific searches the campaign targets.' },
        { step: '03', title: 'Development', body: 'Campaign build, conversion tracking and analytics integration.' },
        { step: '04', title: 'Launch & Growth', body: 'Ongoing optimisation against cost per qualified lead and transparent reporting.' },
      ],
      cta_title: 'Want paid search to pay for itself?',
      cta_body: 'Tell us your market and current spend. We will review the account structure and tracking before promising anything.',
      seo_title: 'Google Ads Management Albania | Search & Performance Max | drh.al',
      seo_description:
        'Google Ads management in Albania. Search and Performance Max campaigns with proper conversion tracking, landing pages and cost-per-lead reporting.',
    },
    sq: {
      title: 'Google Ads',
      headline: 'Menaxhim Google Ads i Ndërtuar për Rritje Fitimprurëse',
      short_description:
        'Fushata Search dhe Performance Max të menaxhuara mbi të dhëna konvertimi, jo mbi shfaqje.',
      full_description:
        'Reklamimi në kërkim funksionon kur përputhen tre gjëra: kërkimet e duhura, një landing page që u përgjigjet, dhe gjurmim konvertimesh të besueshëm. Shumica e llogarive me performancë të dobët i mungon të paktën njëra.\n\nNe ndërtojmë fushata rreth qëllimit tregtar, mbajmë jashtë shpenzimet e kota me punë disiplinuese mbi fjalët kyçe negative, dhe raportojmë koston për kontakt të kualifikuar — numri që vendos nëse kanali ia vlen.',
      benefits: [
        { title: 'Gjurmimi para shpenzimit', body: 'Së pari verifikojmë gjurmimin e konvertimeve. Optimizimi mbi të dhëna të gabuara është më keq se mosoptimizimi.' },
        { title: 'Strukturë sipas qëllimit', body: 'Fushata dhe grupe reklamash të organizuara sipas mënyrës si kërkojnë njerëzit.' },
        { title: 'Kontroll i shpenzimeve të kota', body: 'Punë e vazhdueshme me fjalë kyçe negative dhe përjashtime vendosjesh për të mbrojtur buxhetin.' },
        { title: 'Landing page që konvertojnë', body: 'Ndërtojmë edhe faqen, jo vetëm fushatën, që trafiku të zbresë diku që e meriton klikimin.' },
      ],
      features: [
        'Strategji dhe ndërtim fushatash Search',
        'Fushata Performance Max',
        'Implementim i gjurmimit të konvertimeve',
        'Dizajn dhe zhvillim landing page',
        'Kërkim fjalësh kyçe dhe strategji përputhjeje',
        'Menaxhim i fjalëve kyçe negative',
        'Optimizim buxheti dhe ofertash',
        'Raportim ROAS dhe kosto për kontakt',
      ],
      process: [
        { step: '01', title: 'Zbulim & Strategji', body: 'Oferta, marzhet, tregu i synuar dhe sa vlen vërtet një kontakt i kualifikuar për ju.' },
        { step: '02', title: 'Dizajn & UX', body: 'Landing page të ndërtuara për kërkimet specifike që synon fushata.' },
        { step: '03', title: 'Zhvillim', body: 'Ndërtimi i fushatave, gjurmimi i konvertimeve dhe integrimi i analitikës.' },
        { step: '04', title: 'Lansim & Rritje', body: 'Optimizim i vazhdueshëm ndaj kostos për kontakt të kualifikuar dhe raportim transparent.' },
      ],
      cta_title: 'Doni që reklamat të paguajnë veten?',
      cta_body: 'Na tregoni tregun dhe shpenzimin aktual. Rishikojmë strukturën e llogarisë dhe gjurmimin para se të premtojmë asgjë.',
      seo_title: 'Menaxhim Google Ads Shqipëri | Search & Performance Max | drh.al',
      seo_description:
        'Menaxhim Google Ads në Shqipëri. Fushata Search dhe Performance Max me gjurmim të saktë konvertimesh, landing page dhe raportim kosto-për-kontakt.',
    },
  },
];

export const services: ServiceRow[] = defs.map((d, i) => ({
  id: seedId(NS.service, i + 1),
  slug: d.slug,
  icon_key: d.icon_key,
  // Generated placeholder illustration — replace with real work from
  // /admin/services → Cover image. See scripts/gen-service-covers.cjs.
  cover_image: `/media/services/${d.slug}.svg`,
  status: 'published',
  featured: d.featured,
  sort_order: i,
}));

export const serviceTranslations: ServiceTranslationRow[] = defs.flatMap((d, i) => {
  const service_id = seedId(NS.service, i + 1);
  return (['en', 'sq'] as const).map((language) => ({
    ...d[language],
    service_id,
    language,
    og_title: null,
    og_description: null,
    is_complete: true,
  }));
});

export const serviceTechnologies = defs.flatMap((d, i) =>
  d.technologies.map((slug) => ({ service_id: seedId(NS.service, i + 1), technology_slug: slug })),
);

export const serviceSlugById = new Map(services.map((s) => [s.id, s.slug]));
export const serviceIdBySlug = new Map(services.map((s) => [s.slug, s.id]));
