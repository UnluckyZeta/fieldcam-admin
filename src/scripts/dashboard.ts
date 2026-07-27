import {
  exportLogs,
} from "../lib/api";
import { makeTableSortable } from "./table-sort";

const EGYPT_GOVERNORATES: { name: string; keywords: string[]; latRange?: [number, number]; lngRange?: [number, number] }[] = [
  { name: "Cairo", keywords: ["cairo", "القاهرة", "القاهره", "helwan", "حلوان", "nasr city", "مدينة نصر", "maadi", "المعادي", "new cairo", "القاهرة الجديدة", "شبرا", "shobra"], latRange: [29.8, 30.3], lngRange: [31.1, 31.7] },
  { name: "Giza", keywords: ["giza", "الجيزة", "الجيزه", "october", "أكتوبر", "اكتوبر", "zayed", "زايد", "imbaba", "إمبابة", "امبابة"], latRange: [29.5, 30.2], lngRange: [30.5, 31.1] },
  { name: "Monufia", keywords: ["monufia", "menofia", "menoufia", "monofia", "المنوفية", "المنوفيه", "منوفية", "al khadra", "الخضرة", "الخضره", "shebin", "شبين", "ashmoun", "أشمون", "اشمون", "bagour", "الباجور", "menouf", "منوف"], latRange: [30.2, 30.8], lngRange: [30.7, 31.3] },
  { name: "Qalyubia", keywords: ["qalyubia", "القليوبية", "القليوبيه", "قليوبية", "banha", "بنها", "qalyub", "قليوب"], latRange: [30.1, 30.6], lngRange: [31.1, 31.4] },
  { name: "Gharbia", keywords: ["gharbia", "الغربية", "الغربيه", "غربية", "tanta", "طنطا", "mahalla", "المحلة", "المحله"], latRange: [30.7, 31.1], lngRange: [30.8, 31.3] },
  { name: "Kafr El Sheikh", keywords: ["kafr el sheikh", "كفر الشيخ", "كفرالشيخ", "metoubes", "مطوبس", "desouk", "دسوق", "baltim", "بلطيم"], latRange: [31.0, 31.6], lngRange: [30.3, 31.3] },
  { name: "Dakahlia", keywords: ["dakahlia", "الدقهلية", "الدقهليه", "دقهلية", "mansoura", "المنصورة", "المنصوره", "talkha", "طلخا"], latRange: [30.8, 31.5], lngRange: [31.2, 31.8] },
  { name: "Sharqia", keywords: ["sharqia", "الشرقية", "الشرقيه", "شرقية", "zagazig", "الزقازيق", "belbeis", "بلبيس"], latRange: [30.3, 31.1], lngRange: [31.4, 32.2] },
  { name: "Beheira", keywords: ["beheira", "البحيرة", "البحيره", "بحيرة", "damanhour", "دمنهور", "kafr el dawwar", "كفر الدوار"], latRange: [30.4, 31.3], lngRange: [29.8, 30.8] },
  { name: "Alexandria", keywords: ["alexandria", "الإسكندرية", "الاسكندرية", "اسكندرية", "الإسكندريه", "الاسكندريه", "borg el arab", "برج العرب"], latRange: [30.9, 31.4], lngRange: [29.5, 30.3] },
  { name: "Port Said", keywords: ["port said", "بورسعيد"], latRange: [31.1, 31.4], lngRange: [32.1, 32.4] },
  { name: "Ismailia", keywords: ["ismailia", "الإسماعيلية", "الاسماعيلية", "اسماعيلية"], latRange: [30.4, 30.8], lngRange: [32.1, 32.5] },
  { name: "Suez", keywords: ["suez", "السويس"], latRange: [29.8, 30.1], lngRange: [32.3, 32.6] },
  { name: "Damietta", keywords: ["damietta", "دمياط"], latRange: [31.3, 31.6], lngRange: [31.6, 32.0] },
  { name: "Minya", keywords: ["minya", "المنيا"], latRange: [27.9, 28.7], lngRange: [30.5, 31.0] },
  { name: "Beni Suef", keywords: ["beni suef", "بني سويف", "بنى سويف"], latRange: [28.9, 29.3], lngRange: [30.8, 31.3] },
  { name: "Faiyum", keywords: ["faiyum", "fayoum", "الفيوم"], latRange: [29.1, 29.6], lngRange: [30.3, 31.0] },
  { name: "Assiut", keywords: ["assiut", "أسيوط", "اسيوط"], latRange: [27.0, 27.5], lngRange: [30.9, 31.4] },
  { name: "Sohag", keywords: ["sohag", "سوهاج"], latRange: [26.4, 26.8], lngRange: [31.5, 31.9] },
  { name: "Qena", keywords: ["qena", "قنا"], latRange: [25.9, 26.4], lngRange: [32.5, 32.9] },
  { name: "Luxor", keywords: ["luxor", "الأقصر", "الاقصر"], latRange: [25.6, 25.9], lngRange: [32.5, 32.8] },
  { name: "Aswan", keywords: ["aswan", "أسوان", "اسوان"], latRange: [23.9, 24.3], lngRange: [32.7, 33.1] },
  { name: "Red Sea", keywords: ["red sea", "البحر الأحمر", "البحر الاحمر", "hurghada", "الغردقة"] },
  { name: "New Valley", keywords: ["new valley", "الوادي الجديد", "الوادى الجديد"] },
  { name: "Matrouh", keywords: ["matrouh", "مطروح"] },
  { name: "North Sinai", keywords: ["north sinai", "شمال سيناء"] },
  { name: "South Sinai", keywords: ["south sinai", "جنوب سيناء", "sharm", "شرم الشيخ"] },
];

function getRegionData(row: any): string {
  // 1. Profile assigned region
  if (row.region && row.region.trim() && row.region.trim() !== "-") {
    return row.region.trim();
  }
  if (row.auto_region && row.auto_region.trim() && row.auto_region.trim() !== "-") {
    return row.auto_region.trim();
  }

  // 2. Keyword matching in address string
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

  // 3. Precise coordinate range check
  const lat = parseFloat(row.latitude);
  const lng = parseFloat(row.longitude);
  if (!isNaN(lat) && !isNaN(lng)) {
    for (const gov of EGYPT_GOVERNORATES) {
      if (gov.latRange && gov.lngRange) {
        if (
          lat >= gov.latRange[0] &&
          lat <= gov.latRange[1] &&
          lng >= gov.lngRange[0] &&
          lng <= gov.lngRange[1]
        ) {
          return gov.name;
        }
      }
    }
  }

  return "-";
}

async function exportCsv(allTime = false) {
  const btnId = allTime ? "export-all-btn" : "export-btn";
  const btn = document.getElementById(btnId) as HTMLButtonElement | null;
  const originalText = btn ? btn.textContent ?? "" : "";

  if (btn) {
    btn.disabled = true;
    btn.textContent = "⏳ Exporting CSV...";
    btn.style.opacity = "0.7";
    btn.style.cursor = "wait";
  }

  try {
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
  } finally {
    if (btn) {
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = originalText;
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
      }, 500);
    }
  }
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