/**
 * Equivalence Partitioning — MediCare AI
 *
 * Input domains are divided into equivalence classes so that one
 * representative from each class is sufficient to detect the same class of defects.
 *
 * Fields covered: age, rating, email format, gender enum, clinic_fee, password length.
 */

// ── Validators (mirrors Model constraints) ───────────────────────────────────

function classifyAge(age) {
  const n = Number(age);
  if (!Number.isFinite(n) || n < 0)   return 'invalid_low';
  if (n > 120)                         return 'invalid_high';
  return 'valid';
}

function classifyRating(r) {
  const n = Number(r);
  if (!Number.isFinite(n) || n < 1)   return 'invalid_low';
  if (n > 5)                           return 'invalid_high';
  if (!Number.isInteger(n))            return 'invalid_float';
  return 'valid';
}

// Simple RFC-5321 structural check (no regex over-engineering)
function classifyEmail(email) {
  if (typeof email !== 'string' || !email.includes('@')) return 'invalid_format';
  const [local, domain] = email.split('@');
  if (!local || !domain || !domain.includes('.'))        return 'invalid_format';
  return 'valid';
}

function classifyGender(g) {
  return ['Male','Female','Other'].includes(g) ? 'valid' : 'invalid';
}

function classifyClinicFee(fee) {
  const n = Number(fee);
  if (!Number.isFinite(n) || n < 0) return 'invalid_negative';
  if (n === 0)                       return 'valid_zero';
  return 'valid_positive';
}

function classifyPassword(pw) {
  if (typeof pw !== 'string')  return 'invalid_type';
  if (pw.length < 8)           return 'invalid_short';
  if (pw.length > 128)         return 'invalid_long';
  return 'valid';
}

// ─────────────────────────────────────────────────────────────────────────────

describe('Equivalence Partitioning', () => {

  // ── Age: 3 classes — below range, within range, above range ──────────────
  describe('Patient Age (0–120)', () => {
    test('EP-A1 | Valid class: age 25', () => {
      expect(classifyAge(25)).toBe('valid');
    });
    test('EP-A2 | Invalid low class: age -1', () => {
      expect(classifyAge(-1)).toBe('invalid_low');
    });
    test('EP-A3 | Invalid low class: NaN string', () => {
      expect(classifyAge('abc')).toBe('invalid_low');
    });
    test('EP-A4 | Invalid high class: age 200', () => {
      expect(classifyAge(200)).toBe('invalid_high');
    });
  });

  // ── Rating: 3 classes ─────────────────────────────────────────────────────
  describe('Review Rating (1–5, integer)', () => {
    test('EP-R1 | Valid class: rating 3', () => {
      expect(classifyRating(3)).toBe('valid');
    });
    test('EP-R2 | Invalid low class: rating 0', () => {
      expect(classifyRating(0)).toBe('invalid_low');
    });
    test('EP-R3 | Invalid high class: rating 10', () => {
      expect(classifyRating(10)).toBe('invalid_high');
    });
    test('EP-R4 | Invalid float class: rating 2.5', () => {
      expect(classifyRating(2.5)).toBe('invalid_float');
    });
  });

  // ── Email: 2 classes ──────────────────────────────────────────────────────
  describe('Email Format', () => {
    test('EP-E1 | Valid class: well-formed email', () => {
      expect(classifyEmail('doctor@hospital.com')).toBe('valid');
    });
    test('EP-E2 | Invalid class: missing @', () => {
      expect(classifyEmail('doctorathospital.com')).toBe('invalid_format');
    });
    test('EP-E3 | Invalid class: missing domain extension', () => {
      expect(classifyEmail('doctor@hospital')).toBe('invalid_format');
    });
    test('EP-E4 | Invalid class: empty string', () => {
      expect(classifyEmail('')).toBe('invalid_format');
    });
  });

  // ── Gender: 2 classes ─────────────────────────────────────────────────────
  describe('Gender Enum (Male / Female / Other)', () => {
    test('EP-G1 | Valid class: Male', () => {
      expect(classifyGender('Male')).toBe('valid');
    });
    test('EP-G2 | Valid class: Female', () => {
      expect(classifyGender('Female')).toBe('valid');
    });
    test('EP-G3 | Valid class: Other', () => {
      expect(classifyGender('Other')).toBe('valid');
    });
    test('EP-G4 | Invalid class: arbitrary string', () => {
      expect(classifyGender('unknown')).toBe('invalid');
    });
  });

  // ── Clinic Fee: 3 classes ─────────────────────────────────────────────────
  describe('Clinic Fee', () => {
    test('EP-F1 | Valid positive fee: $150', () => {
      expect(classifyClinicFee(150)).toBe('valid_positive');
    });
    test('EP-F2 | Valid zero fee (free consultation)', () => {
      expect(classifyClinicFee(0)).toBe('valid_zero');
    });
    test('EP-F3 | Invalid negative fee: -50', () => {
      expect(classifyClinicFee(-50)).toBe('invalid_negative');
    });
  });

  // ── Password length: 3 classes ────────────────────────────────────────────
  describe('Password Length', () => {
    test('EP-P1 | Valid class: 8-char password', () => {
      expect(classifyPassword('Abcde123')).toBe('valid');
    });
    test('EP-P2 | Invalid short class: 5-char password', () => {
      expect(classifyPassword('abc12')).toBe('invalid_short');
    });
    test('EP-P3 | Invalid type class: numeric literal', () => {
      expect(classifyPassword(12345678)).toBe('invalid_type');
    });
  });
});
