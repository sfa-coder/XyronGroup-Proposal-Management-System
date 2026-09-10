export interface AgencyServiceTemplate {
  id: string;
  serviceNumber: string; // e.g. "SERVICE 01"
  name: string; // e.g. "CUSTOM WEBSITE DESIGNING & DEVELOPMENT"
  category: "Design & Development" | "Marketing & Growth" | "IT & Cloud" | "Software & SaaS";
  iconName: string;
  tagline: string;
  executiveSummary: string;
  clientRequirements: string[];
  proposedSolutionScope: string[];
  tangibleDeliverables: string[];
  providerResponsibilities: string[];
  clientResponsibilities: string[];
  defaultMilestones: {
    name: string;
    timeline: string;
    description: string;
  }[];
  defaultLineItems: {
    description: string;
    quantity: number;
    unitPrice: number; // In PKR or base currency
    discount: number;
    taxRate: number;
  }[];
  defaultPaymentSchedule: {
    description: string;
    percentage: number;
    dueCondition: string;
  }[];
}

export const AGENCY_SERVICES: AgencyServiceTemplate[] = [
  {
    id: "srv_web_design",
    serviceNumber: "SERVICE 01",
    name: "CUSTOM WEBSITE DESIGNING & DEVELOPMENT",
    category: "Design & Development",
    iconName: "Globe",
    tagline: "Strategically designed, responsive and conversion-focused web architecture.",
    executiveSummary:
      "Develop a strategically designed, responsive and conversion-focused website aligned with the client's brand, business objectives and target audience. The solution covers UX/UI design, development, responsive implementation, essential integrations, testing and launch.",
    clientRequirements: [
      "Establish a professional digital presence.",
      "Create a responsive website for desktop, tablet and mobile.",
      "Improve user experience and conversion opportunities.",
      "Present services/products clearly and professionally.",
      "Integrate required forms, analytics, CMS and third-party tools.",
    ],
    proposedSolutionScope: [
      "Website strategy, information architecture and sitemap.",
      "UX/UI design and responsive interface design.",
      "Front-end and back-end development.",
      "CMS implementation where required.",
      "Contact forms, analytics and required integrations.",
      "Responsive, browser and functional testing.",
      "SEO-ready technical structure.",
      "Deployment and launch support.",
    ],
    tangibleDeliverables: [
      "Website sitemap",
      "UX/UI design",
      "Responsive website",
      "CMS/admin panel where applicable",
      "Contact/lead forms",
      "Required third-party integrations",
      "Analytics setup",
      "Testing and QA",
      "Production deployment",
    ],
    providerResponsibilities: [
      "Manage design and development execution.",
      "Provide agreed website components and integrations.",
      "Conduct testing and quality assurance.",
      "Coordinate revisions within the agreed scope.",
      "Deploy the final website upon approval.",
    ],
    clientResponsibilities: [
      "Provide brand assets, content and required information.",
      "Provide timely approvals and feedback.",
      "Provide access to required third-party platforms.",
      "Review and approve designs/content within agreed timelines.",
    ],
    defaultMilestones: [
      {
        name: "Phase 1: Discovery & Sitemap Architecture",
        timeline: "Week 1",
        description: "Requirements gathering, user journeys, information architecture, and sitemap sign-off.",
      },
      {
        name: "Phase 2: UX/UI Interactive Wireframes & Visual Design",
        timeline: "Week 2 - 3",
        description: "High-fidelity Figma UI design, responsive desktop/mobile layouts, and interactive prototype review.",
      },
      {
        name: "Phase 3: Frontend & Backend CMS Development",
        timeline: "Week 4 - 6",
        description: "Full-stack development, CMS integration, forms, custom animations, and API integrations.",
      },
      {
        name: "Phase 4: QA Testing, Cross-Browser Audit & Go-Live",
        timeline: "Week 7",
        description: "Comprehensive functional testing, speed optimization, technical SEO setup, and production deployment.",
      },
    ],
    defaultLineItems: [
      {
        description: "Custom Website UX/UI Design & Responsive Design System",
        quantity: 1,
        unitPrice: 120000,
        discount: 0,
        taxRate: 10,
      },
      {
        description: "Full-Stack Web Development, CMS Setup & Custom Dynamic Features",
        quantity: 1,
        unitPrice: 180000,
        discount: 5,
        taxRate: 10,
      },
      {
        description: "Third-Party Tools Integration, Lead Capture Forms & Analytics Setup",
        quantity: 1,
        unitPrice: 45000,
        discount: 0,
        taxRate: 10,
      },
      {
        description: "Technical SEO Audit, Speed Optimization & Production Launch Support",
        quantity: 1,
        unitPrice: 35000,
        discount: 0,
        taxRate: 10,
      },
    ],
    defaultPaymentSchedule: [
      {
        description: "Initial Project Deposit upon Agreement Signing",
        percentage: 50,
        dueCondition: "Upon Agreement Signing",
      },
      {
        description: "Midpoint Milestone upon UX/UI Design Approval",
        percentage: 30,
        dueCondition: "Upon Phase 2 Sign-off",
      },
      {
        description: "Final Balance upon Live Production Launch & Handover",
        percentage: 20,
        dueCondition: "Upon Project Delivery",
      },
    ],
  },
  {
    id: "srv_360_marketing",
    serviceNumber: "SERVICE 02",
    name: "360 DIGITAL MARKETING",
    category: "Marketing & Growth",
    iconName: "TrendingUp",
    tagline: "Integrated digital marketing combining strategy, paid campaigns, SEO, and conversions.",
    executiveSummary:
      "Deliver an integrated digital marketing program combining strategy, content, social media, paid campaigns, SEO coordination, analytics and conversion optimization. The objective is to build consistent visibility while generating measurable awareness, engagement and qualified business opportunities.",
    clientRequirements: [
      "Establish a unified digital marketing strategy.",
      "Increase online visibility and brand awareness.",
      "Generate qualified traffic, leads or conversions.",
      "Improve audience engagement.",
      "Build measurable marketing performance.",
    ],
    proposedSolutionScope: [
      "Digital marketing strategy and campaign planning.",
      "Audience and competitor research.",
      "Content and campaign calendar.",
      "Social media and content coordination.",
      "Paid advertising campaign management.",
      "SEO coordination and optimization.",
      "Landing page/conversion recommendations.",
      "Analytics, reporting and performance optimization.",
    ],
    tangibleDeliverables: [
      "Digital marketing strategy",
      "Monthly campaign plan",
      "Content calendar",
      "Campaign creatives",
      "Paid media campaigns",
      "Audience targeting setup",
      "Performance reports",
      "Optimization recommendations",
    ],
    providerResponsibilities: [
      "Develop and execute agreed marketing activities.",
      "Monitor campaign performance.",
      "Optimize campaigns based on available data.",
      "Provide periodic performance reporting.",
      "Maintain strategic consistency across digital channels.",
    ],
    clientResponsibilities: [
      "Provide business information and campaign objectives.",
      "Approve content and campaigns promptly.",
      "Provide required platform access.",
      "Provide advertising budget separately where applicable.",
    ],
    defaultMilestones: [
      {
        name: "Month 1: Strategy, Audience Research & Campaign Setup",
        timeline: "Month 1",
        description: "Competitor audit, value proposition definition, creative ad templates, tracking pixel setup, and baseline launch.",
      },
      {
        name: "Month 2: Multi-Channel Execution & A/B Testing",
        timeline: "Month 2",
        description: "Paid social campaigns, Google Ads scaling, weekly content publishing, and conversion funnel optimization.",
      },
      {
        name: "Month 3: Scaling, Retargeting & Executive Growth Review",
        timeline: "Month 3",
        description: "High-performing ad scaling, custom audience retargeting, and quarterly ROI growth review.",
      },
    ],
    defaultLineItems: [
      {
        description: "360 Digital Marketing Strategy, Market Research & Setup",
        quantity: 1,
        unitPrice: 75000,
        discount: 0,
        taxRate: 10,
      },
      {
        description: "Omni-Channel Paid Media Campaign Management (Meta & Google Ads)",
        quantity: 3,
        unitPrice: 65000,
        discount: 0,
        taxRate: 10,
      },
      {
        description: "Social Media Creative Production & Campaign Copywriting",
        quantity: 3,
        unitPrice: 45000,
        discount: 5,
        taxRate: 10,
      },
      {
        description: "Real-Time Conversion Tracking, Analytics Dashboard & Reporting",
        quantity: 3,
        unitPrice: 20000,
        discount: 0,
        taxRate: 10,
      },
    ],
    defaultPaymentSchedule: [
      {
        description: "Month 1 Retainer & Strategy Setup Fee",
        percentage: 40,
        dueCondition: "Upon Agreement Signing",
      },
      {
        description: "Month 2 Retainer Disbursement",
        percentage: 30,
        dueCondition: "Start of Month 2",
      },
      {
        description: "Month 3 Retainer Disbursement",
        percentage: 30,
        dueCondition: "Start of Month 3",
      },
    ],
  },
  {
    id: "srv_seo",
    serviceNumber: "SERVICE 03",
    name: "SEO SERVICES",
    category: "Marketing & Growth",
    iconName: "Search",
    tagline: "Structured search engine optimization for top organic rankings and qualified traffic.",
    executiveSummary:
      "Implement a structured SEO program designed to improve organic visibility, search relevance and qualified website traffic. The service combines technical SEO, on-page optimization, keyword strategy, content recommendations, local SEO and ongoing performance monitoring.",
    clientRequirements: [
      "Improve organic search visibility.",
      "Target relevant commercial keywords.",
      "Increase qualified organic traffic.",
      "Improve technical website health.",
      "Strengthen local/search presence.",
    ],
    proposedSolutionScope: [
      "SEO audit and baseline assessment.",
      "Keyword research and mapping.",
      "On-page SEO optimization.",
      "Technical SEO recommendations.",
      "Metadata and heading optimization.",
      "Internal linking strategy.",
      "Content optimization recommendations.",
      "Local SEO where applicable.",
      "Search performance monitoring and reporting.",
    ],
    tangibleDeliverables: [
      "SEO audit",
      "Keyword research",
      "Keyword mapping",
      "On-page optimization",
      "Technical SEO recommendations",
      "Metadata optimization",
      "SEO content recommendations",
      "Local SEO setup where applicable",
      "Monthly SEO report",
    ],
    providerResponsibilities: [
      "Execute agreed SEO activities.",
      "Monitor search performance.",
      "Identify optimization opportunities.",
      "Provide periodic SEO reporting.",
      "Maintain an ongoing optimization roadmap.",
    ],
    clientResponsibilities: [
      "Provide website/CMS access where required.",
      "Provide business information and target markets.",
      "Approve recommended content and changes.",
      "Maintain website availability and hosting.",
    ],
    defaultMilestones: [
      {
        name: "Month 1: Deep Technical Audit & High-Intent Keyword Mapping",
        timeline: "Month 1",
        description: "Crawl error remediation, schema markup implementation, Core Web Vitals audit, and commercial keyword matrix.",
      },
      {
        name: "Month 2: On-Page Optimization & Content Expansion",
        timeline: "Month 2",
        description: "Meta tags, heading tags hierarchy, internal link modeling, and targeted landing page copy optimization.",
      },
      {
        name: "Month 3: Authority Building, Local Citations & Rank Tracking",
        timeline: "Month 3",
        description: "Google Business Profile optimization, local citations, backlink profile review, and ranking progression report.",
      },
    ],
    defaultLineItems: [
      {
        description: "Comprehensive Technical SEO Audit & Infrastructure Health Fixes",
        quantity: 1,
        unitPrice: 55000,
        discount: 0,
        taxRate: 10,
      },
      {
        description: "Commercial Keyword Research, Mapping & Content Architecture",
        quantity: 1,
        unitPrice: 40000,
        discount: 0,
        taxRate: 10,
      },
      {
        description: "On-Page SEO Optimization & Monthly Metadata Updates",
        quantity: 3,
        unitPrice: 35000,
        discount: 0,
        taxRate: 10,
      },
      {
        description: "Monthly Rank Tracking, Google Search Console Analytics & Reporting",
        quantity: 3,
        unitPrice: 15000,
        discount: 0,
        taxRate: 10,
      },
    ],
    defaultPaymentSchedule: [
      {
        description: "50% Upfront Initial Deposit & Audit Kick-off",
        percentage: 50,
        dueCondition: "Upon Agreement Signing",
      },
      {
        description: "30% Midpoint Review & Content Optimization Approval",
        percentage: 30,
        dueCondition: "Upon Month 2 Review",
      },
      {
        description: "20% Final Quarterly Review & Deliverables Sign-off",
        percentage: 20,
        dueCondition: "Upon End of Quarter",
      },
    ],
  },
  {
    id: "srv_branding",
    serviceNumber: "SERVICE 04",
    name: "BRAND IDENTITY & DESIGN SYSTEM",
    category: "Design & Development",
    iconName: "Palette",
    tagline: "Distinctive, authoritative visual identity and comprehensive scalable design system.",
    executiveSummary:
      "Create a distinctive and scalable brand identity that establishes a consistent visual language across digital and physical touchpoints. The system will define how the brand looks, communicates and maintains consistency as it grows.",
    clientRequirements: [
      "Establish a professional brand identity.",
      "Create a consistent visual language.",
      "Improve brand recognition.",
      "Define reusable design standards.",
      "Ensure consistency across marketing channels.",
    ],
    proposedSolutionScope: [
      "Brand discovery and positioning inputs.",
      "Logo and identity development.",
      "Color palette and typography system.",
      "Graphic elements and visual language.",
      "Brand applications.",
      "Social and digital design direction.",
      "Brand guidelines/design system documentation.",
    ],
    tangibleDeliverables: [
      "Primary logo",
      "Logo variations",
      "Color palette",
      "Typography system",
      "Brand visual elements",
      "Social media direction",
      "Brand guidelines",
      "Design system assets",
    ],
    providerResponsibilities: [
      "Develop the agreed identity system.",
      "Present concepts for client review.",
      "Refine the selected direction.",
      "Prepare final approved assets.",
      "Document the agreed brand standards.",
    ],
    clientResponsibilities: [
      "Provide brand background and positioning information.",
      "Provide timely feedback.",
      "Approve the selected creative direction.",
      "Supply any required existing brand assets.",
    ],
    defaultMilestones: [
      {
        name: "Phase 1: Discovery, Positioning & Visual Moodboards",
        timeline: "Week 1",
        description: "Competitor visual audit, brand attribute definition, and moodboard alignment.",
      },
      {
        name: "Phase 2: Logo Exploration & Conceptual Directions",
        timeline: "Week 2",
        description: "Presentation of 3 distinct logo concepts with color palettes and typographic pairings.",
      },
      {
        name: "Phase 3: Refinement, Collateral & Master Brand Guidelines Book",
        timeline: "Week 3 - 4",
        description: "Design of stationery, social media templates, icon set, and 30+ page digital brand manual.",
      },
    ],
    defaultLineItems: [
      {
        description: "Brand Strategy, Visual Research & Master Logo Concept Design",
        quantity: 1,
        unitPrice: 85000,
        discount: 0,
        taxRate: 10,
      },
      {
        description: "Color Hierarchy, Typography Pairing & Vector Asset Suite",
        quantity: 1,
        unitPrice: 45000,
        discount: 0,
        taxRate: 10,
      },
      {
        description: "Social Media Kit & Corporate Stationery Print Templates",
        quantity: 1,
        unitPrice: 35000,
        discount: 0,
        taxRate: 10,
      },
      {
        description: "Comprehensive Brand Guidelines & Digital Design System Book (PDF)",
        quantity: 1,
        unitPrice: 40000,
        discount: 0,
        taxRate: 10,
      },
    ],
    defaultPaymentSchedule: [
      {
        description: "50% Upfront Retainer upon Agreement Signing",
        percentage: 50,
        dueCondition: "Upon Agreement Signing",
      },
      {
        description: "30% Upon Approval of Master Logo Concept",
        percentage: 30,
        dueCondition: "Upon Concept Approval",
      },
      {
        description: "20% Upon Final Asset Package Delivery & Guidelines",
        percentage: 20,
        dueCondition: "Upon Final Delivery",
      },
    ],
  },
  {
    id: "srv_it_retainer",
    serviceNumber: "SERVICE 05",
    name: "IT INFRASTRUCTURE & SECURITY RETAINER",
    category: "IT & Cloud",
    iconName: "ShieldCheck",
    tagline: "Proactive infrastructure management, security oversight, and continuous technical support.",
    executiveSummary:
      "Provide ongoing IT infrastructure management, security oversight, technical support and operational monitoring through a structured retainer model. The service is designed to improve system reliability, security posture and business continuity.",
    clientRequirements: [
      "Improve IT infrastructure reliability.",
      "Strengthen security controls.",
      "Monitor systems and access.",
      "Reduce operational disruptions.",
      "Maintain structured technical support.",
    ],
    proposedSolutionScope: [
      "Infrastructure assessment and hardening.",
      "Security configuration and patch management.",
      "User/access management.",
      "Cloud resource review and optimization.",
      "Backup and recovery oversight.",
      "System monitoring.",
      "Technical support and issue resolution.",
      "Periodic security and infrastructure reporting.",
    ],
    tangibleDeliverables: [
      "Infrastructure audit",
      "Security assessment",
      "Security hardening",
      "Access control management",
      "Patch management",
      "Backup monitoring",
      "Infrastructure monitoring",
      "Technical support",
      "Periodic IT/security report",
    ],
    providerResponsibilities: [
      "Monitor agreed infrastructure.",
      "Perform scheduled maintenance.",
      "Address support requests within agreed SLA.",
      "Identify security and infrastructure risks.",
      "Maintain service documentation and reporting.",
    ],
    clientResponsibilities: [
      "Provide authorized infrastructure access.",
      "Maintain valid licenses and subscriptions.",
      "Approve infrastructure/security changes where required.",
      "Report incidents through the agreed support channel.",
    ],
    defaultMilestones: [
      {
        name: "Month 1: Initial Security Audit, IAM Hardening & Backup Automation",
        timeline: "Month 1",
        description: "Full network audit, vulnerability assessment, cloud permissions cleanup, and automated backup configuration.",
      },
      {
        name: "Ongoing: 24/7 Monitoring, Patch Management & Helpdesk SLA",
        timeline: "Monthly Retainer",
        description: "Uptime monitoring, endpoint security management, rapid issue resolution, and monthly SLA report.",
      },
    ],
    defaultLineItems: [
      {
        description: "Initial Cloud & Network Infrastructure Security Audit & Hardening",
        quantity: 1,
        unitPrice: 65000,
        discount: 0,
        taxRate: 10,
      },
      {
        description: "24/7 IT Infrastructure Monitoring, Backup & Patch Management (Quarterly)",
        quantity: 3,
        unitPrice: 50000,
        discount: 0,
        taxRate: 10,
      },
      {
        description: "Dedicated Priority Technical Support & Helpdesk SLA (Quarterly)",
        quantity: 3,
        unitPrice: 35000,
        discount: 0,
        taxRate: 10,
      },
    ],
    defaultPaymentSchedule: [
      {
        description: "Quarterly Initial Deposit & Setup Initiation",
        percentage: 50,
        dueCondition: "Upon Agreement Signing",
      },
      {
        description: "Mid-Quarter SLA Retainer Payment",
        percentage: 25,
        dueCondition: "Mid-Quarter Checkpoint",
      },
      {
        description: "End of Quarter Retainer Balance",
        percentage: 25,
        dueCondition: "End of Quarter",
      },
    ],
  },
  {
    id: "srv_social_media",
    serviceNumber: "SERVICE 06",
    name: "SOCIAL MEDIA MANAGEMENT",
    category: "Marketing & Growth",
    iconName: "Share2",
    tagline: "Strategic content planning, creative production, publishing, and community engagement.",
    executiveSummary:
      "Manage the client's social media presence through strategic content planning, creative production, publishing, community engagement and performance analysis. The objective is to build a consistent brand presence while increasing reach, engagement and audience interaction.",
    clientRequirements: [
      "Maintain consistent social media activity.",
      "Improve brand visibility and engagement.",
      "Create professional branded content.",
      "Build audience interaction.",
      "Track social media performance.",
    ],
    proposedSolutionScope: [
      "Social media strategy.",
      "Monthly content calendar.",
      "Static creative design.",
      "Carousel and campaign content.",
      "Copywriting and captions.",
      "Publishing and scheduling.",
      "Community management.",
      "Performance monitoring and reporting.",
    ],
    tangibleDeliverables: [
      "Social media strategy",
      "Monthly content calendar",
      "Social media posts",
      "Carousel designs",
      "Campaign creatives",
      "Captions/copy",
      "Publishing schedule",
      "Monthly performance report",
    ],
    providerResponsibilities: [
      "Plan and produce agreed content.",
      "Schedule/publish approved content.",
      "Monitor engagement.",
      "Provide performance insights.",
      "Maintain visual and communication consistency.",
    ],
    clientResponsibilities: [
      "Provide product/service information.",
      "Approve content within agreed timelines.",
      "Provide required account access.",
      "Supply promotions, offers and campaign information.",
    ],
    defaultMilestones: [
      {
        name: "Month 1: Channel Audit, Aesthetic Grid Direction & Content Calendar",
        timeline: "Month 1",
        description: "Social media visual playbook, hashtag architecture, and calendar approval for 20 posts.",
      },
      {
        name: "Months 2-3: Creative Production, Publishing & Community Growth",
        timeline: "Months 2-3",
        description: "Active publishing across Instagram & LinkedIn, direct message triaging, and monthly engagement reports.",
      },
    ],
    defaultLineItems: [
      {
        description: "Social Media Strategy, Grid Playbook & Visual Style Setup",
        quantity: 1,
        unitPrice: 45000,
        discount: 0,
        taxRate: 10,
      },
      {
        description: "Monthly Content Creation (16 Branded Posts + 4 Dynamic Carousels)",
        quantity: 3,
        unitPrice: 60000,
        discount: 5,
        taxRate: 10,
      },
      {
        description: "Publishing, Copywriting, Hashtags & Community Management",
        quantity: 3,
        unitPrice: 30000,
        discount: 0,
        taxRate: 10,
      },
      {
        description: "Monthly Analytics & Growth Optimization Reports",
        quantity: 3,
        unitPrice: 15000,
        discount: 0,
        taxRate: 10,
      },
    ],
    defaultPaymentSchedule: [
      {
        description: "Month 1 Retainer & Onboarding Fee",
        percentage: 40,
        dueCondition: "Upon Agreement Signing",
      },
      {
        description: "Month 2 Retainer Disbursement",
        percentage: 30,
        dueCondition: "Start of Month 2",
      },
      {
        description: "Month 3 Retainer Disbursement",
        percentage: 30,
        dueCondition: "Start of Month 3",
      },
    ],
  },
  {
    id: "srv_saas",
    serviceNumber: "SERVICE 07",
    name: "SAAS SERVICES",
    category: "Software & SaaS",
    iconName: "Cloud",
    tagline: "Scalable Software-as-a-Service architecture, UX/UI, multi-tenant database and APIs.",
    executiveSummary:
      "Design, develop or implement scalable Software-as-a-Service solutions tailored to the client's operational or commercial requirements. The solution focuses on usability, scalability, secure access, centralized management and long-term maintainability.",
    clientRequirements: [
      "Digitize business processes.",
      "Build a centralized cloud-based platform.",
      "Enable secure user access.",
      "Improve operational efficiency.",
      "Create a scalable technology foundation.",
    ],
    proposedSolutionScope: [
      "Product/business requirements analysis.",
      "SaaS architecture planning.",
      "UX/UI design.",
      "Web application development.",
      "User and role management.",
      "Database and API development.",
      "Admin dashboard.",
      "Cloud deployment.",
      "Testing and launch support.",
    ],
    tangibleDeliverables: [
      "Product requirements",
      "UX/UI designs",
      "SaaS web application",
      "User authentication",
      "Role/access management",
      "Admin dashboard",
      "Database",
      "API integrations",
      "Cloud deployment",
      "QA and testing",
    ],
    providerResponsibilities: [
      "Translate approved requirements into the SaaS solution.",
      "Manage design and development.",
      "Conduct testing and deployment.",
      "Provide technical documentation.",
      "Deliver agreed functionality within scope.",
    ],
    clientResponsibilities: [
      "Define business requirements.",
      "Provide workflows and operational information.",
      "Review prototypes and development builds.",
      "Provide required third-party credentials/access.",
      "Approve milestones within agreed timelines.",
    ],
    defaultMilestones: [
      {
        name: "Phase 1: SaaS Architecture, DB Schemas & UX Wireframes",
        timeline: "Weeks 1-2",
        description: "Entity relationship diagrams, role permissions mapping, and interactive frontend prototypes.",
      },
      {
        name: "Phase 2: Authentication, Core Workflows & Multi-tenant API",
        timeline: "Weeks 3-6",
        description: "RBAC security implementation, subscription billing hooks, API gateway, and backend database.",
      },
      {
        name: "Phase 3: Super Admin Portal, Analytics & Third-Party APIs",
        timeline: "Weeks 7-9",
        description: "Admin panel build, user management metrics, automated email notifications, and webhook integrations.",
      },
      {
        name: "Phase 4: Load Testing, Security Audit & Cloud Launch",
        timeline: "Weeks 10-11",
        description: "Stress testing, penetration review, SSL/DNS setup, production staging, and technical handover.",
      },
    ],
    defaultLineItems: [
      {
        description: "SaaS Product Architecture, UX/UI Design & Interactive Prototype",
        quantity: 1,
        unitPrice: 180000,
        discount: 0,
        taxRate: 10,
      },
      {
        description: "Core Cloud Application Development & Multi-tenant Database Engineering",
        quantity: 1,
        unitPrice: 350000,
        discount: 5,
        taxRate: 10,
      },
      {
        description: "RBAC Authentication, Role Permissions & Super-Admin Dashboard",
        quantity: 1,
        unitPrice: 120000,
        discount: 0,
        taxRate: 10,
      },
      {
        description: "Payment Gateway Billing, Webhooks & Automated Email Triggers",
        quantity: 1,
        unitPrice: 95000,
        discount: 0,
        taxRate: 10,
      },
      {
        description: "Cloud Deployment, Stress Testing & Comprehensive Developer API Docs",
        quantity: 1,
        unitPrice: 75000,
        discount: 0,
        taxRate: 10,
      },
    ],
    defaultPaymentSchedule: [
      {
        description: "40% Upfront Deposit upon Agreement Signing",
        percentage: 40,
        dueCondition: "Upon Agreement Signing",
      },
      {
        description: "30% Midpoint Milestone (Core Workflows & DB Build)",
        percentage: 30,
        dueCondition: "Upon Phase 2 Completion",
      },
      {
        description: "30% Final Balance upon Production Launch & Admin Handover",
        percentage: 30,
        dueCondition: "Upon Final Delivery",
      },
    ],
  },
  {
    id: "srv_custom_software",
    serviceNumber: "SERVICE 08",
    name: "SOFTWARE DEVELOPMENT",
    category: "Software & SaaS",
    iconName: "Code2",
    tagline: "Customized bespoke software engineering tailored to your operational workflows.",
    executiveSummary:
      "Develop customized software solutions designed around the client's specific operational, commercial or customer-facing requirements. The engagement covers discovery, architecture, UI/UX, development, integrations, testing, deployment and agreed post-launch support.",
    clientRequirements: [
      "Solve specific business or operational requirements.",
      "Automate manual processes.",
      "Improve productivity and efficiency.",
      "Integrate existing systems.",
      "Create a scalable software solution.",
    ],
    proposedSolutionScope: [
      "Business requirements analysis.",
      "Functional specifications.",
      "System architecture.",
      "UX/UI design.",
      "Front-end and back-end development.",
      "Database development.",
      "API and third-party integrations.",
      "QA and user acceptance testing.",
      "Deployment and handover.",
    ],
    tangibleDeliverables: [
      "Requirements documentation",
      "System architecture",
      "UX/UI design",
      "Software application",
      "Database",
      "APIs/integrations",
      "Admin functionality",
      "QA testing",
      "Deployment",
      "Technical documentation",
    ],
    providerResponsibilities: [
      "Manage the software development lifecycle.",
      "Develop agreed functionality.",
      "Conduct quality assurance.",
      "Manage deployment and technical handover.",
      "Provide agreed documentation.",
    ],
    clientResponsibilities: [
      "Provide complete business requirements.",
      "Provide required data and system access.",
      "Participate in testing and approvals.",
      "Provide timely feedback.",
      "Approve completed milestones.",
    ],
    defaultMilestones: [
      {
        name: "Phase 1: Discovery, Technical Blueprint & Wireframing",
        timeline: "Weeks 1-2",
        description: "Business workflow mapping, database schema design, and UI wireframe sign-off.",
      },
      {
        name: "Phase 2: Custom Engine Coding & API Integrations",
        timeline: "Weeks 3-6",
        description: "Core software development, business logic programming, and external API connectors.",
      },
      {
        name: "Phase 3: User Acceptance Testing (UAT) & Refinements",
        timeline: "Weeks 7-8",
        description: "Internal and client UAT testing, bug resolution, and speed optimization.",
      },
      {
        name: "Phase 4: Production Deployment & Technical Handover",
        timeline: "Week 9",
        description: "Cloud rollout, administrator training session, and documentation delivery.",
      },
    ],
    defaultLineItems: [
      {
        description: "Software Architecture, Functional Specifications & UX Prototype",
        quantity: 1,
        unitPrice: 140000,
        discount: 0,
        taxRate: 10,
      },
      {
        description: "Custom Backend Engine & Relational Database Engineering",
        quantity: 1,
        unitPrice: 280000,
        discount: 5,
        taxRate: 10,
      },
      {
        description: "Modern Frontend Interface & Administrative Control Panel",
        quantity: 1,
        unitPrice: 190000,
        discount: 0,
        taxRate: 10,
      },
      {
        description: "Legacy Systems API Integration, Data Migration & Automated Sync",
        quantity: 1,
        unitPrice: 85000,
        discount: 0,
        taxRate: 10,
      },
      {
        description: "UAT Testing, Security Hardening & 30-Day Post-Launch Technical SLA",
        quantity: 1,
        unitPrice: 55000,
        discount: 0,
        taxRate: 10,
      },
    ],
    defaultPaymentSchedule: [
      {
        description: "50% Upfront Initial Deposit upon Signing",
        percentage: 50,
        dueCondition: "Upon Agreement Signing",
      },
      {
        description: "30% Midpoint Milestone upon Core Engine UAT",
        percentage: 30,
        dueCondition: "Upon Phase 2 Sign-off",
      },
      {
        description: "20% Final Balance upon Deployment & Technical Handover",
        percentage: 20,
        dueCondition: "Upon Final Delivery",
      },
    ],
  },
  {
    id: "srv_content_marketing",
    serviceNumber: "SERVICE 09",
    name: "CREATIVE CONTENT MARKETING",
    category: "Marketing & Growth",
    iconName: "Video",
    tagline: "Strategic storytelling, high-converting copy, short-form video concepts, and campaign assets.",
    executiveSummary:
      "Develop strategic, high-quality creative content designed to communicate the brand's value proposition and support awareness, engagement and conversion. Content will combine strategic messaging with strong visual storytelling across relevant digital channels.",
    clientRequirements: [
      "Strengthen brand communication.",
      "Produce consistent creative content.",
      "Improve audience engagement.",
      "Support marketing campaigns.",
      "Communicate products/services effectively.",
    ],
    proposedSolutionScope: [
      "Content strategy and creative direction.",
      "Campaign concepts.",
      "Social media creative content.",
      "Copywriting and storytelling.",
      "Static and carousel designs.",
      "Short-form video concepts.",
      "Promotional campaign assets.",
      "Content performance recommendations.",
    ],
    tangibleDeliverables: [
      "Content strategy",
      "Creative concepts",
      "Campaign themes",
      "Social media creatives",
      "Carousel designs",
      "Copywriting",
      "Short-form video concepts",
      "Promotional assets",
      "Content calendar",
    ],
    providerResponsibilities: [
      "Develop agreed creative concepts.",
      "Produce approved content assets.",
      "Maintain brand consistency.",
      "Coordinate content revisions.",
      "Provide content recommendations based on campaign objectives.",
    ],
    clientResponsibilities: [
      "Provide product/service information.",
      "Provide brand assets and references.",
      "Approve concepts and content.",
      "Provide timely feedback and campaign information.",
    ],
    defaultMilestones: [
      {
        name: "Month 1: Content Playbook, Storytelling Framework & Moodboards",
        timeline: "Month 1",
        description: "Brand tone of voice guide, content themes matrix, and monthly editorial calendar.",
      },
      {
        name: "Months 2-3: Creative Asset Production & Video Concept Rollout",
        timeline: "Months 2-3",
        description: "Bi-weekly batch delivery of carousel graphics, promotional reels/scripts, and campaign assets.",
      },
    ],
    defaultLineItems: [
      {
        description: "Creative Content Strategy, Brand Messaging & Storytelling Framework",
        quantity: 1,
        unitPrice: 50000,
        discount: 0,
        taxRate: 10,
      },
      {
        description: "High-Impact Social Media Graphic Assets & Multi-Slide Carousels",
        quantity: 3,
        unitPrice: 45000,
        discount: 0,
        taxRate: 10,
      },
      {
        description: "Short-Form Video Concept Scripts, Hooks & Storyboards (Reels/TikTok)",
        quantity: 3,
        unitPrice: 40000,
        discount: 5,
        taxRate: 10,
      },
      {
        description: "Promotional Ad Copywriting, Email Newsletters & Campaign Assets",
        quantity: 3,
        unitPrice: 25000,
        discount: 0,
        taxRate: 10,
      },
    ],
    defaultPaymentSchedule: [
      {
        description: "Month 1 Retainer upon Agreement Signing",
        percentage: 40,
        dueCondition: "Upon Agreement Signing",
      },
      {
        description: "Month 2 Production Retainer",
        percentage: 30,
        dueCondition: "Start of Month 2",
      },
      {
        description: "Month 3 Production Retainer",
        percentage: 30,
        dueCondition: "Start of Month 3",
      },
    ],
  },
];

