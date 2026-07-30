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

export function NewsletterWelcomeEmail() {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-[#111111] my-auto mx-auto font-sans">
          <Container className="border border-[#333] rounded my-[40px] mx-auto p-[20px] max-w-[600px]">
            <Section className="mt-[32px]">
              <Heading className="text-[#FF3333] text-[24px] font-bold text-center p-0 my-[30px] mx-0">
                Welcome to Gaspo Studios!
              </Heading>
              <Text className="text-white text-[14px] leading-[24px]">Hi there,</Text>
              <Text className="text-white/80 text-[14px] leading-[24px]">
                Thank you for subscribing to the Gaspo Studios newsletter! You're now on the list to
                receive our latest updates, photography tips, and exclusive event invitations.
              </Text>

              <Text className="text-white/80 text-[14px] leading-[24px] mt-6">
                We promise to only send you the good stuff. Keep an eye on your inbox!
              </Text>

              <Text className="text-white/80 text-[14px] leading-[24px] mt-6">
                Best,
                <br />
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

export default NewsletterWelcomeEmail;
