import { editAdminUi } from "../lib/admin";
import {
  createAdmin,
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

  alert(`
Admin Created

Email:
${result.email}

Password:
${result.password}
`);

  location.reload();
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