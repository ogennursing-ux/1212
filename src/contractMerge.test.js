import { describe, it, expect } from 'vitest';
import {
  buildValueMap,
  WORKER_KEYS,
  PATIENT_KEYS,
  PLACEHOLDER_KEYS,
  CONTRACT_FIELD_LABELS,
} from './contractMerge.js';

describe('buildValueMap — worker side', () => {
  it('copies plain worker fields as strings', () => {
    const map = buildValueMap({ worker: { nameHe: 'דנה', salary: 6000 } });
    expect(map.nameHe).toBe('דנה');
    expect(map.salary).toBe('6000');
  });

  it('formats date fields as DD/MM/YYYY', () => {
    const map = buildValueMap({ worker: { dob: '1990-05-09' } });
    expect(map.dob).toBe('09/05/1990');
  });

  it('translates the gender code to a Hebrew word', () => {
    expect(buildValueMap({ worker: { gender: 'ז' } }).gender).toBe('זכר');
    expect(buildValueMap({ worker: { gender: 'נ' } }).gender).toBe('נקבה');
    expect(buildValueMap({ worker: { gender: '' } }).gender).toBe('');
  });

  it('maps null values to empty strings', () => {
    expect(buildValueMap({ worker: { employer: null } }).employer).toBe('');
  });

  it('never leaks the signature image into the text map', () => {
    const map = buildValueMap({ worker: { signature: 'data:image/png;base64,AAAA', nameHe: 'x' } });
    expect(map.signature).toBeUndefined();
  });

  it('treats a bare worker object (no wrapper) as the worker — back compat', () => {
    const map = buildValueMap({ nameHe: 'דנה', passportNo: 'A1' });
    expect(map.nameHe).toBe('דנה');
    expect(map.passportNo).toBe('A1');
  });
});

describe('buildValueMap — family / patient side', () => {
  const family = {
    fullName: 'משה לוי',
    idNumber: '123456782',
    dob: '1940-01-02',
    gender: 'ז',
    city: 'חיפה',
    street: 'הרצל 1',
    mobile: '0501234567',
    contactName: 'רות',
    contactRelation: 'בת',
    contactMobile: '0527654321',
  };

  it('maps patient identity fields with patient* keys', () => {
    const map = buildValueMap({ worker: null, family });
    expect(map.patientName).toBe('משה לוי');
    expect(map.patientId).toBe('123456782');
    expect(map.patientDob).toBe('02/01/1940');
    expect(map.patientGender).toBe('זכר');
  });

  it('composes patientAddress from street + city', () => {
    expect(buildValueMap({ family }).patientAddress).toBe('הרצל 1, חיפה');
  });

  it('omits missing address parts from patientAddress', () => {
    expect(buildValueMap({ family: { city: 'חיפה' } }).patientAddress).toBe('חיפה');
    expect(buildValueMap({ family: {} }).patientAddress).toBe('');
  });

  it('falls back from phone to mobile for patientPhone', () => {
    expect(buildValueMap({ family: { mobile: '050' } }).patientPhone).toBe('050');
    expect(buildValueMap({ family: { phone: '04', mobile: '050' } }).patientPhone).toBe('04');
  });

  it('maps the contact person fields', () => {
    const map = buildValueMap({ family });
    expect(map.contactName).toBe('רות');
    expect(map.contactRelation).toBe('בת');
    expect(map.contactPhone).toBe('0527654321'); // contactMobile -> contactPhone
  });
});

describe('buildValueMap — always-present keys', () => {
  it("sets today to today's date in DD/MM/YYYY", () => {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    expect(buildValueMap({}).today).toBe(`${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`);
  });

  it('takes companyName from opts, defaulting to empty', () => {
    expect(buildValueMap({}, { companyName: 'עוגן' }).companyName).toBe('עוגן');
    expect(buildValueMap({}).companyName).toBe('');
  });

  it('handles being called with no arguments at all', () => {
    const map = buildValueMap();
    expect(map.companyName).toBe('');
    expect(map.today).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });
});

describe('placeholder key tables', () => {
  it('PLACEHOLDER_KEYS is worker + patient keys plus today/companyName', () => {
    expect(PLACEHOLDER_KEYS).toEqual([...WORKER_KEYS, ...PATIENT_KEYS, 'today', 'companyName']);
  });

  it('every placeholder key has a Hebrew label', () => {
    for (const key of PLACEHOLDER_KEYS) {
      expect(CONTRACT_FIELD_LABELS[key], `label for ${key}`).toBeTruthy();
    }
  });
});
