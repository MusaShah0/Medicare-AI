/**
 * Data Flow Testing — MediCare AI
 *
 * Traces variables through definition → use paths for the three core workflows:
 *   1. Appointment booking (Patient books a Schedule slot)
 *   2. Doctor schedule creation
 *   3. Post-call meeting-note lifecycle (processing → complete / failed)
 *
 * Each test represents one def-use path: a variable is defined in one step
 * and its value is consumed (used) by a downstream step. No live DB is needed;
 * we model the state transitions with plain objects.
 */

// ── Appointment Booking Workflow ─────────────────────────────────────────────

function bookAppointment(schedule, patientId, doctorId) {
  if (schedule.status !== 'available') throw new Error('Slot not available');
  const updatedSchedule  = { ...schedule,  status: 'booked' };
  const appointment      = {
    patient_id  : patientId,
    doctor_id   : doctorId,
    sechdule_Id : schedule._id,
    status      : 'booked',
    meeting_id  : null,
  };
  return { updatedSchedule, appointment };
}

function startMeeting(appointment, meetingId) {
  if (appointment.status !== 'booked') throw new Error('Appointment not booked');
  return { ...appointment, status: 'ongoing', meeting_id: meetingId };
}

function completeAppointment(appointment, schedule) {
  if (appointment.status !== 'ongoing') throw new Error('Appointment not ongoing');
  const updatedAppointment = { ...appointment, status: 'completed' };
  const updatedSchedule    = { ...schedule, status: 'completed' };
  return { updatedAppointment, updatedSchedule };
}

// ── Schedule Creation Workflow ────────────────────────────────────────────────

function createSchedule(doctorId, date, startTime, endTime, fee, duration) {
  if (!doctorId || !date || !startTime || !endTime)
    throw new Error('Missing required schedule fields');
  if (fee < 0)
    throw new Error('Fee cannot be negative');
  return {
    _id       : 'sched_001',
    doctor    : doctorId,
    date,
    startTime,
    endTime,
    clinic_fee: fee,
    slotDuration: duration,
    status    : 'available',
  };
}

function cancelSchedule(schedule) {
  if (['completed','cancelled'].includes(schedule.status))
    throw new Error('Cannot cancel a finalised slot');
  return { ...schedule, status: 'cancelled' };
}

// ── Meeting Note Lifecycle ────────────────────────────────────────────────────

function initMeetingNote(appointmentId) {
  return { appointment_id: appointmentId, status: 'processing', transcript: null, summary: null, pdf_path: null };
}

function completeMeetingNote(note, transcript, summary, pdfPath) {
  if (note.status !== 'processing') throw new Error('Note not in processing state');
  return { ...note, status: 'complete', transcript, summary, pdf_path: pdfPath };
}

function failMeetingNote(note, errorMessage) {
  return { ...note, status: 'failed', error_message: errorMessage };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('Data Flow Testing', () => {

  // ── Appointment booking flow ──────────────────────────────────────────────
  describe('Appointment Booking Flow', () => {
    const schedule = { _id: 'sch_1', status: 'available', clinic_fee: 100 };
    const patientId = 'pat_1';
    const doctorId  = 'doc_1';

    test('DF-B1 | schedule.status defined as "available"; used in bookAppointment → appointment created', () => {
      const { updatedSchedule, appointment } = bookAppointment(schedule, patientId, doctorId);
      expect(updatedSchedule.status).toBe('booked');
      expect(appointment.status).toBe('booked');
      expect(appointment.patient_id).toBe(patientId);
    });

    test('DF-B2 | appointment.status defined as "booked"; used in startMeeting → status becomes "ongoing"', () => {
      const { appointment } = bookAppointment(schedule, patientId, doctorId);
      const ongoingAppt = startMeeting(appointment, 'meet_abc123');
      expect(ongoingAppt.status).toBe('ongoing');
      expect(ongoingAppt.meeting_id).toBe('meet_abc123');
    });

    test('DF-B3 | meeting_id defined in startMeeting; carried through to completed appointment', () => {
      const { appointment } = bookAppointment(schedule, patientId, doctorId);
      const ongoingAppt = startMeeting(appointment, 'meet_abc123');
      const { updatedAppointment } = completeAppointment(ongoingAppt, schedule);
      expect(updatedAppointment.meeting_id).toBe('meet_abc123');
      expect(updatedAppointment.status).toBe('completed');
    });

    test('DF-B4 | booking unavailable slot → error propagated correctly', () => {
      const bookedSlot = { ...schedule, status: 'booked' };
      expect(() => bookAppointment(bookedSlot, patientId, doctorId)).toThrow('Slot not available');
    });
  });

  // ── Schedule creation and cancellation flow ───────────────────────────────
  describe('Schedule Creation & Cancellation Flow', () => {
    test('DF-S1 | schedule defined with "available" status; doctor_id flows into schedule object', () => {
      const s = createSchedule('doc_1', '2025-06-01', '09:00', '10:00', 150, 30);
      expect(s.doctor).toBe('doc_1');
      expect(s.status).toBe('available');
      expect(s.clinic_fee).toBe(150);
    });

    test('DF-S2 | schedule.status defined as "available"; cancelSchedule transitions it to "cancelled"', () => {
      const s = createSchedule('doc_1', '2025-06-01', '09:00', '10:00', 150, 30);
      const cancelled = cancelSchedule(s);
      expect(cancelled.status).toBe('cancelled');
    });

    test('DF-S3 | cancelling a completed slot → error; status value is read before action', () => {
      const s = { ...createSchedule('doc_1', '2025-06-01', '09:00', '10:00', 150, 30), status: 'completed' };
      expect(() => cancelSchedule(s)).toThrow('Cannot cancel a finalised slot');
    });

    test('DF-S4 | negative fee defined in input; error thrown before schedule object is created', () => {
      expect(() => createSchedule('doc_1', '2025-06-01', '09:00', '10:00', -10, 30))
        .toThrow('Fee cannot be negative');
    });
  });

  // ── Meeting note lifecycle ────────────────────────────────────────────────
  describe('Meeting Note Lifecycle Flow', () => {
    test('DF-N1 | note defined with "processing" status; transcript/summary are null at init', () => {
      const note = initMeetingNote('appt_1');
      expect(note.status).toBe('processing');
      expect(note.transcript).toBeNull();
    });

    test('DF-N2 | transcript defined in completeMeetingNote; flows into final note object', () => {
      const note     = initMeetingNote('appt_1');
      const completed = completeMeetingNote(note, 'Doctor: ...', 'Summary text', '/pdfs/note.pdf');
      expect(completed.status).toBe('complete');
      expect(completed.transcript).toBe('Doctor: ...');
      expect(completed.pdf_path).toBe('/pdfs/note.pdf');
    });

    test('DF-N3 | error_message defined in failMeetingNote; status transitions to "failed"', () => {
      const note   = initMeetingNote('appt_1');
      const failed  = failMeetingNote(note, 'Transcription timeout');
      expect(failed.status).toBe('failed');
      expect(failed.error_message).toBe('Transcription timeout');
    });

    test('DF-N4 | completing an already-failed note → error', () => {
      const note   = initMeetingNote('appt_1');
      const failed  = failMeetingNote(note, 'Timeout');
      expect(() => completeMeetingNote(failed, 'transcript', 'summary', '/path'))
        .toThrow('Note not in processing state');
    });
  });
});
