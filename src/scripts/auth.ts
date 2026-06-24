import { supabase }
  from "../lib/supabase";

async function logout() {
  await supabase.auth.signOut();

  window.location.href =
    "/login";
}

(window as any).logout =
  logout;