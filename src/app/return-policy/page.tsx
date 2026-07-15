import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/legal-page";

export const metadata: Metadata = { title: "Return & Exchange Policy" };

export default function ReturnPolicyPage() {
  return (
    <LegalPage
      title="Return & Exchange Policy"
      intro="Your satisfaction is our grace. If something isn't quite right, we're here to help."
      sections={[
        {
          heading: "7-Day Exchange",
          body: [
            "We offer a 7-day exchange from the date of delivery on unworn, unwashed items with original tags and packaging intact.",
          ],
        },
        {
          heading: "How to Request",
          body: [
            "Email hello@haneengrace.com or WhatsApp us with your order number and reason. Our team will guide you through the process.",
          ],
        },
        {
          heading: "Non-Returnable Items",
          body: [
            "For hygiene and craftsmanship reasons, sale items, customised pieces and accessories are not eligible for exchange unless faulty.",
          ],
        },
        {
          heading: "Faulty or Incorrect Items",
          body: [
            "If you receive a damaged or incorrect item, contact us within 48 hours of delivery and we'll arrange a replacement at no cost.",
          ],
        },
      ]}
    />
  );
}
