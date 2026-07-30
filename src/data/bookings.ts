// src/data/bookings.ts
// Static seed data for the Book a Shoot management module.
// Pre-typed to match planned Supabase `bookings` table schema.

export type BookingStatus = "new" | "reviewed" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  package: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
  status: BookingStatus;
  submittedAt: string;
  adminNotes?: string;
  totalValue: number; // in NGN
}

export const bookings: Booking[] = [
  {
    id: "bk-001",
    name: "Adaeze Okonkwo",
    email: "adaeze@gmail.com",
    phone: "+234 803 456 7890",
    service: "Wedding Photography",
    package: "Full Day Coverage",
    preferredDate: "2026-08-15",
    preferredTime: "09:00",
    message:
      "We're planning an outdoor ceremony at Lekki Conservation Centre. Would love natural light shots.",
    status: "confirmed",
    submittedAt: "2026-05-20T14:23:00Z",
    adminNotes: "Confirmed via phone call. Deposit paid ₦1,080,000.",
    totalValue: 3_600_000,
  },
  {
    id: "bk-002",
    name: "Chidi Eze",
    email: "chidi.eze@acme.ng",
    phone: "+234 807 123 4567",
    service: "Corporate Event",
    package: "Half Day Coverage",
    preferredDate: "2026-06-10",
    preferredTime: "10:30",
    message: "Annual shareholders meeting. Formal attire. Approx 80 attendees.",
    status: "new",
    submittedAt: "2026-05-29T09:12:00Z",
    totalValue: 1_800_000,
  },
  {
    id: "bk-003",
    name: "Funmi Adeyemi",
    email: "funmi@stylehouse.com",
    phone: "+234 815 987 6543",
    service: "Commercial Shoot",
    package: "Full Day Shoot",
    preferredDate: "2026-07-01",
    preferredTime: "08:00",
    message: "Product launch campaign for our new skincare line. Need 5 models, 3 different looks.",
    status: "reviewed",
    submittedAt: "2026-05-27T16:45:00Z",
    adminNotes: "Following up with creative brief. Awaiting mood board from client.",
    totalValue: 2_700_000,
  },
  {
    id: "bk-004",
    name: "Tunde Bakare",
    email: "tunde@tundephotos.net",
    phone: "+234 802 234 5678",
    service: "Portrait Session",
    package: "90-Minute Session",
    preferredDate: "2026-06-05",
    preferredTime: "15:00",
    message: "Professional headshots for my LinkedIn and company website.",
    status: "completed",
    submittedAt: "2026-05-15T11:30:00Z",
    adminNotes: "Shoot completed. Gallery delivered via link on May 22nd. Client very happy.",
    totalValue: 675_000,
  },
  {
    id: "bk-005",
    name: "Nkechi Obi",
    email: "nkechi.obi@outlook.com",
    phone: "+234 809 876 5432",
    service: "Wedding Photography",
    package: "Full Day Coverage",
    preferredDate: "2026-09-20",
    preferredTime: "09:00",
    message: "Traditional and white wedding same day. Venue TBC.",
    status: "new",
    submittedAt: "2026-05-30T08:55:00Z",
    totalValue: 3_600_000,
  },
  {
    id: "bk-006",
    name: "Emeka Nwosu",
    email: "emeka@techstartup.io",
    phone: "+234 818 345 6789",
    service: "Corporate Event",
    package: "Half Day Coverage",
    preferredDate: "2026-06-18",
    preferredTime: "13:00",
    message: "Product demo day. Mostly candid shots of our team and invited investors.",
    status: "cancelled",
    submittedAt: "2026-05-10T10:00:00Z",
    adminNotes: "Client cancelled — event postponed to Q4.",
    totalValue: 1_800_000,
  },
];

// Helpers
export function getBookingById(id: string): Booking | undefined {
  return bookings.find((b) => b.id === id);
}

export function getBookingsByStatus(status: BookingStatus): Booking[] {
  return bookings.filter((b) => b.status === status);
}
