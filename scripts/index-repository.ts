import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

import { createClient } from '@/lib/supabase/server';
import { getGitHubClient } from '@/lib/github/client';
import { indexRepository } from '@/lib/rag/indexer';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: npx tsx scripts/index-repository.ts <owner> <repo> [branch]');
    console.log('Example: npx tsx scripts/index-repository.ts facebook react main');
    process.exit(1);
  }

  const [owner, repo, branch] = args;

  console.log('🚀 Starting repository indexing...');
  console.log(`   Repository: ${owner}/${repo}`);
  console.log(`   Branch: ${branch || 'HEAD'}\n`);

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    const userId = user?.id;
    if (userError || !userId) {
      console.error(
        'No Supabase user session. Sign in via the app first, or use a script that sets user context.'
      );
      process.exit(1);
    }

    const octokit = await getGitHubClient();

    const result = await indexRepository(octokit, owner, repo, {
      userId,
      branch,
      filePatterns: [
        /\.(ts|tsx|js|jsx)$/,      // TypeScript/JavaScript
        /\.(py)$/,                  // Python
        /\.(java|kt)$/,             // Java/Kotlin
        /\.(go)$/,                  // Go
        /\.(rs)$/,                  // Rust
        /\.(md|txt)$/,              // Documentation
        /\.(yml|yaml|json)$/,       // Config files
      ],
      maxFileSize: 200000, // 200KB
    });

    console.log('\n📊 Indexing Results:');
    console.log(`   ✅ Files indexed: ${result.indexedFiles}/${result.totalFiles}`);
    console.log(`   📦 Total chunks: ${result.totalChunks}`);
    
    if (result.errors.length > 0) {
      console.log(`\n⚠️  Errors encountered (${result.errors.length}):`);
      result.errors.slice(0, 5).forEach(error => console.log(`   - ${error}`));
      if (result.errors.length > 5) {
        console.log(`   ... and ${result.errors.length - 5} more`);
      }
    }

    console.log('\n✅ Repository indexing complete!');
    console.log('   You can now ask questions about this repository in the chat.');
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Indexing failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
