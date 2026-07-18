// 공지 등록 시 모든 구독 기기에 웹 푸시를 발송하는 함수.
// 필요한 secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:주소)
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
    const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@example.com";
    console.log("[send-push] VAPID public set:", !!VAPID_PUBLIC_KEY, "private set:", !!VAPID_PRIVATE_KEY, "subject:", VAPID_SUBJECT);
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.error("[send-push] VAPID keys not set");
      return new Response(JSON.stringify({ error: "VAPID keys not set" }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    const { title, body, exclude_email } = await req.json();
    console.log("[send-push] request:", { title, body, exclude_email });
    if (!title && !body) {
      return new Response(JSON.stringify({ error: "title or body required" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // service role로 구독 목록 조회 (RLS 우회 — 클라이언트에는 조회 권한 없음)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    let query = supabase.from("push_subscriptions").select("endpoint, p256dh, auth, user_email");
    if (exclude_email) query = query.neq("user_email", exclude_email); // 작성자 본인 기기는 제외
    const { data: subs, error } = await query;
    if (error) { console.error("[send-push] db error:", error); throw error; }
    console.log("[send-push] subscriptions found (after exclude):", subs?.length ?? 0);

    const payload = JSON.stringify({ title: title || "📢 Yori2", body: body || "" });
    let sent = 0;
    const stale: string[] = [];
    const errors: string[] = [];
    await Promise.all((subs || []).map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        );
        sent++;
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        const bodyMsg = (e as { body?: string }).body || String(e);
        console.error("[send-push] send failed:", status, bodyMsg);
        errors.push(`${status}: ${bodyMsg}`);
        // 404/410 = 구독 만료 → 정리
        if (status === 404 || status === 410) stale.push(s.endpoint);
      }
    }));
    if (stale.length > 0) {
      await supabase.from("push_subscriptions").delete().in("endpoint", stale);
    }

    const result = { total: subs?.length ?? 0, sent, removed: stale.length, errors };
    console.log("[send-push] result:", result);
    return new Response(JSON.stringify(result), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[send-push] fatal:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
