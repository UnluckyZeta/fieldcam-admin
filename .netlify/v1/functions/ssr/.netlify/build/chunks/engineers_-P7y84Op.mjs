import { tt as __exportAll } from "./shorthash_aHtTz3Kx.mjs";
import { C as createComponent, S as createAstro, _ as addAttribute, a as renderComponent, d as renderTemplate, h as maybeRenderHead, n as renderScript } from "./server_DopqXNux.mjs";
import "./compiler_CmYLqfSk.mjs";
import { t as $$AdminLayout } from "./AdminLayout_D5uYVy3a.mjs";
import { i as getEngineers } from "./api_D-rHVfok.mjs";
//#region src/components/EngineersTable.astro
createAstro("https://astro.build");
var $$EngineersTable = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$EngineersTable;
	const { engineers } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<table data-astro-cid-dqdcr2lk><thead data-astro-cid-dqdcr2lk><tr data-astro-cid-dqdcr2lk><th data-astro-cid-dqdcr2lk>Name</th><th data-astro-cid-dqdcr2lk>Email</th><th data-astro-cid-dqdcr2lk>Code</th><th data-astro-cid-dqdcr2lk>Status</th><th data-astro-cid-dqdcr2lk>Device ID</th><th data-astro-cid-dqdcr2lk>Last Photo</th><th data-astro-cid-dqdcr2lk>GPS</th><th data-astro-cid-dqdcr2lk>Region</th><th data-astro-cid-dqdcr2lk>Subregion</th><th data-astro-cid-dqdcr2lk>Actions</th></tr></thead><tbody data-astro-cid-dqdcr2lk>${engineers.map((engineer) => renderTemplate`<tr data-astro-cid-dqdcr2lk><td data-astro-cid-dqdcr2lk>${engineer.full_name}</td><td data-astro-cid-dqdcr2lk>${engineer.email}</td><td data-astro-cid-dqdcr2lk>${engineer.engineer_code}</td><td data-astro-cid-dqdcr2lk>${engineer.status}</td><td${addAttribute(engineer.device_id, "title")} data-astro-cid-dqdcr2lk>${engineer.device_id ? engineer.device_id.slice(0, 8) : "Not Registered"}</td><td data-astro-cid-dqdcr2lk>${engineer.last_photo_at ? new Date(engineer.last_photo_at).toLocaleDateString() : "Never"}</td><td data-astro-cid-dqdcr2lk><span${addAttribute(engineer.gps_risk === "high" ? "danger" : "success", "class")} data-astro-cid-dqdcr2lk>${engineer.gps_risk === "high" ? "High" : "Normal"}</span></td><td title="Auto-detected from latest photo" data-astro-cid-dqdcr2lk>${engineer.region || "-"}</td><td title="Auto-detected from latest photo" data-astro-cid-dqdcr2lk>${engineer.subregion || "-"}</td><td class="actions" data-astro-cid-dqdcr2lk><a class="btn btn-view"${addAttribute(`/engineers/${engineer.id}`, "href")} data-astro-cid-dqdcr2lk>View</a><button class="btn btn-edit"${addAttribute(`editEngineerUi(
      '${engineer.id}',
      '${engineer.full_name}',
      '${engineer.email}' ,
      '${engineer.phone ?? ""}'

    )`, "onclick")} data-astro-cid-dqdcr2lk>Edit</button><button class="btn btn-delete"${addAttribute(`deleteEngineerUi(
      '${engineer.id}'
    )`, "onclick")} data-astro-cid-dqdcr2lk>Delete</button><button class="btn btn-password"${addAttribute(`resetPasswordUi(
    '${engineer.id}'
  )`, "onclick")} data-astro-cid-dqdcr2lk>Reset Password</button><button class="btn btn-reset"${addAttribute(`resetDeviceUi(
      '${engineer.id}'
    )`, "onclick")} data-astro-cid-dqdcr2lk>Reset Device</button></td></tr>`)}</tbody></table>`;
}, "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/components/EngineersTable.astro", void 0);
//#endregion
//#region src/pages/engineers.astro
var engineers_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Engineers,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Engineers = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Engineers;
	const engineers = (await getEngineers("", "", Astro.cookies.get("admin_id")?.value ?? "")).engineers ?? [];
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Engineers",
		"data-astro-cid-fjymzp4a": true
	}, { "default": async ($$result) => renderTemplate`
  ${maybeRenderHead($$result)}<div class="card" data-astro-cid-fjymzp4a><h2 data-astro-cid-fjymzp4a>Create Engineer</h2><form id="create-engineer-form" class="create-form" data-astro-cid-fjymzp4a><input id="full_name" placeholder="Full Name" data-astro-cid-fjymzp4a><input id="email" placeholder="Email" data-astro-cid-fjymzp4a><input id="phone" placeholder="Phone Number" data-astro-cid-fjymzp4a><button type="submit" data-astro-cid-fjymzp4a>Create Engineer</button></form><div id="create-engineer-result" class="result-card" style="display:none;" data-astro-cid-fjymzp4a><h3 data-astro-cid-fjymzp4a>✅ Engineer Created</h3><div data-astro-cid-fjymzp4a><strong data-astro-cid-fjymzp4a>Email:</strong><span id="engineer-email" data-astro-cid-fjymzp4a></span></div><div data-astro-cid-fjymzp4a><strong data-astro-cid-fjymzp4a>Password:</strong><span id="engineer-password" data-astro-cid-fjymzp4a></span></div><div data-astro-cid-fjymzp4a><strong data-astro-cid-fjymzp4a>Engineer Code:</strong><span id="engineer-code" data-astro-cid-fjymzp4a></span></div><button id="copy-engineer-creds" class="btn-copy" data-astro-cid-fjymzp4a>Copy Credentials</button></div></div>

  <div class="toolbar" data-astro-cid-fjymzp4a><input id="search" class="search-input" placeholder="Search engineer..." data-astro-cid-fjymzp4a></div>

  ${renderComponent($$result, "EngineersTable", $$EngineersTable, {
		"engineers": engineers,
		"data-astro-cid-fjymzp4a": true
	})}
` })}${renderScript($$result, "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/pages/engineers.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/pages/engineers.astro", void 0);
var $$file = "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/pages/engineers.astro";
var $$url = "/engineers";
//#endregion
//#region \0virtual:astro:page:src/pages/engineers@_@astro
var page = () => engineers_exports;
//#endregion
export { page };
