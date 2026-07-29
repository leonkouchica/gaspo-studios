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
  Link,
  Img
} from "@react-email/components";

interface EventRegistrationEmailProps {
  fullName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventType: string; // 'virtual', 'physical', 'hybrid'
  venue?: string;
  mapEmbedUrl?: string;
}

export function EventRegistrationEmail({
  fullName = "Attendee",
  eventName = "Gaspo Studios Event",
  eventDate = "TBA",
  eventTime = "TBA",
  eventType = "physical",
  venue,
}: EventRegistrationEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-[#111111] my-auto mx-auto font-sans">
          <Container className="border border-[#333] rounded my-[40px] mx-auto p-[20px] max-w-[600px]">
            <Section className="mt-[32px]">
              <Heading className="text-white text-[24px] font-bold text-center p-0 my-[30px] mx-0">
                You're Registered!
              </Heading>
              <Text className="text-white text-[14px] leading-[24px]">
                Hi {fullName},
              </Text>
              <Text className="text-white/80 text-[14px] leading-[24px]">
                Thank you for registering for <strong>{eventName}</strong>. We are thrilled to have you join us!
              </Text>
              
              <Section className="bg-[#222] rounded p-6 my-6 border border-[#444]">
                <Text className="text-white text-[16px] font-semibold mt-0 mb-2">Event Details:</Text>
                <Text className="text-white/70 text-[14px] m-0 mb-1">
                  <strong>Date:</strong> {eventDate}
                </Text>
                <Text className="text-white/70 text-[14px] m-0 mb-1">
                  <strong>Time:</strong> {eventTime}
                </Text>
                <Text className="text-white/70 text-[14px] m-0 mb-1">
                  <strong>Type:</strong> <span className="capitalize">{eventType}</span>
                </Text>
                {venue && (
                  <Text className="text-white/70 text-[14px] m-0 mt-4">
                    <strong>Venue:</strong> {venue}
                  </Text>
                )}
              </Section>

              {eventType === "virtual" || eventType === "hybrid" ? (
                <Text className="text-white/80 text-[14px] leading-[24px]">
                  A join link will be emailed to you closer to the event date.
                </Text>
              ) : null}

              <Text className="text-white/80 text-[14px] leading-[24px] mt-6">
                If you have any questions, feel free to reply to this email or contact our support team.
              </Text>
              <Hr className="border border-[#333] my-[26px] mx-0" />
              <Text className="text-[#666666] text-[12px] leading-[24px] text-center">
                Gaspo Studios • Phase 2, Charly Boy Bus/Stop, 4a Ajidagan St Gbagada, Lagos
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default EventRegistrationEmail;
