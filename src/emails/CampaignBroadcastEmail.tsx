import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Button,
  Tailwind,
  Preview,
  Link,
} from "@react-email/components";

export interface CampaignBroadcastEmailProps {
  /** Personalisation */
  firstName?: string;
  /** Campaign content */
  subject?: string;
  bodyHtml?: string;
  /** Optional CTA */
  ctaLabel?: string;
  ctaUrl?: string;
  /** Branding */
  companyName?: string;
  supportEmail?: string;
  websiteUrl?: string;
  /** Context line shown at bottom */
  eventName?: string;
}

export function CampaignBroadcastEmail({
  firstName = "Attendee",
  subject = "A message from Gaspo Studios",
  bodyHtml = "<p>Hello! We have an update for you.</p>",
  ctaLabel,
  ctaUrl,
  companyName = "Gaspo Studios",
  supportEmail = "hello@gaspostudios.com",
  websiteUrl = "https://www.gaspostudios.com",
  eventName,
}: CampaignBroadcastEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{subject}</Preview>
      <Tailwind>
        <Body className="bg-[#0a0a0a] font-sans m-0 p-0">
          <Container className="mx-auto max-w-[620px] my-10">

            {/* ── Header ── */}
            <Section className="bg-[#111111] border-b border-[#D4A843] px-8 py-6 rounded-t-xl text-center">
              <Heading className="text-white text-[13px] font-semibold tracking-[0.2em] uppercase m-0 mb-1">
                {companyName}
              </Heading>
              {eventName && (
                <Text className="text-[#D4A843] text-[11px] tracking-[0.15em] uppercase m-0">
                  {eventName}
                </Text>
              )}
            </Section>

            {/* ── Body ── */}
            <Section className="bg-[#111111] px-8 py-8">
              <Text className="text-white text-[15px] leading-[26px] m-0 mb-4">
                Hi {firstName},
              </Text>

              {/* Admin-authored content rendered as HTML */}
              <Section className="text-white/80 text-[14px] leading-[26px] mb-6">
                <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
              </Section>

              {/* Optional CTA */}
              {ctaLabel && ctaUrl && (
                <Section className="text-center mt-6 mb-6">
                  <Button
                    href={ctaUrl}
                    className="bg-[#D4A843] text-black font-bold text-[14px] px-8 py-4 rounded-full no-underline"
                  >
                    {ctaLabel} →
                  </Button>
                </Section>
              )}

              <Text className="text-white/50 text-[13px] leading-[22px] m-0 mt-6">
                Questions? Contact us at{" "}
                <Link href={`mailto:${supportEmail}`} className="text-[#D4A843]">
                  {supportEmail}
                </Link>
                .
              </Text>
            </Section>

            {/* ── Footer ── */}
            <Section className="bg-[#0d0d0d] px-8 py-6 rounded-b-xl text-center border-t border-[#222]">
              <Text className="text-white/30 text-[11px] m-0 mb-1">
                © {new Date().getFullYear()} {companyName}. All rights reserved.
              </Text>
              <Text className="text-white/20 text-[11px] m-0">
                Phase 2, Charly Boy Bus/Stop, 4a Ajidagan St Gbagada, Lagos •{" "}
                <Link href={websiteUrl} className="text-white/30">
                  {websiteUrl}
                </Link>
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default CampaignBroadcastEmail;
