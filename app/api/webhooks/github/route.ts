import { Webhooks } from "@octokit/webhooks";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin Client for broadcasting
// VibeSec: Naming convention should NOT start with NEXT_PUBLIC for service role keys to prevent leak.
// We need Service Role Key because usually Anon key shouldn't be able to broadcast freely if policies restrict it
// But for now we use what we have available. If SERVICE_ROLE is missing, we try ANON but it might fail if RLS forbids.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
    
    console.log(`[GitHub Webhook] Received ${event} event for ${payload.repository?.full_name}`);

    let broadcastPayload = null;

    if (event === "push") {
      const pusherName = payload.pusher?.name || payload.sender?.login || 'unknown';
      const commitCount = payload.commits?.length || 0;
      const refToken = payload.ref.split('/');
      const branch = refToken[refToken.length - 1];
      const message = payload.head_commit?.message || (commitCount > 0 ? `Pushed ${commitCount} commits` : 'Update');

      console.log(`[GitHub Webhook] PUSH: ${pusherName} -> ${branch}: ${message}`);

      broadcastPayload = {
        type: 'push',
        title: `Push to ${branch}`,
        description: `${pusherName}: ${message}`,
        repo: payload.repository?.full_name,
        meta: {
          pusher: pusherName,
          branch,
          commits: commitCount
        }
      };
    } else if (event === "pull_request") {
      const action = payload.action;
      const number = payload.number;
      const title = payload.pull_request?.title;
      const user = payload.pull_request?.user?.login;

      console.log(`[GitHub Webhook] PR ${action}: #${number} ${title} by ${user}`);

      broadcastPayload = {
        type: 'pull_request',
        title: `PR ${action}: #${number}`,
        description: `${title} (by ${user})`,
        repo: payload.repository?.full_name,
        meta: {
           action,
           number,
           user
        }
      };
    } else if (event === "issues") {
      const action = payload.action;
      const number = payload.issue?.number;
      const title = payload.issue?.title;
      const user = payload.issue?.user?.login;

      console.log(`[GitHub Webhook] Issue ${action}: #${number} ${title} by ${user}`);

      broadcastPayload = {
        type: 'issue',
        title: `Issue ${action}: #${number}`,
        description: `${title} (by ${user})`,
        repo: payload.repository?.full_name,
        meta: {
           action,
           number,
           user
        }
      };
    }

    if (broadcastPayload) {
      // Broadcast to 'github-updates' channel
      // Broadcast to 'github-updates' channel
      const status = await supabase.channel('github-updates').send({
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
  } catch (error: any) {
    console.error("[GitHub Webhook] Error processing request:", error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
