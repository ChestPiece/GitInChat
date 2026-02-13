import { GithubEventPayload } from '@/lib/services/events';

export interface WebhookHandlerContext {
  eventName: string;
  payload: any;
}

export type WebhookHandler = (payload: any) => GithubEventPayload | null;

export type EventHandlerMap = Record<string, WebhookHandler>;
