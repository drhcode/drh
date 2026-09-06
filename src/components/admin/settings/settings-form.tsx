'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { Loader2, Save } from 'lucide-react';
import type { CompanySettings } from '@/content/seed/settings';
import { saveCompanySettings } from '@/app/admin/actions/system';
import { FormSection, TextAreaField, TextField } from '@/components/admin/form-kit';
import { MediaPicker } from '@/components/admin/media/media-picker';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';

export function SettingsForm({ settings }: { settings: CompanySettings }) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    const result = await saveCompanySettings(formData);

    if (!result.ok) {
      setError(result.error ?? 'Could not save.');
      toast.error(result.error ?? 'Could not save.');
      return;
    }

    toast.success('Settings saved.');
    router.refresh();
  }

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <FormSection title="Company">
          <TextField label="Company name" name="companyName" defaultValue={settings.companyName} />
          <TextAreaField label="Tagline" name="tagline" rows={2} defaultValue={settings.tagline} />
          <TextField label="Location" name="location" defaultValue={settings.location} />
          <TextField label="Service area" name="serviceArea" defaultValue={settings.serviceArea} />
          <TextField label="Address" name="address" defaultValue={settings.address} />
          <TextField
            label="Google Maps URL"
            name="mapsUrl"
            type="url"
            defaultValue={settings.mapsUrl}
          />
          <TextField
            label="Business hours"
            name="businessHours"
            defaultValue={settings.businessHours}
          />
        </FormSection>

        <FormSection title="Contact">
          <TextField label="Email" name="email" type="email" defaultValue={settings.email} />
          <TextField
            label="Phone (dial format)"
            name="phone"
            defaultValue={settings.phone}
            hint="Used in tel: links, e.g. +355682041518"
          />
          <TextField
            label="Phone (display)"
            name="phoneDisplay"
            defaultValue={settings.phoneDisplay}
          />
          <TextField
            label="WhatsApp number"
            name="whatsapp"
            defaultValue={settings.whatsapp}
            hint="Digits only, including the country code."
          />
        </FormSection>

        <FormSection title="Social profiles">
          <TextField
            label="LinkedIn"
            name="linkedin"
            type="url"
            defaultValue={settings.social.linkedin}
          />
          <TextField
            label="Instagram"
            name="instagram"
            type="url"
            defaultValue={settings.social.instagram}
          />
          <TextField
            label="Facebook"
            name="facebook"
            type="url"
            defaultValue={settings.social.facebook}
          />
          <TextField label="GitHub" name="github" type="url" defaultValue={settings.social.github} />
          <p className="text-xs text-subtle-foreground">
            Empty profiles are hidden from the footer and left out of the organisation schema.
          </p>
        </FormSection>

        <FormSection title="Branding">
          <MediaPicker
            name="logo"
            label="Logo (light backgrounds)"
            defaultValue={settings.logo}
            aspect="aspect-[3/1]"
          />
          <MediaPicker
            name="logoDark"
            label="Logo (dark backgrounds)"
            defaultValue={settings.logoDark}
            aspect="aspect-[3/1]"
          />
          <MediaPicker
            name="favicon"
            label="Favicon"
            defaultValue={settings.favicon}
            aspect="aspect-square"
          />
          <MediaPicker
            name="defaultOgImage"
            label="Default OG image"
            description="Used for any page without its own social image. 1200×630 works best."
            defaultValue={settings.defaultOgImage}
          />
        </FormSection>

        <FormSection title="Footer" className="xl:col-span-2">
          <TextAreaField
            label="Footer text"
            name="footerText"
            rows={2}
            defaultValue={settings.footerText}
          />
          <TextField
            label="Copyright"
            name="copyright"
            defaultValue={settings.copyright}
            hint="Use {year} for the current year."
          />
        </FormSection>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 flex justify-end border-t border-border bg-background/90 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <SaveButton />
      </div>
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
      {pending ? 'Saving…' : 'Save settings'}
    </Button>
  );
}
