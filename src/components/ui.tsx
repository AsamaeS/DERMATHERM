import React, { useEffect, useRef } from "react";
import katex from "katex";

/* ---------------- KaTeX ---------------- */
export function Eq({ tex, block = false }: { tex: string; block?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      katex.render(tex, ref.current, { displayMode: block, throwOnError: false, strict: false });
    }
  }, [tex, block]);
  if (block)
    return (
      <div ref={ref} className="eqbox overflow-x-auto py-2 px-1 my-2 border-l-2 border-line pl-4 bg-ink2/50" />
    );
  return <span ref={ref} className="whitespace-nowrap" />;
}

/* ---------------- scroll reveal ---------------- */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("is-in");
            io.disconnect();
          }
        });
      },
      { threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ---------------- status chips ---------------- */
export type Status =
  | "SUPPORTED"
  | "PARTIALLY SUPPORTED"
  | "PROPOSED"
  | "ASSUMED"
  | "NOT VERIFIED"
  | "MEASURED"
  | "DERIVED"
  | "OUT OF SCOPE";

const STATUS_STYLE: Record<Status, string> = {
  SUPPORTED: "bg-ok/12 text-ok border-ok/35",
  "PARTIALLY SUPPORTED": "bg-warn/12 text-warn border-warn/35",
  PROPOSED: "bg-aqua/12 text-aqua border-aqua/35",
  ASSUMED: "bg-heat/12 text-heat2 border-heat/35",
  "NOT VERIFIED": "bg-bad/12 text-bad border-bad/35",
  MEASURED: "bg-ok/12 text-ok border-ok/35",
  DERIVED: "bg-warn/12 text-warn border-warn/35",
  "OUT OF SCOPE": "bg-dim/15 text-muted border-line",
};

export function Chip({ s, small = false }: { s: Status; small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border font-mono font-semibold uppercase tracking-wider rounded-sm ${
        STATUS_STYLE[s]
      } ${small ? "text-[9px] px-1.5 py-[2px]" : "text-[10px] px-2 py-0.5"}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {s}
    </span>
  );
}

/* ---------------- section shell ---------------- */
export function Section({
  id,
  no,
  kicker,
  title,
  children,
  wide = false,
}: {
  id: string;
  no: string;
  kicker: string;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <section id={id} className="relative scroll-mt-24 py-14 border-t border-line/60">
      <div className={wide ? "" : "max-w-4xl"}>
        <Reveal>
          <div className="flex items-baseline gap-5 mb-8">
            <span className="ghost-num text-[64px] leading-none md:text-[84px]">{no}</span>
            <div>
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-aqua mb-2">{kicker}</p>
              <h2 className="font-display font-700 text-2xl md:text-[34px] leading-[1.08] tracking-tight text-paper font-bold">
                {title}
              </h2>
            </div>
          </div>
        </Reveal>
        <div className="space-y-5 text-[15px] leading-relaxed text-paper/85">{children}</div>
      </div>
    </section>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <Reveal><p className="max-w-3xl">{children}</p></Reveal>;
}

export function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warn" | "critical" | "ok";
  title: string;
  children: React.ReactNode;
}) {
  const tones = {
    info: "border-aqua/40 text-aqua2",
    warn: "border-warn/40 text-warn",
    critical: "border-bad/40 text-bad",
    ok: "border-ok/40 text-ok",
  };
  return (
    <Reveal>
      <div className={`border-l-2 bg-ink2/70 px-4 py-3 ${tones[tone]}`}>
        <p className="font-mono text-[10px] font-semibold tracking-[0.18em] uppercase mb-1.5">{title}</p>
        <div className="text-[13.5px] leading-relaxed text-paper/80">{children}</div>
      </div>
    </Reveal>
  );
}

export function Mono({ children, c = "text-aqua2" }: { children: React.ReactNode; c?: string }) {
  return <code className={`font-mono text-[0.86em] ${c}`}>{children}</code>;
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`bg-ink2/80 border border-line rounded-md ${className}`}>{children}</div>;
}

export function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display font-semibold text-lg text-paper pt-2 flex items-center gap-2.5">
      <span className="w-2 h-2 bg-heat inline-block rotate-45" />
      {children}
    </h3>
  );
}
