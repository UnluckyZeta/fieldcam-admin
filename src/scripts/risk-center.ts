export interface RiskEvidenceItem {
  id?: string;
  type: "speed" | "jump" | "future" | "drift" | "tz" | "manual" | "sequential" | "mock";
  title: string;
  detail: string;
  timestamp: string;
  location?: string;
  photo_tag?: string;
  review_status?: "verified" | "flagged" | "pending_clear" | null;
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
  is_tracked: boolean;
  tracked_reason?: string;
  tracked_at?: string;
}

const SUPABASE_URL = "https://vwdwpswpvqdfpsrkmgzy.supabase.co";
const TOKEN = "sb_publishable_yI6-VfmXaCmbr7E8GCq6zg_zTUe-rMB";
const headers = { apikey: TOKEN, Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };

let currentAdmin: { id: string; role: string; region: string; email: string } | null = null;

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null;
  return null;
}

async function fetchCurrentAdmin() {
  const adminId = getCookie("admin_id");
  if (!adminId) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/admin_users?select=id,role,region,email&id=eq.${adminId}`, { headers });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      currentAdmin = data[0];
      console.log("Logged in admin:", currentAdmin);
    }
  } catch (e) {
    console.error("Error fetching current admin profile", e);
  }
}

let cachedRiskEngineers: RiskEngineer[] = [];
let trackedSet: Set<string> = new Set();
let trackedMap: Record<string, { reason?: string; tracked_at?: string }> = {};

/* ─── Helpers ─── */
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

/* ─── Tracking API ─── */
async function fetchTrackedEngineers(): Promise<void> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/tracked_engineers?select=engineer_id,reason,tracked_at`, { headers });
    const data = await res.json();
    trackedSet = new Set();
    trackedMap = {};
    if (Array.isArray(data)) {
      for (const row of data) {
        trackedSet.add(row.engineer_id);
        trackedMap[row.engineer_id] = { reason: row.reason, tracked_at: row.tracked_at };
      }
    }
  } catch (e) {
    console.error("Failed to fetch tracked engineers", e);
  }
}

async function toggleTrack(engineerId: string): Promise<void> {
  if (trackedSet.has(engineerId)) {
    await fetch(`${SUPABASE_URL}/rest/v1/tracked_engineers?engineer_id=eq.${engineerId}`, {
      method: "DELETE", headers,
    });
    trackedSet.delete(engineerId);
    delete trackedMap[engineerId];
  } else {
    const reason = prompt("Why are you tracking this engineer? (optional)");
    await fetch(`${SUPABASE_URL}/rest/v1/tracked_engineers`, {
      method: "POST", headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify({ engineer_id: engineerId, reason: reason || null }),
    });
    trackedSet.add(engineerId);
    trackedMap[engineerId] = { reason: reason || undefined, tracked_at: new Date().toISOString() };
  }

  const eng = cachedRiskEngineers.find(e => e.engineer_id === engineerId);
  if (eng) {
    eng.is_tracked = trackedSet.has(engineerId);
    eng.tracked_reason = trackedMap[engineerId]?.reason;
    eng.tracked_at = trackedMap[engineerId]?.tracked_at;
  }

  const elTracked = document.getElementById("stat-tracked");
  if (elTracked) elTracked.textContent = String(trackedSet.size);

  applyRiskFilters();
}

