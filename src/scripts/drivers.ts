import { makeTableSortable } from "./table-sort";

export async function createDriverUi() {
  const fullName = (document.getElementById("full_name") as HTMLInputElement).value;
  const email = (document.getElementById("email") as HTMLInputElement).value;
  const phone = (document.getElementById("phone") as HTMLInputElement).value;

  if (!fullName || !email) {
    alert("Full name and email are required");
    return;
  }

  const response = await fetch("/api/drivers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "create",
      full_name: fullName,
      email,
      phone
    })
  });

  const result = await response.json();

  if (result.error) {
    alert(result.error);
    return;
  }

  (document.getElementById("driver-email") as HTMLElement).textContent = result.email;
  (document.getElementById("driver-password") as HTMLElement).textContent = result.password;
  (document.getElementById("driver-code") as HTMLElement).textContent = result.driver_code;
  (document.getElementById("create-driver-result") as HTMLElement).style.display = "block";
  (document.getElementById("create-driver-form") as HTMLFormElement).reset();
}

export async function deleteDriverUi(id: string) {
  const confirmed = confirm("Are you sure you want to delete this driver?");
  if (!confirmed) return;

  const response = await fetch("/api/drivers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete", id })
  });

  const result = await response.json();

  if (result.error) {
    alert(result.error);
    return;
  }

  location.reload();
}

export async function resetPasswordUi(id: string) {
  const password = prompt("Enter new password (min 6 characters):");
  if (!password) return;

  const response = await fetch("/api/drivers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reset-password", id, password })
  });

  const result = await response.json();

  if (result.error) {
    alert(result.error);
    return;
  }

  alert("Password reset successfully!");
}

// Bind to window for global inline onclicks
(window as any).createDriverUi = createDriverUi;
(window as any).deleteDriverUi = deleteDriverUi;
(window as any).resetPasswordUi = resetPasswordUi;

// Form Submit Listener
document.getElementById("create-driver-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  await createDriverUi();
});

// Search functionality
document.getElementById("search")?.addEventListener("input", (event) => {
  const value = (event.target as HTMLInputElement).value.toLowerCase();
  document.querySelectorAll("tbody tr").forEach((row) => {
    const text = row.textContent?.toLowerCase() ?? "";
    (row as HTMLElement).style.display = text.includes(value) ? "" : "none";
  });
});

// Copy credentials to clipboard
document.getElementById("copy-driver-creds")?.addEventListener("click", async () => {
  const email = document.getElementById("driver-email")?.textContent ?? "";
  const password = document.getElementById("driver-password")?.textContent ?? "";
  const code = document.getElementById("driver-code")?.textContent ?? "";

  await navigator.clipboard.writeText(
    `Driver Code: ${code}\nEmail: ${email}\nPassword: ${password}`
  );

  alert("Credentials copied to clipboard!");
});

makeTableSortable("drivers-table");
