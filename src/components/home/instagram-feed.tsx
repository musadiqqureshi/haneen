import { InstagramIcon } from "@/components/brand/social-icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

// gradient tiles echoing brand fabric tones; swap for real IG imagery later
const tiles: [string, string][] = [
  ["#dfe7cf", "#b9c79f"],
  ["#b5273a", "#7c1420"],
  ["#f4dee0", "#e1bcc0"],
  ["#e2cfa6", "#c9a56d"],
  ["#6b7040", "#464a24"],
  ["#f6f1e8", "#e4d8c4"],
];

export function InstagramFeed() {
  return (
    <section className="container-lux py-20 sm:py-24">
      <SectionHeading
        eyebrow="@haneengrace"
        title="Follow the Grace"
        description="Tag @haneengrace to be featured. Join our world of everyday luxury."
      />
      <div className="mt-12 grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
        {tiles.map(([from, to], i) => (
          <Reveal key={i} delay={i * 0.04}>
            <a
              href="#"
              aria-label="View on Instagram"
              className="group relative block aspect-square overflow-hidden rounded-[2px]"
              style={{ background: `linear-gradient(150deg, ${from}, ${to})` }}
            >
              <div className="absolute inset-0 flex items-center justify-center bg-ink/30 opacity-0 backdrop-blur-[1px] transition-opacity duration-500 group-hover:opacity-100">
                <InstagramIcon className="h-6 w-6 text-ivory" />
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
