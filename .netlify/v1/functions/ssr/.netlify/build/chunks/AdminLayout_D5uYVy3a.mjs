import { C as createComponent, S as createAstro, a as renderComponent, c as renderSlot, d as renderTemplate, g as renderHead, h as maybeRenderHead, n as renderScript } from "./server_DopqXNux.mjs";
import "./compiler_CmYLqfSk.mjs";
//#region src/components/Sidebar.astro
createAstro("https://astro.build");
var $$Sidebar = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Sidebar;
	const adminRole = Astro.cookies.get("admin_role")?.value;
	console.log(adminRole);
	return renderTemplate`${maybeRenderHead($$result)}<nav class="sidebar" data-astro-cid-wv7whodv><a href="/" data-astro-cid-wv7whodv>Dashboard</a><a href="/engineers" data-astro-cid-wv7whodv>Engineers</a><a href="/verify" data-astro-cid-wv7whodv>Verify</a>${adminRole === "super_admin" && renderTemplate`<a href="/admins" data-astro-cid-wv7whodv>Admins</a>`}<button onclick="logout()" class="logout-btn" data-astro-cid-wv7whodv>Logout</button></nav>${renderScript($$result, "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/components/Sidebar.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/components/Sidebar.astro", void 0);
//#endregion
//#region src/layouts/AdminLayout.astro
createAstro("https://astro.build");
var $$AdminLayout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$AdminLayout;
	const { title = "FieldCam Admin" } = Astro.props;
	const isLoginPage = Astro.url.pathname === "/login";
	return renderTemplate`<html lang="en" data-astro-cid-w6su3bgr><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title>${renderHead($$result)}</head>${!isLoginPage && renderTemplate`${renderScript($$result, "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/layouts/AdminLayout.astro?astro&type=script&index=0&lang.ts")}`}<body data-astro-cid-w6su3bgr>${isLoginPage ? renderTemplate`<main class="login-main" data-astro-cid-w6su3bgr>${renderSlot($$result, $$slots["default"])}</main>` : renderTemplate`<div class="app" data-astro-cid-w6su3bgr>${renderComponent($$result, "Sidebar", $$Sidebar, { "data-astro-cid-w6su3bgr": true })}<main data-astro-cid-w6su3bgr>${renderSlot($$result, $$slots["default"])}</main></div>`}</body></html>`;
}, "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/layouts/AdminLayout.astro", void 0);
//#endregion
export { $$AdminLayout as t };
