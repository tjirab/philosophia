import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getAssetUrl } from '../src/lib/assets';

describe('Asset URL resolution', () => {
  const originalEnv = process.env.NEXT_PUBLIC_BASE_PATH;

  afterEach(() => {
    process.env.NEXT_PUBLIC_BASE_PATH = originalEnv;
  });

  it('handles empty or undefined paths', () => {
    expect(getAssetUrl('')).toBe('');
    expect(getAssetUrl(undefined)).toBe('');
  });

  it('returns external URLs unchanged', () => {
    expect(getAssetUrl('https://example.com/photo.jpg')).toBe('https://example.com/photo.jpg');
    expect(getAssetUrl('http://example.com/photo.jpg')).toBe('http://example.com/photo.jpg');
    expect(getAssetUrl('data:image/png;base64,...')).toBe('data:image/png;base64,...');
  });

  it('resolves local portrait paths correctly without basePath', () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    expect(getAssetUrl('/portraits/socrates.jpg')).toBe('/portraits/socrates.jpg');
    expect(getAssetUrl('portraits/plato.jpg')).toBe('/portraits/plato.jpg');
  });

  it('prepends NEXT_PUBLIC_BASE_PATH when set', () => {
    process.env.NEXT_PUBLIC_BASE_PATH = '/philosophia';
    expect(getAssetUrl('/portraits/socrates.jpg')).toBe('/philosophia/portraits/socrates.jpg');
    expect(getAssetUrl('/philosophia/portraits/socrates.jpg')).toBe('/philosophia/portraits/socrates.jpg');
  });
});
