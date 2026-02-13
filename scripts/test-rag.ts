import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import { supabaseAdmin } from '@/lib/supabase/admin';

async function testRAG() {
  console.log('🧠 Testing RAG Pipeline\n');

  let allPassed = true;

  // 1. Test documents table exists
  console.log('1️⃣ Testing documents table...');
  try {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('count');

    if (error) {
      console.log('   ❌ Documents table error:', error.message);
      allPassed = false;
    } else {
      console.log('   ✅ Documents table exists');
    }
  } catch (error: any) {
    console.log('   ❌ Documents table test failed:', error.message);
    allPassed = false;
  }

  // 2. Test match_documents function exists
  console.log('\n2️⃣ Testing match_documents RPC function...');
  try {
   const testEmbedding = Array(1536).fill(0);
    const { data, error } = await supabaseAdmin
      .rpc('match_documents', {
        query_embedding: testEmbedding,
        match_threshold: 0.5,
        match_count: 3,
      });

    if (error) {
      console.log('   ❌ match_documents RPC error:', error.message);
      allPassed = false;
    } else {
      console.log('   ✅ match_documents function is callable');
      console.log(`   📊 Returned ${data?.length || 0} results`);
    }
  } catch (error: any) {
    console.log('   ❌ match_documents test failed:', error.message);
    allPassed = false;
  }

  // 3. Test OpenAI embedding generation
  console.log('\n3️⃣ Testing OpenAI embedding generation...');
  try {
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: 'Hello world',
    });

    console.log('   ✅ OpenAI embedding generated successfully');
    console.log(`   📏 Embedding dimension: ${embedding.length}`);

    if (embedding.length !== 1536) {
      console.log('   ⚠️  Warning: Expected 1536 dimensions, got', embedding.length);
    }
  } catch (error: any) {
    console.log('   ❌ OpenAI embedding test failed:', error.message);
    allPassed = false;
  }

  // 4. Test RAG modules import
  console.log('\n4️⃣ Testing RAG module imports...');
  try {
    const { generateEmbedding, chunkText } = await import('@/lib/rag/embeddings');
    const { searchSimilarDocuments } = await import('@/lib/rag/search');
    const { indexRepository } = await import('@/lib/rag/indexer');

    console.log('   ✅ embeddings.ts imported successfully');
    console.log('   ✅ search.ts imported successfully');
    console.log('   ✅ indexer.ts imported successfully');

    // Test text chunking
    const testText = 'This is a test.\n\nThis is another paragraph.';
    const chunks = chunkText(testText, 50);
    console.log(`   ✅ Text chunking works (${chunks.length} chunks created)`);
  } catch (error: any) {
    console.log('   ❌ RAG module import failed:', error.message);
    allPassed = false;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('✅ All RAG pipeline tests PASSED!');
    console.log('\n📚 RAG System is ready to use.');
    console.log('   Next steps:');
    console.log('   1. Index a repository: npx tsx scripts/index-repository.ts <owner> <repo>');
    console.log('   2. Ask questions about the indexed code in the chat');
  } else {
    console.log('❌ Some RAG tests FAILED. Please review errors above.');
  }
  console.log('='.repeat(50));

  process.exit(allPassed ? 0 : 1);
}

testRAG();
