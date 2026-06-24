import {
  createEngineer,
  updateEngineer,
  deleteEngineer,
  resetDevice,
  resetPassword,
  updateEngineerRegion,
} from "../lib/api";

export async function createEngineerUi() {
  const fullName =
    (
      document.getElementById(
        "full_name"
      ) as HTMLInputElement
    ).value;

  const email =
    (
      document.getElementById(
        "email"
      ) as HTMLInputElement
    ).value;
 const phone =
    (
      document.getElementById(
        "phone"
      ) as HTMLInputElement
    ).value;
  const result =
    await createEngineer(
      fullName,
      email,
      phone
    );

  if (result.error) {
    alert(result.error);
    return;
  }

  location.reload();
}

export async function editEngineerUi(
  id: string,
  fullName: string,
  email: string,
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

  const result =
    await updateEngineer(
      id,
      newName,
      newEmail,
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