import { PageHero } from "@/components/ui/page-hero";

export interface LegalSection {
  heading: string;
  body: string[];
}

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro?: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHero
        eyebrow="Haneen Grace"
        title={title}
        breadcrumb={[{ label: "Home", href: "/" }, { label: title }]}
      />
      <article className="container-lux max-w-3xl py-16">
        {intro && (
          <p className="font-serif text-lg leading-relaxed text-ink-soft">{intro}</p>
        )}
        <div className="mt-10 space-y-10">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-display text-2xl text-ink">{s.heading}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-ink-soft">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
        <p className="mt-14 text-sm text-ink-muted">
          Last updated: January 2026. Questions? Email{" "}
          <a href="mailto:hello@haneengrace.com" className="text-gold-600 underline">
            hello@haneengrace.com
          </a>
          .
        </p>
      </article>
    </>
  );
}
