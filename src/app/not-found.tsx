import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Monogram } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="container-lux flex min-h-[70vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <Monogram className="h-16 w-16 opacity-80" />
      <p className="eyebrow">Error 404</p>
      <h1 className="font-display text-5xl text-ink sm:text-6xl">
        This page slipped away
      </h1>
      <p className="max-w-md text-ink-soft">
        The page you&apos;re looking for doesn&apos;t exist — but grace is only a
        click away.
      </p>
      <div className="flex gap-3">
        <Button asChild variant="dark">
          <Link href="/">Return Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/shop">Shop the Collection</Link>
        </Button>
      </div>
    </div>
  );
}
