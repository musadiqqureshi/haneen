import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/legal-page";

export const metadata: Metadata = { title: "Shipping Policy" };

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      title="Shipping Policy"
      intro="We deliver grace to your doorstep across Pakistan, carefully packaged and handled with care."
      sections={[
        {
          heading: "Delivery Timeframe",
          body: [
            "Orders are dispatched within 1–2 business days. Standard delivery takes 3–5 business days depending on your city.",
            "Festive and made-to-order pieces may require additional time, noted on the product page.",
          ],
        },
        {
          heading: "Shipping Charges",
          body: [
            "A flat shipping fee of PKR 250 applies to all orders. Enjoy complimentary shipping on orders above PKR 15,000.",
          ],
        },
        {
          heading: "Cash on Delivery",
          body: [
            "Cash on Delivery is available nationwide. Please keep the exact amount ready at the time of delivery.",
          ],
        },
        {
          heading: "Order Tracking",
          body: [
            "Once dispatched, you'll receive a tracking number by SMS. You can also track your order anytime from the Track Order page.",
          ],
        },
      ]}
    />
  );
}
