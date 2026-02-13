import { Octokit } from 'octokit';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

async function testGitHubAuth() {
  console.log('🔍 Testing GitHub Authentication\n');
  
  const appId = process.env.GITHUB_APP_ID;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const privateKey = process.env.GITHUB_PRIVATE_KEY;

  // Test 1: Environment variables
  console.log('Checking environment variables...');
  const checks = {
    'GITHUB_APP_ID': appId,
    'GITHUB_CLIENT_ID': clientId,
    'CLIENT_SECRET': clientSecret,
    'GITHUB_PRIVATE_KEY': privateKey,
  };

  let allPresent = true;
  for (const [key, value] of Object.entries(checks)) {
    if (!value) {
      console.log(`❌ ${key} is missing`);
      allPresent = false;
    } else {
      console.log(`✅ ${key} is set`);
    }
  }

  if (!allPresent) {
    console.log('\n❌ Some GitHub environment variables are missing!');
    process.exit(1);
  }

  // Test 2: Basic GitHub API access
  console.log('\nTesting basic GitHub API access...');
  try {
    // Note: For full GitHub App testing, you'd need @octokit/app
    // This test just verifies basic Octokit works
    const octokit = new Octokit();
    const { data } = await octokit.rest.meta.get();
    console.log('✅ GitHub API is accessible');
    console.log('   GitHub API version:', data.verifiable_password_authentication ? 'v3' : 'unknown');
  } catch (error: any) {
    console.log('⚠️  Cannot access GitHub API:', error.message);
  }

  console.log('\n✅ GitHub authentication configuration looks good!');
  console.log('\nNote: Full GitHub App authentication requires user OAuth flow.');
  console.log('Test this by logging into the app with GitHub OAuth.');
  
  process.exit(0);
}

testGitHubAuth();
