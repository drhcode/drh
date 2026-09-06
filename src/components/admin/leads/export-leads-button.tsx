'use client';

import { Download } from 'lucide-react';
import type { LeadRow } from '@/types/database';
import { Button } from '@/components/ui/button';

const COLUMNS: { key: keyof LeadRow; label: string }[] = [
  { key: 'created_at', label: 'Received' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'company', label: 'Company' },
  { key: 'website', label: 'Website' },
  { key: 'service', label: 'Service' },
  { key: 'budget', label: 'Budget' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'status', label: 'Status' },
  { key: 'estimated_value', label: 'Estimated value' },
  { key: 'won_value', label: 'Won value' },
  { key: 'source', label: 'Source' },
  { key: 'utm_source', label: 'UTM source' },
  { key: 'utm_medium', label: 'UTM medium' },
  { key: 'utm_campaign', label: 'UTM campaign' },
  { key: 'landing_page', label: 'Landing page' },
  { key: 'country', label: 'Country' },
  { key: 'device', label: 'Device' },
];

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  // Guard against CSV formula injection when the file is opened in a spreadsheet.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Client-side CSV export of the currently filtered leads. */
export function ExportLeadsButton({ leads }: { leads: LeadRow[] }) {
  function download() {
    const header = COLUMNS.map((column) => escapeCell(column.label)).join(',');
    const rows = leads.map((lead) =>
      COLUMNS.map((column) => escapeCell(lead[column.key])).join(','),
    );

    const blob = new Blob([`﻿${[header, ...rows].join('\r\n')}`], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `drh-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={download} disabled={leads.length === 0}>
      <Download className="size-4" />
      Export CSV
    </Button>
  );
}
