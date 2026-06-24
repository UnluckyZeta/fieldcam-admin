import { supabase }
  from "./supabase";

export async function
requireAdmin() {
  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    window.location.href =
      "/login";

    return null;
  }

  return user;
}