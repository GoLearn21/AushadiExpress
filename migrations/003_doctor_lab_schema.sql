-- Migration: Add Doctor persona support
-- Adds patients, doctor_appointments, doctor_prescriptions, lab_test_requests tables

CREATE TABLE IF NOT EXISTS "patients" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "doctor_tenant_id" varchar NOT NULL,
  "name" text NOT NULL,
  "phone" varchar(15),
  "age" integer,
  "gender" text,
  "blood_group" text,
  "allergies" text[],
  "medical_history" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "doctor_appointments" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "doctor_tenant_id" varchar NOT NULL,
  "doctor_id" varchar NOT NULL,
  "patient_id" varchar NOT NULL REFERENCES "patients"("id"),
  "appointment_date" text NOT NULL,
  "appointment_time" text NOT NULL,
  "duration_minutes" integer DEFAULT 15,
  "status" text DEFAULT 'scheduled',
  "notes" text,
  "reminder_sent" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "doctor_prescriptions" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "doctor_tenant_id" varchar NOT NULL,
  "doctor_id" varchar NOT NULL,
  "patient_id" varchar NOT NULL REFERENCES "patients"("id"),
  "appointment_id" varchar REFERENCES "doctor_appointments"("id"),
  "medicines" jsonb,
  "diagnosis" text,
  "notes" text,
  "status" text DEFAULT 'draft',
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "lab_test_requests" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "lab_tenant_id" varchar,
  "doctor_tenant_id" varchar NOT NULL,
  "doctor_id" varchar NOT NULL,
  "patient_id" varchar NOT NULL REFERENCES "patients"("id"),
  "prescription_id" varchar REFERENCES "doctor_prescriptions"("id"),
  "tests" jsonb,
  "status" text DEFAULT 'pending',
  "notes" text,
  "rejection_reason" text,
  "collection_date" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
