
const SmeeClient = require('smee-client');
require('dotenv').config();

const webhookUrl = process.env.GITHUB_WEBHOOK_URL || process.env['smee-webhook-url'] || 'https://smee.io/6QxjrxJmGyc0vjW';

if (!webhookUrl || !webhookUrl.startsWith('http')) {
    console.error('Error: GITHUB_WEBHOOK_URL is missing or invalid in .env');
    process.exit(1);
}

const smee = new SmeeClient({
  source: webhookUrl,
  target: 'http://localhost:3000/api/webhooks/github',
  logger: console
});

console.log('🚀 Starting Smee Client...');
console.log(`📡 Source: ${webhookUrl}`);
console.log(`🎯 Target: http://localhost:3000/api/webhooks/github`);

const events = smee.start();

// Stop forwarding events
// events.close();
