// lib/receipt.js
import { acquirePrintLock, releasePrintLock } from "./printLock.js";
import {
  tryNativeReceiptPrint,
  buildNativeReceiptPayload,
  notifyNativePrintIssue,
  normalizeReceiptSettings,
  splitReceiptLines,
  escapeHtml,
} from "./printer.js";
import { rupiah, fmtTanggalWaktu, fmtFull, fmt, orderSessionDate, orderActualPaidAt } from "./helpers.js";

const STRUK_CSS = `
  @page{size:58mm auto;margin:0 !important}
  *{box-sizing:border-box;margin:0;padding:0}
  html{width:58mm;max-width:58mm}
  body{font-family:'Courier New',Courier,monospace;font-size:10.5px;line-height:1.4;
    width:58mm;max-width:58mm;min-width:58mm;
    padding:2.5mm 2.5mm 2.5mm 2.5mm;color:#000;background:#fff;
    word-wrap:break-word;overflow-wrap:break-word}
  .c{text-align:center}
  .r{text-align:right}
  .b{font-weight:bold}
  .hdr1{font-size:14px;font-weight:bold;letter-spacing:0.5px;text-align:center;margin-bottom:1px}
  .hdr2{font-size:9.5px;text-align:center;color:#333;margin-bottom:1px}
  .dl{border:none;border-top:1px dashed #555;margin:4px 0}
  .meta-row{display:flex;justify-content:space-between;align-items:flex-start;gap:2mm;margin:1.5px 0;font-size:10px}
  .meta-label{color:#444;flex-shrink:0;min-width:14mm}
  .meta-val{text-align:right;font-weight:600;white-space:nowrap;flex-shrink:0}
  .item-blk{margin-bottom:5px}
  .item-name{font-weight:bold;font-size:10.5px;word-break:break-word}
  .item-note{font-size:9px;color:#555;padding-left:2mm;margin-top:1px;word-break:break-word}
  .item-row{display:flex;justify-content:space-between;gap:2mm;font-size:10px;color:#333}
  .item-sub{font-weight:bold;color:#000;white-space:nowrap}
  .tot-row{display:flex;justify-content:space-between;gap:2mm;font-size:11px;font-weight:bold;margin:1px 0}
  .tot-sub{display:flex;justify-content:space-between;gap:2mm;font-size:10px;margin:1px 0}
  .badge{display:inline-block;border:1px solid #000;padding:1px 6px;border-radius:3px;font-size:9.5px;margin:3px 0}
  .badge-ok{border-color:#2a7d4f;color:#2a7d4f}
  .badge-open{border-color:#888;color:#555}
  .foot{font-size:9.5px;color:#555;text-align:center;word-break:break-word;margin-top:1px}
  .feed10{display:block;height:14em;min-height:14em}
  @media print{
    html,body{width:58mm !important;max-width:58mm !important}
    @page{size:58mm auto;margin:0 !important}
  }
`;

const openPrintWindow = async (html) => {
  if(typeof window!=="undefined"&&typeof window.__angkringanReceiptPreview==="function"){
    window.__angkringanReceiptPreview(html);
    return {ok:true, channel:"preview"};
  }
  const w=window.open("","_blank","width=340,height=600");
  if(!w) return {ok:false, channel:"browser", message:"Popup cetak diblokir browser."};
  w.document.write(html);
  w.document.close();
  return await new Promise(resolve=>{
    let settled = false;
    const finish = payload => {
      if(settled) return;
      settled = true;
      resolve(payload);
    };
    setTimeout(()=>{
      try {
        w.focus();
        w.onafterprint = () => {
          try{w.close();}catch{}
          finish({ok:true, channel:"browser"});
        };
        w.print();
        setTimeout(()=>finish({ok:true, channel:"browser", assumed:true}), 1200);
      } catch (err) {
        try{w.close();}catch{}
        finish({ok:false, channel:"browser", message: err?.message || "Gagal membuka dialog print."});
      }
    }, 220);
  });
};

