import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [{ title: "Privacy Policy — Gaspo Studios" }],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <>
      <PageHeader
        title="Privacy Policy"
        crumb="Privacy"
        subtitle="How we collect, use, and protect your data."
        image="/images/photographer_hero.webp"
      />

      <div className="container-x py-20 max-w-4xl">
        <div className="prose prose-lg max-w-none text-dark/80 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-dark [&>h2]:mt-10 [&>h2]:mb-4 [&>p]:mb-6 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-6 [&>ul>li]:mb-2">
          <h2>1. Information We Collect</h2>
          <p>
            When you visit Gaspo Studios or use our services (such as booking a shoot or registering
            for an event), we may collect the following types of information:
          </p>
          <ul>
            <li>Personal identification information (Name, email address, phone number)</li>
            <li>Event registration and booking details</li>
            <li>
              Payment information (processed securely through our third-party payment providers)
            </li>
            <li>Usage data and cookies to improve our website experience</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect primarily to provide, maintain, and improve our
            services. Specifically, we use your data to:
          </p>
          <ul>
            <li>Process your bookings and event registrations</li>
            <li>Communicate with you regarding your appointments or inquiries</li>
            <li>Send newsletters and promotional materials (only if you have opted in)</li>
            <li>Improve the functionality and user experience of our website</li>
          </ul>

          <h2>3. Data Protection and Security</h2>
          <p>
            We take the security of your personal data seriously. We implement reasonable technical
            and organizational measures to protect your information against unauthorized access,
            loss, or alteration.
          </p>

          <h2>4. Third-Party Services</h2>
          <p>
            We may use third-party services (such as Supabase for database hosting and Paystack for
            payment processing). These services have their own privacy policies governing how they
            handle your data. We only share necessary data with these partners to fulfill our
            services.
          </p>

          <h2>5. Your Rights</h2>
          <p>
            You have the right to request access to the personal data we hold about you, request
            corrections, or request deletion of your data. If you wish to exercise any of these
            rights, please contact us at hello@gaspostudios.com.
          </p>

          <h2>6. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. Any changes will be posted on this
            page with an updated revision date.
          </p>

          <p className="text-sm mt-12 text-muted-foreground">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>
    </>
  );
}
