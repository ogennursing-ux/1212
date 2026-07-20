import { describe, it, expect } from 'vitest';
import {
  whatsappLink,
  recordToText,
  workerToText,
  familyToText,
  AGENCY_NAME,
  WORKER_COLS,
  FAMILY_COLS,
} from './intakeUtils.js';

describe('whatsappLink', () => {
  it('converts a local 0-prefixed number to intl 972 form', () => {
    expect(whatsappLink('050-123-4567', 'hi')).toBe('https://wa.me/972501234567?text=hi');
  });

  it('keeps an already-international number as-is (digits only)', () => {
    expect(whatsappLink('972501234567', 'x')).toBe('https://wa.me/972501234567?text=x');
  });

  it('URL-encodes the message text', () => {
    expect(whatsappLink('0500000000', 'שלום world & co')).toContain(
      '?text=' + encodeURIComponent('שלום world & co'),
    );
  });

  it('omits the number segment when no digits are present', () => {
    expect(whatsappLink('', 'hi')).toBe('https://wa.me/?text=hi');
    expect(whatsappLink(null, 'hi')).toBe('https://wa.me/?text=hi');
  });

  it('tolerates an empty message', () => {
    expect(whatsappLink('0500000000')).toBe('https://wa.me/972500000000?text=');
  });
});

describe('recordToText / workerToText / familyToText', () => {
  it('renders only non-empty fields as "label: value" lines', () => {
    const text = recordToText({ notes: 'הערה', salary: '' }, WORKER_COLS);
    expect(text).toContain('הערות: הערה');
    expect(text).not.toContain('שכר חודשי:'); // empty salary omitted
  });

  it('formats date fields DD/MM/YYYY in the output', () => {
    const text = recordToText({ dob: '1990-05-09' }, WORKER_COLS);
    expect(text).toContain('תאריך לידה: 09/05/1990');
  });

  it('prepends the agency-name header for a worker', () => {
    const text = workerToText({ firstNameHe: 'דנה' });
    expect(text.split('\n')[0]).toBe(`שם הסוכנות: ${AGENCY_NAME}`);
    expect(text).toContain('שם פרטי (עברית): דנה');
  });

  it('does not add the agency header for a family record', () => {
    const text = familyToText({ firstName: 'משה' });
    expect(text).not.toContain(AGENCY_NAME);
    expect(text).toContain('שם פרטי: משה');
  });

  it('returns an empty string for a record with no filled fields', () => {
    expect(familyToText({})).toBe('');
    expect(recordToText({}, FAMILY_COLS)).toBe('');
  });
});
