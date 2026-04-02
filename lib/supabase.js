import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://itirysapxckveupvymgv.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_FfysolcCjCkAW69qCEfEnw_8yTD2QJK";

const globalScope = globalThis;

export const supabase = globalScope.__angkringanSupabase || createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  db: {
    schema: "public",
  },
  realtime: {
    params: {
      eventsPerSecond: 20,
    },
  },
  global: {
    headers: {
      "x-client-info": "angkringan-web",
    },
  },
});

if (process.env.NODE_ENV !== "production") {
  globalScope.__angkringanSupabase = supabase;
}

export const db = {
  async getAll(table) {
    const { data, error } = await supabase.from(table).select("*");
    if (error) throw error;
    return data || [];
  },
  async upsert(table, row) {
    const { error } = await supabase.from(table).upsert(row);
    if (error) throw error;
  },
  async delete(table, id) {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error;
  },
};
