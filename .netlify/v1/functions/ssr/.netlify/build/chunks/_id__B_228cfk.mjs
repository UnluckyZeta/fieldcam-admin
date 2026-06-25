import { tt as __exportAll } from "./shorthash_aHtTz3Kx.mjs";
import { C as createComponent, S as createAstro, _ as addAttribute, a as renderComponent, d as renderTemplate, h as maybeRenderHead, n as renderScript } from "./server_DopqXNux.mjs";
import "./compiler_CmYLqfSk.mjs";
import { t as $$AdminLayout } from "./AdminLayout_D5uYVy3a.mjs";
import { r as getEngineer } from "./api_D-rHVfok.mjs";
//#region src/pages/engineers/[id].astro
var _id__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Id,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Id = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Id;
	function formatEgyptDate(date) {
		return new Date(date).toLocaleString("en-US", {
			timeZone: "Africa/Cairo",
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit",
			hour12: true
		}).replace(",", " •");
	}
	const { id } = Astro.params;
	const data = await getEngineer(id, Astro.url.searchParams.get("from") ?? "", Astro.url.searchParams.get("to") ?? "");
	const engineer = data.engineer;
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Engineer Details",
		"data-astro-cid-d5s7db43": true
	}, { "default": async ($$result) => renderTemplate`
  ${maybeRenderHead($$result)}<div class="page-container" data-astro-cid-d5s7db43><h1 data-astro-cid-d5s7db43>${engineer.full_name}</h1><div class="stats" data-astro-cid-d5s7db43><div class="stat-card" data-astro-cid-d5s7db43><h3 data-astro-cid-d5s7db43>Email</h3><p data-astro-cid-d5s7db43>${engineer.email}</p></div><div class="stat-card" data-astro-cid-d5s7db43><h3 data-astro-cid-d5s7db43>Engineer Code</h3><p data-astro-cid-d5s7db43>${engineer.engineer_code}</p></div><div class="stat-card" data-astro-cid-d5s7db43><h3 data-astro-cid-d5s7db43>Assigned Region</h3><p data-astro-cid-d5s7db43>${engineer.region || data.auto_region || "Unknown"}</p></div><div class="stat-card" data-astro-cid-d5s7db43><h3 data-astro-cid-d5s7db43>Assigned Subregion</h3><p data-astro-cid-d5s7db43>${engineer.subregion || data.auto_subregion || "Unknown"}</p></div><div class="stat-card" data-astro-cid-d5s7db43><h3 data-astro-cid-d5s7db43>Current Region</h3><p data-astro-cid-d5s7db43>${data.auto_region ?? "Unknown"}</p></div><div class="stat-card" data-astro-cid-d5s7db43><h3 data-astro-cid-d5s7db43>Current Subregion</h3><p data-astro-cid-d5s7db43>${data.auto_subregion ?? "Unknown"}</p></div><div class="stat-card" data-astro-cid-d5s7db43><h3 data-astro-cid-d5s7db43>Device ID</h3><p data-astro-cid-d5s7db43>${engineer.device_id ?? "Not Registered"}</p></div><div class="stat-card" data-astro-cid-d5s7db43><h3 data-astro-cid-d5s7db43>Total Photos</h3><p data-astro-cid-d5s7db43>${data.total_photos}</p></div><div class="stat-card" data-astro-cid-d5s7db43><h3 data-astro-cid-d5s7db43>Last Photo</h3><p data-astro-cid-d5s7db43>${data.last_photo ? formatEgyptDate(data.last_photo.taken_at) : "Never"}</p></div><div class="stat-card" data-astro-cid-d5s7db43><h3 data-astro-cid-d5s7db43>Last Location</h3><p data-astro-cid-d5s7db43>${data.last_photo?.address ?? "Unknown"}</p></div><div class="stat-card" data-astro-cid-d5s7db43><h3 data-astro-cid-d5s7db43>Phone</h3><p data-astro-cid-d5s7db43>${engineer.phone ?? "Not Set"}</p></div><div class="stat-card" data-astro-cid-d5s7db43><h3 data-astro-cid-d5s7db43>Current Device</h3><p data-astro-cid-d5s7db43>${engineer.device_id ?? "Unknown"}</p></div><div class="stat-card" data-astro-cid-d5s7db43><h3 data-astro-cid-d5s7db43>Devices Used</h3><p data-astro-cid-d5s7db43>${data.device_count}</p></div><div class="stat-card region-card" data-astro-cid-d5s7db43><h3 data-astro-cid-d5s7db43>Region Settings</h3><div class="region-actions" data-astro-cid-d5s7db43><button class="btn-edit-region"${addAttribute(`editRegionUi(
        '${engineer.id}',
        '${engineer.region ?? ""}',
        '${engineer.subregion ?? ""}'
      )`, "onclick")} data-astro-cid-d5s7db43>Edit Region</button></div></div></div><form method="GET" class="filters" data-astro-cid-d5s7db43><input type="date" onfocus="this.showPicker()" name="from"${addAttribute(Astro.url.searchParams.get("from") ?? "", "value")} data-astro-cid-d5s7db43><input type="date" onfocus="this.showPicker()" name="to"${addAttribute(Astro.url.searchParams.get("to") ?? "", "value")} data-astro-cid-d5s7db43><button type="submit" data-astro-cid-d5s7db43>Filter</button><a${addAttribute(`/engineers/${id}`, "href")} class="btn-reset" data-astro-cid-d5s7db43>Reset</a></form><h2 data-astro-cid-d5s7db43>Recent Photos</h2><table class="photos-table" data-astro-cid-d5s7db43><thead data-astro-cid-d5s7db43><tr data-astro-cid-d5s7db43><th data-astro-cid-d5s7db43>Tag</th><th data-astro-cid-d5s7db43>Date</th><th data-astro-cid-d5s7db43>Address</th><th data-astro-cid-d5s7db43>Risk</th><th data-astro-cid-d5s7db43>Verify</th></tr></thead><tbody data-astro-cid-d5s7db43>${data.recent_photos.map((photo) => renderTemplate`<tr data-astro-cid-d5s7db43><td data-astro-cid-d5s7db43>${photo.photo_tag}</td><td data-astro-cid-d5s7db43>${formatEgyptDate(photo.taken_at)}</td><td data-astro-cid-d5s7db43>${photo.address}</td><td data-astro-cid-d5s7db43><span${addAttribute(photo.gps_risk === "high" ? "danger" : "success", "class")} data-astro-cid-d5s7db43>${photo.gps_risk === "high" ? "⚠ High" : "✅ Normal"}</span></td><td data-astro-cid-d5s7db43><a class="btn"${addAttribute(`/verify?tag=${photo.photo_tag}`, "href")} data-astro-cid-d5s7db43>Verify</a></td></tr>`)}</tbody></table><h2 data-astro-cid-d5s7db43>Device History</h2><table class="photos-table" data-astro-cid-d5s7db43><thead data-astro-cid-d5s7db43><tr data-astro-cid-d5s7db43><th data-astro-cid-d5s7db43>Device ID</th><th data-astro-cid-d5s7db43>First Seen</th><th data-astro-cid-d5s7db43>Last Seen</th><th data-astro-cid-d5s7db43>Photos</th></tr></thead><tbody data-astro-cid-d5s7db43>${data.device_history.map((device) => renderTemplate`<tr data-astro-cid-d5s7db43><td data-astro-cid-d5s7db43>${device.device_id}</td><td data-astro-cid-d5s7db43>${new Date(device.first_seen).toLocaleDateString()}</td><td data-astro-cid-d5s7db43>${new Date(device.last_seen).toLocaleDateString()}</td><td data-astro-cid-d5s7db43>${device.photos}</td></tr>`)}</tbody></table></div>
` })}${renderScript($$result, "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/pages/engineers/[id].astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/pages/engineers/[id].astro", void 0);
var $$file = "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/pages/engineers/[id].astro";
var $$url = "/engineers/[id]";
//#endregion
//#region \0virtual:astro:page:src/pages/engineers/[id]@_@astro
var page = () => _id__exports;
//#endregion
export { page };
