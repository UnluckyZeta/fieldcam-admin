import { supabase }
  from "../lib/supabase";

async function logout() {
  await supabase.auth.signOut();
document.cookie =
  "admin_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href =
    "/login";
}

(window as any).logout =
  logout;