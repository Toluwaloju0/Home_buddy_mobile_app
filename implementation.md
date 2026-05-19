# Home Buddy Implementation Plan

## 1. What This Repo Is Building

Home Buddy should become a verified housing platform for Nigeria that covers the full journey for buyers/tenants, sellers/agents/landlords, and admins.

The product goals are:

- prevent fraud before users waste time or money
- show total move-in cost up front
- support WhatsApp, calls, and offline inspections
- capture area intelligence that matters in Nigeria
- protect money with escrow and dispute handling
- keep users engaged after move-in with facility services

## 2. Current Codebase Assessment

The repo already has a useful base, but it is not yet the full product.

Backend state:

- FastAPI app is live in [backend/v1/main.py](backend/v1/main.py)
- authentication exists in [backend/v1/routes/auth_route.py](backend/v1/routes/auth_route.py)
- user self-service exists in [backend/v1/routes/user_route.py](backend/v1/routes/user_route.py)
- seller profile and listing submission exist in [backend/v1/routes/seller_route.py](backend/v1/routes/seller_route.py)
- OTP verification and refresh token flow already exist

Frontend state:

- there is a buyer-facing marketing and discovery shell in `frontend-app/app`
- there is an admin dashboard page at [frontend-app/app/dashboard/page.jsx](frontend-app/app/dashboard/page.jsx)
- there is an agent/seller dashboard page at [frontend-app/app/agent/dashboard/page.jsx](frontend-app/app/agent/dashboard/page.jsx)
- the frontend API layer already wraps auth, user, and seller requests in [frontend-app/lib/api.js](frontend-app/lib/api.js)
- the `UserContext` already handles login state and token refresh in [frontend-app/app/context/UserContext.jsx](frontend-app/app/context/UserContext.jsx)

Main gaps:

- no real admin backend APIs yet
- no buyer listing search, filtering, or property detail APIs yet
- escrow, dispute, facility management, and area intelligence are not implemented end-to-end
- seller listing approval is still mostly a submission stub
- many dashboard pages are still placeholder UI rather than backed workflows

## 3. Product Architecture

Build the platform as three role-based workstreams sharing one backend and one source of truth for listings, transactions, and moderation.

### 3.1 Shared platform services

- authentication and role-based authorization
- phone/OTP onboarding
- user profiles
- listing storage and media storage
- audit logs for trust-sensitive actions
- notification delivery for SMS, email, WhatsApp, and push
- transaction tracking for inspections, reservations, and escrow

### 3.2 Buyer experience

- discovery and search
- trust and verification signals
- total cost transparency
- inspection scheduling
- escrow and document checklist
- move-in confirmation
- post-move support requests

### 3.3 Seller and agent experience

- onboarding and KYC submission
- property listing creation
- document upload
- listing verification request
- enquiry and inspection management
- reputation and ranking feedback

### 3.4 Admin experience

- KYC review
- property verification
- area intelligence validation
- fraud monitoring
- listing moderation
- escrow hold and release decisions
- dispute resolution
- analytics and operational reporting

## 4. Recommended Data Model

Create explicit collections or tables for the core business objects below.

### 4.1 User and identity

- `users`
- `buyer_profiles`
- `seller_profiles`
- `admin_profiles`
- `kyc_documents`
- `verification_events`

### 4.2 Listings and media

- `properties`
- `listing_media`
- `listing_documents`
- `listing_verification_requests`
- `listing_reviews`
- `listing_flags`

### 4.3 Search and intelligence

- `area_profiles`
- `area_scores`
- `area_feedback`
- `listing_cost_breakdowns`

### 4.4 Workflow and protection

- `inquiries`
- `inspection_requests`
- `escrow_transactions`
- `disputes`
- `dispute_messages`
- `audit_logs`

### 4.5 Living services

- `service_requests`
- `service_providers`
- `service_assignments`
- `service_ratings`

## 5. Backend Build Plan

### 5.1 Authentication and onboarding

Extend the existing auth flow to support the real product onboarding sequence.

Deliverables:

- phone-first signup and login
- OTP verification for phone and/or email depending on rollout choice
- role-aware account creation for buyer, seller, and admin
- refresh token handling with secure cookies
- optional profile completion after first login

Implementation notes:

- keep the current auth module as the source of truth for session creation
- normalize role handling with a single role enum
- persist whether a profile is verified, pending, or suspended

### 5.2 Buyer APIs

Add buyer-facing endpoints for discovery and protection.

Needed endpoints:

- `GET /properties`
- `GET /properties/{id}`
- `GET /areas/{slug}`
- `POST /properties/{id}/inquiries`
- `POST /properties/{id}/inspection-requests`
- `POST /escrow/transactions`
- `POST /disputes`
- `GET /buyer/dashboard`
- `POST /support/service-requests`

Required response fields:

- rent amount
- agent fee
- legal/agreement fee
- caution/service charge
- total move-in cost
- verification status
- area intelligence fields
- engagement options

### 5.3 Seller and agent APIs

Expand the current seller route into a proper seller lifecycle.

Needed endpoints:

- `POST /seller/profile/kyc`
- `POST /seller/listings`
- `POST /seller/listings/{id}/media`
- `POST /seller/listings/{id}/submit-verification`
- `GET /seller/dashboard/stats`
- `GET /seller/leads`
- `GET /seller/inspections`
- `PATCH /seller/listings/{id}`

Important behaviors:

- reject incomplete KYC submissions
- require mandatory fee disclosure before publication
- mark every new listing as pending review until admin approves it
- store all uploaded media securely and reference them in listing records

