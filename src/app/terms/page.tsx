import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/legal-page";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro="By using haneengrace.com and placing an order, you agree to the following terms."
      sections={[
        {
          heading: "Orders & Pricing",
          body: [
            "All prices are listed in Pakistani Rupees (PKR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to correct pricing errors.",
          ],
        },
        {
          heading: "Product Representation",
          body: [
            "We make every effort to display colours and details accurately, though slight variations may occur due to screen settings and the handcrafted nature of our pieces.",
          ],
        },
        {
          heading: "Payment",
          body: [
            "We currently accept Cash on Delivery nationwide. Advance payment options may be introduced and will be governed by their own terms at the time of purchase.",
          ],
        },
        {
          heading: "Intellectual Property",
          body: [
            "All content, designs and imagery on this site are the property of Haneen Grace and may not be reproduced without permission.",
          ],
        },
      ]}
    />
  );
}