async function setPhotoReviewStatus(photoId: string, status: "verified" | "flagged" | "pending_clear" | null) {
  try {
    let finalStatus = status;
    if (status === "verified" && currentAdmin?.role === "regional_admin") {
      finalStatus = "pending_clear";
    }

    const reviewer = currentAdmin ? `${currentAdmin.role} (${currentAdmin.email})` : "admin";

    const res = await fetch(`${SUPABASE_URL}/rest/v1/photo_logs?id=eq.${photoId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        review_status: finalStatus,
        reviewed_at: finalStatus ? new Date().toISOString() : null,
        reviewed_by: finalStatus ? reviewer : null
      })
    });
    if (res.ok) {
      // Update in-memory cache immediately so UI doesn't drop cards
      for (const eng of cachedRiskEngineers) {
        for (const item of eng.evidence_items) {
          if (item.id === photoId) {
            item.review_status = finalStatus;
          }
        }
      }
      applyRiskFilters();

      await fetchRiskData();
      // If photo search result is currently open, refresh it too
      if (document.getElementById("photo-tag-search")) {
        const photoSearchBtn = document.getElementById("photo-search-btn") as HTMLButtonElement | null;
        if (photoSearchBtn) {
          (window as any).searchPhotoByTag();
        }
      }
    } else {
      const err = await res.json();
      console.error(err);
      alert("Error updating review status: " + (err.message || "Unknown error"));
    }
  } catch (e: any) {
    console.error(e);
    alert("Connection error: " + e.message);
  }
}

// Expose APIs to window for inline onclicks
(window as any).toggleTrack = toggleTrack;
(window as any).setPhotoReviewStatus = setPhotoReviewStatus;

/* ─── Render ─── */
function renderCards(engineers: RiskEngineer[]) {
  const container = document.getElementById("risk-cards-container");
  if (!container) return;

  if (engineers.length === 0) {
    container.innerHTML = `<div class="empty-state">✅ No flagged engineers found for this period.</div>`;
    return;
  }

  container.innerHTML = engineers.map((eng, idx) => {
    const avatarClass = eng.gps_risk_count > 0 ? "rc-avatar-danger" : "rc-avatar-warn";
    const tracked = eng.is_tracked;

    const badges: string[] = [];
    if (tracked) badges.push(`<span class="rc-badge rc-badge-tracked">👁️ Tracked</span>`);
    if (eng.gps_risk_count > 0) badges.push(`<span class="rc-badge rc-badge-gps">📍 GPS ×${eng.gps_risk_count}</span>`);
    if (eng.time_risk_count > 0) badges.push(`<span class="rc-badge rc-badge-time">🕒 Time ×${eng.time_risk_count}</span>`);

    const evidenceCards = eng.evidence_items.length > 0 ? eng.evidence_items.map(item => {
      const isGps = item.type === "speed" || item.type === "jump";
      
      const reviewBadge = item.review_status === "verified"
        ? `<span class="rc-badge-clear">✔️ Cleared</span>`
        : item.review_status === "flagged"
        ? `<span class="rc-badge-manual-flag">🚩 Flagged</span>`
        : item.review_status === "pending_clear"
        ? `<span class="rc-badge-pending-clear">⏳ Pending Clear</span>`
        : "";

      const tagText = item.photo_tag ? `<a href="/verify?tag=${item.photo_tag}" target="_blank" class="ev-tag-link" onclick="event.stopPropagation()" title="Click to view full photo metadata & map verification">🏷️ ${item.photo_tag}</a>` : "";

      let actionButtons = "";
      if (item.id) {
        if (item.review_status === "verified") {
          actionButtons = `<button class="ev-action-btn ev-btn-flag" onclick="event.stopPropagation();setPhotoReviewStatus('${item.id}', 'flagged')">🚩 Flag</button>`;
        } else if (item.review_status === "flagged") {
          actionButtons = `<button class="ev-action-btn ev-btn-clear" onclick="event.stopPropagation();setPhotoReviewStatus('${item.id}', 'verified')">✔️ Clear</button>`;
        } else if (item.review_status === "pending_clear") {
          if (currentAdmin?.role === "super_admin") {
            actionButtons = `
              <button class="ev-action-btn ev-btn-approve" onclick="event.stopPropagation();setPhotoReviewStatus('${item.id}', 'verified')">✔️ Approve Clear</button>
              <button class="ev-action-btn ev-btn-reject" onclick="event.stopPropagation();setPhotoReviewStatus('${item.id}', null)">❌ Reject Clear</button>
            `;
          } else {
            actionButtons = `<span style="font-size:11px;color:#f59e0b;font-weight:600;">⏳ Awaiting Super Admin</span>`;
          }
        } else {
          actionButtons = `
            <button class="ev-action-btn ev-btn-clear" onclick="event.stopPropagation();setPhotoReviewStatus('${item.id}', 'verified')">✔️ Clear</button>
            <button class="ev-action-btn ev-btn-flag" onclick="event.stopPropagation();setPhotoReviewStatus('${item.id}', 'flagged')">🚩 Flag</button>
          `;
        }
      }

      return `
        <div class="ev-card ${isGps ? "ev-card-gps" : "ev-card-time"}">
          <div class="ev-card-top">
            <div class="ev-title">${item.title} ${reviewBadge}</div>
            <div class="ev-actions">${actionButtons}</div>
          </div>
          <div class="ev-detail">${item.detail}</div>
          <div class="ev-footer">
            <span>${item.location ? "📍 " + item.location : ""}</span>
            <div class="ev-footer-right">
              ${tagText}
              <span>${fmtDate(item.timestamp)}</span>
            </div>
          </div>
        </div>`;
    }).join("") : `<div class="empty-state" style="padding:12px;font-size:12px;color:#10b981;">✅ No active risks flagged for this engineer during this period.</div>`;

    const trackBtnLabel = tracked ? "Untrack" : "Track";
    const trackBtnClass = tracked ? "rc-btn-untrack" : "rc-btn-track";

    const trackedInfo = tracked && eng.tracked_reason
      ? `<div class="rc-tracked-reason">📝 ${eng.tracked_reason}</div>` : "";

    return `
      <div class="risk-card ${tracked ? "risk-card-tracked" : ""}" data-idx="${idx}">
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
              ${trackedInfo}
            </div>
          </div>
          <div class="rc-badges">${badges.join("")}</div>
          <div class="rc-right">
            <span class="rc-date">${fmtDate(eng.last_activity)}</span>
            <button class="rc-btn ${trackBtnClass}" onclick="event.stopPropagation();toggleTrack('${eng.engineer_id}')">${trackBtnLabel}</button>
            <a class="rc-btn rc-btn-logs" href="/engineers/${eng.engineer_id}" onclick="event.stopPropagation()">View Logs</a>
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
    if (rt === "gps" && !eng.evidence_items.some(item => item.type === "speed" || item.type === "jump" || item.type === "mock")) return false;
    if (rt === "time" && !eng.evidence_items.some(item => item.type === "future" || item.type === "drift" || item.type === "tz" || item.type === "sequential" || item.type === "manual")) return false;
    if (rt === "tracked" && !eng.is_tracked) return false;
    return true;
  });

  renderCards(filtered);
}

