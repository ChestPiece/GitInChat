import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateEmbedding, chunkText } from "./embeddings";
import type { Octokit } from "octokit";
import { logger } from "@/lib/logger";

const SECRET_PATH_PATTERNS = [
  /\.env(\.|$)/i,
  /secrets?\./i,
  /credentials?\./i,
  /private[_-]?key/i,
  /\.pem$/i,
  /id_rsa/i,
  /\.p12$/i,
  /\.pfx$/i,
];

// HR-07: RAG file size boundary
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB per file
const MAX_REPO_SIZE = 500 * 1024 * 1024; // 500MB per repo

interface IndexResult {
  totalFiles: number;
  indexedFiles: number;
  totalChunks: number;
  errors: string[];
}

/**
 * Index a GitHub repository by fetching all code files and storing them
 * with embeddings in the documents table (scoped to userId for RAG isolation).
 */
export async function indexRepository(
  octokit: Octokit,
  owner: string,
  repo: string,
  options: {
    userId: string;
    branch?: string;
    filePatterns?: RegExp[];
    maxFileSize?: number;
  },
): Promise<IndexResult> {
  const {
    userId,
    branch = "HEAD",
    filePatterns = [/\.(ts|tsx|js|jsx|py|java|go|rs|md|txt)$/],
    maxFileSize = MAX_FILE_SIZE,
  } = options;

  const result: IndexResult = {
    totalFiles: 0,
    indexedFiles: 0,
    totalChunks: 0,
    errors: [],
  };

  try {
    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    const repoId = repoData.id;

    logger.info({ owner, repo }, 'Indexing repository');

    const { data: tree } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: "true",
    });

    const codeFiles = tree.tree.filter((item) => {
      if (item.type !== "blob" || !item.path) return false;
      if (SECRET_PATH_PATTERNS.some((p) => p.test(item.path!))) return false;
      return filePatterns.some((pattern) => pattern.test(item.path!));
    });

    // HR-07: Check total repo size upfront
    const totalRepoSize = codeFiles.reduce(
      (sum, file) => sum + (file.size || 0),
      0,
    );
    if (totalRepoSize > MAX_REPO_SIZE) {
      const msg = `Repository too large: ${(totalRepoSize / 1024 / 1024).toFixed(2)}MB > ${(MAX_REPO_SIZE / 1024 / 1024).toFixed(0)}MB limit`;
      logger.warn({ err: msg }, 'Repository too large');
      result.errors.push(msg);
      return result;
    }

    result.totalFiles = codeFiles.length;
    logger.debug({ fileCount: codeFiles.length }, 'Found code files to index');

    const { error: deleteError } = await supabaseAdmin
      .from("documents")
      .delete()
      .eq("user_id", userId)
      .eq("metadata->>repo_id", repoId.toString());

    if (deleteError) {
      logger.warn({ err: deleteError.message }, 'Could not delete old documents');
    }

    const batchSize = 5;
    for (let i = 0; i < codeFiles.length; i += batchSize) {
      const batch = codeFiles.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (file) => {
          try {
            if (!file.path) return;

            const { data: content } = await octokit.rest.repos.getContent({
              owner,
              repo,
              path: file.path,
              ref: branch,
            });

            if (!("content" in content)) return;

            const decoded = Buffer.from(content.content, "base64").toString(
              "utf-8",
            );

            // HR-07: Strict file size boundary
            if (decoded.length > maxFileSize) {
              const sizeInMB = (decoded.length / 1024 / 1024).toFixed(2);
              const limitMB = (maxFileSize / 1024 / 1024).toFixed(0);
              result.errors.push(
                `File too large: ${file.path} (${sizeInMB}MB > ${limitMB}MB limit)`,
              );
              return;
            }

            const chunks = chunkText(decoded, 1000);

            for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
              const chunk = chunks[chunkIndex];
              const embedding = await generateEmbedding(chunk);

              const { error: insertError } = await supabaseAdmin
                .from("documents")
                .insert({
                  user_id: userId,
                  content: chunk,
                  embedding: embedding,
                  metadata: {
                    repo_id: repoId,
                    repo_name: `${owner}/${repo}`,
                    file_path: file.path,
                    chunk_index: chunkIndex,
                    total_chunks: chunks.length,
                    size: file.size,
                    sha: file.sha,
                    indexed_at: new Date().toISOString(),
                  },
                });

              if (insertError) {
                result.errors.push(
                  `Error indexing ${file.path}: ${insertError.message}`,
                );
              } else {
                result.totalChunks++;
              }
            }

            result.indexedFiles++;
          } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            result.errors.push(`Error processing ${file.path}: ${msg}`);
          }
        }),
      );

      logger.debug(
        { batch: Math.floor(i / batchSize) + 1, totalBatches: Math.ceil(codeFiles.length / batchSize), indexedFiles: result.indexedFiles, totalFiles: result.totalFiles, chunks: result.totalChunks },
        'Indexed batch'
      );
    }

    logger.info(
        { indexedFiles: result.indexedFiles, totalFiles: result.totalFiles, totalChunks: result.totalChunks, errorCount: result.errors.length },
        'Indexing complete'
      );

    return result;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error({ err: msg }, 'Indexing failed');
    throw error;
  }
}

/**
 * Re-index specific files in a repository (user-scoped).
 */
export async function reindexFiles(
  octokit: Octokit,
  owner: string,
  repo: string,
  userId: string,
  filePaths: string[],
): Promise<void> {
  logger.info({ fileCount: filePaths.length, owner, repo }, 'Re-indexing files');

  const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
  const repoId = repoData.id;

  for (const filePath of filePaths) {
    try {
      await supabaseAdmin
        .from("documents")
        .delete()
        .eq("user_id", userId)
        .eq("metadata->>repo_id", repoId.toString())
        .eq("metadata->>file_path", filePath);

      const { data: content } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: filePath,
      });

      if (!("content" in content)) continue;

      const decoded = Buffer.from(content.content, "base64").toString("utf-8");
      const chunks = chunkText(decoded, 1000);

      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];
        const embedding = await generateEmbedding(chunk);

        await supabaseAdmin.from("documents").insert({
          user_id: userId,
          content: chunk,
          embedding: embedding,
          metadata: {
            repo_id: repoId,
            repo_name: `${owner}/${repo}`,
            file_path: filePath,
            chunk_index: chunkIndex,
            total_chunks: chunks.length,
            indexed_at: new Date().toISOString(),
          },
        });
      }

      logger.debug({ filePath }, 'Re-indexed file');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error({ err: msg, filePath }, 'Error re-indexing file');
    }
  }
}
