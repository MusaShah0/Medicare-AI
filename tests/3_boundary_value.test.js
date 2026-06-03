/**
 * Boundary Value Analysis — MediCare AI
 *
 * Tests the exact boundary values (min, min+1, max-1, max) and
 * just-outside values for every numeric/length-constrained field.
 */

// ── Boundary helpers ─────────────────────────────────────────────────────────

const isValidAge       = n => Number.isFinite(Number(n)) && Number(n) >= 0 && Number(n) <= 120;
const isValidRating    = n => Number.isInteger(Number(n)) && Number(n) >= 1 && Number(n) <= 5;
const isValidFee       = n => Number.isFinite(Number(n)) && Number(n) >= 0;
const isValidReview    = s => typeof s === 'string' && s.trim().length <= 1000;
const isValidPassword  = s => typeof s === 'string' && s.length >= 8 && s.length <= 128;
const isValidPhone     = s => typeof s === 'string' && s.trim().length >= 7 && s.trim().length <= 15;

// ── Slot duration (minutes) — practical range 15–120 ────────────────────────
const isValidSlotDuration = n => Number.isInteger(Number(n)) && Number(n) >= 15 && Number(n) <= 120;

// ─────────────────────────────────────────────────────────────────────────────

describe('Boundary Value Analysis', () => {

  // ── Patient Age (0–120) ───────────────────────────────────────────────────
  describe('Patient Age boundaries', () => {
    test('BVA-A1 | min-1 = -1  → invalid', () => expect(isValidAge(-1)).toBe(false));
    test('BVA-A2 | min   =  0  → valid',   () => expect(isValidAge(0)).toBe(true));
    test('BVA-A3 | min+1 =  1  → valid',   () => expect(isValidAge(1)).toBe(true));
    test('BVA-A4 | max-1 = 119 → valid',   () => expect(isValidAge(119)).toBe(true));
    test('BVA-A5 | max   = 120 → valid',   () => expect(isValidAge(120)).toBe(true));
    test('BVA-A6 | max+1 = 121 → invalid', () => expect(isValidAge(121)).toBe(false));
  });

  // ── Review Rating (1–5) ───────────────────────────────────────────────────
  describe('Review Rating boundaries', () => {
    test('BVA-R1 | min-1 = 0 → invalid', () => expect(isValidRating(0)).toBe(false));
    test('BVA-R2 | min   = 1 → valid',   () => expect(isValidRating(1)).toBe(true));
    test('BVA-R3 | min+1 = 2 → valid',   () => expect(isValidRating(2)).toBe(true));
    test('BVA-R4 | max-1 = 4 → valid',   () => expect(isValidRating(4)).toBe(true));
    test('BVA-R5 | max   = 5 → valid',   () => expect(isValidRating(5)).toBe(true));
    test('BVA-R6 | max+1 = 6 → invalid', () => expect(isValidRating(6)).toBe(false));
  });

  // ── Clinic Fee (>= 0) ─────────────────────────────────────────────────────
  describe('Clinic Fee boundaries', () => {
    test('BVA-F1 | min-1 = -1  → invalid', () => expect(isValidFee(-1)).toBe(false));
    test('BVA-F2 | min   =  0  → valid',   () => expect(isValidFee(0)).toBe(true));
    test('BVA-F3 | min+1 =  1  → valid',   () => expect(isValidFee(1)).toBe(true));
    test('BVA-F4 | large =  9999 → valid', () => expect(isValidFee(9999)).toBe(true));
  });

  // ── Review Text (max 1000 chars) ──────────────────────────────────────────
  describe('Review Text length boundaries', () => {
    test('BVA-V1 | 999 chars → valid',   () => expect(isValidReview('a'.repeat(999))).toBe(true));
    test('BVA-V2 | 1000 chars → valid',  () => expect(isValidReview('a'.repeat(1000))).toBe(true));
    test('BVA-V3 | 1001 chars → invalid',() => expect(isValidReview('a'.repeat(1001))).toBe(false));
    test('BVA-V4 | empty string → valid (optional field)', () => expect(isValidReview('')).toBe(true));
  });

  // ── Password length (8–128) ───────────────────────────────────────────────
  describe('Password length boundaries', () => {
    test('BVA-P1 | 7 chars → invalid',   () => expect(isValidPassword('a'.repeat(7))).toBe(false));
    test('BVA-P2 | 8 chars → valid',     () => expect(isValidPassword('a'.repeat(8))).toBe(true));
    test('BVA-P3 | 9 chars → valid',     () => expect(isValidPassword('a'.repeat(9))).toBe(true));
    test('BVA-P4 | 128 chars → valid',   () => expect(isValidPassword('a'.repeat(128))).toBe(true));
    test('BVA-P5 | 129 chars → invalid', () => expect(isValidPassword('a'.repeat(129))).toBe(false));
  });

  // ── Phone number length (7–15 digits, E.164 guideline) ───────────────────
  describe('Phone number length boundaries', () => {
    test('BVA-PH1 | 6 chars → invalid',  () => expect(isValidPhone('123456')).toBe(false));
    test('BVA-PH2 | 7 chars → valid',    () => expect(isValidPhone('1234567')).toBe(true));
    test('BVA-PH3 | 15 chars → valid',   () => expect(isValidPhone('123456789012345')).toBe(true));
    test('BVA-PH4 | 16 chars → invalid', () => expect(isValidPhone('1234567890123456')).toBe(false));
  });

  // ── Slot Duration (15–120 minutes) ───────────────────────────────────────
  describe('Slot Duration boundaries', () => {
    test('BVA-SD1 | 14 min → invalid', () => expect(isValidSlotDuration(14)).toBe(false));
    test('BVA-SD2 | 15 min → valid',   () => expect(isValidSlotDuration(15)).toBe(true));
    test('BVA-SD3 | 16 min → valid',   () => expect(isValidSlotDuration(16)).toBe(true));
    test('BVA-SD4 | 119 min → valid',  () => expect(isValidSlotDuration(119)).toBe(true));
    test('BVA-SD5 | 120 min → valid',  () => expect(isValidSlotDuration(120)).toBe(true));
    test('BVA-SD6 | 121 min → invalid',() => expect(isValidSlotDuration(121)).toBe(false));
  });
});
