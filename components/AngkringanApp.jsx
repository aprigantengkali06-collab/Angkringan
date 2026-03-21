"use client";

import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@400;600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:#FDF8F2;--bg2:#F7F0E6;--card:#FFFFFF;--card2:#FDF3E3;--border:#EDE0CC;
      --amber:#D4820A;--amber-dim:rgba(212,130,10,0.10);
      --green:#2E8B57;--green-dim:rgba(46,139,87,0.10);
      --red:#C0392B;--red-dim:rgba(192,57,43,0.10);
      --blue:#2563EB;--blue-dim:rgba(37,99,235,0.10);
      --purple:#7C3AED;--purple-dim:rgba(124,58,237,0.10);
      --cream:#7A5C38;--muted:#A08060;--text:#3D2B1A;
    }
    .sora{font-family:'Sora',sans-serif}
    input{outline:none;border:none;background:transparent;color:var(--text);font-family:'DM Sans',sans-serif;font-size:15px;width:100%;padding:11px 14px}
    button{cursor:pointer;border:none;background:none;font-family:'DM Sans',sans-serif}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    .fu{animation:fadeUp 0.28s ease both}
    .fi{animation:fadeIn 0.2s ease both}
    .s1{animation-delay:.04s}.s2{animation-delay:.08s}.s3{animation-delay:.12s}.s4{animation-delay:.16s}.s5{animation-delay:.2s}
    ::-webkit-scrollbar{width:3px;height:3px}
    ::-webkit-scrollbar-thumb{background:var(--border);border-radius:99px}
  `}</style>
);

// ── Helpers ──
const today = new Date();
const fmt = d => d.toISOString().split("T")[0];
const todayStr = fmt(today);
const rupiah = n => "Rp " + Number(n).toLocaleString("id-ID");
const genId = p => p + Date.now().toString().slice(-5);
const CATS = ["Semua","Kopi","Cocktail","Minuman Lain"];
const MCATS = ["Kopi","Cocktail","Minuman Lain"];
const KASIR_COLORS = ["var(--amber)","var(--blue)","var(--purple)","var(--green)"];
const KASIR_COLORS_DIM = ["var(--amber-dim)","var(--blue-dim)","var(--purple-dim)","var(--green-dim)"];

const fmtFull = ds => new Date(ds+"T00:00:00").toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
const fmtShort = ds => new Date(ds+"T00:00:00").toLocaleDateString("id-ID",{weekday:"short",day:"numeric",month:"short"});
const fmtMonth = (y,m) => new Date(y,m,1).toLocaleDateString("id-ID",{month:"long",year:"numeric"});
const pad = n => String(n).padStart(2,"0");

// Get all months that have data
const getMonths = (dates) => {
  const set = new Set(dates.map(d => d.slice(0,7)));
  return [...set].sort((a,b)=>b.localeCompare(a)).map(ym => {
    const [y,m] = ym.split("-");
    return { key: ym, year: parseInt(y), month: parseInt(m)-1,
      label: new Date(parseInt(y), parseInt(m)-1, 1).toLocaleDateString("id-ID",{month:"long",year:"numeric"}) };
  });
};

// ── Initial Data ──
const MENUS0 = [
  {id:1,name:"Kopi Tubruk",price:5000,category:"Kopi",available:true},
  {id:2,name:"Kopi Susu",price:8000,category:"Kopi",available:true},
  {id:3,name:"Es Kopi Susu",price:10000,category:"Kopi",available:true},
  {id:4,name:"Americano",price:12000,category:"Kopi",available:true},
  {id:5,name:"Cappuccino",price:13000,category:"Kopi",available:true},
  {id:6,name:"Mojito Virgin",price:15000,category:"Cocktail",available:true},
  {id:7,name:"Lemon Mint",price:12000,category:"Cocktail",available:true},
  {id:8,name:"Blue Ocean",price:18000,category:"Cocktail",available:true},
  {id:9,name:"Sunrise Mix",price:16000,category:"Cocktail",available:true},
  {id:10,name:"Teh Manis",price:4000,category:"Minuman Lain",available:true},
  {id:11,name:"Es Jeruk",price:6000,category:"Minuman Lain",available:true},
  {id:12,name:"Air Mineral",price:3000,category:"Minuman Lain",available:true},
];

const makeHistorical = () => {
  const days = [
    {daysAgo:6,amt:285000,kid:"k1",items:[{menuId:1,name:"Kopi Tubruk",price:5000,qty:12},{menuId:10,name:"Teh Manis",price:4000,qty:8},{menuId:6,name:"Mojito Virgin",price:15000,qty:7}]},
    {daysAgo:5,amt:420000,kid:"k2",items:[{menuId:3,name:"Es Kopi Susu",price:10000,qty:14},{menuId:7,name:"Lemon Mint",price:12000,qty:9},{menuId:2,name:"Kopi Susu",price:8000,qty:8}]},
    {daysAgo:4,amt:310000,kid:"k1",items:[{menuId:1,name:"Kopi Tubruk",price:5000,qty:10},{menuId:6,name:"Mojito Virgin",price:15000,qty:6},{menuId:11,name:"Es Jeruk",price:6000,qty:9}]},
    {daysAgo:3,amt:550000,kid:"k2",items:[{menuId:3,name:"Es Kopi Susu",price:10000,qty:18},{menuId:8,name:"Blue Ocean",price:18000,qty:8},{menuId:2,name:"Kopi Susu",price:8000,qty:10}]},
    {daysAgo:2,amt:395000,kid:"k1",items:[{menuId:2,name:"Kopi Susu",price:8000,qty:13},{menuId:9,name:"Sunrise Mix",price:16000,qty:7},{menuId:10,name:"Teh Manis",price:4000,qty:10}]},
    {daysAgo:1,amt:480000,kid:"k2",items:[{menuId:3,name:"Es Kopi Susu",price:10000,qty:16},{menuId:6,name:"Mojito Virgin",price:15000,qty:9},{menuId:4,name:"Americano",price:12000,qty:7}]},
  ];
  return days.map(({daysAgo,amt,kid,items},i) => {
    const d=new Date(today); d.setDate(d.getDate()-daysAgo);
    const ds=fmt(d);
    return [{id:`HIST${i}A`,customerName:"Pelanggan A",status:"paid",createdAt:ds,paidAt:ds,items:items.slice(0,2),total:Math.floor(amt*0.6),kasirId:kid},
            {id:`HIST${i}B`,customerName:"Pelanggan B",status:"paid",createdAt:ds,paidAt:ds,items:items.slice(1),total:Math.floor(amt*0.4),kasirId:kid}];
  }).flat();
};

const makePrevMonth = () => {
  const base = new Date(today.getFullYear(), today.getMonth()-1, 1);
  return [10,15,20,25].map((day,i) => {
    const d = new Date(base.getFullYear(), base.getMonth(), day);
    const ds = fmt(d);
    const kids = ["k1","k2"];
    return [{id:`PM${i}A`,customerName:"Tamu",status:"paid",createdAt:ds,paidAt:ds,
       items:[{menuId:3,name:"Es Kopi Susu",price:10000,qty:8+i},{menuId:6,name:"Mojito Virgin",price:15000,qty:5}],
       total:(8+i)*10000+75000,kasirId:kids[i%2]},
     {id:`PM${i}B`,customerName:"Langganan",status:"paid",createdAt:ds,paidAt:ds,
       items:[{menuId:1,name:"Kopi Tubruk",price:5000,qty:10},{menuId:2,name:"Kopi Susu",price:8000,qty:6}],
       total:98000,kasirId:kids[(i+1)%2]}];
  }).flat();
};

const ORDERS0 = [
  ...makeHistorical(), ...makePrevMonth(),
  {id:"ORD001",customerName:"Budi",status:"open",createdAt:todayStr,paidAt:null,
   items:[{menuId:1,name:"Kopi Tubruk",price:5000,qty:2},{menuId:10,name:"Teh Manis",price:4000,qty:1}],total:14000,kasirId:"k1"},
  {id:"ORD002",customerName:"Sari",status:"open",createdAt:todayStr,paidAt:null,
   items:[{menuId:6,name:"Mojito Virgin",price:15000,qty:1}],total:15000,kasirId:"k2"},
  {id:"ORD003",customerName:"Dani",status:"paid",createdAt:todayStr,paidAt:todayStr,
   items:[{menuId:3,name:"Es Kopi Susu",price:10000,qty:2},{menuId:6,name:"Mojito Virgin",price:15000,qty:1}],total:35000,kasirId:"k1"},
  {id:"ORD004",customerName:"Rina",status:"paid",createdAt:todayStr,paidAt:todayStr,
   items:[{menuId:2,name:"Kopi Susu",price:8000,qty:2},{menuId:11,name:"Es Jeruk",price:6000,qty:1}],total:22000,kasirId:"k2"},
  {id:"ORD005",customerName:"Tono",status:"paid",createdAt:todayStr,paidAt:todayStr,
   items:[{menuId:3,name:"Es Kopi Susu",price:10000,qty:1},{menuId:8,name:"Blue Ocean",price:18000,qty:1}],total:28000,kasirId:"k2"},
];

const makeAllExps = () => {
  const hist = [
    [{desc:"Biji kopi robusta",amt:70000},{desc:"Gula & susu",amt:35000}],
    [{desc:"Es batu & sirup",amt:45000}],
    [{desc:"Kopi & gula pasir",amt:80000},{desc:"Sedotan & cup",amt:20000}],
    [{desc:"Susu kental manis",amt:40000}],
    [{desc:"Biji kopi arabika",amt:90000},{desc:"Gula aren",amt:25000}],
    [{desc:"Es batu & lemon",amt:38000},{desc:"Kopi robusta",amt:65000}],
  ].map((day,i) => {
    const d=new Date(today); d.setDate(d.getDate()-(6-i));
    return day.map((e,j)=>({id:`HEXP${i}${j}`,description:e.desc,amount:e.amt,date:fmt(d)}));
  }).flat();
  const prevBase = new Date(today.getFullYear(), today.getMonth()-1, 1);
  const prev = [10,15,20,25].map((day,i) => {
    const d = new Date(prevBase.getFullYear(), prevBase.getMonth(), day);
    return [{id:`PEXP${i}A`,description:"Beli bahan harian",amount:60000+i*5000,date:fmt(d)}];
  }).flat();
  return [...hist, ...prev,
    {id:"EXP001",description:"Beli biji kopi & gula",amount:85000,date:todayStr},
    {id:"EXP002",description:"Es batu & susu kental",amount:40000,date:todayStr},
  ];
};
const EXPS0 = makeAllExps();

// ── PDF ──
const printDayPDF = (date, orders, expenses, kasirs) => {
  const paid = orders.filter(o=>o.status==="paid"&&o.paidAt===date);
  const exps = expenses.filter(e=>e.date===date);
  const pemasukan = paid.reduce((s,o)=>s+o.total,0);
  const pengeluaran = exps.reduce((s,e)=>s+e.amount,0);
  const kas = pemasukan - pengeluaran;
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Rekap ${fmtFull(date)}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;padding:28px;max-width:580px;margin:0 auto;color:#1a1a1a}
.hd{text-align:center;border-bottom:2px solid #F5A623;padding-bottom:14px;margin-bottom:22px}
.hd h1{font-size:20px;font-weight:800;color:#0C0906}.hd .br{color:#F5A623}.hd .dt{font-size:12px;color:#666;margin-top:5px}
.sec{margin-bottom:18px}.st{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#888;margin-bottom:8px}
.row{display:flex;justify-content:space-between;align-items:center;padding:9px 12px;border-radius:7px;margin-bottom:5px}
.rin{background:#f0fdf4;border-left:3px solid #4CAF7D}.rout{background:#fff5f5;border-left:3px solid #E05252}.rkas{background:#fffbeb;border-left:3px solid #F5A623}
.lbl{font-size:13px;color:#444}.val{font-size:15px;font-weight:800}
.vin{color:#4CAF7D}.vout{color:#E05252}.vkas{color:#F5A623}
table{width:100%;border-collapse:collapse;font-size:12px}th{background:#f9f5f0;text-align:left;padding:7px 10px;font-weight:700;color:#555;border-bottom:1px solid #e5e5e5}
td{padding:7px 10px;border-bottom:1px solid #f0f0f0;color:#333}.rk{background:#F5A623;color:#fff;border-radius:3px;padding:1px 5px;font-size:10px;font-weight:700}
.kb{background:#fef3c7;color:#92400e;border-radius:3px;padding:1px 6px;font-size:10px;font-weight:600}
.div{border:none;border-top:1px dashed #ddd;margin:14px 0}
.ft{margin-top:24px;text-align:center;font-size:10px;color:#aaa;border-top:1px solid #eee;padding-top:12px}
</style></head><body>
<div class="hd"><h1>Angkringan<span class="br">.</span> Rekap Harian</h1><p class="dt">${fmtFull(date)}</p></div>
<div class="sec"><div class="st">Ringkasan Keuangan</div>
<div class="row rin"><span class="lbl">💰 Pemasukan</span><span class="val vin">${rupiah(pemasukan)}</span></div>
<div class="row rout"><span class="lbl">🧾 Pengeluaran</span><span class="val vout">− ${rupiah(pengeluaran)}</span></div>
<div class="row rkas"><span class="lbl">🏦 Kas Bersih</span><span class="val vkas">${rupiah(kas)}</span></div></div>
${paid.length?`<div class="sec"><div class="st">Pesanan (${paid.length})</div><table><thead><tr><th>#</th><th>Pelanggan</th><th>Item</th><th>Kasir</th><th>Total</th></tr></thead><tbody>
${paid.map((o,i)=>{const k=kasirs.find(k=>k.id===o.kasirId);return`<tr><td>${i+1}</td><td>${o.customerName}</td><td style="font-size:10px;color:#666">${o.items.map(i=>`${i.name}×${i.qty}`).join(", ")}</td><td><span class="kb">${k?.name||"-"}</span></td><td style="font-weight:700;color:#F5A623">${rupiah(o.total)}</td></tr>`;}).join("")}</tbody></table></div>`:""}
${exps.length?`<hr class="div"><div class="sec"><div class="st">Pengeluaran</div><table><thead><tr><th>Keterangan</th><th>Jumlah</th></tr></thead><tbody>
${exps.map(e=>`<tr><td>${e.description}</td><td style="color:#E05252;font-weight:700">− ${rupiah(e.amount)}</td></tr>`).join("")}</tbody></table></div>`:""}
<div class="ft">Dicetak dari Angkringan. — ${new Date().toLocaleString("id-ID")}</div>
</body></html>`;
  const w = window.open("","_blank","width=680,height=860");
  if(w){w.document.write(html);w.document.close();setTimeout(()=>w.print(),350);}
};