/* ─── Fetch ─── */
export async function fetchRiskData() {
  const inputFrom = document.getElementById("input-from") as HTMLInputElement | null;
  const inputTo = document.getElementById("input-to") as HTMLInputElement | null;
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Cairo" });
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-CA", { timeZone: "Africa/Cairo" });
  const fromVal = inputFrom?.value || thirtyDaysAgoStr;
  const toVal = inputTo?.value || todayStr;

  try {
    if (!currentAdmin) {
      await fetchCurrentAdmin();
    }

    const [logsRes] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/photo_logs_with_engineer?select=id,engineer_id,engineer_code,full_name,region,speed,accuracy,latitude,longitude,device_timezone,captured_online,taken_at,synced_at,address,photo_tag,review_status,reviewed_at,reviewed_by,mocked,time_confidence&taken_at=gte.${fromVal}T00:00:00%2B03:00&taken_at=lte.${toVal}T23:59:59%2B03:00&order=taken_at.desc&limit=1000`,
        { headers }
      ),
      fetchTrackedEngineers(),
    ]);

    const logs = await logsRes.json();
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
          is_tracked: trackedSet.has(eid),
          tracked_reason: trackedMap[eid]?.reason,
          tracked_at: trackedMap[eid]?.tracked_at,
        };
      }
      if (!engLogsMap[eid]) engLogsMap[eid] = [];
      engLogsMap[eid].push(log);

      const eng = map[eid];
      const takenMs = new Date(log.taken_at).getTime();
      const syncedMs = log.synced_at ? new Date(log.synced_at).getTime() : null;

      // If photo was verified/approved by Super Admin, exclude it from active risk center view!
      if (log.review_status === "verified") {
        continue;
      }

      const isUnverified = log.review_status !== "verified";
      let matchedAutoRule = false;

      // Rule 1 · High Speed (>90 km/h)
      if (log.speed && log.speed > 25) {
        matchedAutoRule = true;
        if (isUnverified) eng.gps_risk_count++;
        const kmh = Math.round(log.speed * 3.6);
        eng.evidence_items.push({
          id: log.id,
          type: "speed",
          title: `🏎️ High Speed: ${kmh} km/h`,
          detail: `Device GPS recorded ${kmh} km/h (threshold >90 km/h).`,
          timestamp: log.taken_at,
          location: log.address || undefined,
          photo_tag: log.photo_tag || undefined,
          review_status: log.review_status,
        });
      }

      // Rule 2 · Future timestamp
      if (takenMs > nowTime + 10 * 60 * 1000) {
        matchedAutoRule = true;
        if (isUnverified) eng.time_risk_count++;
        eng.evidence_items.push({
          id: log.id,
          type: "future",
          title: "📅 Future Timestamp",
          detail: `Photo timestamp is set to ${fmtDate(log.taken_at)} — in the future.`,
          timestamp: log.taken_at,
          location: log.address || undefined,
          photo_tag: log.photo_tag || undefined,
          review_status: log.review_status,
        });
      }

      // Rule 3 · Clock drift (taken ahead of synced)
      if (syncedMs && takenMs > syncedMs + 15 * 60 * 1000) {
        matchedAutoRule = true;
        if (isUnverified) eng.time_risk_count++;
        const mins = Math.round((takenMs - syncedMs) / 60000);
        eng.evidence_items.push({
          id: log.id,
          type: "drift",
          title: `⏳ Clock Drift: ${mins} min ahead`,
          detail: `Photo was timestamped ${mins} minutes ahead of when the server received it.`,
          timestamp: log.taken_at,
          location: log.address || undefined,
          photo_tag: log.photo_tag || undefined,
          review_status: log.review_status,
        });
      }

      // Rule 4 · Timezone mismatch
      if (log.device_timezone && log.device_timezone !== "Africa/Cairo") {
        matchedAutoRule = true;
        if (isUnverified) eng.time_risk_count++;
        eng.evidence_items.push({
          id: log.id,
          type: "tz",
          title: "🌐 Timezone Mismatch",
          detail: `Device timezone: ${log.device_timezone} (expected Africa/Cairo).`,
          timestamp: log.taken_at,
          location: log.address || undefined,
          photo_tag: log.photo_tag || undefined,
          review_status: log.review_status,
        });
      }

      // Rule 10 · Untrusted Device Clock (Boot time / offline spoof detection)
      if (log.time_confidence === "untrusted") {
        matchedAutoRule = true;
        if (isUnverified) eng.time_risk_count++;
        eng.evidence_items.push({
          id: log.id,
          type: "drift",
          title: "⏳ Untrusted Device Clock",
          detail: "Device boot time changed significantly since last sync, indicating a reboot or offline clock manipulation.",
          timestamp: log.taken_at,
          location: log.address || undefined,
          photo_tag: log.photo_tag || undefined,
          review_status: log.review_status,
        });
      }

      // Rule 7 · Mock Location (suspiciously perfect GPS accuracy ≤ 1.5m)
      if (log.accuracy !== null && log.accuracy !== undefined && log.accuracy > 0 && log.accuracy <= 1.5) {
        matchedAutoRule = true;
        if (isUnverified) eng.gps_risk_count++;
        eng.evidence_items.push({
          id: log.id,
          type: "mock",
          title: `📡 Suspected Mock Location (${log.accuracy.toFixed(2)}m)`,
          detail: `GPS accuracy of ${log.accuracy.toFixed(2)}m is suspiciously perfect. Real GPS is always noisy (typically 3-20m). Mock location apps report ~1.0m.`,
          timestamp: log.taken_at,
          location: log.address || undefined,
          photo_tag: log.photo_tag || undefined,
          review_status: log.review_status,
        });
      }

      // Rule 9 · OS-level Mock Location Detected (captured by expo-location on Android)
      if (log.mocked === true) {
        matchedAutoRule = true;
        if (isUnverified) eng.gps_risk_count++;
        eng.evidence_items.push({
          id: log.id,
          type: "mock",
          title: "📡 Mock Location (OS Detected)",
          detail: "Android OS reported this location coordinate as mocked/spoofed (via isFromMockProvider).",
          timestamp: log.taken_at,
          location: log.address || undefined,
          photo_tag: log.photo_tag || undefined,
          review_status: log.review_status,
        });
      }

      // If manually flagged and no auto rules triggered, add manual flag card
      if (log.review_status === "flagged" && !matchedAutoRule) {
        if (isUnverified) eng.time_risk_count++;
        eng.evidence_items.push({
          id: log.id,
          type: "manual",
          title: "🚩 Manually Flagged by Admin",
          detail: "This picture was manually flagged as non-compliant or suspicious.",
          timestamp: log.taken_at,
          location: log.address || undefined,
          photo_tag: log.photo_tag || undefined,
          review_status: log.review_status,
        });
      }
    }

    // Rule 5 · Impossible location jump (speed > 150 km/h between locations)
    for (const [eid, eLogs] of Object.entries(engLogsMap)) {
      const eng = map[eid];
      const sorted = eLogs.filter(l => l.latitude && l.longitude && l.review_status !== "verified")
        .sort((a, b) => new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime());

      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i], b = sorted[i + 1];
        const diffMin = (new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime()) / 60000;
        if (diffMin > 0 && diffMin <= 30) {
          const dist = haversineKm(a.latitude, a.longitude, b.latitude, b.longitude);
          const speed = dist / (diffMin / 60);
          if (speed > 150 && dist > 10) {
            if (b.review_status !== "verified") eng.gps_risk_count++;
            eng.evidence_items.push({
              id: b.id,
              type: "jump",
              title: `🚀 Location Jump: ${dist.toFixed(0)} km in ${diffMin.toFixed(0)} min`,
              detail: `Implied speed of ${Math.round(speed)} km/h — physically impossible.`,
              timestamp: b.taken_at,
              location: `${a.address || "Point A"} → ${b.address || "Point B"}`,
              photo_tag: b.photo_tag || undefined,
              review_status: b.review_status,
            });
          }
        }
      }
    }

    // Rule 6 · Out-of-Order Upload / Sync Timeline Manipulation
    for (const [eid, eLogs] of Object.entries(engLogsMap)) {
      const eng = map[eid];
      const onlineLogs = eLogs.filter(l => {
        if (!l.synced_at || !l.captured_online || l.review_status === "verified") return false;
        const latency = new Date(l.synced_at).getTime() - new Date(l.taken_at).getTime();
        return latency >= 0 && latency <= 2 * 60 * 1000;
      }).sort((a, b) => new Date(a.synced_at).getTime() - new Date(b.synced_at).getTime());

      for (let i = 0; i < onlineLogs.length - 1; i++) {
        const a = onlineLogs[i], b = onlineLogs[i + 1];
        const tA = new Date(a.taken_at).getTime();
        const tB = new Date(b.taken_at).getTime();
        const sA = new Date(a.synced_at).getTime();
        const sB = new Date(b.synced_at).getTime();

        const dT = tB - tA;
        const dS = sB - sA;

        if (dT < -15 * 60 * 1000) {
          const minsDiff = Math.round(Math.abs(dT) / 60000);
          if (b.review_status !== "verified") eng.time_risk_count++;
          eng.evidence_items.push({
            id: b.id,
            type: "sequential",
            title: "⏳ Out-of-Order Sync Timeline",
            detail: `Chronology error: Synced later (online) but claims to be taken ${minsDiff} mins earlier than previous photo.`,
            timestamp: b.taken_at,
            location: b.address || undefined,
            photo_tag: b.photo_tag || undefined,
            review_status: b.review_status,
          });
        }
        else if (dT > dS + 15 * 60 * 1000) {
          const jumpMins = Math.round((dT - dS) / 60000);
          if (b.review_status !== "verified") eng.time_risk_count++;
          eng.evidence_items.push({
            id: b.id,
            type: "sequential",
            title: "⏳ Clock Speed-up Spoof",
            detail: `Chronology error: Both photos synced online, but clock jumped forward by ${jumpMins} mins.`,
            timestamp: b.taken_at,
            location: b.address || undefined,
            photo_tag: b.photo_tag || undefined,
            review_status: b.review_status,
          });
        }
      }
    }

    // Ensure all tracked engineers exist in map so they appear on watchlist even without active photo risks
    for (const trackedEid of trackedSet) {
      if (!map[trackedEid]) {
        try {
          const profRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,full_name,engineer_code,region&id=eq.${trackedEid}`, { headers });
          const profs = await profRes.json();
          if (Array.isArray(profs) && profs.length > 0) {
            const p = profs[0];
            map[trackedEid] = {
              engineer_id: trackedEid,
              engineer_code: p.engineer_code || "",
              full_name: p.full_name || "Engineer",
              region: p.region || "-",
              gps_risk_count: 0,
              time_risk_count: 0,
              evidence_items: [],
              last_activity: new Date().toISOString(),
              is_tracked: true,
              tracked_reason: trackedMap[trackedEid]?.reason,
              tracked_at: trackedMap[trackedEid]?.tracked_at,
            };
          }
        } catch (e) { console.error("Error fetching tracked profile", e); }
      }
    }

    // Keep engineers with active risks OR manual flags OR pending clears OR tracked watchlist
    cachedRiskEngineers = Object.values(map).filter(e => {
      // If current user is a regional admin, only show engineers from their region
      if (currentAdmin && currentAdmin.role === "regional_admin" && currentAdmin.region) {
        const adminRegion = currentAdmin.region.toLowerCase().trim();
        if (e.region && e.region.trim()) {
          const engRegion = e.region.toLowerCase().trim();
          if (engRegion !== adminRegion && !engRegion.includes(adminRegion) && !adminRegion.includes(engRegion)) {
            return false;
          }
        }
      }

      return e.is_tracked || e.gps_risk_count > 0 || e.time_risk_count > 0 || e.evidence_items.some(item => item.review_status === "flagged" || item.review_status === "pending_clear");
    });

    // Sort: tracked engineers first
    cachedRiskEngineers.sort((a, b) => {
      if (a.is_tracked && !b.is_tracked) return -1;
      if (!a.is_tracked && b.is_tracked) return 1;
      return (b.gps_risk_count + b.time_risk_count) - (a.gps_risk_count + a.time_risk_count);
    });

    // Update stats
    const el = (id: string) => document.getElementById(id);
    if (el("stat-total-risk")) el("stat-total-risk")!.textContent = String(cachedRiskEngineers.length);
    if (el("stat-gps-risk")) el("stat-gps-risk")!.textContent = String(cachedRiskEngineers.filter(e => e.gps_risk_count > 0).length);
    if (el("stat-time-risk")) el("stat-time-risk")!.textContent = String(cachedRiskEngineers.filter(e => e.time_risk_count > 0).length);
    if (el("stat-tracked")) el("stat-tracked")!.textContent = String(trackedSet.size);

    applyRiskFilters();
  } catch (err) {
    console.error("Risk center fetch error", err);
  }
}

