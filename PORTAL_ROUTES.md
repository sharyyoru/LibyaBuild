# Libya Build 2026 - Admin Portal Routes Documentation

## Complete Portal Routes & Access Control

### Authentication
- **Login Page**: `/admin/login`
- **Logout**: `/admin/logout`
- **Password Reset**: `/admin/reset-password`

---

## Internal Admin Portals

### 1. Super Admin Portal
**Base Route**: `/admin/super`  
**Access**: `super_admin` role only

#### Routes:
- **Dashboard**: `/admin/super/dashboard`
- **User Management**:
  - List Users: `/admin/super/users`
  - Create User: `/admin/super/users/create`
  - Edit User: `/admin/super/users/:id/edit`
  - User Details: `/admin/super/users/:id`
- **Activity Management**:
  - All Activities: `/admin/super/activities`
  - Create Activity: `/admin/super/activities/create`
  - Edit Activity: `/admin/super/activities/:id/edit`
  - Activity Dashboard: `/admin/super/activities/dashboard`
- **System Configuration**:
  - Settings: `/admin/super/settings`
  - Event Configuration: `/admin/super/settings/event`
  - General Settings: `/admin/super/settings/general`
  - Finance Settings: `/admin/super/settings/finance`

**Permissions**: Full access to all system features

---

### 2. Sales Portal (Local & International)
**Base Routes**: 
- Local: `/admin/sales/local`
- International: `/admin/sales/international`

**Access**: `local_sales` or `international_sales` roles

#### Routes:
- **Dashboard**: `/admin/sales/{locale}/dashboard`
- **Sales Cart & Applications**:
  - Applications List: `/admin/sales/{locale}/applications`
  - Create Application: `/admin/sales/{locale}/applications/create`
  - Application Details: `/admin/sales/{locale}/applications/:id`
  - Sales Cart: `/admin/sales/{locale}/cart`
- **Contract Management**:
  - Contracts List: `/admin/sales/{locale}/contracts`
  - Create Contract: `/admin/sales/{locale}/contracts/create`
  - Contract Details: `/admin/sales/{locale}/contracts/:id`
  - Approve Contract: `/admin/sales/{locale}/contracts/:id/approve`
  - Reject Contract: `/admin/sales/{locale}/contracts/:id/reject`
- **Agent Management**:
  - Agents List: `/admin/sales/{locale}/agents`
  - Assign Agent: `/admin/sales/{locale}/agents/assign`
  - Agent Details: `/admin/sales/{locale}/agents/:id`
- **Sales Reporting**:
  - Revenue Report: `/admin/sales/{locale}/reports/revenue`
  - Breakdown by Type: `/admin/sales/{locale}/reports/breakdown`
  - Analytics: `/admin/sales/{locale}/reports/analytics`

**Data Segregation**: Filtered by `locale` field (local/international)

---

### 3. Finance Portal (Local & International)
**Base Routes**:
- Local: `/admin/finance/local`
- International: `/admin/finance/international`

**Access**: `local_finance` or `international_finance` roles

#### Routes:
- **Dashboard**: `/admin/finance/{locale}/dashboard`
- **Invoicing System**:
  - Invoices List: `/admin/finance/{locale}/invoices`
  - Create Invoice: `/admin/finance/{locale}/invoices/create`
  - Edit Invoice: `/admin/finance/{locale}/invoices/:id/edit`
  - Invoice Details: `/admin/finance/{locale}/invoices/:id`
  - Revise Invoice: `/admin/finance/{locale}/invoices/:id/revise`
  - Cancel Invoice: `/admin/finance/{locale}/invoices/:id/cancel`
- **Payment Tracking**:
  - Payments List: `/admin/finance/{locale}/payments`
  - Record Payment: `/admin/finance/{locale}/payments/create`
  - Payment Details: `/admin/finance/{locale}/payments/:id`
  - Outstanding Balances: `/admin/finance/{locale}/payments/outstanding`
- **Expense Management**:
  - Expenses List: `/admin/finance/{locale}/expenses`
  - Create Expense: `/admin/finance/{locale}/expenses/create`
  - Expense Details: `/admin/finance/{locale}/expenses/:id`
  - Approve Expense: `/admin/finance/{locale}/expenses/:id/approve`
- **Discounts & Credits**:
  - Apply Discount: `/admin/finance/{locale}/invoices/:id/discount`
  - Create Credit Note: `/admin/finance/{locale}/invoices/credit-note`
- **Reports**:
  - Financial Overview: `/admin/finance/{locale}/reports/overview`
  - Revenue Report: `/admin/finance/{locale}/reports/revenue`
  - Expense Report: `/admin/finance/{locale}/reports/expenses`

