import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [{ title: "Terms and Conditions — Gaspo Studios" }],
  }),
  component: TermsAndConditions,
});

function TermsAndConditions() {
  return (
    <>
      <PageHeader 
        title="Terms & Conditions" 
        crumb="Terms" 
        subtitle="The rules and guidelines for using our services."
        image="/images/photographer_hero.webp"
      />
      
      <div className="container-x py-20 max-w-4xl">
        <div className="prose prose-lg max-w-none text-dark/80 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-dark [&>h2]:mt-10 [&>h2]:mb-4 [&>p]:mb-6 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-6 [&>ul>li]:mb-2">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Gaspo Studios. By accessing our website, booking a shoot, or registering for our events, you agree to comply with and be bound by the following terms and conditions of use.
          </p>

          <h2>2. Bookings and Payments</h2>
          <p>
            All bookings are subject to availability. A deposit may be required to secure your appointment or event registration. Payments are processed securely via our third-party payment providers. Gaspo Studios reserves the right to cancel any booking if payment is not received in full by the stipulated deadline.
          </p>

          <h2>3. Cancellations and Refunds</h2>
          <p>
            We understand that plans change. However, cancellations made within 48 hours of a scheduled shoot may be subject to a cancellation fee or forfeiture of the deposit. Refunds for event registrations are subject to the specific refund policy outlined for that event.
          </p>

          <h2>4. Copyright and Usage Rights</h2>
          <p>
            Gaspo Studios retains the copyright to all photographs and media created during a session, unless explicitly stated otherwise in a commercial contract. Clients are granted a non-exclusive license for personal use. Images may not be used for commercial purposes without prior written consent.
          </p>

          <h2>5. Client Conduct</h2>
          <p>
            We strive to maintain a safe and professional environment. We reserve the right to terminate a session immediately and without refund if a client behaves in an inappropriate, disrespectful, or unsafe manner.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            While we take every precaution to ensure the safety of your data and the delivery of our services, Gaspo Studios shall not be liable for any indirect, incidental, or consequential damages resulting from the use of our services or website.
          </p>

          <h2>7. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Gaspo Studios operates.
          </p>
          
          <p className="text-sm mt-12 text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </>
  );
}
