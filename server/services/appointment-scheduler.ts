import { db } from '../db';
import { doctorAppointments, patients, notifications } from '../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';

export function startAppointmentScheduler() {
  console.log('[Appointment Scheduler] Starting...');

  const checkAndSendReminders = async () => {
    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const todayStr = now.toISOString().split('T')[0];
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      // Find confirmed appointments in next 24 hours that haven't had reminders sent
      const upcoming = await db
        .select({
          id: doctorAppointments.id,
          doctorTenantId: doctorAppointments.doctorTenantId,
          doctorId: doctorAppointments.doctorId,
          patientId: doctorAppointments.patientId,
          appointmentDate: doctorAppointments.appointmentDate,
          appointmentTime: doctorAppointments.appointmentTime,
        })
        .from(doctorAppointments)
        .where(
          and(
            eq(doctorAppointments.status, 'confirmed'),
            eq(doctorAppointments.reminderSent, false),
            sql`${doctorAppointments.appointmentDate} IN (${todayStr}, ${tomorrowStr})`
          )
        );

      for (const appt of upcoming) {
        // Fetch patient name
        const patientResult = await db
          .select({ name: patients.name, phone: patients.phone })
          .from(patients)
          .where(eq(patients.id, appt.patientId))
          .limit(1);

        const patientName = patientResult[0]?.name || 'Patient';

        // Insert notification for doctor
        await db.insert(notifications).values({
          tenantId: appt.doctorTenantId,
          userId: appt.doctorId,
          type: 'appointment_reminder',
          title: 'Appointment Reminder',
          message: `${patientName} has a confirmed appointment on ${appt.appointmentDate} at ${appt.appointmentTime}`,
          read: false,
        });

        // Mark reminder sent
        await db
          .update(doctorAppointments)
          .set({ reminderSent: true })
          .where(eq(doctorAppointments.id, appt.id));
      }

      if (upcoming.length > 0) {
        console.log(`[Appointment Scheduler] Sent ${upcoming.length} reminders`);
      }
    } catch (err) {
      console.error('[Appointment Scheduler] Error:', err);
    }
  };

  // Run immediately, then every hour
  checkAndSendReminders();
  setInterval(checkAndSendReminders, 60 * 60 * 1000);
}
