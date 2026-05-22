import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const NOTION_TOKEN = Deno.env.get("NOTION_TOKEN");
const NOTION_VERSION = "2022-06-28";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const url = new URL(req.url);
  const pageId = url.searchParams.get("page_id");
  const type = url.searchParams.get("type") || "blocks";

  if (!pageId) {
    return new Response(JSON.stringify({ error: "page_id required" }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const notionUrl = type === "page"
    ? `https://api.notion.com/v1/pages/${pageId}`
    : `https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`;

  const res = await fetch(notionUrl, {
    headers: {
      "Authorization": `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": NOTION_VERSION,
    },
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
