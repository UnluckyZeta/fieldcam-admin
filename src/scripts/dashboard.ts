import {
  exportLogs,
} from "../lib/api";
import { makeTableSortable } from "./table-sort";

const EGYPT_GOVERNORATES: { name: string; keywords: string[] }[] = [
  { name: "Cairo", keywords: ["cairo", "القاهرة", "القاهره"] },
  { name: "Giza", keywords: ["giza", "الجيزة", "الجيزه"] },
  { name: "Alexandria", keywords: ["alexandria", "الإسكندرية", "الاسكندرية", "اسكندرية", "الإسكندريه", "الاسكندريه"] },
  { name: "Qalyubia", keywords: ["qalyubia", "القليوبية", "القليوبيه", "قليوبية"] },
  { name: "Dakahlia", keywords: ["dakahlia", "الدقهلية", "الدقهليه", "دقهلية"] },
  { name: "Sharqia", keywords: ["sharqia", "الشرقية", "الشرقيه", "شرقية"] },
  { name: "Gharbia", keywords: ["gharbia", "الغربية", "الغربيه", "غربية"] },
  { name: "Monufia", keywords: ["monufia", "المنوفية", "المنوفيه", "منوفية"] },
  { name: "Beheira", keywords: ["beheira", "البحيرة", "البحيره", "بحيرة"] },
  { name: "Port Said", keywords: ["port said", "بورسعيد"] },
  { name: "Ismailia", keywords: ["ismailia", "الإسماعيلية", "الاسماعيلية", "اسماعيلية"] },
  { name: "Suez", keywords: ["suez", "السويس"] },
  { name: "Kafr El Sheikh", keywords: ["kafr el sheikh", "كفر الشيخ", "كفرالشيخ"] },
  { name: "Damietta", keywords: ["damietta", "دمياط"] },
  { name: "Minya", keywords: ["minya", "المنيا"] },
  { name: "Beni Suef", keywords: ["beni suef", "بني سويف", "بنى سويف"] },
  { name: "Faiyum", keywords: ["faiyum", "fayoum", "الفيوم"] },
  { name: "Assiut", keywords: ["assiut", "أسيوط", "اسيوط"] },
  { name: "Sohag", keywords: ["sohag", "سوهاج"] },
  { name: "Qena", keywords: ["qena", "قنا"] },
  { name: "Luxor", keywords: ["luxor", "الأقصر", "الاقصر"] },
  { name: "Aswan", keywords: ["aswan", "أسوان", "اسوان"] },
  { name: "Red Sea", keywords: ["red sea", "البحر الأحمر", "البحر الاحمر"] },
  { name: "New Valley", keywords: ["new valley", "الوادي الجديد", "الوادى الجديد"] },
  { name: "Matrouh", keywords: ["matrouh", "مطروح"] },
  { name: "North Sinai", keywords: ["north sinai", "شمال سيناء"] },
  { name: "South Sinai", keywords: ["south sinai", "جنوب سيناء"] },
];

function getRegionData(row: any): string {
  // 1. Check assigned region from user profile
  if (row.region && row.region.trim() && row.region.trim() !== "-") {
    return row.region.trim();
  }
  if (row.auto_region && row.auto_region.trim() && row.auto_region.trim() !== "-") {
    return row.auto_region.trim();
  }

  // 2. Check address (Arabic & English matching)
  const address = (row.address ?? "").toLowerCase();
  if (address) {
    for (const gov of EGYPT_GOVERNORATES) {
      for (const kw of gov.keywords) {
        if (address.includes(kw)) {
          return gov.name;
        }
      }
    }
  }

  // 3. Fallback coordinate check (Egypt latitude range check if available)
  const lat = parseFloat(row.latitude);
  const lng = parseFloat(row.longitude);
  if (!isNaN(lat) && !isNaN(lng)) {
    if (lat >= 31.0 && lat <= 31.6 && lng >= 30.2 && lng <= 31.2) return "Kafr El Sheikh";
    if (lat >= 29.8 && lat <= 30.3 && lng >= 31.0 && lng <= 31.5) return "Cairo";
    if (lat >= 29.7 && lat <= 30.1 && lng >= 30.8 && lng <= 31.4) return "Giza";
    if (lat >= 31.0 && lat <= 31.4 && lng >= 29.7 && lng <= 30.2) return "Alexandria";
  }

  return "-";
}

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
        const region = getRegionData(row);

        return [
          `"${(row.full_name ?? "").replace(/"/g, '""')}"`,
          `"${(row.engineer_code ?? "").replace(/"/g, '""')}"`,
          `"${region.replace(/"/g, '""')}"`,
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