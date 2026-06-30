import { makeTableSortable } from "./table-sort";

export async function createWorkerUi() {
  const fullName = (document.getElementById("full_name") as HTMLInputElement).value;
  const email = (document.getElementById("email") as HTMLInputElement).value;
  const phone = (document.getElementById("phone") as HTMLInputElement).value;
  const department = (document.getElementById("department") as HTMLInputElement).value;

  if (!fullName || !email) {
    alert("Full name and email are required");
    return;
  }

  const response = await fetch("/api/workers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "create",
      full_name: fullName,
      email,
      phone,
      department
    })
  });

  const result = await response.json();

  if (result.error) {
    alert(result.error);
    return;
  }

  (document.getElementById("worker-email") as HTMLElement).textContent = result.email;
  (document.getElementById("worker-password") as HTMLElement).textContent = result.password;
  (document.getElementById("worker-code") as HTMLElement).textContent = result.worker_code;
  (document.getElementById("create-worker-result") as HTMLElement).style.display = "block";
  (document.getElementById("create-worker-form") as HTMLFormElement).reset();
}

export async function deleteWorkerUi(id: string) {
  const confirmed = confirm("Are you sure you want to delete this worker?");
  if (!confirmed) return;

  const response = await fetch("/api/workers", {
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

  const response = await fetch("/api/workers", {
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
(window as any).createWorkerUi = createWorkerUi;
(window as any).deleteWorkerUi = deleteWorkerUi;
(window as any).resetPasswordUi = resetPasswordUi;

// Form Submit Listener
document.getElementById("create-worker-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  await createWorkerUi();
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
document.getElementById("copy-worker-creds")?.addEventListener("click", async () => {
  const email = document.getElementById("worker-email")?.textContent ?? "";
  const password = document.getElementById("worker-password")?.textContent ?? "";
  const code = document.getElementById("worker-code")?.textContent ?? "";

  await navigator.clipboard.writeText(
    `Worker Code: ${code}\nEmail: ${email}\nPassword: ${password}`
  );

  alert("Credentials copied to clipboard!");
});

makeTableSortable("workers-table");
