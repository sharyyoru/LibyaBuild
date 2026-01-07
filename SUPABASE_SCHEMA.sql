-- Libya Build 2026 - Complete Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- =============================================
-- ENABLE ROW LEVEL SECURITY AND UUID EXTENSION
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS & AUTHENTICATION
-- =============================================

-- User Roles and Permissions
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO user_roles (name, display_name, permissions) VALUES
('super_admin', 'Super Administrator', '["all"]'),
('marketing', 'Marketing Team', '["banners", "sponsorships", "partners"]'),
('international_finance', 'International Finance', '["invoices_intl", "payments_intl", "expenses_intl"]'),
('local_finance', 'Local Finance', '["invoices_local", "payments_local", "expenses_local"]'),
('international_operations', 'International Operations', '["stands_intl", "forms_intl", "logistics_intl"]'),
('local_operations', 'Local Operations', '["stands_local", "forms_local", "logistics_local"]'),
('international_sales', 'International Sales', '["contracts_intl", "applications_intl", "agents_intl"]'),
('local_sales', 'Local Sales', '["contracts_local", "applications_local", "agents_local"]'),
('exhibitor', 'Exhibitor', '["forms", "portal_access", "chat"]'),
('partner_with_stand', 'Partner (With Stand)', '["all_forms", "portal_access"]'),
('partner_without_stand', 'Partner (Without Stand)', '["form_3", "portal_access"]'),
('agent', 'Sales Agent', '["create_exhibitors", "view_invoices", "marketing_assets"]');

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role_id UUID REFERENCES user_roles(id) NOT NULL,
  locale VARCHAR(20) DEFAULT 'local' CHECK (locale IN ('local', 'international')),
  phone VARCHAR(50),
  company VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ACTIVITY & TASK MANAGEMENT
-- =============================================

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SYSTEM CONFIGURATION
-- =============================================

CREATE TABLE system_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  data_type VARCHAR(50) DEFAULT 'string',
  category VARCHAR(100),
  description TEXT,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO system_config (key, value, data_type, category, description) VALUES
('event_name', 'Libya Build 2026', 'string', 'event', 'Event name'),
('event_start_date', '2026-03-15', 'date', 'event', 'Event start date'),
('event_end_date', '2026-03-17', 'date', 'event', 'Event end date'),
('venue_name', 'Tripoli International Fair Ground', 'string', 'event', 'Venue name'),
('currency', 'AED', 'string', 'finance', 'Default currency'),
('vat_rate', '5', 'number', 'finance', 'VAT rate percentage'),
('premium_banner_price', '500', 'number', 'marketing', '24-hour premium banner price');

-- =============================================
-- EXHIBITORS & APPLICATIONS
-- =============================================

CREATE TABLE exhibitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  sector VARCHAR(100),
  country VARCHAR(100),
  locale VARCHAR(20) DEFAULT 'local' CHECK (locale IN ('local', 'international')),
  booth_number VARCHAR(50),
  hall VARCHAR(50),
  stand_type VARCHAR(50) CHECK (stand_type IN ('shell_scheme', 'space_only', 'custom')),
  stand_size_sqm DECIMAL(10, 2),
  agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  website VARCHAR(255),
  logo_url TEXT,
  description TEXT,
  tags JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE application_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibitor_id UUID REFERENCES exhibitors(id) ON DELETE CASCADE,
  form_type VARCHAR(50) CHECK (form_type IN ('shell_scheme', 'space_only', 'sponsorship')),
  locale VARCHAR(20) DEFAULT 'local' CHECK (locale IN ('local', 'international')),
  data JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  submitted_by UUID REFERENCES users(id),
  reviewed_by UUID REFERENCES users(id),
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CONTRACTS & AGREEMENTS
-- =============================================

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_number VARCHAR(100) UNIQUE NOT NULL,
  exhibitor_id UUID REFERENCES exhibitors(id) ON DELETE CASCADE,
  application_form_id UUID REFERENCES application_forms(id),
  locale VARCHAR(20) DEFAULT 'local' CHECK (locale IN ('local', 'international')),
  contract_type VARCHAR(50) NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'AED',
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'signed', 'cancelled')),
  contract_date DATE,
  signed_date DATE,
  terms_conditions TEXT,
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- FINANCE - INVOICES & PAYMENTS
-- =============================================

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  exhibitor_id UUID REFERENCES exhibitors(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES contracts(id),
  locale VARCHAR(20) DEFAULT 'local' CHECK (locale IN ('local', 'international')),
  invoice_type VARCHAR(50) DEFAULT 'standard' CHECK (invoice_type IN ('standard', 'credit', 'debit')),
  subtotal DECIMAL(12, 2) NOT NULL,
  discount DECIMAL(12, 2) DEFAULT 0,
  vat_rate DECIMAL(5, 2) DEFAULT 5,
  vat_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'AED',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'partial', 'cancelled', 'overdue')),
  issue_date DATE NOT NULL,
  due_date DATE,
  paid_date DATE,
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  category VARCHAR(100) CHECK (category IN ('shell_scheme', 'space_only', 'sponsorship', 'furniture', 'utilities', 'services', 'add_ons')),
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_number VARCHAR(100) UNIQUE NOT NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'AED',
  payment_method VARCHAR(50) CHECK (payment_method IN ('bank_transfer', 'credit_card', 'cash', 'cheque', 'online')),
  payment_date DATE NOT NULL,
  reference_number VARCHAR(255),
  notes TEXT,
  locale VARCHAR(20) DEFAULT 'local' CHECK (locale IN ('local', 'international')),
  recorded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_number VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  vat_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'AED',
  expense_type VARCHAR(50) CHECK (expense_type IN ('office', 'event', 'marketing', 'logistics', 'other')),
  locale VARCHAR(20) DEFAULT 'local' CHECK (locale IN ('local', 'international')),
  expense_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  receipt_url TEXT,
  requested_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- OPERATIONS - FLOOR PLAN & STANDS
