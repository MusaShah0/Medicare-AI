/**
 * Performance Testing — MediCare AI
 *
 * Measures execution time of critical operations under realistic load.
 * All tests run in-process (no network latency) to isolate algorithmic
 * performance from infrastructure noise.
 *
 * Thresholds are conservative and achievable on any modern machine.
 */

const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');

const JWT_SECRET = 'perf_test_secret';

// ── Helpers ───────────────────────────────────────────────────────────────────
const elapsed = async (fn) => {
  const start = Date.now();
  await fn();
  return Date.now() - start;
};

// Simulate a filtered appointment search across N records
function searchAppointments(records, query) {
  const q = query.toLowerCase();
  return records.filter(r =>
    r.doctorName.toLowerCase().includes(q) ||
    r.patientName.toLowerCase().includes(q)
  );
}

// Simulate building stats from appointment records
function computeStats(records) {
  const counts = { booked: 0, ongoing: 0, completed: 0, cancelled: 0 };
  records.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });
  return counts;
}

// Generate N synthetic appointment records
function generateRecords(n) {
  const statuses = ['booked','ongoing','completed','cancelled'];
  return Array.from({ length: n }, (_, i) => ({
    _id        : `appt_${i}`,
    doctorName : `Dr Doctor${i % 100}`,
    patientName: `Patient${i % 200}`,
    status     : statuses[i % 4],
    fee        : 100 + (i % 200),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────

describe('Performance Testing', () => {

  // ── JWT operations ────────────────────────────────────────────────────────
  describe('JWT Sign & Verify', () => {
    test('PERF-J1 | Sign 1 000 tokens < 8 000 ms', async () => {
      const ms = await elapsed(() => {
        for (let i = 0; i < 1000; i++)
          jwt.sign({ id: `user_${i}`, role: 'patient' }, JWT_SECRET, { expiresIn: '1h' });
      });
      console.log(`  ✦ 1 000 JWT signs: ${ms} ms`);
      expect(ms).toBeLessThan(8000);
    });

    test('PERF-J2 | Verify 1 000 tokens < 8 000 ms', async () => {
      const tokens = Array.from({ length: 1000 }, (_, i) =>
        jwt.sign({ id: `user_${i}` }, JWT_SECRET, { expiresIn: '1h' })
      );
      const ms = await elapsed(() => {
        tokens.forEach(t => jwt.verify(t, JWT_SECRET));
      });
      console.log(`  ✦ 1 000 JWT verifications: ${ms} ms`);
      expect(ms).toBeLessThan(8000);
    });
  });

  // ── bcrypt (single hash — intentionally slower) ───────────────────────────
  describe('Password Hashing (bcrypt cost 10)', () => {
    test('PERF-B1 | Single bcrypt hash < 500 ms', async () => {
      const ms = await elapsed(async () => {
        await require('bcrypt').hash('TestPassword1!', 10);
      });
      console.log(`  ✦ bcrypt hash (cost 10): ${ms} ms`);
      expect(ms).toBeLessThan(500);
    });
  });

  // ── In-memory search ──────────────────────────────────────────────────────
  describe('Appointment Search (in-memory)', () => {
    test('PERF-S1 | Search 10 000 records by name < 20 ms', async () => {
      const records = generateRecords(10000);
      const ms = await elapsed(() => searchAppointments(records, 'Doctor42'));
      console.log(`  ✦ Search 10 000 records: ${ms} ms`);
      expect(ms).toBeLessThan(20);
    });

    test('PERF-S2 | Search 50 000 records < 100 ms', async () => {
      const records = generateRecords(50000);
      const ms = await elapsed(() => searchAppointments(records, 'Patient10'));
      console.log(`  ✦ Search 50 000 records: ${ms} ms`);
      expect(ms).toBeLessThan(100);
    });
  });

  // ── Stats computation ─────────────────────────────────────────────────────
  describe('Stats Aggregation (in-memory)', () => {
    test('PERF-A1 | Aggregate 100 000 records < 50 ms', async () => {
      const records = generateRecords(100000);
      const ms = await elapsed(() => computeStats(records));
      const stats = computeStats(records);
      console.log(`  ✦ Aggregate 100 000 records: ${ms} ms → ${JSON.stringify(stats)}`);
      expect(ms).toBeLessThan(50);
    });
  });

  // ── Concurrent token generation (event-loop throughput) ───────────────────
  describe('Concurrent Operations', () => {
    test('PERF-C1 | 500 concurrent JWT sign-then-verify < 8 000 ms', async () => {
      const ms = await elapsed(async () => {
        await Promise.all(
          Array.from({ length: 500 }, async (_, i) => {
            const t = jwt.sign({ id: i }, JWT_SECRET, { expiresIn: '1h' });
            jwt.verify(t, JWT_SECRET);
          })
        );
      });
      console.log(`  ✦ 500 concurrent sign+verify: ${ms} ms`);
      expect(ms).toBeLessThan(8000);
    });
  });

  // ── Schedule slot generation ──────────────────────────────────────────────
  describe('Schedule Slot Generation', () => {
    function generateSlots(startHour, endHour, durationMin) {
      const slots = [];
      let current = startHour * 60;
      const end   = endHour   * 60;
      while (current + durationMin <= end) {
        const sh = String(Math.floor(current / 60)).padStart(2, '0');
        const sm = String(current % 60).padStart(2, '0');
        const eh = String(Math.floor((current + durationMin) / 60)).padStart(2, '0');
        const em = String((current + durationMin) % 60).padStart(2, '0');
        slots.push({ start: `${sh}:${sm}`, end: `${eh}:${em}` });
        current += durationMin;
      }
      return slots;
    }

    test('PERF-G1 | Generate 1-hour slots for 365 days (15-min each) < 500 ms', async () => {
      const ms = await elapsed(() => {
        for (let d = 0; d < 365; d++) generateSlots(9, 17, 15);
      });
      console.log(`  ✦ 365 × 32 slot generations: ${ms} ms`);
      expect(ms).toBeLessThan(500);
    });
  });
});
