import { PageTitle } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings-form";
import { getStoreSettings, getPaymentSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [store, payment] = await Promise.all([
    getStoreSettings(),
    getPaymentSettings(),
  ]);

  return (
    <>
      <PageTitle
        title="Settings"
        subtitle="Shipping, advance payment and your bank transfer details."
      />
      <SettingsForm store={store} payment={payment} />
    </>
  );
}
