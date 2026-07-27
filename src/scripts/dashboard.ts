import {
  exportLogs,
} from "../lib/api";
import { makeTableSortable } from "./table-sort";

async function exportCsv(allTime = false) {
  const fromInput = document.querySelector('input[name="from"]') as HTMLInputElement;
  const toInput = document.querySelector('input[name="to"]') as HTMLInputElement;

  const from = (!allTime && fromInput) ? fromInput.value : "";
  const to = (!allTime && toInput) ? toInput.value : "";

  const result =
    await exportLogs(
      from,
      to,
    );

  const rows =
    result.logs ?? [];

  const csv = [
    [
      "Engineer",
      "Engineer Code",
      "Region",
      "Subregion",
      "Photo Tag",
      "Latitude",
      "Longitude",
      "Address",
      "Date",
      "Time",
    ].join(","),
    ...rows.map(
      (row: any) => {
        let dateStr = "";
        let timeStr = "";
        if (row.taken_at) {
          try {
            const d = new Date(row.taken_at);
            if (!isNaN(d.getTime())) {
              dateStr = d.toLocaleDateString("en-CA", { timeZone: "Africa/Cairo" });
              timeStr = d.toLocaleTimeString("en-GB", { timeZone: "Africa/Cairo" });
            } else {
              const parts = String(row.taken_at).split(/[T ]/);
              dateStr = parts[0] ?? "";
              timeStr = parts[1] ?? "";
            }
          } catch {
            const parts = String(row.taken_at).split(/[T ]/);
            dateStr = parts[0] ?? "";
            timeStr = parts[1] ?? "";
          }
        }
        const region = row.region || row.auto_region || "";
        const subregion = row.subregion || row.auto_subregion || "";

        return [
          `"${(row.full_name ?? "").replace(/"/g, '""')}"`,
          `"${(row.engineer_code ?? "").replace(/"/g, '""')}"`,
          `"${region.replace(/"/g, '""')}"`,
          `"${subregion.replace(/"/g, '""')}"`,
          `"${(row.photo_tag ?? "").replace(/"/g, '""')}"`,
          row.latitude ?? "",
          row.longitude ?? "",
          `"${(row.address ?? "").replace(/"/g, '""')}"`,
          dateStr,
          timeStr,
        ].join(",");
      }
    ),
  ].join("\n");

  const blob =
    new Blob([csv], {
      type: "text/csv",
    });

  const url =
    URL.createObjectURL(
      blob,
    );

  const a =
    document.createElement("a");

  a.href = url;

  a.download = allTime
    ? "fieldcam-logs-all-time.csv"
    : "fieldcam-logs.csv";

  a.click();

  URL.revokeObjectURL(
    url,
  );
}

window.addEventListener(
  "DOMContentLoaded",
  () => {
    document
      .getElementById(
        "export-btn",
      )
      ?.addEventListener(
        "click",
        () => exportCsv(false),
      );

    document
      .getElementById(
        "export-all-btn",
      )
      ?.addEventListener(
        "click",
        () => exportCsv(true),
      );

    document
      .getElementById("dashboard-search")
      ?.addEventListener("input", (e) => {
        const query = (e.target as HTMLInputElement).value.toLowerCase().trim();
        const tables = document.querySelectorAll(".dashboard-grid table");
        tables.forEach((table) => {
          const rows = table.querySelectorAll("tbody tr");
          rows.forEach((row) => {
            const text = row.textContent?.toLowerCase() ?? "";
            (row as HTMLElement).style.display = text.includes(query) ? "" : "none";
          });
        });
      });  },
);
makeTableSortable("today-table");