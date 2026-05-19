# Home Buddy — Development Plan

Version: 1.0
Created: 2026-04-29

## Overview

This document outlines the technical development plan to build the Home Buddy platform described in `implementation.md`. It splits work into phases, lists deliverables, defines the core data model and API contracts, and lays out testing, security, and deployment steps required to deliver the product.

## Objectives

- Deliver an MVP (Phase 1) that provides phone/OTP onboarding, buyer search, property detail pages, verified listings, inspection scheduling, and a basic admin verification queue.
- Add protection features (Phase 2) including escrow, dispute handling, KYC, and area intelligence.
- Build post-move services, facility management marketplace, and community features (Phase 3).

## Phases & Milestones

Phase 1 — MVP: Core Trust Launch (Months 1–3)
- Implement phone-first auth, OTP flows, and role-aware accounts
- Properties APIs: listing, detail, basic search/filter
- Seller listing submission + admin verification queue
- Inspection request flow + simple scheduling
- Frontend: buyer listing search, property detail, login/OTP screens
- Acceptance: buyer can sign up, verify OTP, search and request inspection; seller can submit listing; admin sees pending queue

Phase 2 — Protection & Defensibility (Months 4–6)
- Escrow transaction model and integration with payment gateway (Paystack/Flutterwave)
- Dispute lifecycle and admin resolution endpoints
- Area intelligence (power score, flood risk, safety) and area profiles
- KYC flow for agents and landlords (NIN, CAC, documents)
- Audit logging for sensitive transitions

Phase 3 — Expansion & Services (Months 7–12)
- Facility management: service requests, vendors, assignments, ratings
- Vendor marketplace and payments for services
- Advanced analytics, fraud detection flags, ranking & reputation
- Community features (forums, roommate finder, referrals)

## Core Deliverables (by layer)

Backend
- API routers: auth, users, properties, sellers, admin, escrow, disputes, areas, inspections, inquiries, services
- Database schemas/collections: users, buyer_profiles, seller_profiles, properties, listing_media, listing_documents, listing_verification_requests, listing_reviews, listing_flags, area_profiles, escrow_transactions, disputes, dispute_messages, inspections, inquiries, audit_logs, service_requests, service_providers
- Role-based authorization middleware and `role` enum
- Audit log middleware to record all trust-sensitive actions
- Media storage service (local + S3-compatible abstraction)

Frontend
- Mobile-first pages and components for buyer, seller, and admin roles
- Role-aware routing and `UserContext` integration with refresh tokens
- Listing search with filters and map/list views
- Property detail page with media carousel, cost breakdown, contact and WhatsApp fallback
- Seller listing submission with KYC and media upload

Infrastructure & DevOps
- Dockerized backend and frontend images
- CI pipeline for linting, tests, and build (GitHub Actions recommended)
- Staging and production environment in AWS/GCP with managed MongoDB (Atlas) or self-hosted cluster
- Monitoring: Sentry (errors), Prometheus + Grafana (metrics), and structured logs

## API Contract Notes

Standard response shape (used across all endpoints):

```json
{
  "status": true,
  "message": "string",
  "payload": {},
  "meta": {}
}
```

Key endpoints (baseline):
- Auth: `POST /auth/signup`, `POST /auth/login`, `POST /auth/otp`, `POST /auth/refresh`
- Properties: `GET /properties`, `GET /properties/{id}`, `POST /properties` (seller), `PATCH /properties/{id}`
- Areas: `GET /areas/{slug}`
- Inquiries: `POST /inquiries`, `GET /seller/leads`
- Inspections: `POST /inspections/request`, `GET /inspections/{id}`
- Escrow: `POST /escrow/transactions`, `GET /escrow/{id}`, `POST /escrow/{id}/hold|release`
- Disputes: `POST /disputes`, `GET /disputes`, `POST /admin/disputes/{id}/resolve`
- Admin: `GET /admin/kyc/pending`, `POST /admin/kyc/{id}/approve|reject`, `GET /admin/listings/pending`, `POST /admin/listings/{id}/approve|reject|flag`

## Data Model (high level)

- users: {_id, phone, email, roles, created_at, is_active}
- buyer_profiles: {user_id, preferences, saved_listings}
- seller_profiles: {user_id, kyc_status, is_verified, houses_sold, level}
- properties: {seller_id, title, description, rent, fees: {agent_fee, legal_fee, caution}, currency, address, coords, amenities, images, status, created_at}
- listing_media: {property_id, url, type, uploaded_at}
- escrow_transactions: {property_id, payer_id, payee_id, amount, status, created_at, updated_at}
- disputes: {transaction_id, reason, status, messages[]}
- area_profiles: {slug, name, scores: {power, flood, safety}, feedback}
- audit_logs: {actor_id, action, resource_type, resource_id, from_state, to_state, data, timestamp}

## Security & Compliance

- Enforce HTTPS in all environments; require TLS for external services
- Store refresh tokens in secure httpOnly cookies (server-side refresh flow exists)
- Enforce role-based checks on admin endpoints server-side
- Rate-limit OTP and sensitive endpoints; lock suspicious accounts
- Encrypt PII at rest where required by local regulations

## Testing Strategy

- Unit tests for services and DB engine (pytest)
- Integration tests for API endpoints (FastAPI TestClient)
- E2E smoke tests on staging using Playwright or Cypress
- Security tests: dependency scanning, SAST, basic pentest checklist

## CI/CD

- GitHub Actions workflows:
  - `lint-and-test`: run linters and unit tests on PRs
  - `build-and-deploy`: build Docker images and push to registry for staging/production
- Blue/green or rolling deploys for safe production releases

## Operational Considerations

- Backups: daily DB backups and weekly snapshot retention policy
- Observability: request traces, error monitoring, and dashboards for key metrics (uptime, API latency, transactions)
- Incident response playbook and runbook for escrow/dispute incidents

## Team & Roles

- Project Manager — delivery and stakeholder coordination
- Mobile/Frontend — React Native or Next.js mobile web + PWA
- Backend — FastAPI, Python; responsible for APIs, business logic, integrations
- QA — automated testing and device testing
- DevOps — CI/CD, infra, monitoring
- Security/Legal — compliance, KYC, contracts

## Estimated Timeline (12 months)

- Months 1–3: Phase 1 (MVP) — auth, properties, listings, basic admin flows
- Months 4–6: Phase 2 — escrow, disputes, KYC, area intelligence, audit logs
- Months 7–9: Facility management, vendor marketplace
- Months 10–12: Community features, analytics, hardening, and launch

## Acceptance Criteria (MVP)

- A buyer can sign up, verify via OTP, search for properties, request inspections, and contact sellers.
- A seller can create a listing with media and submit for admin review.
- An admin can review KYC and approve/reject listings.
- Listings show full move-in cost breakdown (rent + fees).
- Escrow exists in placeholder form and can be integrated with a payment gateway.

## Next Immediate Tasks (first 2 weeks)

1. Formalize API contracts for auth and properties (OpenAPI/Swagger examples).
2. Implement role-based middleware and `audit_log` middleware.
3. Wire `properties` endpoints to `DBStorage` in `backend/v1/database/db_engine.py`.
4. Add media upload endpoint and local storage abstraction.
5. Add unit tests for `DBStorage` methods used by new endpoints.

---

File saved: development_plan.md
