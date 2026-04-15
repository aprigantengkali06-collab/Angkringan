"use client";
import { supabase } from "../lib/supabase";
import { useState, useMemo, useEffect, useRef, useCallback, memo } from "react";

import {
  normalizeOrder, serializeOrderForSync, toDbOrder,
  mapKasirRow, mapMitraRow, mapMenuRow, mapExpenseRow, mapOrderRow,
  upsertById, removeById, serializeSimpleRow,
  fmt, getNow, orderSessionDate, genId, localISO, rupiah
} from "./lib/helpers.js";
import {
  DEFAULT_OWNER_PASSWORD,
  PRINTER_STATUS_POLL_MS, FALLBACK_REFRESH_MS,
  REMOTE_REFRESH_DELAY_MS, SETTINGS_SYNC_DELAY_MS, ORDER_SYNC_DELAY_MS,
} from "./lib/constants.js";
import {
  normalizeReceiptSettings, DEFAULT_RECEIPT_SETTINGS,
  defaultPrinterStatus, isNativePrinterShell, getNativePrinterBridge,
  getNativePrinterStatus, getPrinterBadgeMeta
} from "./lib/printer.js";
import { printStruk } from "./lib/receipt.js";

import FontStyle from "./styles/FontStyle.jsx";
import PaymentMeta from "./ui/PaymentMeta.jsx";
import ReceiptPrintButton from "./ui/ReceiptPrintButton.jsx";
import Nav, { getNavItems } from "./layout/Nav.jsx";
import Hdr from "./layout/Hdr.jsx";
import MenuDrawer from "./overlays/MenuDrawer.jsx";
import PrinterPickerOverlay from "./overlays/PrinterPickerOverlay.jsx";
import LoginScreen from "./screens/LoginScreen.jsx";
import DashboardScreen from "./screens/DashboardScreen.jsx";
import POSScreen from "./screens/POSScreen.jsx";
import TagihanScreen from "./screens/TagihanScreen.jsx";
import KeuanganScreen from "./screens/KeuanganScreen.jsx";
import { TimScreen, MenuMgmtScreen, DataToolsScreen } from "./screens/KelolaScreen.jsx";

const PrinterStatusBadge = memo(({ status, busy, onClick }) => {
  const meta = getPrinterBadgeMeta(status || defaultPrinterStatus());
  return (
    <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 12, background: meta.bg, border: `1px solid ${meta.dot}22`, color: meta.color, fontWeight: 800, fontSize: 12, flexShrink: 0, maxWidth: 148 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: meta.dot, boxShadow: `0 0 0 4px ${meta.dot}22`, flexShrink: 0 }} />
      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{busy ? "Memeriksa..." : meta.label}</span>
    </button>
  );
});

const ReceiptPreviewModal = memo(({ html, onClose }) => {
  const iframeRef = useRef(null);
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !html) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open(); doc.write(html); doc.close();
  }, [html]);
  const handlePrint = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const win = iframe.contentWindow;
    if (win) { win.focus(); win.print(); }
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 11000, background: "rgba(15,23,42,0.72)", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }} onClick={onClose}>
      <div className="fu" style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: "22px 22px 0 0", display: "flex", flexDirection: "column", maxHeight: "92vh", boxShadow: "0 -8px 48px rgba(15,23,42,0.22)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0", flexShrink: 0 }}><div style={{ width: 44, height: 4, borderRadius: 99, background: "#D1D5DB" }} /></div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 10px", flexShrink: 0, borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(254,243,199,0.9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧾</div>
            <div><p style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>Preview Struk</p><p style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>Tampilan sebelum dicetak ke printer</p></div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--border)", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 0", display: "flex", justifyContent: "center", background: "#F0F5FF", minHeight: 0 }}>
          <div style={{ background: "#fff", boxShadow: "0 2px 16px rgba(15,23,42,0.10)", borderRadius: 4, overflow: "hidden", width: 220, flexShrink: 0 }}>
            <iframe ref={iframeRef} title="Preview Struk" style={{ width: "100%", minHeight: 320, height: "auto", border: "none", display: "block" }} scrolling="no" />
          </div>
        </div>
        <div style={{ padding: "12px 20px calc(env(safe-area-inset-bottom) + 20px)", display: "flex", gap: 10, flexShrink: 0, borderTop: "1px solid var(--border)", background: "#fff" }}>
          <button onClick={handlePrint} style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,var(--amber) 0%,#F97316 100%)", color: "#fff", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 18px rgba(245,158,11,0.28)" }}>
            <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7 M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2 M6 14h12v8H6z" /></svg>
            Cetak Sekarang
          </button>
          <button onClick={onClose} style={{ flex: 1, padding: "13px", borderRadius: 14, border: "1px solid var(--border)", cursor: "pointer", background: "rgba(255,255,255,0.9)", color: "var(--muted)", fontWeight: 600, fontSize: 14 }}>Tutup</button>
        </div>
      </div>
    </div>
  );
});

