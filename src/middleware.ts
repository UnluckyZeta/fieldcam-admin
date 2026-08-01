import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
  const { url, cookies, redirect } = context;
  const isPublicPage = url.pathname === "/login" || url.pathname === "/support";
  const adminId = cookies.get("admin_id")?.value;

  if (!isPublicPage && !adminId) {
    return redirect("/login");
  }

  return next();
});
