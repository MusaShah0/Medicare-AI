/**
 * Unit Testing — MediCare AI
 * Tests pure logic functions in isolation (no DB, no network).
 */

// ── Input sanitisation helper (mirrors backend logic) ───────────────────────
function sanitiseEmail(email) {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

// ── Age validation (Patient model: min 0, max 120) ──────────────────────────
function validateAge(age) {
  const n = Number(age);
  if (!Number.isFinite(n)) return false;
  return n >= 0 && n <= 120;
}

// ── Rating validation (Review model: 1-5) ───────────────────────────────────
function validateRating(rating) {
  const n = Number(rating);
  return Number.isInteger(n) && n >= 1 && n <= 5;
}

// ── Schedule status transitions ──────────────────────────────────────────────
const VALID_TRANSITIONS = {
  available : ['booked'],
  booked    : ['ongoing', 'cancelled'],
  ongoing   : ['completed', 'cancelled'],
  completed : [],
  cancelled : [],
};
function isValidTransition(from, to) {
  return (VALID_TRANSITIONS[from] || []).includes(to);
}

// ── Appointment status enum ──────────────────────────────────────────────────
function isValidAppointmentStatus(s) {
  return ['booked', 'ongoing', 'completed', 'cancelled'].includes(s);
}

// ── Time slot overlap detection ──────────────────────────────────────────────
function timesOverlap(startA, endA, startB, endB) {
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  return toMin(startA) < toMin(endB) && toMin(endA) > toMin(startB);
}

// ── Password length check ────────────────────────────────────────────────────
function isPasswordStrong(pw) {
  return typeof pw === 'string' && pw.length >= 8;
}

// ─────────────────────────────────────────────────────────────────────────────

describe('Unit Tests — Input Validation & Pure Logic', () => {

  // Email sanitisation
  describe('sanitiseEmail()', () => {
    test('lowercases and trims whitespace', () => {
      expect(sanitiseEmail('  JOHN@EXAMPLE.COM  ')).toBe('john@example.com');
    });
    test('returns empty string for non-string input', () => {
      expect(sanitiseEmail(null)).toBe('');
      expect(sanitiseEmail(42)).toBe('');
    });
    test('handles already-clean email', () => {
      expect(sanitiseEmail('alice@med.io')).toBe('alice@med.io');
    });
  });

  // Age validation
  describe('validateAge()', () => {
    test('accepts valid ages 0–120', () => {
      expect(validateAge(0)).toBe(true);
      expect(validateAge(25)).toBe(true);
      expect(validateAge(120)).toBe(true);
    });
    test('rejects negative age', () => {
      expect(validateAge(-1)).toBe(false);
    });
    test('rejects age > 120', () => {
      expect(validateAge(121)).toBe(false);
    });
    test('rejects non-numeric strings', () => {
      expect(validateAge('abc')).toBe(false);
    });
  });

  // Rating validation
  describe('validateRating()', () => {
    test('accepts 1 through 5', () => {
      [1,2,3,4,5].forEach(r => expect(validateRating(r)).toBe(true));
    });
    test('rejects 0 and 6', () => {
      expect(validateRating(0)).toBe(false);
      expect(validateRating(6)).toBe(false);
    });
    test('rejects float ratings', () => {
      expect(validateRating(3.5)).toBe(false);
    });
  });

  // Schedule transitions
  describe('isValidTransition()', () => {
    test('available → booked is valid', () => {
      expect(isValidTransition('available', 'booked')).toBe(true);
    });
    test('booked → ongoing is valid', () => {
      expect(isValidTransition('booked', 'ongoing')).toBe(true);
    });
    test('completed → any is invalid', () => {
      expect(isValidTransition('completed', 'cancelled')).toBe(false);
      expect(isValidTransition('completed', 'booked')).toBe(false);
    });
    test('available → completed is invalid (must go through booked)', () => {
      expect(isValidTransition('available', 'completed')).toBe(false);
    });
  });

  // Appointment status
  describe('isValidAppointmentStatus()', () => {
    test('accepts valid statuses', () => {
      ['booked','ongoing','completed','cancelled'].forEach(s =>
        expect(isValidAppointmentStatus(s)).toBe(true)
      );
    });
    test('rejects unknown statuses', () => {
      expect(isValidAppointmentStatus('pending')).toBe(false);
      expect(isValidAppointmentStatus('')).toBe(false);
    });
  });

  // Time overlap
  describe('timesOverlap()', () => {
    test('detects overlapping slots', () => {
      expect(timesOverlap('09:00','10:00','09:30','10:30')).toBe(true);
    });
    test('non-overlapping back-to-back slots', () => {
      expect(timesOverlap('09:00','10:00','10:00','11:00')).toBe(false);
    });
    test('fully contained slot is overlap', () => {
      expect(timesOverlap('08:00','12:00','09:00','11:00')).toBe(true);
    });
    test('entirely before — no overlap', () => {
      expect(timesOverlap('07:00','08:00','09:00','10:00')).toBe(false);
    });
  });

  // Password strength
  describe('isPasswordStrong()', () => {
    test('accepts passwords ≥ 8 chars', () => {
      expect(isPasswordStrong('12345678')).toBe(true);
      expect(isPasswordStrong('StrongP@ss1')).toBe(true);
    });
    test('rejects passwords < 8 chars', () => {
      expect(isPasswordStrong('abc')).toBe(false);
    });
    test('rejects non-string', () => {
      expect(isPasswordStrong(12345678)).toBe(false);
    });
  });
});
