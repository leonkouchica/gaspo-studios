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

interface BookingNotificationEmailProps {
  fullName: string;
  email: string;
  phone: string;
  packageType: string;
  bookingDate: string;
  notes?: string;
}

export function BookingNotificationEmail({
  fullName = "Jane Doe",
  email = "jane@example.com",
  phone = "N/A",
  packageType = "Wedding",
  bookingDate = "2026-10-15",
  notes = "Looking forward to it!",
}: BookingNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-[#f6f9fc] my-auto mx-auto font-sans">
          <Container className="bg-white border border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[600px]">
            <Section className="mt-[32px]">
              <Heading className="text-[#FF3333] text-[24px] font-bold text-center p-0 my-[30px] mx-0">
                New Booking Request!
              </Heading>
              <Text className="text-[#333] text-[14px] leading-[24px]">
                A new client has requested to book a shoot via the website.
              </Text>
              
              <Section className="bg-[#f9f9f9] rounded p-6 my-6 border border-[#eaeaea]">
                <Text className="text-[#333] text-[14px] m-0 mb-2">
                  <strong>Client Name:</strong> {fullName}
                </Text>
                <Text className="text-[#333] text-[14px] m-0 mb-2">
                  <strong>Email:</strong> {email}
                </Text>
                <Text className="text-[#333] text-[14px] m-0 mb-2">
                  <strong>Phone:</strong> {phone}
                </Text>
                <Text className="text-[#333] text-[14px] m-0 mb-2">
                  <strong>Package:</strong> {packageType}
                </Text>
                <Text className="text-[#333] text-[14px] m-0 mb-2">
                  <strong>Requested Date:</strong> {bookingDate}
                </Text>
                
                {notes && (
                  <>
                    <Text className="text-[#333] text-[14px] m-0 mt-4 font-semibold">
                      Additional Notes:
                    </Text>
                    <Text className="text-[#555] text-[14px] m-0 mt-2 whitespace-pre-wrap">
                      {notes}
                    </Text>
                  </>
                )}
              </Section>

              <Hr className="border border-[#eaeaea] my-[26px] mx-0" />
              <Text className="text-[#666666] text-[12px] leading-[24px] text-center">
                Log into the Gaspo Studios Dashboard to manage this booking.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default BookingNotificationEmail;
