import type {
  ApiResponse,
  EngineersResponse,
} from "./types";

const BASE_URL =
  import.meta.env
    .PUBLIC_SUPABASE_FUNCTION_URL;

const TOKEN =
  import.meta.env
    .PUBLIC_SUPABASE_FUNCTION_TOKEN;

const ADMIN_PASSWORD =
  import.meta.env
    .PUBLIC_ADMIN_PASSWORD ??
  import.meta.env
    .ADMIN_PASSWORD;
console.log(
  import.meta.env
    .PUBLIC_SUPABASE_FUNCTION_URL,
);
function getHeaders() {
  console.log({
    ADMIN_PASSWORD,
  });
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
    "x-admin-password":
      ADMIN_PASSWORD,
  };
}

export async function getEngineers(
  from = "",
  to = "",
): Promise<EngineersResponse> {
  const response = await fetch(
    `${BASE_URL}/list-eng`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        from,
        to,
      }),
    },
  );

  return response.json();
}
export async function getEngineer(
  engineer_id: string,
  from = "",
  to = "",
) {
  const response = await fetch(
    `${BASE_URL}/engineer-details`,
    {
      method: "POST",
      headers: getHeaders(),
     body: JSON.stringify({
  engineer_id,
  from,
  to,
}),
    },
  );

  return response.json();
}
export async function verifyPhoto(
  photo_tag: string,
  signature?: string,
) {
  const response = await fetch(
    `${BASE_URL}/verify-photo`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        photo_tag,
        signature,
      }),
    },
  );

  return response.json();
}
export async function getDashboard(  from = "",
  to = "",) {
  
  const response = await fetch(
    `${BASE_URL}/dashboard`,
    {
      method: "POST",
      headers: getHeaders(),
body: JSON.stringify({
        from,
        to,
      }),    },
  );

  return response.json();
}
export async function exportLogs(
  from = "",
  to = "",
) {
  const response = await fetch(
    `${BASE_URL}/export-logs`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        from,
        to,
      }),
    },
  );

  return response.json();
}
export async function updateEngineerRegion(
  engineerId: string,
  region: string,
  subregion: string,
): Promise<ApiResponse> {
  const response = await fetch(
    `${BASE_URL}/update-engineer-region`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        engineer_id: engineerId,
        region,
        subregion,
      }),
    },
  );

  return response.json();
}

export async function createEngineer(
  full_name: string,
  email: string,
): Promise<ApiResponse> {
  const response = await fetch(
    `${BASE_URL}/createe-engineer`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        full_name,
        email,
      }),
    },
  );

  return response.json();
}

export async function updateEngineer(
  id: string,
  full_name: string,
  email: string,
): Promise<ApiResponse> {
  const response = await fetch(
    `${BASE_URL}/update-engineer`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        id,
        full_name,
        email,
      }),
    },
  );

  return response.json();
}

export async function deleteEngineer(
  engineer_id: string,
): Promise<ApiResponse> {
  const response = await fetch(
    `${BASE_URL}/delete-engineer`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        engineer_id,
      }),
    },
  );

  return response.json();
}

export async function resetPassword(
  user_id: string,
  password: string,
): Promise<ApiResponse> {
  const response = await fetch(
    `${BASE_URL}/reset-password`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        user_id,
        password,
      }),
    },
  );

  return response.json();
}

export async function resetDevice(
  engineer_id: string,
): Promise<ApiResponse> {
  const response = await fetch(
    `${BASE_URL}/resetDevice`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        engineer_id,
      }),
    },
  );

  return response.json();
}
console.log("BASE_URL =", BASE_URL);