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
      });
  },
);
makeTableSortable("today-table");