export const printStruk = async (order, kembalian, kasirs, receiptSettings, mode="lunas") => {
  if(!acquirePrintLock()) return {ok:false, channel:"locked", message:"Sedang mencetak, harap tunggu."};
  try {
    const kasir = kasirs.find(k=>k.id===order.kasirId);
    const now = new Date();
    const waktu = now.toLocaleString("id-ID",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
    const normalizedSettings = normalizeReceiptSettings(receiptSettings);
    const headerLines = splitReceiptLines(normalizedSettings.header);
    const footerLines = splitReceiptLines(mode !== "nanti" ? normalizedSettings.footerPaid : normalizedSettings.footerOpen);
    const nativePrint = await tryNativeReceiptPrint(buildNativeReceiptPayload(order, kembalian, kasirs, normalizedSettings, mode, waktu));
    if(nativePrint.printed) return {ok:true, channel:"native"};
    if(nativePrint.nativeShell){ notifyNativePrintIssue(nativePrint.message); return {ok:false, channel:"native", message:nativePrint.message}; }
    const isPaid = mode !== "nanti";
    const dibayar = (Number(order.total)||0)+(Number(kembalian)||0);
    const html = `<!DOCTYPE html><html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Struk - ${escapeHtml(order.customerName)}</title>
<style>${STRUK_CSS}</style>
</head><body>
${headerLines.map((line,idx)=>`<div class="${idx===0?"hdr1":"hdr2"}">${escapeHtml(line)}</div>`).join("")}
<div class="dl"></div>
<div class="meta-row"><span class="meta-label">Pelanggan</span><span class="meta-val">${escapeHtml(order.customerName||"Pelanggan")}</span></div>
<div class="meta-row"><span class="meta-label">Kasir</span><span class="meta-val">${escapeHtml(kasir?.name||"-")}</span></div>
<div class="meta-row"><span class="meta-label">Waktu</span><span class="meta-val">${escapeHtml(waktu)}</span></div>
${!isPaid?`<div class="c" style="margin:3px 0"><span class="badge badge-open">&#9203; TAGIHAN TERBUKA</span></div>`:""}
<div class="dl"></div>
${(order.items||[]).map(item=>{
  const qty=Number(item?.qty)||0; const price=Number(item?.price)||0;
  return `<div class="item-blk">
  <div class="item-name">${escapeHtml(item?.name||"Item")}</div>
  ${item?.note?`<div class="item-note">&#9998; ${escapeHtml(item.note)}</div>`:""}
  <div class="item-row"><span>${qty}&times;${escapeHtml(rupiah(price))}</span><span class="item-sub">${escapeHtml(rupiah(price*qty))}</span></div>
</div>`}).join("")}
<div class="dl"></div>
<div class="tot-row"><span>TOTAL</span><span>${escapeHtml(rupiah(order.total))}</span></div>
${isPaid?`<div class="tot-sub"><span>Dibayar</span><span>${escapeHtml(rupiah(dibayar))}</span></div>
<div class="tot-row"><span>Kembalian</span><span>${escapeHtml(rupiah(kembalian||0))}</span></div>`:
`<div class="c" style="margin:4px 0;font-size:9.5px;color:#666">Mohon segera lunasi tagihan</div>`}
<div class="dl"></div>
${footerLines.map(line=>`<div class="foot">${escapeHtml(line)}</div>`).join("")}
<span class="feed10"></span>
</body></html>`;
    return await openPrintWindow(html);
  } finally {
    releasePrintLock();
  }
};

export const printOrderStrukRiwayat = async (order, kasirs, receiptSettings) => {
  if(!acquirePrintLock()) return {ok:false, channel:"locked", message:"Sedang mencetak, harap tunggu."};
  try {
    const kasir = kasirs.find(k=>k.id===order.kasirId);
    const paidAt = orderActualPaidAt(order);
    const waktu = paidAt ? fmtTanggalWaktu(paidAt) : fmtFull(orderSessionDate(order)||fmt(new Date()));
    const normalizedSettings = normalizeReceiptSettings(receiptSettings);
    const headerLines = splitReceiptLines(normalizedSettings.header);
    const footerLines = splitReceiptLines(normalizedSettings.footerPaid);
    const nativePrint = await tryNativeReceiptPrint(buildNativeReceiptPayload(order, 0, kasirs, normalizedSettings, "lunas", waktu));
    if(nativePrint.printed) return {ok:true, channel:"native"};
    if(nativePrint.nativeShell){ notifyNativePrintIssue(nativePrint.message); return {ok:false, channel:"native", message:nativePrint.message}; }
    const html = `<!DOCTYPE html><html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Struk - ${escapeHtml(order.customerName)}</title>
<style>${STRUK_CSS}</style>
</head><body>
${headerLines.map((line,idx)=>`<div class="${idx===0?"hdr1":"hdr2"}">${escapeHtml(line)}</div>`).join("")}
<div class="dl"></div>
<div class="meta-row"><span class="meta-label">Pelanggan</span><span class="meta-val">${escapeHtml(order.customerName||"Pelanggan")}</span></div>
<div class="meta-row"><span class="meta-label">Kasir</span><span class="meta-val">${escapeHtml(kasir?.name||"-")}</span></div>
<div class="meta-row"><span class="meta-label">Waktu</span><span class="meta-val">${escapeHtml(waktu)}</span></div>
<div class="c" style="margin:3px 0"><span class="badge badge-ok">&#10003; LUNAS</span></div>
<div class="dl"></div>
${(order.items||[]).map(item=>{
  const qty=Number(item?.qty)||0; const price=Number(item?.price)||0;
  return `<div class="item-blk">
  <div class="item-name">${escapeHtml(item?.name||"Item")}</div>
  ${item?.note?`<div class="item-note">&#9998; ${escapeHtml(item.note)}</div>`:""}
  <div class="item-row"><span>${qty}&times;${escapeHtml(rupiah(price))}</span><span class="item-sub">${escapeHtml(rupiah(price*qty))}</span></div>
</div>`}).join("")}
<div class="dl"></div>
<div class="tot-row"><span>TOTAL</span><span>${escapeHtml(rupiah(order.total))}</span></div>
<div class="dl"></div>
${footerLines.map(line=>`<div class="foot">${escapeHtml(line)}</div>`).join("")}
<span class="feed10"></span>
</body></html>`;
    return await openPrintWindow(html);
  } finally {
    releasePrintLock();
  }
};
