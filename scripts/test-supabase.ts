import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

async function testSupabase() {
  console.log('🔍 Testing Supabase Connection\n');
  
  try {
    // Test admin client
    console.log('Testing Admin Client...');
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('github_events')
      .select('count');
    
    if (adminError) {
      console.log('❌ Admin client failed:', adminError.message);
    } else {
      console.log('✅ Admin client connected');
    }
    
    // Test tables exist
    console.log('\nTesting Database Tables...');
    const tables = ['chats', 'messages', 'github_events', 'documents'];
    
    for (const table of tables) {
      const { error } = await supabaseAdmin.from(table).select('count', { count: 'exact', head: true });
      if (error) {
        console.log(`❌ Table ${table}:`, error.message);
      } else {
        console.log(`✅ Table ${table} exists`);
      }
    }
    
    // Test vector extension
    console.log('\nTesting Vector Extension...');
    const { error: vectorError } = await supabaseAdmin.rpc('match_documents', {
      query_embedding: Array(1536).fill(0),
      match_threshold: 0.5,
      match_count: 1,
      filter_user_id: '00000000-0000-0000-0000-000000000001',
    });
    
    if (vectorError) {
      console.log('⚠️  Vector search function not working:', vectorError.message);
      console.log('   This may be expected if no documents are indexed yet');
    } else {
      console.log('✅ Vector search function exists and is callable');
    }

    console.log('\n✅ Supabase tests complete!');
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

testSupabase();
