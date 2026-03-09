import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const CLOUDINARY_CLOUD_NAME = Deno.env.get("CLOUDINARY_CLOUD_NAME");
    const CLOUDINARY_API_KEY = Deno.env.get("CLOUDINARY_API_KEY");
    const CLOUDINARY_API_SECRET = Deno.env.get("CLOUDINARY_API_SECRET");

    if (!CLOUDINARY_CLOUD_NAME) throw new Error("CLOUDINARY_CLOUD_NAME is not configured");
    if (!CLOUDINARY_API_KEY) throw new Error("CLOUDINARY_API_KEY is not configured");
    if (!CLOUDINARY_API_SECRET) throw new Error("CLOUDINARY_API_SECRET is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { clipId, projectId, videoStoragePath, startTime, endTime, format } = await req.json();

    if (!clipId || !videoStoragePath) {
      throw new Error("Missing required fields: clipId, videoStoragePath");
    }

    // Update clip status to processing
    await supabaseAdmin.from("clips").update({ status: "processing" }).eq("id", clipId);

    // Get signed URL for the video
    const { data: signedUrlData } = await supabaseAdmin.storage
      .from("videos")
      .createSignedUrl(videoStoragePath, 3600);

    if (!signedUrlData?.signedUrl) throw new Error("Could not generate signed URL for video");

    // Upload to Cloudinary with eager transformation for trimming
    const duration = endTime - startTime;
    const eagerTransform = `so_${startTime},eo_${endTime}`;
    
    // Generate SHA1 signature for Cloudinary upload
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = `eager=${eagerTransform}&folder=clipflow&public_id=${clipId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    
    // Use Web Crypto to generate SHA1
    const encoder = new TextEncoder();
    const data = encoder.encode(paramsToSign);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // Upload video to Cloudinary with eager transformation
    const formData = new FormData();
    formData.append("file", signedUrlData.signedUrl);
    formData.append("api_key", CLOUDINARY_API_KEY);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("public_id", clipId);
    formData.append("folder", "clipflow");
    formData.append("eager", eagerTransform);
    formData.append("resource_type", "video");

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;

    const uploadResponse = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errText = await uploadResponse.text();
      console.error("Cloudinary upload error:", uploadResponse.status, errText);
      await supabaseAdmin.from("clips").update({ status: "pending" }).eq("id", clipId);
      throw new Error(`Cloudinary upload failed [${uploadResponse.status}]: ${errText}`);
    }

    const uploadData = await uploadResponse.json();

    // Get the trimmed video URL
    // Cloudinary URL-based transformation for the clip
    const trimmedUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/so_${startTime},eo_${endTime}/${uploadData.public_id}.mp4`;

    // Update clip with the processed URL and mark as ready
    await supabaseAdmin.from("clips").update({
      status: "ready",
      thumbnail_url: trimmedUrl,
    }).eq("id", clipId);

    return new Response(JSON.stringify({
      success: true,
      clipUrl: trimmedUrl,
      message: "Video clip processed successfully",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("process-video error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
