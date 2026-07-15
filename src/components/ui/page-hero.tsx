import Link from "next/link";

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumb,
  accent = "#f5eee6",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumb?: { label: string; href?: string }[];
  accent?: string;
}) {
  return (
    <section
      className="relative overflow-hidden border-b border-line"
      style={{
        background: `linear-gradient(120deg, ${accent}, #faf8f5 80%)`,
      }}
    >
      <div className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-gold-100/50 blur-3xl" />
      <div className="container-lux relative py-14 text-center sm:py-20">
        {breadcrumb && (
          <nav className="mb-4 flex items-center justify-center gap-2 text-[0.68rem] uppercase tracking-[0.14em] text-ink-muted">
            {breadcrumb.map((b, i) => (
              <span key={b.label} className="flex items-center gap-2">
                {b.href ? (
                  <Link href={b.href} className="hover:text-gold-600">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-gold-600">{b.label}</span>
                )}
                {i < breadcrumb.length - 1 && <span>/</span>}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">{title}</h1>
        {description && (
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
