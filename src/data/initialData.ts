import { CompanyProfile, Client, ProposalDocument, IndustryTemplate, Invoice, PaymentReceipt } from "../types";

export const initialCompanyProfile: CompanyProfile = {
  name: "XyronGroup",
  tagline: "Powered by SynerDigi",
  logoUrl: "",
  address: "Villa # 345, Road 05, Precinct 31, Bahria Town, Karachi, Pakistan.",
  email: "info@xyrongroup.com",
  phone: "+92 336 3795290",
  website: "https://xyrongroup.com",
  taxId: "NTN-98234",
  paymentTerms: "Payment Terms: 60% Project commencement | 20% Design approval / core development milestone | 20% | Final delivery, deployment & handover",
  bankDetails: "FARAZ AHMED SHEIKH | Meezan Bank | Block-18 Gulistan-e-Jauhar | Account Number: 99330103968524 | IBAN: PK33MEZN0099330103968524",
  currency: "PKR",
  defaultTaxRate: 0,
  signatoryName: "XyronGroup Authorized Signatory",
  signatoryTitle: "Service Provider Representative",
  signatorySubtitle: "XyronGroup",
};

export const initialClients: Client[] = [
  {
    id: "cli_cineplay",
    name: "Mr. Saliq/Mr.Haseeb",
    company: "Cineplay Lounge",
    email: "info@cineplaylounge.com",
    phone: "+92 336 3795290",
    address: "Midway, Bahria Town, Karachi.",
    taxId: "",
    notes: "Private entertainment and social destination combining private lounge experiences, movie/streaming sessions, gaming, live-match screening, small gatherings and counterless POS.",
    createdAt: "2026-08-12T08:00:00.000Z",
  },
  {
    id: "cli_vista",
    name: "Mr. Osama Hassan",
    company: "Vista Maritime",
    email: "osama.hassan@vistamaritimetravel.com",
    phone: "+971 4 380 9191",
    address: "Office # 09, DMC-L-A Madinat Dubai Almelaheyah\nDubai Maritime City, Dubai, UAE",
    taxId: "",
    notes: "Operational branches in DHA Karachi & DHA Islamabad, direct Dubai DMC hub in Dubai Maritime City. Corporate Travel & Seafarer Logistics specialist.",
    createdAt: "2026-08-24T08:00:00.000Z",
  },
];

