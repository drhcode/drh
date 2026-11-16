/** Decorative browser window + "new lead" card beside the service hero. */
export function BrowserMock({ url, leadTitle, leadBody }: { url: string; leadTitle: string; leadBody: string }) {
  return (
    <div className="rise d4 hide-sm relative h-[460px] flex-[1_1_440px]" aria-hidden="true">
      <div className="float absolute inset-[0_40px_40px_0] overflow-hidden rounded-[22px] border border-ln bg-s1 shadow-[0_60px_100px_-40px_var(--sh)]">
        <div className="flex items-center gap-3 border-b border-ln px-4 py-3.5">
          <span className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-2.5 rounded-full bg-ln2" />
            ))}
          </span>
          <span className="mono flex h-7 flex-1 items-center rounded-lg bg-bg px-3 text-xs text-t3">
            <span className="type-in">{url}</span>
          </span>
        </div>
        <div className="p-8">
          <div className="h-3.5 w-[30%] rounded bg-ln2" />
          <div className="mt-[22px] h-[38px] w-[86%] rounded-md bg-fg" />
          <div className="mt-2.5 h-[38px] w-[62%] rounded-md bg-fg" />
          <div className="mt-[22px] h-11 w-[150px] rounded-full bg-lime" />
          <div className="mt-8 grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[90px] rounded-xl bg-s2" />
            ))}
          </div>
        </div>
      </div>
      <div className="float-2 on-lime absolute bottom-0 right-0 w-[230px] rounded-[20px] bg-lime p-5 text-ink shadow-[0_30px_60px_-20px_var(--sh)]">
        <div className="mono text-[11px] tracking-[.08em]">{leadTitle}</div>
        <div className="mt-2 text-lg font-semibold leading-[1.25]">{leadBody}</div>
        <div className="mt-3 h-1 overflow-hidden rounded bg-[#0b0d0c22]">
          <div className="bar d5 h-full bg-ink" />
        </div>
      </div>
    </div>
  );
}
