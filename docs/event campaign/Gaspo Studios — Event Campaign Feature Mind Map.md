# Gaspo Studios Admin Dashboard
## Events → Event Campaign

### 1. EVENT CAMPAIGN
**Purpose:** Manage automated and manual email campaigns associated with specific events.

├── **Event Selection**
│   ├── Select Event
│   │   ├── Upcoming Events
│   │   ├── Ongoing Events
│   │   ├── Completed Events
│   │   └── Search Event
│   │
│   ├── Selected Event Summary
│   │   ├── Event Name
│   │   ├── Event Date
│   │   ├── Event Time
│   │   ├── Venue
│   │   ├── Event Status
│   │   └── Total Registrants
│   │
│   └── Registrant Audience
│       ├── Automatically load registrants
│       ├── Total Registered
│       ├── Eligible Recipients
│       ├── Email Address
│       ├── Full Name
│       ├── Registration Date
│       └── Registration Status

### 2. CAMPAIGN TEMPLATES
**Predefined email templates that administrators can select.**

├── **Registration Confirmation**
│   ├── Trigger: Immediately after registration
│   ├── Recipient: New registrant
│   ├── Event Name
│   ├── Event Date
│   ├── Event Time
│   ├── Venue / Location
│   ├── Registration Details
│   └── Call-to-Action
│
├── **New Registration Notification**
│   ├── Trigger: New registration
│   ├── Recipient: New registrant
│   ├── Personalised greeting
│   ├── Event information
│   ├── Registration confirmation
│   └── Additional instructions
│
├── **Pre-Event Appreciation**
│   ├── Trigger: 3 days before event
│   ├── Recipient: All registered attendees
│   ├── Appreciation message
│   ├── Event reminder
│   ├── Event activities
│   ├── Event schedule
│   ├── Venue / Location
│   ├── What to expect
│   └── Important information
│
└── **Post-Event Thank You**
    ├── Trigger: After event
    ├── Recipient: All registered attendees
    ├── Thank-you message
    ├── Event highlights
    ├── Event photographs
    │   ├── Image 1
    │   └── Image 2
    ├── Additional event information
    ├── Feedback / Survey CTA
    └── Future engagement CTA


### 3. CAMPAIGN CREATION WORKFLOW

**Step 1 — Select Event**
├── Administrator opens:
│   └── Events → Event Campaign
│
└── Selects target event

**Step 2 — Load Audience**
├── System retrieves registrations for selected event
├── System calculates recipient count
└── Administrator sees:
    ├── Total Registrants
    ├── Valid Email Addresses
    ├── Invalid / Missing Emails
    └── Eligible Recipients

**Step 3 — Select Template**
├── Registration Confirmation
├── New Registration
├── Pre-Event Appreciation
└── Post-Event Thank You

**Step 4 — Configure Campaign**
├── Campaign Name
├── Email Subject
├── Sender Name
├── Reply-To Email
├── Email Content
├── Dynamic Event Data
├── Dynamic Registrant Data
├── Images / Media
└── CTA

**Step 5 — Preview**
├── Desktop Preview
├── Mobile Preview
├── Test Email
└── Personalisation Preview

**Step 6 — Audience Review**
├── Selected Event
├── Template
├── Recipient Count
├── Recipient List
└── Excluded Recipients

**Step 7 — Send / Schedule**
├── Send Immediately
├── Schedule Campaign
│   ├── Specific Date
│   └── Specific Time
└── Cancel

**Step 8 — Campaign Execution**
├── Queue Emails
├── Send Emails
├── Track Delivery
├── Track Failures
└── Update Campaign Status


### 4. DYNAMIC EMAIL PERSONALISATION

**Event Variables**
├── {{event_name}}
├── {{event_date}}
├── {{event_time}}
├── {{event_venue}}
├── {{event_description}}
├── {{event_activities}}
├── {{event_image}}
└── {{event_registration_url}}

**Registrant Variables**
├── {{first_name}}
├── {{last_name}}
├── {{full_name}}
├── {{email}}
├── {{registration_date}}
└── {{registration_reference}}

**System Variables**
├── {{company_name}}
├── {{company_logo}}
├── {{support_email}}
├── {{website_url}}
└── {{unsubscribe_url}}


### 5. CAMPAIGN MANAGEMENT

├── **Campaign List**
│   ├── Campaign Name
│   ├── Event
│   ├── Template
│   ├── Audience
│   ├── Status
│   ├── Date Created
│   ├── Scheduled Date
│   └── Actions
│
├── **Campaign Status**
│   ├── Draft
│   ├── Scheduled
│   ├── Queued
│   ├── Sending
│   ├── Sent
│   ├── Partially Sent
│   ├── Failed
│   └── Cancelled
│
└── **Campaign Actions**
    ├── View
    ├── Edit Draft
    ├── Duplicate
    ├── Preview
    ├── Send Test
    ├── Cancel
    └── View Report


### 6. CAMPAIGN REPORTING

├── Total Recipients
├── Emails Sent
├── Delivered
├── Failed
├── Bounced
├── Opened
├── Clicked
└── Engagement Rate

