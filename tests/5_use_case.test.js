/**
 * Use Case Testing — MediCare AI
 *
 * Tests end-to-end use-case scenarios from the user's perspective using
 * state-machine simulations. No live server or DB required.
 *
 * Use Cases Covered:
 *   UC-1  Patient Registration
 *   UC-2  Doctor Registration
 *   UC-3  Patient Login
 *   UC-4  Doctor Login
 *   UC-5  Book an Appointment
 *   UC-6  Doctor Reschedules → Patient gets rebook token
 *   UC-7  Patient Leaves a Review
 *   UC-8  Admin Removes a Doctor (cascade)
 *   UC-9  Admin Login
 *   UC-10 AI Chat session
 */

// ── Simulated application state ───────────────────────────────────────────────

function registerPatient(db, { first_Name, last_Name, email, password, age, gender }) {
  if (!first_Name || !last_Name || !email || !password || age == null || !gender)
    return { success: false, message: 'All fields are required.' };
  if (password.length < 8)
    return { success: false, message: 'Password too short.' };
  if (!['Male','Female','Other'].includes(gender))
    return { success: false, message: 'Invalid gender.' };
  if (db.patients.find(p => p.email === email))
    return { success: false, message: 'Email already registered.' };
  const patient = { _id: `pat_${Date.now()}`, first_Name, last_Name, email, password, age, gender };
  db.patients.push(patient);
  return { success: true, patient };
}

function registerDoctor(db, { first_Name, last_Name, email, password, speciality, ph, degrees }) {
  if (!first_Name || !last_Name || !email || !password || !speciality || !ph)
    return { success: false, message: 'All fields are required.' };
  if (db.doctors.find(d => d.email === email))
    return { success: false, message: 'Email already registered.' };
  const doctor = { _id: `doc_${Date.now()}`, first_Name, last_Name, email, password, speciality, ph, degrees: degrees || [] };
  db.doctors.push(doctor);
  return { success: true, doctor };
}

function loginUser(db, collection, email, password) {
  const user = db[collection].find(u => u.email === email && u.password === password);
  if (!user) return { success: false, message: 'Invalid credentials.' };
  return { success: true, token: `jwt_${user._id}`, user };
}

function bookAppointment(db, patientId, scheduleId) {
  const schedule = db.schedules.find(s => s._id === scheduleId);
  if (!schedule) return { success: false, message: 'Schedule not found.' };
  if (schedule.status !== 'available') return { success: false, message: 'Slot not available.' };
  schedule.status = 'booked';
  const appt = { _id: `appt_${Date.now()}`, patient_id: patientId, doctor_id: schedule.doctor_id, sechdule_Id: scheduleId, status: 'booked', meeting_id: null, is_rescheduled_token: false };
  db.appointments.push(appt);
  return { success: true, appointment: appt };
}

function doctorReschedule(db, appointmentId) {
  const appt = db.appointments.find(a => a._id === appointmentId);
  if (!appt) return { success: false, message: 'Not found.' };
  appt.status = 'cancelled';
  appt.is_rescheduled_token = true;
  const slot = db.schedules.find(s => s._id === appt.sechdule_Id);
  if (slot) slot.status = 'available';
  return { success: true, token: true };
}

function leaveReview(db, patientId, doctorId, appointmentId, rating, review) {
  const appt = db.appointments.find(a => a._id === appointmentId);
  if (!appt || appt.status !== 'completed') return { success: false, message: 'Appointment not completed.' };
  if (rating < 1 || rating > 5) return { success: false, message: 'Rating must be 1-5.' };
  if (db.reviews.find(r => r.appointment_id === appointmentId)) return { success: false, message: 'Already reviewed.' };
  const r = { _id: `rev_${Date.now()}`, patient_id: patientId, doctor_id: doctorId, appointment_id: appointmentId, rating, review };
  db.reviews.push(r);
  return { success: true, review: r };
}

