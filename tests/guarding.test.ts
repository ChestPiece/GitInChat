
import { describe, it, expect, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  guard: vi.fn()
}));

vi.mock('../lib/ai/safety', () => ({
  safetyClient: {
    guard: mocks.guard
  }
}));

import { guardUrl } from '../lib/ai/guard-url';
// guardFile is a server action, might be harder to test if it imports 'server-only' or similar, 
// but let's try importing it. If it fails, we test logic via similar pattern or assume it works if guardUrl works (same logic).
import { guardFile } from '../app/actions/guard-file'; 

describe('Extended Guarding', () => {
  
  describe('guardUrl', () => {
    it('should allow benign URLs', async () => {
      mocks.guard.mockResolvedValueOnce({ classification: 'pass' });
      const result = await guardUrl('https://google.com');
      expect(result.allowed).toBe(true);
    });

    it('should block malicious URLs', async () => {
      mocks.guard.mockResolvedValueOnce({ 
        classification: 'block',
        violation_types: ['phishing']
      });
      const result = await guardUrl('http://evil.com');
      expect(result.allowed).toBe(false);
      expect(result.violation_types).toContain('phishing');
    });

    it('should fail open on timeout', async () => {
      mocks.guard.mockImplementationOnce(() => new Promise(r => setTimeout(r, 1000)));
      const result = await guardUrl('https://slow.com');
      expect(result.allowed).toBe(true);
    });
  });

  describe('guardFile', () => {
    it('should allow benign files', async () => {
      mocks.guard.mockResolvedValueOnce({ classification: 'pass' });
      const result = await guardFile('base64data', 'text/plain');
      expect(result.success).toBe(true);
    });

    it('should block malicious files', async () => {
       mocks.guard.mockResolvedValueOnce({ 
        classification: 'block',
        violation_types: ['malware']
      });
      const result = await guardFile('base64malware', 'application/exe');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

});
