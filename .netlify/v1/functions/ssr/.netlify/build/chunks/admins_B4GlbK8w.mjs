import { tt as __exportAll } from "./shorthash_aHtTz3Kx.mjs";
import { C as createComponent, S as createAstro, _ as addAttribute, a as renderComponent, d as renderTemplate, h as maybeRenderHead, n as renderScript } from "./server_DopqXNux.mjs";
import "./compiler_CmYLqfSk.mjs";
import { t as $$AdminLayout } from "./AdminLayout_D5uYVy3a.mjs";
import { t as getAdmins } from "./api_D-rHVfok.mjs";
//#region src/pages/admins.astro
var admins_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Admins,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Admins = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Admins;
	const data = await getAdmins(Astro.cookies.get("admin_id")?.value ?? "");
	if (!data.success) return Astro.redirect("/");
	const admins = data.admins ?? [];
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Admins",
		"data-astro-cid-l5apvznr": true
	}, { "default": async ($$result) => renderTemplate`

${maybeRenderHead($$result)}<h1 data-astro-cid-l5apvznr>Admin Management</h1>

<div class="card" data-astro-cid-l5apvznr><h2 data-astro-cid-l5apvznr>Create Admin</h2><form id="create-admin-form" data-astro-cid-l5apvznr><input id="full_name" placeholder="Full Name" data-astro-cid-l5apvznr><input id="email" placeholder="Email" data-astro-cid-l5apvznr><select id="role" data-astro-cid-l5apvznr><option value="regional_admin" data-astro-cid-l5apvznr>Regional Admin</option><option value="super_admin" data-astro-cid-l5apvznr>Super Admin</option></select><input id="region" placeholder="Region" data-astro-cid-l5apvznr><button type="submit" data-astro-cid-l5apvznr>Create</button></form><div id="create-admin-result" class="result-card" style="display:none;" data-astro-cid-l5apvznr><h3 data-astro-cid-l5apvznr>✅ Admin Created</h3><div data-astro-cid-l5apvznr><strong data-astro-cid-l5apvznr>Email:</strong><span id="created-email" data-astro-cid-l5apvznr></span></div><div data-astro-cid-l5apvznr><strong data-astro-cid-l5apvznr>Password:</strong><span id="created-password" data-astro-cid-l5apvznr></span></div><button id="copy-admin-creds" class="btn-copy" data-astro-cid-l5apvznr>Copy Credentials</button></div></div>

<table data-astro-cid-l5apvznr><thead data-astro-cid-l5apvznr><tr data-astro-cid-l5apvznr><th data-astro-cid-l5apvznr>Name</th><th data-astro-cid-l5apvznr>Email</th><th data-astro-cid-l5apvznr>Role</th><th data-astro-cid-l5apvznr>Region</th><th data-astro-cid-l5apvznr>Actions</th></tr></thead><tbody data-astro-cid-l5apvznr>${admins.map((admin) => renderTemplate`<tr data-astro-cid-l5apvznr><td data-astro-cid-l5apvznr>${admin.full_name}</td><td data-astro-cid-l5apvznr>${admin.email}</td><td data-astro-cid-l5apvznr>${admin.role}</td><td data-astro-cid-l5apvznr>${admin.region ?? "-"}</td><td class="actions" data-astro-cid-l5apvznr><button class="btn btn-edit"${addAttribute(`editAdminUi(
    '${admin.id}',
    '${admin.full_name}',
    '${admin.email}',
    '${admin.role}',
    '${admin.region ?? ""}'
  )`, "onclick")} data-astro-cid-l5apvznr>Edit</button><button class="btn btn-password"${addAttribute(`resetPasswordUi(
    '${admin.id}'
  )`, "onclick")} data-astro-cid-l5apvznr>Reset Password</button><button class="btn btn-delete"${addAttribute(`deleteAdminUi(
    '${admin.id}'
  )`, "onclick")} data-astro-cid-l5apvznr>Delete</button></td></tr>`)}</tbody></table>

` })}${renderScript($$result, "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/pages/admins.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/pages/admins.astro", void 0);
var $$file = "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/pages/admins.astro";
var $$url = "/admins";
//#endregion
//#region \0virtual:astro:page:src/pages/admins@_@astro
var page = () => admins_exports;
//#endregion
export { page };
