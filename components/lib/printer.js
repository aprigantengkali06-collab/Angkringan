// lib/printer.js

export const DEFAULT_RECEIPT_SETTINGS = {
  header: "ANGKRINGAN.\nStruk Pembayaran Customer",
  footerPaid: "Terima kasih sudah mampir! ☕",
  footerOpen: "Mohon lunasi tagihan Anda",
};

export const normalizeMultilineReceiptText = value => String(value || "")
  .replace(/\r/g, "")
  .split("\n")
  .map(line => line.replace(/\s+/g, " ").trim())
  .filter(Boolean)
  .join("\n");

export const normalizeReceiptSettings = raw => ({
  header: normalizeMultilineReceiptText(raw?.header || DEFAULT_RECEIPT_SETTINGS.header) || DEFAULT_RECEIPT_SETTINGS.header,
  footerPaid: normalizeMultilineReceiptText(raw?.footerPaid || DEFAULT_RECEIPT_SETTINGS.footerPaid) || DEFAULT_RECEIPT_SETTINGS.footerPaid,
  footerOpen: normalizeMultilineReceiptText(raw?.footerOpen || DEFAULT_RECEIPT_SETTINGS.footerOpen) || DEFAULT_RECEIPT_SETTINGS.footerOpen,
});

export const splitReceiptLines = text => normalizeMultilineReceiptText(text).split("\n").filter(Boolean);

export const escapeHtml = value => String(value || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&#39;");

export const parseBridgeJson = raw => {
  if (!raw) return { ok:false };
  try { return JSON.parse(raw); }
  catch { return { ok: raw === "OK" || raw === "true", raw }; }
};

export const getNativePrinterBridge = () => {
  if (typeof window === "undefined") return null;
  const capacitorPrinter = window.Capacitor?.Plugins?.ThermalPrinter;
  if (capacitorPrinter?.printReceipt) {
    return {
      printReceipt:        payload    => capacitorPrinter.printReceipt({ payload }),
      getPrinterInfo:      ()         => capacitorPrinter.getPrinterInfo?.()                        || { ok:false },
      getPrinterStatus:    ()         => capacitorPrinter.getPrinterStatus?.()                      || { ok:false },
      selectPrinter:       ()         => capacitorPrinter.selectPrinter?.()                        || { ok:false },
      clearPrinter:        ()         => capacitorPrinter.clearPrinter?.()                         || { ok:false },
      getPairedDevices:    ()         => capacitorPrinter.getPairedDevices?.()                     || { ok:false, devices:"[]" },
      setPrinterByAddress: (addr, nm) => capacitorPrinter.setPrinterByAddress?.({ address:addr, name:nm }) || { ok:false },
    };
  }
  const androidBridge = window.AngkringanPrinterBridge;
  if (androidBridge?.printReceipt) {
    return {
      printReceipt:        async payload    => parseBridgeJson(androidBridge.printReceipt(JSON.stringify(payload))),
      getPrinterInfo:      async ()         => parseBridgeJson(androidBridge.getPrinterInfo?.()),
      getPrinterStatus:    async ()         => parseBridgeJson(androidBridge.getPrinterStatus?.()),
      selectPrinter:       async ()         => parseBridgeJson(androidBridge.selectPrinter?.()),
      clearPrinter:        async ()         => parseBridgeJson(androidBridge.clearPrinter?.()),
      getPairedDevices:    async ()         => parseBridgeJson(androidBridge.getPairedDevices?.()),
      setPrinterByAddress: async (addr, nm) => parseBridgeJson(androidBridge.setPrinterByAddress?.(JSON.stringify({ address:addr, name:nm }))),
    };
  }
  return null;
};

export const getNativePrinterStatus = async () => {
  const bridge = getNativePrinterBridge();
  if (!bridge?.getPrinterStatus) return { ok:false, selected:false, connected:false };
  try {
    return await bridge.getPrinterStatus();
  } catch (err) {
    return { ok:false, selected:false, connected:false, message: err?.message || "Status printer tidak tersedia" };
  }
};

export const buildNativeReceiptPayload = (order, kembalian, kasirs, receiptSettings, mode="lunas", waktu=null) => {
  const kasir = kasirs.find(k=>k.id===order.kasirId);
  const normalizedSettings = normalizeReceiptSettings(receiptSettings);
  const isPaidReceipt = mode !== "nanti";
  const headerLines = splitReceiptLines(normalizedSettings.header);
  const footerLines = splitReceiptLines(isPaidReceipt ? normalizedSettings.footerPaid : normalizedSettings.footerOpen);
  return {
    shopName: headerLines[0] || "ANGKRINGAN.",
    title: headerLines.slice(1).join(" • ") || "Struk Pembayaran Customer",
    headerLines,
    orderId: order?.id || "",
    customerName: order?.customerName || "Pelanggan",
    kasirName: kasir?.name || "-",
    waktu: waktu || new Date().toLocaleString("id-ID",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}),
    mode,
    total: Number(order?.total)||0,
    dibayar: isPaidReceipt ? (Number(order?.total)||0) + (Number(kembalian)||0) : 0,
    kembalian: Number(kembalian)||0,
    items: (order?.items||[]).map(item => ({
      name: item?.name || "Item",
      note: item?.note || "",
      qty: Number(item?.qty)||0,
      price: Number(item?.price)||0,
      subtotal: (Number(item?.qty)||0) * (Number(item?.price)||0),
    })),
    footer: footerLines.join(" | "),
    footerLines,
  };
};

