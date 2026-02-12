import { tool } from 'ai';
import { z } from 'zod';
import { safetyClient } from '@/lib/ai/safety';

export const scanRepository = tool({
  description: 'Scan a GitHub repository for security threats using SuperAgent. Detects prompt injections, malware patterns, and other vulnerabilities.',
  parameters: z.object({
    repoUrl: z.string().describe('The full URL of the GitHub repository to scan (e.g., "https://github.com/user/repo").'),
    branch: z.string().optional().describe('The specific branch to scan. Defaults to the main/master branch.'),
  }),
  execute: async ({ repoUrl, branch }: { repoUrl: string; branch?: string }) => {
    try {
      console.log(`[Safety Scan] Starting scan for ${repoUrl} on branch ${branch || 'default'}`);
      
      const scanResult = await safetyClient.scan({
        repo: repoUrl,
        branch,
        // Using Claude 3.5 Sonnet as recommended in docs for code analysis
        model: 'anthropic/claude-sonnet-4-5' 
      });

      return {
        success: true,
        report: scanResult.result,
        usage: scanResult.usage
      };
    } catch (error: any) {
      console.error("[Safety Scan] Failed:", error);
      return {
        success: false,
        error: error.message || "Failed to scan repository. Ensure DAYTONA_API_KEY is configured."
      };
    }
  },
});
