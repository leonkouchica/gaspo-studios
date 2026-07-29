import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface NewsletterBroadcastEmailProps {
  subject: string;
  content: string; // HTML content from the rich text editor
}

export default function NewsletterBroadcastEmail({
  subject = "Gaspo Studios Update",
  content = "<p>Hello from Gaspo Studios!</p>",
}: NewsletterBroadcastEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans text-gray-900">
          <Container className="mx-auto my-10 max-w-[600px] rounded-lg bg-white p-8 shadow-sm">
            <Section className="mb-8 border-b border-gray-200 pb-4 text-center">
              <Heading className="text-2xl font-bold text-gray-900 tracking-tight">
                Gaspo Studios
              </Heading>
            </Section>
            
            <Section 
              className="text-base leading-relaxed text-gray-700"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            <Section className="mt-12 border-t border-gray-200 pt-6 text-center">
              <Text className="text-sm text-gray-500 mb-2">
                © {new Date().getFullYear()} Gaspo Studios. All rights reserved.
              </Text>
              <Text className="text-xs text-gray-400">
                You are receiving this email because you subscribed to our newsletter.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
