
import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';

// Mock safetyClient to prevent actual API calls and dependency issues
vi.mock('../lib/ai/safety', () => ({
  safetyClient: {
    scan: vi.fn().mockResolvedValue({ result: 'Safe', usage: {} })
  }
}));

// Import the tool after mocking
import { scanRepository } from '../lib/ai/tools/repository/scan';

describe('scanRepository Security', () => {
  // Helper to access the schema (casting to any because AI SDK types are strict/opaque)
  const tool: any = scanRepository;
  const schema = tool.parameters as z.ZodObject<any>;

  describe('Input Validation (Zod)', () => {
    it('should accept valid GitHub URLs', () => {
      const result = schema.safeParse({ repoUrl: 'https://github.com/vercel/next.js' });
      expect(result.success).toBe(true);
    });

    it('should reject non-GitHub URLs (SSRF)', () => {
      const result = schema.safeParse({ repoUrl: 'https://evil.com/repo' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Must be a valid GitHub repository URL');
      }
    });

    it('should reject http protocol', () => {
        const result = schema.safeParse({ repoUrl: 'http://github.com/vercel/next.js' });
        expect(result.success).toBe(false);
    });

    it('should accept valid branch names', () => {
      const result = schema.safeParse({ 
        repoUrl: 'https://github.com/user/repo',
        branch: 'feature/new-param' 
      });
      expect(result.success).toBe(true);
    });

    it('should reject dangerous characters in branch names', () => {
      const result = schema.safeParse({ 
        repoUrl: 'https://github.com/user/repo',
        branch: '; rm -rf /' 
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Execution Logic', () => {
    it('should block non-GitHub URLs even if Zod passed (Defense in Depth)', async () => {
      // Bypassing Zod by calling execute directly with invalid data (simulating type bypass)
      const result = await tool.execute({ repoUrl: 'https://evil.com/repo' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Security Violation');
    });

    it('should block bad branch names even if Zod passed', async () => {
        const result = await tool.execute({ 
            repoUrl: 'https://github.com/user/repo',
            branch: '; rm -rf /' 
        });
        expect(result.success).toBe(false);
        expect(result.error).toContain('Security Violation');
    });

    it('should proceed for valid inputs', async () => {
        const result = await tool.execute({ 
            repoUrl: 'https://github.com/user/repo',
            branch: 'main' 
        });
        expect(result.success).toBe(true);
    });
  });
});
