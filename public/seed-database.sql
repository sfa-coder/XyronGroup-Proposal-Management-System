-- Database Seed Script for Proposal Web Application (XyronGroup)
-- Compatible with PostgreSQL & MySQL

CREATE TABLE IF NOT EXISTS company_profiles (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  tagline VARCHAR(255),
  logo_url TEXT,
  address TEXT,
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  tax_id VARCHAR(100),
  payment_terms TEXT,
  bank_details TEXT,
  currency VARCHAR(10) DEFAULT 'PKR',
  default_tax_rate NUMERIC(5,2) DEFAULT 0,
  signatory_name VARCHAR(255),
  signatory_title VARCHAR(255),
  signatory_subtitle VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  tax_id VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS proposals (
  id VARCHAR(64) PRIMARY KEY,
  doc_number VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'Proposal',
  status VARCHAR(50) DEFAULT 'Draft',
  client_id VARCHAR(64),
  client_name VARCHAR(255),
  client_company VARCHAR(255),
  client_email VARCHAR(255),
  client_address TEXT,
  client_tax_id VARCHAR(100),
  issue_date DATE,
  expiry_date DATE,
  overview TEXT,
  requirements TEXT,
  proposed_solution TEXT,
  scope_of_work TEXT,
  deliverables JSONB,
  responsibilities JSONB,
  milestones JSONB,
  pricing_model VARCHAR(50) DEFAULT 'setup-and-retainer',
  setup_fee NUMERIC(15,2) DEFAULT 325000,
  monthly_retainer_fee NUMERIC(15,2) DEFAULT 210000,
  engagement_months INT DEFAULT 6,
  payment_frequency VARCHAR(100) DEFAULT 'Monthly in Advance',
  tax_enabled BOOLEAN DEFAULT FALSE,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  first_month_total NUMERIC(15,2) DEFAULT 325000,
  recurring_monthly_amount NUMERIC(15,2) DEFAULT 210000,
  retainer_services JSONB,
  line_items JSONB,
  subtotal NUMERIC(15,2) DEFAULT 1375000,
  tax_total NUMERIC(15,2) DEFAULT 0,
  discount_total NUMERIC(15,2) DEFAULT 0,
  grand_total NUMERIC(15,2) DEFAULT 1375000,
  payment_schedule JSONB,
  terms_and_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Client
INSERT INTO clients (
  id, name, company, email, phone, address, tax_id, notes
) VALUES (
  'cli_vista',
  'Mr. Osama Hassan',
  'Vista Maritime',
  'osama.hassan@vistamaritimetravel.com',
  '+971 4 380 9191',
  'Office # 09, DMC-L-A Madinat Dubai Almelaheyah\nDubai Maritime City, Dubai, UAE',
  '',
  'Operational branches in DHA Karachi & DHA Islamabad, direct Dubai DMC hub in Dubai Maritime City. Corporate Travel & Seafarer Logistics specialist.'
) ON CONFLICT (id) DO NOTHING;

-- Seed Initial Vista Maritime Proposal
INSERT INTO proposals (
  id, doc_number, title, type, status, client_id, client_name, client_company, client_email, client_address, client_tax_id,
  pricing_model, setup_fee, monthly_retainer_fee, engagement_months, payment_frequency,
  subtotal, grand_total, terms_and_conditions
) VALUES (
  'doc_vista_001',
  'PROP-2026-486',
  'SEO Services, Social Media Management & Creative Content Marketing',
  'Proposal',
  'Draft',
  'cli_vista',
  'Mr. Osama Hassan',
  'Vista Maritime',
  'osama.hassan@vistamaritimetravel.com',
  'Office # 09, DMC-L-A Madinat Dubai Almelaheyah\nDubai Maritime City, Dubai, UAE',
  '',
  'setup-and-retainer',
  325000,
  210000,
  6,
  'Monthly in Advance',
  1375000,
  1375000,
  'Payment Terms: The initial setup and first-month investment of PKR 325,000 is payable upon agreement signing. The recurring monthly retainer of PKR 210,000 is payable in advance at the beginning of each subsequent month. Minimum 6-month engagement.'
) ON CONFLICT (id) DO NOTHING;
