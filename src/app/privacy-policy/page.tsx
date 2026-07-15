import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/legal-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="We respect your privacy and are committed to protecting the personal information you share with us."
      sections={[
        {
          heading: "Information We Collect",
          body: [
            "We collect information you provide at checkout — your name, contact details and delivery address — solely to fulfil and communicate about your orders.",
          ],
        },
        {
          heading: "How We Use It",
          body: [
            "Your information is used to process orders, provide customer support, and, with your consent, share news of new collections and offers.",
          ],
        },
        {
          heading: "Data Protection",
          body: [
            "We never sell your data. Payment and personal details are handled securely and shared only with delivery partners as needed to complete your order.",
          ],
        },
        {
          heading: "Your Choices",
          body: [
            "You can unsubscribe from marketing at any time and request access to or deletion of your data by emailing hello@haneengrace.com.",
          ],
        },
      ]}
    />
  );
}