export const isNativePrinterShell = () => {
  if (typeof window === "undefined") return false;
  return Boolean(window.Capacitor?.Plugins?.ThermalPrinter || window.AngkringanPrinterBridge);
};

export const tryNativeReceiptPrint = async payload => {
  const bridge = getNativePrinterBridge();
  if (!bridge) return { printed:false, nativeShell:isNativePrinterShell(), message:"" };
  try {
    const result = await bridge.printReceipt(payload);
    const printed = Boolean(result?.ok || result?.success || result?.status === "ok");
    return {
      printed,
      nativeShell:true,
      message: result?.message || result?.error || (printed ? "" : "Printer Bluetooth belum siap. Pilih printer struk lalu coba lagi."),
    };
  } catch (err) {
    console.warn("Native printer unavailable", err);
    return {
      printed:false,
      nativeShell:true,
      message: err?.message || "Printer Bluetooth belum siap. Pilih printer struk lalu coba lagi.",
    };
  }
};

export const notifyNativePrintIssue = message => {
  if (typeof window === "undefined") return;
  const msg = message || "Printer Bluetooth belum siap. Pilih printer struk lalu coba lagi.";
  if (typeof window.__angkringanAlert === "function") {
    window.__angkringanAlert(msg, "warning");
  } else {
    window.alert(msg);
  }
};

export const defaultPrinterStatus = () => ({
  nativeShell: isNativePrinterShell(),
  bluetoothSupported: false,
  bluetoothEnabled: false,
  selected: false,
  paired: false,
  connected: false,
  printerName: "",
  printerAddress: "",
  message: isNativePrinterShell()
    ? "Sedang menyiapkan printer fisik Bluetooth..."
    : "Printer fisik Bluetooth Classic hanya aktif di APK Android.",
  checkedAt: 0,
});

export const getPrinterBadgeMeta = status => {
  if (!status?.nativeShell) return {label:"Hanya APK", bg:"rgba(100,116,139,0.12)", color:"var(--muted)", dot:"#94A3B8"};
  if (status?.connected) return {label:"Printer siap", bg:"rgba(16,185,129,0.12)", color:"var(--green)", dot:"#10B981"};
  if (status?.selected && status?.paired) return {label:"Printer offline", bg:"rgba(245,158,11,0.14)", color:"var(--amber)", dot:"#F59E0B"};
  if (status?.bluetoothSupported && status?.bluetoothEnabled===false) return {label:"Bluetooth mati", bg:"rgba(239,68,68,0.12)", color:"var(--red)", dot:"#EF4444"};
  return {label:"Belum pilih", bg:"rgba(37,99,235,0.10)", color:"var(--blue)", dot:"#2563EB"};
};
