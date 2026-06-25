import { tt as __exportAll } from "./shorthash_aHtTz3Kx.mjs";
import { C as createComponent, S as createAstro, _ as addAttribute, a as renderComponent, d as renderTemplate, h as maybeRenderHead } from "./server_DopqXNux.mjs";
import "./compiler_CmYLqfSk.mjs";
import { t as $$AdminLayout } from "./AdminLayout_D5uYVy3a.mjs";
import { a as verifyPhoto } from "./api_D-rHVfok.mjs";
//#region src/pages/verify.astro
var verify_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Verify,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Verify = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Verify;
	const tag = Astro.url.searchParams.get("tag");
	let result = null;
	if (tag) result = await verifyPhoto(tag);
	console.log(result);
	return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, {
		"title": "Verify Photo",
		"data-astro-cid-vnprhlxq": true
	}, { "default": async ($$result) => renderTemplate`
  ${maybeRenderHead($$result)}<h1 data-astro-cid-vnprhlxq>Verify Photo</h1>

  <form method="GET" data-astro-cid-vnprhlxq><input name="tag" placeholder="FC-BDC243FC"${addAttribute(tag ?? "", "value")} data-astro-cid-vnprhlxq><button type="submit" data-astro-cid-vnprhlxq>Verify</button></form>

  ${result?.found && renderTemplate`<div class="card" data-astro-cid-vnprhlxq><p data-astro-cid-vnprhlxq>Engineer:${result.photo.full_name}</p><p data-astro-cid-vnprhlxq>Engineer Code:${result.photo.engineer_code}</p><p data-astro-cid-vnprhlxq>Email:${result.photo.email ?? "Not Available"}</p><p data-astro-cid-vnprhlxq>Phone:${result.photo.phone ?? "Not Available"}</p><p data-astro-cid-vnprhlxq>Photo Tag:${result.photo.photo_tag}</p><p data-astro-cid-vnprhlxq>Date:${new Date(result.photo.taken_at).toLocaleString("en-GB", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	})}        </p><p data-astro-cid-vnprhlxq>Address:${result.photo.address}</p><p data-astro-cid-vnprhlxq>GPS:${result.photo.latitude},${result.photo.longitude}</p></div>`}${tag && !result?.found && renderTemplate`<div class="card error" data-astro-cid-vnprhlxq>❌ Photo not found</div>`}` })}`;
}, "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/pages/verify.astro", void 0);
var $$file = "C:/Users/HP/Desktop/Zeta/2/fieldcam-admin/src/pages/verify.astro";
var $$url = "/verify";
//#endregion
//#region \0virtual:astro:page:src/pages/verify@_@astro
var page = () => verify_exports;
//#endregion
export { page };
