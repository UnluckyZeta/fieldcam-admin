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
        // Generic/meaningless words to skip
        const skipWords = ["egypt", "مصر", "قرية", "village", "unnamed road", "طريق", "street"];

        function extractSubregion(address: string): string {
          const parts = address.split(",").map((s: string) => s.trim()).filter(Boolean);

          // Remove country (last part if it's Egypt/مصر)
          if (parts.length > 1) {
            const last = parts[parts.length - 1].toLowerCase();
            if (last === "egypt" || last === "مصر") {
              parts.pop();
            }
          }

          // Remove governorate-only parts
          const filtered = parts.filter((p: string) => {
            const lower = p.toLowerCase();
            return !lower.includes("governorate") && !p.includes("محافظة");
          });

          for (const part of (filtered.length > 0 ? filtered : parts)) {
            const lower = part.toLowerCase().trim();
            if (lower && !skipWords.some(w => lower === w) && !lower.includes("street") && !lower.includes("شارع")) {
              let clean = part.replace(/\s*Governorate\s*/i, "").replace(/^The\s+/i, "").trim();
              clean = clean.replace(/^محافظة\s*/, "").trim();
              if (clean) return clean;
            }
          }

          return parts[0] || "";
        }

        // Query each engineer's latest photo with address in parallel
        const lookups = engineersToday.map(async (eng: any) => {
          const eid = eng.engineer_id || eng.id;
          const { data: photos } = await supabase
            .from("photo_logs")
            .select("address")
            .eq("engineer_id", eid)
            .not("address", "is", null)
            .order("taken_at", { ascending: false })
            .limit(1);

          if (photos && photos.length > 0 && photos[0].address) {
            const sub = extractSubregion(photos[0].address);
            if (sub && !eng.subregion) {
              eng.auto_subregion = sub;
            }
          }
        });

        await Promise.allSettled(lookups);
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
