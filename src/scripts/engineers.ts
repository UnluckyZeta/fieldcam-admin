import {
  createEngineer,
  updateEngineer,
  deleteEngineer,
  resetDevice,
  resetPassword,
  updateEngineerRegion,
  getEngineers,
} from "../lib/api";
import { makeTableSortable } from "./table-sort";

export async function createEngineerUi() {
  const fullName =
    (
      document.getElementById(
        "full_name",
      ) as HTMLInputElement
    ).value;

  const email =
    (
      document.getElementById(
        "email",
      ) as HTMLInputElement
    ).value;

  const phone =
    (
      document.getElementById(
        "phone",
      ) as HTMLInputElement
    ).value;
const region =
  (
    document.getElementById(
      "region",
    ) as HTMLInputElement
  ).value
    .trim()
    .toLowerCase();
  const result =
    await createEngineer(
      fullName,
      email,
      phone,region
    );

  if (result.error) {
    alert(result.error);
    return;
  }

  (
    document.getElementById(
      "engineer-email",
    ) as HTMLElement
  ).textContent =
    result.email;

  (
    document.getElementById(
      "engineer-password",
    ) as HTMLElement
  ).textContent =
    result.password;

  (
    document.getElementById(
      "engineer-code",
    ) as HTMLElement
  ).textContent =
    result.engineer_code;

  (
    document.getElementById(
      "create-engineer-result",
    ) as HTMLElement
  ).style.display =
    "block";

  (
    document.getElementById(
      "create-engineer-form",
    ) as HTMLFormElement
  ).reset();
}
export async function editEngineerUi(
  id: string,
  fullName: string,
  email: string,
  phone: string | null,
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

  const newPhone =
    prompt(
      "Phone",
      phone ?? "",
    );

  const result =
    await updateEngineer(
      id,
      newName,
      newEmail,
      newPhone ?? "",
    );

  if (result.error) {
    alert(result.error);
    return;
  }

  location.reload();
}
export async function resetDeviceUi(
  id: string,
) {
  const confirmed = confirm(
    "Reset device?"
  );

  if (!confirmed) return;

  const result =
    await resetDevice(id);

  if (result.error) {
    alert(result.error);
    return;
  }

  alert("Device reset");
}


export async function deleteEngineerUi(
  id: string,
) {
  const confirmed =
    confirm(
      "Delete engineer?",
    );

  if (!confirmed) {
    return;
  }

  const result =
    await deleteEngineer(id);

  if (result.error) {
    alert(result.error);

    return;
  }

  location.reload();
}
async function editRegionUi(
  engineerId: string,
  currentRegion = "",
  currentSubregion = "",
) {
  const region = prompt(
    "Region",
    currentRegion,
  );

  if (region === null) {
    return;
  }

  const subregion = prompt(
    "Subregion",
    currentSubregion,
  );

  if (subregion === null) {
    return;
  }

  const result =
    await updateEngineerRegion(
      engineerId,
      region,
      subregion,
    );

  if (!result.success) {
    alert(
      result.error ??
        "Failed to update region",
    );
    return;
  }

  alert(
    "Region updated successfully",
  );

  location.reload();
}
export async function resetPasswordUi(
  userId: string,
) {
  const password =
    prompt(
      "New Password",
    );

  if (!password) {
    return;
  }

  const result =
    await resetPassword(
      userId,
      password,
    );

  if (result.error) {
    alert(result.error);

    return;
  }

  alert(
    "Password updated",
  );
}
(window as any).resetPasswordUi =
  resetPasswordUi;
(window as any).createEngineerUi =
  createEngineerUi;

(window as any).editEngineerUi =
  editEngineerUi;

(window as any).deleteEngineerUi =
  deleteEngineerUi;
  (window as any).editRegionUi =
  editRegionUi;
