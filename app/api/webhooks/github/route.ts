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
  const requestId = crypto.randomUUID();

  try {
    const body = await req.text();
    const headerList = await headers();
    const signature = headerList.get("x-hub-signature-256");
    const event = headerList.get("x-github-event");
    const deliveryId = headerList.get("x-github-delivery");

    // HR-03: Consistent error codes
    if (!signature) {
      logger.warn({ requestId }, "Webhook missing signature");
      return new Response(
        JSON.stringify({ error: "Invalid request", code: "INVALID_REQUEST" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Verify security signature
    if (!(await webhooks.verify(body, signature))) {
      logger.warn({ requestId }, "Webhook signature verification failed");
      return new Response(
        JSON.stringify({ error: "Unauthorized", code: "UNAUTHORIZED" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const payload = JSON.parse(body);
    const repoOwner =
      payload?.repository?.owner?.login ??
      payload?.repository?.owner?.name ??
      null;

    if (!event) {
      logger.warn({ requestId }, "Webhook missing event header");
      return new Response(
        JSON.stringify({ error: "Invalid request", code: "INVALID_REQUEST" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    logger.info(
      { event, repo: payload.repository?.full_name, requestId },
      "GitHub webhook received",
    );

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
        logger.debug({ deliveryId, requestId }, "Duplicate webhook delivery");
        return new Response(
          JSON.stringify({ message: "Processed", code: "OK" }),
          {
            status: 202,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // 2. Broadcast to 'github-updates' channel (Realtime UI)
      const ownerChannel = repoOwner
        ? `github-updates:${String(repoOwner).toLowerCase()}`
        : "github-updates:unknown";

      const status = await supabaseAdmin.channel(ownerChannel).send({
        type: "broadcast",
        event: "event",
        payload: ownerScopedPayload,
      });

      // Also broadcast to user's personal channel for their own events
      const userChannel = `github-updates:user`;
      await supabaseAdmin.channel(userChannel).send({
        type: "broadcast",
        event: "event",
        payload: ownerScopedPayload,
      });

      if (status !== "ok") {
        logger.error(
          { status, event: broadcastPayload.type, requestId },
          "Webhook broadcast failed",
        );
        // HR-03: Don't return 500 for broadcast issues (not client error)
        // Log for monitoring but return 202 to avoid retry loops
        return new Response(
          JSON.stringify({
            message: "Processed (broadcast delayed)",
            code: "OK",
          }),
          {
            status: 202,
            headers: { "Content-Type": "application/json" },
          },
        );
      } else {
        logger.debug(
          { channel: ownerChannel, requestId },
          "Webhook broadcast sent",
        );
      }
    } else {
      logger.debug({ event, requestId }, "Webhook event skipped (unsupported)");
      return new Response(
        JSON.stringify({ message: "Processed", code: "OK" }),
        {
          status: 202,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ message: "Processed", code: "OK" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    // HR-03: Don't leak internal error details
    logger.error({ error, requestId }, "Webhook processing failed");
    return new Response(
      JSON.stringify({
        error: "Internal error",
        code: "INTERNAL_ERROR",
        requestId,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
