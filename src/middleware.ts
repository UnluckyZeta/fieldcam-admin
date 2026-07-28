import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
  const { url, cookies, redirect } = context;
  const isLoginPage = url.pathname === "/login";
  const adminId = cookies.get("admin_id")?.value;

  if (!isLoginPage && !adminId) {
    return redirect("/login");
  }

  return next();
});