**Data Segregation**: Filtered by `locale` field (local/international)

---

### 4. Operations Portal (Local & International)
**Base Routes**:
- Local: `/admin/operations/local`
- International: `/admin/operations/international`

**Access**: `local_operations` or `international_operations` roles

#### Routes:
- **Dashboard**: `/admin/operations/{locale}/dashboard`
- **Stand Allocation**:
  - Floor Plan: `/admin/operations/{locale}/floor-plan`
  - Allocate Stand: `/admin/operations/{locale}/stands/allocate`
  - Modify Allocation: `/admin/operations/{locale}/stands/:id/modify`
  - Stand Details: `/admin/operations/{locale}/stands/:id`
- **Form Control**:
  - All Forms: `/admin/operations/{locale}/forms`
  - Form 2 (Fascia Boards): `/admin/operations/{locale}/forms/fascia`
  - Form 8 (Stand Design): `/admin/operations/{locale}/forms/design`
  - Forms 10-12 (Utilities): `/admin/operations/{locale}/forms/utilities`
  - Approve Form: `/admin/operations/{locale}/forms/:id/approve`
  - Reject Form: `/admin/operations/{locale}/forms/:id/reject`
- **Logistics Management**:
  - Visa Applications: `/admin/operations/{locale}/logistics/visas`
  - Visa Details: `/admin/operations/{locale}/logistics/visas/:id`
  - Freight Documents: `/admin/operations/{locale}/logistics/freight`
  - Freight Details: `/admin/operations/{locale}/logistics/freight/:id`
  - Hotel Management: `/admin/operations/{locale}/logistics/hotels`
  - Hotel Prices: `/admin/operations/{locale}/logistics/hotels/:id/pricing`
- **Access Control**:
  - Resend Credentials: `/admin/operations/{locale}/access/resend-credentials`
  - Portal Access Log: `/admin/operations/{locale}/access/logs`

**Data Segregation**: Filtered by `locale` field (local/international)

---

### 5. Marketing Portal
**Base Route**: `/admin/marketing`

**Access**: `marketing` role

#### Routes:
- **Dashboard**: `/admin/marketing/dashboard`
- **Banner Management**:
  - All Banners: `/admin/marketing/banners`
  - Create Banner: `/admin/marketing/banners/create`
  - Edit Banner: `/admin/marketing/banners/:id/edit`
  - Schedule Banner: `/admin/marketing/banners/:id/schedule`
  - Hero Banners: `/admin/marketing/banners/hero`
  - Promotional Banners: `/admin/marketing/banners/promotional`
- **Sponsorship Tracking**:
  - Sponsorships List: `/admin/marketing/sponsorships`
  - Sponsorship Details: `/admin/marketing/sponsorships/:id`
  - Approve Sponsorship: `/admin/marketing/sponsorships/:id/approve`
- **Partner Coordination**:
  - Partners List: `/admin/marketing/partners`
  - Create Partner: `/admin/marketing/partners/create`
  - Edit Partner: `/admin/marketing/partners/:id/edit`
  - Filter by Type: `/admin/marketing/partners?type={media|event}`
- **Digital Assets**:
  - Asset Library: `/admin/marketing/assets`
  - Upload Asset: `/admin/marketing/assets/upload`

**Permissions**: Banner management, sponsorship tracking, partner coordination

---

## External Portals

### 6. Exhibitor Portal
**Base Route**: `/exhibitor`

**Access**: `exhibitor` role

#### Routes:
- **Dashboard**: `/exhibitor/dashboard`
- **Mandatory Forms**:
  - Form 1 (Badges): `/exhibitor/forms/badges`
  - Form 2 (Name Boards): `/exhibitor/forms/name-boards`
  - Form 3 (Basic Entry): `/exhibitor/forms/basic-entry`
- **Optional Forms**:
  - Furniture Booking: `/exhibitor/forms/furniture`
  - Electricity Request: `/exhibitor/forms/electricity`
  - Internet Request: `/exhibitor/forms/internet`
  - Marketing Services: `/exhibitor/forms/marketing`
- **Digital Assets**:
  - Download Center: `/exhibitor/assets`
  - Marketing Materials: `/exhibitor/assets/marketing`
  - Event PDFs: `/exhibitor/assets/documents`
- **B2B Chat**:
  - Chat List: `/exhibitor/chat`
  - Conversation: `/exhibitor/chat/:conversationId`
- **Profile**:
  - Company Profile: `/exhibitor/profile`
  - Edit Profile: `/exhibitor/profile/edit`
