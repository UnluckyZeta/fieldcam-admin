export type Engineer = {
  id: string;
  full_name: string;
  email: string;
  engineer_code: string;

  device_id?: string;
  last_photo_at?: string;
phone:string
  status:
    | "active"
    | "warning"
    | "inactive"
    | "never";

  gps_risk?: "high" | "normal";

  days_inactive?: number;
  region: string | null;
subregion: string | null;
};
export type CreateEngineerResponse = {
  success: boolean;
  error?: string;

  email: string;
  password: string;
  engineer_code: string;
  user_id: string;
  full_name: string;
};
export type EngineersResponse = {
  engineers: Engineer[];
  totalPhotos: number;
};

export type ApiResponse = {
  success?: boolean;
  error?: string;
};
export type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: "super_admin" | "regional_admin";
  region: string | null;
  created_at: string;
};