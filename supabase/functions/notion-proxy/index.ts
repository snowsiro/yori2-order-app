const NOTION_VERSION = "2022-06-28";
const NOTION_HOST = ["api", "notion", "com"].join(".");

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const NOTION_TOKEN = Deno.env.get("NOTION_TOKEN");

  try {
    if (!NOTION_TOKEN) {
      return new Response(JSON.stringify({ error: "NOTION_TOKEN not set" }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const pageId = url.searchParams.get("page_id");
    const type = url.searchParams.get("type") || "blocks";

    if (!pageId) {
      return new Response(JSON.stringify({ error: "page_id required" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const isPage = type === "page";
    const isDatabase = type === "database";

    const fetchHeaders: Record<string, string> = {
      "Authorization": "Bearer " + NOTION_TOKEN,
      "Notion-Version": NOTION_VERSION,
    };
    if (isDatabase) fetchHeaders["Content-Type"] = "application/json";

    // 단일 페이지 객체는 페이지네이션 없음
    if (isPage) {
      const res = await fetch("https://" + NOTION_HOST + "/v1/pages/" + pageId, {
        method: "GET",
        headers: fetchHeaders,
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); }
      catch (_) {
        return new Response(
          JSON.stringify({ error: "Notion non-JSON (" + res.status + "): " + text.slice(0, 200) }),
          { status: 502, headers: { ...cors, "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // 블록/데이터베이스는 has_more가 끝날 때까지 모든 페이지를 이어받음
    const results: unknown[] = [];
    let cursor: string | undefined = undefined;
    let lastStatus = 200;
    while (true) {
      const url = isDatabase
        ? "https://" + NOTION_HOST + "/v1/databases/" + pageId + "/query"
        : "https://" + NOTION_HOST + "/v1/blocks/" + pageId + "/children?page_size=100" +
          (cursor ? "&start_cursor=" + cursor : "");

      const res = await fetch(url, {
        method: isDatabase ? "POST" : "GET",
        headers: fetchHeaders,
        body: isDatabase
          ? JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) })
          : undefined,
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); }
      catch (_) {
        return new Response(
          JSON.stringify({ error: "Notion non-JSON (" + res.status + "): " + text.slice(0, 200) }),
          { status: 502, headers: { ...cors, "Content-Type": "application/json" } }
        );
      }

      lastStatus = res.status;
      // 에러 응답이면 그대로 반환
      if (!res.ok || data.object === "error") {
        return new Response(JSON.stringify(data), {
          status: res.status, headers: { ...cors, "Content-Type": "application/json" },
        });
      }

      if (Array.isArray(data.results)) results.push(...data.results);
      if (data.has_more && data.next_cursor) cursor = data.next_cursor;
      else break;
    }

    return new Response(JSON.stringify({ object: "list", results, has_more: false }), {
      status: lastStatus,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
