import { tt as __exportAll } from "./shorthash_aHtTz3Kx.mjs";
import { C as createComponent, a as renderComponent, d as renderTemplate, h as maybeRenderHead } from "./server_DopqXNux.mjs";
import "./compiler_CmYLqfSk.mjs";
import { t as $$AdminLayout } from "./AdminLayout_D5uYVy3a.mjs";
//#region src/pages/logs.astro
var logs_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Logs,
	file: () => $$file,
	url: () => $$url
});
var $$Logs = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Logs" }, { "default": ($$result) => renderTemplate`
  ${maybeRenderHead($$result)}<h1>Logs</h1>
` })}`;
}, "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/pages/logs.astro", void 0);
var $$file = "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/pages/logs.astro";
var $$url = "/logs";
//#endregion
//#region \0virtual:astro:page:src/pages/logs@_@astro
var page = () => logs_exports;
//#endregion
export { page };