/* ─── Track By Name Search ─── */
async function searchAndTrackEngineer() {
  const input = document.getElementById("track-name-search") as HTMLInputElement | null;
  const resultsDiv = document.getElementById("track-search-results");
  if (!input || !resultsDiv) return;

  const q = input.value.trim();
  if (q.length < 2) {
    resultsDiv.innerHTML = `<div style="font-size:12px;color:#94a3b8;padding:6px 0;">Type at least 2 characters to search.</div>`;
    return;
  }

  resultsDiv.innerHTML = `<div style="font-size:12px;color:#94a3b8;padding:6px 0;">Searching...</div>`;

  try {
    const eq = encodeURIComponent(`*${q}*`);
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=id,full_name,engineer_code,email,region&or=(full_name.ilike.${eq},engineer_code.ilike.${eq},email.ilike.${eq})&limit=10`,
      { headers }
    );
    const engineers = await res.json();

    if (!Array.isArray(engineers) || engineers.length === 0) {
      resultsDiv.innerHTML = `<div style="font-size:12px;color:#94a3b8;padding:6px 0;">No engineers found matching "${q}".</div>`;
      return;
    }

    resultsDiv.innerHTML = engineers.map(eng => {
      const isTracked = trackedSet.has(eng.id);
      const ini = initials(eng.full_name || "??");
      const trackBtn = isTracked
        ? `<span class="tsr-already">👁️ Already Tracked</span>
           <button class="rc-btn rc-btn-untrack" onclick="event.stopPropagation();toggleTrack('${eng.id}').then(()=>searchAndTrackEngineer())">Untrack</button>`
        : `<button class="rc-btn rc-btn-track" onclick="event.stopPropagation();toggleTrack('${eng.id}').then(()=>searchAndTrackEngineer())">👁️ Track</button>`;

      return `
        <div class="tsr-item">
          <div class="tsr-info">
            <div class="tsr-avatar">${ini}</div>
            <div>
              <div class="tsr-name">${eng.full_name}</div>
              <div class="tsr-meta">${eng.engineer_code || ""} • ${eng.region || "-"} • ${eng.email || ""}</div>
            </div>
          </div>
          <div class="tsr-actions">
            ${trackBtn}
          </div>
        </div>`;
    }).join("");
  } catch (e) {
    console.error(e);
    resultsDiv.innerHTML = `<div style="font-size:12px;color:#ef4444;padding:6px 0;">Error searching engineers.</div>`;
  }
}

(window as any).searchAndTrackEngineer = searchAndTrackEngineer;

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

  // Track by name search
  document.getElementById("track-search-btn")?.addEventListener("click", searchAndTrackEngineer);
  document.getElementById("track-name-search")?.addEventListener("keydown", (e) => {
    if ((e as KeyboardEvent).key === "Enter") { e.preventDefault(); searchAndTrackEngineer(); }
  });

  // Flag photo by tag search
  document.getElementById("photo-search-btn")?.addEventListener("click", searchPhotoByTag);
  document.getElementById("photo-tag-search")?.addEventListener("keydown", (e) => {
    if ((e as KeyboardEvent).key === "Enter") { e.preventDefault(); searchPhotoByTag(); }
  });
});

/* ─── Search and Flag Photo By Tag ─── */
async function searchPhotoByTag() {
  const input = document.getElementById("photo-tag-search") as HTMLInputElement | null;
  const resultsDiv = document.getElementById("photo-search-results");
  if (!input || !resultsDiv) return;

  const tag = input.value.trim().toUpperCase();
  if (tag.length < 5) {
    resultsDiv.innerHTML = `<div style="font-size:12px;color:#94a3b8;padding:6px 0;">Enter at least 5 characters of the photo tag.</div>`;
    return;
  }

  resultsDiv.innerHTML = `<div style="font-size:12px;color:#94a3b8;padding:6px 0;">Searching...</div>`;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/photo_logs_with_engineer?select=id,photo_tag,full_name,engineer_code,taken_at,address,review_status,accuracy,latitude,longitude&photo_tag=ilike.*${tag}*&limit=5`,
      { headers }
    );
    const photos = await res.json();

    if (!Array.isArray(photos) || photos.length === 0) {
      resultsDiv.innerHTML = `<div style="font-size:12px;color:#94a3b8;padding:6px 0;">No photos found matching tag "${tag}".</div>`;
      return;
    }

    resultsDiv.innerHTML = photos.map(p => {
      const reviewBadge = p.review_status === "verified"
        ? `<span class="rc-badge-clear">✔️ Cleared</span>`
        : p.review_status === "flagged"
        ? `<span class="rc-badge-manual-flag">🚩 Flagged</span>`
        : p.review_status === "pending_clear"
        ? `<span class="rc-badge-pending-clear">⏳ Pending Clear</span>`
        : "";

      let actionButtons = "";
      if (p.review_status === "verified") {
        actionButtons = `<button class="ev-action-btn ev-btn-flag" onclick="event.stopPropagation();setPhotoReviewStatus('${p.id}', 'flagged')">🚩 Flag</button>`;
      } else if (p.review_status === "flagged") {
        actionButtons = `<button class="ev-action-btn ev-btn-clear" onclick="event.stopPropagation();setPhotoReviewStatus('${p.id}', 'verified')">✔️ Clear</button>`;
      } else if (p.review_status === "pending_clear") {
        if (currentAdmin?.role === "super_admin") {
          actionButtons = `
            <button class="ev-action-btn ev-btn-approve" onclick="event.stopPropagation();setPhotoReviewStatus('${p.id}', 'verified')">✔️ Approve Clear</button>
            <button class="ev-action-btn ev-btn-reject" onclick="event.stopPropagation();setPhotoReviewStatus('${p.id}', null)">❌ Reject Clear</button>
          `;
        } else {
          actionButtons = `<span style="font-size:11px;color:#f59e0b;font-weight:600;">⏳ Awaiting Super Admin</span>`;
        }
      } else {
        actionButtons = `
          <button class="ev-action-btn ev-btn-clear" onclick="event.stopPropagation();setPhotoReviewStatus('${p.id}', 'verified')">✔️ Clear</button>
          <button class="ev-action-btn ev-btn-flag" onclick="event.stopPropagation();setPhotoReviewStatus('${p.id}', 'flagged')">🚩 Flag</button>
        `;
      }

      return `
        <div class="tsr-item" style="flex-direction:column;align-items:flex-start;gap:6px;">
          <div style="display:flex;justify-content:space-between;width:100%;align-items:center;">
            <span style="font-weight:bold;color:#3b82f6;">🏷️ ${p.photo_tag} ${reviewBadge}</span>
            <div class="ev-actions" style="margin-left:auto;">${actionButtons}</div>
          </div>
          <div style="font-size:12px;color:#64748b;width:100%;">
            <strong>Engineer:</strong> ${p.full_name} (${p.engineer_code})<br/>
            <strong>Captured:</strong> ${fmtDate(p.taken_at)} • <strong>Accuracy:</strong> ${p.accuracy?.toFixed(1) || "-"}m<br/>
            <strong>Location:</strong> ${p.address || "Unknown Address"} (${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)})
          </div>
        </div>`;
    }).join("");
  } catch (e) {
    console.error(e);
    resultsDiv.innerHTML = `<div style="font-size:12px;color:#ef4444;padding:6px 0;">Error searching photos.</div>`;
  }
}
(window as any).searchPhotoByTag = searchPhotoByTag;
