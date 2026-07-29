import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "Content-Disposition, Content-Type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const csvHeaders = [
  "Engineer",
  "Engineer Code",
  "Region",
  "Photo Tag",
  "Latitude",
  "Longitude",
  "Address",
  "Date",
  "Time",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const adminPassword = req.headers.get("x-admin-password");
    if (adminPassword !== Deno.env.get("ADMIN_PASSWORD")) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const { from, to } = await req.json();

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

    // 1. Invoke the SQL function (runs instantly on the database)
    const { data: csvContent, error } = await supabase.rpc("export_photo_logs_csv", {
      p_from: fromStr,
      p_to: toStr
    });

    if (error) {
      throw error;
    }

    // 2. Prepend the UTF-8 BOM (for Excel) and Headers
    const finalCsv = "\uFEFF" + csvHeaders.join(",") + "\r\n" + (csvContent ?? "");

    const filename =
      from && to
        ? `fieldcam-${from}-to-${to}.csv`
        : "fieldcam-export.csv";

    return new Response(finalCsv, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("CSV export error:", e);
    return Response.json(
      { success: false, error: String(e) },
      { status: 500, headers: corsHeaders }
    );
  }
});
