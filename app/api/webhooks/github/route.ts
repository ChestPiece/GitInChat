import { Webhooks } from "@octokit/webhooks";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { saveGithubEvent } from "@/lib/services/events";
import { dispatchEvent } from '@/lib/github/webhooks/dispatcher';

const webhooks = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET!,
});

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headerList = await headers();
    const signature = headerList.get("x-hub-signature-256");
    const event = headerList.get("x-github-event");

    if (!signature) {
      return new Response("Missing signature", { status: 401 });
    }

    // Verify security signature
    if (!(await webhooks.verify(body, signature))) {
      return new Response("Unauthorized", { status: 401 });
    }

    const payload = JSON.parse(body);
    
    if (!event) {
        return new Response("Missing event header", { status: 400 });
    }

    console.log(`[GitHub Webhook] Received ${event} event for ${payload.repository?.full_name}`);

    // Strategy Pattern: Dispatch to specific handler
    const broadcastPayload = dispatchEvent(event, payload);

    if (broadcastPayload) {
      // 1. Persist to DB (for history/context)
      await saveGithubEvent(broadcastPayload);

      // 2. Broadcast to 'github-updates' channel (Realtime UI)
      const status = await supabaseAdmin.channel('github-updates').send({
        type: 'broadcast',
        event: 'event', // Generic event name, we separate by payload.type
        payload: broadcastPayload
      });

      if (status !== 'ok') {
        console.error('[GitHub Webhook] Supabase Broadcast Error Status:', status);
      } else {
        console.log('[GitHub Webhook] Broadcast sent successfully');
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error: unknown) {
    console.error("[GitHub Webhook] Error processing request:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
