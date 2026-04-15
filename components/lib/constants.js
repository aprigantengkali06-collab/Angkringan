// lib/constants.js

export const DEFAULT_OWNER_PASSWORD = "owner123";
export const APP_RESET_VERSION = "2026-03-clean-start-1";
export const BRAND_LOGO = "/logo-user.png";
export const RESETTABLE_STORAGE_KEYS = ["menus","orders","expenses","sessionOpen","sessionDate","currentSessionId"];

if(typeof window !== "undefined"){
  try{
    if(localStorage.getItem("__appResetVersion") !== APP_RESET_VERSION){
      RESETTABLE_STORAGE_KEYS.forEach(key=>localStorage.removeItem(key));
      localStorage.setItem("__appResetVersion", APP_RESET_VERSION);
    }
  }catch{}
}

export const DEFAULT_FILTER_CATS = ["Semua","Kopi","Makanan"];
export const DEFAULT_MENU_CATS = ["Kopi","Makanan"];
export const PRINTER_STATUS_POLL_MS = 5000;
// PERUBAHAN PERFORMA: 30000 → 120000 (2 menit) untuk kurangi polling fallback
export const FALLBACK_REFRESH_MS = 120000;
export const REMOTE_REFRESH_DELAY_MS = 80;
export const SETTINGS_SYNC_DELAY_MS = 400;
export const ORDER_SYNC_DELAY_MS = 120;

export const KASIR_COLORS = ["var(--amber)","var(--blue)","var(--purple)","var(--green)"];
export const KASIR_COLORS_DIM = ["var(--amber-dim)","var(--blue-dim)","var(--purple-dim)","var(--green-dim)"];
export const MITRA_COLORS = ["var(--purple)","var(--green)","var(--blue)","var(--red)"];
export const MITRA_COLORS_DIM = ["var(--purple-dim)","var(--green-dim)","var(--blue-dim)","var(--red-dim)"];

export const MENUS0 = [];
export const ORDERS0 = [];
export const EXPS0 = [];