function adminRemoveDoctor(db, doctorId) {
  const doc = db.doctors.find(d => d._id === doctorId);
  if (!doc) return { success: false, message: 'Doctor not found.' };
  db.doctors    = db.doctors.filter(d => d._id !== doctorId);
  db.schedules  = db.schedules.filter(s => s.doctor_id !== doctorId);
  db.appointments = db.appointments.filter(a => a.doctor_id !== doctorId);
  db.reviews    = db.reviews.filter(r => r.doctor_id !== doctorId);
  return { success: true };
}

function adminLogin(email, password) {
  if (email === 'admin@medicare.com' && password === '12345678')
    return { success: true, token: 'admin_jwt_token' };
  return { success: false, message: 'Invalid admin credentials.' };
}

function aiChat(sessionId, message) {
  if (!message || !message.trim()) return { success: false, message: 'Empty message.' };
  return { success: true, session_id: sessionId, reply: `AI response to: ${message}` };
}

// ── Shared DB fixture ─────────────────────────────────────────────────────────

function freshDb() {
  return {
    patients: [],
    doctors: [
      { _id: 'doc_1', first_Name: 'Sarah', last_Name: 'Jones', email: 'sarah@clinic.com', password: 'pass1234', speciality: 'Cardiology', ph: '03001234567', degrees: ['MBBS'] }
    ],
    schedules: [
      { _id: 'sch_1', doctor_id: 'doc_1', date: '2025-06-10', startTime: '10:00', endTime: '10:30', clinic_fee: 150, status: 'available' }
    ],
    appointments: [
      { _id: 'appt_done', patient_id: 'pat_0', doctor_id: 'doc_1', sechdule_Id: 'sch_x', status: 'completed', meeting_id: 'meet_001', is_rescheduled_token: false }
    ],
    reviews: [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('Use Case Testing', () => {

  let db;
  beforeEach(() => { db = freshDb(); });

  test('UC-1 | Patient registers with valid data → account created', () => {
    const res = registerPatient(db, { first_Name:'Ali', last_Name:'Khan', email:'ali@test.com', password:'secure123', age:30, gender:'Male' });
    expect(res.success).toBe(true);
    expect(db.patients).toHaveLength(1);
  });

  test('UC-1b | Patient registers with duplicate email → rejected', () => {
    registerPatient(db, { first_Name:'Ali', last_Name:'Khan', email:'ali@test.com', password:'secure123', age:30, gender:'Male' });
    const res = registerPatient(db, { first_Name:'Ali2', last_Name:'Khan2', email:'ali@test.com', password:'secure456', age:25, gender:'Male' });
    expect(res.success).toBe(false);
    expect(res.message).toMatch(/already registered/i);
  });

  test('UC-1c | Patient registers with missing fields → rejected', () => {
    const res = registerPatient(db, { first_Name:'Ali', email:'ali@test.com', password:'secure123', age:30, gender:'Male' }); // missing last_Name
    expect(res.success).toBe(false);
  });

  test('UC-2 | Doctor registers with valid data → account created', () => {
    const res = registerDoctor(db, { first_Name:'Omar', last_Name:'Sheikh', email:'omar@hospital.com', password:'docpass1', speciality:'Neurology', ph:'03009876543', degrees:['MBBS','FCPS'] });
    expect(res.success).toBe(true);
    expect(db.doctors).toHaveLength(2);
  });

  test('UC-3 | Patient logs in with correct credentials → token issued', () => {
    registerPatient(db, { first_Name:'Ali', last_Name:'Khan', email:'ali@test.com', password:'secure123', age:30, gender:'Male' });
    const res = loginUser(db, 'patients', 'ali@test.com', 'secure123');
    expect(res.success).toBe(true);
    expect(res.token).toBeTruthy();
  });

  test('UC-3b | Patient logs in with wrong password → rejected', () => {
    registerPatient(db, { first_Name:'Ali', last_Name:'Khan', email:'ali@test.com', password:'secure123', age:30, gender:'Male' });
    const res = loginUser(db, 'patients', 'ali@test.com', 'wrongpass');
    expect(res.success).toBe(false);
  });

  test('UC-4 | Doctor logs in with correct credentials → token issued', () => {
    const res = loginUser(db, 'doctors', 'sarah@clinic.com', 'pass1234');
    expect(res.success).toBe(true);
  });

  test('UC-5 | Patient books an available slot → appointment created, slot becomes booked', () => {
    registerPatient(db, { first_Name:'Ali', last_Name:'Khan', email:'ali@test.com', password:'secure123', age:30, gender:'Male' });
    const res = bookAppointment(db, 'pat_1', 'sch_1');
    expect(res.success).toBe(true);
    expect(res.appointment.status).toBe('booked');
    expect(db.schedules[0].status).toBe('booked');
  });

  test('UC-5b | Patient tries to book an already-booked slot → rejected', () => {
    bookAppointment(db, 'pat_1', 'sch_1');
    const res = bookAppointment(db, 'pat_2', 'sch_1');
    expect(res.success).toBe(false);
    expect(res.message).toMatch(/not available/i);
  });

  test('UC-6 | Doctor reschedules → appointment cancelled and patient gets rebook token', () => {
    const { appointment } = bookAppointment(db, 'pat_1', 'sch_1');
    const res = doctorReschedule(db, appointment._id);
    expect(res.success).toBe(true);
    expect(res.token).toBe(true);
    const appt = db.appointments.find(a => a._id === appointment._id);
    expect(appt.status).toBe('cancelled');
    expect(appt.is_rescheduled_token).toBe(true);
    expect(db.schedules[0].status).toBe('available');
  });

  test('UC-7 | Patient leaves a review on completed appointment → review saved', () => {
    const res = leaveReview(db, 'pat_0', 'doc_1', 'appt_done', 5, 'Excellent doctor!');
    expect(res.success).toBe(true);
    expect(db.reviews).toHaveLength(1);
    expect(res.review.rating).toBe(5);
  });

  test('UC-7b | Duplicate review for same appointment → rejected', () => {
    leaveReview(db, 'pat_0', 'doc_1', 'appt_done', 5, 'Great');
    const res = leaveReview(db, 'pat_0', 'doc_1', 'appt_done', 4, 'Good');
    expect(res.success).toBe(false);
    expect(res.message).toMatch(/already reviewed/i);
  });

  test('UC-7c | Review on non-completed appointment → rejected', () => {
    const { appointment } = bookAppointment(db, 'pat_1', 'sch_1');
    const res = leaveReview(db, 'pat_1', 'doc_1', appointment._id, 4, 'ok');
    expect(res.success).toBe(false);
  });

  test('UC-8 | Admin removes doctor → cascades to schedules, appointments, reviews', () => {
    leaveReview(db, 'pat_0', 'doc_1', 'appt_done', 5, 'Great');
    const res = adminRemoveDoctor(db, 'doc_1');
    expect(res.success).toBe(true);
    expect(db.doctors.find(d => d._id === 'doc_1')).toBeUndefined();
    expect(db.schedules.filter(s => s.doctor_id === 'doc_1')).toHaveLength(0);
    expect(db.reviews.filter(r => r.doctor_id === 'doc_1')).toHaveLength(0);
  });

  test('UC-9 | Admin logs in with correct credentials → token issued', () => {
    const res = adminLogin('admin@medicare.com', '12345678');
    expect(res.success).toBe(true);
    expect(res.token).toBeTruthy();
  });

  test('UC-9b | Admin logs in with wrong password → rejected', () => {
    const res = adminLogin('admin@medicare.com', 'wrongpass');
    expect(res.success).toBe(false);
  });

  test('UC-10 | AI chat with valid message → reply returned with session id', () => {
    const res = aiChat('session_abc', 'I have a headache and fever');
    expect(res.success).toBe(true);
    expect(res.session_id).toBe('session_abc');
    expect(res.reply).toBeTruthy();
  });

  test('UC-10b | AI chat with empty message → rejected', () => {
    const res = aiChat('session_abc', '   ');
    expect(res.success).toBe(false);
  });
});
