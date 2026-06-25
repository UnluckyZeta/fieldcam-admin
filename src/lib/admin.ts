import { updateAdmin } from "./api";
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
export async function editAdminUi(
  id: string,
  fullName: string,
  email: string,
  role: string,
  region: string,
) {
  const newName =
    prompt(
      "Full Name",
      fullName,
    );

  if (!newName) {
    return;
  }

  const newEmail =
    prompt(
      "Email",
      email,
    );

  if (!newEmail) {
    return;
  }

  const newRegion =
    prompt(
      "Region",
      region,
    );

  const result =
    await updateAdmin(
      id,
      newName,
      newEmail,
      role,
      newRegion ?? "",
    );

  if (result.error) {
    alert(result.error);
    return;
  }

  location.reload();
}
