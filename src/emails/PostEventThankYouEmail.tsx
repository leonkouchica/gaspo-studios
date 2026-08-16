import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Button,
  Tailwind,
  Img,
  Preview,
  Row,
  Column,
  Link,
} from "@react-email/components";

export interface PostEventThankYouEmailProps {
  /** Personalisation */
  firstName?: string;
  /** Event info */
  eventName?: string;
  eventDate?: string;
  /** Up to 2 highlight photos from the event */
  photo1Url?: string;
  photo2Url?: string;
  /** Optional gallery / feedback links */
  galleryUrl?: string;
  feedbackUrl?: string;
  nextEventUrl?: string;
  /** Branding */
  companyName?: string;
  supportEmail?: string;
  websiteUrl?: string;
}

export function PostEventThankYouEmail({
  firstName = "Attendee",
  eventName = "Gaspo Studios Event",
  eventDate = "",
  photo1Url,
  photo2Url,
  galleryUrl = "https://www.gaspostudios.com/gallery",
  feedbackUrl,
  nextEventUrl = "https://www.gaspostudios.com/events",
  companyName = "Gaspo Studios",
  supportEmail = "hello@gaspostudios.com",
  websiteUrl = "https://www.gaspostudios.com",
}: PostEventThankYouEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        Thank you for joining us at {eventName} — it was an incredible experience!
      </Preview>
      <Tailwind>
        <Body className="bg-[#0a0a0a] font-sans m-0 p-0">
          <Container className="mx-auto max-w-[620px] my-10">

            {/* ── Header ── */}
            <Section className="bg-[#111111] border-b border-[#D4A843] px-8 py-6 rounded-t-xl text-center">
              <Heading className="text-white text-[13px] font-semibold tracking-[0.2em] uppercase m-0 mb-1">
                {companyName}
              </Heading>
              <Text className="text-[#D4A843] text-[11px] tracking-[0.15em] uppercase m-0">
                Thank You
              </Text>
            </Section>

            {/* ── Hero ── */}
            <Section className="bg-gradient-to-br from-[#1c1400] to-[#111111] px-8 py-12 text-center m-0">
              <Text className="text-[#D4A843] text-[32px] m-0 mb-2">🎉</Text>
              <Heading className="text-white text-[28px] font-bold m-0 mb-2 leading-tight">
                What a Day!
              </Heading>
              <Text className="text-white/60 text-[14px] m-0">
                {eventDate && `${eventDate} · `}{eventName}
              </Text>
            </Section>

            {/* ── Main Body ── */}
            <Section className="bg-[#111111] px-8 py-8">

              {/* Greeting */}
              <Text className="text-white text-[15px] leading-[26px] m-0 mb-4">
                Hi {firstName},
              </Text>
              <Text className="text-white/80 text-[14px] leading-[24px] m-0 mb-4">
                Thank you for being part of{" "}
                <strong className="text-white">{eventName}</strong>. Your
                presence made it truly special. We hope you left inspired,
                connected, and with stories worth telling.
              </Text>
              <Text className="text-white/80 text-[14px] leading-[24px] m-0 mb-6">
                We captured some great moments — here's a glimpse of what we
                shared together:
              </Text>

              {/* Event Photos */}
              {(photo1Url || photo2Url) && (
                <Section className="mb-6">
                  {photo1Url && (
                    <Img
                      src={photo1Url}
                      alt={`${eventName} highlight 1`}
                      width="560"
                      className="w-full rounded-lg mb-3 object-cover"
                    />
                  )}
                  {photo2Url && (
                    <Img
                      src={photo2Url}
                      alt={`${eventName} highlight 2`}
                      width="560"
                      className="w-full rounded-lg object-cover"
                    />
                  )}
                </Section>
              )}

              {/* Gallery CTA */}
              <Section className="text-center mb-6">
                <Button
                  href={galleryUrl}
                  className="bg-[#D4A843] text-black font-bold text-[14px] px-8 py-4 rounded-full no-underline"
                >
                  View Full Gallery →
                </Button>
              </Section>

              <Hr className="border-[#222] my-6" />

              {/* Feedback */}
              {feedbackUrl && (
                <Section className="bg-[#1a1a1a] border border-[#333] rounded-lg px-6 py-5 mb-6 text-center">
                  <Heading className="text-white text-[16px] font-bold m-0 mb-2">
                    We'd Love Your Feedback
                  </Heading>
                  <Text className="text-white/65 text-[13px] leading-[22px] m-0 mb-4">
                    Help us make the next event even better. It only takes 2
                    minutes.
                  </Text>
                  <Button
                    href={feedbackUrl}
                    className="bg-transparent border border-[#D4A843] text-[#D4A843] font-semibold text-[13px] px-6 py-3 rounded-full no-underline"
                  >
                    Share Your Feedback
                  </Button>
                </Section>
              )}

              {/* What's Next */}
              <Section className="bg-[#D4A843]/10 border border-[#D4A843]/30 rounded-lg px-6 py-5 mb-6 text-center">
                <Text className="text-[#D4A843] text-[11px] tracking-[0.15em] uppercase font-semibold m-0 mb-2">
                  Stay Connected
                </Text>
                <Text className="text-white/75 text-[13px] leading-[22px] m-0 mb-4">
                  This is just the beginning. Follow us for announcements about
                  upcoming events, masterclasses, and more.
                </Text>
                <Button
                  href={nextEventUrl}
                  className="bg-[#D4A843] text-black font-semibold text-[13px] px-6 py-3 rounded-full no-underline"
                >
                  Explore Upcoming Events
                </Button>
              </Section>

              <Text className="text-white/60 text-[13px] leading-[22px] m-0">
                Questions? Reach us at{" "}
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

export default PostEventThankYouEmail;
