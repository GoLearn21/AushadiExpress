import { Router } from 'express';
import { db } from '../db';
import {
  patients,
  doctorAppointments,
  doctorPrescriptions,
  labTestRequests,
  users,
  notifications,
} from '../../shared/schema';
import { eq, and, desc, count, sql, gte, lte, ilike, or } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

const requireDoctor = async (req: any, res: any, next: any) => {
  const session = req.session;
  if (!session?.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const user = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user[0] || user[0].role !== 'doctor') {
    return res.status(403).json({ error: 'Access denied. Doctor role required.' });
  }
  req.user = user[0];
  next();
};

router.use(requireDoctor);

// GET /dashboard
router.get('/dashboard', async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const todayStr = new Date().toISOString().split('T')[0];

    // Count patients seen today (appointments today, not cancelled)
    const [patientsToday] = await db
      .select({ value: count() })
      .from(doctorAppointments)
      .where(
        and(
          eq(doctorAppointments.doctorTenantId, tenantId),
          eq(doctorAppointments.appointmentDate, todayStr),
          sql`${doctorAppointments.status} != 'cancelled'`
        )
      );

    // Count pending appointments
    const [pendingAppointments] = await db
      .select({ value: count() })
      .from(doctorAppointments)
      .where(
        and(
          eq(doctorAppointments.doctorTenantId, tenantId),
          eq(doctorAppointments.status, 'scheduled')
        )
      );

    // Count confirmed appointments
    const [confirmedAppointments] = await db
      .select({ value: count() })
      .from(doctorAppointments)
      .where(
        and(
          eq(doctorAppointments.doctorTenantId, tenantId),
          eq(doctorAppointments.status, 'confirmed')
        )
      );

    // Count prescriptions issued
    const [prescriptionsIssued] = await db
      .select({ value: count() })
      .from(doctorPrescriptions)
      .where(
        and(
          eq(doctorPrescriptions.doctorTenantId, tenantId),
          eq(doctorPrescriptions.status, 'issued')
        )
      );

    res.json({
      patientsToday: patientsToday.value,
      pendingAppointments: pendingAppointments.value,
      prescriptionsIssued: prescriptionsIssued.value,
      confirmedAppointments: confirmedAppointments.value,
    });
  } catch (error) {
    console.error('[DOCTOR] Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// GET /patients
router.get('/patients', async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const search = req.query.search as string | undefined;

    let query = db
      .select()
      .from(patients)
      .where(eq(patients.doctorTenantId, tenantId));

    if (search) {
      query = db
        .select()
        .from(patients)
        .where(
          and(
            eq(patients.doctorTenantId, tenantId),
            or(
              ilike(patients.name, `%${search}%`),
              ilike(patients.phone, `%${search}%`)
            )
          )
        );
    }

    const result = await query;
    res.json(result);
  } catch (error) {
    console.error('[DOCTOR] List patients error:', error);
    res.status(500).json({ error: 'Failed to list patients' });
  }
});

// POST /patients
router.post('/patients', async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const body = req.body;

    const [patient] = await db.insert(patients).values({
      doctorTenantId: tenantId,
      name: body.name,
      phone: body.phone || null,
      age: body.age || null,
      gender: body.gender || null,
      bloodGroup: body.bloodGroup || null,
      allergies: body.allergies || null,
      medicalHistory: body.medicalHistory || null,
    }).returning();

    res.status(201).json(patient);
  } catch (error) {
    console.error('[DOCTOR] Create patient error:', error);
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

// GET /patients/:id
router.get('/patients/:id', async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const patientId = req.params.id;

    const [patient] = await db
      .select()
      .from(patients)
      .where(and(eq(patients.id, patientId), eq(patients.doctorTenantId, tenantId)))
      .limit(1);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const appointments = await db
      .select()
      .from(doctorAppointments)
      .where(
        and(
          eq(doctorAppointments.patientId, patientId),
          eq(doctorAppointments.doctorTenantId, tenantId)
        )
      )
      .orderBy(desc(doctorAppointments.createdAt));

    const prescriptions = await db
      .select()
      .from(doctorPrescriptions)
      .where(
        and(
          eq(doctorPrescriptions.patientId, patientId),
          eq(doctorPrescriptions.doctorTenantId, tenantId)
        )
      )
      .orderBy(desc(doctorPrescriptions.createdAt));

    res.json({ ...patient, appointments, prescriptions });
  } catch (error) {
    console.error('[DOCTOR] Get patient error:', error);
    res.status(500).json({ error: 'Failed to get patient' });
  }
});

// GET /appointments
router.get('/appointments', async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const date = req.query.date as string | undefined;
    const status = req.query.status as string | undefined;

    const conditions = [eq(doctorAppointments.doctorTenantId, tenantId)];

    if (date) {
      conditions.push(eq(doctorAppointments.appointmentDate, date));
    }
    if (status) {
      conditions.push(eq(doctorAppointments.status, status));
    }

    const result = await db
      .select({
        id: doctorAppointments.id,
        doctorTenantId: doctorAppointments.doctorTenantId,
        doctorId: doctorAppointments.doctorId,
        patientId: doctorAppointments.patientId,
        appointmentDate: doctorAppointments.appointmentDate,
        appointmentTime: doctorAppointments.appointmentTime,
        durationMinutes: doctorAppointments.durationMinutes,
        status: doctorAppointments.status,
        notes: doctorAppointments.notes,
        reminderSent: doctorAppointments.reminderSent,
        createdAt: doctorAppointments.createdAt,
        updatedAt: doctorAppointments.updatedAt,
        patientName: patients.name,
        patientPhone: patients.phone,
      })
      .from(doctorAppointments)
      .leftJoin(patients, eq(doctorAppointments.patientId, patients.id))
      .where(and(...conditions))
      .orderBy(doctorAppointments.appointmentDate, doctorAppointments.appointmentTime);

    res.json(result);
  } catch (error) {
    console.error('[DOCTOR] List appointments error:', error);
    res.status(500).json({ error: 'Failed to list appointments' });
  }
});

