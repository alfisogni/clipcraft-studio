import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { videoName, clipIndex, startTime, endTime, duration, format } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a social media content expert. Generate a catchy title and engaging description for a video clip extracted from a longer video. The title should be attention-grabbing with an emoji, and the description should be optimized for social media engagement with relevant hashtags. Always respond in Spanish. Return ONLY valid JSON with "title" and "description" fields, no markdown.`,
          },
          {
            role: "user",
            content: `Generate a title and description for clip #${clipIndex + 1} from the video "${videoName}". The clip is ${duration} seconds long (from ${Math.floor(startTime / 60)}:${(startTime % 60).toString().padStart(2, '0')} to ${Math.floor(endTime / 60)}:${(endTime % 60).toString().padStart(2, '0')}), format: ${format === 'vertical' ? '9:16 vertical (Reels/TikTok/Shorts)' : '16:9 horizontal (YouTube)'}. Make the title unique and creative.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_content",
              description: "Generate a title and description for a video clip",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Catchy clip title with emoji, max 60 chars" },
                  description: { type: "string", description: "Social media optimized description with hashtags, max 300 chars" },
                },
                required: ["title", "description"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_content" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const content = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(content), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try parsing from message content
    const messageContent = data.choices?.[0]?.message?.content;
    if (messageContent) {
      try {
        const parsed = JSON.parse(messageContent);
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        // Return as-is
      }
    }

    throw new Error("Failed to parse AI response");
  } catch (e) {
    console.error("generate-clip-content error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
