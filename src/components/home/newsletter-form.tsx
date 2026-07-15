"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // Phase 2: POST to /api/newsletter -> Supabase newsletter_subscribers
    setDone(true);
    setEmail("");
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 rounded-[2px] border border-gold-300 bg-ivory px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-300 text-white">
          <Check className="h-4 w-4" />
        </span>
        <p className="text-sm text-ink">
          Welcome to the Grace List — check your inbox soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        aria-label="Email address"
        className="h-12 flex-1 border border-line bg-ivory px-4 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-gold-400"
      />
      <Button type="submit" variant="dark" size="md">
        Subscribe
      </Button>
    </form>
  );
}