**Campaign Report**
├── Delivery Summary
├── Recipient Breakdown
├── Failed Emails
├── Open Rate
├── Click Rate
└── Campaign Timeline


### 7. EVENT-SPECIFIC CAMPAIGN LOGIC

**Selected Event**
        ↓
**Retrieve Registrations**
        ↓
**Build Event Audience**
        ↓
**Select Email Template**
        ↓
**Merge Event + Registrant Data**
        ↓
**Preview Campaign**
        ↓
**Review Recipient Count**
        ↓
**Send / Schedule**
        ↓
**Email Queue**
        ↓
**Email Provider**
        ↓
**Delivery Tracking**
        ↓
**Campaign Report**

### 8. AUTOMATED CAMPAIGN RULES

**Registration Confirmation**
├── Event selected
├── User registers
├── Registration successfully saved
└── Email automatically sent to that registrant

**Pre-Event Appreciation**
├── Event selected
├── Event date identified
├── 3 days before event
├── Retrieve all registered attendees
└── Send campaign to eligible attendees

**Post-Event Thank You**
├── Event ends
├── Administrator confirms event completion
├── Retrieve all registered attendees
├── Attach approved event photographs
└── Send thank-you campaign


### 9. ADMINISTRATOR EXPERIENCE

**Events Page**
│
├── Overview
├── Events
├── Registrations
└── **Event Campaign**
       │
       ├── Select Event
       │
       ├── Audience
       │
       ├── Templates
       │
       ├── Create Campaign
       │
       ├── Scheduled Campaigns
       │
       ├── Sent Campaigns
       │
       └── Campaign Reports


### 10. IMPORTANT BUSINESS RULES

1. **Every campaign must belong to one specific event.**

2. **The event must be selected before the audience is determined.**

3. **The system must never use all website registrants by default.**

4. **Only users registered for the selected event should be included in the event campaign audience.**

5. **Registration Confirmation is recipient-specific.**
   - It goes only to the newly registered user.

6. **Pre-Event Appreciation is event-specific.**
   - It goes only to registered users of the selected event.

7. **Post-Event Thank You is event-specific.**
   - It goes only to registered users of the completed event.

8. **Administrators must see the recipient count before sending.**

9. **Administrators should be able to preview the email before sending.**

10. **The system should support both manual and automated campaigns.**

11. **A campaign must have a status and delivery history.**

12. **Failed emails should be identifiable and retryable.**

13. **Dynamic event and registrant information should be injected automatically into templates.**

14. **Post-event campaigns should allow administrators to upload/select event photographs before sending.**


### 11. RECOMMENDED UI STRUCTURE

**Event Campaign Tab**

┌─────────────────────────────────────────────────────┐
│ Event Campaign                                      │
│ Manage event-specific email communications          │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Select Event                                        │
│ [ Select an event ▼ ]                               │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Selected Event                                      │
│                                                     │
│ Event: Gaspo Creative Conference 2026               │
│ Date: 24 September 2026                             │
│ Venue: Lagos                                        │
│ Registrants: 248                                    │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Campaign Template                                   │
│                                                     │
│ ○ Registration Confirmation                         │
│ ○ New Registration                                  │
│ ○ Pre-Event Appreciation                            │
│ ○ Post-Event Thank You                              │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Audience                                            │
│                                                     │
│ 248 Registered                                      │
│ 243 Eligible                                        │
│ 5 Missing/Invalid Email                             │
│                                                     │
│ [ View Recipients ]                                 │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Campaign                                            │
│                                                     │
│ Subject: [____________________________]             │
│                                                     │
│ [ Email Template Editor ]                           │
│                                                     │
│ [ Preview ] [ Send Test ] [ Save Draft ]            │
│                                                     │
│ [ Schedule Campaign ] [ Send Campaign ]             │
└─────────────────────────────────────────────────────┘


### 12. CORE ARCHITECTURE

**Events**
        │
        ├────────── Event Details
        │
        ├────────── Registrations
        │                │
        │                └── Event Audience
        │
        └────────── Event Campaign
                         │
                         ├── Templates
                         │
                         ├── Campaign Builder
                         │
                         ├── Scheduler
                         │
                         ├── Email Queue
                         │
                         ├── Email Provider
                         │
                         └── Campaign Analytics


### 13. FUTURE EXTENSIBILITY

The architecture should be designed so additional campaign types can be added later without redesigning the Event Campaign module.

Possible future templates:

├── Event Announcement
├── Registration Opening
├── Registration Closing
├── Event Date Change
├── Venue Change
├── Speaker Announcement
├── Event Reminder — 7 Days
├── Event Reminder — 1 Day
├── Event Starting Soon
├── Certificate Available
├── Event Recording Available
├── Feedback Request
├── Early-Bird Registration
└── Next Event Promotion


## FINAL PRODUCT PRINCIPLE

**EVENT → AUDIENCE → TEMPLATE → CONTENT → PREVIEW → SEND/SCHEDULE → TRACK**

The most important relationship is:

**One Event → Its Registrants → Its Campaigns**

This ensures that Gaspo Studios can manage communications for multiple events independently, without accidentally mixing registrants or sending an event-specific campaign to the wrong audience.