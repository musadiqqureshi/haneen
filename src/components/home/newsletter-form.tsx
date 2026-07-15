"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

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
      <div className="flex items-center gap-3 rounded-full border border-gold-300 bg-ivory/90 px-6 py-4 shadow-sm backdrop-blur">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-300 text-white">
          <Check className="h-4 w-4" />
        </span>
        <p className="text-sm text-ink">
          Welcome to the Grace List — check your inbox soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      {/* Single elegant pill: input + inline gold action */}
      <div className="group flex items-center gap-2 rounded-full border border-gold-300/70 bg-ivory/90 p-1.5 shadow-sm backdrop-blur transition-colors focus-within:border-gold-400">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          aria-label="Email address"
          className="h-11 flex-1 bg-transparent px-5 text-sm text-ink outline-none placeholder:text-ink-muted"
        />
        <button
          type="submit"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-6 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ivory transition-all duration-300 hover:bg-gold-600 active:scale-95"
        >
          Subscribe
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-focus-within:translate-x-0.5" />
        </button>
      </div>
      <p className="mt-3 pl-2 text-xs text-ink-muted">
        No spam, only grace. Unsubscribe anytime.
      </p>
    </form>
  );
}
