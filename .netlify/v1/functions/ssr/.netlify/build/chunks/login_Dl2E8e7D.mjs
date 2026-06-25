import { tt as __exportAll } from "./shorthash_aHtTz3Kx.mjs";
import { C as createComponent, a as renderComponent, d as renderTemplate, h as maybeRenderHead, n as renderScript } from "./server_DopqXNux.mjs";
import "./compiler_CmYLqfSk.mjs";
import { t as $$AdminLayout } from "./AdminLayout_D5uYVy3a.mjs";
//#region src/pages/login.astro
var login_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Login,
	file: () => $$file,
	url: () => $$url
});
var $$Login = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Login",
		"data-astro-cid-sjqh5bze": true
	}, { "default": ($$result) => renderTemplate`
  ${maybeRenderHead($$result)}<div class="login-container" data-astro-cid-sjqh5bze><div class="login-card" data-astro-cid-sjqh5bze><h1 data-astro-cid-sjqh5bze>FieldCam Admin</h1><form id="login-form" data-astro-cid-sjqh5bze><input id="email" type="email" placeholder="Email" required data-astro-cid-sjqh5bze><input id="password" type="password" placeholder="Password" required data-astro-cid-sjqh5bze><button type="submit" data-astro-cid-sjqh5bze>Login</button></form></div></div>
` })}${renderScript($$result, "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/pages/login.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/pages/login.astro", void 0);
var $$file = "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/pages/login.astro";
var $$url = "/login";
//#endregion
//#region \0virtual:astro:page:src/pages/login@_@astro
var page = () => login_exports;
//#endregion
export { page };
