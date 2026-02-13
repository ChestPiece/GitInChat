import crypto from 'crypto';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

console.log('🔍 Testing Webhook Signature Verification\n');

const testPayload = JSON.stringify({ test: 'data', timestamp: Date.now() });
const secret = process.env.GITHUB_WEBHOOK_SECRET;

if (!secret) {
  console.log('❌ GITHUB_WEBHOOK_SECRET is not set!');
  process.exit(1);
}

const hmac = crypto.createHmac('sha256', secret);
const signature = 'sha256=' + hmac.update(testPayload).digest('hex');

const isValid = verifySignature(testPayload, signature, secret);

console.log('Test Payload:', testPayload);
console.log('Generated Signature:', signature.substring(0, 20) + '...');
console.log('Verification Result:', isValid ? '✅ Valid' : '❌ Invalid');

if (isValid) {
  console.log('\n✅ Webhook signature verification is working correctly!');
  process.exit(0);
} else {
  console.log('\n❌ Webhook signature verification failed!');
  process.exit(1);
}