- **Invoices & Payments**:
  - My Invoices: `/exhibitor/invoices`
  - Invoice Details: `/exhibitor/invoices/:id`
  - Payment History: `/exhibitor/payments`

**Permissions**: Form submission, asset download, B2B chat access

---

### 7. Partner Portal
**Base Route**: `/partner`

**Access**: `partner_with_stand` or `partner_without_stand` roles

#### Routes:
- **Dashboard**: `/partner/dashboard`
- **Event Information**:
  - Event Updates: `/partner/updates`
  - Exhibitor Manual: `/partner/manual`
  
#### Routes for Partners WITH Stand:
- **All Mandatory Forms**:
  - Form 1 (Badges): `/partner/forms/badges`
  - Form 2 (Name Boards): `/partner/forms/name-boards`
  - Form 3 (Basic Entry): `/partner/forms/basic-entry`
- **All Optional Forms**:
  - Furniture: `/partner/forms/furniture`
  - Utilities: `/partner/forms/utilities`
  - Marketing: `/partner/forms/marketing`

#### Routes for Partners WITHOUT Stand:
- **Limited Access**:
  - Form 3 Only: `/partner/forms/basic-entry`

**Conditional Access**: Based on `has_stand` field in partners table

---

### 8. Agent Portal
**Base Route**: `/agent`

**Access**: `agent` role

#### Routes:
- **Dashboard**: `/agent/dashboard`
- **Exhibitor Management**:
  - My Exhibitors: `/agent/exhibitors`
  - Create Exhibitor: `/agent/exhibitors/create`
  - Create Group: `/agent/exhibitors/create-group`
  - Exhibitor Details: `/agent/exhibitors/:id`
  - Edit Exhibitor: `/agent/exhibitors/:id/edit`
- **Financial Overview**:
  - All Invoices: `/agent/invoices`
  - Group Invoices: `/agent/invoices/group`
  - Invoice Details: `/agent/invoices/:id`
  - Payment Status: `/agent/payments`
- **Marketing Access**:
  - Asset Library: `/agent/assets`
  - Download Materials: `/agent/assets/download`
  - Promotional Content: `/agent/assets/promotional`
- **Reports**:
  - Commission Report: `/agent/reports/commission`
  - Exhibitor Report: `/agent/reports/exhibitors`

**Permissions**: Create/manage exhibitors, view consolidated invoices, access marketing assets

---

## API Endpoints (Mobile App Integration)

### Mobile App Data Sync Routes:
- **Exhibitors**: `GET /api/mobile/exhibitors`
- **Speakers**: `GET /api/mobile/speakers`
- **Sessions**: `GET /api/mobile/sessions`
- **News**: `GET /api/mobile/news`
- **Banners**: `GET /api/mobile/banners`
- **POIs**: `GET /api/mobile/pois`
- **Floor Plan**: `GET /api/mobile/floor-plan`
- **Chat Messages**: 
  - `GET /api/mobile/chat/:conversationId`
  - `POST /api/mobile/chat/:conversationId/message`
- **User Profile**: 
  - `GET /api/mobile/profile`
  - `PUT /api/mobile/profile`

---

## Access Control Summary

| Portal Type | Role Required | Locale Filter | Access Level |
|------------|---------------|---------------|--------------|
| Super Admin | `super_admin` | All | Full System |
| Sales (Local) | `local_sales` | Local | Sales Data |
| Sales (International) | `international_sales` | International | Sales Data |
| Finance (Local) | `local_finance` | Local | Finance Data |
| Finance (International) | `international_finance` | International | Finance Data |
| Operations (Local) | `local_operations` | Local | Operations Data |
| Operations (International) | `international_operations` | International | Operations Data |
| Marketing | `marketing` | All | Marketing Data |
| Exhibitor | `exhibitor` | Own Data | Limited |
| Partner (With Stand) | `partner_with_stand` | Own Data | All Forms |
| Partner (Without Stand) | `partner_without_stand` | Own Data | Form 3 Only |
| Agent | `agent` | Assigned Exhibitors | Group Data |

---

## Development Ports

- **Admin Portal**: `http://localhost:5173`
- **Mobile App**: `http://localhost:3000`
- **API Server**: `http://localhost:5173/api`

---

## Route Protection

All admin routes require authentication and role verification:
```javascript
// Example middleware
const requireAuth = (allowedRoles) => {
  // Check if user is authenticated
  // Verify user role is in allowedRoles array
  // Check locale permissions if applicable
}
```

## Locale-Based Data Segregation

Routes with `{locale}` parameter automatically filter data:
- `/admin/sales/local/*` - Shows only records where `locale='local'`
- `/admin/sales/international/*` - Shows only records where `locale='international'`

Users can be granted access to both locales if needed.
