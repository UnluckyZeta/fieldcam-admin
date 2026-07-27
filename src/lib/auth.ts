import { supabase } from "./supabase";

export async function requireAdmin() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = "/login";

    return null;
  }

  return session.user;
}