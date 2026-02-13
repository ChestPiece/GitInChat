
import { describe, it, expect, vi } from 'vitest';

// Use vi.hoisted to ensure mocks are initialized before imports
const mocks = vi.hoisted(() => ({
  redact: vi.fn()
}));

vi.mock('../lib/ai/safety', () => ({
  safetyClient: {
    redact: mocks.redact
  }
}));

import { redactContent } from '../lib/ai/redaction';

describe('redactContent', () => {
  it('should return redacted content when safetyClient succeeds', async () => {
    mocks.redact.mockResolvedValueOnce({
      redacted: 'My email is <EMAIL>',
      findings: ['email']
    });

    const input = 'My email is test@example.com';
    const result = await redactContent(input);

    expect(result.redacted).toBe('My email is <EMAIL>');
    expect(result.wasRedacted).toBe(true);
    expect(result.findings).toEqual(['email']);
  });

  it('should fail open (return original) when safetyClient throws', async () => {
    mocks.redact.mockRejectedValueOnce(new Error('Service down'));

    const input = 'My email is test@example.com';
    const result = await redactContent(input);

    expect(result.redacted).toBe(input); // Original returned
    expect(result.wasRedacted).toBe(false);
  });

  it('should fail open (return original) when safetyClient times out', async () => {
    // Mock implementation that hangs
    mocks.redact.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 2000)));

    const input = 'My email is test@example.com';
    const inputStart = Date.now();
    const result = await redactContent(input);
    const duration = Date.now() - inputStart;

    expect(result.redacted).toBe(input); // Original returned
    expect(result.wasRedacted).toBe(false);
    // Should be around 800ms
    expect(duration).toBeGreaterThanOrEqual(750);
    expect(duration).toBeLessThan(1200); // Allow some buffer
  });
});
