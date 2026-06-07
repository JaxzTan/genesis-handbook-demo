import { syncContributorsFromGitHub } from "@/actions/sync-contributors";

// Scheduled GitHub → DB contributor sync. Invoked hourly by Vercel Cron (see
// vercel.json). Vercel sends `Authorization: Bearer <CRON_SECRET>` when the
// CRON_SECRET env var is set. We fail closed: if CRON_SECRET is missing or the
// header doesn't match, reject — so a misconfigured deploy can't leave the
// endpoint open to random traffic exhausting the GitHub rate limit.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const synced = await syncContributorsFromGitHub();
    return Response.json({ ok: true, synced });
  } catch (error) {
    console.error("[cron] contributor sync failed:", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
