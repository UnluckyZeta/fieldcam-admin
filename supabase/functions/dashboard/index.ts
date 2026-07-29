import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Check admin password
    const adminPassword = req.headers.get("x-admin-password");
    if (adminPassword !== Deno.env.get("ADMIN_PASSWORD")) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    // 2. Parse request payload
    const { from, to, admin_id, type } = await req.json();

    const fromStr = from
      ? from.includes("T")
        ? from
        : `${from}T00:00:00+03:00`
      : null;

    const toStr = to
      ? to.includes("T")
        ? to
        : `${to}T23:59:59.999+03:00`
      : null;

    if (!fromStr || !toStr) {
      return Response.json(
        { success: false, error: "from and to are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. Query admin profile to check if they are restricted to certain regions
    const { data: admin } = await supabase
      .from("admin_users")
      .select("role, region")
      .eq("id", admin_id)
      .single();

    const regionsArray = admin?.role === "regional_admin"
      ? admin.region?.split(",").map((r) => r.trim()).filter(Boolean)
      : null;

    // 4. Branch based on requesting route type
    if (type === "offline") {
      // Fetch Offline stats
      const { data, error } = await supabase.rpc(
        "get_offline_stats",
        {
          p_from: fromStr,
          p_to: toStr,
          p_regions: regionsArray,
        }
      );

      if (error) {
        console.error("get_offline_stats error:", error);
        throw error;
      }

      return Response.json(
        {
          success: true,
          offline_engineers: data?.offline_engineers ?? [],
          total_engineers: data?.total_engineers ?? 0,
          active_count: data?.active_count ?? 0,
        },
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      // Fetch Standard Dashboard stats
      const { data, error } = await supabase.rpc(
        "get_dashboard_stats",
        {
          p_from: fromStr,
          p_to: toStr,
          p_regions: regionsArray,
        }
      );

      if (error) {
        console.error("get_dashboard_stats error:", error);
        throw error;
      }

      // Enrich engineers_today with auto_subregion from their latest photo address
      const engineersToday = data?.engineers_today ?? [];
      if (engineersToday.length > 0) {
        const engineerIds = engineersToday.map((e: any) => e.engineer_id || e.id);
        const { data: latestPhotos } = await supabase
          .from("photo_logs")
          .select("engineer_id, address")
          .in("engineer_id", engineerIds)
          .not("address", "is", null)
          .order("taken_at", { ascending: false });

        // Generic/meaningless words to skip
        const skipWords = ["egypt", "مصر", "قرية", "village", "unnamed road", "طريق", "street"];

        function extractSubregion(address: string): string {
          // Split by comma and trim each part
          const parts = address.split(",").map((s: string) => s.trim()).filter(Boolean);

          // Remove country (last part if it's Egypt/مصر)
          if (parts.length > 1) {
            const last = parts[parts.length - 1].toLowerCase();
            if (last === "egypt" || last === "مصر") {
              parts.pop();
            }
          }

          // Remove parts that are just governorate names (e.g. "محافظة الفيوم", "Sohag Governorate")
          const filtered = parts.filter((p: string) => {
            const lower = p.toLowerCase();
            return !lower.includes("governorate") && !p.includes("محافظة");
          });

          // From the remaining parts, find the first non-generic one
          for (const part of (filtered.length > 0 ? filtered : parts)) {
            const lower = part.toLowerCase().trim();
            // Skip generic words and street-like entries
            if (lower && !skipWords.some(w => lower === w) && !lower.includes("street") && !lower.includes("شارع")) {
              // If this part still contains "Governorate", strip it (e.g. "The New Valley Governorate" → "New Valley")
              let clean = part.replace(/\s*Governorate\s*/i, "").replace(/^The\s+/i, "").trim();
              // If Arabic, strip محافظة prefix (e.g. "محافظة البحيرة" → "البحيرة")
              clean = clean.replace(/^محافظة\s*/, "").trim();
              if (clean) return clean;
            }
          }

          // Fallback: return the first part of the original address
          return parts[0] || "";
        }

        // Build a map: engineer_id -> extracted subregion
        const subregionMap: Record<string, string> = {};
        if (latestPhotos) {
          for (const photo of latestPhotos) {
            if (!subregionMap[photo.engineer_id] && photo.address) {
              const sub = extractSubregion(photo.address);
              if (sub) subregionMap[photo.engineer_id] = sub;
            }
          }
        }

        for (const eng of engineersToday) {
          const eid = eng.engineer_id || eng.id;
          if (!eng.subregion && subregionMap[eid]) {
            eng.auto_subregion = subregionMap[eid];
          }
        }
      }

      return Response.json(
        {
          success: true,
          total_engineers: data?.total_engineers ?? 0,
          photos_today: data?.photos_today ?? 0,
          offline_engineers: data?.offline_engineers ?? 0,
          gps_risk_engineers: data?.gps_risk_engineers ?? 0,
          engineers_today: engineersToday,
          high_risk_engineers: data?.high_risk_engineers ?? [],
        },
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (e) {
    console.error("dashboard error:", e);
    return Response.json(
      { success: false, error: String(e) },
      { status: 500, headers: corsHeaders }
    );
  }
});
