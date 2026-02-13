import { GithubEventPayload } from '@/lib/services/events';
import { handlers } from './handlers';

export function dispatchEvent(eventName: string, payload: any): GithubEventPayload | null {
  const handler = handlers[eventName];
  
  if (!handler) {
    console.log(`[GitHub Webhook] Skipped unsupported event: ${eventName}`);
    return null;
  }

  try {
    const eventPayload = handler(payload);
    if (eventPayload) {
      console.log(`[GitHub Webhook] Processed ${eventName}: ${eventPayload.title}`);
    }
    return eventPayload;
  } catch (error) {
    console.error(`[GitHub Webhook] Error handling ${eventName}:`, error);
    return null;
  }
}
