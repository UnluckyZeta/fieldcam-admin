import { makeTableSortable } from "./table-sort";

export interface RiskEngineer {
  engineer_id: string;
  engineer_code: string;
  full_name: string;
  region: string;
  subregion: string;
  gps_risk_count: number;
  time_risk_count: number;
  primary_risk_type: "gps" | "time" | "both";
  evidence: string[];
  last_activity: string;
}

let cachedRiskEngineers: RiskEngineer[] = [];

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function applyRiskFilters() {
  const searchInput = document.getElementById("search") as HTMLInputElement | null;
  const riskTypeSelect = document.getElementById("risk-type-filter") as HTMLSelectElement | null;
  const regionSelect = document.getElementById("region-filter") as HTMLSelectElement | null;

  const searchQuery = searchInput?.value.toLowerCase().trim() ?? "";
  const selectedRiskType = riskTypeSelect?.value ?? "";
  const selectedRegion = regionSelect?.value.toLowerCase().trim() ?? "";

  const filtered = cachedRiskEngineers.filter((eng) => {
    const fullName = (eng.full_name || "").toLowerCase();
    const code = (eng.engineer_code || "").toLowerCase();
    const region = (eng.region || "").toLowerCase();
    const subregion = (eng.subregion || "").toLowerCase();

    const matchesSearch =
      !searchQuery ||
      fullName.includes(searchQuery) ||
      code.includes(searchQuery) ||
      region.includes(searchQuery) ||
      subregion.includes(searchQuery);

    const matchesRegion = !selectedRegion || region === selectedRegion;

    let matchesRiskType = true;
    if (selectedRiskType === "gps") {
      matchesRiskType = eng.gps_risk_count > 0;
    } else if (selectedRiskType === "time") {
      matchesRiskType = eng.time_risk_count > 0;
    }

    return matchesSearch && matchesRegion && matchesRiskType;
  });

  renderRiskTable(filtered);
}

