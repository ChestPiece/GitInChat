import { createTool } from '../../create-tool';
import { z } from 'zod';
import { safetyClient } from '@/lib/safety';

export const scanRepository = createTool({
  description: 'Scan a GitHub repository for security threats using SuperAgent. Detects prompt injections, malware patterns, and other vulnerabilities.',
  parameters: z.object({
    repoUrl: z.string()
      .url()
      .regex(/^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/, "Must be a valid GitHub repository URL (e.g., https://github.com/user/repo)")
      .describe('The full URL of the GitHub repository to scan.'),
    branch: z.string()
      .regex(/^[a-zA-Z0-9\/_.-]+$/, "Branch name contains invalid characters.")
      .optional()
      .describe('The specific branch to scan. Defaults to the main/master branch.'),
  }),
  execute: async ({ repoUrl, branch }) => {
    try {
      // 1. Strict Input Validation (Defense in Depth)
      // Even though Zod handles schemas, we double-check critical security boundaries here.

      const url = new URL(repoUrl);
      if (url.hostname !== 'github.com') {
          throw new Error("Security Violation: Only GitHub repositories are allowed.");
      }

      // Prevent directory traversal or command injection in branch names
      // Allow alphanumeric, forward slash, hyphen, underscore, and dot.
      if (branch && !/^[a-zA-Z0-9\/_.-]+$/.test(branch)) {
          throw new Error("Security Violation: Invalid branch name format.");
      }

      console.log(`[Safety Scan] Starting scan for ${repoUrl} on branch ${branch || 'default'}`);
      
      const scanResult = await safetyClient.scan({
        repo: repoUrl,
        branch,
        // Use OpenAI model for code analysis (assumes OPENAI_API_KEY is available)
        model: 'openai/gpt-4o' 
      });

      return {
        success: true,
        report: scanResult.result,
        usage: scanResult.usage
      };
    } catch (error: any) {
      console.error("[Safety Scan] Failed:", error);
      // Safe error return - do not leak internal stack traces to the AI model or user
      return {
        success: false,
        error: error.message || "Failed to scan repository."
      };
    }
  },
});
