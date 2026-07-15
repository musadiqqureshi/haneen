import { Monogram } from "@/components/brand/logo";

/** Centered card shell used by the auth pages. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden">
      <div className="brand-gradient pointer-events-none absolute inset-0 opacity-60" />
      <div className="container-lux relative flex min-h-[78vh] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-[3px] border border-line bg-ivory/90 p-8 shadow-[0_20px_60px_-30px_rgba(47,42,36,0.35)] backdrop-blur sm:p-10">
          <div className="mb-7 flex flex-col items-center text-center">
            <Monogram className="h-12 w-12" />
            <h1 className="mt-4 font-display text-2xl text-ink sm:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-ink-soft">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
