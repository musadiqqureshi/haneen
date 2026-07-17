"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveSettingsAction, type AdminFormState } from "@/lib/admin/actions";
import type { StoreSettings, PaymentSettings } from "@/lib/settings";

const input =
  "h-11 w-full rounded-md border border-line bg-ivory px-3.5 text-sm text-ink outline-none focus:border-gold-400";
const label =
  "mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink";

function Save() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center rounded-md bg-ink px-8 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-gold-700 disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save Settings"}
    </button>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-line bg-ivory p-6">
      <h2 className="font-display text-xl text-ink">{title}</h2>
      {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function SettingsForm({
  store,
  payment,
}: {
  store: StoreSettings;
  payment: PaymentSettings;
}) {
  const [state, action] = useActionState(saveSettingsAction, {} as AdminFormState);

  return (
    <form action={action} className="max-w-3xl space-y-6">
      {state.error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Settings saved.
        </p>
      )}

      <Card title="Orders & Shipping">
        <div>
          <label className={label}>Shipping Fee (PKR)</label>
          <input
            name="shipping_fee"
            type="number"
            min={0}
            defaultValue={store.shipping_fee}
            className={input}
          />
        </div>
        <div>
          <label className={label}>Free Shipping Over (PKR)</label>
          <input
            name="free_shipping_threshold"
            type="number"
            min={0}
            defaultValue={store.free_shipping_threshold}
            className={input}
          />
        </div>
        <div>
          <label className={label}>Advance Deposit (%)</label>
          <input
            name="advance_percent"
            type="number"
            min={1}
            max={100}
            defaultValue={store.advance_percent}
            className={input}
          />
        </div>
        <div className="flex items-end gap-5 pb-2">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              name="cod_enabled"
              defaultChecked={store.cod_enabled}
              className="h-4 w-4 accent-gold-500"
            />
            COD enabled
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              name="advance_payment_enabled"
              defaultChecked={store.advance_payment_enabled}
              className="h-4 w-4 accent-gold-500"
            />
            Advance enabled
          </label>
        </div>
      </Card>

      <Card
        title="Bank Transfer Details"
        description="Shown to customers who choose Advance Payment. Leave blank and we'll tell them your team will share details on WhatsApp instead."
      >
        <div>
          <label className={label}>Bank Name</label>
          <input
            name="bank_name"
            defaultValue={payment.bank_name}
            className={input}
            placeholder="Meezan Bank"
          />
        </div>
        <div>
          <label className={label}>Account Title</label>
          <input
            name="account_title"
            defaultValue={payment.account_title}
            className={input}
            placeholder="Haneen Grace"
          />
        </div>
        <div>
          <label className={label}>Account Number</label>
          <input
            name="account_number"
            defaultValue={payment.account_number}
            className={input}
          />
        </div>
        <div>
          <label className={label}>IBAN</label>
          <input name="iban" defaultValue={payment.iban} className={input} />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Extra Instructions</label>
          <input
            name="instructions"
            defaultValue={payment.instructions}
            className={input}
            placeholder="Send the receipt to our WhatsApp to confirm."
          />
        </div>
      </Card>

      <Card title="Contact">
        <div>
          <label className={label}>Phone</label>
          <input name="phone" defaultValue={store.phone} className={input} />
        </div>
        <div>
          <label className={label}>WhatsApp</label>
          <input name="whatsapp" defaultValue={store.whatsapp} className={input} />
        </div>
        <div>
          <label className={label}>Email</label>
          <input name="email" defaultValue={store.email} className={input} />
        </div>
        <div>
          <label className={label}>Instagram URL</label>
          <input
            name="instagram"
            defaultValue={store.instagram}
            className={input}
          />
        </div>
      </Card>

      <Save />
    </form>
  );
}
