import { Webhooks } from "@octokit/webhooks";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { saveGithubEvent } from "@/lib/services/events";

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
    } else if (event === "pull_request_review") {
      const action = payload.action;
      const number = payload.pull_request?.number;
      const title = payload.pull_request?.title;
      const reviewer = payload.review?.user?.login;
      const state = payload.review?.state; // approved, changes_requested, etc.

      console.log(`[GitHub Webhook] PR Review ${state}: #${number} by ${reviewer}`);

      broadcastPayload = {
        type: 'pull_request_review',
        title: `PR Review: ${state}`,
        description: `#${number} ${title} (by ${reviewer})`,
        repo: payload.repository?.full_name,
        meta: {
           action,
           number,
           reviewer,
           state,
           url: payload.review?.html_url
        }
      };
    } else if (event === "commit_comment") {
      const action = payload.action;
      const comment = payload.comment?.body;
      const user = payload.comment?.user?.login;
      const commitId = payload.comment?.commit_id?.substring(0, 7);

      console.log(`[GitHub Webhook] Commit Comment by ${user} on ${commitId}`);

      broadcastPayload = {
        type: 'commit_comment',
        title: `Comment on ${commitId}`,
        description: `${user}: ${comment?.substring(0, 50)}...`,
        repo: payload.repository?.full_name,
        meta: {
           action,
           user,
           commitId,
           url: payload.comment?.html_url
        }
      };
    } else if (event === "issue_comment") {
      const action = payload.action;
      const comment = payload.comment?.body;
      const user = payload.comment?.user?.login;
      const issueNumber = payload.issue?.number;
      const issueTitle = payload.issue?.title;

      console.log(`[GitHub Webhook] Issue Comment by ${user} on #${issueNumber}`);

      broadcastPayload = {
        type: 'issue_comment',
        title: `Comment on #${issueNumber}`,
        description: `${user}: ${comment?.substring(0, 50)}...`,
        repo: payload.repository?.full_name,
        meta: {
           action,
           user,
           issueNumber,
           issueTitle,
           url: payload.comment?.html_url
        }
      };
    } else if (event === "label") {
      const action = payload.action;
      const labelName = payload.label?.name;
      const startColor = payload.label?.color;

      console.log(`[GitHub Webhook] Label ${action}: ${labelName}`);

      broadcastPayload = {
        type: 'label',
        title: `Label ${action}: ${labelName}`,
        description: `Color: #${startColor}`,
        repo: payload.repository?.full_name,
        meta: {
           action,
           labelName,
           color: startColor
        }
      };
    } else if (event === "milestone") {
      const action = payload.action;
      const title = payload.milestone?.title;
      const state = payload.milestone?.state;

      console.log(`[GitHub Webhook] Milestone ${action}: ${title}`);

      broadcastPayload = {
        type: 'milestone',
        title: `Milestone ${action}: ${title}`,
        description: `State: ${state}`,
        repo: payload.repository?.full_name,
        meta: {
           action,
           title,
           state,
           url: payload.milestone?.html_url
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
           user,
           url: payload.issue?.html_url
        }
      };
    } else if (event === "workflow_run") {
      const action = payload.action;
      const usage = payload.workflow_run?.name;
      const conclusion = payload.workflow_run?.conclusion; // success, failure, null (in progress)
      
      console.log(`[GitHub Webhook] Workflow ${usage}: ${conclusion}`);

      broadcastPayload = {
        type: 'workflow_run',
        title: `Workflow: ${usage}`,
        description: `Status: ${conclusion || 'in_progress'}`,
        repo: payload.repository?.full_name,
        meta: {
           action,
           conclusion,
           url: payload.workflow_run?.html_url
        }
      };
    } else if (event === "release") {
      const action = payload.action;
      const tagName = payload.release?.tag_name;
      const releaseName = payload.release?.name;

      console.log(`[GitHub Webhook] Release ${tagName}`);

      broadcastPayload = {
        type: 'release',
        title: `Release: ${tagName}`,
        description: releaseName,
        repo: payload.repository?.full_name,
        meta: {
           action,
           tagName,
           url: payload.release?.html_url
        }
      };
    } else if (event === "deployment_status") {
      const state = payload.deployment_status?.state;
      const environment = payload.deployment?.environment;
      
      console.log(`[GitHub Webhook] Deploy to ${environment}: ${state}`);

      broadcastPayload = {
        type: 'deployment_status',
        title: `Deploy to ${environment}`,
        description: `Status: ${state}`,
        repo: payload.repository?.full_name,
        meta: {
           state,
           environment,
           url: payload.deployment_status?.target_url
        }
      };
    } else if (event === "watch") { // Star
      const action = payload.action;
      const user = payload.sender?.login;
      const stars = payload.repository?.stargazers_count;

      console.log(`[GitHub Webhook] Star by ${user}`);

      broadcastPayload = {
        type: 'watch',
        title: `New Star! ⭐`,
        description: `Stargazer: ${user} (Total: ${stars})`,
        repo: payload.repository?.full_name,
        meta: {
           action,
           user,
           stars
        }
      };
    } else if (event === "fork") {
      const forkee = payload.forkee?.full_name;
      const user = payload.sender?.login;

      console.log(`[GitHub Webhook] Fork by ${user}`);

      broadcastPayload = {
        type: 'fork',
        title: `Fork Created 🍴`,
        description: `Fork: ${forkee} (by ${user})`,
        repo: payload.repository?.full_name,
        meta: {
           forkee,
           user
        }
      };
    }

    if (broadcastPayload) {
      // 1. Persist to DB
      await saveGithubEvent(broadcastPayload as any);

      // 2. Broadcast to 'github-updates' channel
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
  } catch (error: any) {
    console.error("[GitHub Webhook] Error processing request:", error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
