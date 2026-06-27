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

(window as any).saveAddressUi =
  saveAddressUi;