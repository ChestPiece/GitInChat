// Load environment variables from .env file
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

// Test Environment Variables
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'GITHUB_APP_ID',
  'GITHUB_CLIENT_ID',
  'CLIENT_SECRET',
  'GITHUB_PRIVATE_KEY',
  'GITHUB_WEBHOOK_SECRET',
  'smee-webhook-url',
];

console.log('🔍 Environment Variables Check\n');

let allPresent = true;
const missing: string[] = [];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const display = value 
    ? (value.substring(0, 10) + '...')
    : 'MISSING';
  
  console.log(`${status} ${varName}: ${display}`);
  
  if (!value) {
    allPresent = false;
    missing.push(varName);
  }
});

if (allPresent) {
  console.log('\n✅ All required environment variables are set!');
  process.exit(0);
} else {
  console.log('\n❌ Some environment variables are missing!');
  console.log('Missing:', missing.join(', '));
  process.exit(1);
}
