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

interface ContactNotificationEmailProps {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export function ContactNotificationEmail({
  name = "John Doe",
  email = "john@example.com",
  phone = "N/A",
  subject = "General Inquiry",
  message = "Hello, I would like to know more about your services.",
}: ContactNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-[#f6f9fc] my-auto mx-auto font-sans">
          <Container className="bg-white border border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[600px]">
            <Section className="mt-[32px]">
              <Heading className="text-[#111] text-[24px] font-bold text-center p-0 my-[30px] mx-0">
                New Contact Message
              </Heading>
              <Text className="text-[#333] text-[14px] leading-[24px]">
                You have received a new message from the Gaspo Studios website contact form.
              </Text>
              
              <Section className="bg-[#f9f9f9] rounded p-6 my-6 border border-[#eaeaea]">
                <Text className="text-[#333] text-[14px] m-0 mb-2">
                  <strong>Name:</strong> {name}
                </Text>
                <Text className="text-[#333] text-[14px] m-0 mb-2">
                  <strong>Email:</strong> {email}
                </Text>
                <Text className="text-[#333] text-[14px] m-0 mb-2">
                  <strong>Phone:</strong> {phone}
                </Text>
                <Text className="text-[#333] text-[14px] m-0 mb-2">
                  <strong>Subject:</strong> {subject}
                </Text>
                <Text className="text-[#333] text-[14px] m-0 mt-4 font-semibold">
                  Message:
                </Text>
                <Text className="text-[#555] text-[14px] m-0 mt-2 whitespace-pre-wrap">
                  {message}
                </Text>
              </Section>

              <Hr className="border border-[#eaeaea] my-[26px] mx-0" />
              <Text className="text-[#666666] text-[12px] leading-[24px] text-center">
                This is an automated notification from the Gaspo Studios Website.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default ContactNotificationEmail;
