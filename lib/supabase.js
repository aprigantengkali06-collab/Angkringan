import { createClient } from "@supabase/supabase-js";
const url = "https://itirysapxckveupvymgv.supabase.co";
const key = "sb_publishable_FfysolcCjCkAW69qCEfEnw_8yTD2QJK";
export const supabase = createClient(url, key);

export const db = {
  async getAll(table) {
    const { data } = await supabase.from(table).select("*");
    return data || [];
  },
  async upsert(table, row) {
    await supabase.from(table).upsert(row);
  },
  async delete(table, id) {
    await supabase.from(table).delete().eq("id", id);
  },
};
