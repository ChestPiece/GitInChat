import { GithubEventPayload } from '@/lib/services/events';
import { EventHandlerMap } from './types';

export const handlers: EventHandlerMap = {
  push: (payload: any) => {
    const pusherName = payload.pusher?.name || payload.sender?.login || 'unknown';
    const commitCount = payload.commits?.length || 0;
    const refToken = payload.ref.split('/');
    const branch = refToken[refToken.length - 1];
    const message = payload.head_commit?.message || (commitCount > 0 ? `Pushed ${commitCount} commits` : 'Update');

    return {
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
  },

  pull_request: (payload: any) => {
    const action = payload.action;
    const number = payload.number;
    const title = payload.pull_request?.title;
    const user = payload.pull_request?.user?.login;

    return {
      type: 'pull_request',
      title: `PR ${action}: #${number}`,
      description: `${title} (by ${user})`,
      repo: payload.repository?.full_name,
      meta: { action, number, user }
    };
  },

  pull_request_review: (payload: any) => {
    const action = payload.action;
    const number = payload.pull_request?.number;
    const title = payload.pull_request?.title;
    const reviewer = payload.review?.user?.login;
    const state = payload.review?.state;

    return {
      type: 'pull_request_review',
      title: `PR Review: ${state}`,
      description: `#${number} ${title} (by ${reviewer})`,
      repo: payload.repository?.full_name,
      meta: { action, number, reviewer, state, url: payload.review?.html_url }
    };
  },

  commit_comment: (payload: any) => {
    const action = payload.action;
    const comment = payload.comment?.body;
    const user = payload.comment?.user?.login;
    const commitId = payload.comment?.commit_id?.substring(0, 7);

    return {
      type: 'commit_comment',
      title: `Comment on ${commitId}`,
      description: `${user}: ${comment?.substring(0, 50)}...`,
      repo: payload.repository?.full_name,
      meta: { action, user, commitId, url: payload.comment?.html_url }
    };
  },

  issue_comment: (payload: any) => {
    const action = payload.action;
    const comment = payload.comment?.body;
    const user = payload.comment?.user?.login;
    const issueNumber = payload.issue?.number;
    const issueTitle = payload.issue?.title;

    return {
      type: 'issue_comment',
      title: `Comment on #${issueNumber}`,
      description: `${user}: ${comment?.substring(0, 50)}...`,
      repo: payload.repository?.full_name,
      meta: { action, user, issueNumber, issueTitle, url: payload.comment?.html_url }
    };
  },

  label: (payload: any) => {
    const action = payload.action;
    const labelName = payload.label?.name;
    const startColor = payload.label?.color;

    return {
      type: 'label',
      title: `Label ${action}: ${labelName}`,
      description: `Color: #${startColor}`,
      repo: payload.repository?.full_name,
      meta: { action, labelName, color: startColor }
    };
  },

  milestone: (payload: any) => {
    const action = payload.action;
    const title = payload.milestone?.title;
    const state = payload.milestone?.state;

    return {
      type: 'milestone',
      title: `Milestone ${action}: ${title}`,
      description: `State: ${state}`,
      repo: payload.repository?.full_name,
      meta: { action, title, state, url: payload.milestone?.html_url }
    };
  },

  issues: (payload: any) => {
    const action = payload.action;
    const number = payload.issue?.number;
    const title = payload.issue?.title;
    const user = payload.issue?.user?.login;

    return {
      type: 'issue',
      title: `Issue ${action}: #${number}`,
      description: `${title} (by ${user})`,
      repo: payload.repository?.full_name,
      meta: { action, number, user, url: payload.issue?.html_url }
    };
  },

  workflow_run: (payload: any) => {
    const action = payload.action;
    const usage = payload.workflow_run?.name;
    const conclusion = payload.workflow_run?.conclusion;

    return {
      type: 'workflow_run',
      title: `Workflow: ${usage}`,
      description: `Status: ${conclusion || 'in_progress'}`,
      repo: payload.repository?.full_name,
      meta: { action, conclusion, url: payload.workflow_run?.html_url }
    };
  },

  release: (payload: any) => {
    const action = payload.action;
    const tagName = payload.release?.tag_name;
    const releaseName = payload.release?.name;

    return {
      type: 'release',
      title: `Release: ${tagName}`,
      description: releaseName,
      repo: payload.repository?.full_name,
      meta: { action, tagName, url: payload.release?.html_url }
    };
  },

  deployment_status: (payload: any) => {
    const state = payload.deployment_status?.state;
    const environment = payload.deployment?.environment;

    return {
      type: 'deployment_status',
      title: `Deploy to ${environment}`,
      description: `Status: ${state}`,
      repo: payload.repository?.full_name,
      meta: { state, environment, url: payload.deployment_status?.target_url }
    };
  },

  watch: (payload: any) => {
    const action = payload.action;
    const user = payload.sender?.login;
    const stars = payload.repository?.stargazers_count;

    return {
      type: 'watch',
      title: `New Star! ⭐`,
      description: `Stargazer: ${user} (Total: ${stars})`,
      repo: payload.repository?.full_name,
      meta: { action, user, stars }
    };
  },

  fork: (payload: any) => {
    const forkee = payload.forkee?.full_name;
    const user = payload.sender?.login;

    return {
      type: 'fork',
      title: `Fork Created 🍴`,
      description: `Fork: ${forkee} (by ${user})`,
      repo: payload.repository?.full_name,
      meta: { forkee, user }
    };
  }
};