function formatEgyptDate(dateString?: string): string {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    return d.toLocaleString("en-US", {
      timeZone: "Africa/Cairo",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch (e) {
    return dateString;
  }
}

function renderRiskTable(engineers: RiskEngineer[]) {
  const tbody = document.querySelector("#risk-table tbody");
  const countEl = document.getElementById("flagged-count");
  if (countEl) countEl.textContent = String(engineers.length);

  if (!tbody) return;

  if (engineers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: #94a3b8; padding: 32px;">
          ✅ No high-risk engineers flagged in this filter criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = engineers.map((eng) => {
    let riskBadge = "";
    if (eng.gps_risk_count > 0 && eng.time_risk_count > 0) {
      riskBadge = `<span class="badge badge-both">⚠️ GPS & Time Risk</span>`;
    } else if (eng.gps_risk_count > 0) {
      riskBadge = `<span class="badge badge-gps">🏎️ Speed / GPS Risk</span>`;
    } else {
      riskBadge = `<span class="badge badge-time">🕒 Clock / Time Risk</span>`;
    }

    const evidenceList = eng.evidence.map(e => `<li>${e}</li>`).join("");

    return `
      <tr>
        <td data-label="Engineer">
          <strong>${eng.full_name || "Unknown"}</strong>
          <div style="font-size: 12px; color: #64748b;">${eng.engineer_code || ""}</div>
        </td>
        <td data-label="Location">
          <div>${eng.region || "-"}</div>
          <div style="font-size: 12px; color: #64748b;">${eng.subregion || "-"}</div>
        </td>
        <td data-label="Risk Type">${riskBadge}</td>
        <td data-label="Detected Evidence">
          <ul class="evidence-list">
            ${evidenceList}
          </ul>
        </td>
        <td data-label="Last Activity">${formatEgyptDate(eng.last_activity)}</td>
        <td data-label="Actions">
          <a class="btn" href="/engineers/${eng.engineer_id}">View Logs</a>
        </td>
      </tr>
    `;
  }).join("");
}

export async function fetchRiskData() {
  const inputFrom = document.getElementById("input-from") as HTMLInputElement | null;
  const inputTo = document.getElementById("input-to") as HTMLInputElement | null;

  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Cairo" });
  const fromVal = inputFrom?.value || todayStr;
  const toVal = inputTo?.value || todayStr;

  const supabaseUrl = "https://vwdwpswpvqdfpsrkmgzy.supabase.co";
  const token = "sb_publishable_yI6-VfmXaCmbr7E8GCq6zg_zTUe-rMB";

  try {
    // Query photo logs with engineer details within selected date range
    const res = await fetch(
      `${supabaseUrl}/rest/v1/photo_logs_with_engineer?select=id,engineer_id,engineer_code,full_name,speed,accuracy,latitude,longitude,device_timezone,captured_online,taken_at,synced_at,address&taken_at=gte.${fromVal}T00:00:00%2B03:00&taken_at=lte.${toVal}T23:59:59%2B03:00&order=taken_at.desc&limit=1000`,
      {
        headers: {
          apikey: token,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const logs = await res.json();

    if (!Array.isArray(logs)) {
      console.error("Failed to fetch risk logs", logs);
      cachedRiskEngineers = [];
      applyRiskFilters();
      return;
    }

    const nowTime = Date.now();

    // Group logs by engineer
    const map: Record<string, RiskEngineer> = {};
    const engLogsMap: Record<string, any[]> = {};

    for (const log of logs) {
      const eid = log.engineer_id;
      if (!eid) continue;

      if (!map[eid]) {
        map[eid] = {
          engineer_id: eid,
          engineer_code: log.engineer_code || "",
          full_name: log.full_name || "Engineer",
          region: log.region || "-",
          subregion: "-",
          gps_risk_count: 0,
          time_risk_count: 0,
          primary_risk_type: "gps",
          evidence: [],
          last_activity: log.taken_at,
        };
      }

      if (!engLogsMap[eid]) {
        engLogsMap[eid] = [];
      }
      engLogsMap[eid].push(log);

      const eng = map[eid];
      const takenTime = new Date(log.taken_at).getTime();
      const syncedTime = log.synced_at ? new Date(log.synced_at).getTime() : null;

      // 1. High Speed Movement (>90 km/h)
      if (log.speed && log.speed > 25) {
        eng.gps_risk_count++;
        const kmh = Math.round(log.speed * 3.6);
        const reason = `High speed recorded: ${kmh} km/h (Limit >90 km/h)`;
        if (!eng.evidence.includes(reason)) eng.evidence.push(reason);
      }

      // 2. Future Timestamp ("picture taken tmrw / future")
      if (takenTime > nowTime + 10 * 60 * 1000) {
        eng.time_risk_count++;
        const reason = `Future timestamp: Taken in future (${formatEgyptDate(log.taken_at)})`;
        if (!eng.evidence.includes(reason)) eng.evidence.push(reason);
      }

      // 3. Fast Clock / Time Drift ("picture taken in an hour but synced now")
      if (syncedTime && takenTime > syncedTime + 15 * 60 * 1000) {
        eng.time_risk_count++;
        const minsAhead = Math.round((takenTime - syncedTime) / (1000 * 60));
        const reason = `Clock Fast / Time Offset: Taken ${minsAhead} mins ahead of server sync`;
        if (!eng.evidence.includes(reason)) eng.evidence.push(reason);
      }

      // 4. Untrusted Clock / Timezone Mismatch
      if (log.time_confidence === "untrusted") {
        eng.time_risk_count++;
        const reason = `Untrusted hardware clock (Time spoof risk)`;
        if (!eng.evidence.includes(reason)) eng.evidence.push(reason);
      }

      if (log.device_timezone && log.device_timezone !== "Africa/Cairo") {
        eng.time_risk_count++;
        const reason = `Timezone discrepancy: ${log.device_timezone}`;
        if (!eng.evidence.includes(reason)) eng.evidence.push(reason);
      }
    }

    // 5. Impossible Location Jump (Haversine Distance > 10km within 30 mins)
    for (const [eid, eLogs] of Object.entries(engLogsMap)) {
      const eng = map[eid];
      const validGpsLogs = eLogs.filter(l => l.latitude && l.longitude)
        .sort((a, b) => new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime());

      for (let i = 0; i < validGpsLogs.length - 1; i++) {
        const p1 = validGpsLogs[i];
        const p2 = validGpsLogs[i + 1];
        const t1 = new Date(p1.taken_at).getTime();
        const t2 = new Date(p2.taken_at).getTime();
        const diffMins = (t2 - t1) / (1000 * 60);

        if (diffMins > 0 && diffMins <= 30) {
          const distKm = getDistanceKm(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
          const speedKmh = distKm / (diffMins / 60);
          if (speedKmh > 150 && distKm > 10) {
            eng.gps_risk_count++;
            const reason = `Teleportation Jump: Moved ${distKm.toFixed(1)} km in ${diffMins.toFixed(1)} mins (${Math.round(speedKmh)} km/h implied speed)`;
            if (!eng.evidence.includes(reason)) eng.evidence.push(reason);
          }
        }
      }
    }

    // Only keep engineers who triggered at least one risk indicator
    cachedRiskEngineers = Object.values(map).filter(
      (e) => e.gps_risk_count > 0 || e.time_risk_count > 0
    );

    // Update summary stat cards
    const totalCount = cachedRiskEngineers.length;
    const gpsCount = cachedRiskEngineers.filter(e => e.gps_risk_count > 0).length;
    const timeCount = cachedRiskEngineers.filter(e => e.time_risk_count > 0).length;

    const elTotal = document.getElementById("stat-total-risk");
    const elGps = document.getElementById("stat-gps-risk");
    const elTime = document.getElementById("stat-time-risk");

    if (elTotal) elTotal.textContent = String(totalCount);
    if (elGps) elGps.textContent = String(gpsCount);
    if (elTime) elTime.textContent = String(timeCount);

    applyRiskFilters();
  } catch (err) {
    console.error("Risk center fetch error", err);
  }
}

// Bind page lifecycle listener
document.addEventListener("astro:page-load", () => {
  if (document.getElementById("risk-table")) {
    const inputFrom = document.getElementById("input-from") as HTMLInputElement | null;
    const inputTo = document.getElementById("input-to") as HTMLInputElement | null;

    const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Cairo" });
    if (inputFrom && !inputFrom.value) inputFrom.value = todayStr;
    if (inputTo && !inputTo.value) inputTo.value = todayStr;

    fetchRiskData();

    document.getElementById("search")?.addEventListener("input", applyRiskFilters);
    document.getElementById("risk-type-filter")?.addEventListener("change", applyRiskFilters);
    document.getElementById("region-filter")?.addEventListener("change", applyRiskFilters);

    document.getElementById("risk-filter-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      fetchRiskData();
    });

    makeTableSortable("risk-table");
  }
});