export default function AngkringanApp() {
  const [user, setUser] = useState(() => { try { const s = localStorage.getItem("user"); return s ? JSON.parse(s) : null; } catch { return null; } });
  const [screen, setScreen] = useState("home");
  const [overlay, setOverlay] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  const [backToast, setBackToast] = useState("");
  const backPressCount = useRef(0);
  const backPressTimer = useRef(null);
  const [menus, setMenus] = useState(() => { try { const s = localStorage.getItem("menus"); return s ? JSON.parse(s) : []; } catch { return []; } });
  const [orders, setOrders] = useState(() => { try { const s = localStorage.getItem("orders"); return s ? JSON.parse(s).map(normalizeOrder) : []; } catch { return []; } });
  const [expenses, setExpenses] = useState(() => { try { const s = localStorage.getItem("expenses"); return s ? JSON.parse(s) : []; } catch { return []; } });
  const [kasirs, setKasirs] = useState(() => { try { const s = localStorage.getItem("kasirs"); return s ? JSON.parse(s) : []; } catch { return []; } });
  const [mitras, setMitras] = useState(() => { try { const s = localStorage.getItem("mitras"); return s ? JSON.parse(s) : []; } catch { return []; } });
  const [target, setTarget] = useState(() => { try { const s = localStorage.getItem("target"); return s ? JSON.parse(s) : 500000; } catch { return 500000; } });
  const [ownerPassword, setOwnerPassword] = useState(() => { try { const s = localStorage.getItem("ownerPassword"); return s ? JSON.parse(s) : DEFAULT_OWNER_PASSWORD; } catch { return DEFAULT_OWNER_PASSWORD; } });
  const [sessionOpen, setSessionOpen] = useState(() => { try { const s = localStorage.getItem("sessionOpen"); return s ? JSON.parse(s) : false; } catch { return false; } });
  const [sessionDate, setSessionDate] = useState(() => { try { const s = localStorage.getItem("sessionDate"); return s ? JSON.parse(s) : null; } catch { return null; } });
  const [currentSessionId, setCurrentSessionId] = useState(() => { try { const s = localStorage.getItem("currentSessionId"); return s ? JSON.parse(s) : null; } catch { return null; } });
  const [receiptSettings, setReceiptSettings] = useState(() => { try { const s = localStorage.getItem("receiptSettings"); return normalizeReceiptSettings(s ? JSON.parse(s) : DEFAULT_RECEIPT_SETTINGS); } catch { return normalizeReceiptSettings(DEFAULT_RECEIPT_SETTINGS); } });
  const [dataBusy, setDataBusy] = useState("");
  const [printerStatus, setPrinterStatus] = useState(() => defaultPrinterStatus());
  const [printerBusy, setPrinterBusy] = useState("");
  const [tutupBlockModal, setTutupBlockModal] = useState(null);
  const [detailOrder, setDetailOrder] = useState(null);
  const [alertModal, setAlertModal] = useState(null);
  const [receiptPreviewModal, setReceiptPreviewModal] = useState(null);
  const showAlert = (msg, type = "info") => setAlertModal({ msg, type });
  const [posStep, setPosStep] = useState("name");
  const [posName, setPosName] = useState("");
  const [posCart, setPosCart] = useState([]);

  useEffect(() => {
    window.__angkringanAlert = showAlert;
    window.__angkringanReceiptPreview = (html) => setReceiptPreviewModal({ html });
    return () => { delete window.__angkringanAlert; delete window.__angkringanReceiptPreview; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [deviceId] = useState(() => {
    try { const saved = localStorage.getItem("deviceId"); if (saved) return saved; const fresh = genId("DEV"); localStorage.setItem("deviceId", fresh); return fresh; } catch { return genId("DEV"); }
  });

  const businessDate = sessionOpen ? (sessionDate || fmt(new Date())) : fmt(new Date());
  const initialized = useRef(false);
  const [syncReady, setSyncReady] = useState(false);
  const orderSnapshot = useRef(new Map());
  const syncTimers = useRef({});
  const syncedRowsRef = useRef({ kasirs: new Map(), mitras: new Map(), menus: new Map(), orders: new Map(), expenses: new Map() });
  const syncedIdsRef = useRef({ kasirs: new Set(), mitras: new Set(), menus: new Set(), orders: new Set(), expenses: new Set() });
  const syncedSettingsSignature = useRef("");
  const latestUiState = useRef({ screen: "home", overlay: null, navOpen: false });

  const unresolvedOpenOrders = useMemo(() => orders.filter(o => o.status === "open" && Number(o.total) > 0), [orders]);
  const unresolvedSessionDates = useMemo(() => [...new Set(unresolvedOpenOrders.map(orderSessionDate).filter(Boolean))].sort(), [unresolvedOpenOrders]);

  useEffect(() => { setNavOpen(false); }, [screen, overlay]);

  const replaceCollectionIfChanged = useCallback((key, rows, setState, serialize = serializeSimpleRow) => {
    const nextMap = new Map(rows.map(row => [String(row.id), serialize(row)]));
    const prevMap = syncedRowsRef.current[key] || new Map();
    const isSame = nextMap.size === prevMap.size && [...nextMap.entries()].every(([id, sig]) => prevMap.get(id) === sig);
    syncedRowsRef.current[key] = nextMap;
    syncedIdsRef.current[key] = new Set(nextMap.keys());
    if (!isSame) setState(rows);
    return nextMap;
  }, []);

  const loadFromSupabaseInFlight = useRef(null);
  const loadFromSupabase = useCallback(async ({ force = false } = {}) => {
    if (loadFromSupabaseInFlight.current && !force) return loadFromSupabaseInFlight.current;
    const requestPromise = (async () => {
      try {
        const [kasirRes, mitraRes, menuRes, orderRes, expenseRes, settingsRes] = await Promise.all([
          supabase.from("kasirs").select("id,name,password").order("name", { ascending: true }),
          supabase.from("mitras").select("id,name,pemilik").order("name", { ascending: true }),
          supabase.from("menus").select("id,name,price,category,available,mitra_id,harga_mitra,suhu").order("name", { ascending: true }),
          supabase.from("orders").select("id,customer_name,status,created_at,session_date,session_id,paid_at,items,total,kasir_id,updated_at,last_device_id").order("updated_at", { ascending: false }).limit(300),
          supabase.from("expenses").select("id,description,amount,date").order("date", { ascending: false }),
          supabase.from("settings").select("key,value"),
        ]);
        if (kasirRes.error) throw kasirRes.error;
        if (mitraRes.error) throw mitraRes.error;
        if (menuRes.error) throw menuRes.error;
        if (orderRes.error) throw orderRes.error;
        if (expenseRes.error) throw expenseRes.error;
        if (settingsRes.error) throw settingsRes.error;
        if (kasirRes.data) replaceCollectionIfChanged("kasirs", kasirRes.data.map(mapKasirRow), setKasirs);
        if (mitraRes.data) replaceCollectionIfChanged("mitras", mitraRes.data.map(mapMitraRow), setMitras);
        if (menuRes.data) replaceCollectionIfChanged("menus", menuRes.data.map(mapMenuRow), setMenus);
        if (orderRes.data) {
          const nextOrders = orderRes.data.map(mapOrderRow);
          const nextMap = replaceCollectionIfChanged("orders", nextOrders, setOrders, serializeOrderForSync);
          orderSnapshot.current = new Map(nextMap);
        }
        if (expenseRes.data) replaceCollectionIfChanged("expenses", expenseRes.data.map(mapExpenseRow), setExpenses);
        if (settingsRes.data) {
          const t = settingsRes.data.find(r => r.key === "target");
          const so = settingsRes.data.find(r => r.key === "session_open");
          const sd = settingsRes.data.find(r => r.key === "session_date");
          const cs = settingsRes.data.find(r => r.key === "current_session_id");
          const op = settingsRes.data.find(r => r.key === "owner_password");
          const rH = settingsRes.data.find(r => r.key === "receipt_header")?.value;
          const rFP = settingsRes.data.find(r => r.key === "receipt_footer_paid")?.value;
          const rFO = settingsRes.data.find(r => r.key === "receipt_footer_open")?.value;
          const nextRS = normalizeReceiptSettings({ header: rH, footerPaid: rFP, footerOpen: rFO });
          const nextSig = JSON.stringify({ target: Number(t?.value ?? 500000), sessionOpen: so?.value === "true", sessionDate: sd?.value || null, currentSessionId: cs?.value || null, ownerPassword: op?.value || DEFAULT_OWNER_PASSWORD, receiptSettings: nextRS });
          if (nextSig !== syncedSettingsSignature.current) {
            syncedSettingsSignature.current = nextSig;
            if (t) setTarget(prev => { const n = Number(t.value); return n === prev ? prev : n; });
            if (so) { const n = so.value === "true"; setSessionOpen(prev => n === prev ? prev : n); }
            if (sd) { const n = sd.value || null; setSessionDate(prev => n === prev ? prev : n); }
            if (cs) { const n = cs.value || null; setCurrentSessionId(prev => n === prev ? prev : n); }
            if (op?.value) setOwnerPassword(prev => op.value === prev ? prev : op.value);
            setReceiptSettings(prev => JSON.stringify(prev) === JSON.stringify(nextRS) ? prev : nextRS);
          }
        }
      } catch (err) {
        console.error("loadFromSupabase error", err);
      } finally {
        if (loadFromSupabaseInFlight.current === requestPromise) loadFromSupabaseInFlight.current = null;
      }
    })();
    loadFromSupabaseInFlight.current = requestPromise;
    return requestPromise;
  }, [replaceCollectionIfChanged]);

  const clearResettableCache = () => {
    try {
      orderSnapshot.current = new Map();
      localStorage.setItem("menus", JSON.stringify([]));
      localStorage.setItem("orders", JSON.stringify([]));
      localStorage.setItem("expenses", JSON.stringify([]));
      localStorage.setItem("sessionOpen", JSON.stringify(false));
      localStorage.setItem("sessionDate", JSON.stringify(null));
      localStorage.setItem("currentSessionId", JSON.stringify(null));
    } catch {}
  };

  const fetchIds = useCallback(async table => {
    const { data, error } = await supabase.from(table).select("id");
    if (error) throw error;
    return (data || []).map(r => r.id).filter(Boolean);
  }, []);

  const deleteRowsByIds = useCallback(async (table, ids) => {
    const S = 100;
    for (let i = 0; i < ids.length; i += S) {
      const { error } = await supabase.from(table).delete().in("id", ids.slice(i, i + S));
      if (error) throw error;
    }
  }, []);

  const clearTable = useCallback(async table => {
    const ids = await fetchIds(table);
    if (ids.length) await deleteRowsByIds(table, ids);
  }, [fetchIds, deleteRowsByIds]);

  const upsertMany = useCallback(async (table, rows) => {
    const S = 100;
    for (let i = 0; i < rows.length; i += S) {
      const { error } = await supabase.from(table).upsert(rows.slice(i, i + S));
      if (error) throw error;
    }
  }, []);

  const scheduleSyncTask = useCallback((key, task, delay = 250) => {
    if (syncTimers.current[key]) clearTimeout(syncTimers.current[key]);
    syncTimers.current[key] = setTimeout(async () => {
      try { await task(); } catch (err) { console.error(`${key} sync error`, err); } finally { delete syncTimers.current[key]; }
    }, delay);
  }, []);

  const syncCollectionState = useCallback(async ({ key, table, rows, serialize, mapForUpsert = (r => r) }) => {
    const prevMap = syncedRowsRef.current[key] || new Map();
    const prevIds = syncedIdsRef.current[key] || new Set();
    const nextMap = new Map(), nextIds = new Set(), changedRows = [];
    rows.forEach(row => {
      const id = String(row.id), sig = serialize(row);
      nextMap.set(id, sig); nextIds.add(id);
      if (prevMap.get(id) !== sig) changedRows.push(row);
    });
    const deletedIds = [...prevIds].filter(id => !nextIds.has(id));
    if (changedRows.length) await upsertMany(table, changedRows.map(mapForUpsert));
    if (deletedIds.length) await deleteRowsByIds(table, deletedIds);
    syncedRowsRef.current[key] = nextMap;
    syncedIdsRef.current[key] = nextIds;
  }, [deleteRowsByIds, upsertMany]);

  const getNativeFileBridge = () => {
    try { const b = window?.AngkringanFileBridge; if (b && typeof b.saveJsonBackup === "function") return b; } catch {}
    return null;
  };

  const triggerJsonDownload = async (fileName, payload) => {
    const jsonText = JSON.stringify(payload, null, 2);
    const nb = getNativeFileBridge();
    if (nb) {
      try {
        const raw = nb.saveJsonBackup(fileName, jsonText);
        const p = raw ? JSON.parse(raw) : null;
        if (p?.ok) return { ok: true, native: true, fileName: p.fileName || fileName, savedAt: p.savedAt || "Downloads" };
      } catch (e) { console.error("native backup save error", e); }
    }
    try {
      const blob = new Blob([jsonText], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1200);
      return { ok: true, native: false, fileName, savedAt: "Download browser" };
    } catch (err) { console.error("browser backup save error", err); return { ok: false }; }
  };

  const handleBackupDownload = async () => {
    if (dataBusy) return;
    setDataBusy("Sedang menyiapkan backup...");
    try {
      const { data: sessionRows, error: sErr } = await supabase.from("sessions").select("*");
      if (sErr) throw sErr;
      const payload = { app: "angkringan-pos", backupVersion: 4, exportedAt: new Date().toISOString(), counts: { kasirs: kasirs.length, mitras: mitras.length, menus: menus.length, orders: orders.length, expenses: expenses.length, sessions: (sessionRows || []).length }, data: { kasirs, mitras, menus, orders: orders.map(normalizeOrder), expenses, sessions: sessionRows || [], settings: { target, ownerPassword, sessionOpen, sessionDate, currentSessionId, receiptSettings } } };
      const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
      const result = await triggerJsonDownload(`backup-angkringan-${stamp}.json`, payload);
      if (!result?.ok) throw new Error("download-failed");
      showAlert(result.native ? `Backup berhasil disimpan ke ${result.savedAt} dengan nama ${result.fileName}.` : `Backup berhasil diunduh. Cek folder Download browser Anda dengan nama ${result.fileName}.`, "success");
    } catch (err) { console.error("backup error", err); showAlert("Backup gagal dibuat. Coba lagi.", "error"); }
    finally { setDataBusy(""); }
  };

  const handleResetRingan = async () => {
    if (dataBusy) return;
    if (!window.confirm("Reset ringan akan menghapus semua menu, transaksi, pengeluaran, dan sesi. Lanjutkan?")) return;
    if (!window.confirm("Yakin? Data transaksi yang dihapus tidak bisa dikembalikan kecuali Anda punya file backup.")) return;
    setDataBusy("Sedang mengosongkan data...");
    try {
      await clearTable("orders"); await clearTable("expenses"); await clearTable("menus"); await clearTable("sessions");
      await supabase.from("settings").upsert({ key: "session_open", value: "false" });
      await supabase.from("settings").upsert({ key: "session_date", value: "" });
      await supabase.from("settings").upsert({ key: "current_session_id", value: "" });
      orderSnapshot.current = new Map();
      setMenus([]); setOrders([]); setExpenses([]); setSessionOpen(false); setSessionDate(null); setCurrentSessionId(null);
      clearResettableCache();
      await loadFromSupabase();
      setOverlay(null);
      showAlert("Reset ringan berhasil. App sekarang kembali kosong untuk transaksi dan menu.", "success");
    } catch (err) { console.error("reset error", err); showAlert("Reset gagal. Coba lagi atau cek koneksi internet.", "error"); }
    finally { setDataBusy(""); }
  };

  const handleRestoreBackup = async file => {
    if (dataBusy) return; if (!file) return;
    if (!window.confirm("Pulihkan backup akan menimpa data saat ini. Lanjutkan restore?")) return;
    setDataBusy("Sedang memulihkan backup...");
    try {
      const rawText = await file.text();
      const parsed = JSON.parse(rawText);
      const payload = parsed?.data || parsed || {};
      const nextKasirs = Array.isArray(payload.kasirs) ? payload.kasirs.map(k => ({ id: k.id || genId("KSR"), name: String(k.name || "Kasir").trim(), password: String(k.password || "1234") })) : [];
      const nextMitras = Array.isArray(payload.mitras) ? payload.mitras.map(m => ({ id: m.id || genId("MIT"), name: String(m.name || "Mitra").trim(), pemilik: String(m.pemilik || "").trim() })) : [];
      const nextMenus = Array.isArray(payload.menus) ? payload.menus.map(m => ({ id: m.id || genId("MNU"), name: String(m.name || "Menu").trim(), price: Number(m.price || 0), category: String(m.category || "Menu").trim(), available: m.available !== false, mitraId: m.mitraId || null, hargaMitra: m.hargaMitra == null || m.hargaMitra === "" ? null : Number(m.hargaMitra), suhu: m.suhu || null })) : [];
      const nextOrders = Array.isArray(payload.orders) ? payload.orders.map(normalizeOrder) : [];
      const nextExpenses = Array.isArray(payload.expenses) ? payload.expenses.map(e => ({ id: e.id || genId("EXP"), description: String(e.description || "Pengeluaran").trim(), amount: Number(e.amount || 0), date: e.date || fmt(getNow()) })) : [];
      const nextSessions = Array.isArray(payload.sessions) ? payload.sessions.map(s => ({ id: s.id || genId("SES"), business_date: s.business_date || s.businessDate || fmt(getNow()), opened_at: s.opened_at || s.openedAt || new Date().toISOString(), opened_by: s.opened_by ?? s.openedBy ?? null, closed_at: s.closed_at ?? s.closedAt ?? null, closed_by: s.closed_by ?? s.closedBy ?? null, status: s.status === "closed" ? "closed" : "open" })) : [];
      const nextTarget = Number(payload?.settings?.target ?? target ?? 500000);
      const nextOwnerPassword = String(payload?.settings?.ownerPassword || ownerPassword || DEFAULT_OWNER_PASSWORD);
      const nextSessionOpen = payload?.settings?.sessionOpen === true || payload?.settings?.sessionOpen === "true";
      const nextSessionDate = payload?.settings?.sessionDate || null;
      const nextCurrentSessionId = payload?.settings?.currentSessionId || null;
      const nextRS = normalizeReceiptSettings(payload?.settings?.receiptSettings || payload?.settings?.receipt || receiptSettings);
      const restoredSessionOpen = nextSessionOpen && !!nextSessionDate;
      const restoredSessionId = restoredSessionOpen ? (nextCurrentSessionId || nextSessions.find(s => s.status === "open")?.id || null) : null;
      await clearTable("orders"); await clearTable("expenses"); await clearTable("menus"); await clearTable("sessions"); await clearTable("kasirs"); await clearTable("mitras");
      await upsertMany("kasirs", nextKasirs.map(k => ({ id: k.id, name: k.name, password: k.password })));
      await upsertMany("mitras", nextMitras.map(m => ({ id: m.id, name: m.name, pemilik: m.pemilik })));
      await upsertMany("menus", nextMenus.map(m => ({ id: m.id, name: m.name, price: m.price, category: m.category, available: m.available, mitra_id: m.mitraId || null, harga_mitra: m.hargaMitra || null, suhu: m.suhu || null })));
      await upsertMany("sessions", nextSessions.map(s => ({ id: s.id, business_date: s.business_date, opened_at: s.opened_at, opened_by: s.opened_by, closed_at: s.closed_at, closed_by: s.closed_by, status: s.status })));
      await upsertMany("orders", nextOrders.map(order => toDbOrder({ ...order, sessionId: order.sessionId || restoredSessionId || null }, deviceId)));
      await upsertMany("expenses", nextExpenses.map(e => ({ id: e.id, description: e.description, amount: e.amount, date: e.date })));
      await supabase.from("settings").upsert({ key: "target", value: nextTarget });
      await supabase.from("settings").upsert({ key: "owner_password", value: nextOwnerPassword });
      await supabase.from("settings").upsert({ key: "session_open", value: String(restoredSessionOpen) });
      await supabase.from("settings").upsert({ key: "session_date", value: restoredSessionOpen ? nextSessionDate : "" });
      await supabase.from("settings").upsert({ key: "current_session_id", value: restoredSessionId || "" });
      await supabase.from("settings").upsert({ key: "receipt_header", value: nextRS.header });
      await supabase.from("settings").upsert({ key: "receipt_footer_paid", value: nextRS.footerPaid });
      await supabase.from("settings").upsert({ key: "receipt_footer_open", value: nextRS.footerOpen });
      orderSnapshot.current = new Map(nextOrders.map(o => [o.id, serializeOrderForSync(o)]));
      setKasirs(nextKasirs); setMitras(nextMitras); setMenus(nextMenus); setOrders(nextOrders); setExpenses(nextExpenses);
      setTarget(nextTarget); setOwnerPassword(nextOwnerPassword); setSessionOpen(restoredSessionOpen);
      setSessionDate(restoredSessionOpen ? nextSessionDate : null); setCurrentSessionId(restoredSessionId); setReceiptSettings(nextRS);
      await loadFromSupabase(); setOverlay(null);
      showAlert("Backup berhasil dipulihkan. Silakan cek menu, tim, dashboard, dan laporan Anda.", "success");
    } catch (err) { console.error("restore error", err); showAlert("File backup gagal dipulihkan. Pastikan file JSON berasal dari backup aplikasi ini.", "error"); }
    finally { setDataBusy(""); }
  };

  const normalizePrinterStatusState = raw => ({ ...defaultPrinterStatus(), ...(raw || {}), nativeShell: isNativePrinterShell(), checkedAt: Date.now() });

  const refreshPrinterStatus = async ({ showBusy = false, busyLabel = "Memeriksa status printer...", silent = false } = {}) => {
    if (showBusy) setPrinterBusy(busyLabel);
    try {
      const result = await getNativePrinterStatus();
      const normalized = normalizePrinterStatusState(result);
      setPrinterStatus(normalized);
      return normalized;
    } catch (err) {
      const failed = normalizePrinterStatusState({ ok: false, message: err?.message || "Status printer tidak tersedia" });
      setPrinterStatus(failed);
      if (!silent) console.warn("printer status error", err);
      return failed;
    } finally {
      if (showBusy) setPrinterBusy("");
    }
  };

  const handlePrinterRefresh = async () => {
    if (printerBusy) return;
    const status = await refreshPrinterStatus({ showBusy: true, busyLabel: "Memeriksa status printer..." });
    if (!status?.nativeShell) { showAlert("Status printer Bluetooth hanya tersedia saat aplikasi dijalankan dari APK Android.", "info"); return; }
    showAlert(status?.message || "Status printer berhasil diperbarui.", status?.connected ? "success" : "warning");
  };

  const handlePrinterSelect = async () => {
    if (printerBusy) return;
    if (!isNativePrinterShell()) { showAlert("Fitur pilih printer hanya tersedia di APK Android.", "info"); return; }
    const bridge = getNativePrinterBridge();
    if (!bridge?.selectPrinter) { showAlert("Bridge printer belum tersedia. Pastikan APK memakai versi native terbaru.", "error"); return; }
    setPrinterBusy("Membuka daftar printer...");
    try {
      const result = await bridge.selectPrinter();
      if (result?.ok) showAlert(`Printer aktif: ${result?.printerName || "Bluetooth Printer"}`, "success");
      else showAlert(result?.message || "Printer belum berhasil dipilih.", "warning");
    } catch (err) { console.error("select printer error", err); showAlert(err?.message || "Gagal membuka daftar printer Bluetooth.", "error"); }
    finally { setPrinterBusy(""); await refreshPrinterStatus({ showBusy: false, silent: true }); }
  };

  const handlePrinterClear = async () => {
    if (printerBusy) return;
    if (!isNativePrinterShell()) { showAlert("Fitur printer Bluetooth hanya tersedia di APK Android.", "info"); return; }
    const bridge = getNativePrinterBridge();
    if (!bridge?.clearPrinter) { showAlert("Bridge clear printer belum tersedia di APK ini.", "error"); return; }
    setPrinterBusy("Menghapus printer tersimpan...");
    try {
      const result = await bridge.clearPrinter();
      if (result?.ok) {
        setPrinterStatus(normalizePrinterStatusState({ selected: false, paired: false, connected: false, printerName: "", printerAddress: "", message: "Printer tersimpan sudah dihapus. Pilih printer lagi sebelum cetak." }));
        showAlert("Printer tersimpan berhasil dihapus.", "success");
      } else showAlert(result?.message || "Printer tersimpan gagal dihapus.", "warning");
    } catch (err) { console.error("clear printer error", err); showAlert(err?.message || "Gagal menghapus printer tersimpan.", "error"); }
    finally { setPrinterBusy(""); await refreshPrinterStatus({ showBusy: false, silent: true }); }
  };

  const handleBuka = async () => {
    if (unresolvedSessionDates.length > 1) { showAlert("Masih ada tagihan terbuka di lebih dari satu sesi. Rapikan order legacy dulu agar sesi tidak bercampur.", "warning"); setScreen("tagihan"); return; }
    const resumeDate = unresolvedSessionDates[0] || fmt(new Date());
    const resumeSessionId = unresolvedOpenOrders.find(o => orderSessionDate(o) === resumeDate && o.sessionId)?.sessionId || currentSessionId || genId("SES");
    setSessionOpen(true); setSessionDate(resumeDate); setCurrentSessionId(resumeSessionId);
    supabase.from("sessions").upsert({ id: resumeSessionId, business_date: resumeDate, opened_at: new Date().toISOString(), opened_by: user?.id || null, status: "open" }).then();
  };

  const handleTutup = () => {
    const openNow = unresolvedOpenOrders.filter(o => orderSessionDate(o) === businessDate);
    if (openNow.length > 0) { setTutupBlockModal({ count: openNow.length }); return; }
    if (currentSessionId) supabase.from("sessions").update({ closed_at: new Date().toISOString(), closed_by: user?.id || null, status: "closed" }).eq("id", currentSessionId).then();
    setSessionOpen(false); setSessionDate(null); setCurrentSessionId(null);
  };

  // ── Effects ──
  useEffect(() => { if (user) localStorage.setItem("user", JSON.stringify(user)); else localStorage.removeItem("user"); }, [user]);

  // Printer polling — PERUBAHAN PERFORMA: pause saat background
  useEffect(() => {
    let cancelled = false;
    const syncPrinter = async () => {
      if (!isNativePrinterShell()) { if (!cancelled) setPrinterStatus(defaultPrinterStatus()); return; }
      try { const r = await getNativePrinterStatus(); if (cancelled) return; setPrinterStatus(normalizePrinterStatusState(r)); }
      catch (err) { if (cancelled) return; setPrinterStatus(normalizePrinterStatusState({ ok: false, message: err?.message || "Status printer tidak tersedia" })); }
    };
    syncPrinter();
    const interval = setInterval(() => {
      if (typeof document === "undefined" || document.visibilityState === "visible") syncPrinter();
    }, PRINTER_STATUS_POLL_MS);
    const onFocus = () => syncPrinter();
    const onVis = () => { if (document.visibilityState === "visible") syncPrinter(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => { cancelled = true; clearInterval(interval); window.removeEventListener("focus", onFocus); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(r => { const u = r.active?.scriptURL || r.waiting?.scriptURL || r.installing?.scriptURL || ""; if (u.includes("/sw.js") || u.includes("workbox")) r.unregister().catch(() => {}); });
    }).catch(() => {});
  }, []);

  useEffect(() => { window.angkringanGoHome = () => setScreen("home"); return () => { delete window.angkringanGoHome; }; }, []);
  useEffect(() => { window.angkringanIsAtHome = screen === "home"; latestUiState.current = { screen, overlay, navOpen }; }, [screen, overlay, navOpen]);

  useEffect(() => {
    const handleBack = () => {
      const { screen: cs, overlay: co, navOpen: cn } = latestUiState.current;
      if (co) { setOverlay(null); return; }
      if (cn) { setNavOpen(false); return; }
      if (cs !== "home") { setScreen("home"); backPressCount.current = 0; clearTimeout(backPressTimer.current); return; }
      backPressCount.current += 1;
      clearTimeout(backPressTimer.current);
      if (backPressCount.current >= 2) {
        backPressCount.current = 0; setBackToast("");
        try { if (window.Capacitor?.Plugins?.App) window.Capacitor.Plugins.App.exitApp(); } catch (e) {}
        return;
      }
      setBackToast("Tekan sekali lagi untuk keluar");
      backPressTimer.current = setTimeout(() => { backPressCount.current = 0; setBackToast(""); }, 2000);
    };
    let listenerHandle = null;
    const registerCapacitorBack = async () => {
      try { const { App: CapApp } = await import("@capacitor/app"); listenerHandle = await CapApp.addListener("backButton", handleBack); } catch {}
    };
    if (typeof window !== "undefined" && window.Capacitor) registerCapacitorBack();
    return () => { if (listenerHandle) listenerHandle.remove(); clearTimeout(backPressTimer.current); };
  }, []);

  useEffect(() => {
    if (!syncReady) return;
    const sig = JSON.stringify({ target, sessionOpen, sessionDate, currentSessionId, ownerPassword: ownerPassword || DEFAULT_OWNER_PASSWORD, receiptSettings: normalizeReceiptSettings(receiptSettings) });
    localStorage.setItem("target", JSON.stringify(target));
    localStorage.setItem("sessionOpen", JSON.stringify(sessionOpen));
    localStorage.setItem("sessionDate", JSON.stringify(sessionDate));
    localStorage.setItem("currentSessionId", JSON.stringify(currentSessionId));
    localStorage.setItem("ownerPassword", JSON.stringify(ownerPassword));
    localStorage.setItem("receiptSettings", JSON.stringify(receiptSettings));
    if (syncedSettingsSignature.current === sig) return;
    syncedSettingsSignature.current = sig;
    scheduleSyncTask("settings", async () => {
      await upsertMany("settings", [
        { key: "target", value: String(target) }, { key: "session_open", value: String(sessionOpen) },
        { key: "session_date", value: sessionDate || "" }, { key: "current_session_id", value: currentSessionId || "" },
        { key: "owner_password", value: ownerPassword || DEFAULT_OWNER_PASSWORD },
        { key: "receipt_header", value: receiptSettings.header },
        { key: "receipt_footer_paid", value: receiptSettings.footerPaid },
        { key: "receipt_footer_open", value: receiptSettings.footerOpen },
      ]);
    }, SETTINGS_SYNC_DELAY_MS);
  }, [target, sessionOpen, sessionDate, currentSessionId, ownerPassword, receiptSettings, scheduleSyncTask]);

  useEffect(() => {
    let cancelled = false;
    loadFromSupabase().finally(() => { if (!cancelled) { initialized.current = true; setSyncReady(true); } });
    return () => { cancelled = true; Object.values(syncTimers.current).forEach(t => clearTimeout(t)); };
  }, []);

  useEffect(() => {
    if (!syncReady) return;
    let destroyed = false, activeChannel = null, reconnectTimer = null;
    const schedRemoteRefresh = () => scheduleSyncTask("remote-refresh", async () => { await loadFromSupabase(); }, REMOTE_REFRESH_DELAY_MS);
    const applyRow = ({ key, payload, mapRow, setState, serialize = serializeSimpleRow }) => {
      if (payload.eventType === "DELETE") {
        const id = payload.old?.id, rk = String(id);
        if (id == null || !syncedIdsRef.current[key]?.has(rk)) return;
        syncedRowsRef.current[key]?.delete(rk); syncedIdsRef.current[key]?.delete(rk);
        if (key === "orders") orderSnapshot.current.delete(rk);
        setState(prev => removeById(prev, id)); return;
      }
      if (!payload.new) return;
      const nr = mapRow(payload.new), rk = String(nr.id), sig = serialize(nr);
      if (syncedRowsRef.current[key]?.get(rk) === sig) return;
      syncedRowsRef.current[key]?.set(rk, sig); syncedIdsRef.current[key]?.add(rk);
      if (key === "orders") orderSnapshot.current.set(rk, sig);
      setState(prev => upsertById(prev, nr));
    };
    const doSubscribe = async () => {
      if (destroyed) return;
      if (activeChannel) { try { await supabase.removeChannel(activeChannel); } catch (e) {} activeChannel = null; }
      clearTimeout(reconnectTimer);
      if (destroyed) return;
      const channel = supabase.channel(`angkringan-live-${deviceId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, p => applyRow({ key: "orders", payload: p, mapRow: mapOrderRow, setState: setOrders, serialize: serializeOrderForSync }))
        .on("postgres_changes", { event: "*", schema: "public", table: "expenses" }, p => applyRow({ key: "expenses", payload: p, mapRow: mapExpenseRow, setState: setExpenses }))
        .on("postgres_changes", { event: "*", schema: "public", table: "menus" }, p => applyRow({ key: "menus", payload: p, mapRow: mapMenuRow, setState: setMenus }))
        .on("postgres_changes", { event: "*", schema: "public", table: "kasirs" }, p => applyRow({ key: "kasirs", payload: p, mapRow: mapKasirRow, setState: setKasirs }))
        .on("postgres_changes", { event: "*", schema: "public", table: "mitras" }, p => applyRow({ key: "mitras", payload: p, mapRow: mapMitraRow, setState: setMitras }))
        .on("postgres_changes", { event: "*", schema: "public", table: "settings" }, () => schedRemoteRefresh())
        .subscribe(status => {
          if (status === "SUBSCRIBED") schedRemoteRefresh();
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            schedRemoteRefresh();
            if (!destroyed) { clearTimeout(reconnectTimer); reconnectTimer = setTimeout(doSubscribe, 3000); }
          }
        });
      activeChannel = channel;
    };
    doSubscribe();
    const onVis = () => { if (document.visibilityState === "visible") { loadFromSupabase(); doSubscribe(); } };
    document.addEventListener("visibilitychange", onVis);
    const onOnline = () => { loadFromSupabase(); doSubscribe(); };
    window.addEventListener("online", onOnline);
    return () => { destroyed = true; clearTimeout(reconnectTimer); document.removeEventListener("visibilitychange", onVis); window.removeEventListener("online", onOnline); if (activeChannel) supabase.removeChannel(activeChannel).catch(() => {}); };
  }, [deviceId, scheduleSyncTask, syncReady, loadFromSupabase]);

  // Fallback polling — PERUBAHAN PERFORMA: 120000ms dari constants.js
  useEffect(() => {
    if (!syncReady) return;
    const refresh = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      scheduleSyncTask("fallback-refresh", async () => { await loadFromSupabase(); }, 260);
    };
    const interval = setInterval(refresh, FALLBACK_REFRESH_MS);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(interval); window.removeEventListener("focus", onFocus); };
  }, [scheduleSyncTask, syncReady]);

  useEffect(() => {
    if (sessionOpen && !currentSessionId) {
      const ex = unresolvedOpenOrders.find(o => orderSessionDate(o) === sessionDate)?.sessionId;
      if (ex) setCurrentSessionId(ex);
    }
  }, [sessionOpen, currentSessionId, sessionDate, unresolvedOpenOrders]);

  useEffect(() => {
    if (!syncReady) return;
    const t = setTimeout(() => { try { localStorage.setItem("kasirs", JSON.stringify(kasirs)); } catch {} }, 300);
    scheduleSyncTask("kasirs", () => syncCollectionState({ key: "kasirs", table: "kasirs", rows: kasirs.map(k => ({ id: k.id, name: k.name, password: k.password })), serialize: serializeSimpleRow }), 250);
    return () => clearTimeout(t);
  }, [kasirs, scheduleSyncTask, syncCollectionState]);

  useEffect(() => {
    if (!syncReady) return;
    const t = setTimeout(() => { try { localStorage.setItem("mitras", JSON.stringify(mitras)); } catch {} }, 300);
    scheduleSyncTask("mitras", () => syncCollectionState({ key: "mitras", table: "mitras", rows: mitras.map(m => ({ id: m.id, name: m.name, pemilik: m.pemilik })), serialize: serializeSimpleRow }), 250);
    return () => clearTimeout(t);
  }, [mitras, scheduleSyncTask, syncCollectionState]);

  useEffect(() => {
    if (!syncReady) return;
    const t = setTimeout(() => { try { localStorage.setItem("menus", JSON.stringify(menus)); } catch {} }, 300);
    scheduleSyncTask("menus", () => syncCollectionState({ key: "menus", table: "menus", rows: menus.map(m => ({ id: m.id, name: m.name, price: m.price, category: m.category, available: m.available, mitra_id: m.mitraId || null, harga_mitra: m.hargaMitra || null, suhu: m.suhu || null })), serialize: serializeSimpleRow }), 250);
    return () => clearTimeout(t);
  }, [menus, scheduleSyncTask, syncCollectionState]);

  useEffect(() => {
    if (!syncReady) return;
    const normalizedOrders = orders.map(order => normalizeOrder({ ...order, sessionId: order.sessionId || currentSessionId || null }));
    const t = setTimeout(() => { try { localStorage.setItem("orders", JSON.stringify(normalizedOrders)); } catch {} }, 300);
    scheduleSyncTask("orders", () => syncCollectionState({
      key: "orders", table: "orders",
      rows: normalizedOrders.map(order => ({ ...toDbOrder(order, deviceId), __syncSignature: serializeOrderForSync(order) })),
      serialize: row => row.__syncSignature,
      mapForUpsert: ({ __syncSignature, ...dbRow }) => dbRow,
    }), ORDER_SYNC_DELAY_MS);
    return () => clearTimeout(t);
  }, [orders, currentSessionId, deviceId, scheduleSyncTask, syncCollectionState]);

  useEffect(() => {
    if (!syncReady) return;
    const t = setTimeout(() => { try { localStorage.setItem("expenses", JSON.stringify(expenses)); } catch {} }, 300);
    scheduleSyncTask("expenses", () => syncCollectionState({ key: "expenses", table: "expenses", rows: expenses.map(e => ({ id: e.id, description: e.description, amount: e.amount, date: e.date })), serialize: serializeSimpleRow }), 250);
    return () => clearTimeout(t);
  }, [expenses, scheduleSyncTask, syncCollectionState]);

  // ── Login ──
  if (!user) return (<><FontStyle /><div className="app-shell"><LoginScreen onLogin={u => { setUser(u); setScreen("home"); }} kasirs={kasirs} ownerPassword={ownerPassword} /></div></>);

  const titles = {
    home: { title: "Dashboard", sub: getNow().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" }) },
    pos: { title: "Kasir" },
    tagihan: { title: "Tagihan", sub: "Pesanan belum lunas" },
    keuangan: { title: "Keuangan", sub: "Laporan Keuangan" },
  };
  const navItems = getNavItems(user.role);
  const isHome = screen === "home";
  const headerLeft = (
    <button onClick={() => setNavOpen(true)} style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, borderRadius: 14, background: "rgba(255,255,255,0.94)", border: "1px solid rgba(215,226,240,0.98)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", flexShrink: 0, overflow: "visible", boxShadow: "0 8px 18px rgba(15,23,42,0.06)" }}>
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
    </button>
  );
  const headerRight = (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
      {printerStatus?.nativeShell && <PrinterStatusBadge status={printerStatus} busy={!!printerBusy} onClick={() => setOverlay(user.role === "owner" ? "data" : "printer")} />}
      {isHome ? (
        <button onClick={() => setUser(null)} style={{ color: "var(--muted)", display: "flex", padding: 8, borderRadius: 12, background: "rgba(255,255,255,0.68)", border: "1px solid var(--border)", flexShrink: 0 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9" /></svg>
        </button>
      ) : (
        <button onClick={() => setScreen("home")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 12, background: "rgba(255,255,255,0.68)", border: "1px solid var(--border)", color: "var(--muted)", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
          <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          <span>Kembali</span>
        </button>
      )}
    </div>
  );

  return (<><FontStyle />
    <div className="app-shell">
      <MenuDrawer open={navOpen && !overlay} onClose={() => setNavOpen(false)} items={navItems} screen={screen} onNavigate={setScreen} isOwner={user.role === "owner"} onOpenTim={() => setOverlay("tim")} onOpenMenu={() => setOverlay("menu")} onOpenData={() => setOverlay("data")} onOpenPrinter={() => setOverlay("printer")} onLogout={() => setUser(null)} />

      {overlay === "tim" && <TimScreen kasirs={kasirs} setKasirs={setKasirs} mitras={mitras} setMitras={setMitras} ownerPassword={ownerPassword} setOwnerPassword={setOwnerPassword} onClose={() => setOverlay(null)} />}
      {overlay === "menu" && <MenuMgmtScreen menus={menus} setMenus={setMenus} mitras={mitras} onClose={() => setOverlay(null)} />}
      {overlay === "data" && <DataToolsScreen busy={dataBusy} onClose={() => !dataBusy && setOverlay(null)} onBackup={handleBackupDownload} onRestore={handleRestoreBackup} onReset={handleResetRingan} receiptSettings={receiptSettings} onSaveReceiptSettings={next => { setReceiptSettings(normalizeReceiptSettings(next)); showAlert("Teks struk berhasil disimpan.", "success"); }} printerStatus={printerStatus} printerBusy={printerBusy} onPrinterSelect={handlePrinterSelect} onPrinterRefresh={handlePrinterRefresh} onPrinterClear={handlePrinterClear} />}
      {overlay === "printer" && <PrinterPickerOverlay printerStatus={printerStatus} printerBusy={printerBusy} onSelect={handlePrinterSelect} onRefresh={handlePrinterRefresh} onClear={handlePrinterClear} onClose={() => setOverlay(null)} />}

      {receiptPreviewModal && <ReceiptPreviewModal html={receiptPreviewModal.html} onClose={() => setReceiptPreviewModal(null)} />}

      {/* ── Alert Modal ── */}
      {alertModal && (
        <div onClick={() => setAlertModal(null)} style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}>
          <div className="fu" onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: "24px 24px 0 0", padding: "0 0 calc(env(safe-area-inset-bottom) + 24px)", boxShadow: "0 -8px 48px rgba(15,23,42,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}><div style={{ width: 40, height: 4, borderRadius: 99, background: "#D1D5DB" }} /></div>
            <div style={{ display: "flex", justifyContent: "center", margin: "20px 0 16px" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: alertModal.type === "success" ? "rgba(16,185,129,0.12)" : alertModal.type === "error" ? "rgba(239,68,68,0.12)" : alertModal.type === "warning" ? "rgba(245,158,11,0.12)" : "rgba(37,99,235,0.12)" }}>
                {alertModal.type === "success" && <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>}
                {alertModal.type === "error" && <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
                {alertModal.type === "warning" && <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
                {alertModal.type === "info" && <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>}
              </div>
            </div>
            <div style={{ textAlign: "center", padding: "0 28px 24px" }}>
              <p style={{ fontWeight: 800, fontSize: 17, color: "#0F172A", marginBottom: 8 }}>{alertModal.type === "success" ? "Berhasil ✓" : alertModal.type === "error" ? "Terjadi Kesalahan" : alertModal.type === "warning" ? "Perhatian" : "Info"}</p>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.65 }}>{alertModal.msg}</p>
            </div>
            <div style={{ padding: "0 20px" }}>
              <button onClick={() => setAlertModal(null)} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer", letterSpacing: "0.01em", background: alertModal.type === "success" ? "linear-gradient(135deg,#10B981,#059669)" : alertModal.type === "error" ? "linear-gradient(135deg,#EF4444,#DC2626)" : alertModal.type === "warning" ? "linear-gradient(135deg,#F59E0B,#F97316)" : "linear-gradient(135deg,#2563EB,#4F46E5)", color: "#fff", boxShadow: alertModal.type === "success" ? "0 6px 20px rgba(16,185,129,0.28)" : alertModal.type === "error" ? "0 6px 20px rgba(239,68,68,0.28)" : alertModal.type === "warning" ? "0 6px 20px rgba(245,158,11,0.28)" : "0 6px 20px rgba(37,99,235,0.28)" }}>
                Oke, Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Order Modal ── */}
      {detailOrder && (() => {
        const dk = kasirs.find(k => k.id === detailOrder.kasirId);
        return (
          <div onClick={() => setDetailOrder(null)} style={{ position: "fixed", inset: 0, zIndex: 9995, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "flex-end", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}>
            <div className="fu" onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, margin: "0 auto", background: "#fff", borderRadius: "22px 22px 0 0", maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 -8px 48px rgba(15,23,42,0.18)" }}>
              <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0", flexShrink: 0 }}><div style={{ width: 40, height: 4, borderRadius: 99, background: "#D1D5DB" }} /></div>
              <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 18, color: "var(--text)" }}>{detailOrder.customerName}</p>
                    <PaymentMeta order={detailOrder} />
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 800, fontSize: 18, color: "var(--green)" }}>{rupiah(detailOrder.total)}</p>
                    {dk && <span style={{ background: "var(--amber-dim)", color: "var(--amber)", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>{dk.name}</span>}
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>
                <p style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Detail Pesanan</p>
                {detailOrder.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 10, marginBottom: 10, borderBottom: i < detailOrder.items.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "var(--text)", fontWeight: 600, fontSize: 14, wordBreak: "break-word", overflowWrap: "anywhere" }}>{item.name}</p>
                      {item.note && <p style={{ color: "var(--blue)", fontSize: 11, marginTop: 2 }}>📝 {item.note}</p>}
                      <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>{item.qty} × {rupiah(item.price)}</p>
                    </div>
                    <p style={{ color: "var(--text)", fontWeight: 700, fontSize: 14, flexShrink: 0, marginLeft: 12 }}>{rupiah(item.qty * item.price)}</p>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "2px solid var(--border)", marginTop: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>Total</span>
                  <span style={{ fontWeight: 800, fontSize: 18, color: "var(--green)" }}>{rupiah(detailOrder.total)}</span>
                </div>
              </div>
              <div style={{ padding: "12px 20px calc(env(safe-area-inset-bottom) + 16px)", borderTop: "1px solid var(--border)", display: "flex", gap: 10, flexShrink: 0 }}>
                <ReceiptPrintButton onClick={() => printStruk(detailOrder, 0, kasirs, receiptSettings, "lunas")} loadingLabel="Menyiapkan cetak..." doneLabel="✓ Perintah cetak dikirim" style={{ flex: 1, padding: "13px", borderRadius: 13, border: "none", background: "linear-gradient(135deg,#F59E0B,#F97316)", color: "#fff", fontWeight: 700, fontSize: 14, boxShadow: "0 4px 16px rgba(245,158,11,0.28)" }}>
                  🧾 Cetak Struk
                </ReceiptPrintButton>
                <button onClick={() => setDetailOrder(null)} style={{ flex: 1, padding: "13px", borderRadius: 13, border: "1px solid var(--border)", background: "var(--card2)", color: "var(--muted)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Tutup</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Back Toast ── */}
      {backToast && (
        <div style={{ position: "fixed", bottom: 88, left: "50%", transform: "translateX(-50%)", zIndex: 9998, background: "rgba(15,23,42,0.82)", color: "#fff", borderRadius: 24, padding: "10px 22px", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", backdropFilter: "blur(8px)", boxShadow: "0 4px 20px rgba(0,0,0,0.25)", pointerEvents: "none", letterSpacing: "0.01em" }}>{backToast}</div>
      )}

      {/* ── Tutup Sesi Block Modal ── */}
      {tutupBlockModal && (
        <div onClick={() => setTutupBlockModal(null)} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,0.52)", display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: "24px 24px 0 0", padding: "0 0 32px", boxShadow: "0 -8px 48px rgba(15,23,42,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}><div style={{ width: 40, height: 4, borderRadius: 99, background: "#D1D5DB" }} /></div>
            <div style={{ display: "flex", justifyContent: "center", margin: "20px 0 16px" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(239,68,68,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
            </div>
            <div style={{ textAlign: "center", padding: "0 28px 24px" }}>
              <p style={{ fontWeight: 800, fontSize: 18, color: "#0F172A", marginBottom: 10 }}>Sesi Belum Bisa Ditutup</p>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.65 }}>Masih ada <span style={{ fontWeight: 700, color: "#EF4444" }}>{tutupBlockModal.count} tagihan terbuka</span> pada sesi ini.{" "}Selesaikan atau batalkan semua tagihan aktif sebelum menutup sesi.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 20px" }}>
              <button onClick={() => { setTutupBlockModal(null); setScreen("tagihan"); }} style={{ padding: "14px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#F59E0B 0%,#F97316 100%)", color: "#fff", fontWeight: 700, fontSize: 15, boxShadow: "0 6px 20px rgba(245,158,11,0.28)", cursor: "pointer", letterSpacing: "0.01em" }}>Lihat Tagihan Aktif</button>
              <button onClick={() => setTutupBlockModal(null)} style={{ padding: "13px", borderRadius: 14, border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#64748B", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Kembali</button>
            </div>
          </div>
        </div>
      )}

      {/* ── App Frame — LAZY MOUNT (ganti display:none → conditional render) ── */}
      {!overlay && (
        <div className="app-frame">
          <Hdr {...(titles[screen] || titles.home)} left={headerLeft} right={headerRight} />
          <div className="screen-shell">
            {/* Dashboard */}
            {screen === "home" && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <DashboardScreen orders={orders} expenses={expenses} setExpenses={setExpenses} user={user} setScreen={setScreen} target={target} setTarget={setTarget} kasirs={kasirs} mitras={mitras} menus={menus} businessDate={businessDate} sessionOpen={sessionOpen} sessionDate={sessionDate} onBuka={handleBuka} onTutup={handleTutup} setDetailOrder={setDetailOrder} />
              </div>
            )}

            {/* POS */}
            {screen === "pos" && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {(user.role === "owner" || sessionOpen)
                  ? <POSScreen menus={menus} orders={orders} setOrders={setOrders} user={user} businessDate={businessDate} currentSessionId={currentSessionId} kasirs={kasirs} setScreen={setScreen} posStep={posStep} setPosStep={setPosStep} posName={posName} setPosName={setPosName} posCart={posCart} setPosCart={setPosCart} receiptSettings={receiptSettings} setDetailOrder={setDetailOrder} loadFromSupabase={loadFromSupabase} />
                  : <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, gap: 16 }}>
                      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg></div>
                      <div style={{ textAlign: "center" }}><p style={{ color: "var(--text)", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Sesi Belum Dibuka</p><p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.5 }}>Buka sesi terlebih dahulu di halaman Home untuk mulai menerima pesanan.</p></div>
                    </div>
                }
              </div>
            )}

            {/* Tagihan */}
            {screen === "tagihan" && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {(user.role === "owner" || sessionOpen)
                  ? <TagihanScreen orders={orders} setOrders={setOrders} menus={menus} user={user} kasirs={kasirs} businessDate={businessDate} currentSessionId={currentSessionId} receiptSettings={receiptSettings} />
                  : <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, gap: 16 }}>
                      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg></div>
                      <div style={{ textAlign: "center" }}><p style={{ color: "var(--text)", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Sesi Belum Dibuka</p><p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.5 }}>Buka sesi terlebih dahulu di halaman Home untuk mengakses tagihan.</p></div>
                    </div>
                }
              </div>
            )}

            {/* Keuangan — hanya owner */}
            {screen === "keuangan" && user.role === "owner" && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <KeuanganScreen orders={orders} expenses={expenses} setExpenses={setExpenses} kasirs={kasirs} menus={menus} businessDate={businessDate} receiptSettings={receiptSettings} />
              </div>
            )}
          </div>

          <Nav screen={screen} set={setScreen} role={user.role} />

          {/* Global Floating Cart Bar */}
          {posCart.length > 0 && posStep === "menu" && (screen === "home" || screen === "tagihan" || screen === "keuangan") && (
            <div onClick={() => setScreen("pos")} style={{ position: "fixed", bottom: 68, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 28px)", maxWidth: 430, zIndex: 900, background: "linear-gradient(135deg,#F59E0B 0%,#F97316 100%)", borderRadius: 13, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", boxShadow: "0 -2px 0 rgba(0,0,0,0.08), 0 6px 24px rgba(245,120,11,0.35)" }}>
              <div style={{ background: "rgba(0,0,0,0.16)", borderRadius: 8, padding: "4px 11px", flexShrink: 0 }}>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>{posCart.reduce((s, c) => s + c.qty, 0)} item</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14 M12 5l7 7-7 7" /></svg>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Lanjut ke Kasir</span>
              </div>
              <span className="sora" style={{ color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{rupiah(posCart.reduce((s, c) => s + (c.price * c.qty), 0))}</span>
            </div>
          )}
        </div>
      )}
    </div>
  </>);
}