// ── PDF Bulanan ──
const printMonthPDF = (monthKey, monthLabel, orders, expenses, kasirs) => {
  const paid = orders.filter(o=>o.status==="paid"&&o.paidAt?.startsWith(monthKey));
  const exps = expenses.filter(e=>e.date?.startsWith(monthKey));
  const pemasukan = paid.reduce((s,o)=>s+o.total,0);
  const pengeluaran = exps.reduce((s,e)=>s+e.amount,0);
  const kas = pemasukan - pengeluaran;
  // Group by day
  const dayMap = {};
  paid.forEach(o=>{const d=o.paidAt;if(!dayMap[d])dayMap[d]={pemasukan:0,pengeluaran:0,orders:[]};dayMap[d].pemasukan+=o.total;dayMap[d].orders.push(o);});
  exps.forEach(e=>{if(!dayMap[e.date])dayMap[e.date]={pemasukan:0,pengeluaran:0,orders:[]};dayMap[e.date].pengeluaran+=e.amount;});
  const days = Object.keys(dayMap).sort();
  const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Laporan ${monthLabel}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;padding:28px;max-width:620px;margin:0 auto;color:#1a1a1a}
.hd{text-align:center;border-bottom:2px solid #F5A623;padding-bottom:14px;margin-bottom:22px}
.hd h1{font-size:20px;font-weight:800;color:#0C0906}.hd .br{color:#F5A623}.hd .dt{font-size:12px;color:#666;margin-top:5px}
.sec{margin-bottom:20px}.st{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#888;margin-bottom:8px}
.row{display:flex;justify-content:space-between;align-items:center;padding:9px 12px;border-radius:7px;margin-bottom:5px}
.rin{background:#f0fdf4;border-left:3px solid #4CAF7D}.rout{background:#fff5f5;border-left:3px solid #E05252}.rkas{background:#fffbeb;border-left:3px solid #F5A623}
.lbl{font-size:13px;color:#444}.val{font-size:15px;font-weight:800}.vin{color:#4CAF7D}.vout{color:#E05252}.vkas{color:#F5A623}
table{width:100%;border-collapse:collapse;font-size:12px}th{background:#f9f5f0;text-align:left;padding:7px 10px;font-weight:700;color:#555;border-bottom:1px solid #e5e5e5}
td{padding:7px 10px;border-bottom:1px solid #f0f0f0;color:#333}
.kb{background:#fef3c7;color:#92400e;border-radius:3px;padding:1px 6px;font-size:10px;font-weight:600}
.div{border:none;border-top:1px dashed #ddd;margin:16px 0}
.ft{margin-top:24px;text-align:center;font-size:10px;color:#aaa;border-top:1px solid #eee;padding-top:12px}
</style></head><body>
<div class="hd"><h1>Angkringan<span class="br">.</span> Laporan Bulanan</h1><p class="dt">${monthLabel}</p></div>
<div class="sec"><div class="st">Ringkasan Keuangan</div>
<div class="row rin"><span class="lbl">💰 Total Pemasukan</span><span class="val vin">${rupiah(pemasukan)}</span></div>
<div class="row rout"><span class="lbl">🧾 Total Pengeluaran</span><span class="val vout">− ${rupiah(pengeluaran)}</span></div>
<div class="row rkas"><span class="lbl">🏦 Kas Bersih</span><span class="val vkas">${rupiah(kas)}</span></div></div>
<hr class="div">
<div class="sec"><div class="st">Rekap Per Hari (${days.length} hari)</div>
<table><thead><tr><th>Tanggal</th><th>Pesanan</th><th>Pemasukan</th><th>Pengeluaran</th><th>Kas</th></tr></thead><tbody>
${days.map(d=>{const dd=dayMap[d];const k=dd.pemasukan-dd.pengeluaran;
  const dateStr=new Date(d+"T00:00:00").toLocaleDateString("id-ID",{weekday:"short",day:"numeric",month:"short"});
  return`<tr><td>${dateStr}</td><td>${dd.orders.length} pesanan</td><td style="color:#4CAF7D;font-weight:700">${rupiah(dd.pemasukan)}</td><td style="color:#E05252">${dd.pengeluaran>0?"−"+rupiah(dd.pengeluaran):"-"}</td><td style="font-weight:800;color:${k>=0?"#F5A623":"#E05252"}">${rupiah(k)}</td></tr>`;}).join("")}
</tbody></table></div>
<hr class="div">
${paid.length?`<div class="sec"><div class="st">Semua Pesanan (${paid.length})</div>
<table><thead><tr><th>#</th><th>Tgl</th><th>Pelanggan</th><th>Item</th><th>Kasir</th><th>Total</th></tr></thead><tbody>
${paid.sort((a,b)=>a.paidAt.localeCompare(b.paidAt)).map((o,i)=>{
  const k=kasirs.find(k=>k.id===o.kasirId);
  const ds=new Date(o.paidAt+"T00:00:00").toLocaleDateString("id-ID",{day:"numeric",month:"short"});
  return`<tr><td>${i+1}</td><td>${ds}</td><td>${o.customerName}</td><td style="font-size:10px;color:#666">${o.items.map(i=>`${i.name}×${i.qty}`).join(", ")}</td><td><span class="kb">${k?.name||"-"}</span></td><td style="font-weight:700;color:#F5A623">${rupiah(o.total)}</td></tr>`;}).join("")}
</tbody></table></div>`:""}
${exps.length?`<hr class="div"><div class="sec"><div class="st">Pengeluaran (${exps.length})</div>
<table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Jumlah</th></tr></thead><tbody>
${exps.sort((a,b)=>a.date.localeCompare(b.date)).map(e=>{
  const ds=new Date(e.date+"T00:00:00").toLocaleDateString("id-ID",{day:"numeric",month:"short"});
  return`<tr><td>${ds}</td><td>${e.description}</td><td style="color:#E05252;font-weight:700">−${rupiah(e.amount)}</td></tr>`;}).join("")}
</tbody></table></div>`:""}
<div class="ft">Dicetak dari Angkringan. — ${new Date().toLocaleString("id-ID")}</div>
</body></html>`;
  const w=window.open("","_blank","width=720,height=900");
  if(w){w.document.write(html);w.document.close();setTimeout(()=>w.print(),350);}
};

// ── UI Atoms ──
const Card = ({children,style={},className=""}) => (
  <div className={className} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:16,...style}}>{children}</div>
);
const Btn = ({children,onClick,v="primary",sm,disabled,full,style={}}) => {
  const vs={primary:{background:"var(--amber)",color:"#fff"},
    ghost:{background:"transparent",color:"var(--text)",border:"1px solid var(--border)"},
    success:{background:"var(--green-dim)",color:"var(--green)",border:"1px solid rgba(76,175,125,0.25)"},
    danger:{background:"var(--red-dim)",color:"var(--red)",border:"1px solid rgba(224,82,82,0.25)"},
    dark:{background:"var(--card2)",color:"var(--text)",border:"1px solid var(--border)"},
    pdf:{background:"var(--blue-dim)",color:"var(--blue)",border:"1px solid rgba(91,141,239,0.25)"},
  };
  return <button onClick={disabled?undefined:onClick} style={{
    ...vs[v],borderRadius:12,fontWeight:600,fontSize:sm?13:15,
    padding:sm?"7px 13px":"12px 20px",display:"flex",alignItems:"center",
    justifyContent:"center",gap:8,opacity:disabled?0.45:1,
    cursor:disabled?"not-allowed":"pointer",width:full?"100%":undefined,transition:"opacity 0.15s",...style
  }}>{children}</button>;
};
const TxtInput = ({label,value,onChange,placeholder,type="text",prefix}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label&&<label style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</label>}
    <div style={{display:"flex",alignItems:"center",background:"var(--card2)",border:"1px solid var(--border)",borderRadius:10,overflow:"hidden"}}>
      {prefix&&<span style={{padding:"0 6px 0 14px",color:"var(--muted)",fontSize:14,flexShrink:0}}>{prefix}</span>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{paddingLeft:prefix?"4px":"14px"}}/>
    </div>
  </div>
);
const CatBar = ({val,set}) => (
  <div style={{display:"flex",gap:7,overflowX:"auto",padding:"2px 0 4px",scrollbarWidth:"none"}}>
    {CATS.map(c=>(
      <button key={c} onClick={()=>set(c)} style={{padding:"5px 12px",borderRadius:99,whiteSpace:"nowrap",flexShrink:0,
        background:val===c?"var(--amber)":"var(--card2)",color:val===c?"#fff":"var(--muted)",
        border:`1px solid ${val===c?"var(--amber)":"var(--border)"}`,fontSize:13,fontWeight:600,transition:"all 0.15s"
      }}>{c}</button>
    ))}
  </div>
);
const KasirChip = ({kasirId,kasirs}) => {
  const idx=kasirs.findIndex(k=>k.id===kasirId);
  const k=kasirs.find(k=>k.id===kasirId);
  if(!k)return null;
  return <span style={{background:KASIR_COLORS_DIM[idx%4],color:KASIR_COLORS[idx%4],border:`1px solid ${KASIR_COLORS[idx%4]}33`,
    fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99,display:"inline-flex",alignItems:"center",gap:4}}>
    <span style={{width:5,height:5,borderRadius:"50%",background:KASIR_COLORS[idx%4],flexShrink:0}}/>{k.name}
  </span>;
};
const BackBtn = ({onClick}) => (
  <button onClick={onClick} style={{color:"var(--amber)",display:"flex",alignItems:"center",gap:6,
    fontSize:13,fontWeight:600,background:"none",border:"none",marginBottom:14}}>
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5 M12 19l-7-7 7-7"/>
    </svg>
    Kembali
  </button>
);

// ── Keuangan Sub-Views ──

// Level 1: Pilih Bulan
const MonthList = ({months, onSelect, getMonthSummary}) => (
  <div style={{display:"flex",flexDirection:"column",gap:9}}>
    {months.map((m,i)=>{
      const {pemasukan,pengeluaran,kas} = getMonthSummary(m.key);
      const isThisMonth = m.key === `${today.getFullYear()}-${pad(today.getMonth()+1)}`;
      return(
        <div key={m.key} className={`fu s${Math.min(i+1,5)}`} onClick={()=>onSelect(m)}
          style={{background:"var(--card)",border:`1px solid ${isThisMonth?"rgba(245,166,35,0.3)":"var(--border)"}`,
            borderRadius:14,padding:"14px 16px",cursor:"pointer",transition:"border-color 0.15s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <p style={{color:isThisMonth?"var(--amber)":"var(--cream)",fontWeight:700,fontSize:16}}>{m.label}</p>
              {isThisMonth&&<span style={{background:"var(--amber-dim)",color:"var(--amber)",fontSize:10,fontWeight:600,
                padding:"2px 7px",borderRadius:99,marginTop:4,display:"inline-block"}}>Bulan ini</span>}
            </div>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1,background:"var(--green-dim)",borderRadius:9,padding:"8px 10px",textAlign:"center"}}>
              <p style={{color:"var(--muted)",fontSize:10,marginBottom:2}}>Masuk</p>
              <p style={{color:"var(--green)",fontWeight:700,fontSize:12}}>{rupiah(pemasukan)}</p>
            </div>
            <div style={{flex:1,background:"var(--red-dim)",borderRadius:9,padding:"8px 10px",textAlign:"center"}}>
              <p style={{color:"var(--muted)",fontSize:10,marginBottom:2}}>Keluar</p>
              <p style={{color:"var(--red)",fontWeight:700,fontSize:12}}>{rupiah(pengeluaran)}</p>
            </div>
            <div style={{flex:1,background:kas>=0?"var(--amber-dim)":"var(--red-dim)",borderRadius:9,padding:"8px 10px",textAlign:"center"}}>
              <p style={{color:"var(--muted)",fontSize:10,marginBottom:2}}>Kas</p>
              <p style={{color:kas>=0?"var(--amber)":"var(--red)",fontWeight:700,fontSize:12}}>{rupiah(kas)}</p>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

// Level 2: Pilih Hari dalam Bulan
const DayList = ({month, days, tab, onSelect, getDaySummary}) => (
  <div style={{display:"flex",flexDirection:"column",gap:8}}>
    {/* Month summary */}
    <Card style={{marginBottom:6,background:"var(--card2)"}}>
      <p style={{color:"var(--amber)",fontWeight:700,fontSize:14,marginBottom:8}}>{month.label}</p>
      <p style={{color:"var(--muted)",fontSize:12}}>{days.length} hari tercatat</p>
    </Card>
    {days.map((ds,i)=>{
      const {pemasukan,pengeluaran,kas} = getDaySummary(ds);
      const isToday = ds===todayStr;
      const val = tab==="pemasukan"?pemasukan : tab==="pengeluaran"?pengeluaran : kas;
      const color = tab==="pemasukan"?"var(--green)" : tab==="pengeluaran"?"var(--red)" : kas>=0?"var(--amber)":"var(--red)";
      return(
        <div key={ds} className={`fu s${Math.min(i+1,5)}`} onClick={()=>onSelect(ds)}
          style={{background:"var(--card)",border:`1px solid ${isToday?"rgba(245,166,35,0.25)":"var(--border)"}`,
            borderRadius:12,padding:"13px 15px",cursor:"pointer",
            display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <p style={{color:isToday?"var(--amber)":"var(--text)",fontWeight:700,fontSize:14}}>
              {isToday?"Hari Ini":fmtShort(ds)}
            </p>
            <p style={{color:"var(--muted)",fontSize:11,marginTop:2}}>{fmtFull(ds)}</p>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <p className="sora" style={{color,fontWeight:800,fontSize:15}}>{rupiah(val)}</p>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>
      );
    })}
  </div>
);

// Level 3: Detail Hari
const DayDetail = ({date, orders, expenses, kasirs, onBack}) => {
  const [showAddExp, setShowAddExp] = useState(false);
  const [desc, setDesc] = useState("");
  const [amt, setAmt] = useState("");
  const [ok, setOk] = useState(false);
  const [addExpenses, setAddExpenses] = useState([]);

  const paid = orders.filter(o=>o.status==="paid"&&o.paidAt===date);
  const allExps = [...expenses.filter(e=>e.date===date), ...addExpenses];
  const pemasukan = paid.reduce((s,o)=>s+o.total,0);
  const pengeluaran = allExps.reduce((s,e)=>s+e.amount,0);
  const kas = pemasukan - pengeluaran;
  const isToday = date===todayStr;

  const saveExp = () => {
    if(!desc||!amt)return;
    setAddExpenses(p=>[...p,{id:genId("AE"),description:desc,amount:parseInt(amt),date}]);
    setDesc("");setAmt("");setOk(true);setTimeout(()=>setOk(false),1800);setShowAddExp(false);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {/* Date + PDF */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <p style={{color:isToday?"var(--amber)":"var(--cream)",fontWeight:700,fontSize:16}}>
            {isToday?"Hari Ini":fmtShort(date)}
          </p>
          <p style={{color:"var(--muted)",fontSize:12,marginTop:2}}>{fmtFull(date)}</p>
        </div>
        <button onClick={()=>printDayPDF(date,[...orders,...(addExpenses.length?[]:[])]
          .filter(o=>o.status==="paid"&&o.paidAt===date).length>=0?orders:[...orders],
          [...expenses,...addExpenses],kasirs)}
          style={{background:"var(--blue-dim)",border:"1px solid rgba(91,141,239,0.25)",
            borderRadius:12,padding:"9px 14px",color:"var(--blue)",
            display:"flex",alignItems:"center",gap:7,fontWeight:700,fontSize:13}}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3"/>
          </svg>
          PDF
        </button>
      </div>

      {/* Summary bar */}
      <div style={{display:"flex",gap:8}}>
        {[{label:"Pemasukan",val:pemasukan,color:"var(--green)",bg:"var(--green-dim)"},
          {label:"Pengeluaran",val:pengeluaran,color:"var(--red)",bg:"var(--red-dim)"},
          {label:"Kas",val:kas,color:kas>=0?"var(--amber)":"var(--red)",bg:kas>=0?"var(--amber-dim)":"var(--red-dim)"},
        ].map(s=>(
          <div key={s.label} style={{flex:1,background:s.bg,borderRadius:11,padding:"9px 8px",textAlign:"center"}}>
            <p style={{color:"var(--muted)",fontSize:10,marginBottom:3}}>{s.label}</p>
            <p className="sora" style={{color:s.color,fontWeight:800,fontSize:12}}>{rupiah(s.val)}</p>
          </div>
        ))}
      </div>

      {/* Daftar Pesanan */}
      <div>
          <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:9}}>
            Pesanan ({paid.length})
          </p>
          {paid.length===0?(
            <Card style={{textAlign:"center",padding:20}}><p style={{color:"var(--muted)",fontSize:13}}>Tidak ada pesanan</p></Card>
          ):paid.map((o,idx)=>{
            const kasir = kasirs.find(k=>k.id===o.kasirId);
            const kasirIdx = kasirs.findIndex(k=>k.id===o.kasirId);
            return(
              <div key={o.id} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:11,
                padding:"11px 13px",marginBottom:7}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{width:22,height:22,borderRadius:6,background:"var(--card2)",border:"1px solid var(--border)",
                      fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",
                      color:"var(--muted)",flexShrink:0}}>{idx+1}</span>
                    <p style={{color:"var(--text)",fontWeight:600,fontSize:14}}>{o.customerName}</p>
                  </div>
                  <span style={{color:"var(--green)",fontWeight:700,fontSize:14,flexShrink:0,marginLeft:8}}>{rupiah(o.total)}</span>
                </div>
                <p style={{color:"var(--muted)",fontSize:11,marginBottom:6,lineHeight:1.4,paddingLeft:30}}>
                  {o.items.map(i=>`${i.name} ×${i.qty}`).join(" · ")}
                </p>
                <div style={{paddingLeft:30}}>
                  <KasirChip kasirId={o.kasirId} kasirs={kasirs}/>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
            <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>
              Pengeluaran ({allExps.length})
            </p>
            {isToday&&(
              <button onClick={()=>setShowAddExp(!showAddExp)} style={{
                background:"var(--amber)",color:"#fff",borderRadius:9,
                padding:"5px 11px",fontWeight:700,fontSize:12,display:"flex",alignItems:"center",gap:4
              }}>+ Tambah</button>
            )}
          </div>
          {showAddExp&&(
            <Card className="fi" style={{marginBottom:10,display:"flex",flexDirection:"column",gap:10}}>
              <TxtInput label="Keterangan" value={desc} onChange={setDesc} placeholder="Beli kopi, gula..."/>
              <TxtInput label="Jumlah" type="number" value={amt} onChange={setAmt} placeholder="50000" prefix="Rp"/>
              {ok&&<p style={{color:"var(--green)",fontSize:12,textAlign:"center"}}>✓ Tersimpan!</p>}
              <Btn onClick={saveExp} disabled={!desc||!amt} full sm>Simpan</Btn>
            </Card>
          )}
          {allExps.length===0?(
            <Card style={{textAlign:"center",padding:20}}><p style={{color:"var(--muted)",fontSize:13}}>Tidak ada pengeluaran</p></Card>
          ):allExps.map(e=>(
            <div key={e.id} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:11,
              padding:"11px 13px",marginBottom:7,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <p style={{color:"var(--text)",fontSize:13}}>{e.description}</p>
              <span style={{color:"var(--red)",fontWeight:700,fontSize:13,flexShrink:0,marginLeft:8}}>−{rupiah(e.amount)}</span>
            </div>
          ))}
        </div>
    </div>
  );
};

// ── Keuangan Main ──
const Keuangan = ({orders, expenses, setExpenses, kasirs}) => {
  const [selMonth, setSelMonth] = useState(null);
  const [selDay, setSelDay] = useState(null);

  const allDates = useMemo(()=>{
    const paidDates = orders.filter(o=>o.status==="paid"&&o.paidAt).map(o=>o.paidAt);
    const expDates = expenses.map(e=>e.date);
    return [...new Set([...paidDates,...expDates])].sort((a,b)=>b.localeCompare(a));
  },[orders,expenses]);

  const months = useMemo(()=>getMonths(allDates),[allDates]);

  const daysInMonth = useMemo(()=>{
    if(!selMonth) return [];
    return allDates.filter(d=>d.startsWith(selMonth.key));
  },[selMonth,allDates]);

  const getMonthSummary = (monthKey) => {
    const pemasukan = orders.filter(o=>o.status==="paid"&&o.paidAt?.startsWith(monthKey)).reduce((s,o)=>s+o.total,0);
    const pengeluaran = expenses.filter(e=>e.date?.startsWith(monthKey)).reduce((s,e)=>s+e.amount,0);
    return {pemasukan, pengeluaran, kas: pemasukan-pengeluaran};
  };
  const getDaySummary = (ds) => {
    const pemasukan = orders.filter(o=>o.status==="paid"&&o.paidAt===ds).reduce((s,o)=>s+o.total,0);
    const pengeluaran = expenses.filter(e=>e.date===ds).reduce((s,e)=>s+e.amount,0);
    return {pemasukan, pengeluaran, kas: pemasukan-pengeluaran};
  };

  // Breadcrumb
  const crumb = selDay ? fmtShort(selDay) : selMonth ? selMonth.label : null;

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Breadcrumb nav */}
      {crumb&&(
        <div style={{padding:"10px 18px 0",borderBottom:"1px solid var(--border)",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,paddingBottom:10,fontSize:12,color:"var(--muted)"}}>
            <button onClick={()=>{setSelMonth(null);setSelDay(null);}} style={{color:"var(--amber)",fontWeight:600,fontSize:12}}>Semua Bulan</button>
            {selMonth&&<><span>›</span>
              {selDay?(
                <button onClick={()=>setSelDay(null)} style={{color:"var(--amber)",fontWeight:600,fontSize:12}}>{selMonth.label}</button>
              ):<span style={{color:"var(--text)"}}>{selMonth.label}</span>}
            </>}
            {selDay&&<><span>›</span><span style={{color:"var(--text)"}}>{fmtShort(selDay)}</span></>}
          </div>
        </div>
      )}

      <div style={{flex:1,overflowY:"auto",padding:"14px 18px"}}>
        {/* Level 3: Day Detail */}
        {selDay?(
          <div className="fi">
            <BackBtn onClick={()=>setSelDay(null)}/>
            <DayDetail date={selDay} orders={orders} expenses={expenses}
              kasirs={kasirs} onBack={()=>setSelDay(null)}/>
          </div>
        /* Level 2: Month Detail */
        ):selMonth?(
          <div className="fi">
            <BackBtn onClick={()=>setSelMonth(null)}/>
            {/* Month header + PDF */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div>
                <p style={{color:"var(--amber)",fontWeight:700,fontSize:17}}>{selMonth.label}</p>
                <p style={{color:"var(--muted)",fontSize:12,marginTop:2}}>{daysInMonth.length} hari tercatat</p>
              </div>
              <button onClick={()=>printMonthPDF(selMonth.key, selMonth.label, orders, expenses, kasirs)}
                style={{background:"var(--blue-dim)",border:"1px solid rgba(91,141,239,0.25)",
                  borderRadius:12,padding:"9px 14px",color:"var(--blue)",
                  display:"flex",alignItems:"center",gap:7,fontWeight:700,fontSize:13,flexShrink:0}}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3"/>
                </svg>
                PDF
              </button>
            </div>
            {/* Month summary */}
            {(()=>{const {pemasukan,pengeluaran,kas}=getMonthSummary(selMonth.key);return(
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                {[{label:"Pemasukan",val:pemasukan,color:"var(--green)",bg:"var(--green-dim)"},
                  {label:"Pengeluaran",val:pengeluaran,color:"var(--red)",bg:"var(--red-dim)"},
                  {label:"Kas",val:kas,color:kas>=0?"var(--amber)":"var(--red)",bg:kas>=0?"var(--amber-dim)":"var(--red-dim)"},
                ].map(s=>(
                  <div key={s.label} style={{flex:1,background:s.bg,borderRadius:11,padding:"9px 8px",textAlign:"center"}}>
                    <p style={{color:"var(--muted)",fontSize:10,marginBottom:3}}>{s.label}</p>
                    <p className="sora" style={{color:s.color,fontWeight:800,fontSize:12}}>{rupiah(s.val)}</p>
                  </div>
                ))}
              </div>
            );})()}
            {/* Day list */}
            {daysInMonth.length===0?(
              <Card style={{textAlign:"center",padding:28}}>
                <p style={{color:"var(--muted)"}}>Tidak ada data di bulan ini</p>
              </Card>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {daysInMonth.map((ds,i)=>{
                  const {pemasukan,pengeluaran,kas}=getDaySummary(ds);
                  const isToday=ds===todayStr;
                  return(
                    <div key={ds} className={`fu s${Math.min(i+1,5)}`} onClick={()=>setSelDay(ds)}
                      style={{background:"var(--card)",border:`1px solid ${isToday?"rgba(245,166,35,0.25)":"var(--border)"}`,
                        borderRadius:12,padding:"13px 15px",cursor:"pointer"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <div>
                          <p style={{color:isToday?"var(--amber)":"var(--text)",fontWeight:700,fontSize:14}}>
                            {isToday?"Hari Ini":fmtShort(ds)}
                          </p>
                          <p style={{color:"var(--muted)",fontSize:11,marginTop:1}}>{fmtFull(ds)}</p>
                        </div>
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </div>
                      <div style={{display:"flex",gap:7}}>
                        <div style={{flex:1,background:"var(--green-dim)",borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                          <p style={{color:"var(--muted)",fontSize:9,marginBottom:1}}>Masuk</p>
                          <p style={{color:"var(--green)",fontWeight:700,fontSize:11}}>{rupiah(pemasukan)}</p>
                        </div>
                        <div style={{flex:1,background:"var(--red-dim)",borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                          <p style={{color:"var(--muted)",fontSize:9,marginBottom:1}}>Keluar</p>
                          <p style={{color:"var(--red)",fontWeight:700,fontSize:11}}>{rupiah(pengeluaran)}</p>
                        </div>
                        <div style={{flex:1,background:kas>=0?"var(--amber-dim)":"var(--red-dim)",borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                          <p style={{color:"var(--muted)",fontSize:9,marginBottom:1}}>Kas</p>
                          <p style={{color:kas>=0?"var(--amber)":"var(--red)",fontWeight:700,fontSize:11}}>{rupiah(kas)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        /* Level 1: Month List */
        ):(
          <div className="fi">
            <div style={{marginBottom:14}}>
              <p style={{color:"var(--muted)",fontSize:12}}>Pilih bulan untuk melihat detail & laporan PDF</p>
            </div>
            {months.length===0?(
              <Card style={{textAlign:"center",padding:28}}>
                <p style={{color:"var(--muted)"}}>Belum ada data</p>
              </Card>
            ):(
              <MonthList months={months} onSelect={setSelMonth} getMonthSummary={getMonthSummary}/>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Login ──
const Login = ({onLogin, kasirs}) => {
  const [role,setRole]=useState(null);
  const [selKasir,setSelKasir]=useState(null);
  const [pw,setPw]=useState("");
  const [err,setErr]=useState("");
  const go=()=>{
    if(role==="owner"){if(pw==="owner123")onLogin({role:"owner",id:"owner",name:"Kang Bro"});
      else{setErr("Password salah!");setTimeout(()=>setErr(""),1800);}}
    else{const k=kasirs.length===1?kasirs[0]:kasirs.find(k=>k.id===selKasir);
      if(k&&pw===k.password)onLogin({role:"kasir",id:k.id,name:k.name});
      else{setErr("Password salah!");setTimeout(()=>setErr(""),1800);}}
  };
  const canProceed=role==="owner"||(role==="kasir"&&(kasirs.length===1||selKasir));
  return(
    <div style={{minHeight:"100%",display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",padding:24,background:"var(--bg)",overflow:"hidden",position:"relative"}}>
      <div style={{position:"absolute",top:-100,right:-100,width:280,height:280,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(212,130,10,0.08) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div className="fu" style={{width:"100%",maxWidth:360}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:68,height:68,borderRadius:18,background:"var(--amber-dim)",border:"1px solid rgba(245,166,35,0.2)",
            display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/>
            </svg>
          </div>
          <h1 className="sora" style={{fontSize:26,fontWeight:800,color:"var(--text)",letterSpacing:"-0.5px"}}>
            Angkringan<span style={{color:"var(--amber)"}}>.</span></h1>
          <p style={{color:"var(--muted)",fontSize:13,marginTop:4}}>Sistem Kasir & Manajemen</p>
        </div>
        <Card style={{padding:22}}>
          <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:12}}>Masuk sebagai</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            {["owner","kasir"].map(r=>(
              <button key={r} onClick={()=>{setRole(r);setSelKasir(null);setPw("");setErr("");}} style={{
                padding:"13px 8px",borderRadius:12,background:role===r?"var(--amber-dim)":"var(--card2)",
                border:`1px solid ${role===r?"rgba(245,166,35,0.4)":"var(--border)"}`,
                color:role===r?"var(--amber)":"var(--muted)",fontWeight:600,fontSize:14,cursor:"pointer",transition:"all 0.2s",
                display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d={r==="owner"?"M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5":"M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"}/>
                </svg>
                {r.charAt(0).toUpperCase()+r.slice(1)}
              </button>
            ))}
          </div>
          {role==="kasir"&&kasirs.length>1&&(
            <div className="fi" style={{marginBottom:14}}>
              <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Pilih Kasir</p>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {kasirs.map((k,i)=>(
                  <button key={k.id} onClick={()=>setSelKasir(k.id)} style={{
                    padding:"11px 14px",borderRadius:10,textAlign:"left",
                    background:selKasir===k.id?KASIR_COLORS_DIM[i%4]:"var(--card2)",
                    border:`1px solid ${selKasir===k.id?KASIR_COLORS[i%4]+"44":"var(--border)"}`,
                    color:selKasir===k.id?KASIR_COLORS[i%4]:"var(--text)",
                    fontWeight:600,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:selKasir===k.id?KASIR_COLORS[i%4]:"var(--muted)",flexShrink:0}}/>
                    {k.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {role==="kasir"&&kasirs.length===1&&(
            <div className="fi" style={{marginBottom:10,padding:"10px 12px",background:"var(--card2)",borderRadius:10}}>
              <p style={{color:"var(--muted)",fontSize:12}}>Login sebagai <strong style={{color:"var(--text)"}}>{kasirs[0].name}</strong></p>
            </div>
          )}
          {canProceed&&(
            <div className="fi" style={{display:"flex",flexDirection:"column",gap:12}}>
              <TxtInput label="Password" type="password" value={pw} onChange={setPw} placeholder="Masukkan password"/>
              {err&&<p style={{color:"var(--red)",fontSize:13,textAlign:"center"}}>{err}</p>}
              <p style={{color:"var(--muted)",fontSize:11,textAlign:"center"}}>owner123 · adi123 · dina123</p>
              <Btn onClick={go} disabled={!pw} full>Masuk →</Btn>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// ── Nav ──
const Nav = ({screen,set,role}) => {
  const ownerItems=[
    {k:"home",label:"Home",d:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10"},
    {k:"pos",label:"Kasir",d:"M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-3 M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M9 7h6"},
    {k:"tagihan",label:"Tagihan",d:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"},
    {k:"keuangan",label:"Keuangan",d:"M12 2v20 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"},
  ];
  const kasirItems=[
    {k:"home",label:"Home",d:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10"},
    {k:"pos",label:"Kasir",d:"M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-3 M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M9 7h6"},
    {k:"tagihan",label:"Tagihan",d:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"},
  ];
  const items = role==="owner"?ownerItems:kasirItems;
  return(
    <div style={{position:"sticky",bottom:0,background:"rgba(253,248,242,0.97)",backdropFilter:"blur(20px)",
      borderTop:"1px solid var(--border)",display:"flex",padding:"8px 0 16px",zIndex:100,flexShrink:0}}>
      {items.map(({k,label,d})=>{
        const a=screen===k;
        return(
          <button key={k} onClick={()=>set(k)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
            gap:3,padding:"5px 0",color:a?"var(--amber)":"var(--muted)",transition:"color 0.15s"}}>
            <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2:1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d={d}/>
            </svg>
            <span style={{fontSize:10,fontWeight:a?700:400}}>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

// ── Header ──
const Hdr = ({title,sub,right}) => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
    padding:"13px 18px 10px",background:"rgba(253,248,242,0.96)",backdropFilter:"blur(16px)",
    borderBottom:"1px solid var(--border)",flexShrink:0}}>
    <div>
      <h2 className="sora" style={{fontSize:17,fontWeight:700,color:"var(--text)",letterSpacing:"-0.3px"}}>{title}</h2>
      {sub&&<p style={{fontSize:11,color:"var(--muted)",marginTop:1}}>{sub}</p>}
    </div>
    {right}
  </div>
);

const ChartTooltip = ({active,payload,label}) => {
  if(!active||!payload?.length)return null;
  return(<div style={{background:"var(--card2)",border:"1px solid var(--border)",borderRadius:10,padding:"8px 12px"}}>
    <p style={{color:"var(--muted)",fontSize:11,marginBottom:3}}>{label}</p>
    <p className="sora" style={{color:"var(--amber)",fontWeight:700,fontSize:14}}>{rupiah(payload[0].value)}</p>
  </div>);
};

const getTopMenus = (orders,n=3) => {
  const freq={};orders.forEach(o=>o.items.forEach(i=>{freq[i.name]=(freq[i.name]||0)+i.qty;}));
  return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,n);
};

// ── Dashboard ──
const Dashboard = ({orders,expenses,user,setScreen,target,setTarget,kasirs}) => {
  const [editTarget,setEditTarget]=useState(false);
  const [tmpTarget,setTmpTarget]=useState(String(target));
  const paidToday=orders.filter(o=>o.status==="paid"&&o.paidAt===todayStr);
  const openOrders=orders.filter(o=>o.status==="open");
  const pemasukan=paidToday.reduce((s,o)=>s+o.total,0);
  const pengeluaran=expenses.filter(e=>e.date===todayStr).reduce((s,e)=>s+e.amount,0);
  const bersih=pemasukan-pengeluaran;
  const progress=Math.min((pemasukan/target)*100,100);
  const topAllTime=getTopMenus(orders.filter(o=>o.status==="paid"),5);
  const chartData=useMemo(()=>Array.from({length:7},(_,i)=>{
    const d=new Date(today);d.setDate(d.getDate()-(6-i));const ds=fmt(d);
    return {day:d.toLocaleDateString("id-ID",{weekday:"short"}),
      total:orders.filter(o=>o.status==="paid"&&o.paidAt===ds).reduce((s,o)=>s+o.total,0),isToday:ds===todayStr};
  }),[orders]);
  return(
    <div style={{flex:1,overflowY:"auto",padding:"16px 18px 12px"}}>
      <div style={{marginBottom:16}}>
        <p style={{color:"var(--muted)",fontSize:12}}>{today.toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long"})}</p>
        <h1 className="sora fu" style={{fontSize:20,fontWeight:800,color:"var(--text)",marginTop:2,letterSpacing:"-0.4px"}}>Halo, {user.name.split(" ")[0]}! ☕</h1>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        {[{label:"Pemasukan",val:pemasukan,color:"var(--green)",bg:"var(--green-dim)"},
          {label:"Pengeluaran",val:pengeluaran,color:"var(--red)",bg:"var(--red-dim)"},
          {label:"Kas Bersih",val:bersih,color:bersih>=0?"var(--amber)":"var(--red)",bg:bersih>=0?"var(--amber-dim)":"var(--red-dim)"},
        ].map((s,i)=>(
          <div key={s.label} className={`fu s${i+1}`} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:13,
            padding:"13px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:11}}>
              <div style={{width:36,height:36,borderRadius:10,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{width:9,height:9,borderRadius:"50%",background:s.color}}/>
              </div>
              <span style={{color:"var(--muted)",fontSize:14}}>{s.label}</span>
            </div>
            <span className="sora" style={{fontSize:15,fontWeight:700,color:s.color}}>{rupiah(s.val)}</span>
          </div>
        ))}
      </div>
      <Card className="fu s4" style={{marginTop:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <p style={{color:"var(--muted)",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Target Omzet Harian</p>
            {!editTarget&&<p className="sora" style={{color:"var(--text)",fontWeight:700,fontSize:15,marginTop:2}}>{rupiah(target)}</p>}
          </div>
          {user.role==="owner"&&(editTarget?(
            <div style={{display:"flex",gap:7,alignItems:"center"}}>
              <div style={{background:"var(--card2)",border:"1px solid var(--border)",borderRadius:8,overflow:"hidden",width:110}}>
                <input type="number" value={tmpTarget} onChange={e=>setTmpTarget(e.target.value)} style={{padding:"6px 10px",fontSize:14}}/>
              </div>
              <button onClick={()=>{setTarget(parseInt(tmpTarget)||target);setEditTarget(false);}} style={{color:"var(--green)",fontWeight:700,fontSize:13}}>OK</button>
            </div>
          ):(
            <button onClick={()=>{setTmpTarget(String(target));setEditTarget(true);}}
              style={{color:"var(--muted)",fontSize:12,border:"1px solid var(--border)",borderRadius:8,padding:"5px 10px"}}>Edit</button>
          ))}
        </div>
        <div style={{background:"var(--card2)",borderRadius:99,height:8,overflow:"hidden"}}>
          <div style={{width:`${progress}%`,height:"100%",borderRadius:99,background:progress>=100?"var(--green)":"var(--amber)",transition:"width 0.5s ease"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
          <span style={{color:"var(--muted)",fontSize:12}}>{Math.round(progress)}% tercapai</span>
          <span style={{color:"var(--muted)",fontSize:12}}>Sisa {rupiah(Math.max(target-pemasukan,0))}</span>
        </div>
      </Card>
      {topAllTime.length>0&&(
        <Card className="fu s5" style={{marginTop:12}}>
          <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>⭐ Menu Terlaku Sepanjang Masa</p>
          {topAllTime.map(([name,qty],i)=>(
            <div key={name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"7px 0",borderBottom:i<topAllTime.length-1?"1px solid var(--border)":"none"}}>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{width:22,height:22,borderRadius:6,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",
                  background:i===0?"var(--amber)":"var(--amber-dim)",color:i===0?"#fff":"var(--amber)",flexShrink:0}}>{i+1}</span>
                <span style={{color:"var(--text)",fontSize:13}}>{name}</span>
              </div>
              <span style={{color:"var(--amber)",fontWeight:700}}>{qty}x</span>
            </div>
          ))}
        </Card>
      )}
      <Card style={{marginTop:12,padding:"16px 12px 12px"}}>
        <p style={{color:"var(--muted)",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:12,paddingLeft:4}}>Pemasukan 7 Hari Terakhir</p>
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={chartData} barCategoryGap="25%">
            <XAxis dataKey="day" tick={{fill:"var(--muted)",fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip content={<ChartTooltip/>} cursor={{fill:"rgba(245,166,35,0.05)"}}/>
            <Bar dataKey="total" radius={[6,6,0,0]}>
              {chartData.map((e,i)=>(<Cell key={i} fill={e.isToday?"var(--amber)":"rgba(245,166,35,0.28)"}/>))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      {openOrders.length>0&&(
        <div style={{marginTop:14}}>
          <p style={{fontSize:12,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:9}}>
            Belum Bayar ({openOrders.length})</p>
          {openOrders.map(o=>(
            <div key={o.id} onClick={()=>setScreen("tagihan")} style={{background:"var(--card)",border:"1px solid var(--border)",
              borderRadius:12,padding:"11px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",cursor:"pointer",alignItems:"center"}}>
              <div>
                <p style={{color:"var(--text)",fontWeight:600}}>{o.customerName}</p>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                  <p style={{color:"var(--muted)",fontSize:12}}>{o.items.length} item</p>
                  <KasirChip kasirId={o.kasirId} kasirs={kasirs}/>
                </div>
              </div>
              <p style={{color:"var(--amber)",fontWeight:700}}>{rupiah(o.total)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── POS ──
const POS = ({menus,orders,setOrders,user}) => {
  const [step,setStep]=useState("name");
  const [name,setName]=useState("");
  const [cat,setCat]=useState("Semua");
  const [cart,setCart]=useState([]);
  const total=cart.reduce((s,c)=>s+c.price*c.qty,0);
  const qty=id=>cart.find(c=>c.menuId===id)?.qty||0;
  const add=m=>setCart(p=>{const e=p.find(c=>c.menuId===m.id);return e?p.map(c=>c.menuId===m.id?{...c,qty:c.qty+1}:c):[...p,{menuId:m.id,name:m.name,price:m.price,qty:1}];});
  const chg=(id,d)=>setCart(p=>p.map(c=>c.menuId===id?{...c,qty:c.qty+d}:c).filter(c=>c.qty>0));
  const reset=()=>{setStep("name");setName("");setCart([]);setCat("Semua");};
  const quickMenus=useMemo(()=>{
    const freq={};orders.forEach(o=>o.items.forEach(i=>{freq[i.menuId]=(freq[i.menuId]||0)+i.qty;}));
    return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,4)
      .map(([id])=>menus.find(m=>m.id===parseInt(id))).filter(m=>m?.available);
  },[orders,menus]);
  const filtered=menus.filter(m=>m.available&&(cat==="Semua"||m.category===cat));
  const submit=now=>{setOrders(p=>[...p,{id:genId("ORD"),customerName:name,status:now?"paid":"open",
    createdAt:todayStr,paidAt:now?todayStr:null,items:cart,total,kasirId:user.id}]);reset();};
  if(step==="name")return(<div style={{flex:1,overflowY:"auto",padding:"24px 18px",display:"flex",flexDirection:"column",gap:20}}>
    <div className="fu"><p style={{color:"var(--muted)",fontSize:12,textTransform:"uppercase",letterSpacing:"0.05em",fontWeight:600}}>Pesanan Baru</p>
      <h2 className="sora" style={{fontSize:20,fontWeight:800,color:"var(--text)",marginTop:3}}>Nama Pelanggan</h2></div>
    <div className="fu s1"><TxtInput label="Nama" value={name} onChange={setName} placeholder="Contoh: Budi, Sari..."/></div>
    <div className="fu s2"><Btn onClick={()=>setStep("menu")} disabled={!name.trim()} full>Pilih Menu →</Btn></div>
  </div>);
  if(step==="menu")return(<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
    <div style={{padding:"11px 18px 9px",borderBottom:"1px solid var(--border)",flexShrink:0}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
        <p style={{color:"var(--amber)",fontWeight:700,fontSize:14}}>{name}</p>
        <Btn v="ghost" sm onClick={reset}>Batal</Btn>
      </div>
      {quickMenus.length>0&&(<div style={{marginBottom:9}}>
        <p style={{color:"var(--muted)",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:7}}>⚡ Quick Order</p>
        <div style={{display:"flex",gap:7,overflowX:"auto",scrollbarWidth:"none",paddingBottom:2}}>
          {quickMenus.map(m=>{const q=qty(m.id);return(<div key={m.id} onClick={()=>add(m)} style={{flexShrink:0,
            background:q>0?"rgba(245,166,35,0.1)":"var(--card2)",border:`1px solid ${q>0?"rgba(245,166,35,0.3)":"var(--border)"}`,
            borderRadius:10,padding:"8px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
            {q>0&&<span style={{background:"var(--amber)",color:"#fff",borderRadius:"50%",width:18,height:18,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{q}</span>}
            <div><p style={{color:"var(--text)",fontWeight:600,fontSize:12,whiteSpace:"nowrap"}}>{m.name}</p>
              <p style={{color:"var(--amber)",fontWeight:700,fontSize:11}}>{rupiah(m.price)}</p></div>
          </div>);})}
        </div>
      </div>)}
      <CatBar val={cat} set={setCat}/>
    </div>
    <div style={{flex:1,overflowY:"auto",padding:"11px 18px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
      {filtered.map(m=>{const q=qty(m.id);return(<div key={m.id} style={{background:q>0?"rgba(245,166,35,0.07)":"var(--card)",
        border:`1px solid ${q>0?"rgba(245,166,35,0.3)":"var(--border)"}`,borderRadius:13,padding:"12px 10px"}}>
        <p style={{color:"var(--muted)",fontSize:10,marginBottom:3}}>{m.category}</p>
        <p style={{color:"var(--text)",fontWeight:600,fontSize:13,lineHeight:1.3,marginBottom:6}}>{m.name}</p>
        <p style={{color:"var(--amber)",fontWeight:700,fontSize:13,marginBottom:9}}>{rupiah(m.price)}</p>
        {q===0?(<button onClick={()=>add(m)} style={{width:"100%",padding:"7px",borderRadius:8,background:"var(--amber-dim)",
          color:"var(--amber)",border:"1px solid rgba(245,166,35,0.2)",fontSize:12,fontWeight:600}}>+ Tambah</button>):(
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button onClick={()=>chg(m.id,-1)} style={{width:28,height:28,borderRadius:7,background:"var(--card2)",border:"1px solid var(--border)",color:"var(--text)",fontSize:16}}>−</button>
            <span style={{color:"var(--amber)",fontWeight:700,fontSize:15}}>{q}</span>
            <button onClick={()=>chg(m.id,1)} style={{width:28,height:28,borderRadius:7,background:"var(--amber)",color:"#fff",fontSize:16,border:"none"}}>+</button>
          </div>)}
      </div>);})}
    </div>
    {cart.length>0&&(<div onClick={()=>setStep("confirm")} style={{margin:"0 18px 12px",background:"var(--amber)",borderRadius:13,
      padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",
      boxShadow:"0 6px 24px rgba(245,166,35,0.2)",flexShrink:0}}>
      <div style={{background:"rgba(0,0,0,0.15)",borderRadius:7,padding:"3px 10px"}}>
        <span style={{color:"#fff",fontWeight:700,fontSize:13}}>{cart.reduce((s,c)=>s+c.qty,0)} item</span>
      </div>
      <span style={{color:"#fff",fontWeight:700,fontSize:14}}>Konfirmasi →</span>
      <span className="sora" style={{color:"#fff",fontWeight:800,fontSize:14}}>{rupiah(total)}</span>
    </div>)}
  </div>);
  return(<div style={{flex:1,overflowY:"auto",padding:"18px",display:"flex",flexDirection:"column",gap:13}}>
    <div className="fu"><p style={{color:"var(--muted)",fontSize:12}}>Konfirmasi pesanan</p>
      <h2 className="sora" style={{fontSize:20,fontWeight:800,color:"var(--amber)"}}>{name}</h2></div>
    <Card className="fu s1">{cart.map((item,i)=>(
      <div key={item.menuId} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",
        borderBottom:i<cart.length-1?"1px solid var(--border)":"none"}}>
        <div><p style={{color:"var(--text)",fontWeight:500,fontSize:14}}>{item.name}</p>
          <p style={{color:"var(--muted)",fontSize:12}}>{item.qty} × {rupiah(item.price)}</p></div>
        <p style={{color:"var(--text)",fontWeight:700}}>{rupiah(item.price*item.qty)}</p>
      </div>))}
      <div style={{display:"flex",justifyContent:"space-between",marginTop:11,paddingTop:11,borderTop:"1px solid var(--border)"}}>
        <span className="sora" style={{fontWeight:700,color:"var(--text)"}}>Total</span>
        <span className="sora" style={{fontWeight:800,color:"var(--amber)",fontSize:18}}>{rupiah(total)}</span>
      </div>
    </Card>
    <div className="fu s2" style={{display:"flex",flexDirection:"column",gap:9}}>
      <Btn v="success" onClick={()=>submit(true)} full>✓ Bayar Sekarang</Btn>
      <Btn v="ghost" onClick={()=>submit(false)} full>Bayar Nanti</Btn>
      <Btn v="danger" onClick={()=>setStep("menu")} full>← Edit Pesanan</Btn>
    </div>
  </div>);
};

// ── Tagihan ──
const Tagihan = ({orders,setOrders,menus,user,kasirs}) => {
  const [sel,setSel]=useState(null);
  const [adding,setAdding]=useState(false);
  const [cat,setCat]=useState("Semua");
  const open=orders.filter(o=>o.status==="open");
  const ord=orders.find(o=>o.id===sel);
  const addItem=m=>setOrders(p=>p.map(o=>{
    if(o.id!==sel)return o;
    const e=o.items.find(i=>i.menuId===m.id);
    const items=e?o.items.map(i=>i.menuId===m.id?{...i,qty:i.qty+1}:i):[...o.items,{menuId:m.id,name:m.name,price:m.price,qty:1}];
    return {...o,items,total:items.reduce((s,i)=>s+i.price*i.qty,0)};
  }));
  const lunas=()=>{setOrders(p=>p.map(o=>o.id===sel?{...o,status:"paid",paidAt:todayStr,kasirId:user.id}:o));setSel(null);};
  if(sel&&ord)return(<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
    <Hdr title={ord.customerName} sub="Detail tagihan"
      right={<div style={{display:"flex",alignItems:"center",gap:8}}>
        <KasirChip kasirId={ord.kasirId} kasirs={kasirs}/>
        <button onClick={()=>{setSel(null);setAdding(false);}} style={{color:"var(--amber)",display:"flex"}}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5 M12 19l-7-7 7-7"/>
          </svg>
        </button>
      </div>}/>
    {adding?(
      <><div style={{padding:"10px 18px",borderBottom:"1px solid var(--border)",flexShrink:0}}>
        <p style={{color:"var(--muted)",fontSize:13,marginBottom:8}}>Tambah untuk <strong style={{color:"var(--amber)"}}>{ord.customerName}</strong></p>
        <CatBar val={cat} set={setCat}/>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"11px 18px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        {menus.filter(m=>m.available&&(cat==="Semua"||m.category===cat)).map(m=>(
          <div key={m.id} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:13,padding:"12px 10px"}}>
            <p style={{color:"var(--muted)",fontSize:10}}>{m.category}</p>
            <p style={{color:"var(--text)",fontWeight:600,fontSize:13,margin:"3px 0 6px"}}>{m.name}</p>
            <p style={{color:"var(--amber)",fontWeight:700,fontSize:13,marginBottom:9}}>{rupiah(m.price)}</p>
            <button onClick={()=>{addItem(m);setAdding(false);}} style={{width:"100%",padding:"7px",borderRadius:8,
              background:"var(--amber-dim)",color:"var(--amber)",border:"1px solid rgba(245,166,35,0.2)",fontSize:12,fontWeight:600}}>+ Tambah</button>
          </div>))}
      </div></>
    ):(
      <div style={{flex:1,overflowY:"auto",padding:"17px",display:"flex",flexDirection:"column",gap:13}}>
        <Card>{ord.items.map((item,i)=>(
          <div key={item.menuId} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",
            borderBottom:i<ord.items.length-1?"1px solid var(--border)":"none"}}>
            <div><p style={{color:"var(--text)",fontWeight:500}}>{item.name}</p>
              <p style={{color:"var(--muted)",fontSize:12}}>{item.qty} × {rupiah(item.price)}</p></div>
            <p style={{color:"var(--text)",fontWeight:700}}>{rupiah(item.price*item.qty)}</p>
          </div>))}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:11,paddingTop:11,borderTop:"1px solid var(--border)"}}>
            <span className="sora" style={{fontWeight:700,color:"var(--text)"}}>Total</span>
            <span className="sora" style={{fontWeight:800,color:"var(--amber)",fontSize:20}}>{rupiah(ord.total)}</span>
          </div>
        </Card>
        <Btn v="dark" onClick={()=>setAdding(true)} full>+ Tambah Pesanan</Btn>
        <Btn v="success" onClick={lunas} full>✓ Lunasi — {rupiah(ord.total)}</Btn>
      </div>
    )}
  </div>);
  return(<div style={{flex:1,overflowY:"auto",padding:"17px"}}>
    <div className="fu" style={{marginBottom:12}}>
      <h2 className="sora" style={{fontSize:20,fontWeight:800,color:"var(--text)"}}>Tagihan Terbuka</h2>
      <p style={{color:"var(--muted)",fontSize:13,marginTop:3}}>{open.length} pelanggan · <span style={{color:"var(--amber)",fontWeight:700}}>{rupiah(open.reduce((s,o)=>s+o.total,0))}</span> potensi masuk</p>
    </div>
    {open.length===0?(<Card style={{textAlign:"center",padding:32}}><p style={{fontSize:28,marginBottom:8}}>🎉</p><p style={{color:"var(--muted)"}}>Semua tagihan lunas!</p></Card>)
    :open.map((o,i)=>(<div key={o.id} onClick={()=>setSel(o.id)} style={{background:"var(--card)",border:"1px solid var(--border)",
      borderRadius:13,padding:"13px 15px",marginBottom:9,display:"flex",justifyContent:"space-between",cursor:"pointer",alignItems:"center"}}>
      <div style={{flex:1}}>
        <p style={{color:"var(--text)",fontWeight:700,fontSize:15}}>{o.customerName}</p>
        <p style={{color:"var(--muted)",fontSize:12,marginTop:2}}>{o.items.map(i=>`${i.name} ×${i.qty}`).join(" • ")}</p>
        <div style={{marginTop:5}}><KasirChip kasirId={o.kasirId} kasirs={kasirs}/></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0,marginLeft:10}}>
        <p className="sora" style={{color:"var(--amber)",fontWeight:800,fontSize:14}}>{rupiah(o.total)}</p>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </div>
    </div>))}
  </div>);
};



// ── Tim ──
const Tim = ({kasirs,setKasirs,onClose}) => {
  const [name,setName]=useState("");const[pw,setPw]=useState("");const[ok,setOk]=useState(false);
  const add=()=>{if(!name||!pw)return;setKasirs(p=>[...p,{id:genId("k"),name,password:pw}]);setName("");setPw("");setOk(true);setTimeout(()=>setOk(false),2000);};
  return(<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
    <Hdr title="Manajemen Tim" sub="Daftar kasir" right={
      <button onClick={onClose} style={{color:"var(--amber)",display:"flex"}}>
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5 M12 19l-7-7 7-7"/>
        </svg>
      </button>}/>
    <div style={{flex:1,overflowY:"auto",padding:"17px",display:"flex",flexDirection:"column",gap:13}}>
      {kasirs.map((k,i)=>(<Card key={k.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:KASIR_COLORS_DIM[i%4],display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:KASIR_COLORS[i%4],fontWeight:800,fontSize:14}}>{k.name[0]}</span>
          </div>
          <div><p style={{color:"var(--text)",fontWeight:700}}>{k.name}</p>
            <p style={{color:"var(--muted)",fontSize:12,marginTop:1}}>Password: {k.password}</p></div>
        </div>
        {kasirs.length>1&&(<button onClick={()=>setKasirs(p=>p.filter(x=>x.id!==k.id))} style={{width:32,height:32,borderRadius:8,
          background:"var(--red-dim)",border:"1px solid rgba(224,82,82,0.2)",color:"var(--red)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18 M8 6V4h8v2 M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          </svg>
        </button>)}
      </Card>))}
      <Card style={{display:"flex",flexDirection:"column",gap:12}}>
        <h3 style={{color:"var(--text)",fontWeight:700,fontSize:15}}>Tambah Kasir</h3>
        <TxtInput label="Nama Kasir" value={name} onChange={setName} placeholder="Nama kasir baru"/>
        <TxtInput label="Password" type="text" value={pw} onChange={setPw} placeholder="Buat password login"/>
        {ok&&<p className="fi" style={{color:"var(--green)",fontSize:13,textAlign:"center"}}>✓ Kasir berhasil ditambahkan!</p>}
        <Btn onClick={add} disabled={!name||!pw} full>Tambah Kasir</Btn>
      </Card>
    </div>
  </div>);
};

// ── Menu Mgmt ──
const MenuMgmt = ({menus,setMenus,onClose}) => {
  const [show,setShow]=useState(false);const[eid,setEid]=useState(null);
  const [form,setForm]=useState({name:"",price:"",category:"Kopi",available:true});const[cat,setCat]=useState("Semua");
  const open=(m=null)=>{if(m){setEid(m.id);setForm({name:m.name,price:String(m.price),category:m.category,available:m.available});}
    else{setEid(null);setForm({name:"",price:"",category:"Kopi",available:true});}setShow(true);};
  const save=()=>{if(!form.name||!form.price)return;
    if(eid)setMenus(p=>p.map(m=>m.id===eid?{...m,...form,price:parseInt(form.price)}:m));
    else setMenus(p=>[...p,{id:Date.now(),...form,price:parseInt(form.price)}]);setShow(false);};
  const filtered=menus.filter(m=>cat==="Semua"||m.category===cat);
  return(<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative"}}>
    <Hdr title="Manajemen Menu" sub={`${menus.length} menu`}
      right={<div style={{display:"flex",gap:8}}><Btn sm onClick={()=>open()}>+ Tambah</Btn>
        <button onClick={onClose} style={{color:"var(--amber)",display:"flex"}}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5 M12 19l-7-7 7-7"/>
          </svg>
        </button></div>}/>
    <div style={{padding:"9px 18px",borderBottom:"1px solid var(--border)",flexShrink:0}}><CatBar val={cat} set={setCat}/></div>
    <div style={{flex:1,overflowY:"auto",padding:"11px 18px",display:"flex",flexDirection:"column",gap:8}}>
      {filtered.map(m=>(<div key={m.id} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,
        padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",opacity:m.available?1:0.5}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <p style={{color:"var(--text)",fontWeight:600,fontSize:14}}>{m.name}</p>
            {!m.available&&<span style={{background:"rgba(122,106,86,0.15)",color:"var(--muted)",fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:99}}>Habis</span>}
          </div>
          <div style={{display:"flex",gap:7,marginTop:4,alignItems:"center"}}>
            <span style={{background:"var(--amber-dim)",color:"var(--amber)",fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:99}}>{m.category}</span>
            <p style={{color:"var(--amber)",fontWeight:700,fontSize:13}}>{rupiah(m.price)}</p>
          </div>
        </div>
        <div style={{display:"flex",gap:7}}>
          {[{act:()=>setMenus(p=>p.map(x=>x.id===m.id?{...x,available:!x.available}:x)),bg:m.available?"var(--green-dim)":"var(--card2)",col:m.available?"var(--green)":"var(--muted)",icon:m.available?"M20 6L9 17l-5-5":"M18 6L6 18 M6 6l12 12"},
            {act:()=>open(m),bg:"var(--amber-dim)",col:"var(--amber)",icon:"M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"},
            {act:()=>setMenus(p=>p.filter(x=>x.id!==m.id)),bg:"var(--red-dim)",col:"var(--red)",icon:"M3 6h18 M8 6V4h8v2 M19 6l-1 14"},
          ].map((b,j)=>(<button key={j} onClick={b.act} style={{width:32,height:32,borderRadius:8,background:b.bg,
            border:`1px solid ${b.col}33`,color:b.col,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={b.icon}/></svg>
          </button>))}
        </div>
      </div>))}
    </div>
    {show&&(<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.75)",zIndex:200,display:"flex",alignItems:"flex-end"}} onClick={()=>setShow(false)}>
      <div className="fu" style={{background:"var(--bg2)",borderRadius:"20px 20px 0 0",padding:"20px 20px 34px",width:"100%",display:"flex",flexDirection:"column",gap:13}} onClick={e=>e.stopPropagation()}>
        <h3 className="sora" style={{fontWeight:700,color:"var(--text)",fontSize:16}}>{eid?"Edit":"Tambah"} Menu</h3>
        <TxtInput label="Nama Menu" value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} placeholder="Nama minuman"/>
        <TxtInput label="Harga" type="number" value={form.price} onChange={v=>setForm(p=>({...p,price:v}))} placeholder="8000" prefix="Rp"/>
        <div><p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Kategori</p>
          <div style={{display:"flex",gap:8}}>
            {MCATS.map(c=>(<button key={c} onClick={()=>setForm(p=>({...p,category:c}))} style={{flex:1,padding:"9px",borderRadius:9,
              background:form.category===c?"var(--amber-dim)":"var(--card2)",color:form.category===c?"var(--amber)":"var(--muted)",
              border:`1px solid ${form.category===c?"rgba(245,166,35,0.35)":"var(--border)"}`,fontSize:12,fontWeight:600}}>{c}</button>))}
          </div>
        </div>
        <Btn onClick={save} disabled={!form.name||!form.price} full>Simpan</Btn>
      </div>
    </div>)}
  </div>);
};

// ── APP ──
export default function AngkringanApp() {
  const [user,setUser]=useState(null);
  const [screen,setScreen]=useState("home");
  const [overlay,setOverlay]=useState(null);
  const [menus,setMenus]=useState(MENUS0);
  const [orders,setOrders]=useState(ORDERS0);
  const [expenses,setExpenses]=useState(EXPS0);
  const [kasirs,setKasirs]=useState([{id:"k1",name:"Adi",password:"adi123"},{id:"k2",name:"Dina",password:"dina123"}]);
  const [target,setTarget]=useState(500000);

  if(!user)return(<><FontStyle/><div style={{height:"100vh",background:"var(--bg)"}}><Login onLogin={u=>{setUser(u);setScreen("home");}} kasirs={kasirs}/></div></>);

  const titles={
    home:{title:"Dashboard",sub:today.toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long"})},
    pos:{title:"Kasir",sub:`Jaga: ${user.name}`},
    tagihan:{title:"Tagihan",sub:"Pesanan belum lunas"},
    keuangan:{title:"Keuangan",sub:"Laporan Keuangan"},
  };

  return(<><FontStyle/>
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:"var(--bg)",maxWidth:480,margin:"0 auto",position:"relative",overflow:"hidden"}}>
      {overlay==="menu"&&<MenuMgmt menus={menus} setMenus={setMenus} onClose={()=>setOverlay(null)}/>}
      {overlay==="tim"&&<Tim kasirs={kasirs} setKasirs={setKasirs} onClose={()=>setOverlay(null)}/>}
      {!overlay&&(<>
        <Hdr {...(titles[screen]||titles.home)} right={
          user.role==="owner"?(
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <button onClick={()=>setOverlay("tim")} style={{padding:"5px 11px",borderRadius:8,background:"var(--blue-dim)",color:"var(--blue)",border:"1px solid rgba(91,141,239,0.25)",fontSize:12,fontWeight:600}}>Tim</button>
              <button onClick={()=>setOverlay("menu")} style={{padding:"5px 11px",borderRadius:8,background:"var(--amber-dim)",color:"var(--amber)",border:"1px solid rgba(245,166,35,0.25)",fontSize:12,fontWeight:600}}>Menu</button>
              <button onClick={()=>setUser(null)} style={{color:"var(--muted)",display:"flex"}}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9"/></svg>
              </button>
            </div>
          ):(
            <button onClick={()=>setUser(null)} style={{color:"var(--muted)",display:"flex"}}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9"/></svg>
            </button>
          )}/>
        <div key={screen} className="fi" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {screen==="home"&&<Dashboard orders={orders} expenses={expenses} user={user} setScreen={setScreen} target={target} setTarget={setTarget} kasirs={kasirs}/>}
          {screen==="pos"&&<POS menus={menus} orders={orders} setOrders={setOrders} user={user}/>}
          {screen==="tagihan"&&<Tagihan orders={orders} setOrders={setOrders} menus={menus} user={user} kasirs={kasirs}/>}
          {screen==="keuangan"&&user.role==="owner"&&<Keuangan orders={orders} expenses={expenses} setExpenses={setExpenses} kasirs={kasirs}/>}
        </div>
        <Nav screen={screen} set={setScreen} role={user.role}/>
      </>)}
    </div>
  </>);
}
