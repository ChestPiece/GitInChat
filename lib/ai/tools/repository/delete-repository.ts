import { createTool } from "../../create-tool";
import { z } from "zod";
import { getGitHubClient } from "@/lib/github/client";
import { validateRepoInput, sanitizeStringParam } from "../../utils";

const deleteRepositorySchema = z.object({
  owner: z
    .string()
    .min(1)
    .max(39)
    .describe("Repository owner (GitHub username/org)"),
  repo: z.string().min(1).max(255).describe("Repository name"),
  confirm_name: z
    .string()
    .min(1)
    .max(255)
    .describe("User must type exact repo name for confirmation"),
});

import { createSuccess, createError } from "../../utils";

// ... (schema remains)

export const deleteRepositoryTool = createTool({
  description: `
  ⚠️ PERMANENTLY DELETE A REPOSITORY ⚠️

  THIS IS AN IRREVERSIBLE OPERATION. Use with extreme caution.

  Before using this tool:
  1. Ask the user to confirm the exact repository name
  2. Warn about permanent data loss
  3. Verify they understand this CANNOT be undone

  Deleted repositories:
  - Lose all code, history, issues, PRs forever
  - Cannot be recovered
  - Forks are not affected

  ONLY use this when the user:
  - Explicitly uses words like "delete", "remove permanently"
  - Confirms the repository name
  - Acknowledges they understand it's permanent
  `,

  inputSchema: deleteRepositorySchema,

  execute: async (
    { owner, repo, confirm_name }: z.infer<typeof deleteRepositorySchema>,
    options: unknown,
  ) => {
    // Validate owner and repo parameters
    const repoValidation = validateRepoInput(owner, repo);
    if (!repoValidation.valid) {
      return createError(
        repoValidation.error || "Invalid repository parameters",
      );
    }

    // Sanitize confirm_name
    const confirmValidation = sanitizeStringParam(confirm_name, "confirm_name");
    if (!confirmValidation.valid) {
      return createError(
        confirmValidation.error || "Invalid confirmation name",
      );
    }

    const messages =
      (options as { messages?: Array<any> } | undefined)?.messages ?? [];
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m && m.role === "user");
    const lastUserTextRaw =
      typeof lastUserMessage?.content === "string"
        ? lastUserMessage.content
        : Array.isArray(lastUserMessage?.content)
          ? lastUserMessage.content
              .filter(
                (p: any) => p?.type === "text" && typeof p?.text === "string",
              )
              .map((p: any) => p.text)
              .join("")
          : "";
    const lastUserText = String(lastUserTextRaw || "").trim();

    // CRITICAL: Verify confirmation
    if (confirmValidation.value !== repo) {
      return createError(
        `Confirmation failed. Please type the exact repository name "${repo}" to confirm deletion.`,
      );
    }

    // HARD-GATE: Require the *user* to have sent the confirmation text in their most recent message.
    // This prevents the model from self-confirming by filling confirm_name without user intent.
    if (!lastUserText || lastUserText !== repo) {
      return createError(
        `Hard confirmation required. Please send a message containing exactly "${repo}" (and nothing else), then retry the delete.`,
      );
    }

    try {
      const octokit = await getGitHubClient();

      // Check if repo exists and get details for safer confirmation
      const { data: repoDetails } = await octokit.rest.repos.get({
        owner,
        repo,
      });

      await octokit.rest.repos.delete({ owner, repo });

      return createSuccess({
        deleted_repository: `${owner}/${repo}`,
        message: `❌ Repository "${repo}" has been permanently deleted. This action cannot be undone.`,
      });
    } catch (error: any) {
      if (error.status === 403) {
        return createError(
          "You do not have permission to delete this repository.",
        );
      }
      if (error.status === 404) {
        return createError("Repository not found or already deleted.");
      }
      return createError(error.message || "Failed to delete repository");
    }
  },
});
