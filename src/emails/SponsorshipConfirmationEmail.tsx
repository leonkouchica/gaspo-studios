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
  Tailwind,
} from "@react-email/components";

interface SponsorshipConfirmationEmailProps {
  sponsorName: string;
  eventName: string;
  packageName: string;
  amount: number;
  currency: string;
}

export function SponsorshipConfirmationEmail({
  sponsorName = "Acme Corp",
  eventName = "African Photo Week",
  packageName = "Gold Sponsor",
  amount = 5000,
  currency = "USD",
}: SponsorshipConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-[#111111] my-auto mx-auto font-sans">
          <Container className="border border-[#333] rounded my-[40px] mx-auto p-[20px] max-w-[600px]">
            <Section className="mt-[32px]">
              <Heading className="text-white text-[24px] font-bold text-center p-0 my-[30px] mx-0">
                Sponsorship Confirmed!
              </Heading>
              <Text className="text-white text-[14px] leading-[24px]">
                Hi {sponsorName},
              </Text>
              <Text className="text-white/80 text-[14px] leading-[24px]">
                Thank you for your generous sponsorship of <strong>{eventName}</strong>. 
                Your payment for the <strong>{packageName}</strong> package has been received and verified successfully.
              </Text>
              
              <Section className="bg-[#222] rounded p-6 my-6 border border-[#444] text-center">
                <Text className="text-white/70 text-[14px] m-0 mb-2 uppercase tracking-widest text-xs">Total Paid</Text>
                <Text className="text-white text-[32px] font-bold m-0 text-[#FF3333]">
                  {currency} {amount.toLocaleString()}
                </Text>
              </Section>

              <Text className="text-white/80 text-[14px] leading-[24px] mt-6">
                Our team will be in touch shortly to collect your assets (logos, bios) and discuss the next steps to maximize your brand's presence at the event.
              </Text>

              <Text className="text-white/80 text-[14px] leading-[24px] mt-6">
                Thank you for supporting the creative community!<br />
                The Gaspo Studios Team
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

export default SponsorshipConfirmationEmail;
