'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/input';

/**
 * Simple list field: one item per line, serialised to a JSON string array.
 * Used for feature checklists where a full repeatable editor would be overkill.
 */
export function StringListField({
  name,
  label,
  description,
  defaultValue = [],
  rows = 8,
}: {
  name: string;
  label: string;
  description?: string;
  defaultValue?: string[];
  rows?: number;
}) {
  const [text, setText] = React.useState(defaultValue.join('\n'));

  const items = React.useMemo(
    () =>
      text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    [text],
  );

  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}

      <input type="hidden" name={name} value={JSON.stringify(items)} />

      <Textarea
        id={name}
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={rows}
        className="mt-2 font-mono text-sm"
      />
      <p className="mt-1.5 text-xs text-subtle-foreground">
        {items.length} {items.length === 1 ? 'item' : 'items'}
      </p>
    </div>
  );
}
