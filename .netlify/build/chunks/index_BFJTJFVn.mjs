import { tt as __exportAll } from "./shorthash_aHtTz3Kx.mjs";
import { C as createComponent, S as createAstro, _ as addAttribute, a as renderComponent, d as renderTemplate, h as maybeRenderHead, n as renderScript } from "./server_DopqXNux.mjs";
import "./compiler_CmYLqfSk.mjs";
import { t as $$AdminLayout } from "./AdminLayout_D5uYVy3a.mjs";
import { n as getDashboard } from "./api_D-rHVfok.mjs";
//#region src/pages/index.astro
var pages_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => ""
});
createAstro("https://astro.build");
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Index;
	const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
	const from = Astro.url.searchParams.get("from") ?? today;
	const to = Astro.url.searchParams.get("to") ?? today;
	const data = await getDashboard(from, to, Astro.cookies.get("admin_id")?.value ?? "");
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Dashboard",
		"data-astro-cid-lcdefpme": true
	}, { "default": async ($$result) => renderTemplate`
  ${maybeRenderHead($$result)}<h1 data-astro-cid-lcdefpme>Dashboard</h1>
<div class="toolbar" data-astro-cid-lcdefpme><form method="GET" class="filters" data-astro-cid-lcdefpme><input type="date" name="from"${addAttribute(from, "value")} onfocus="this.showPicker()" data-astro-cid-lcdefpme><input type="date" name="to"${addAttribute(to, "value")} onfocus="this.showPicker()" data-astro-cid-lcdefpme><button type="submit" data-astro-cid-lcdefpme>Apply</button><a href="/" class="btn-reset" data-astro-cid-lcdefpme>Reset</a><button id="export-btn" type="button" class="btn-export" data-astro-cid-lcdefpme>Export CSV</button></form></div>
  <div class="stats" data-astro-cid-lcdefpme><div class="stat-card" data-astro-cid-lcdefpme><h3 data-astro-cid-lcdefpme>Total Engineers</h3><p data-astro-cid-lcdefpme>${data.total_engineers}</p></div><div class="stat-card" data-astro-cid-lcdefpme><h3 data-astro-cid-lcdefpme>Total Photos</h3><p data-astro-cid-lcdefpme>${data.total_photos}</p></div><div class="stat-card" data-astro-cid-lcdefpme><h3 data-astro-cid-lcdefpme>Photos Today</h3><p data-astro-cid-lcdefpme>${data.photos_today}</p></div><div class="stat-card" data-astro-cid-lcdefpme><h3 data-astro-cid-lcdefpme>GPS Risk</h3><p${addAttribute(data.gps_risk_engineers > 0 ? "danger" : "success", "class")} data-astro-cid-lcdefpme>${data.gps_risk_engineers}</p></div></div>

  <div class="section" data-astro-cid-lcdefpme><h2 data-astro-cid-lcdefpme>High Risk Engineers</h2><table data-astro-cid-lcdefpme><thead data-astro-cid-lcdefpme><tr data-astro-cid-lcdefpme><th data-astro-cid-lcdefpme>Name</th><th data-astro-cid-lcdefpme>Code</th><th data-astro-cid-lcdefpme>Risk</th><th data-astro-cid-lcdefpme>View</th></tr></thead><tbody data-astro-cid-lcdefpme>${data.high_risk_engineers.map((engineer) => renderTemplate`<tr data-astro-cid-lcdefpme><td data-astro-cid-lcdefpme>${engineer.full_name}</td><td data-astro-cid-lcdefpme>${engineer.engineer_code}</td><td data-astro-cid-lcdefpme>⚠ High</td><td data-astro-cid-lcdefpme><a class="btn"${addAttribute(`/engineers/${engineer.id}`, "href")} data-astro-cid-lcdefpme>View</a></td></tr>`)}</tbody></table></div>
` })}${renderScript($$result, "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/pages/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/pages/index.astro", void 0);
var $$file = "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/pages/index.astro";
//#endregion
//#region \0virtual:astro:page:src/pages/index@_@astro
var page = () => pages_exports;
//#endregion
export { page };