// Variable Replacement Engine
export interface TemplateVariables {
  clientName?: string;
  clientCompany?: string;
  companyName?: string;
  projectName?: string;
  serviceName?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  projectDuration?: string;
  preparedBy?: string;
  proposalDate?: string;
  proposalValidity?: string;
  currency?: string;
  taxRate?: string | number;
  paymentTerms?: string;
  grandTotal?: string | number;
}

export function replaceTemplateVariables(text: string, vars: TemplateVariables): string {
  if (!text) return "";
  let res = text;
  const map: Record<string, string> = {
    "[Client Name]": vars.clientName || "Valued Client",
    "[Company Name]": vars.companyName || "XyronGroup",
    "[Project Name]": vars.projectName || "Digital & Commercial Project",
    "[Service Name]": vars.serviceName || "Digital Agency Services",
    "[Project Start Date]": vars.projectStartDate || "Upon Agreement Signing",
    "[Project End Date]": vars.projectEndDate || "Within Agreed Timeline",
    "[Project Duration]": vars.projectDuration || "6-8 Weeks",
    "[Prepared By]": vars.preparedBy || "XyronGroup Team",
    "[Proposal Date]": vars.proposalDate || new Date().toISOString().split("T")[0],
    "[Proposal Validity]": vars.proposalValidity || "30 Calendar Days",
    "[Currency]": vars.currency || "PKR",
    "[Tax Rate]": String(vars.taxRate || "10%"),
    "[Payment Terms]": vars.paymentTerms || "50% upfront deposit, balance upon milestone completion.",
    "[Grand Total]": String(vars.grandTotal || "Calculated Investment"),
  };

  for (const [placeholder, val] of Object.entries(map)) {
    res = res.replaceAll(placeholder, val);
  }
  return res;
}
