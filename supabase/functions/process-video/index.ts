import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SHOTSTACK_API_KEY = Deno.env.get("SHOTSTACK_API_KEY");
    if (!SHOTSTACK_API_KEY) throw new Error("SHOTSTACK_API_KEY is not configured. Please add it in project secrets.");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { clipId, projectId, videoStoragePath, startTime, endTime, format } = await req.json();

    if (!clipId || !videoStoragePath) {
      throw new Error("Missing required fields: clipId, videoStoragePath");
    }

    // Update clip status to processing
    await supabase.from("clips").update({ status: "processing" }).eq("id", clipId);

    // Get signed URL for the video
    const { data: signedUrl } = await supabase.storage
      .from("videos")
      .createSignedUrl(videoStoragePath, 3600); // 1 hour

    if (!signedUrl?.signedUrl) throw new Error("Could not generate signed URL for video");

    // Determine output dimensions based on format
    const width = format === "vertical" ? 1080 : 1920;
    const height = format === "vertical" ? 1920 : 1080;

    // Send render request to Shotstack
    const renderResponse = await fetch("https://api.shotstack.io/edit/stage/render", {
      method: "POST",
      headers: {
        "x-api-key": SHOTSTACK_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeline: {
          tracks: [
            {
              clips: [
                {
                  asset: {
                    type: "video",
                    src: signedUrl.signedUrl,
                    trim: startTime,
                  },
                  start: 0,
                  length: endTime - startTime,
                },
              ],
            },
          ],
        },
        output: {
          format: "mp4",
          resolution: "hd",
          size: { width, height },
        },
      }),
    });

    if (!renderResponse.ok) {
      const errText = await renderResponse.text();
      console.error("Shotstack render error:", renderResponse.status, errText);
      await supabase.from("clips").update({ status: "pending" }).eq("id", clipId);
      throw new Error(`Shotstack render failed [${renderResponse.status}]: ${errText}`);
    }

    const renderData = await renderResponse.json();
    const renderId = renderData?.response?.id;

    if (!renderId) {
      await supabase.from("clips").update({ status: "pending" }).eq("id", clipId);
      throw new Error("No render ID received from Shotstack");
    }

    // Return render ID for polling
    return new Response(JSON.stringify({ 
      success: true, 
      renderId,
      message: "Video processing started. Poll for status." 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("process-video error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
