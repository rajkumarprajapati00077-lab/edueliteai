const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM = `You are a strict CA/CS/CMA expert. For the given concept, return how it inter-links across the four pillars: Law (Corporate/Business Law), Direct Tax, Accounts (Financial Reporting / IND-AS) and Audit (SAs). Cite exact sections, standards or clauses. Be concise but precise — 3–5 lines per pillar.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { concept } = await req.json();
    if (!concept || typeof concept !== "string") {
      return new Response(JSON.stringify({ error: "concept (string) is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: `Concept: ${concept}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_linkage",
            description: "Return the inter-linkage of the concept across pillars.",
            parameters: {
              type: "object",
              properties: {
                concept: { type: "string" },
                law: { type: "string", description: "How the concept appears in Corporate / Business Law. Cite sections." },
                directTax: { type: "string", description: "Direct-tax treatment. Cite Income-tax Act sections." },
                accounts: { type: "string", description: "Accounting / IND-AS / AS treatment with standard numbers." },
                audit: { type: "string", description: "Auditor's responsibility. Cite SAs." },
              },
              required: ["concept", "law", "directTax", "accounts", "audit"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_linkage" } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await resp.text();
      console.error("linkage gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : null;
    if (!parsed) {
      return new Response(JSON.stringify({ error: "AI did not return structured output" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("linkage error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});