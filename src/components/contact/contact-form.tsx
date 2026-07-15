"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Phase 2: POST to /api/contact
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[3px] border border-gold-200 bg-beige p-12 text-center">
        <CheckCircle2 className="h-12 w-12 text-gold-500" strokeWidth={1.2} />
        <h3 className="mt-4 font-display text-2xl text-ink">Message sent</h3>
        <p className="mt-2 max-w-sm text-sm text-ink-soft">
          Thank you for reaching out. Our team will get back to you within one
          business day.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[3px] border border-line bg-ivory p-8"
    >
      <h2 className="font-display text-2xl text-ink">Send a Message</h2>
      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Name" name="name" required />
          <Input label="Email" name="email" type="email" required />
        </div>
        <Input label="Subject" name="subject" />
        <label className="block">
          <span className="mb-1.5 block text-[0.72rem] uppercase tracking-[0.14em] text-ink-soft">
            Message <span className="text-gold-500">*</span>
          </span>
          <textarea
            name="message"
            required
            rows={5}
            className="w-full resize-none border border-line bg-ivory px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold-400"
          />
        </label>
      </div>
      <Button type="submit" variant="dark" size="lg" className="mt-6 w-full sm:w-auto">
        Send Message
      </Button>
    </form>
  );
}

function Input({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.72rem] uppercase tracking-[0.14em] text-ink-soft">
        {label} {required && <span className="text-gold-500">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        className="h-12 w-full border border-line bg-ivory px-4 text-sm text-ink outline-none transition-colors focus:border-gold-400"
      />
    </label>
  );
}
