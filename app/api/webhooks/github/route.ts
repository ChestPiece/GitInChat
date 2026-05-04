import { Webhooks } from "@octokit/webhooks";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { saveGithubEvent } from "@/lib/services/events";
import { dispatchEvent } from "@/lib/github/webhooks/dispatcher";
import { logger } from "@/lib/logger";
import { createErrorResponse, mapErrorToCode, ErrorCode } from "@/lib/errors";

const webhooks = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET!,
});

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headerList = await headers();
    const signature = headerList.get("x-hub-signature-256");
    const event = headerList.get("x-github-event");
    const deliveryId = headerList.get("x-github-delivery");

    if (!signature) {
      return new Response("Missing signature", { status: 401 });
    }

    // Verify security signature
    if (!(await webhooks.verify(body, signature))) {
      return new Response("Unauthorized", { status: 401 });
    }

    const payload = JSON.parse(body);
    const repoOwner =
      payload?.repository?.owner?.login ??
      payload?.repository?.owner?.name ??
      null;

    if (!event) {
      return new Response("Missing event header", { status: 400 });
    }

    logger.info({ event, repo: payload.repository?.full_name }, 'GitHub webhook received');

    // Strategy Pattern: Dispatch to specific handler
    const broadcastPayload = dispatchEvent(event, payload);

    if (broadcastPayload) {
      const ownerScopedPayload = {
        ...broadcastPayload,
        repoOwner,
      };

      // 1. Persist to DB (for history/context)
      const persisted = await saveGithubEvent(ownerScopedPayload, deliveryId);
      if (persisted === "duplicate" && deliveryId) {
        return new Response("Duplicate delivery", { status: 202 });
      }

      // 2. Broadcast to 'github-updates' channel (Realtime UI)
      const ownerChannel = repoOwner
        ? `github-updates:${String(repoOwner).toLowerCase()}`
        : "github-updates:unknown";

      const status = await supabaseAdmin.channel(ownerChannel).send({
        type: "broadcast",
        event: "event", // Generic event name, we separate by payload.type
        payload: ownerScopedPayload,
      });

      if (status !== "ok") {
        logger.error({ status, event: broadcastPayload.type }, 'Supabase broadcast failed');
        return new Response("Accepted", { status: 202 });
      } else {
        logger.debug({ channel: ownerChannel }, 'Broadcast sent successfully');
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error: unknown) {
    const { code, status } = mapErrorToCode(error);
    const requestId = crypto.randomUUID();
    logger.error({ error, requestId }, 'GitHub webhook processing failed');
    return createErrorResponse(code, "Failed to process webhook", { status, requestId });
  }
}
