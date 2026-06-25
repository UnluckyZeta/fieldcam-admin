import { editAdminUi } from "../lib/admin";
import {
  createAdmin,
  deleteAdmin,
} from "../lib/api";
import { resetPasswordUi } from "./engineers";

async function
createAdminUi() {
  const full_name =
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

  const role =
    (
      document.getElementById(
        "role",
      ) as HTMLSelectElement
    ).value;

  const region =
    (
      document.getElementById(
        "region",
      ) as HTMLInputElement
    ).value;

  const result =
    await createAdmin(
      full_name,
      email,
      role,
      region,
    );

if (!result.success) {
  console.log(result);

  alert(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );

  return;
}

const resultCard =
  document.getElementById(
    "create-admin-result",
  );

const emailElement =
  document.getElementById(
    "created-email",
  );

const passwordElement =
  document.getElementById(
    "created-password",
  );

resultCard!.style.display =
  "block";

emailElement!.textContent =
  result.email;

passwordElement!.textContent =
  result.password;

  
}

(
  window as any
).createAdminUi =
  createAdminUi;

document
  .getElementById(
    "create-admin-form",
  )
  ?.addEventListener(
    "submit",
    async (e) => {
      e.preventDefault();

      await createAdminUi();
    },
  );
  (
  window as any
).editAdminUi =
  editAdminUi;

(
  window as any
).resetPasswordUi =
  resetPasswordUi;

  (window as any)
  .deleteAdminUi =
  async (
    adminId: string,
  ) => {
    const confirmed =
      confirm(
        "Delete this admin?",
      );

    if (!confirmed) {
      return;
    }

    const result =
      await deleteAdmin(
        adminId,
      );

    if (result.error) {
      alert(result.error);
      return;
    }

    location.reload();
  };
  document
  .getElementById(
    "copy-admin-creds",
  )
  ?.addEventListener(
    "click",
    async () => {
      const email =
        document.getElementById(
          "created-email",
        )?.textContent ?? "";

      const password =
        document.getElementById(
          "created-password",
        )?.textContent ?? "";

      await navigator.clipboard.writeText(
        `Email: ${email}
Password: ${password}`,
      );

      alert(
        "Credentials copied",
      );
    },
  );