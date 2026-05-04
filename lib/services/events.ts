import { supabaseAdmin } from "@/lib/supabase/admin";

export interface GithubEventPayload {
  type: string;
  title: string;
  description: string;
  repo: string;
  repoOwner?: string | null;
  meta: Record<string, any>;
}

type SaveEventResult = "saved" | "duplicate";

/**
 * Persists a standardized GitHub event to the database.
 * This is used for the Activity Feed and AI context.
 */
export async function saveGithubEvent(
  payload: GithubEventPayload,
  deliveryId?: string | null,
  userId?: string | null,
): Promise<SaveEventResult> {
  try {
    const { error } = await supabaseAdmin.from("github_events").insert({
      github_delivery_id: deliveryId ?? null,
      type: payload.type,
      payload: payload, // Store the whole simplified payload for easy rendering
      repo_name: payload.repo,
      repo_owner: payload.repoOwner ?? null,
      actor: payload.description.split(":")[0] || "System", // Simple heuristic for actor
      user_id: userId ?? null, // Track which user received this event
      created_at: new Date().toISOString(),
    });

    if (error) {
      if ((error as { code?: string }).code === "23505") {
        console.log("[Events Service] Duplicate GitHub delivery ignored");
        return "duplicate";
      }
      throw error;
    } else {
      console.log("[Events Service] Event saved to DB");
      return "saved";
    }
  } catch (err) {
    console.error("[Events Service] Unexpected error:", err);
    throw err;
  }
}

/**
 * Fetches recent GitHub events for a specific user (RLS-compliant).
 * Filters by user_id to prevent cross-user data exposure.
 * If userId is not provided, returns empty array for safety.
 */
export async function getRecentEvents(
  limitOrUserId?: number | string,
  limitIfUserIdProvided?: number,
) {
  let userId: string | undefined;
  let limit: number = 10;

  // Handle both old and new calling conventions
  if (typeof limitOrUserId === "string") {
    // New convention: getRecentEvents(userId, limit?)
    userId = limitOrUserId;
    limit = limitIfUserIdProvided || 10;
  } else if (typeof limitOrUserId === "number") {
    // Old convention (deprecated): getRecentEvents(limit)
    // For backward compatibility, but still requires manual user_id handling
    limit = limitOrUserId;
  }

  // Always require user_id to respect RLS
  if (!userId) {
    console.warn(
      "[Events Service] Missing user_id for event retrieval - returning empty for security",
    );
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("github_events")
    .select("*")
    .eq("user_id", userId) // ← RLS-compliant: filter by authenticated user
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[Events Service] Failed to fetch events:", error);
    return [];
  }
  return data;
}
