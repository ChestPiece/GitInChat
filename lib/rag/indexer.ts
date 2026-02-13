import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateEmbedding, chunkText } from './embeddings';
import type { Octokit } from 'octokit';

interface IndexResult {
  totalFiles: number;
  indexedFiles: number;
  totalChunks: number;
  errors: string[];
}

/**
 * Index a GitHub repository by fetching all code files and storing them
 * with embeddings in the documents table.
 */
export async function indexRepository(
  octokit: Octokit,
  owner: string,
  repo: string,
  options: {
    branch?: string;
    filePatterns?: RegExp[];
    maxFileSize?: number;
  } = {}
): Promise<IndexResult> {
  const {
    branch = 'HEAD',
    filePatterns = [/\.(ts|tsx|js|jsx|py|java|go|rs|md|txt)$/],
    maxFileSize = 100000, // 100KB
  } = options;

  const result: IndexResult = {
    totalFiles: 0,
    indexedFiles: 0,
    totalChunks: 0,
    errors: [],
  };

  try {
    // Get repository info
    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    const repoId = repoData.id;

    console.log(`📥 Indexing repository: ${owner}/${repo}`);

    // Get repository tree
    const { data: tree } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: 'true',
    });

    // Filter for code files
    const codeFiles = tree.tree.filter((item) => {
      if (item.type !== 'blob' || !item.path) return false;
      return filePatterns.some((pattern) => pattern.test(item.path!));
    });

    result.totalFiles = codeFiles.length;
    console.log(`📄 Found ${codeFiles.length} code files to index`);

    // Delete existing documents for this repo (fresh indexing)
    const { error: deleteError } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('metadata->>repo_id', repoId.toString());

    if (deleteError) {
      console.warn('⚠️  Could not delete old documents:', deleteError.message);
    }

    // Process files in batches
    const batchSize = 5;
    for (let i = 0; i < codeFiles.length; i += batchSize) {
      const batch = codeFiles.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (file) => {
          try {
            if (!file.path) return;

            // Get file content
            const { data: content } = await octokit.rest.repos.getContent({
              owner,
              repo,
              path: file.path,
              ref: branch,
            });

            if (!('content' in content)) return;

            const decoded = Buffer.from(content.content, 'base64').toString('utf-8');

            // Skip files that are too large
            if (decoded.length > maxFileSize) {
              result.errors.push(`File too large: ${file.path} (${decoded.length} bytes)`);
              return;
            }

            // Chunk the content for better embedding quality
            const chunks = chunkText(decoded, 1000);

            // Generate embeddings for all chunks
            for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
              const chunk = chunks[chunkIndex];
              const embedding = await generateEmbedding(chunk);

              // Store in database
              const { error: insertError } = await supabaseAdmin
                .from('documents')
                .insert({
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
                result.errors.push(`Error indexing ${file.path}: ${insertError.message}`);
              } else {
                result.totalChunks++;
              }
            }

            result.indexedFiles++;
          } catch (error: any) {
            result.errors.push(`Error processing ${file.path}: ${error.message}`);
          }
        })
      );

      console.log(
        `✅ Indexed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          codeFiles.length / batchSize
        )} (${result.indexedFiles}/${result.totalFiles} files, ${result.totalChunks} chunks)`
      );
    }

    console.log(`\n✅ Indexing complete!`);
    console.log(`   Files indexed: ${result.indexedFiles}/${result.totalFiles}`);
    console.log(`   Total chunks: ${result.totalChunks}`);
    if (result.errors.length > 0) {
      console.log(`   Errors: ${result.errors.length}`);
    }

    return result;
  } catch (error: any) {
    console.error('❌ Indexing failed:', error.message);
    throw error;
  }
}

/**
 * Re-index specific files in a repository (useful for webhook updates)
 */
export async function reindexFiles(
  octokit: Octokit,
  owner: string,
  repo: string,
  filePaths: string[]
): Promise<void> {
  console.log(`🔄 Re-indexing ${filePaths.length} files in ${owner}/${repo}`);

  const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
  const repoId = repoData.id;

  for (const filePath of filePaths) {
    try {
      // Delete old chunks for this file
      await supabaseAdmin
        .from('documents')
        .delete()
        .eq('metadata->>repo_id', repoId.toString())
        .eq('metadata->>file_path', filePath);

      // Get new content
      const { data: content } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: filePath,
      });

      if (!('content' in content)) continue;

      const decoded = Buffer.from(content.content, 'base64').toString('utf-8');
      const chunks = chunkText(decoded, 1000);

      // Re-index
      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];
        const embedding = await generateEmbedding(chunk);

        await supabaseAdmin.from('documents').insert({
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

      console.log(`✅ Re-indexed: ${filePath}`);
    } catch (error: any) {
      console.error(`❌ Error re-indexing ${filePath}:`, error.message);
    }
  }
}
