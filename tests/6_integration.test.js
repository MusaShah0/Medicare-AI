/**
 * Integration Testing — MediCare AI
 *
 * Tests interactions between multiple modules working together.
 * Covers the HTTP API layer using Supertest against a lightweight Express app
 * that mirrors the real backend — with an in-memory MongoDB substitute
 * (pure JS state) so no real DB connection is required.
 *
 * Routes tested (matching real backend):
 *   POST /Doctor_Register
 *   POST /Doctor_Login
 *   POST /Patient_Register
 *   POST /Patient_Login
 *   POST /admin/login
 *   GET  /admin/verify  (requires adminToken cookie)
 */

const express     = require('express');
const request     = require('supertest');
const cookieParser = require('cookie-parser');
const jwt         = require('jsonwebtoken');
const bcrypt      = require('bcrypt');

// ── Minimal in-memory stores ──────────────────────────────────────────────────
let doctorStore  = [];
let patientStore = [];

const JWT_SECRET   = 'test_doctor_secret';
const P_JWT_SECRET = 'test_patient_secret';
const ADMIN_SECRET = 'test_admin_secret';
const ADMIN_EMAIL  = 'admin@medicare.com';
const ADMIN_PASS   = '12345678';

// ── Build a minimal Express app that mirrors real routes ──────────────────────
function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  // ── Doctor Register ─────────────────────────────────────────────────────────
  app.post('/Doctor_Register', async (req, res) => {
    const { first_Name, last_Name, email, password, speciality, ph, degrees } = req.body;
    if (!first_Name || !last_Name || !email || !password || !speciality || !ph)
      return res.status(400).json({ success: false, message: 'All fields required.' });
    if (doctorStore.find(d => d.email === email))
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    const hashed = await bcrypt.hash(password, 10);
    const doctor = { _id: `doc_${Date.now()}`, first_Name, last_Name, email, password: hashed, speciality, ph, degrees: degrees || [] };
    doctorStore.push(doctor);
    res.status(201).json({ success: true, message: 'Doctor registered.' });
  });

  // ── Doctor Login ────────────────────────────────────────────────────────────
  app.post('/Doctor_Login', async (req, res) => {
    const { email, password } = req.body;
    const doctor = doctorStore.find(d => d.email === email);
    if (!doctor) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    const match = await bcrypt.compare(password, doctor.password);
    if (!match)  return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    const token = jwt.sign({ id: doctor._id }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('doctorToken', token, { httpOnly: true });
    res.json({ success: true, message: 'Logged in.' });
  });

  // ── Patient Register ────────────────────────────────────────────────────────
  app.post('/Patient_Register', async (req, res) => {
    const { first_Name, last_Name, email, password, age, gender } = req.body;
    if (!first_Name || !last_Name || !email || !password || age == null || !gender)
      return res.status(400).json({ success: false, message: 'All fields required.' });
    if (!['Male','Female','Other'].includes(gender))
      return res.status(400).json({ success: false, message: 'Invalid gender.' });
    if (patientStore.find(p => p.email === email))
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    const hashed = await bcrypt.hash(password, 10);
    const patient = { _id: `pat_${Date.now()}`, first_Name, last_Name, email, password: hashed, age, gender };
    patientStore.push(patient);
    res.status(201).json({ success: true, message: 'Patient registered.' });
  });

  // ── Patient Login ───────────────────────────────────────────────────────────
  app.post('/Patient_Login', async (req, res) => {
    const { email, password } = req.body;
    const patient = patientStore.find(p => p.email === email);
    if (!patient) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    const match = await bcrypt.compare(password, patient.password);
    if (!match)  return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    const token = jwt.sign({ id: patient._id }, P_JWT_SECRET, { expiresIn: '1h' });
    res.cookie('patientToken', token, { httpOnly: true });
    res.json({ success: true, message: 'Logged in.' });
  });

  // ── Admin Login ─────────────────────────────────────────────────────────────
  app.post('/admin/login', (req, res) => {
    const { email, password } = req.body;
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASS)
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    const token = jwt.sign({ role: 'admin', email }, ADMIN_SECRET, { expiresIn: '8h' });
    res.cookie('adminToken', token, { httpOnly: true });
    res.json({ success: true, message: 'Admin authenticated.' });
  });

  // ── Admin Verify ────────────────────────────────────────────────────────────
  app.get('/admin/verify', (req, res) => {
    const token = req.cookies?.adminToken;
    if (!token) return res.status(401).json({ success: false, message: 'No token.' });
    try {
      const payload = jwt.verify(token, ADMIN_SECRET);
      if (payload.role !== 'admin') throw new Error('Not admin');
      res.json({ success: true, admin: payload });
    } catch {
      res.status(401).json({ success: false, message: 'Invalid token.' });
    }
  });

  return app;
}

// ─────────────────────────────────────────────────────────────────────────────

