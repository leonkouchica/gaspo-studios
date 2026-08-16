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

export interface PreEventAppreciationEmailProps {
  /** Personalisation */
  firstName?: string;
  /** Event info */
  eventName?: string;
  eventDate?: string;
  eventTime?: string;
  eventVenue?: string;
  eventCity?: string;
  eventDescription?: string;
  /** Activity list — up to 6 bullets */
  eventActivities?: string[];
  /** Optional banner image URL */
  eventImage?: string;
  /** Deep-link to the event page */
  registrationUrl?: string;
  /** Branding */
  companyName?: string;
  supportEmail?: string;
  websiteUrl?: string;
  /** Optional agenda items */
  agendaItems?: { time: string; title: string }[];
}

export function PreEventAppreciationEmail({
  firstName = "Attendee",
  eventName = "Gaspo Studios Event",
  eventDate = "TBA",
  eventTime = "TBA",
  eventVenue = "TBA",
  eventCity = "",
  eventDescription = "",
  eventActivities = [],
  eventImage,
  registrationUrl = "https://www.gaspostudios.com/events",
  companyName = "Gaspo Studios",
  supportEmail = "hello@gaspostudios.com",
  websiteUrl = "https://www.gaspostudios.com",
  agendaItems = [],
}: PreEventAppreciationEmailProps) {
  const venueDisplay = eventCity ? `${eventVenue}, ${eventCity}` : eventVenue;

  return (
    <Html lang="en">
      <Head />
      <Preview>
        {eventName} is just around the corner — here's everything you need to know!
      </Preview>
      <Tailwind>
        <Body className="bg-[#0a0a0a] font-sans m-0 p-0">
          <Container className="mx-auto max-w-[620px] my-10">

            {/* ── Header / Brand ── */}
            <Section className="bg-[#111111] border-b border-[#D4A843] px-8 py-6 rounded-t-xl text-center">
              <Heading className="text-white text-[13px] font-semibold tracking-[0.2em] uppercase m-0 mb-1">
                {companyName}
              </Heading>
              <Text className="text-[#D4A843] text-[11px] tracking-[0.15em] uppercase m-0">
                Presents
              </Text>
            </Section>

            {/* ── Hero Banner ── */}
            {eventImage ? (
              <Section className="m-0 p-0">
                <Img
                  src={eventImage}
                  alt={eventName}
                  width="620"
                  className="w-full object-cover max-h-[280px]"
                />
              </Section>
            ) : (
              <Section className="bg-gradient-to-br from-[#1a1a1a] to-[#111111] px-8 py-10 text-center m-0">
                <Text className="text-[#D4A843] text-[11px] tracking-[0.2em] uppercase m-0 mb-2">
                  You're Registered
                </Text>
                <Heading className="text-white text-[28px] font-bold m-0 leading-tight">
                  {eventName}
                </Heading>
              </Section>
            )}

            {/* ── Main Body ── */}
            <Section className="bg-[#111111] px-8 py-8">

              {/* Greeting */}
              <Text className="text-white text-[15px] leading-[26px] m-0 mb-4">
                Hi {firstName},
              </Text>
              <Text className="text-white/80 text-[14px] leading-[24px] m-0 mb-6">
                We are getting closer and we can't wait to welcome you at{" "}
                <strong className="text-white">{eventName}</strong>. This email
                has all the details you need — save it, bookmark it, and we'll
                see you there!
              </Text>

              {/* Event Details Card */}
              <Section className="bg-[#1a1a1a] border border-[#333] rounded-lg px-6 py-5 mb-6">
                <Text className="text-[#D4A843] text-[11px] tracking-[0.15em] uppercase font-semibold m-0 mb-4">
                  Event Details
                </Text>
                <Row className="mb-2">
                  <Column className="w-[20px]">
                    <Text className="text-[#D4A843] text-[14px] m-0">📅</Text>
                  </Column>
                  <Column>
                    <Text className="text-white/85 text-[14px] m-0">
                      <strong className="text-white">Date:</strong> {eventDate}
                    </Text>
                  </Column>
                </Row>
                <Row className="mb-2">
                  <Column className="w-[20px]">
                    <Text className="text-[#D4A843] text-[14px] m-0">🕐</Text>
                  </Column>
                  <Column>
                    <Text className="text-white/85 text-[14px] m-0">
                      <strong className="text-white">Time:</strong> {eventTime}
                    </Text>
                  </Column>
                </Row>
                <Row>
                  <Column className="w-[20px]">
                    <Text className="text-[#D4A843] text-[14px] m-0">📍</Text>
                  </Column>
                  <Column>
                    <Text className="text-white/85 text-[14px] m-0">
                      <strong className="text-white">Venue:</strong> {venueDisplay}
                    </Text>
                  </Column>
                </Row>
              </Section>

              {/* About the Event */}
              {eventDescription && (
                <>
                  <Heading className="text-white text-[16px] font-bold m-0 mb-2">
                    About the Event
                  </Heading>
                  <Text className="text-white/75 text-[14px] leading-[24px] m-0 mb-6">
                    {eventDescription}
                  </Text>
                </>
              )}

              {/* What to Expect */}
              {eventActivities.length > 0 && (
                <>
                  <Heading className="text-white text-[16px] font-bold m-0 mb-3">
                    What to Expect
                  </Heading>
                  <Section className="bg-[#1a1a1a] border border-[#333] rounded-lg px-6 py-4 mb-6">
                    {eventActivities.map((activity, i) => (
                      <Row key={i} className="mb-2">
                        <Column className="w-[18px]">
                          <Text className="text-[#D4A843] text-[12px] m-0">✦</Text>
                        </Column>
                        <Column>
                          <Text className="text-white/80 text-[14px] m-0">{activity}</Text>
                        </Column>
                      </Row>
                    ))}
                  </Section>
                </>
              )}

              {/* Agenda */}
              {agendaItems.length > 0 && (
                <>
                  <Heading className="text-white text-[16px] font-bold m-0 mb-3">
                    Event Schedule
                  </Heading>
                  <Section className="bg-[#1a1a1a] border border-[#333] rounded-lg px-6 py-4 mb-6">
                    {agendaItems.map((item, i) => (
                      <Row key={i} className="mb-3">
                        <Column className="w-[80px]">
                          <Text className="text-[#D4A843] text-[12px] font-semibold m-0">
                            {item.time}
                          </Text>
                        </Column>
                        <Column>
                          <Text className="text-white/80 text-[13px] m-0">{item.title}</Text>
                        </Column>
                      </Row>
                    ))}
                  </Section>
                </>
              )}

              {/* Important Notes */}
              <Section className="bg-[#D4A843]/10 border border-[#D4A843]/30 rounded-lg px-6 py-4 mb-6">
                <Text className="text-[#D4A843] text-[11px] tracking-[0.15em] uppercase font-semibold m-0 mb-2">
                  Important
                </Text>
                <Text className="text-white/80 text-[13px] leading-[22px] m-0">
                  Please bring a valid ID and this confirmation email (digital or
                  printed) for check-in. Doors open 30 minutes before the event
                  starts.
                </Text>
              </Section>

              {/* CTA */}
              <Section className="text-center mb-8">
                <Button
                  href={registrationUrl}
                  className="bg-[#D4A843] text-black font-bold text-[14px] px-8 py-4 rounded-full no-underline"
                >
                  View Full Event Details →
                </Button>
              </Section>

              <Text className="text-white/60 text-[13px] leading-[22px] m-0">
                If you have any questions, reply to this email or reach us at{" "}
                <Link href={`mailto:${supportEmail}`} className="text-[#D4A843]">
                  {supportEmail}
                </Link>
                . We can't wait to see you!
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

export default PreEventAppreciationEmail;
