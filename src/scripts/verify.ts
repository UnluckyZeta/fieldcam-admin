import { saveAddress } from "../lib/api";

export async function saveAddressUi(
  photoId: string,
  latitude: number,
  longitude: number,
) {
  const button =
    document.getElementById(
      "save-address-btn",
    ) as HTMLButtonElement;

  button.disabled = true;
  button.textContent =
    "Getting address...";

  const result =
    await saveAddress(
      photoId,
      latitude,
      longitude,
    );

  if (!result.success) {
    button.disabled = false;
    button.textContent =
      "💾 Get & Save Address";

    alert(
      result.error ??
        "Failed to save address",
    );

    return;
  }

  button.textContent =
    "✅ Address Saved";

  setTimeout(() => {
    location.reload();
  }, 1000);
}

(window as any).saveAddressUi = saveAddressUi;

export async function updateReviewStatusUi(photoId: string, status: "verified" | "flagged" | null) {
  function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null;
    return null;
  }

  const adminId = getCookie("admin_id");
  let role = getCookie("admin_role");
  let email = "";

  const SUPABASE_URL = "https://vwdwpswpvqdfpsrkmgzy.supabase.co";
  const TOKEN = "sb_publishable_yI6-VfmXaCmbr7E8GCq6zg_zTUe-rMB";
  const headers = { apikey: TOKEN, Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };

  if (adminId) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/admin_users?select=role,email&id=eq.${adminId}`, { headers });
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        role = data[0].role;
        email = data[0].email;
      }
    } catch (e) {}
  }

  let finalStatus = status;
  if (status === "verified" && role === "regional_admin") {
    finalStatus = "pending_clear";
  }

  const reviewer = email ? `${role} (${email})` : (role || "admin");

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/photo_logs?id=eq.${photoId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        review_status: finalStatus,
        reviewed_at: finalStatus ? new Date().toISOString() : null,
        reviewed_by: finalStatus ? reviewer : null
      })
    });

    if (res.ok) {
      location.reload();
    } else {
      const err = await res.json();
      alert("Error updating review status: " + (err.message || "Unknown error"));
    }
  } catch (e: any) {
    alert("Connection error: " + e.message);
  }
}

(window as any).updateReviewStatusUi = updateReviewStatusUi;