import type { FaqRow } from '@/types/database';
import { NS, seedId } from '../ids';

interface FaqSeed {
  category: string;
  en: [question: string, answer: string];
  sq: [question: string, answer: string];
}

const defs: FaqSeed[] = [
  {
    category: 'general',
    en: [
      'How much does a website cost in Albania?',
      'It depends on scope rather than page count. A focused business website or landing page typically sits in the €2,000–€5,000 range. A larger multilingual corporate site with a CMS, custom design and SEO groundwork usually falls between €5,000 and €15,000. Custom web applications, platforms and e-commerce builds start around €15,000 and are quoted against a defined specification. We give a fixed price once scope is clear, not a rate card before it.',
    ],
    sq: [
      'Sa kushton një website në Shqipëri?',
      'Varet nga fushëveprimi, jo nga numri i faqeve. Një website biznesi i fokusuar ose një landing page zakonisht kushton €2,000–€5,000. Një faqe korporative shumëgjuhëshe me CMS, dizajn të personalizuar dhe bazë SEO zakonisht bie mes €5,000 dhe €15,000. Aplikacionet web, platformat dhe ndërtimet e-commerce fillojnë rreth €15,000 dhe kuotohen mbi një specifikim të përcaktuar. Ne japim një çmim fiks pasi fushëveprimi është i qartë.',
    ],
  },
  {
    category: 'general',
    en: [
      'How long does a typical project take?',
      'A business website usually takes four to eight weeks from kickoff to launch. A larger multilingual site with custom functionality takes eight to fourteen weeks. Web applications and mobile apps depend entirely on scope and are planned in phases so you see working software early rather than at the end. The largest variable is usually content and feedback turnaround on the client side, which we plan for explicitly.',
    ],
    sq: [
      'Sa zgjat një projekt tipik?',
      'Një website biznesi zakonisht zgjat katër deri në tetë javë nga fillimi deri në lansim. Një faqe më e madhe shumëgjuhëshe me funksionalitet të personalizuar zgjat tetë deri në katërmbëdhjetë javë. Aplikacionet web dhe mobile varen nga fushëveprimi dhe planifikohen në faza, që të shihni software funksional herët. Ndryshorja më e madhe është zakonisht koha e përmbajtjes dhe e feedback-ut nga ana e klientit.',
    ],
  },
  {
    category: 'general',
    en: [
      'Do you work with international clients?',
      'Yes. We are based in Albania and work with clients across Europe and beyond — we have delivered projects for clients in Italy alongside our Albanian work. Collaboration is remote by default, with scheduled calls, written scope and shared access to progress. Time zone overlap with Europe is complete, and we work in English, Albanian and Italian.',
    ],
    sq: [
      'Punoni me klientë ndërkombëtarë?',
      'Po. Jemi me bazë në Shqipëri dhe punojmë me klientë në Evropë dhe më gjerë — kemi dorëzuar projekte për klientë në Itali krahas punës në Shqipëri. Bashkëpunimi është në distancë, me takime të planifikuara, fushëveprim me shkrim dhe akses të përbashkët mbi progresin. Punojmë në anglisht, shqip dhe italisht.',
    ],
  },
  {
    category: 'general',
    en: [
      'Who owns the website and source code?',
      'You do. On final payment, ownership of the design, the source code and all content transfers to you, along with access to the repository, hosting, domain and every third-party account created for the project. We do not hold accounts hostage and we do not license our work back to clients.',
    ],
    sq: [
      'Kush e zotëron website-in dhe kodin burimor?',
      'Ju. Me pagesën përfundimtare, pronësia e dizajnit, e kodit burimor dhe e gjithë përmbajtjes kalon tek ju, së bashku me aksesin te repository, hosting, domain dhe çdo llogari e palës së tretë e krijuar për projektin. Ne nuk mbajmë peng llogaritë dhe nuk ua licencojmë punën klientëve.',
    ],
  },
  {
    category: 'general',
    en: [
      'Do you offer ongoing support?',
      'Yes. After launch we offer maintenance covering updates, security patches, backups, monitoring and a defined amount of change work each month. Support is optional and month to month — it is not a condition of working with us. Many clients start with support for the first few months after launch and then move to ad-hoc work.',
    ],
    sq: [
      'Ofroni mbështetje të vazhdueshme?',
      'Po. Pas lansimit ofrojmë mirëmbajtje që mbulon përditësime, arna sigurie, backup, monitorim dhe një sasi të përcaktuar ndryshimesh çdo muaj. Mbështetja është opsionale dhe muaj pas muaji — nuk është kusht për të punuar me ne.',
    ],
  },
  {
    category: 'general',
    en: [
      'Can you work with an existing internal team?',
      'Often, yes. We work alongside in-house marketing teams, internal developers and other agencies. That can mean taking one workstream (for example the front end, or SEO), reviewing architecture, or providing senior capacity on an existing codebase. We agree responsibilities and interfaces in writing before starting so nobody is guessing who owns what.',
    ],
    sq: [
      'Mund të punoni me një ekip të brendshëm ekzistues?',
      'Shpesh, po. Punojmë krahas ekipeve të marketingut, zhvilluesve të brendshëm dhe agjencive të tjera. Kjo mund të nënkuptojë marrjen e një rrjedhe pune (për shembull front-end ose SEO), rishikim arkitekture, ose kapacitet senior mbi një kod ekzistues. I dakordësojmë përgjegjësitë me shkrim para se të fillojmë.',
    ],
  },
  {
    category: 'general',
    en: [
      'Can you handle SEO after launch?',
      'Yes, and we prefer to. A launch is where SEO starts, not where it ends. Post-launch work typically covers technical monitoring, Search Console analysis, content expansion against real query data, internal linking and monthly reporting tied to enquiries rather than rankings alone.',
    ],
    sq: [
      'Mund të merreni me SEO pas lansimit?',
      'Po, dhe e preferojmë. Lansimi është vendi ku fillon SEO, jo ku mbaron. Puna pas lansimit përfshin monitorim teknik, analizë të Search Console, zgjerim përmbajtjeje mbi të dhëna reale kërkimi, lidhje të brendshme dhe raportim mujor të lidhur me kërkesat, jo vetëm me renditjet.',
    ],
  },
  {
    category: 'general',
    en: [
      'Do you build mobile apps?',
      'Yes — iOS and Android, usually with React Native so a single well-structured codebase serves both stores. That covers the app itself plus the parts around it: API, authentication, push notifications, payments and submission to the App Store and Google Play. Where a feature genuinely requires native code, we write native modules for it.',
    ],
    sq: [
      'Ndërtoni aplikacione mobile?',
      'Po — iOS dhe Android, zakonisht me React Native, që një kod i vetëm i strukturuar mirë t’u shërbejë të dyja dyqaneve. Kjo përfshin aplikacionin dhe pjesët rreth tij: API, autentikim, njoftime push, pagesa dhe dorëzimin në App Store dhe Google Play.',
    ],
  },
  {
    category: 'general',
    en: [
      'Can you rebuild an existing website?',
      'Yes, and rebuilds are a large part of what we do. We start with an audit of the current site — performance, structure, content and search visibility — then decide honestly whether it needs improvement or replacement. If we rebuild, we plan URL mapping and redirects carefully so existing search rankings and traffic carry over rather than being lost at launch.',
    ],
    sq: [
      'Mund të rindërtoni një website ekzistues?',
      'Po, dhe rindërtimet janë një pjesë e madhe e punës sonë. Fillojmë me një audit të faqes aktuale — performanca, struktura, përmbajtja dhe dukshmëria në kërkim — pastaj vendosim ndershmërisht nëse duhet përmirësuar apo zëvendësuar. Nëse rindërtojmë, planifikojmë me kujdes hartën e URL-ve dhe ridrejtimet, që renditjet dhe trafiku ekzistues të mos humbasin.',
    ],
  },
];

export const faqs: FaqRow[] = defs.map((d, i) => ({
  id: seedId(NS.faq, i + 1),
  category: d.category,
  question_en: d.en[0],
  answer_en: d.en[1],
  question_sq: d.sq[0],
  answer_sq: d.sq[1],
  service_id: null,
  industry_id: null,
  sort_order: i,
  is_active: true,
}));
