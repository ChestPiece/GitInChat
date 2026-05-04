import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const debugSecret = process.env.DEBUG_WEBHOOK_SECRET;

    const isProduction = process.env.NODE_ENV === "production";

    // Production: always require secret
    if (isProduction && !debugSecret) {
      return new Response("Not found", { status: 404 });
    }

    // Production: verify secret
    if (isProduction) {
      if (authHeader !== `Bearer ${debugSecret}`) {
        return new Response("Unauthorized", { status: 401 });
      }
    } else {
      // Development: secret OR session auth
      if (debugSecret && authHeader !== `Bearer ${debugSecret}`) {
        // Secret provided but invalid - require valid secret
        return new Response("Unauthorized", { status: 401 });
      }
      // No secret - fall back to session auth
      if (!debugSecret) {
        const supabase = await createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          return new Response("Unauthorized", { status: 401 });
        }
      }
    }

    const body = await req.text();
    return new Response(
      JSON.stringify({
        message: "webhook debug",
        NODE_ENV: process.env.NODE_ENV,
        secretSet: !!process.env.GITHUB_WEBHOOK_SECRET,
        bodyLength: body.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