### 5.4 Admin APIs

Add a dedicated admin router with authorization checks.

Needed endpoints:

- `GET /admin/dashboard`
- `GET /admin/kyc/pending`
- `POST /admin/kyc/{id}/approve`
- `POST /admin/kyc/{id}/reject`
- `GET /admin/listings/pending`
- `POST /admin/listings/{id}/approve`
- `POST /admin/listings/{id}/reject`
- `POST /admin/listings/{id}/flag`
- `POST /admin/disputes/{id}/resolve`
- `POST /admin/escrow/{id}/hold`
- `POST /admin/escrow/{id}/release`
- `GET /admin/analytics`

Admin permissions should be enforced server-side, not only in the UI.

### 5.5 Workflow protection

Implement state transitions for trust-sensitive actions.

Examples:

- `listing.status` should move through `draft -> pending_review -> verified -> live -> suspended`
- `inspection.status` should move through `requested -> scheduled -> completed -> cancelled`
- `escrow.status` should move through `initiated -> held -> released -> refunded`
- `dispute.status` should move through `open -> under_review -> resolved -> closed`

Every transition should write to an audit log.

### 5.6 Notifications

Wire notification events to the workflow.

Triggers:

- OTP sent
- listing submitted
- listing approved or rejected
- inspection scheduled or confirmed
- escrow funded, held, released, or refunded
- dispute opened or resolved
- service request assigned or closed

Channels:

- email
- SMS
- WhatsApp
- in-app notifications

## 6. Frontend Build Plan

### 6.1 Keep the current app structure, but make it real

The frontend already has role-aware routes and dashboard shells. Finish them instead of replacing them.

Priority pages:

- buyer landing page and search experience
- listing detail page with trust and cost breakdown
- buyer onboarding and OTP verification
- seller onboarding and listing creation
- seller dashboard with lead management
- admin dashboard with moderation queues

### 6.2 Buyer flow

Build these screens:

- sign up or log in with phone number
- OTP verification screen
- profile setup screen with budget and preferred locations
- search results with list and map views
- property detail page with media, fees, and area intelligence
- inspection request and confirmation flow
- escrow explanation and payment confirmation flow
- move-in confirmation and ratings
- post-move service request flow

### 6.3 Seller flow

Build these screens:

- phone or email onboarding
- KYC upload screen
- seller dashboard
- listing creation form
- media upload and proof document upload
- listing submission review screen
- enquiry and inspection management screen

### 6.4 Admin flow

Build these screens:

- admin login gate
- verification queue
- listing moderation queue
- fraud alerts dashboard
- dispute resolution screen
- escrow management screen
- analytics dashboard

### 6.5 Shared UI patterns

Use the same design language across all roles:

- trust badges
- status chips
- clear cost cards
- audit-friendly action timelines
- explicit empty states and loading states
- mobile-first layout with WhatsApp-friendly contact actions

## 7. API Contract Changes Required by the UI

The frontend should not rely on mocked data for business-critical flows.

Standardize API responses for:

- auth
- profile fetch
- listing search
- listing detail
- seller stats
- admin queues
- escrow state
- dispute state

Recommended response shape:

```json
{
  "status": true,
  "message": "string",
  "payload": {},
  "meta": {}
}
```

The UI should treat `payload` as the canonical data source and use `meta` for paging, filtering, and counts.

## 8. Phased Delivery Plan

### Phase 1: MVP trust launch

Goal: get a reliable product live quickly.

Ship:

- phone/OTP onboarding
- buyer search and listing detail pages
- verified listings only
- full cost transparency
- WhatsApp and call fallback
- inspection scheduling
- seller listing submission
- admin verification queue

### Phase 2: Protection and defensibility

Add:

- escrow
- dispute handling
- document checklist
- fraud flags and suspensions
- area intelligence scoring
- ranking and reputation system

### Phase 3: Retention and expansion

Add:

- facility management marketplace
- maintenance and cleaning services
- waste and utility support
- recurring service billing
- advanced analytics
- recommendation and fraud scoring automation

## 9. Acceptance Criteria

The project is complete only when the following are true:

- a buyer can sign up, verify OTP, search, inspect, and save or contact a property
- a seller can submit a listing with documents and see it move through approval
- an admin can review KYC, verify listings, and resolve disputes
- every visible listing shows total move-in cost, not just rent
- WhatsApp and call fallback are available from listing detail pages
- escrow or equivalent protected payment handling is present for inspection and move-in steps
- fraud or dispute events can freeze a transaction and log the reason
- post-move service requests can be created and tracked

## 10. Suggested Implementation Order

1. Formalize the data models and API contracts.
2. Add admin backend routes and authorization checks.
3. Build buyer property search and property detail APIs.
4. Convert seller listing submission into a full listing lifecycle.
5. Wire the frontend buyer, seller, and admin pages to live APIs.
6. Add escrow, dispute, and fraud workflows.
7. Add facility management and post-move services.
8. Harden testing, logging, monitoring, and deployment.

## 11. Engineering Notes

- Keep backend authorization strict and role-based.
- Do not allow UI-only verification for any trust-sensitive workflow.
- Store every moderation and money-moving action in an audit log.
- Keep WhatsApp, call, and offline-first behavior available even when richer app features fail.
- Prefer simple, understandable state machines over hidden business rules.

## 12. Final Delivery Definition

Home Buddy is finished when it is not just a listing site, but a full housing protection platform with:

- verified discovery
- transparent pricing
- protected inspections
- escrow-backed move-in flow
- admin trust operations
- recurring facility support after move-in

That is the product this repository should grow into.