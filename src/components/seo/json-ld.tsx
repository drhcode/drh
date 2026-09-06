/**
 * Emits a JSON-LD block. Content is produced by src/lib/seo/schema.ts, which
 * is the only place structured data is constructed.
 */
export function JsonLd({ json }: { json: string }) {
  return (
    <script
      type="application/ld+json"
      // The payload is JSON.stringify output from our own schema builders.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
