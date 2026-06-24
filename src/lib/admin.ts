import { supabase }
  from "./supabase";

export async function isAdmin() {
  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const {
    data,
    error,
  } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return false;
  }

  return !!data;
}