import {
  exportLogs,
} from "../lib/api";
import { makeTableSortable } from "./table-sort";

async function exportCsv() {
  const params =
    new URLSearchParams(
      window.location.search,
    );

  const from =
    params.get("from") ?? "";

  const to =
    params.get("to") ?? "";

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
      "Photo Tag",
      "Latitude",
      "Longitude",
      "Address",
      "Taken At",
    ].join(","),
    ...rows.map(
      (row: any) =>
        [
          row.full_name,
          row.engineer_code,
          row.photo_tag,
          row.latitude,
          row.longitude,
          `"${row.address ?? ""}"`,
          row.taken_at,
        ].join(","),
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

  a.download =
    "fieldcam-logs.csv";

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
        exportCsv,
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
      });
  },
);
makeTableSortable("today-table");