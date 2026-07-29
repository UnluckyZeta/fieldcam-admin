export interface RiskEvidenceItem {
  type: "speed" | "jump" | "future" | "drift" | "tz";
  title: string;
  detail: string;
  timestamp: string;
  location?: string;
}

export interface RiskEngineer {
  engineer_id: string;
  engineer_code: string;
  full_name: string;
  region: string;
  gps_risk_count: number;
  time_risk_count: number;
  evidence_items: RiskEvidenceItem[];
  last_activity: string;
}

let cachedRiskEngineers: RiskEngineer[] = [];

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDate(s?: string): string {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString("en-US", {
      timeZone: "Africa/Cairo",
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  } catch { return s; }
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

/* ─── Render ─── */
function renderCards(engineers: RiskEngineer[]) {
  const container = document.getElementById("risk-cards-container");
  if (!container) return;

  if (engineers.length === 0) {
    container.innerHTML = `<div class="empty-state">✅ No flagged engineers found for this period.</div>`;
    return;
  }

  container.innerHTML = engineers.map((eng, idx) => {
    const hasBoth = eng.gps_risk_count > 0 && eng.time_risk_count > 0;
    const avatarClass = eng.gps_risk_count > 0 ? "rc-avatar-danger" : "rc-avatar-warn";

    const badges: string[] = [];
    if (eng.gps_risk_count > 0) badges.push(`<span class="rc-badge rc-badge-gps">📍 GPS ×${eng.gps_risk_count}</span>`);
    if (eng.time_risk_count > 0) badges.push(`<span class="rc-badge rc-badge-time">🕒 Time ×${eng.time_risk_count}</span>`);

    const evidenceCards = eng.evidence_items.map(item => {
      const isGps = item.type === "speed" || item.type === "jump";
      return `
        <div class="ev-card ${isGps ? "ev-card-gps" : "ev-card-time"}">
          <div class="ev-title">${item.title}</div>
          <div class="ev-detail">${item.detail}</div>
          <div class="ev-footer">
            <span>${item.location ? "📍 " + item.location : ""}</span>
            <span>${fmtDate(item.timestamp)}</span>
          </div>
        </div>`;
    }).join("");

    return `
      <div class="risk-card" data-idx="${idx}">
        <div class="risk-card-header" onclick="this.parentElement.querySelector('.rc-evidence-panel').classList.toggle('open');this.querySelector('.rc-toggle').classList.toggle('open')">
          <div class="rc-left">
            <div class="rc-avatar ${avatarClass}">${initials(eng.full_name)}</div>
            <div class="rc-info">
              <div class="rc-name">${eng.full_name}</div>
              <div class="rc-meta">
                <span>${eng.engineer_code}</span>
                <span>•</span>
                <span>${eng.region}</span>
              </div>
            </div>
          </div>
          <div class="rc-badges">${badges.join("")}</div>
          <div class="rc-right">
            <span class="rc-date">${fmtDate(eng.last_activity)}</span>
            <a class="rc-btn" href="/engineers/${eng.engineer_id}" onclick="event.stopPropagation()">View Logs</a>
            <span class="rc-toggle">▼</span>
          </div>
        </div>
        <div class="rc-evidence-panel">
          <div class="rc-evidence-grid">
            ${evidenceCards}
          </div>
        </div>
      </div>`;
  }).join("");
}

/* ─── Filters ─── */
export function applyRiskFilters() {
  const q = (document.getElementById("search") as HTMLInputElement)?.value.toLowerCase().trim() ?? "";
  const rt = (document.getElementById("risk-type-filter") as HTMLSelectElement)?.value ?? "";

  const filtered = cachedRiskEngineers.filter(eng => {
    const text = `${eng.full_name} ${eng.engineer_code} ${eng.region}`.toLowerCase();
    if (q && !text.includes(q)) return false;
    if (rt === "gps" && eng.gps_risk_count === 0) return false;
    if (rt === "time" && eng.time_risk_count === 0) return false;
    return true;
  });

  renderCards(filtered);
}

/* ─── Fetch ─── */
export async function fetchRiskData() {
  const inputFrom = document.getElementById("input-from") as HTMLInputElement | null;
  const inputTo = document.getElementById("input-to") as HTMLInputElement | null;
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Cairo" });
  const fromVal = inputFrom?.value || todayStr;
  const toVal = inputTo?.value || todayStr;

  const supabaseUrl = "https://vwdwpswpvqdfpsrkmgzy.supabase.co";
  const token = "sb_publishable_yI6-VfmXaCmbr7E8GCq6zg_zTUe-rMB";

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/photo_logs_with_engineer?select=id,engineer_id,engineer_code,full_name,speed,accuracy,latitude,longitude,device_timezone,captured_online,taken_at,synced_at,address&taken_at=gte.${fromVal}T00:00:00%2B03:00&taken_at=lte.${toVal}T23:59:59%2B03:00&order=taken_at.desc&limit=1000`,
      { headers: { apikey: token, Authorization: `Bearer ${token}` } }
    );

    const logs = await res.json();
    if (!Array.isArray(logs)) { cachedRiskEngineers = []; applyRiskFilters(); return; }

    const nowTime = Date.now();
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
          gps_risk_count: 0,
          time_risk_count: 0,
          evidence_items: [],
          last_activity: log.taken_at,
        };
      }
      if (!engLogsMap[eid]) engLogsMap[eid] = [];
      engLogsMap[eid].push(log);

      const eng = map[eid];
      const takenMs = new Date(log.taken_at).getTime();
      const syncedMs = log.synced_at ? new Date(log.synced_at).getTime() : null;

      // Rule 1 · High Speed
      if (log.speed && log.speed > 25) {
        eng.gps_risk_count++;
        const kmh = Math.round(log.speed * 3.6);
        eng.evidence_items.push({
          type: "speed", title: `🏎️ High Speed: ${kmh} km/h`,
          detail: `Device GPS recorded ${kmh} km/h (threshold >90 km/h).`,
          timestamp: log.taken_at, location: log.address || undefined,
        });
      }

      // Rule 2 · Future timestamp
      if (takenMs > nowTime + 10 * 60 * 1000) {
        eng.time_risk_count++;
        eng.evidence_items.push({
          type: "future", title: "📅 Future Timestamp",
          detail: `Photo timestamp is set to ${fmtDate(log.taken_at)} — in the future.`,
          timestamp: log.taken_at, location: log.address || undefined,
        });
      }

      // Rule 3 · Clock drift (taken ahead of synced)
      if (syncedMs && takenMs > syncedMs + 15 * 60 * 1000) {
        eng.time_risk_count++;
        const mins = Math.round((takenMs - syncedMs) / 60000);
        eng.evidence_items.push({
          type: "drift", title: `⏳ Clock Drift: ${mins} min ahead`,
          detail: `Photo was timestamped ${mins} minutes ahead of when the server received it.`,
          timestamp: log.taken_at, location: log.address || undefined,
        });
      }

      // Rule 4 · Timezone mismatch
      if (log.device_timezone && log.device_timezone !== "Africa/Cairo") {
        eng.time_risk_count++;
        eng.evidence_items.push({
          type: "tz", title: "🌐 Timezone Mismatch",
          detail: `Device timezone: ${log.device_timezone} (expected Africa/Cairo).`,
          timestamp: log.taken_at, location: log.address || undefined,
        });
      }
    }

    // Rule 5 · Impossible location jump
    for (const [eid, eLogs] of Object.entries(engLogsMap)) {
      const eng = map[eid];
      const sorted = eLogs.filter(l => l.latitude && l.longitude)
        .sort((a, b) => new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime());

      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i], b = sorted[i + 1];
        const diffMin = (new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime()) / 60000;
        if (diffMin > 0 && diffMin <= 30) {
          const dist = haversineKm(a.latitude, a.longitude, b.latitude, b.longitude);
          const speed = dist / (diffMin / 60);
          if (speed > 150 && dist > 10) {
            eng.gps_risk_count++;
            eng.evidence_items.push({
              type: "jump",
              title: `🚀 Location Jump: ${dist.toFixed(0)} km in ${diffMin.toFixed(0)} min`,
              detail: `Implied speed of ${Math.round(speed)} km/h — physically impossible.`,
              timestamp: b.taken_at,
              location: `${a.address || "Point A"} → ${b.address || "Point B"}`,
            });
          }
        }
      }
    }

    cachedRiskEngineers = Object.values(map).filter(e => e.gps_risk_count > 0 || e.time_risk_count > 0);

    // Update stats
    const el = (id: string) => document.getElementById(id);
    const total = cachedRiskEngineers.length;
    const gps = cachedRiskEngineers.filter(e => e.gps_risk_count > 0).length;
    const time = cachedRiskEngineers.filter(e => e.time_risk_count > 0).length;
    if (el("stat-total-risk")) el("stat-total-risk")!.textContent = String(total);
    if (el("stat-gps-risk")) el("stat-gps-risk")!.textContent = String(gps);
    if (el("stat-time-risk")) el("stat-time-risk")!.textContent = String(time);

    applyRiskFilters();
  } catch (err) {
    console.error("Risk center fetch error", err);
  }
}

/* ─── Init ─── */
document.addEventListener("astro:page-load", () => {
  if (!document.getElementById("risk-cards-container")) return;

  const inputFrom = document.getElementById("input-from") as HTMLInputElement | null;
  const inputTo = document.getElementById("input-to") as HTMLInputElement | null;
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Cairo" });
  if (inputFrom && !inputFrom.value) inputFrom.value = todayStr;
  if (inputTo && !inputTo.value) inputTo.value = todayStr;

  fetchRiskData();

  document.getElementById("search")?.addEventListener("input", applyRiskFilters);
  document.getElementById("risk-type-filter")?.addEventListener("change", applyRiskFilters);
  document.getElementById("risk-filter-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    fetchRiskData();
  });
});
