import { describe, it, expect } from 'vitest';
import { toDMY, fmtCell, WORKER_COLS, FAMILY_COLS } from './csvExport.js';

describe('toDMY', () => {
  it('reformats an ISO date to DD/MM/YYYY', () => {
    expect(toDMY('2026-01-09')).toBe('09/01/2026');
  });
  it('passes through a non-ISO string', () => {
    expect(toDMY('09/01/2026')).toBe('09/01/2026');
    expect(toDMY('not a date')).toBe('not a date');
  });
  it('returns empty string for null/undefined', () => {
    expect(toDMY(null)).toBe('');
    expect(toDMY(undefined)).toBe('');
  });
  it('trims surrounding whitespace before matching', () => {
    expect(toDMY('  2026-01-09  ')).toBe('09/01/2026');
  });
});

describe('fmtCell', () => {
  it('formats a date-typed column', () => {
    const col = ['dob', 'תאריך לידה', 'date'];
    expect(fmtCell(col, { dob: '1990-05-09' })).toBe('09/05/1990');
  });

  it('maps the gender code to a Hebrew word', () => {
    const col = ['gender', 'מין'];
    expect(fmtCell(col, { gender: 'ז' })).toBe('זכר');
    expect(fmtCell(col, { gender: 'נ' })).toBe('נקבה');
    expect(fmtCell(col, { gender: '' })).toBe('');
    expect(fmtCell(col, {})).toBe('');
  });

  it('stringifies a plain value and empties null/undefined', () => {
    expect(fmtCell(['salary', 'שכר'], { salary: 6000 })).toBe('6000');
    expect(fmtCell(['notes', 'הערות'], { notes: null })).toBe('');
    expect(fmtCell(['notes', 'הערות'], {})).toBe('');
  });
});

describe('column spec integrity', () => {
  it('every column has a key and a label', () => {
    for (const col of [...WORKER_COLS, ...FAMILY_COLS]) {
      expect(typeof col[0]).toBe('string');
      expect(col[0].length).toBeGreaterThan(0);
      expect(typeof col[1]).toBe('string');
      expect(col[1].length).toBeGreaterThan(0);
    }
  });

  it('only ever marks the third element as "date"', () => {
    for (const col of [...WORKER_COLS, ...FAMILY_COLS]) {
      if (col.length > 2) expect(col[2]).toBe('date');
    }
  });
});
