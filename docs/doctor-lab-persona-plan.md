 # Doctor & Lab Personas — Feature Plan

## Context
AushadiExpress currently supports three roles (customer, retailer, wholesaler). This plan expands the platform into a full medical ecosystem by adding **Doctor** and **Lab** personas, creating end-to-end flows:
- Doctor → Prescribes → Patient → Fulfills at Pharmacy
- Doctor → Orders lab test → Lab → Reports results back to Doctor

**Doctor features:** Patient management, appointment scheduling, prescription writing (patient-mediated flow to pharmacy), lab test ordering, view lab results, + background appointment reminder scheduler.
**Lab features:** Test catalog, receive/accept test requests, enter & share results, revenue analytics.
**Registration:** Minimal (like Retailer) — name, clinic/lab name, specialization, contact phone.

---

## Phase 1 — Database Schema (`shared/schema.ts` + migration)

### New role values
Add `'doctor'` and `'lab'` to the role field comment (text field, no enum):
```typescript
role: text("role").default("retailer"), // customer, retailer, wholesaler, doctor, lab
```

### New tables to add to `shared/schema.ts`

**`patients`** (doctor-scoped patient registry)
```
id, doctorTenantId, name, phone, age, gender, bloodGroup,
allergies (text[]), medicalHistory, createdAt, updatedAt
```

**`doctorAppointments`**
```
id, doctorTenantId, doctorId, patientId,
appointmentDate (date), appointmentTime (text), durationMinutes,
status: 'scheduled'|'confirmed'|'visited'|'cancelled'|'no_show',
notes, reminderSent (boolean, default false), createdAt, updatedAt
```

**`doctorPrescriptions`** (new table; the existing `prescriptions` table is minimal — only imgId/patient)
```
id, doctorTenantId, doctorId, patientId, appointmentId (nullable),
medicines: jsonb ([{name, dosage, frequency, duration, instructions}]),
diagnosis, notes,
status: 'draft'|'issued'|'fulfilled',
createdAt, updatedAt
```