export const initialDocuments: ProposalDocument[] = [
  {
    id: "doc_cineplay_001",
    docNumber: "QUOT-2026-001",
    title: "CINEPLAY LOUNGE PROJECT QUOTATION",
    type: "Quotation",
    status: "Sent",
    clientId: "cli_cineplay",
    clientName: "Mr. Saliq/Mr.Haseeb",
    clientCompany: "Cineplay Lounge",
    clientEmail: "info@cineplaylounge.com",
    clientAddress: "Midway, Bahria Town, Karachi.",
    clientTaxId: "",
    issueDate: "2026-08-12",
    expiryDate: "2026-09-11",
    overview: "CinePlay Lounge is being positioned as a private entertainment and social destination combining private lounge experiences, movie/streaming sessions, gaming, live-match screening, small gatherings and a complementary social/work environment. The proposed digital launch combines brand development, website and booking, social media creative, launch strategy, SEO and a dedicated counterless POS and lounge-management solution.",
    requirements: "• Unified specification, deliverables roadmap, commercial quotation, and acceptance terms.\n• Build brand identity, digital presence, and booking engine for private lounge experience.\n• Deliver custom counterless POS and lounge-management operational software.",
    proposedSolution: "A unified turnkey digital launch and operational ecosystem combining brand creative direction, a responsive CMS booking website, multi-channel social media marketing, local search visibility, and a custom counterless POS lounge management platform.",
    scopeOfWork: "Brand Identity & Visual Direction\nWebsite & Digital Presence\nBooking & Session Management\nCounterless POS & Lounge Management",
    deliverables: [
      "Brand Identity & Creative Direction",
      "Website & Digital Presence",
      "Online Booking & Session Management",
      "Counterless POS & Order Management",
      "Kitchen Order Integration",
      "Billing & Payment Management",
      "Social Media & Content Strategy",
      "Pre-Launch & Launch Campaign",
      "SEO & Google Business Profile",
      "Local Search & Digital Visibility"
    ],
    responsibilities: {
      provider: "End-to-end execution of brand identity, web design, booking engine, counterless POS software, and launch marketing as outlined.\nRigorous QA testing, deployment, and admin handover.\nScheduled progress updates and milestone deliverables.",
      client: "Timely provision of lounge photos, venue specifications, and menu/pricing details.\nReview and milestone feedback within 3 business days.\nAdherence to milestone disbursement schedule upon completion."
    },
    milestones: [
      {
        id: "m_cp_1",
        name: "Phase 1: Brand Direction & Architecture",
        timeline: "Week 1–2",
        description: "Logo system, brand guidelines, typography, color palette, POS technical specs, and interactive wireframes."
      },
      {
        id: "m_cp_2",
        name: "Phase 2: Booking Website & POS Phase 1 Build",
        timeline: "Week 3–6",
        description: "Responsive CMS website with booking system, basic SEO, WhatsApp integration, and custom counterless POS and lounge management system."
      },
      {
        id: "m_cp_3",
        name: "Phase 3: QA Testing, Launch Campaign & Handover",
        timeline: "Week 7–8",
        description: "Comprehensive testing of final product, hosting & business email setup, local SEO & GBP setup, social media launch rollout, and project backup handover."
      }
    ],
    pricingModel: "one-time",
    lineItems: [
      {
        id: "li_cp_1",
        description: "Logo System, Brand Guidelines, Typography, Color Palette & Brand Assets",
        quantity: 1,
        unitPrice: 58000,
        discount: 0,
        taxRate: 0
      },
      {
        id: "li_cp_2",
        description: "Research & Positioning",
        quantity: 1,
        unitPrice: 35000,
        discount: 0,
        taxRate: 0
      },
      {
        id: "li_cp_3",
        description: "Premium Responsive Website with CMS, Booking System, Basic SEO, Google Analytics & WhatsApp Integration",
        quantity: 1,
        unitPrice: 140000,
        discount: 0,
        taxRate: 0
      },
      {
        id: "li_cp_4",
        description: "20 Feed Posts, 8 Carousel Designs, 12 Reel Covers, Stories & Templates 1",
        quantity: 1,
        unitPrice: 66000,
        discount: 0,
        taxRate: 0
      },
      {
        id: "li_cp_5",
        description: "Testing of Final Product / Website / Design",
        quantity: 1,
        unitPrice: 10000,
        discount: 0,
        taxRate: 0
      },
      {
        id: "li_cp_6",
        description: "Hosting Setup, Business Email, SSL Certificate & Website Deployment",
        quantity: 1,
        unitPrice: 12500,
        discount: 0,
        taxRate: 0
      },
      {
        id: "li_cp_7",
        description: "Content Pillars, Campaign Planning, Creative Direction & Launch Strategy",
        quantity: 1,
        unitPrice: 59000,
        discount: 0,
        taxRate: 0
      },
      {
        id: "li_cp_8",
        description: "Local SEO, Google Business Profile & Search Console Setup",
        quantity: 1,
        unitPrice: 29000,
        discount: 0,
        taxRate: 0
      },
      {
        id: "li_cp_9",
        description: "Custom Counterless POS & Lounge Management Software — Phase 1",
        quantity: 1,
        unitPrice: 325000,
        discount: 0,
        taxRate: 0
      },
      {
        id: "li_cp_10",
        description: "Project Backup — USB / Cloud / HDD",
        quantity: 1,
        unitPrice: 500,
        discount: 0,
        taxRate: 0
      }
    ],
    subtotal: 735000,
    taxTotal: 0,
    discountTotal: 0,
    grandTotal: 735000,
    paymentSchedule: [
      {
        id: "ps_cp_1",
        description: "60% Project commencement",
        percentage: 60,
        amount: 441000,
        dueCondition: "Upon agreement signing & kickoff"
      },
      {
        id: "ps_cp_2",
        description: "20% Design approval / core development milestone",
        percentage: 20,
        amount: 147000,
        dueCondition: "Upon design & core development sign-off"
      },
      {
        id: "ps_cp_3",
        description: "20% Final delivery, deployment & handover",
        percentage: 20,
        amount: 147000,
        dueCondition: "Final delivery, deployment & handover"
      }
    ],
    termsAndConditions: "60% Project commencement | 20% Design approval / core development milestone | 20% | Final delivery, deployment & handover",
    companySnapshot: initialCompanyProfile,
    createdAt: "2026-08-12T08:00:00.000Z",
    updatedAt: "2026-08-12T08:00:00.000Z"
  },
  {
    id: "doc_vista_001",
    docNumber: "PROP-2026-486",
    title: "SEO Services, Social Media Management & Creative Content Marketing",
    type: "Proposal",
    status: "Draft",
    clientId: "cli_vista",
    clientName: "Mr. Osama Hassan",
    clientCompany: "Vista Maritime",
    clientEmail: "osama.hassan@vistamaritimetravel.com",
    clientAddress: "Office # 09, DMC-L-A Madinat Dubai Almelaheyah\nDubai Maritime City, Dubai, UAE",
    clientTaxId: "",
    issueDate: "2026-08-24",
    expiryDate: "2026-09-23",
    overview: "Following up on consultations with Mr. Osama Hassan regarding scaling Vista Maritime across Pakistan and the UAE diaspora, this proposal establishes a unified 3-service digital growth ecosystem.\n\nVista Maritime possesses extraordinary institutional advantages: physical operational branches in prime commercial corridors (DHA Karachi & DHA Islamabad), a direct Dubai DMC hub in Dubai Maritime City, and specialized domain expertise in Corporate Travel and Seafarer Logistics.\n\nOur unified service offering directly capitalizes on these strengths through three interconnected pillars:\n\n• SEO SERVICES: Implementing a structured technical and on-page SEO program to capture high-intent commercial keywords, optimize local Google Business Profiles across Karachi and Islamabad, and establish long-term search dominance.\n\n• SOCIAL MEDIA MANAGEMENT: Building a prestigious, consistent social presence across Instagram, Facebook, and LinkedIn with monthly content calendars, static/carousel creative design, copywriting, and active community engagement.\n\n• CREATIVE CONTENT MARKETING: Producing high-impact visual storytelling, short-form video concepts (Reels/TikTok) with viral hooks, educational authority carousels, and promotional campaign assets that convert viewers into booked clients.",
    requirements: "• Scale organic visibility across Pakistan & UAE maritime corridors\n• Establish prestigious, multi-channel social media brand presence\n• Drive qualified corporate travel & seafarer booking conversions",
    proposedSolution: "Integrated 3-pillar digital growth engine combining technical & local SEO, high-authority social media management, and performance creative content. Designed to capture high-intent search traffic across DHA Karachi, Islamabad, and Dubai DMC while converting regional audiences through premium visual storytelling.",
    scopeOfWork: "• SEO Engine: Technical audit, on-page optimization, high-intent maritime keyword targeting & GBP setups (DHA Karachi, Islamabad, Dubai DMC)\n• Social Media Infrastructure: Brand identity consistency, platform setup (LinkedIn, IG, FB), monthly content calendar & community management\n• Creative Content Production: High-impact static/carousel graphics, promotional assets, short-form video scripts & Reel/TikTok edits\n• Campaign Strategy & Optimization: Performance analytics reporting, conversion path refinement, seafarer & corporate travel lead funnels",
    deliverables: [
      "Monthly Social Media Content Calendar (12–16 Posts/Carousels)",
      "4x Short-Form Vertical Videos (Reels/TikTok/Shorts) with Custom Editing & Hooks",
      "Fully Optimized Google Business Profiles (Karachi, Islamabad & Dubai DMC)",
      "Technical & On-Page SEO Audit & Optimization Execution Report",
      "Brand Kit & Visual Template Suite for LinkedIn, Instagram & Facebook",
      "Monthly Analytics, Traffic & Conversion Performance Report"
    ],
    responsibilities: {
      provider: "End-to-end execution of SEO, Social Media Management, and Creative Content workflows.\nBi-weekly performance review calls, campaign reporting, and strategy alignment.\nContinuous monitoring, local profile optimization, and community engagement management.",
      client: "Timely provision of high-resolution brand assets, office media, and domain access.\nReview and sign-off on monthly content calendars within 3 business days.\nPoint-of-contact availability for lead routing, seafarer campaign details, and prompt milestone payments."
    },
    milestones: [
      {
        id: "m_vista_1",
        name: "Phase 1: Onboarding, Technical SEO & Brand Kit",
        timeline: "Month 1",
        description: "Access setup, technical SEO audit, local GBP verification (Karachi, Islamabad, Dubai DMC), visual brand kit creation, and initial content calendar approval."
      },
      {
        id: "m_vista_2",
        name: "Phase 2: Content Engine & Local SEO Scale",
        timeline: "Months 2–4",
        description: "Execution of technical SEO fixes, keyword optimization, publishing first batch of social carousels/statics, short-form video production, and active community management setup."
      },
      {
        id: "m_vista_3",
        name: "Phase 3: Conversion Optimization & Lead Funnels",
        timeline: "Months 5–6",
        description: "Scaling short-form video output, mid-campaign SEO keyword performance review, lead funnel routing optimization, and monthly ROI reporting."
      }
    ],
    pricingModel: "setup-and-retainer",
    setupFee: 325000,
    monthlyRetainerFee: 210000,
    engagementMonths: 6,
    paymentFrequency: "Monthly in Advance",
    taxEnabled: false,
    taxRate: 0,
    discountType: "percentage",
    discountValue: 0,
    firstMonthTotal: 325000,
    recurringMonthlyAmount: 210000,
    retainerServices: [
      {
        id: "rs_1",
        serviceName: "SEO Strategy & Optimization",
        initialSetup: "Included",
        monthlyRetainer: "Included",
        notes: "Technical site audit, on-page optimization, maritime travel keywords & ongoing search dominance",
      },
      {
        id: "rs_2",
        serviceName: "Local SEO & GBP Management",
        initialSetup: "Included",
        monthlyRetainer: "Included",
        notes: "Google Business Profiles (DHA Karachi, Islamabad, Dubai DMC), local citations & map rankings",
      },
      {
        id: "rs_3",
        serviceName: "Social Media Management",
        initialSetup: "Included",
        monthlyRetainer: "Included",
        notes: "Monthly content calendar, static & carousel design, copywriting & multi-channel community management",
      },
      {
        id: "rs_4",
        serviceName: "Content Creation",
        initialSetup: "Included",
        monthlyRetainer: "Included",
        notes: "High-authority articles, copywriting, infographics & brand asset production",
      },
      {
        id: "rs_5",
        serviceName: "Short-Form Video Content",
        initialSetup: "Included",
        monthlyRetainer: "Included",
        notes: "Short-form vertical video production (Reels/TikTok/Shorts) with custom editing and high-retention hooks",
      },
      {
        id: "rs_6",
        serviceName: "Reporting & Optimization",
        initialSetup: "Included",
        monthlyRetainer: "Included",
        notes: "Bi-weekly syncs, monthly ROI analytics, KPI tracking & conversion optimization",
      },
    ],
    lineItems: [
      {
        id: "li_v1",
        description: "Initial Setup & First Month Digital Launch",
        quantity: 1,
        unitPrice: 325000,
        discount: 0,
        taxRate: 0
      },
      {
        id: "li_v2",
        description: "Monthly Digital Marketing & SEO Retainer (Months 2–6)",
        quantity: 5,
        unitPrice: 210000,
        discount: 0,
        taxRate: 0
      }
    ],
    subtotal: 1375000,
    taxTotal: 0,
    discountTotal: 0,
    grandTotal: 1375000,
    paymentSchedule: [
      {
        id: "ps_1",
        description: "Initial Setup & Month 1 Launch Investment",
        percentage: 23.6,
        amount: 325000,
        dueCondition: "Upon Agreement Signing"
      },
      {
        id: "ps_2",
        description: "Recurring Monthly Retainer (Months 2–6: 5 × PKR 210,000)",
        percentage: 76.4,
        amount: 1050000,
        dueCondition: "1st of each month in advance"
      }
    ],
    termsAndConditions: "Payment Terms: The initial setup and first-month investment of PKR 325,000 is payable upon agreement signing. The recurring monthly retainer of PKR 210,000 is payable in advance at the beginning of each subsequent month.\n\nMinimum Engagement: A minimum 6-month engagement is recommended to allow sufficient time for SEO growth, content consistency, audience development, and measurable performance improvements.",
    companySnapshot: initialCompanyProfile,
    createdAt: "2026-08-24T08:00:00.000Z",
    updatedAt: "2026-08-24T08:00:00.000Z"
  }
];

