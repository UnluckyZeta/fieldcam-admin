export type Engineer = {
  id: string;
  full_name: string;
  email: string;
  engineer_code: string;

  device_id?: string;
  last_photo_at?: string;

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

export type EngineersResponse = {
  engineers: Engineer[];
  totalPhotos: number;
};

export type ApiResponse = {
  success?: boolean;
  error?: string;
};