(window as any).resetDeviceUi =
  resetDeviceUi;
  document
  .getElementById(
    "create-engineer-form",
  )
  ?.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      await createEngineerUi();
    },
  );
  document
  .getElementById("search")
  ?.addEventListener(
    "input",
    (event) => {
      const value = (
        event.target as HTMLInputElement
      ).value.toLowerCase();

      document
        .querySelectorAll("tbody tr")
        .forEach((row) => {
          const text =
            row.textContent?.toLowerCase() ??
            "";

          (
            row as HTMLElement
          ).style.display =
            text.includes(value)
              ? ""
              : "none";
        });
    },
  );
  document
  .getElementById(
    "copy-engineer-creds",
  )
  ?.addEventListener(
    "click",
    async () => {
      const email =
        document.getElementById(
          "engineer-email",
        )?.textContent ?? "";

      const password =
        document.getElementById(
          "engineer-password",
        )?.textContent ?? "";

      const code =
        document.getElementById(
          "engineer-code",
        )?.textContent ?? "";

      await navigator.clipboard.writeText(
`Engineer Code: ${code}
Email: ${email}
Password: ${password}`
      );

      alert(
        "Copied to clipboard",
      );
    },
  );
  
  function renderEngineersTable(engineers: any[]) {
    const tbody = document.querySelector("#engineers-table tbody");
    if (!tbody) return;

    if (engineers.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; color: #94a3b8; padding: 32px;">
            No engineers found. Create one above to get started.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = engineers.map(engineer => {
      const lastPhotoDate = engineer.last_photo_at
        ? new Date(engineer.last_photo_at).toLocaleDateString()
        : "Never";
        
      const gpsRiskClass = engineer.gps_risk === "high" ? "danger" : "success";
      const gpsRiskText = engineer.gps_risk === "high" ? "High" : "Normal";
      const deviceIdText = engineer.device_id ? engineer.device_id.slice(0, 8) : "Not Registered";

      return `
        <tr>
          <td>${engineer.full_name || ""}</td>
          <td>${engineer.email || ""}</td>
          <td>${engineer.engineer_code || ""}</td>
          <td>${engineer.status || ""}</td>
          <td title="${engineer.device_id || ""}">
            ${deviceIdText}
          </td>
          <td>
            ${lastPhotoDate}
          </td>
          <td>
            <span class="${gpsRiskClass}">
              ${gpsRiskText}
            </span>
          </td>
          <td title="Auto-detected from latest photo">
            ${engineer.region || "-"}
          </td>
          <td title="Auto-detected from latest photo">
            ${engineer.subregion || "-"}
          </td>
          <td class="actions">
            <a class="btn btn-view" href="/engineers/${engineer.id}">
              View
            </a>
            <button
              class="btn btn-edit"
              onclick="editEngineerUi('${engineer.id}', '${engineer.full_name.replace(/'/g, "\\'")}', '${engineer.email.replace(/'/g, "\\'")}', '${(engineer.phone || "").replace(/'/g, "\\'")}')"
            >
              Edit
            </button>
            <button
              class="btn btn-delete"
              onclick="deleteEngineerUi('${engineer.id}')"
            >
              Delete
            </button>
            <button class="btn btn-password" onclick="resetPasswordUi('${engineer.id}')">
              Reset Password
            </button>
            <button
              class="btn btn-reset"
              onclick="resetDeviceUi('${engineer.id}')"
            >
              Reset Device
            </button>
          </td>
        </tr>
      `;
    }).join("");
  }

  async function initEngineersList() {
    const adminId = document.cookie
      .split("; ")
      .find(row => row.startsWith("admin_id="))
      ?.split("=")[1] || "";

    // 1. Try loading from cache
    const cached = localStorage.getItem("fieldcam_engineers");
    if (cached) {
      try {
        const engineers = JSON.parse(cached);
        renderEngineersTable(engineers);
      } catch (e) {
        console.error("Failed to parse cached engineers", e);
      }
    }

    // 2. Fetch fresh from server
    try {
      const data = await getEngineers("", "", adminId);
      const engineers = data.engineers ?? [];
      localStorage.setItem("fieldcam_engineers", JSON.stringify(engineers));
      renderEngineersTable(engineers);
    } catch (err) {
      console.error("Failed to fetch fresh engineers", err);
    }
  }

  // Start initialization
  if (document.getElementById("engineers-table")) {
    initEngineersList();
  }

  makeTableSortable("engineers-table");
  makeTableSortable("photos-table");