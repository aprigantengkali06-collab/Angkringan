// lib/pdf.js
import { fmtFull, fmtShort, rupiah, orderSessionDate, expenseDateKey } from "./helpers.js";
import { calcFinanceSummary, buildFinanceDayMap, getFinanceSummaryForMonth } from "./finance.js";

export const printDayPDF = (date, orders, expenses, kasirs, menus=[]) => {
  const paid = orders.filter(o=>o.status==="paid"&&orderSessionDate(o)===date);
  const exps = expenses.filter(e=>expenseDateKey(e)===date);
  const {pemasukan, pengeluaran, modalMitra, totalKeluar, kas} = calcFinanceSummary({orders: paid, expenses: exps, menus});
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Rekap ${fmtFull(date)}</title>
<style>@page{size:A4;margin:14mm}*{margin:0;padding:0;box-sizing:border-box}html{-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#fff}body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;background:#fff;-webkit-text-size-adjust:100%;font-size:12px} .page{max-width:760px;margin:0 auto}
.hd{text-align:center;border-bottom:2px solid #F5A623;padding-bottom:14px;margin-bottom:22px}.hd h1{font-size:20px;font-weight:800;color:#0C0906}.hd .br{color:#F5A623}.hd .dt{font-size:12px;color:#666;margin-top:5px}
.sec{margin-bottom:18px}.st{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#888;margin-bottom:8px}
.summary{width:100%;border-collapse:separate;border-spacing:0 8px}.summary td{padding:10px 12px;vertical-align:top}.summary .label{font-size:12px;font-weight:700;color:#444}.summary .note{font-size:10px;color:#777;margin-top:2px}.summary .value{text-align:right;font-size:15px;font-weight:800;white-space:nowrap}
.summary tr td:first-child{border-radius:8px 0 0 8px;border-left-width:4px;border-left-style:solid}.summary tr td:last-child{border-radius:0 8px 8px 0;border-right:1px solid transparent}.rin td{background:#f0fdf4;border-top:1px solid #d7f0e1;border-bottom:1px solid #d7f0e1}.rin td:first-child{border-left-color:#4CAF7D}.rin td:last-child{border-right-color:#d7f0e1}.rout td{background:#fff5f5;border-top:1px solid #f6d9d9;border-bottom:1px solid #f6d9d9}.rout td:first-child{border-left-color:#E05252}.rout td:last-child{border-right-color:#f6d9d9}.rkas td{background:#fffbeb;border-top:1px solid #f6e6b2;border-bottom:1px solid #f6e6b2}.rkas td:first-child{border-left-color:#F5A623}.rkas td:last-child{border-right-color:#f6e6b2}.rtotal td{background:#ffeaea;border-top:1px solid #f2c4c4;border-bottom:1px solid #f2c4c4}.rtotal td:first-child{border-left-color:#c0392b}.rtotal td:last-child{border-right-color:#f2c4c4}
.vin{color:#2f855a}.vout{color:#c53030}.vkas{color:#B7791F}.vtotal{color:#c0392b}.muted{color:#777}
.table{width:100%;border-collapse:collapse;font-size:11px}.table thead{display:table-header-group}.table th{background:#f9f5f0;text-align:left;padding:8px 10px;font-weight:700;color:#555;border-bottom:1px solid #e5e5e5}.table td{padding:8px 10px;border-bottom:1px solid #f0f0f0;color:#333;vertical-align:top;word-break:break-word}.table tr{page-break-inside:avoid}
.badge{display:inline-block;background:#fef3c7;color:#92400e;border-radius:999px;padding:2px 7px;font-size:10px;font-weight:700}.div{border:none;border-top:1px dashed #ddd;margin:14px 0}.ft{margin-top:24px;text-align:center;font-size:10px;color:#888;border-top:1px solid #eee;padding-top:12px}
</style></head><body><div class="page">
<div class="hd"><h1>Angkringan<span class="br">.</span> Rekap Harian</h1><p class="dt">${fmtFull(date)}</p></div>
<div class="sec"><div class="st">Ringkasan Keuangan</div><table class="summary"><tbody>
<tr class="rin summary-row"><td><div class="label">Pemasukan</div><div class="note">Total pesanan lunas</div></td><td class="value vin">${rupiah(pemasukan)}</td></tr>
<tr class="rout summary-row"><td><div class="label">Pengeluaran</div><div class="note">Biaya operasional pada tanggal ini</div></td><td class="value vout">− ${rupiah(pengeluaran)}</td></tr>
<tr class="rout summary-row"><td><div class="label">Modal Mitra</div><div class="note">Akumulasi modal dari menu mitra</div></td><td class="value vout">− ${rupiah(modalMitra)}</td></tr>
<tr class="rtotal summary-row"><td><div class="label">Total Keluar</div><div class="note">Pengeluaran + Modal Mitra</div></td><td class="value vtotal">− ${rupiah(totalKeluar)}</td></tr>
<tr class="rkas summary-row"><td><div class="label">Kas Bersih</div><div class="note">Pemasukan dikurangi total keluar</div></td><td class="value vkas">${rupiah(kas)}</td></tr>
</tbody></table></div>
${paid.length?`<div class="sec"><div class="st">Pesanan (${paid.length})</div><table class="table"><thead><tr><th>#</th><th>Pelanggan</th><th>Item</th><th>Kasir</th><th>Total</th></tr></thead><tbody>
${paid.map((o,i)=>{const k=kasirs.find(k=>k.id===o.kasirId);return`<tr><td>${i+1}</td><td>${o.customerName}</td><td class="muted">${o.items.map(i=>`${i.name}×${i.qty}`).join(", ")}</td><td><span class="badge">${k?.name||"-"}</span></td><td style="font-weight:800;color:#B7791F">${rupiah(o.total)}</td></tr>`;}).join("")}</tbody></table></div>`:""}
${exps.length?`<hr class="div"><div class="sec"><div class="st">Pengeluaran</div><table class="table"><thead><tr><th>Keterangan</th><th>Jumlah</th></tr></thead><tbody>
${exps.map(e=>`<tr><td>${e.description}</td><td style="color:#c53030;font-weight:800">− ${rupiah(e.amount)}</td></tr>`).join("")}</tbody></table></div>`:""}
<div class="ft">Dicetak dari Angkringan. — ${new Date().toLocaleString("id-ID")}</div>
</div></body></html>`;
  const fileName = `Rekap-${date}.html`;
  if(window.AngkringanFileBridge?.savePdfFile){
    window.AngkringanFileBridge.savePdfFile(`Rekap-${date}`, html);
  } else {
    const blob = new Blob([html], {type:"text/html;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},1000);
  }
};

export const printMonthPDF = (monthKey, monthLabel, orders, expenses, kasirs, menus=[]) => {
  const paid = orders.filter(o=>o.status==="paid"&&orderSessionDate(o)?.startsWith(monthKey));
  const exps = expenses.filter(e=>expenseDateKey(e)?.startsWith(monthKey));
  const financeDayMap = buildFinanceDayMap(paid, exps, menus);
  const {pemasukan, pengeluaran, modalMitra, totalKeluar, kas} = getFinanceSummaryForMonth(financeDayMap, monthKey);
  const dayMap = Object.fromEntries(Object.entries(financeDayMap).map(([date, row])=>[date, {
    pemasukan: row.pemasukan,
    pengeluaran: row.pengeluaran,
    modalMitra: row.modalMitra,
    orders: row.paidOrders || [],
  }]));
  const days = Object.keys(dayMap).sort();
  const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Laporan ${monthLabel}</title>
<style>@page{size:A4;margin:14mm}*{margin:0;padding:0;box-sizing:border-box}html{-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#fff}body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;background:#fff;-webkit-text-size-adjust:100%;font-size:12px}.page{max-width:820px;margin:0 auto}
.hd{text-align:center;border-bottom:2px solid #F5A623;padding-bottom:14px;margin-bottom:22px}.hd h1{font-size:20px;font-weight:800;color:#0C0906}.hd .br{color:#F5A623}.hd .dt{font-size:12px;color:#666;margin-top:5px}
.sec{margin-bottom:20px}.st{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#888;margin-bottom:8px}
.summary{width:100%;border-collapse:separate;border-spacing:0 8px}.summary td{padding:10px 12px;vertical-align:top}.summary .label{font-size:12px;font-weight:700;color:#444}.summary .note{font-size:10px;color:#777;margin-top:2px}.summary .value{text-align:right;font-size:15px;font-weight:800;white-space:nowrap}
.summary tr td:first-child{border-radius:8px 0 0 8px;border-left-width:4px;border-left-style:solid}.summary tr td:last-child{border-radius:0 8px 8px 0;border-right:1px solid transparent}.rin td{background:#f0fdf4;border-top:1px solid #d7f0e1;border-bottom:1px solid #d7f0e1}.rin td:first-child{border-left-color:#4CAF7D}.rin td:last-child{border-right-color:#d7f0e1}.rout td{background:#fff5f5;border-top:1px solid #f6d9d9;border-bottom:1px solid #f6d9d9}.rout td:first-child{border-left-color:#E05252}.rout td:last-child{border-right-color:#f6d9d9}.rkas td{background:#fffbeb;border-top:1px solid #f6e6b2;border-bottom:1px solid #f6e6b2}.rkas td:first-child{border-left-color:#F5A623}.rkas td:last-child{border-right-color:#f6e6b2}.rtotal td{background:#ffeaea;border-top:1px solid #f2c4c4;border-bottom:1px solid #f2c4c4}.rtotal td:first-child{border-left-color:#c0392b}.rtotal td:last-child{border-right-color:#f2c4c4}
.vin{color:#2f855a}.vout{color:#c53030}.vkas{color:#B7791F}.vtotal{color:#c0392b}.muted{color:#777}
.table{width:100%;border-collapse:collapse;font-size:11px}.table thead{display:table-header-group}.table th{background:#f9f5f0;text-align:left;padding:8px 10px;font-weight:700;color:#555;border-bottom:1px solid #e5e5e5}.table td{padding:8px 10px;border-bottom:1px solid #f0f0f0;color:#333;vertical-align:top;word-break:break-word}.table tr{page-break-inside:avoid}
.badge{display:inline-block;background:#fef3c7;color:#92400e;border-radius:999px;padding:2px 7px;font-size:10px;font-weight:700}.div{border:none;border-top:1px dashed #ddd;margin:16px 0}.ft{margin-top:24px;text-align:center;font-size:10px;color:#888;border-top:1px solid #eee;padding-top:12px}
</style></head><body><div class="page">
<div class="hd"><h1>Angkringan<span class="br">.</span> Laporan Bulanan</h1><p class="dt">${monthLabel}</p></div>
<div class="sec"><div class="st">Ringkasan Keuangan</div><table class="summary"><tbody>
<tr class="rin summary-row"><td><div class="label">Total Pemasukan</div><div class="note">Akumulasi seluruh pesanan lunas</div></td><td class="value vin">${rupiah(pemasukan)}</td></tr>
<tr class="rout summary-row"><td><div class="label">Pengeluaran</div><div class="note">Total biaya operasional bulan ini</div></td><td class="value vout">− ${rupiah(pengeluaran)}</td></tr>
<tr class="rout summary-row"><td><div class="label">Modal Mitra</div><div class="note">Akumulasi modal dari menu mitra</div></td><td class="value vout">− ${rupiah(modalMitra)}</td></tr>
<tr class="rtotal summary-row"><td><div class="label">Total Keluar</div><div class="note">Pengeluaran + Modal Mitra</div></td><td class="value vtotal">− ${rupiah(totalKeluar)}</td></tr>
<tr class="rkas summary-row"><td><div class="label">Kas Bersih</div><div class="note">Pemasukan dikurangi total keluar</div></td><td class="value vkas">${rupiah(kas)}</td></tr>
</tbody></table></div>
<hr class="div">
<div class="sec"><div class="st">Rekap Per Hari (${days.length} hari)</div>
<table class="table"><thead><tr><th>Tanggal</th><th>Pesanan</th><th>Pemasukan</th><th>Total Keluar</th><th>Kas Bersih</th></tr></thead><tbody>
${days.map(d=>{const dd=dayMap[d];const totalKeluarHarian=dd.pengeluaran+dd.modalMitra;const k=dd.pemasukan-totalKeluarHarian;
  const dateStr=new Date(d+"T00:00:00").toLocaleDateString("id-ID",{weekday:"short",day:"numeric",month:"short"});
  return`<tr><td>${dateStr}</td><td>${dd.orders.length} pesanan</td><td style="color:#2f855a;font-weight:800">${rupiah(dd.pemasukan)}</td><td style="color:#c53030;font-weight:700">${totalKeluarHarian>0?"− "+rupiah(totalKeluarHarian):"-"}</td><td style="font-weight:800;color:${k>=0?"#B7791F":"#c53030"}">${rupiah(k)}</td></tr>`;}).join("")}
</tbody></table></div>
<hr class="div">
${paid.length?`<div class="sec"><div class="st">Semua Pesanan (${paid.length})</div>
<table class="table"><thead><tr><th>#</th><th>Tgl</th><th>Pelanggan</th><th>Item</th><th>Kasir</th><th>Total</th></tr></thead><tbody>
${paid.sort((a,b)=>a.paidAt.localeCompare(b.paidAt)).map((o,i)=>{
  const k=kasirs.find(k=>k.id===o.kasirId);
  const ds=new Date(orderSessionDate(o)+"T00:00:00").toLocaleDateString("id-ID",{day:"numeric",month:"short"});
  return`<tr><td>${i+1}</td><td>${ds}</td><td>${o.customerName}</td><td class="muted">${o.items.map(i=>`${i.name}×${i.qty}`).join(", ")}</td><td><span class="badge">${k?.name||"-"}</span></td><td style="font-weight:800;color:#B7791F">${rupiah(o.total)}</td></tr>`;}).join("")}
</tbody></table></div>`:""}
${exps.length?`<hr class="div"><div class="sec"><div class="st">Pengeluaran (${exps.length})</div>
<table class="table"><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Jumlah</th></tr></thead><tbody>
${exps.sort((a,b)=>a.date.localeCompare(b.date)).map(e=>{
  const ds=new Date(e.date+"T00:00:00").toLocaleDateString("id-ID",{day:"numeric",month:"short"});
  return`<tr><td>${ds}</td><td>${e.description}</td><td style="color:#c53030;font-weight:800">− ${rupiah(e.amount)}</td></tr>`;}).join("")}
</tbody></table></div>`:""}
<div class="ft">Dicetak dari Angkringan. — ${new Date().toLocaleString("id-ID")}</div>
</div></body></html>`;
  const fileName = `Laporan-${monthKey}.html`;
  if(window.AngkringanFileBridge?.savePdfFile){
    window.AngkringanFileBridge.savePdfFile(`Laporan-${monthKey}`, html);
  } else {
    const blob = new Blob([html],{type:"text/html;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href=url; a.download=fileName;
    document.body.appendChild(a); a.click();
    setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},1000);
  }
};