export const industryTemplates: IndustryTemplate[] = [
  {
    id: "tpl_webdev",
    title: "Custom Web Application & Portal",
    category: "Software & Web Development",
    iconName: "Code",
    defaultOverview: "We propose to design, develop, and deploy a responsive high-performance custom web application engineered with modern frontend frameworks, scalable API services, and robust cloud infrastructure.",
    defaultScope: "• Discovery & System Architecture: Technical specs and UI/UX design wireframes.\n• Custom Frontend Development: Responsive, accessible, high-contrast user interfaces.\n• Backend API & Database: Secure authentication, serverless database endpoints, and third-party integrations.\n• Deployment & Training: Production release, SSL configuration, and administrator training session.",
    defaultDeliverables: [
      "Figma UX/UI Design System & Component Library",
      "Fully Functional Web Application (Desktop & Mobile)",
      "RESTful API & Database Architecture",
      "User Manual & 30-Day Post-Launch Support"
    ],
    defaultMilestones: [
      { name: "Phase 1: Architecture & UX Wireframes", timeline: "2 Weeks", description: "Stakeholder alignment, visual prototypes, tech stack finalization." },
      { name: "Phase 2: Core Engineering & Integrations", timeline: "4 Weeks", description: "Frontend interfaces, database schemas, and API development." },
      { name: "Phase 3: Testing & Deployment", timeline: "2 Weeks", description: "QA testing, performance optimization, and live launch." }
    ],
    defaultLineItems: [
      { description: "UX/UI Design & Interactive Figma Wireframes", quantity: 1, unitPrice: 2800, taxRate: 10 },
      { description: "Full-Stack Web Application Engineering", quantity: 1, unitPrice: 7500, taxRate: 10 },
      { description: "Database & API Integration Services", quantity: 1, unitPrice: 2200, taxRate: 10 },
      { description: "Quality Assurance & Production Deployment", quantity: 1, unitPrice: 1500, taxRate: 10 }
    ]
  },
  {
    id: "tpl_marketing",
    title: "360 Digital Marketing & SEO Campaign",
    category: "Marketing & Growth",
    iconName: "TrendingUp",
    defaultOverview: "Comprehensive digital growth proposal focused on increasing organic search rankings, executing high-ROI paid ad campaigns, and boosting conversion rates across primary sales channels.",
    defaultScope: "• SEO Audit & Keyword Strategy: Technical site optimization and high-intent keyword mapping.\n• Content Strategy & Creation: 12 monthly optimized articles & graphics.\n• Paid Media Management: Google Ads & Social PPC campaign setup and ongoing A/B testing.\n• Analytics & Reporting: Real-time custom Looker dashboard.",
    defaultDeliverables: [
      "Comprehensive Technical SEO Audit & Keyword Blueprint",
      "12 High-Converting Articles & Graphic Assets / Month",
      "PPC Ad Campaigns (Google & Meta)",
      "Monthly Executive Performance Dashboard & Call"
    ],
    defaultMilestones: [
      { name: "Month 1: Audit, Setup & Strategy", timeline: "Month 1", description: "Technical fix, campaign setup, conversion tracking." },
      { name: "Months 2-3: Execution & Optimization", timeline: "Months 2-3", description: "Content rollout, ad budget scaling, keyword rank tracking." }
    ],
    defaultLineItems: [
      { description: "Initial Technical SEO & PPC Strategy Audit", quantity: 1, unitPrice: 1500, taxRate: 10 },
      { description: "Monthly Managed SEO & Content Creation (3-Mo Retainer)", quantity: 3, unitPrice: 2200, taxRate: 10 },
      { description: "PPC Ad Management & Conversion Optimization", quantity: 3, unitPrice: 1800, taxRate: 10 }
    ]
  },
  {
    id: "tpl_branding",
    title: "Brand Identity & Design System",
    category: "Design & Creative",
    iconName: "Palette",
    defaultOverview: "Complete brand visual identity overhaul designed to position your business as an authoritative leader in your sector. Includes logo suite, typography rules, color palettes, and brand guidelines booklet.",
    defaultScope: "• Brand Discovery & Moodboards: Researching competitor positioning and visual metaphors.\n• Logo Design: 3 primary logo concepts with secondary emblems and favicon variations.\n• Brand Guidelines Book: Typography pairing, color hierarchy, and photography style guide.\n• Collateral Assets: Business cards, social media headers, and letterhead templates.",
    defaultDeliverables: [
      "Master Logo Suite (SVG, PNG, EPS, AI)",
      "30+ Page Digital Brand Guidelines Book",
      "Business Card & Stationary Print Files",
      "Social Media Kit (Templates for IG, LinkedIn, Twitter)"
    ],
    defaultMilestones: [
      { name: "Phase 1: Concept Exploration", timeline: "10 Days", description: "Moodboards, logo sketches, initial review." },
      { name: "Phase 2: Refinement & Brand Book", timeline: "10 Days", description: "Color palette, typography rules, print collateral creation." }
    ],
    defaultLineItems: [
      { description: "Visual Identity Research & Logo Design Suite", quantity: 1, unitPrice: 3200, taxRate: 10 },
      { description: "Comprehensive Brand Guidelines Booklet (PDF)", quantity: 1, unitPrice: 1800, taxRate: 10 },
      { description: "Social Media & Print Collateral Templates", quantity: 1, unitPrice: 1200, taxRate: 10 }
    ]
  },
  {
    id: "tpl_consulting",
    title: "IT Infrastructure & Security Retainer",
    category: "IT & Managed Services",
    iconName: "ShieldCheck",
    defaultOverview: "Proactive IT infrastructure management, cloud cost optimization, continuous cybersecurity monitoring, and 24/7 technical helpdesk support for your enterprise.",
    defaultScope: "• Cloud Infrastructure Audit: AWS / GCP resource optimization and IAM security tightening.\n• Disaster Recovery & Backups: Automated daily encrypted cloud backups with 15-minute RPO.\n• Endpoint Protection & Patch Management: Zero-trust network setup and antivirus monitoring.",
    defaultDeliverables: [
      "Cloud Infrastructure Architecture Blueprint",
      "24/7 Endpoint Security Monitoring Agent",
      "Automated Daily Disaster Recovery Backups",
      "Monthly SLA Compliance & Usage Reports"
    ],
    defaultMilestones: [
      { name: "Month 1: Migration & Hardening", timeline: "Month 1", description: "Security patches, cloud resource cleanup, backup testing." },
      { name: "Ongoing: Managed SLA & Security", timeline: "Monthly", description: "Monitoring, user access control, support ticket resolution." }
    ],
    defaultLineItems: [
      { description: "Infrastructure Audit & Security Hardening", quantity: 1, unitPrice: 2500, taxRate: 10 },
      { description: "Managed IT & Security Support Retainer (Quarterly)", quantity: 3, unitPrice: 1950, taxRate: 10 }
    ]
  }
];

export const initialIndustryTemplates = industryTemplates;

export const initialInvoices: Invoice[] = [];

export const initialPaymentReceipts: PaymentReceipt[] = [];