describe('Integration Testing — HTTP API', () => {

  let app;
  beforeAll(() => { app = buildApp(); });
  beforeEach(() => { doctorStore = []; patientStore = []; });

  // ── Doctor Registration + Login ──────────────────────────────────────────
  describe('Doctor Auth Flow', () => {
    const doctorPayload = {
      first_Name: 'Ahmad', last_Name: 'Raza', email: 'ahmad@clinic.com',
      password: 'secureDoc1', speciality: 'Cardiology', ph: '03001234567',
    };

    test('INT-D1 | POST /Doctor_Register with valid data → 201 created', async () => {
      const res = await request(app).post('/Doctor_Register').send(doctorPayload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('INT-D2 | POST /Doctor_Register duplicate email → 409', async () => {
      await request(app).post('/Doctor_Register').send(doctorPayload);
      const res = await request(app).post('/Doctor_Register').send(doctorPayload);
      expect(res.status).toBe(409);
    });

    test('INT-D3 | POST /Doctor_Register missing required field → 400', async () => {
      const { speciality: _s, ...incomplete } = doctorPayload;
      const res = await request(app).post('/Doctor_Register').send(incomplete);
      expect(res.status).toBe(400);
    });

    test('INT-D4 | POST /Doctor_Login correct credentials → 200 + doctorToken cookie', async () => {
      await request(app).post('/Doctor_Register').send(doctorPayload);
      const res = await request(app).post('/Doctor_Login').send({ email: doctorPayload.email, password: doctorPayload.password });
      expect(res.status).toBe(200);
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toMatch(/doctorToken/);
    });

    test('INT-D5 | POST /Doctor_Login wrong password → 401', async () => {
      await request(app).post('/Doctor_Register').send(doctorPayload);
      const res = await request(app).post('/Doctor_Login').send({ email: doctorPayload.email, password: 'wrongpass' });
      expect(res.status).toBe(401);
    });
  });

  // ── Patient Registration + Login ─────────────────────────────────────────
  describe('Patient Auth Flow', () => {
    const patientPayload = {
      first_Name: 'Fatima', last_Name: 'Ali', email: 'fatima@email.com',
      password: 'patient123', age: 28, gender: 'Female',
    };

    test('INT-P1 | POST /Patient_Register valid data → 201', async () => {
      const res = await request(app).post('/Patient_Register').send(patientPayload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('INT-P2 | POST /Patient_Register invalid gender → 400', async () => {
      const res = await request(app).post('/Patient_Register').send({ ...patientPayload, gender: 'alien' });
      expect(res.status).toBe(400);
    });

    test('INT-P3 | POST /Patient_Register duplicate email → 409', async () => {
      await request(app).post('/Patient_Register').send(patientPayload);
      const res = await request(app).post('/Patient_Register').send(patientPayload);
      expect(res.status).toBe(409);
    });

    test('INT-P4 | POST /Patient_Login correct credentials → 200 + patientToken cookie', async () => {
      await request(app).post('/Patient_Register').send(patientPayload);
      const res = await request(app).post('/Patient_Login').send({ email: patientPayload.email, password: patientPayload.password });
      expect(res.status).toBe(200);
      expect(res.headers['set-cookie'][0]).toMatch(/patientToken/);
    });

    test('INT-P5 | POST /Patient_Login unregistered email → 401', async () => {
      const res = await request(app).post('/Patient_Login').send({ email: 'ghost@test.com', password: 'pass1234' });
      expect(res.status).toBe(401);
    });
  });

  // ── Admin Auth Flow ───────────────────────────────────────────────────────
  describe('Admin Auth Flow', () => {
    test('INT-A1 | POST /admin/login correct creds → 200 + adminToken cookie', async () => {
      const res = await request(app).post('/admin/login').send({ email: 'admin@medicare.com', password: '12345678' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.headers['set-cookie'][0]).toMatch(/adminToken/);
    });

    test('INT-A2 | POST /admin/login wrong password → 401', async () => {
      const res = await request(app).post('/admin/login').send({ email: 'admin@medicare.com', password: 'wrong' });
      expect(res.status).toBe(401);
    });

    test('INT-A3 | GET /admin/verify with valid adminToken → 200', async () => {
      const loginRes = await request(app).post('/admin/login').send({ email: 'admin@medicare.com', password: '12345678' });
      const cookie   = loginRes.headers['set-cookie'][0].split(';')[0];
      const res      = await request(app).get('/admin/verify').set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('INT-A4 | GET /admin/verify without cookie → 401', async () => {
      const res = await request(app).get('/admin/verify');
      expect(res.status).toBe(401);
    });

    test('INT-A5 | GET /admin/verify with tampered token → 401', async () => {
      const res = await request(app).get('/admin/verify').set('Cookie', 'adminToken=fake.jwt.token');
      expect(res.status).toBe(401);
    });
  });
});
