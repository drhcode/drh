import type { Language, PageSection } from '@/types/database';
import {
  getBlogPosts,
  getFaqs,
  getFeaturedProjects,
  getFeaturedServices,
  getIndustries,
  getTechnologies,
  getTestimonials,
} from '@/lib/data';
import { HeroSection } from './hero-section';
import { MetricsSection } from './metrics-section';
import { TechStrip } from './tech-strip';
import { ServicesSection } from './services-section';
import { ProjectsSection } from './projects-section';
import { FeatureGrid } from './feature-grid';
import { IndustriesSection } from './industries-section';
import { ProcessSection } from './process-section';
import { TestimonialsSection } from './testimonials-section';
import { BlogSection } from './blog-section';
import { FaqSection } from './faq-section';
import { CtaSection } from './cta-section';
import { RichTextSection } from './rich-text-section';

/**
 * Renders a CMS page from its ordered section blocks (spec §63).
 *
 * Deliberately a fixed set of premium, pre-designed components rather than a
 * free-form page builder: an editor chooses and reorders sections and fills in
 * copy, but cannot produce a layout that breaks the design system.
 *
 * Data-backed sections (services, projects, blog, …) fetch their own content,
 * so adding a project in the admin updates every page that lists projects.
 */
export async function PageSections({
  sections,
  locale,
}: {
  sections: PageSection[];
  locale: Language;
}) {
  const rendered = await Promise.all(
    sections.map((section, index) => renderSection(section, index, locale)),
  );
  return <>{rendered}</>;
}

async function renderSection(section: PageSection, index: number, locale: Language) {
  const key = `${section.type}-${index}`;
  // Only the first section on a page carries the h1.
  const isFirst = index === 0;

  switch (section.type) {
    case 'hero':
      return (
        <HeroSection
          key={key}
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          body={section.body}
          primaryCta={section.primaryCta}
          secondaryCta={section.secondaryCta}
          note={section.note}
          as={isFirst ? 'h1' : 'h2'}
        />
      );

    case 'metrics':
      return <MetricsSection key={key} items={section.items} />;

    case 'richText':
      return <RichTextSection key={key} title={section.title} body={section.body} />;

    case 'featureGrid':
      return (
        <FeatureGrid
          key={key}
          title={section.title}
          subtitle={section.subtitle}
          items={section.items}
        />
      );

    case 'process':
      return (
        <ProcessSection
          key={key}
          title={section.title}
          subtitle={section.subtitle}
          steps={section.steps}
        />
      );

    case 'technologies': {
      const technologies = await getTechnologies();
      return <TechStrip key={key} title={section.title} technologies={technologies} />;
    }

    case 'services': {
      const services = await getFeaturedServices(locale);
      return (
        <ServicesSection
          key={key}
          title={section.title}
          subtitle={section.subtitle}
          services={services}
        />
      );
    }

    case 'projects': {
      const projects = await getFeaturedProjects(locale, section.limit ?? 3);
      return (
        <ProjectsSection
          key={key}
          title={section.title}
          subtitle={section.subtitle}
          projects={projects}
        />
      );
    }

    case 'industries': {
      const industries = await getIndustries(locale);
      return (
        <IndustriesSection
          key={key}
          title={section.title}
          subtitle={section.subtitle}
          industries={industries}
        />
      );
    }

    case 'testimonials': {
      const testimonials = await getTestimonials(locale, { featuredOnly: true });
      return (
        <TestimonialsSection
          key={key}
          title={section.title}
          subtitle={section.subtitle}
          testimonials={testimonials}
        />
      );
    }

    case 'blog': {
      const posts = (await getBlogPosts(locale)).slice(0, section.limit ?? 3);
      return (
        <BlogSection key={key} title={section.title} subtitle={section.subtitle} posts={posts} />
      );
    }

    case 'faq': {
      const faqs = await getFaqs(locale, { category: section.category ?? 'general' });
      return (
        <FaqSection key={key} title={section.title} subtitle={section.subtitle} faqs={faqs} />
      );
    }

    case 'cta':
      return (
        <CtaSection
          key={key}
          title={section.title}
          body={section.body}
          primaryCta={section.primaryCta}
        />
      );

    default:
      return null;
  }
}
