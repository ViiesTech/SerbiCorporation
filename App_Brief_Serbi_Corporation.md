# Serbi Corporation — Comprehensive Legal & Operational App Brief
**Technical Architecture, Data Taxonomy & Contractual Rules for Drafting Privacy Policy and Terms & Conditions**

---

### Document Overview & Metadata

| Metadata Field | Official Detail | Notes / Context |
| :--- | :--- | :--- |
| **Operating Corporate Entity** | **Serbi Corporation** | Registered legal entity assuming primary contractual liability |
| **Commercial Brand / DBA** | **Serbi Corporation** | Public-facing brand name displayed across mobile apps & web |
| **Official Public Portal** | [https://serbicorporation.com](https://serbicorporation.com) | Customer booking, web dispatch & terms hosting |
| **Direct Contact Phone** | **872-227-2133** | Designated customer service & dispatch hotline |
| **Support & Legal Inquiries** | **info@serbicorporation.com** | Dedicated inbox for privacy rights, CCPA requests & disputes |
| **Governing Jurisdiction** | State of California, United States | Default venue for arbitration, consumer protection & state law |
| **Supported Platforms** | iOS (App Store), Android (Google Play), Web | Cross-platform React Native client application |
| **Document Release / Version** | Version 2.0 (November 2026) | Comprehensive reference for legal counsel & policy generators |

---

## 1. Executive Summary & Business Ecosystem

**Serbi Corporation** is an on-demand, two-sided service marketplace and mobile dispatch platform that connects residential homeowners, renters, property managers, and commercial clients with licensed, vetted, and independent pest control, extermination, and property maintenance technicians.

### 1.1 Dual User Personas
1. **Customers / Clients:**
   - Homeowners and tenants requesting inspections, pest extermination treatments, and ongoing pest control management.
   - Select pest types (Bed Bugs, Termites, Rodents, Cockroaches, Ants, Spiders, Fleas, etc.) and severity levels (**Low / Medium / High**).
   - Authorize upfront inspection fees, approve on-site treatment quotes, track technician arrival via live GPS, and pay through automated in-app payment processing.
2. **Independent Service Technicians / Vendors:**
   - Independent certified pest control specialists who maintain valid state pest control licenses (`pestControlLicense`), chemical application certifications, insurance, and professional equipment.
   - Accept service dispatches within their localized service radius, submit itemized diagnosis and treatment reports, execute on-site treatments, and receive weekly direct bank deposits via Stripe Connect.

### 1.2 Service Offerings & Scope
- **Bed Bug Eradication** (heat treatments, specialized chemical applications)
- **Termite Inspection & Treatment** (perimeter protection, localized injection)
- **Rodent Control & Exclusion** (rats, mice trapping, entry point sealing)
- **Cockroach & Insect Control** (roaches, waterbugs, pest monitoring)
- **Ants & Spiders Treatment** (indoor barrier sprays, outdoor perimeter defense)
- **Flies, Gnats, Drain Flies & Stinging Insects** (bees, wasps removal, insect traps)
- **Commercial & Residential Facility Pest Maintenance**

### 1.3 Monetization & Fee Architecture
- **Inspection / Service Call Fee:** Baseline fee charged to dispatch an independent technician to the customer's physical premises to inspect and assess pest activity.
- **Treatment Quotes:** On-site estimate consisting of labor + chemical treatment solutions; requires customer explicit authorization prior to beginning work.
- **Platform Fee Distribution:** Serbi Corporation retains a **10%** technology administration fee on completed bookings; **90%** of the gross payout is disbursed directly to the performing technician via Stripe Connect.

---

## 2. Data Collection Taxonomy (For Privacy Policy Formulation)

In compliance with federal and state regulations (including California CCPA / CPRA, CalOPPA, and FTC guidelines), all personal data collected through the application is categorized as follows:

| Category | Specific Data Elements Collected | Source | Legal & Operational Purpose |
| :--- | :--- | :--- | :--- |
| **Customer Account Identity** | Full Legal Name, Email Address, Phone Number, Encrypted Password Hash, Profile Picture | User Entry | Account registration, secure login authentication, push notification routing, appointment SMS alerts |
| **Physical Service Location** | Street Address, Suite/Apt #, Gate/Access Codes, City, State, Postal Zip Code | User Entry | Physical navigation, routing assigned technicians to customer residence or commercial property |
| **Pest & Job Diagnostic Data** | Pest Category, Severity Level (Low/Med/High), Property Type, Uploaded Activity Photos & Videos | User Entry & Camera | Pre-dispatch technical preparation, chemical safety verification, treatment warranty records |
| **Precise Geolocation Data** | Real-time GPS Coordinates (Latitude / Longitude) while application is active | Device GPS Sensor | Matching nearest available technician, calculating travel routes, providing live technician arrival alerts |
| **Financial & Payment Data** | Tokenized Payment Card Identifiers, Expiration Date, Billing Zip Code (No full credit card numbers or CVV stored) | User Entry via Stripe Elements | Processing inspection holds, booking fees, treatment payments, and issuing dispute refunds |
| **Technician / Vendor Credentials** | Government Photo ID, Pest Control License, EPA Certification, SSN / EIN, Payout Bank Account Details | Vendor Onboarding | Background verification, IRS 1099-K tax reporting compliance, direct automated Stripe payouts |
| **Device & Technical Telemetry** | Device Model, Operating System Version, IP Address, Firebase Cloud Messaging (FCM) Push Tokens, Crash Logs | Automated System SDK | Fraud detection, server performance diagnostics, push notification routing, bug troubleshooting |

### ⚠️ Absolute Policy Guarantee: Zero Data Sale
**Serbi Corporation DOES NOT sell, rent, lease, or monetize customer or technician personal data to third-party data brokers, marketers, or advertisers.** All data collected is utilized solely for service fulfillment, platform safety, payment execution, and statutory compliance.

---

## 3. Third-Party Sub-Processors & Infrastructure

The application relies on trusted, industry-standard third-party sub-processors to execute critical platform operations:

| Partner / Sub-Processor | Primary Role | Data Transferred & Security Measures |
| :--- | :--- | :--- |
| **Stripe Inc.** | Payment Gateway, Fraud Prevention & Stripe Connect Payouts | PCI-DSS Level 1 compliant card tokenization, technician bank routing, SSN/tax IDs |
| **Google Maps Platform** | Geocoding, Address Autocomplete & Technician Navigation | Service address strings, device GPS coordinates for distance and travel time calculation |
| **Google Firebase** | User Authentication & Push Notification Infrastructure (FCM) | Device registration tokens, session authentication tokens, real-time sync |
| **Socket.io / WebSockets** | Real-Time In-App Messaging & Appointment State Updates | Encrypted chat payloads and live appointment status transitions between client and technician |
| **Cloud Hosting (Vercel / Node / AWS)** | REST API Hosting, Secure Image / Document Storage | Encrypted storage of pest activity photos, technician license documents, profile pictures |

---

## 4. User Rights, Data Governance & Compliance

### 4.1 California Consumer Privacy Act (CCPA / CPRA) Disclosures
- **Right to Know / Access:** Users may request details on personal information categories collected, sources, and third parties with whom data is shared.
- **Right to Delete:** Users possess the absolute right to demand the permanent deletion of their personal data.
- **Right to Correct:** Users may rectify inaccurate profile, address, or contact details directly in the app.
- **Non-Discrimination:** Exercising privacy rights will never result in denied services, altered pricing, or reduced quality.

### 4.2 Account & Data Deletion Workflow
- Users can initiate account deletion directly within the mobile application: **Settings -> Account -> Delete Account**.
- Alternatively, deletion requests can be submitted via email to **`info@serbicorporation.com`**.
- Upon verified receipt, all personal identity records and telemetry are purged within **30 days**, retaining only non-identifiable financial ledger entries as mandated by federal IRS tax accounting laws.

### 4.3 Children's Privacy (COPPA)
The platform is exclusively designed and operated for adults aged **18 years or older**. Individuals under 18 are prohibited from creating accounts or scheduling service calls. Serbi Corporation does not knowingly solicit or collect information from minors.

### 4.4 Data Retention Schedule
- Active account profiles and service history are preserved during the customer’s active platform membership.
- Invoices, inspection receipts, and technician payout records are archived for **7 years** pursuant to federal and state tax retention mandates.

---

## 5. Terms & Conditions: Core Operational & Contractual Rules

To ensure rock-solid legal protection for Serbi Corporation and clear expectations for consumers and technicians, the Terms & Conditions must include:

### 5.1 Independent Contractor Relationship (No Employment)
- Technicians operating on the platform are **independent third-party contractors** and NOT employees, partners, agents, or joint-venturers of Serbi Corporation.
- Serbi Corporation acts solely as a two-sided technology platform facilitating introductions, scheduling, communication, and billing between customers and independent licensed technicians.

### 5.2 Appointments, Inspection Fee & Quotation Procedure
- Booking an appointment reserves a technician’s dedicated arrival window.
- The customer agrees to pay the **non-refundable inspection visit fee** upon technician arrival, which compensates the technician for travel, on-site time, and specialized pest inspection.
- Any treatment labor or chemical application requires an explicit written or digital estimate provided by the technician on-site and approved by the customer before work commences.

### 5.3 Cancellation & Rescheduling Rules
- **Free Cancellation:** Permitted up to **two (2) hours** prior to the scheduled service appointment window.
- **Late Cancellation / Lockout Fee:** If a customer cancels after a technician has already been dispatched/en route or fails to provide access upon arrival, a cancellation fee equal to the inspection service fee will be assessed.

### 5.4 Payment Processing & Pre-Authorization
- Customers provide a valid credit/debit card upon booking and authorize Serbi Corporation to place a temporary pre-authorization hold.
- Final payment (inspection fee + approved treatment labor + solutions) is captured automatically upon service completion or invoice acceptance.

### 5.5 Workmanship Warranty & Disclaimer of Pre-Existing Defects
- Technicians or the platform provide a standard limited warranty (typically **30 to 90 days**) on pest eradication and re-treatment.
- Serbi Corporation expressly disclaims liability where structural building flaws, sanitation issues, standing water, or unsealed access gaps perpetuate re-infestation.

### 5.6 Limitation of Liability & Property Disclaimers
- To the maximum extent permitted under applicable law, the cumulative liability of Serbi Corporation arising out of any booking is strictly capped at the **total amount paid by the customer for that specific service appointment**.
- Consequential, punitive, incidental, or special property damages are explicitly excluded from recovery.

### 5.7 Customer Premises & Safety Obligations
- Customers must provide safe, clean, and unobstructed access to the property, keep domestic pets secured away from treated areas, and follow technician chemical re-entry interval safety instructions.
- An adult representative (aged 18+) must be physically present throughout the service visit.

### 5.8 Dispute Resolution & Mandatory Binding Arbitration
- All claims or disputes shall be resolved through individual binding arbitration administered by the American Arbitration Association (AAA) in accordance with California law.
- **Class Action Waiver:** Customers and technicians expressly waive any right to participate as a plaintiff or class member in any class, collective, or representative proceeding.

---

## 6. Policy Generator Questionnaire Cheat-Sheet

Ready-to-use responses when completing automated generators (e.g. Termly, Iubenda, TermsFeed) or legal intake forms:

| Legal Generator Question | Exact Entry to Input |
| :--- | :--- |
| **What is the registered corporate name?** | **Serbi Corporation** |
| **What is the public trading name (DBA)?** | **Serbi Corporation** |
| **What is the official website URL?** | **https://serbicorporation.com** |
| **What is the customer support phone number?** | **872-227-2133** |
| **What is the designated privacy / legal email?** | **info@serbicorporation.com** |
| **Do you sell or share personal data for money?** | **NO (Never)** |
| **Do you collect precise geolocation?** | **YES (Foreground while booking / tracking)** |
| **Do you store credit card numbers directly?** | **NO (Handled entirely via Stripe PCI-DSS)** |
| **Do you allow user-generated content?** | **YES (Photos & videos of pest activity, reviews)** |
| **What is the minimum age to use the service?** | **18 Years Old** |
| **What state / governing jurisdiction applies?** | **State of California, United States** |
| **Are disputes subject to arbitration?** | **YES (Binding individual arbitration; class action waiver)** |

---

## 7. Official Issuance & Certification

- **Operating Entity:** Serbi Corporation
- **Commercial Platform:** Serbi Corporation
- **Web Portal:** [https://serbicorporation.com](https://serbicorporation.com)
- **Contact:** 872-227-2133 | info@serbicorporation.com
- **Release Version:** 2.0 (November 2026)
- **Status:** Officially certified for Privacy Policy & Terms/Conditions Generation