// POST /appointments
router.post('/appointments', async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    const body = req.body;

    const [appointment] = await db.insert(doctorAppointments).values({
      doctorTenantId: tenantId,
      doctorId: userId,
      patientId: body.patientId,
      appointmentDate: body.appointmentDate,
      appointmentTime: body.appointmentTime,
      durationMinutes: body.durationMinutes || 15,
      notes: body.notes || null,
    }).returning();

    res.status(201).json(appointment);
  } catch (error) {
    console.error('[DOCTOR] Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// PATCH /appointments/:id
router.patch('/appointments/:id', async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const appointmentId = req.params.id;
    const body = req.body;

    // Verify ownership
    const [existing] = await db
      .select()
      .from(doctorAppointments)
      .where(
        and(
          eq(doctorAppointments.id, appointmentId),
          eq(doctorAppointments.doctorTenantId, tenantId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (body.status) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const [updated] = await db
      .update(doctorAppointments)
      .set(updateData)
      .where(eq(doctorAppointments.id, appointmentId))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('[DOCTOR] Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// GET /prescriptions
router.get('/prescriptions', async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;

    const result = await db
      .select({
        id: doctorPrescriptions.id,
        doctorTenantId: doctorPrescriptions.doctorTenantId,
        doctorId: doctorPrescriptions.doctorId,
        patientId: doctorPrescriptions.patientId,
        appointmentId: doctorPrescriptions.appointmentId,
        medicines: doctorPrescriptions.medicines,
        diagnosis: doctorPrescriptions.diagnosis,
        notes: doctorPrescriptions.notes,
        status: doctorPrescriptions.status,
        createdAt: doctorPrescriptions.createdAt,
        updatedAt: doctorPrescriptions.updatedAt,
        patientName: patients.name,
      })
      .from(doctorPrescriptions)
      .leftJoin(patients, eq(doctorPrescriptions.patientId, patients.id))
      .where(eq(doctorPrescriptions.doctorTenantId, tenantId))
      .orderBy(desc(doctorPrescriptions.createdAt));

    res.json(result);
  } catch (error) {
    console.error('[DOCTOR] List prescriptions error:', error);
    res.status(500).json({ error: 'Failed to list prescriptions' });
  }
});

// POST /prescriptions
router.post('/prescriptions', async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    const body = req.body;

    const [prescription] = await db.insert(doctorPrescriptions).values({
      doctorTenantId: tenantId,
      doctorId: userId,
      patientId: body.patientId,
      appointmentId: body.appointmentId || null,
      medicines: body.medicines || null,
      diagnosis: body.diagnosis || null,
      notes: body.notes || null,
      status: body.status || 'draft',
    }).returning();

    res.status(201).json(prescription);
  } catch (error) {
    console.error('[DOCTOR] Create prescription error:', error);
    res.status(500).json({ error: 'Failed to create prescription' });
  }
});

// GET /prescriptions/:id
router.get('/prescriptions/:id', async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const prescriptionId = req.params.id;

    const [prescription] = await db
      .select()
      .from(doctorPrescriptions)
      .where(
        and(
          eq(doctorPrescriptions.id, prescriptionId),
          eq(doctorPrescriptions.doctorTenantId, tenantId)
        )
      )
      .limit(1);

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    console.error('[DOCTOR] Get prescription error:', error);
    res.status(500).json({ error: 'Failed to get prescription' });
  }
});

// POST /lab-requests
router.post('/lab-requests', async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    const body = req.body;

    const [labRequest] = await db.insert(labTestRequests).values({
      doctorTenantId: tenantId,
      doctorId: userId,
      patientId: body.patientId,
      prescriptionId: body.prescriptionId || null,
      tests: body.tests || null,
      notes: body.notes || null,
      labTenantId: body.labTenantId || null,
    }).returning();

    res.status(201).json(labRequest);
  } catch (error) {
    console.error('[DOCTOR] Create lab request error:', error);
    res.status(500).json({ error: 'Failed to create lab request' });
  }
});

// GET /lab-requests
router.get('/lab-requests', async (req: any, res) => {
  try {
    const tenantId = req.user.tenantId;

    const result = await db
      .select({
        id: labTestRequests.id,
        labTenantId: labTestRequests.labTenantId,
        doctorTenantId: labTestRequests.doctorTenantId,
        doctorId: labTestRequests.doctorId,
        patientId: labTestRequests.patientId,
        prescriptionId: labTestRequests.prescriptionId,
        tests: labTestRequests.tests,
        status: labTestRequests.status,
        notes: labTestRequests.notes,
        rejectionReason: labTestRequests.rejectionReason,
        collectionDate: labTestRequests.collectionDate,
        createdAt: labTestRequests.createdAt,
        updatedAt: labTestRequests.updatedAt,
        patientName: patients.name,
      })
      .from(labTestRequests)
      .leftJoin(patients, eq(labTestRequests.patientId, patients.id))
      .where(eq(labTestRequests.doctorTenantId, tenantId))
      .orderBy(desc(labTestRequests.createdAt));

    res.json(result);
  } catch (error) {
    console.error('[DOCTOR] List lab requests error:', error);
    res.status(500).json({ error: 'Failed to list lab requests' });
  }
});

export default router;
