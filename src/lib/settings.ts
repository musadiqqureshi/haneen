import { readClient } from "@/lib/supabase/read";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export interface StoreSettings {
  name: string;
  currency: string;
  free_shipping_threshold: number;
  shipping_fee: number;
  cod_enabled: boolean;
  advance_payment_enabled: boolean;
  advance_percent: number;
  phone: string;
  email: string;
  whatsapp: string;
  instagram: string;
}

/** Bank / manual transfer details for advance payments. */
export interface PaymentSettings {
  bank_name: string;
  account_title: string;
  account_number: string;
  iban: string;
  instructions: string;
}

export const STORE_DEFAULTS: StoreSettings = {
  name: "Haneen Grace",
  currency: "PKR",
  free_shipping_threshold: 15000,
  shipping_fee: 250,
  cod_enabled: true,
  advance_payment_enabled: true,
  advance_percent: 30,
  phone: "",
  email: "hello@haneengrace.com",
  whatsapp: "",
  instagram: "",
};

export const PAYMENT_DEFAULTS: PaymentSettings = {
  bank_name: "",
  account_title: "",
  account_number: "",
  iban: "",
  instructions: "",
};

async function readSetting<T>(key: string, defaults: T): Promise<T> {
  if (!isSupabaseConfigured()) return defaults;
  const { data } = await readClient()
    .from("settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (!data?.value) return defaults;
  return { ...defaults, ...(data.value as Partial<T>) };
}

export function getStoreSettings(): Promise<StoreSettings> {
  return readSetting("store", STORE_DEFAULTS);
}

export function getPaymentSettings(): Promise<PaymentSettings> {
  return readSetting("payment", PAYMENT_DEFAULTS);
}

/** True when enough bank detail exists to show transfer instructions. */
export function hasBankDetails(p: PaymentSettings): boolean {
  return Boolean(p.account_number || p.iban);
}
