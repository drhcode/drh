'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CalendarDays, Check } from 'lucide-react';
import {
  RANGE_LABELS,
  RANGE_PRESETS,
  formatRange,
  type DateRange,
  type RangePreset,
} from '@/lib/analytics/date-range';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { startRouteProgress } from '@/components/route-progress';

/**
 * Dashboard date filter (spec §45).
 *
 * State lives in the URL so a range can be shared, bookmarked and restored on
 * reload, and so every server component on the page reads the same value.
 */
export function DateRangePicker({
  preset,
  range,
}: {
  preset: RangePreset;
  range: DateRange;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [customOpen, setCustomOpen] = React.useState(false);
  const [from, setFrom] = React.useState(range.startDate);
  const [to, setTo] = React.useState(range.endDate);

  const apply = React.useCallback(
    (next: RangePreset, customFrom?: string, customTo?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('range', next);

      if (next === 'custom' && customFrom && customTo) {
        params.set('from', customFrom);
        params.set('to', customTo);
      } else {
        params.delete('from');
        params.delete('to');
      }

      startRouteProgress();

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarDays className="size-4" />
            <span>{RANGE_LABELS[preset]}</span>
            <span className="hidden text-xs text-subtle-foreground sm:inline">
              {formatRange(range)}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-[14rem]">
          {RANGE_PRESETS.filter((option) => option !== 'custom').map((option) => (
            <DropdownMenuItem key={option} onSelect={() => apply(option)}>
              <span className="flex-1">{RANGE_LABELS[option]}</span>
              {preset === option && <Check className="size-3.5 text-accent" />}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setCustomOpen((open) => !open);
            }}
          >
            <span className="flex-1">Custom range</span>
            {preset === 'custom' && <Check className="size-3.5 text-accent" />}
          </DropdownMenuItem>

          {customOpen && (
            <div className="border-t border-border p-3">
              <div className="space-y-2.5">
                <div>
                  <Label htmlFor="range-from" className="text-xs">
                    From
                  </Label>
                  <Input
                    id="range-from"
                    type="date"
                    value={from}
                    max={to}
                    onChange={(event) => setFrom(event.target.value)}
                    className="mt-1 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="range-to" className="text-xs">
                    To
                  </Label>
                  <Input
                    id="range-to"
                    type="date"
                    value={to}
                    min={from}
                    onChange={(event) => setTo(event.target.value)}
                    className="mt-1 h-9 text-sm"
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setCustomOpen(false);
                    apply('custom', from, to);
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
