const NOTION_VERSION = "2022-06-28";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const NOTION_TOKEN = Deno.env.get("NOTION_TOKEN");

  try {
    if (!NOTION_TOKEN) {
      return new Response(JSON.stringify({ error: "NOTION_TOKEN secret is not set" }), {
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

    const notionUrl = type === "page"
      ? "https://api.notion.com/v1/pages/" + pageId
      : "https://api.notion.com/v1/blocks/" + pageId + "/children?page_size=100";

    const res = await fetch(notionUrl, {
      headers: {
        "Authorization": "Bearer " + NOTION_TOKEN,
        "Notion-Version": NOTION_VERSION,
      },
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (_) {
      return new Response(
        JSON.stringify({ error: "Notion returned non-JSON (HTTP " + res.status + "): " + text.slice(0, 300) }),
        { status: 502, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
