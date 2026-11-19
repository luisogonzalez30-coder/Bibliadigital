import { getBrowserSupabaseClient } from "@/services/supabaseClient";

export interface AdminUser {
  email: string | null;
  created_at: string;
  current_streak: number | null;
  longest_streak: number | null;
  last_read_date: string | null;
  tradition: string | null;
}

export interface AdminOverview {
  generated_at: string;
  days: number;
  totals: {
    devices: number;
    installs: number;
    standalone_devices: number;
    registered: number;
    dau_today: number;
    wau: number;
    mau: number;
  };
  dau: { day: string; devices: number }[];
  installs_by_day: { day: string; installs: number }[];
  retention: { day: number; base: number; returned: number }[];
  top_paths: { path: string; views: number }[];
  users: AdminUser[];
}

export type AdminResult =
  | { status: "ok"; data: AdminOverview }
  | { status: "forbidden" }
  | { status: "unavailable" };

/** Llama a la función protegida `admin_overview`; sólo responde a correos de la tabla `admins`. */
export async function fetchAdminOverview(days = 30): Promise<AdminResult> {
  const client = getBrowserSupabaseClient();
  if (!client) return { status: "unavailable" };
  try {
    const { data, error } = await client.rpc("admin_overview", { p_days: days });
    if (error) {
      return error.code === "42501" || /forbidden/i.test(error.message) ? { status: "forbidden" } : { status: "unavailable" };
    }
    return { status: "ok", data: data as AdminOverview };
  } catch {
    return { status: "unavailable" };
  }
}
