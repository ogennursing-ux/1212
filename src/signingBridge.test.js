import { describe, it, expect, afterEach } from 'vitest';
import { getSigningUrl, setSigningUrl, signingLink } from './signingBridge.js';

const DEFAULT = 'https://ogennursing-ux.github.io/ogen-.github.io/';

afterEach(() => localStorage.clear());

describe('getSigningUrl / setSigningUrl', () => {
  it('returns the default when nothing is stored', () => {
    expect(getSigningUrl()).toBe(DEFAULT);
  });

  it('persists and reads back a custom url', () => {
    setSigningUrl('https://my.app/');
    expect(getSigningUrl()).toBe('https://my.app/');
  });

  it('storing the default value clears the override', () => {
    setSigningUrl('https://my.app/');
    setSigningUrl(DEFAULT);
    expect(localStorage.getItem('tik_signing_url')).toBe(null);
    expect(getSigningUrl()).toBe(DEFAULT);
  });

  it('storing an empty value clears the override', () => {
    setSigningUrl('https://my.app/');
    setSigningUrl('');
    expect(getSigningUrl()).toBe(DEFAULT);
  });
});

describe('signingLink', () => {
  it('appends ?req= to the default base', () => {
    expect(signingLink('abc')).toBe(`${DEFAULT}?req=abc`);
  });

  it('adds a trailing slash to a bare directory base', () => {
    setSigningUrl('https://my.app/sign');
    expect(signingLink('id1')).toBe('https://my.app/sign/?req=id1');
  });

  it('does not add a slash after an .html base', () => {
    setSigningUrl('https://my.app/index.html');
    expect(signingLink('id1')).toBe('https://my.app/index.html?req=id1');
  });

  it('strips any existing query/hash from the stored url', () => {
    setSigningUrl('https://my.app/?foo=bar#x');
    expect(signingLink('id1')).toBe('https://my.app/?req=id1');
  });
});