**`labTests`** (lab's test catalog)
```
id, labTenantId, testName, description, sampleType,
processingTimeHours, price, isActive, createdAt, updatedAt
```

**`labTestRequests`** (doctor → lab)
```
id, labTenantId, doctorTenantId, doctorId, patientId, prescriptionId (nullable),
tests: jsonb ([{labTestId, testName}]),
status: 'pending'|'accepted'|'sample_collected'|'processing'|'completed'|'rejected'|'cancelled',
notes, rejectionReason, collectionDate, createdAt, updatedAt
```

**`labResults`** (results per test within a request)
```
id, requestId, labTestId, testName, resultValue,
referenceRange, unit, isAbnormal (boolean), notes, reportedAt
```

### Migration file
Create `migrations/003_doctor_lab_schema.sql` following the existing pattern (UUIDs via `gen_random_uuid()`, `DEFAULT now()`, `jsonb` for arrays-of-objects).

---

## Phase 2 — Auth & Registration

### `server/routes/auth.ts`
- Add `'doctor'` and `'lab'` to the role Zod enum (currently line 12).
- Add registration branch for `doctor`: requires `username` (doctor name), `tenantName` (clinic name), `specialization`, `contactPhone`. Sets `onboarded: true`.
- Add registration branch for `lab`: requires `username` (lab manager name), `tenantName` (lab name), `labType` (diagnostic/pathology/etc.), `contactPhone`. Sets `onboarded: true`.

### `client/src/components/setup-wizard.tsx`
- Add two new role cards in the role selection step:
  - **Doctor** — "Manage patients & write prescriptions"
  - **Lab** — "Manage tests, samples & reports"
- Add registration form fields specific to each role (specialization for doctor; lab type for lab).

---

## Phase 3 — Server Routes

### `server/routes/doctor.ts` (new file)
Pattern: mirror `server/routes/wholesaler.ts` — define `requireDoctor` middleware, export Express Router.

Key endpoints:
```
GET    /api/doctor/dashboard          – stats (patients today, pending appointments, prescriptions issued)
GET    /api/doctor/patients           – list patients (search by name/phone)
POST   /api/doctor/patients           – register new patient
GET    /api/doctor/patients/:id       – patient detail + history
GET    /api/doctor/appointments       – list (filter by date/status)
POST   /api/doctor/appointments       – create appointment
PATCH  /api/doctor/appointments/:id   – update status (confirm/visited/cancel)
GET    /api/doctor/prescriptions      – list prescriptions
POST   /api/doctor/prescriptions      – create prescription
GET    /api/doctor/prescriptions/:id  – single prescription (for patient to view)
POST   /api/doctor/lab-requests       – create lab test request → routed to lab
GET    /api/doctor/lab-requests       – view sent lab requests + results
GET    /api/doctor/labs               – search registered labs by pincode/city
```

### `server/routes/lab.ts` (new file)
Pattern: mirror `server/routes/wholesaler.ts`.

Key endpoints:
```
GET    /api/lab/dashboard             – stats (pending requests, completed today, revenue)
GET    /api/lab/tests                 – test catalog
POST   /api/lab/tests                 – add test
PATCH  /api/lab/tests/:id             – update test (price, active status)
GET    /api/lab/requests              – incoming test requests (filter by status)
PATCH  /api/lab/requests/:id          – accept/reject/update status
POST   /api/lab/requests/:id/results  – enter test results
GET    /api/lab/analytics             – revenue, volume trends
```

### `server/index.ts`
Register new routes (after existing route registrations):
```typescript
import doctorRoutes from "./routes/doctor";
import labRoutes from "./routes/lab";
// ...
app.use('/api/doctor', doctorRoutes);
app.use('/api/lab', labRoutes);
```

### Patient-facing prescription endpoint
```
GET /api/prescriptions/my   – patient sees prescriptions issued to them (lookup by phone)
```
Add to `server/routes.ts` or as a new file.

---

## Phase 4 — Appointment Reminder Scheduler

### `server/services/appointment-scheduler.ts` (new file)
Background service using `setInterval` — mirrors the `monitorOrderTimeouts()` pattern in `server/services/oms-agent.ts`. Runs every hour.

**Logic:**
1. Query `doctorAppointments` where:
   - `status = 'confirmed'`
   - `reminderSent = false`
   - `appointmentDate` is within the next 24 hours
2. For each appointment: fetch patient's phone → insert a record into the `notifications` table for the doctor
3. Mark `reminderSent = true`

Hook into `server/index.ts` startup. Doctor dashboard should surface patients with confirmed appointments who haven't visited yet.

> SMS/call integration is a Phase 2 enhancement. Phase 1 uses in-app notifications only.

---

## Phase 5 — Client Pages

### `client/src/pages/doctor/` (new folder, 8 files)

| File | Purpose |
|------|---------|
| `dashboard.tsx` | Stats cards + today's appointment list + pending lab results |
| `patients.tsx` | Searchable patient list + "Add Patient" button |
| `patient-detail.tsx` | Full patient profile + prescription history + past lab results |
| `appointments.tsx` | Calendar/list view; status chips; confirm/cancel actions |
| `prescription-new.tsx` | Prescription form — patient picker, medicine rows (name/dosage/frequency/duration), diagnosis |
| `prescriptions.tsx` | List of issued prescriptions with status (draft/issued/fulfilled) |
| `lab-requests.tsx` | Request a lab test (pick lab + patient + tests from catalog); view sent requests |
| `lab-results.tsx` | View completed lab reports (results table per test) |

### `client/src/pages/lab/` (new folder, 5 files)

| File | Purpose |
|------|---------|
| `dashboard.tsx` | Stats (pending/completed today, revenue) + incoming request list |
| `test-catalog.tsx` | CRUD for test list (name, price, sample type, processing time) |
| `test-requests.tsx` | Incoming requests by status; accept/reject; update to sample_collected/processing/completed |
| `results-entry.tsx` | Enter results per test (value, unit, reference range, abnormal flag) |
| `analytics.tsx` | Revenue chart (Recharts), top tests, collection summary |

### `client/src/App.tsx`
Add route groups (following existing Wouter patterns):
```typescript
// Doctor routes
<Route path="/doctor" component={DoctorDashboard} />
<Route path="/doctor/patients" component={DoctorPatientsPage} />
<Route path="/doctor/patients/:id" component={PatientDetailPage} />
<Route path="/doctor/appointments" component={AppointmentsPage} />
<Route path="/doctor/prescriptions" component={PrescriptionsPage} />
<Route path="/doctor/prescriptions/new" component={PrescriptionNewPage} />
<Route path="/doctor/lab-requests" component={LabRequestsPage} />
<Route path="/doctor/lab-results" component={LabResultsPage} />

// Lab routes
<Route path="/lab" component={LabDashboard} />
<Route path="/lab/tests" component={LabTestCatalogPage} />
<Route path="/lab/requests" component={LabTestRequestsPage} />
<Route path="/lab/results/:requestId" component={ResultsEntryPage} />
<Route path="/lab/analytics" component={LabAnalyticsPage} />
```

### `client/src/components/bottom-navigation.tsx`
Add two new cases to the role switch:

**Doctor nav:** Home → `/doctor` | Patients → `/doctor/patients` | Calendar → `/doctor/appointments` | Labs → `/doctor/lab-requests` | Settings

**Lab nav:** Home → `/lab` | Requests → `/lab/requests` | Catalog → `/lab/tests` | Analytics → `/lab/analytics` | Settings

---

## Summary: Files to Change

### Modify existing files
| File | Change |
|------|--------|
| `shared/schema.ts` | Add 6 new tables + Zod insert schemas |
| `server/routes/auth.ts` | Add doctor/lab to role enum + registration branches |
| `server/index.ts` | Import + mount doctor/lab routes; start scheduler |
| `client/src/App.tsx` | Import + register 13 new routes |
| `client/src/components/setup-wizard.tsx` | Add Doctor/Lab role cards + form fields |
| `client/src/components/bottom-navigation.tsx` | Add doctor/lab nav cases |

### Create new files
| File | Type |
|------|------|
| `migrations/003_doctor_lab_schema.sql` | SQL migration |
| `server/routes/doctor.ts` | Server routes |
| `server/routes/lab.ts` | Server routes |
| `server/services/appointment-scheduler.ts` | Background scheduler |
| `client/src/pages/doctor/dashboard.tsx` | React page |
| `client/src/pages/doctor/patients.tsx` | React page |
| `client/src/pages/doctor/patient-detail.tsx` | React page |
| `client/src/pages/doctor/appointments.tsx` | React page |
| `client/src/pages/doctor/prescription-new.tsx` | React page |
| `client/src/pages/doctor/prescriptions.tsx` | React page |
| `client/src/pages/doctor/lab-requests.tsx` | React page |
| `client/src/pages/doctor/lab-results.tsx` | React page |
| `client/src/pages/lab/dashboard.tsx` | React page |
| `client/src/pages/lab/test-catalog.tsx` | React page |
| `client/src/pages/lab/test-requests.tsx` | React page |
| `client/src/pages/lab/results-entry.tsx` | React page |
| `client/src/pages/lab/analytics.tsx` | React page |

---

## Reused Patterns & Utilities

| Pattern | Source to Mirror |
|---------|-----------------|
| Role middleware (`requireDoctor`, `requireLab`) | `server/routes/wholesaler.ts` → `requireWholesaler` |
| Notifications insert | `server/services/oms-agent.ts` |
| Background scheduler | `monitorOrderTimeouts()` in `server/services/oms-agent.ts` |
| Analytics charts | `client/src/pages/wholesaler/analytics.tsx` (Recharts) |
| Page structure | `client/src/pages/wholesaler/dashboard.tsx` (AppHeader + Card/Badge/Button + fetch) |
| Schema table definitions | `wholesalerProducts` / `wholesalerOrders` in `shared/schema.ts` |

---

## Verification Checklist

- [ ] Register as Doctor → `users.role = 'doctor'` in DB
- [ ] Register as Lab → `users.role = 'lab'` in DB
- [ ] Doctor login → correct bottom nav items shown
- [ ] Lab login → correct bottom nav items shown
- [ ] Create patient → appears in list → detail page loads
- [ ] Create appointment → mark confirmed → scheduler sets `reminderSent = true` → notification created
- [ ] Doctor creates prescription → patient (customer with same phone) sees it
- [ ] Doctor sends lab request → Lab login sees it → enter results → Doctor sees results
- [ ] Direct navigation to `/doctor` as retailer does not show doctor-only data
- [ ] `npm run test:e2e` — no regressions in auth/POS/inventory/customer specs
