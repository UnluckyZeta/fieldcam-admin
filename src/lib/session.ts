import { supabase }
  from "./supabase";

export async function
checkSession() {
  const {
    data: { session },
  } =
    await supabase.auth.getSession();

  return session;
}