-- =============================================

CREATE TABLE floor_plan_stands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stand_number VARCHAR(50) UNIQUE NOT NULL,
  hall VARCHAR(50) NOT NULL,
  stand_type VARCHAR(50) CHECK (stand_type IN ('shell_scheme', 'space_only', 'custom')),
  size_sqm DECIMAL(10, 2) NOT NULL,
  position_x INTEGER,
  position_y INTEGER,
  width INTEGER,
  height INTEGER,
  locale VARCHAR(20) DEFAULT 'local' CHECK (locale IN ('local', 'international')),
  exhibitor_id UUID REFERENCES exhibitors(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'allocated', 'occupied')),
  price_per_sqm DECIMAL(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- FORMS MANAGEMENT
-- =============================================

CREATE TABLE exhibitor_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_number VARCHAR(50) NOT NULL,
  exhibitor_id UUID REFERENCES exhibitors(id) ON DELETE CASCADE,
  form_type VARCHAR(100) NOT NULL,
  form_name VARCHAR(255) NOT NULL,
  is_mandatory BOOLEAN DEFAULT false,
  data JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'completed')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form Types Reference
COMMENT ON COLUMN exhibitor_forms.form_type IS 'Form 1: Badge Request, Form 2: Fascia/Name Board, Form 3: Basic Online Entry, Form 8: Stand Design Approval, Form 10-12: Utilities (Electricity, Internet, etc.)';

-- =============================================
-- LOGISTICS
-- =============================================

CREATE TABLE visa_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibitor_id UUID REFERENCES exhibitors(id) ON DELETE CASCADE,
  applicant_name VARCHAR(255) NOT NULL,
  passport_number VARCHAR(100),
  nationality VARCHAR(100),
  application_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'issued')),
  visa_type VARCHAR(50),
  locale VARCHAR(20) DEFAULT 'international',
  documents JSONB DEFAULT '[]',
  notes TEXT,
  processed_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE freight_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibitor_id UUID REFERENCES exhibitors(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  document_number VARCHAR(100),
  shipment_details JSONB,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'approved', 'completed')),
  locale VARCHAR(20) DEFAULT 'international',
  document_url TEXT,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE hotel_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_name VARCHAR(255) NOT NULL,
  room_type VARCHAR(100),
  price_per_night DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'AED',
  available_rooms INTEGER DEFAULT 0,
  amenities JSONB DEFAULT '[]',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MARKETING
-- =============================================

CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  banner_type VARCHAR(50) CHECK (banner_type IN ('hero', 'promotional', 'sidebar')),
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  exhibitor_id UUID REFERENCES exhibitors(id) ON DELETE SET NULL,
  priority INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'expired', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  price DECIMAL(10, 2),
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sponsorships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibitor_id UUID REFERENCES exhibitors(id) ON DELETE CASCADE,
  sponsorship_type VARCHAR(100) NOT NULL,
  package_name VARCHAR(255),
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'AED',
  status VARCHAR(50) DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'rejected', 'active', 'completed')),
  benefits JSONB DEFAULT '[]',
  contract_id UUID REFERENCES contracts(id),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_name VARCHAR(255) NOT NULL,
  partner_type VARCHAR(50) CHECK (partner_type IN ('media', 'event', 'support', 'sponsor')),
  has_stand BOOLEAN DEFAULT false,
  user_id UUID REFERENCES users(id),
  exhibitor_id UUID REFERENCES exhibitors(id),
  logo_url TEXT,
  website VARCHAR(255),
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DIGITAL ASSETS
-- =============================================

CREATE TABLE digital_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_name VARCHAR(255) NOT NULL,
  asset_type VARCHAR(50) CHECK (asset_type IN ('pdf', 'image', 'video', 'document', 'logo', 'banner')),
  file_url TEXT NOT NULL,
  file_size INTEGER,
  category VARCHAR(100),
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  allowed_roles JSONB DEFAULT '["exhibitor", "partner_with_stand", "partner_without_stand", "agent"]',
  download_count INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- B2B CHAT & MESSAGING
-- =============================================

CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_type VARCHAR(50) CHECK (conversation_type IN ('exhibitor_visitor', 'exhibitor_exhibitor', 'admin_exhibitor')),
  participant_1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  participant_2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- AGENTS
-- =============================================

CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  agency_name VARCHAR(255) NOT NULL,
  locale VARCHAR(20) DEFAULT 'local' CHECK (locale IN ('local', 'international')),
  commission_rate DECIMAL(5, 2) DEFAULT 0,
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- AUDIT LOGS
-- =============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_locale ON users(locale);
CREATE INDEX idx_exhibitors_locale ON exhibitors(locale);
CREATE INDEX idx_exhibitors_agent ON exhibitors(agent_id);
CREATE INDEX idx_activities_assigned ON activities(assigned_to);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_invoices_exhibitor ON invoices(exhibitor_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_locale ON invoices(locale);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_contracts_exhibitor ON contracts(exhibitor_id);
CREATE INDEX idx_contracts_locale ON contracts(locale);
CREATE INDEX idx_forms_exhibitor ON exhibitor_forms(exhibitor_id);
CREATE INDEX idx_banners_type ON banners(banner_type);
CREATE INDEX idx_banners_status ON banners(status);
CREATE INDEX idx_chat_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitor_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Super Admin can see everything
CREATE POLICY super_admin_all ON users FOR ALL 
  USING ((SELECT role_id FROM users WHERE auth_user_id = auth.uid()) IN (SELECT id FROM user_roles WHERE name = 'super_admin'));

-- Exhibitors can only see their own data
CREATE POLICY exhibitor_own_data ON exhibitors FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Finance can see invoices based on locale
CREATE POLICY finance_invoices ON invoices FOR SELECT
  USING (
    (locale = 'local' AND (SELECT role_id FROM users WHERE auth_user_id = auth.uid()) IN (SELECT id FROM user_roles WHERE name = 'local_finance'))
    OR
    (locale = 'international' AND (SELECT role_id FROM users WHERE auth_user_id = auth.uid()) IN (SELECT id FROM user_roles WHERE name = 'international_finance'))
    OR
    ((SELECT role_id FROM users WHERE auth_user_id = auth.uid()) IN (SELECT id FROM user_roles WHERE name = 'super_admin'))
  );

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exhibitors_timestamp BEFORE UPDATE ON exhibitors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_timestamp BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_timestamp BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_timestamp BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forms_timestamp BEFORE UPDATE ON exhibitor_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate invoice/contract numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE invoice_number_seq START 1;
CREATE TRIGGER generate_invoice_number_trigger BEFORE INSERT ON invoices FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- =============================================
-- INITIAL DATA
-- =============================================

-- Create default super admin user (update with your actual auth user ID after first login)
-- INSERT INTO users (auth_user_id, email, full_name, role_id, locale) VALUES
-- ('YOUR_AUTH_USER_ID', 'admin@libyabuild.com', 'Super Administrator', 
--  (SELECT id FROM user_roles WHERE name = 'super_admin'), 'local');

COMMENT ON DATABASE postgres IS 'Libya Build 2026 - Complete Event Management System';
