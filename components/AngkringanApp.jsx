"use client";
import { supabase } from "../lib/supabase";

import { useState, useMemo, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@400;600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:#F4F7FB;--bg2:#EAF1FF;--card:#FFFFFF;--card2:#F8FAFC;--border:#D7E2F0;
      --amber:#F59E0B;--amber-dim:rgba(245,158,11,0.12);
      --green:#10B981;--green-dim:rgba(16,185,129,0.12);
      --red:#EF4444;--red-dim:rgba(239,68,68,0.12);
      --blue:#2563EB;--blue-dim:rgba(37,99,235,0.12);
      --purple:#7C3AED;--purple-dim:rgba(124,58,237,0.12);
      --cream:#4338CA;--muted:#64748B;--text:#0F172A;--shadow:0 18px 48px rgba(15,23,42,0.08);
    }
    html,body{background:linear-gradient(180deg,#0F172A 0%,#111827 100%);width:100%;min-height:100%;overflow:hidden}
    .sora{font-family:'Sora',sans-serif}
    input,textarea{outline:none;border:none;background:transparent;color:var(--text);font-family:'DM Sans',sans-serif;font-size:15px;width:100%}
    input{padding:12px 14px}
    button{cursor:pointer;border:none;background:none;font-family:'DM Sans',sans-serif;transition:transform .16s ease, opacity .16s ease, box-shadow .18s ease, background .18s ease, color .18s ease, border-color .18s ease}
    button:active{transform:translateY(1px)}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes popIn{from{opacity:0;transform:scale(0.3)}to{opacity:1;transform:scale(1)}}
    .fu{animation:fadeUp 0.28s ease both}
    .fi{animation:fadeIn 0.2s ease both}
    .s1{animation-delay:.04s}.s2{animation-delay:.08s}.s3{animation-delay:.12s}.s4{animation-delay:.16s}.s5{animation-delay:.2s}
    ::-webkit-scrollbar{width:6px;height:6px}
    ::-webkit-scrollbar-thumb{background:rgba(100,116,139,0.32);border-radius:99px}
    .app-shell{width:100vw;max-width:none;min-height:100dvh;height:100dvh;display:flex;flex-direction:column;background:radial-gradient(circle at top, rgba(99,102,241,0.14), transparent 28%),linear-gradient(180deg,#F9FBFF 0%,#ECF3FF 100%);margin:0;position:relative;overflow:hidden;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}
    .app-frame{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) auto;grid-template-areas:"header" "content" "nav"}
    .hdr-shell{grid-area:header;padding:12px calc(env(safe-area-inset-right) + 16px) 10px calc(env(safe-area-inset-left) + 16px)}
    .screen-shell{grid-area:content;min-height:0;display:flex;flex-direction:column;overflow:hidden}
    .nav-shell{grid-area:nav}
    .nav-brand{display:none}
    .dashboard-summary-grid{display:grid;grid-template-columns:1fr;gap:10px}
    .menu-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .glass-card{background:rgba(255,255,255,0.82);backdrop-filter:blur(18px)}
    .nav-btn{position:relative;z-index:1}
    .nav-btn.active{color:var(--text)}
    .nav-btn.active::after{content:"";position:absolute;inset:0;border-radius:18px;background:linear-gradient(180deg, rgba(245,158,11,0.20) 0%, rgba(255,255,255,0.98) 100%);box-shadow:0 14px 30px rgba(15,23,42,0.08);z-index:-1}
    @media (min-width: 560px) and (orientation: landscape), (min-width: 560px) and (max-height: 500px){
      .app-shell{width:100vw;max-width:none;height:100dvh;min-height:100dvh;margin:0;border-radius:0;border:none;box-shadow:none}
      .app-frame{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);grid-template-areas:"header" "content"}
      .nav-shell{display:none !important}
      .hdr-shell{padding:12px calc(env(safe-area-inset-right) + 18px) 10px calc(env(safe-area-inset-left) + 18px) !important}
      .dashboard-summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      .menu-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
      .dashboard-scroll,.pos-name-screen,.pos-confirm-screen,.tagihan-list-screen{padding-left:16px !important;padding-right:16px !important}
      .login-screen{justify-content:flex-start !important;overflow-y:auto !important;padding:16px 18px 24px !important}
      .login-panel{max-width:540px !important}
      .login-header{margin-bottom:18px !important}
      .login-card{padding:18px !important}
    }
    @media (min-width: 820px) and (orientation: landscape), (min-width: 820px) and (max-height: 500px){
      .menu-grid{grid-template-columns:repeat(4,minmax(0,1fr))}
    }
    @media (min-width: 1024px) and (orientation: landscape), (min-width: 1024px) and (max-height: 500px){
      .app-shell{width:100vw;max-width:none;height:100dvh;min-height:100dvh;margin:0;border-radius:0;box-shadow:none}
      .app-frame{grid-template-columns:minmax(0,1fr)}
      .hdr-shell{padding:13px calc(env(safe-area-inset-right) + 20px) 11px calc(env(safe-area-inset-left) + 20px) !important}
      .dashboard-scroll,.pos-name-screen,.pos-confirm-screen,.tagihan-list-screen{padding-left:18px !important;padding-right:18px !important}
    }
    @media (min-width: 1200px) and (orientation: landscape), (min-width: 1200px) and (max-height: 500px){
      .dashboard-summary-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
      .menu-grid{grid-template-columns:repeat(5,minmax(0,1fr))}
    }
  `}</style>
);

// ── Helpers ──
const seedToday = new Date();
const getNow = () => new Date();
const pad2 = n => String(n).padStart(2,"0");
const fmt = d => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
const dateKey = value => value ? String(value).slice(0,10) : null;
const safeTextKey = value => String(value||"").trim().toLowerCase().replace(/\s+/g," ");
const buildItemKey = item => [
  item?.menuId ?? "menu",
  safeTextKey(item?.name),
  safeTextKey(item?.suhu),
  safeTextKey(item?.note),
  Number(item?.price)||0,
].join("::");
const paidAtDate = pa => dateKey(pa);
const orderSessionDate = order => dateKey(order?.sessionDate || order?.session_date)
  || ((typeof order?.createdAt === "string" && order.createdAt.length===10) ? dateKey(order.createdAt) : null)
  || paidAtDate(order?.paidAt);
const orderCreatedAt = order => {
  const raw = order?.createdAt || null;
  if(typeof raw === "string" && raw.length===10) return null;
  return raw;
};
const orderActualPaidAt = order => order?.paidAt || null;
const hasCrossDatePayment = order => {
  const reportDate = orderSessionDate(order);
  const actualDate = paidAtDate(orderActualPaidAt(order));
  return Boolean(reportDate && actualDate && reportDate !== actualDate);
};
const normalizeOrder = raw => {
  if(!raw) return raw;
  const rawCreatedAt = raw.createdAt ?? raw.created_at ?? null;
  const rawPaidAt = raw.paidAt ?? raw.paid_at ?? null;
  const rawSessionDate = raw.sessionDate ?? raw.session_date ?? null;
  const legacyCreatedAtIsSessionDate = typeof rawCreatedAt === "string" && rawCreatedAt.length===10;
  const sessionDate = dateKey(rawSessionDate)
    || (legacyCreatedAtIsSessionDate ? dateKey(rawCreatedAt) : null)
    || paidAtDate(rawPaidAt);
  const createdAt = legacyCreatedAtIsSessionDate ? null : (rawCreatedAt || null);
  const items = Array.isArray(raw.items)
    ? raw.items.map(item => ({...item, cartKey:item?.cartKey || buildItemKey(item)}))
    : [];
  const computedOpenTotal = items.filter(item=>!item.paid).reduce((sum,item)=>sum+(Number(item.price)||0)*(Number(item.qty)||0),0);
  return {
    ...raw,
    createdAt,
    sessionDate,
    paidAt: rawPaidAt || null,
    items,
    total: Number(raw.total ?? computedOpenTotal) || 0,
    sessionId: raw.sessionId ?? raw.session_id ?? null,
    updatedAt: raw.updatedAt ?? raw.updated_at ?? null,
    lastDeviceId: raw.lastDeviceId ?? raw.last_device_id ?? null,
  };
};
const serializeOrderForSync = order => JSON.stringify({
  id: order.id,
  customerName: order.customerName,
  status: order.status,
  createdAt: orderCreatedAt(order),
  sessionDate: orderSessionDate(order),
  sessionId: order.sessionId || null,
  paidAt: order.paidAt || null,
  items: (order.items||[]).map(item=>({
    menuId:item.menuId,
    name:item.name,
    price:item.price,
    qty:item.qty,
    suhu:item.suhu||null,
    note:item.note||"",
    paid:Boolean(item.paid),
    mitraId:item.mitraId||null,
    hargaMitra:item.hargaMitra||null,
    cartKey:item.cartKey || buildItemKey(item),
  })),
  total: Number(order.total)||0,
  kasirId: order.kasirId,
});
const toDbOrder = (order, deviceId=null) => ({
  id: order.id,
  customer_name: order.customerName,
  status: order.status,
  created_at: orderCreatedAt(order),
  session_date: orderSessionDate(order),
  session_id: order.sessionId || null,
  paid_at: order.paidAt || null,
  items: (order.items||[]).map(item=>({
    ...item,
    cartKey:item.cartKey || buildItemKey(item),
  })),
  total: Number(order.total)||0,
  kasir_id: order.kasirId,
  last_device_id: deviceId,
});
const getItemMitraModal = (item, menus=[]) => {
  const menuRef = Array.isArray(menus) ? menus.find(m=>String(m.id)===String(item?.menuId)) : null;
  const mitraId = item?.mitraId || menuRef?.mitraId;
  if(!mitraId) return 0;
  const hargaMitra = Number(item?.hargaMitra ?? menuRef?.hargaMitra) || 0;
  const qty = Number(item?.qty) || 0;
  return hargaMitra * qty;
};
const getOrderMitraModal = (order, menus=[]) => (order?.items||[]).reduce((sum,item)=>sum+getItemMitraModal(item, menus),0);
const getOrdersMitraModal = (orders, menus=[]) => orders.reduce((sum,order)=>sum+getOrderMitraModal(order, menus),0);
const expenseDateKey = expense => dateKey(expense?.date);
const emptyFinanceSummary = (date=null) => ({
  date,
  paidOrders: [],
  expenses: [],
  pemasukan: 0,
  pengeluaran: 0,
  modalMitra: 0,
  totalKeluar: 0,
  kas: 0,
});
const calcFinanceSummary = ({orders=[], expenses=[], menus=[]}) => {
  const paidOrders = (orders||[]).filter(o=>o?.status === "paid");
  const normalizedExpenses = (expenses||[]).filter(Boolean);
  const pemasukan = paidOrders.reduce((sum,o)=>sum+(Number(o?.total)||0),0);
  const pengeluaran = normalizedExpenses.reduce((sum,e)=>sum+(Number(e?.amount)||0),0);
  const modalMitra = getOrdersMitraModal(paidOrders, menus);
  const totalKeluar = pengeluaran + modalMitra;
  return {
    paidOrders,
    expenses: normalizedExpenses,
    pemasukan,
    pengeluaran,
    modalMitra,
    totalKeluar,
    kas: pemasukan - totalKeluar,
  };
};
const buildFinanceDayMap = (orders=[], expenses=[], menus=[]) => {
  const dayMap = {};
  const ensureDay = (ds) => {
    const key = dateKey(ds);
    if(!key) return null;
    if(!dayMap[key]) dayMap[key] = emptyFinanceSummary(key);
    return dayMap[key];
  };
  (orders||[]).forEach(order=>{
    if(order?.status !== "paid") return;
    const bucket = ensureDay(orderSessionDate(order));
    if(!bucket) return;
    bucket.paidOrders.push(order);
    bucket.pemasukan += Number(order?.total) || 0;
    bucket.modalMitra += getOrderMitraModal(order, menus);
  });
  (expenses||[]).forEach(expense=>{
    const bucket = ensureDay(expenseDateKey(expense));
    if(!bucket) return;
    bucket.expenses.push(expense);
    bucket.pengeluaran += Number(expense?.amount) || 0;
  });
  Object.values(dayMap).forEach(bucket=>{
    bucket.totalKeluar = bucket.pengeluaran + bucket.modalMitra;
    bucket.kas = bucket.pemasukan - bucket.totalKeluar;
  });
  return dayMap;
};
const getFinanceSummaryForDate = (dayMap, date) => {
  const key = dateKey(date);
  return (key && dayMap?.[key]) ? dayMap[key] : emptyFinanceSummary(key);
};
const getFinanceSummaryForMonth = (dayMap, monthKey) => {
  const rows = Object.values(dayMap||{}).filter(row=>row.date?.startsWith(monthKey));
  return rows.reduce((acc,row)=>({
    paidOrders: acc.paidOrders.concat(row.paidOrders||[]),
    expenses: acc.expenses.concat(row.expenses||[]),
    pemasukan: acc.pemasukan + (Number(row.pemasukan)||0),
    pengeluaran: acc.pengeluaran + (Number(row.pengeluaran)||0),
    modalMitra: acc.modalMitra + (Number(row.modalMitra)||0),
    totalKeluar: acc.totalKeluar + (Number(row.totalKeluar)||0),
    kas: acc.kas + (Number(row.kas)||0),
  }), emptyFinanceSummary(monthKey));
};
const fmtWaktu = pa => {
  if(!pa) return "";
  if(pa.length===10) return ""; // data lama, tidak ada waktu
  const d = new Date(pa);
  return d.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"});
};
const fmtTanggalWaktu = pa => {
  if(!pa) return "";
  if(pa.length===10){
    return new Date(pa+"T00:00:00").toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"});
  }
  const d = new Date(pa);
  const tgl = d.toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"});
  const jam = d.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"});
  return `${tgl}, ${jam}`;
};

const todayStr = fmt(seedToday); // fallback untuk data statis
const rupiah = n => "Rp " + Number(n).toLocaleString("id-ID");
const genId = prefix => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
// Timestamp lokal (bukan UTC) untuk waktu transaksi asli.
const localISO = () => {
  const d = new Date();
  const datePart = `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
  return `${datePart}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
};
const CATS = ["Semua","Kopi","Makanan"];
const MCATS = ["Kopi","Makanan"];
const KASIR_COLORS = ["var(--amber)","var(--blue)","var(--purple)","var(--green)"];
const KASIR_COLORS_DIM = ["var(--amber-dim)","var(--blue-dim)","var(--purple-dim)","var(--green-dim)"];
const MITRA_COLORS = ["var(--purple)","var(--green)","var(--blue)","var(--red)"];
const MITRA_COLORS_DIM = ["var(--purple-dim)","var(--green-dim)","var(--blue-dim)","var(--red-dim)"];

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
    const d=new Date(seedToday); d.setDate(d.getDate()-daysAgo);
    const ds=fmt(d);
    return [{id:`HIST${i}A`,customerName:"Pelanggan A",status:"paid",createdAt:ds,paidAt:ds,items:items.slice(0,2),total:Math.floor(amt*0.6),kasirId:kid},
            {id:`HIST${i}B`,customerName:"Pelanggan B",status:"paid",createdAt:ds,paidAt:ds,items:items.slice(1),total:Math.floor(amt*0.4),kasirId:kid}];
  }).flat();
};

const makePrevMonth = () => {
  const base = new Date(seedToday.getFullYear(), seedToday.getMonth()-1, 1);
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
    const d=new Date(seedToday); d.setDate(d.getDate()-(6-i));
    return day.map((e,j)=>({id:`HEXP${i}${j}`,description:e.desc,amount:e.amt,date:fmt(d)}));
  }).flat();
  const prevBase = new Date(seedToday.getFullYear(), seedToday.getMonth()-1, 1);
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
const printDayPDF = (date, orders, expenses, kasirs, menus=[]) => {
  const paid = orders.filter(o=>o.status==="paid"&&orderSessionDate(o)===date);
  const exps = expenses.filter(e=>expenseDateKey(e)===date);
  const {pemasukan, pengeluaran, modalMitra, totalKeluar, kas} = calcFinanceSummary({orders: paid, expenses: exps, menus});
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
<div class="row rout"><span class="lbl">🤝 Modal Mitra</span><span class="val vout">− ${rupiah(modalMitra)}</span></div>
<div class="row rout"><span class="lbl">📦 Total Keluar</span><span class="val vout">− ${rupiah(totalKeluar)}</span></div>
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
const printMonthPDF = (monthKey, monthLabel, orders, expenses, kasirs, menus=[]) => {
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
<div class="row rout"><span class="lbl">🧾 Pengeluaran</span><span class="val vout">− ${rupiah(pengeluaran)}</span></div>
<div class="row rout"><span class="lbl">🤝 Modal Mitra</span><span class="val vout">− ${rupiah(modalMitra)}</span></div>
<div class="row rout"><span class="lbl">📦 Total Keluar</span><span class="val vout">− ${rupiah(totalKeluar)}</span></div>
<div class="row rkas"><span class="lbl">🏦 Kas Bersih</span><span class="val vkas">${rupiah(kas)}</span></div></div>
<hr class="div">
<div class="sec"><div class="st">Rekap Per Hari (${days.length} hari)</div>
<table><thead><tr><th>Tanggal</th><th>Pesanan</th><th>Pemasukan</th><th>Total Keluar</th><th>Kas Bersih</th></tr></thead><tbody>
${days.map(d=>{const dd=dayMap[d];const totalKeluarHarian=dd.pengeluaran+dd.modalMitra;const k=dd.pemasukan-totalKeluarHarian;
  const dateStr=new Date(d+"T00:00:00").toLocaleDateString("id-ID",{weekday:"short",day:"numeric",month:"short"});
  return`<tr><td>${dateStr}</td><td>${dd.orders.length} pesanan</td><td style="color:#4CAF7D;font-weight:700">${rupiah(dd.pemasukan)}</td><td style="color:#E05252">${totalKeluarHarian>0?"−"+rupiah(totalKeluarHarian):"-"}</td><td style="font-weight:800;color:${k>=0?"#F5A623":"#E05252"}">${rupiah(k)}</td></tr>`;}).join("")}
</tbody></table></div>
<hr class="div">
${paid.length?`<div class="sec"><div class="st">Semua Pesanan (${paid.length})</div>
<table><thead><tr><th>#</th><th>Tgl</th><th>Pelanggan</th><th>Item</th><th>Kasir</th><th>Total</th></tr></thead><tbody>
${paid.sort((a,b)=>a.paidAt.localeCompare(b.paidAt)).map((o,i)=>{
  const k=kasirs.find(k=>k.id===o.kasirId);
  const ds=new Date(orderSessionDate(o)+"T00:00:00").toLocaleDateString("id-ID",{day:"numeric",month:"short"});
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

// ── Struk Customer ──
const printStruk = (order, kembalian, kasirs, mode="lunas") => {
  const kasir = kasirs.find(k=>k.id===order.kasirId);
  const now = new Date();
  const waktu = now.toLocaleString("id-ID",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Struk - ${order.customerName}</title>
<style>
  @page{margin:4mm}
  *{box-sizing:border-box}
  body{font-family:'Courier New',monospace;font-size:11px;width:280px;margin:0 auto;padding:8px;color:#111}
  .c{text-align:center}.b{font-weight:700}.big{font-size:13px}
  .row{display:flex;justify-content:space-between;align-items:flex-start;margin:2px 0}
  .dl{border-top:1px dashed #666;margin:7px 0}
  .badge{display:inline-block;border:1px solid #111;padding:2px 8px;border-radius:4px;font-size:10px;margin:4px 0}
</style>
</head><body>
<div class="c b" style="font-size:17px;letter-spacing:1px">ANGKRINGAN.</div>
<div class="c" style="font-size:9px;color:#666">Struk Pembayaran Customer</div>
<div class="dl"></div>
<div class="row"><span style="color:#666">Pelanggan</span><span class="b">${order.customerName}</span></div>
<div class="row"><span style="color:#666">Kasir</span><span>${kasir?.name||"-"}</span></div>
<div class="row"><span style="color:#666">Waktu</span><span style="font-size:9px">${waktu}</span></div>
${mode==="nanti"?`<div class="c"><span class="badge">&#9203; TAGIHAN TERBUKA</span></div>`:""}
<div class="dl"></div>
${(order.items||[]).map(item=>`<div style="margin-bottom:5px">
  <div class="b">${item.name}${item.note?` <span style="font-size:9px;font-weight:400">(${item.note})</span>`:""}</div>
  <div class="row"><span style="color:#666">${item.qty} &times; ${rupiah(item.price)}</span><span class="b">${rupiah(item.price*item.qty)}</span></div>
</div>`).join("")}
<div class="dl"></div>
<div class="row big b"><span>TOTAL</span><span>${rupiah(order.total)}</span></div>
${mode==="lunas"?`<div class="row"><span style="color:#666">Dibayar</span><span>${rupiah(order.total+(kembalian||0))}</span></div>
<div class="row b" style="font-size:13px;margin-top:3px"><span>Kembalian</span><span>${rupiah(kembalian||0)}</span></div>`:"<div class=\"c\" style=\"margin-top:6px;color:#666;font-size:10px\">Mohon lunasi tagihan Anda</div>"}
<div class="dl"></div>
<div class="c" style="font-size:10px;color:#666">Terima kasih sudah mampir! &#9749;</div>
</body></html>`;
  const w=window.open("","_blank","width=320,height=580");
  if(w){w.document.write(html);w.document.close();setTimeout(()=>w.print(),350);}
};

// ── UI Atoms ──
const Card = ({children,style={},className=""}) => (
  <div className={className} style={{
    background:"linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
    border:"1px solid rgba(215,226,240,0.95)",borderRadius:20,padding:16,
    boxShadow:"0 14px 34px rgba(15,23,42,0.06)",
    ...style
  }}>{children}</div>
);
const Btn = ({children,onClick,v="primary",sm,disabled,full,style={}}) => {
  const vs={
    primary:{background:"linear-gradient(135deg,var(--amber) 0%, #F97316 100%)",color:"#fff",boxShadow:"0 14px 28px rgba(245,158,11,0.26)"},
    ghost:{background:"rgba(255,255,255,0.78)",color:"var(--text)",border:"1px solid var(--border)",boxShadow:"0 8px 18px rgba(15,23,42,0.04)"},
    success:{background:"linear-gradient(135deg, rgba(16,185,129,0.16) 0%, rgba(255,255,255,0.95) 100%)",color:"var(--green)",border:"1px solid rgba(16,185,129,0.22)"},
    danger:{background:"linear-gradient(135deg, rgba(239,68,68,0.14) 0%, rgba(255,255,255,0.95) 100%)",color:"var(--red)",border:"1px solid rgba(239,68,68,0.18)"},
    dark:{background:"linear-gradient(135deg,#1E293B 0%, #334155 100%)",color:"#fff",boxShadow:"0 14px 26px rgba(15,23,42,0.16)"},
    pdf:{background:"linear-gradient(135deg, rgba(37,99,235,0.16) 0%, rgba(255,255,255,0.95) 100%)",color:"var(--blue)",border:"1px solid rgba(37,99,235,0.2)"},
  };
  return <button onClick={disabled?undefined:onClick} style={{
    ...vs[v],borderRadius:16,fontWeight:700,fontSize:sm?13:15,
    padding:sm?"9px 14px":"13px 20px",display:"flex",alignItems:"center",
    justifyContent:"center",gap:8,opacity:disabled?0.45:1,
    cursor:disabled?"not-allowed":"pointer",width:full?"100%":undefined,
    letterSpacing:"-0.01em",...style
  }}>{children}</button>;
};
const TxtInput = ({label,value,onChange,placeholder,type="text",prefix}) => (
  <div style={{display:"flex",flexDirection:"column",gap:6}}>
    {label&&<label style={{fontSize:11,color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</label>}
    <div style={{display:"flex",alignItems:"center",background:"rgba(255,255,255,0.88)",border:"1px solid var(--border)",borderRadius:14,overflow:"hidden",boxShadow:"inset 0 1px 0 rgba(255,255,255,0.7)"}}>
      {prefix&&<span style={{padding:"0 6px 0 14px",color:"var(--muted)",fontSize:14,flexShrink:0,fontWeight:600}}>{prefix}</span>}
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
const SuccessOverlay = ({type,kembalian=0,onPrint,onBack,printLabel="Cetak Struk",backLabel="Kembali"}) => {
  const isLunas = type==="lunas";
  const isTambah = type==="tambah";
  const isParsial = type==="parsial";
  const accent = isTambah ? "var(--amber)" : "var(--green)";
  const glow = isTambah ? "0 0 60px rgba(212,130,10,0.45)" : "0 0 60px rgba(16,185,129,0.45)";
  const title = isLunas
    ? "Pembayaran Lunas! ✓"
    : type==="nanti"
      ? "Pesanan Tercatat! ✓"
      : isParsial
        ? "Pembayaran Item Berhasil! ✓"
        : "Pesanan Ditambahkan! ✓";
  const helper = isLunas
    ? "Pembayaran sudah masuk. Cetak struk bila perlu, lalu kembali untuk lanjut transaksi."
    : type==="nanti"
      ? "Tagihan baru sudah dibuat. Cetak struk bila perlu, atau kembali untuk membuat pesanan baru."
      : isParsial
        ? "Item yang dibayar sudah dipisahkan dari tagihan aktif. Cetak struk bila perlu, lalu lanjutkan transaksi."
        : "Pesanan tambahan sudah masuk ke tagihan aktif. Cetak struk bila perlu, lalu kembali ke tagihan.";

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:9999,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:"24px 20px"}}>
      <div style={{width:"clamp(82px, 18vw, 96px)",height:"clamp(82px, 18vw, 96px)",borderRadius:"50%",
        background:accent,display:"flex",alignItems:"center",justifyContent:"center",
        animation:"popIn 0.45s cubic-bezier(0.175,0.885,0.32,1.275) both",boxShadow:glow}}>
        <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      </div>
      <div style={{maxWidth:340,textAlign:"center"}}>
        <p className="sora" style={{color:"#fff",fontWeight:800,fontSize:24,letterSpacing:"-0.5px",marginBottom:8}}>{title}</p>
        <p style={{color:"rgba(255,255,255,0.7)",fontSize:13,lineHeight:1.6}}>{helper}</p>
      </div>
      {(isLunas||isParsial) && Number(kembalian)>0 && (
        <div style={{background:"rgba(16,185,129,0.15)",border:"1px solid rgba(16,185,129,0.35)",borderRadius:16,padding:"14px 32px",textAlign:"center"}}>
          <p style={{color:"rgba(255,255,255,0.6)",fontSize:12,marginBottom:5}}>Kembalian</p>
          <p className="sora" style={{color:"var(--green)",fontWeight:800,fontSize:28}}>{rupiah(kembalian)}</p>
        </div>
      )}
      <div style={{width:"100%",maxWidth:340,display:"flex",flexDirection:"column",gap:10}}>
        {onPrint && (
          <button onClick={onPrint} style={{width:"100%",padding:"14px 16px",borderRadius:14,background:accent,color:"#fff",fontWeight:800,fontSize:15,border:"none",boxShadow:isTambah?"0 8px 22px rgba(212,130,10,0.25)":"0 8px 22px rgba(16,185,129,0.25)"}}>
            🧾 {printLabel}
          </button>
        )}
        {onBack && (
          <button onClick={onBack} style={{width:"100%",padding:"14px 16px",borderRadius:14,background:"rgba(255,255,255,0.08)",color:"#fff",fontWeight:700,fontSize:15,border:"1px solid rgba(255,255,255,0.14)"}}>
            ← {backLabel}
          </button>
        )}
      </div>
    </div>
  );
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
const PaymentMeta = ({order}) => {
  const actualPaidAt = orderActualPaidAt(order);
  const actualLabel = fmtTanggalWaktu(actualPaidAt);
  const reportDate = orderSessionDate(order);
  return (
    <>
      {actualLabel && <p style={{color:"var(--muted)",fontSize:10,marginTop:1}}>🕐 Dibayar {actualLabel}</p>}
      {hasCrossDatePayment(order) && reportDate && (
        <p style={{color:"var(--amber)",fontSize:10,marginTop:2,fontWeight:600}}>📒 Masuk rekap {fmtShort(reportDate)}</p>
      )}
    </>
  );
};

// ── Keuangan Sub-Views ──

// Level 1: Pilih Bulan
const MonthList = ({months, onSelect, getMonthSummary}) => (
  <div style={{display:"flex",flexDirection:"column",gap:9}}>
    {months.map((m,i)=>{
      const {pemasukan,totalKeluar,kas} = getMonthSummary(m.key);
      const now = getNow();
      const isThisMonth = m.key === `${now.getFullYear()}-${pad(now.getMonth()+1)}`;
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
              <p style={{color:"var(--muted)",fontSize:10,marginBottom:2}}>Keluar + Modal</p>
              <p style={{color:"var(--red)",fontWeight:700,fontSize:12}}>{rupiah(totalKeluar)}</p>
            </div>
            <div style={{flex:1,background:kas>=0?"var(--amber-dim)":"var(--red-dim)",borderRadius:9,padding:"8px 10px",textAlign:"center"}}>
              <p style={{color:"var(--muted)",fontSize:10,marginBottom:2}}>Kas Bersih</p>
              <p style={{color:kas>=0?"var(--amber)":"var(--red)",fontWeight:700,fontSize:12}}>{rupiah(kas)}</p>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

// Level 2: Pilih Hari dalam Bulan
const DayList = ({month, days, tab, onSelect, getDaySummary, businessDate}) => (
  <div style={{display:"flex",flexDirection:"column",gap:8}}>
    {/* Month summary */}
    <Card style={{marginBottom:6,background:"var(--card2)"}}>
      <p style={{color:"var(--amber)",fontWeight:700,fontSize:14,marginBottom:8}}>{month.label}</p>
      <p style={{color:"var(--muted)",fontSize:12}}>{days.length} hari tercatat</p>
    </Card>
    {days.map((ds,i)=>{
      const {pemasukan,totalKeluar,kas} = getDaySummary(ds);
      const isToday = ds===businessDate;
      const val = tab==="pemasukan"?pemasukan : tab==="pengeluaran"?totalKeluar : kas;
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
const DayDetail = ({date, orders, expenses, kasirs, menus, onBack, businessDate, baseSummary}) => {
  const [showAddExp, setShowAddExp] = useState(false);
  const [desc, setDesc] = useState("");
  const [amt, setAmt] = useState("");
  const [ok, setOk] = useState(false);
  const [addExpenses, setAddExpenses] = useState([]);
  const [pgOrders, setPgOrders] = useState(0);

  const seedSummary = baseSummary || calcFinanceSummary({
    orders: orders.filter(o=>o.status==="paid"&&orderSessionDate(o)===date),
    expenses: expenses.filter(e=>expenseDateKey(e)===date),
    menus,
  });
  const paid = seedSummary.paidOrders;
  const allExps = [...seedSummary.expenses, ...addExpenses];
  const pemasukan = seedSummary.pemasukan;
  const modalMitra = seedSummary.modalMitra;
  const pengeluaran = seedSummary.pengeluaran + addExpenses.reduce((s,e)=>s+(Number(e.amount)||0),0);
  const totalKeluar = pengeluaran + modalMitra;
  const kas = pemasukan - totalKeluar;
  const isToday = date===businessDate;

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
        <button onClick={()=>printDayPDF(date,orders,[...expenses,...addExpenses],kasirs,menus)}
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
          {label:"Keluar + Modal",val:totalKeluar,color:"var(--red)",bg:"var(--red-dim)"},
          {label:"Kas Bersih",val:kas,color:kas>=0?"var(--amber)":"var(--red)",bg:kas>=0?"var(--amber-dim)":"var(--red-dim)"},
        ].map(s=>(
          <div key={s.label} style={{flex:1,background:s.bg,borderRadius:11,padding:"9px 8px",textAlign:"center"}}>
            <p style={{color:"var(--muted)",fontSize:10,marginBottom:3}}>{s.label}</p>
            <p className="sora" style={{color:s.color,fontWeight:800,fontSize:12}}>{rupiah(s.val)}</p>
          </div>
        ))}
      </div>
      <div style={{background:"var(--card2)",border:"1px dashed var(--border)",borderRadius:12,padding:"10px 12px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,alignItems:"center",paddingBottom:7,borderBottom:"1px solid rgba(215,226,240,0.8)"}}>
          <p style={{color:"var(--muted)",fontSize:10,fontWeight:600}}>Pengeluaran</p>
          <p className="sora" style={{color:"var(--red)",fontWeight:700,fontSize:12}}>{rupiah(pengeluaran)}</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,alignItems:"center",paddingTop:7}}>
          <p style={{color:"var(--muted)",fontSize:10,fontWeight:600}}>Modal mitra</p>
          <p className="sora" style={{color:"var(--purple)",fontWeight:700,fontSize:12}}>{rupiah(modalMitra)}</p>
        </div>
      </div>

      {/* Daftar Pesanan */}
      <div>
          <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:9}}>
            Pesanan ({paid.length})
          </p>
          {paid.length===0?(
            <Card style={{textAlign:"center",padding:20}}><p style={{color:"var(--muted)",fontSize:13}}>Tidak ada pesanan</p></Card>
          ):(()=>{
            const sorted=[...paid].sort((a,b)=>(orderActualPaidAt(b)||"").localeCompare(orderActualPaidAt(a)||""));
            const PAGE=10;
            const total_pages=Math.ceil(sorted.length/PAGE);
            const pg=Math.min(pgOrders,total_pages-1);
            const slice=sorted.slice(pg*PAGE,(pg+1)*PAGE);
            return(<>
              {slice.map((o,idx)=>{
                return(
                  <div key={o.id} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:11,
                    padding:"11px 13px",marginBottom:7}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{width:22,height:22,borderRadius:6,background:"var(--card2)",border:"1px solid var(--border)",
                          fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",
                          color:"var(--muted)",flexShrink:0}}>{pg*PAGE+idx+1}</span>
                        <div>
                          <p style={{color:"var(--text)",fontWeight:600,fontSize:14}}>{o.customerName}</p>
                          <PaymentMeta order={o}/>
                        </div>
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
              {total_pages>1&&(
                <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,marginTop:8,marginBottom:4}}>
                  <button onClick={()=>setPgOrders(p=>Math.max(0,p-1))} disabled={pg===0}
                    style={{width:30,height:30,borderRadius:8,background:"var(--card2)",border:"1px solid var(--border)",
                    color:pg===0?"var(--muted)":"var(--text)",fontWeight:700,cursor:pg===0?"default":"pointer"}}>‹</button>
                  <span style={{fontSize:12,color:"var(--muted)",fontWeight:600}}>{pg+1} / {total_pages}</span>
                  <button onClick={()=>setPgOrders(p=>Math.min(total_pages-1,p+1))} disabled={pg===total_pages-1}
                    style={{width:30,height:30,borderRadius:8,background:"var(--card2)",border:"1px solid var(--border)",
                    color:pg===total_pages-1?"var(--muted)":"var(--text)",fontWeight:700,cursor:pg===total_pages-1?"default":"pointer"}}>›</button>
                </div>
              )}
            </>);
          })()}
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
const Keuangan = ({orders, expenses, setExpenses, kasirs, menus, businessDate}) => {
  const [selMonth, setSelMonth] = useState(null);
  const [selDay, setSelDay] = useState(null);

  const financeDayMap = useMemo(()=>buildFinanceDayMap(orders, expenses, menus),[orders, expenses, menus]);
  const allDates = useMemo(()=>Object.keys(financeDayMap).sort((a,b)=>b.localeCompare(a)),[financeDayMap]);

  const months = useMemo(()=>getMonths(allDates),[allDates]);

  const daysInMonth = useMemo(()=>{
    if(!selMonth) return [];
    return allDates.filter(d=>d.startsWith(selMonth.key));
  },[selMonth,allDates]);

  const getMonthSummary = (monthKey) => getFinanceSummaryForMonth(financeDayMap, monthKey);
  const getDaySummary = (ds) => getFinanceSummaryForDate(financeDayMap, ds);

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
              kasirs={kasirs} menus={menus} onBack={()=>setSelDay(null)} businessDate={businessDate}
              baseSummary={getDaySummary(selDay)}/>
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
              <button onClick={()=>printMonthPDF(selMonth.key, selMonth.label, orders, expenses, kasirs, menus)}
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
            {(()=>{const {pemasukan,pengeluaran,modalMitra,totalKeluar,kas}=getMonthSummary(selMonth.key);return(
              <>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                {[{label:"Pemasukan",val:pemasukan,color:"var(--green)",bg:"var(--green-dim)"},
                  {label:"Keluar + Modal",val:totalKeluar,color:"var(--red)",bg:"var(--red-dim)"},
                  {label:"Kas Bersih",val:kas,color:kas>=0?"var(--amber)":"var(--red)",bg:kas>=0?"var(--amber-dim)":"var(--red-dim)"},
                ].map(s=>(
                  <div key={s.label} style={{flex:1,background:s.bg,borderRadius:11,padding:"9px 8px",textAlign:"center"}}>
                    <p style={{color:"var(--muted)",fontSize:10,marginBottom:3}}>{s.label}</p>
                    <p className="sora" style={{color:s.color,fontWeight:800,fontSize:12}}>{rupiah(s.val)}</p>
                  </div>
                ))}
              </div>
              <div style={{background:"var(--card2)",border:"1px dashed var(--border)",borderRadius:12,padding:"10px 12px",marginBottom:14}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,alignItems:"center",paddingBottom:7,borderBottom:"1px solid rgba(215,226,240,0.8)"}}>
                  <p style={{color:"var(--muted)",fontSize:10,fontWeight:600}}>Pengeluaran</p>
                  <p className="sora" style={{color:"var(--red)",fontWeight:700,fontSize:12}}>{rupiah(pengeluaran)}</p>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,alignItems:"center",paddingTop:7}}>
                  <p style={{color:"var(--muted)",fontSize:10,fontWeight:600}}>Modal mitra</p>
                  <p className="sora" style={{color:"var(--purple)",fontWeight:700,fontSize:12}}>{rupiah(modalMitra)}</p>
                </div>
              </div>
              </>
            );})()}
            {/* Day list */}
            {daysInMonth.length===0?(
              <Card style={{textAlign:"center",padding:28}}>
                <p style={{color:"var(--muted)"}}>Tidak ada data di bulan ini</p>
              </Card>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:8,flex:"0 0 auto"}}>
                {daysInMonth.map((ds,i)=>{
                  const {pemasukan,totalKeluar,kas}=getDaySummary(ds);
                  const isToday=ds===businessDate;
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
                          <p style={{color:"var(--muted)",fontSize:9,marginBottom:1}}>Keluar + Modal</p>
                          <p style={{color:"var(--red)",fontWeight:700,fontSize:11}}>{rupiah(totalKeluar)}</p>
                        </div>
                        <div style={{flex:1,background:kas>=0?"var(--amber-dim)":"var(--red-dim)",borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                          <p style={{color:"var(--muted)",fontSize:9,marginBottom:1}}>Kas Bersih</p>
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
const Login = ({onLogin, kasirs, ownerPassword}) => {
  const [role,setRole]=useState(null);
  const [selKasir,setSelKasir]=useState(null);
  const [pw,setPw]=useState("");
  const [err,setErr]=useState("");
  const go=()=>{
    if(role==="owner"){if(pw===(ownerPassword||"owner123"))onLogin({role:"owner",id:"owner",name:"Kang Bro"});
      else{setErr("Password salah!");setTimeout(()=>setErr(""),1800);}}
    else{const k=kasirs.length===1?kasirs[0]:kasirs.find(k=>k.id===selKasir);
      if(k&&pw===k.password)onLogin({role:"kasir",id:k.id,name:k.name});
      else{setErr("Password salah!");setTimeout(()=>setErr(""),1800);}}
  };
  const canProceed=role==="owner"||(role==="kasir"&&(kasirs.length===1||selKasir));
  return(
    <div className="login-screen" style={{minHeight:"100%",display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",padding:24,background:"var(--bg)",overflowY:"auto",overflowX:"hidden",position:"relative"}}>
      <div style={{position:"absolute",top:-100,right:-100,width:280,height:280,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(212,130,10,0.08) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div className="fu login-panel" style={{width:"100%",maxWidth:360}}>
        <div className="login-header" style={{textAlign:"center",marginBottom:32}}>
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
        <Card className="login-card" style={{padding:22}}>
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
              <Btn onClick={go} disabled={!pw} full>Masuk →</Btn>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// ── Nav ──
const NAV_OWNER_ITEMS=[
  {k:"home",label:"Home",d:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10"},
  {k:"pos",label:"Kasir",d:"M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-3 M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M9 7h6"},
  {k:"tagihan",label:"Tagihan",d:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"},
  {k:"keuangan",label:"Keuangan",d:"M12 2v20 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"},
];
const NAV_KASIR_ITEMS=[
  {k:"home",label:"Home",d:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10"},
  {k:"pos",label:"Kasir",d:"M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-3 M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M9 7h6"},
  {k:"tagihan",label:"Tagihan",d:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"},
];
const getNavItems = role => role==="owner" ? NAV_OWNER_ITEMS : NAV_KASIR_ITEMS;

const Nav = ({screen,set,role}) => {
  const items = getNavItems(role);
  return(
    <div className="nav-shell" style={{position:"sticky",bottom:0,background:"rgba(255,255,255,0.78)",backdropFilter:"blur(20px)",
      borderTop:"1px solid var(--border)",display:"flex",padding:"10px 10px 14px",zIndex:100,flexShrink:0,gap:8}}>
      <div className="nav-brand">
        <div style={{width:52,height:52,borderRadius:18,background:"linear-gradient(135deg, var(--amber), #fb7185)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 18px 34px rgba(245,158,11,0.32)"}}>
          <span className="sora" style={{color:"#fff",fontSize:20,fontWeight:800}}>A.</span>
        </div>
      </div>
      {items.map(({k,label,d})=>{
        const a=screen===k;
        return(
          <button key={k} className={`nav-btn ${a?"active":""}`} onClick={()=>set(k)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
            justifyContent:"center",gap:5,padding:"10px 0",borderRadius:18,color:a?"var(--text)":"var(--muted)",background:a?"linear-gradient(180deg, rgba(245,158,11,0.14) 0%, rgba(255,255,255,0.92) 100%)":"transparent",boxShadow:a?"0 12px 24px rgba(15,23,42,0.06)":"none"}}>
            <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.2:1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d={d}/>
            </svg>
            <span style={{fontSize:10,fontWeight:a?800:600,letterSpacing:"0.01em"}}>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

const MenuDrawer = ({open,onClose,items,screen,onNavigate,isOwner,onOpenTim,onOpenMenu,onLogout}) => {
  if(!open) return null;
  return(
    <div style={{position:"absolute",inset:0,zIndex:450,background:"rgba(15,23,42,0.34)",backdropFilter:"blur(4px)",display:"flex"}} onClick={onClose}>
      <div className="fu" style={{width:"min(86vw,320px)",height:"100dvh",maxHeight:"100dvh",background:"linear-gradient(180deg,#FFFFFF 0%,#F8FAFC 100%)",borderRight:"1px solid var(--border)",padding:"18px 14px calc(env(safe-area-inset-bottom) + 20px)",display:"flex",flexDirection:"column",gap:12,boxShadow:"0 22px 50px rgba(15,23,42,0.18)",overflowY:"auto",WebkitOverflowScrolling:"touch"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <div>
            <p style={{fontSize:11,color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>Navigasi</p>
            <p className="sora" style={{fontSize:18,fontWeight:800,color:"var(--text)",marginTop:3}}>Angkringan.</p>
          </div>
          <button onClick={onClose} style={{width:40,height:40,borderRadius:12,border:"1px solid var(--border)",background:"rgba(255,255,255,0.88)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)"}}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {items.map(({k,label,d})=>{
            const active = screen===k;
            return(
              <button key={k} onClick={()=>{onNavigate(k);onClose();}} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 14px",borderRadius:16,border:`1px solid ${active?"rgba(245,158,11,0.22)":"var(--border)"}`,
                background:active?"linear-gradient(180deg, rgba(245,158,11,0.12) 0%, rgba(255,255,255,0.98) 100%)":"rgba(255,255,255,0.88)",color:active?"var(--text)":"var(--muted)",boxShadow:active?"0 14px 28px rgba(245,158,11,0.08)":"none"}}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active?2.2:1.9} strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
                <span style={{fontSize:14,fontWeight:active?800:700}}>{label}</span>
              </button>
            );
          })}
        </div>
        {isOwner&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,flex:"0 0 auto"}}>
            <button onClick={()=>{onClose();onOpenTim();}} style={{padding:"12px 10px",borderRadius:14,background:"var(--blue-dim)",color:"var(--blue)",border:"1px solid rgba(37,99,235,0.18)",fontWeight:800,fontSize:13}}>Tim</button>
            <button onClick={()=>{onClose();onOpenMenu();}} style={{padding:"12px 10px",borderRadius:14,background:"var(--amber-dim)",color:"var(--amber)",border:"1px solid rgba(245,158,11,0.18)",fontWeight:800,fontSize:13}}>Menu</button>
          </div>
        )}
        <div style={{marginTop:"auto",paddingTop:4,flex:"0 0 auto"}}>
          <button onClick={()=>{onClose();onLogout();}} style={{width:"100%",padding:"13px 14px",borderRadius:16,background:"rgba(239,68,68,0.10)",color:"var(--red)",border:"1px solid rgba(239,68,68,0.18)",fontWeight:800,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9"/></svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Header ──
const Hdr = ({title,sub,left,right}) => (
  <div className="hdr-shell glass-card" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,
    borderBottom:"1px solid rgba(215,226,240,0.92)",flexShrink:0,boxShadow:"0 8px 26px rgba(15,23,42,0.05)",minHeight:68}}>
    <div style={{display:"flex",alignItems:"center",gap:12,minWidth:0,flex:1}}>
      {left}
      <div style={{minWidth:0}}>
        <h2 className="sora" style={{fontSize:16,fontWeight:800,color:"var(--text)",letterSpacing:"-0.03em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{title}</h2>
        {sub&&<p style={{fontSize:10,color:"var(--muted)",marginTop:2,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{sub}</p>}
      </div>
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
const Dashboard = ({orders,expenses,setExpenses,user,setScreen,target,setTarget,kasirs,mitras,menus,businessDate,sessionOpen,sessionDate,onBuka,onTutup}) => {
  const [editTarget,setEditTarget]=useState(false);
  const [tmpTarget,setTmpTarget]=useState(String(target));
  const [showExpForm,setShowExpForm]=useState(false);
  const [expDesc,setExpDesc]=useState("");
  const [expAmt,setExpAmt]=useState("");
  const [expOk,setExpOk]=useState(false);
  const [selectedHistoryDate,setSelectedHistoryDate]=useState(null);

  useEffect(()=>{
    if(sessionOpen) setSelectedHistoryDate(null);
  },[sessionOpen, sessionDate]);

  const activeDashboardDate = sessionOpen ? sessionDate : selectedHistoryDate;
  const financeDayMap = useMemo(()=>buildFinanceDayMap(orders, expenses, menus),[orders, expenses, menus]);
  const daySummary = activeDashboardDate ? getFinanceSummaryForDate(financeDayMap, activeDashboardDate) : emptyFinanceSummary(activeDashboardDate);
  const paidToday = daySummary.paidOrders;
  const openOrders=activeDashboardDate?orders.filter(o=>o.status==="open"&&orderSessionDate(o)===activeDashboardDate):[];
  const expsToday = daySummary.expenses;
  const pemasukan = daySummary.pemasukan;
  const pengeluaran = daySummary.pengeluaran;
  const progress=Math.min((pemasukan/target)*100,100);
  const mitraStats=useMemo(()=>{
    if(!mitras||mitras.length===0) return [];
    const sm={};
    paidToday.forEach(order=>{
      (order.items||[]).forEach(item=>{
        const menuRef=menus.find(m=>m.id===item.menuId);
        const mitraId=item.mitraId || menuRef?.mitraId;
        if(!mitraId) return;
        const hargaMitra=Number(item.hargaMitra ?? menuRef?.hargaMitra)||0;
        if(!sm[mitraId]) sm[mitraId]={penjualan:0,modal:0};
        const qty=Number(item.qty)||0;
        const hargaJual=Number(item.price)||0;
        sm[mitraId].penjualan+=hargaJual*qty;
        sm[mitraId].modal+=hargaMitra*qty;
      });
    });
    return mitras.map((m,i)=>({
      ...m,colorIdx:i,
      penjualan:sm[m.id]?.penjualan||0,
      modal:sm[m.id]?.modal||0,
      profit:(sm[m.id]?.penjualan||0)-(sm[m.id]?.modal||0),
    })).filter(m=>m.penjualan>0 || m.modal>0);
  },[paidToday,mitras,menus]);
  const totalMitraPenjualan = mitraStats.reduce((s,m)=>s+m.penjualan,0);
  const totalMitraModal = daySummary.modalMitra;
  const totalMitraProfit = mitraStats.reduce((s,m)=>s+m.profit,0);
  const totalPengeluaran = daySummary.totalKeluar;
  const bersih = daySummary.kas;
  const topAllTime=getTopMenus(orders.filter(o=>o.status==="paid"),5);
  const recentDates=useMemo(()=>Array.from({length:7},(_,i)=>{
    const d=getNow();
    d.setDate(d.getDate()-(6-i));
    return fmt(d);
  }),[]);
  const chartData=useMemo(()=>Array.from({length:7},(_,i)=>{
    const d=getNow();d.setDate(d.getDate()-(6-i));const ds=fmt(d);
    return {day:d.toLocaleDateString("id-ID",{weekday:"short"}),
      total:orders.filter(o=>o.status==="paid"&&orderSessionDate(o)===ds).reduce((s,o)=>s+o.total,0),isToday:ds===activeDashboardDate};
  }),[orders,activeDashboardDate]);

  const saveExp=()=>{
    if(!expDesc||!expAmt)return;
    const entryDate=sessionOpen?businessDate:fmt(getNow());
    const newExp={id:genId("EXP"),description:expDesc,amount:parseInt(expAmt),date:entryDate};
    setExpenses(p=>[...p,newExp]);
    supabase.from("expenses").upsert({id:newExp.id,description:newExp.description,amount:newExp.amount,date:newExp.date}).then();
    setExpDesc("");setExpAmt("");setExpOk(true);setTimeout(()=>setExpOk(false),1800);setShowExpForm(false);
    if(!sessionOpen) setSelectedHistoryDate(entryDate);
  };

  return(
    <div className="dashboard-scroll" style={{flex:1,overflowY:"auto",padding:"12px 16px 10px"}}>
      <div style={{marginBottom:12}}>
        <p style={{color:"var(--muted)",fontSize:12}}>{getNow().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long"})}</p>
        <h1 className="sora fu" style={{fontSize:20,fontWeight:800,color:"var(--text)",marginTop:2,letterSpacing:"-0.4px"}}>Halo, {user.name.split(" ")[0]}! ☕</h1>
      </div>

      {/* Tombol Buka/Tutup Sesi — owner saja */}
      {user.role==="owner"&&(
        <div className="fu" style={{marginBottom:12}}>
          {sessionOpen?(
            <div style={{background:"var(--green-dim)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:16,padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <div style={{width:9,height:9,borderRadius:"50%",background:"var(--green)",boxShadow:"0 0 8px var(--green)",flexShrink:0}}/>
                <p style={{color:"var(--green)",fontWeight:700,fontSize:14}}>Sesi Sedang Berjalan</p>
              </div>
              <p style={{color:"var(--muted)",fontSize:12,marginBottom:12}}>
                Tanggal rekap: <strong style={{color:"var(--text)"}}>{fmtFull(sessionDate)}</strong>
              </p>
              <button onClick={onTutup} style={{width:"100%",padding:"11px",borderRadius:11,
                background:"var(--red)",color:"#fff",fontWeight:700,fontSize:14,border:"none",
                display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer"}}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                </svg>
                Tutup Sesi Angkringan
              </button>
            </div>
          ):(
            <div style={{background:"var(--card)",border:"2px dashed var(--border)",borderRadius:16,padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <div style={{width:9,height:9,borderRadius:"50%",background:"var(--muted)",flexShrink:0}}/>
                <p style={{color:"var(--muted)",fontWeight:700,fontSize:14}}>Angkringan Belum Buka</p>
              </div>
              <p style={{color:"var(--muted)",fontSize:12,marginBottom:12}}>
                Tekan tombol di bawah untuk mulai sesi. Semua transaksi akan direkap ke tanggal hari ini.
              </p>
              <button onClick={onBuka} style={{width:"100%",padding:"13px",borderRadius:11,
                background:"var(--green)",color:"#fff",fontWeight:700,fontSize:15,border:"none",
                display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",
                boxShadow:"0 6px 20px rgba(16,185,129,0.25)"}}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Buka Sesi Angkringan
              </button>
            </div>
          )}
        </div>
      )}

      {/* Buka/Tutup Sesi untuk KASIR */}
      {user.role==="kasir"&&(
        <div className="fu" style={{marginBottom:12}}>
          {sessionOpen?(
            <div style={{background:"var(--green-dim)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:16,padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <div style={{width:9,height:9,borderRadius:"50%",background:"var(--green)",boxShadow:"0 0 8px var(--green)",flexShrink:0}}/>
                <p style={{color:"var(--green)",fontWeight:700,fontSize:14}}>Sesi Sedang Berjalan</p>
              </div>
              <p style={{color:"var(--muted)",fontSize:12,marginBottom:12}}>
                Tanggal rekap: <strong style={{color:"var(--text)"}}>{fmtFull(sessionDate)}</strong>
              </p>
              <button onClick={onTutup} style={{width:"100%",padding:"11px",borderRadius:11,
                background:"var(--red)",color:"#fff",fontWeight:700,fontSize:14,border:"none",
                display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer"}}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                </svg>
                Tutup Sesi Angkringan
              </button>
            </div>
          ):(
            <div style={{background:"var(--card)",border:"2px dashed var(--border)",borderRadius:16,padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <div style={{width:9,height:9,borderRadius:"50%",background:"var(--muted)",flexShrink:0}}/>
                <p style={{color:"var(--muted)",fontWeight:700,fontSize:14}}>Angkringan Belum Buka</p>
              </div>
              <p style={{color:"var(--muted)",fontSize:12,marginBottom:12}}>
                Tekan tombol di bawah untuk mulai sesi. Semua transaksi akan direkap ke tanggal hari ini.
              </p>
              <button onClick={onBuka} style={{width:"100%",padding:"13px",borderRadius:11,
                background:"var(--green)",color:"#fff",fontWeight:700,fontSize:15,border:"none",
                display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",
                boxShadow:"0 6px 20px rgba(16,185,129,0.25)"}}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Buka Sesi Angkringan
              </button>
            </div>
          )}
        </div>
      )}

      {!sessionOpen&&(
        <div className="fu" style={{marginBottom:12,background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:"14px 16px"}}>
          <p style={{color:"var(--text)",fontWeight:700,fontSize:14,marginBottom:4}}>Sesi sedang ditutup</p>
          <p style={{color:"var(--muted)",fontSize:12,lineHeight:1.5,marginBottom:12}}>Ringkasan Home direset ke 0. Pilih salah satu dari 7 hari terakhir untuk melihat tampilan Home per hari.</p>
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:2}}>
            {recentDates.map(ds=>{
              const active=selectedHistoryDate===ds;
              return(
                <button key={ds} onClick={()=>setSelectedHistoryDate(v=>v===ds?null:ds)} style={{
                  flexShrink:0,padding:"8px 11px",borderRadius:999,
                  background:active?"var(--amber)":"var(--card2)",
                  color:active?"#fff":"var(--text)",
                  border:`1px solid ${active?"rgba(245,166,35,0.35)":"var(--border)"}`,
                  fontSize:12,fontWeight:700
                }}>
                  {fmtShort(ds)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Ringkasan Keuangan Hari Ini */}
      <div className="dashboard-summary-grid" style={{gap:9,alignItems:"start"}}>
        {[{label:"Pemasukan",val:pemasukan,color:"var(--green)",bg:"var(--green-dim)"},
          {label:"Keluar + Modal",val:totalPengeluaran,color:"var(--red)",bg:"var(--red-dim)"},
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
        {/* Card Mitra */}
        {mitraStats.length>0&&(
          <div className="fu s3" style={{background:"var(--card)",border:"1px solid rgba(124,58,237,0.2)",borderRadius:13,padding:"12px 14px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:8}}>
              <div style={{width:36,height:36,borderRadius:10,background:"var(--purple-dim)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
              <span style={{color:"var(--muted)",fontSize:14}}>Penjualan Mitra</span>
              <span style={{color:"var(--green)",fontSize:10,fontWeight:700,background:"var(--green-dim)",padding:"3px 7px",borderRadius:999,whiteSpace:"nowrap"}}>Profit total {rupiah(totalMitraProfit)}</span>
            </div>
            {mitraStats.map((m,i)=>{
              const idx=m.colorIdx%4;
              return(
                <div key={m.id} style={{padding:"8px 9px",borderRadius:10,
                  background:MITRA_COLORS_DIM[idx],border:`1px solid ${MITRA_COLORS[idx]}22`,
                  marginBottom:i<mitraStats.length-1?7:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <span style={{width:24,height:24,borderRadius:7,background:MITRA_COLORS[idx],
                        color:"#fff",fontSize:11,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        {m.name[0]}
                      </span>
                      <span style={{color:"var(--text)",fontWeight:700,fontSize:13}}>{m.name}</span>
                    </div>
                    <span className="sora" style={{color:MITRA_COLORS[idx],fontWeight:700,fontSize:13}}>{rupiah(m.penjualan)}</span>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <div style={{flex:1,background:"rgba(255,255,255,0.55)",borderRadius:7,padding:"5px 8px",textAlign:"center"}}>
                      <p style={{color:"var(--muted)",fontSize:9,marginBottom:1}}>Modal</p>
                      <p style={{color:"var(--red)",fontWeight:700,fontSize:11}}>{rupiah(m.modal)}</p>
                    </div>
                    <div style={{flex:1,background:"rgba(255,255,255,0.55)",borderRadius:7,padding:"5px 8px",textAlign:"center"}}>
                      <p style={{color:"var(--muted)",fontSize:9,marginBottom:1}}>Profit</p>
                      <p style={{color:"var(--green)",fontWeight:700,fontSize:11}}>{rupiah(m.profit)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Kas Bersih */}
        {(()=>{const s={val:bersih,color:bersih>=0?"var(--amber)":"var(--red)",bg:bersih>=0?"var(--amber-dim)":"var(--red-dim)"};return(
          <div className={mitraStats.length>0?"fu s4":"fu s3"} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:13,
            padding:"12px 14px",display:"flex",flexDirection:"column",alignItems:"stretch"}}>
            <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{width:9,height:9,borderRadius:"50%",background:s.color}}/>
              </div>
              <span style={{color:"var(--muted)",fontSize:14}}>Kas Bersih</span>
            </div>
            <div style={{paddingLeft:2,marginBottom:12}}>
              <p className="sora" style={{fontSize:24,fontWeight:800,color:s.color,lineHeight:1.1}}>{rupiah(s.val)}</p>
              <p style={{color:"var(--muted)",fontSize:10,marginTop:6,lineHeight:1.5}}>Kas bersih = total pemasukan - (pengeluaran + modal mitra)</p>
            </div>
            <div style={{background:"var(--card2)",border:"1px dashed var(--border)",borderRadius:12,padding:"10px 11px",display:"flex",flexDirection:"column",gap:8}}>
              {[
                {label:"Total pemasukan",val:rupiah(pemasukan),color:"var(--green)"},
                {label:"Pengeluaran",val:rupiah(pengeluaran),color:"var(--red)"},
                {label:"Modal mitra",val:rupiah(totalMitraModal),color:"var(--purple)"},
                {label:"Total keluar",val:rupiah(totalPengeluaran),color:"var(--text)"},
              ].map((item,idx)=>(
                <div key={item.label} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,alignItems:"center",paddingBottom:idx<3?7:0,borderBottom:idx<3?"1px solid rgba(215,226,240,0.8)":"none"}}>
                  <p style={{color:"var(--muted)",fontSize:10,fontWeight:600}}>{item.label}</p>
                  <p className="sora" style={{color:item.color,fontWeight:700,fontSize:12,textAlign:"right"}}>{item.val}</p>
                </div>
              ))}
            </div>
          </div>
        );})()}
      </div>

      {/* Form Pengeluaran — owner kapan saja, kasir hanya saat sesi buka */}
      <div style={{marginTop:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
          <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>
            🧾 Pengeluaran {activeDashboardDate?fmtShort(activeDashboardDate):"Belum dipilih"} ({expsToday.length})
          </p>
          {(user.role==="owner"||(user.role==="kasir"&&sessionOpen))?(
            <button onClick={()=>setShowExpForm(v=>!v)} style={{
              background:"var(--red)",color:"#fff",borderRadius:10,padding:"6px 14px",
              fontWeight:700,fontSize:12,border:"none",cursor:"pointer",
              display:"flex",alignItems:"center",gap:5,
              boxShadow:"0 3px 10px rgba(239,68,68,0.25)"}}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              Tambah
            </button>
          ):(
            <span style={{fontSize:11,color:"var(--muted)",fontStyle:"italic"}}>Sesi belum buka</span>
          )}
        </div>
        {showExpForm&&(
          <div className="fi" style={{background:"var(--card)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:14,
            padding:"14px",marginBottom:10,display:"flex",flexDirection:"column",gap:10,
            boxShadow:"0 4px 16px rgba(239,68,68,0.08)"}}>
            <p style={{color:"var(--red)",fontWeight:700,fontSize:13,marginBottom:2}}>Catat Pengeluaran</p>
            <TxtInput label="Keterangan" value={expDesc} onChange={setExpDesc} placeholder="Beli es batu, gula, kopi..."/>
            <TxtInput label="Jumlah" type="number" value={expAmt} onChange={setExpAmt} placeholder="50000" prefix="Rp"/>
            {expOk&&(
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,
                background:"var(--green-dim)",borderRadius:8,padding:"8px"}}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                <p style={{color:"var(--green)",fontSize:12,fontWeight:600}}>Pengeluaran tersimpan!</p>
              </div>
            )}
            <div style={{display:"flex",gap:8}}>
              <Btn v="ghost" onClick={()=>{setShowExpForm(false);setExpDesc("");setExpAmt("");}} sm full>Batal</Btn>
              <Btn onClick={saveExp} disabled={!expDesc||!expAmt} sm full>Simpan</Btn>
            </div>
          </div>
        )}
        {!activeDashboardDate?(
          <div style={{background:"var(--card)",border:"1px dashed var(--border)",borderRadius:11,padding:16,textAlign:"center"}}>
            <p style={{color:"var(--muted)",fontSize:13}}>Pilih tanggal dari 7 hari terakhir untuk melihat detail Home.</p>
          </div>
        ):expsToday.length===0?(
          <div style={{background:"var(--card)",border:"1px dashed var(--border)",borderRadius:11,
            padding:16,textAlign:"center"}}>
            <p style={{color:"var(--muted)",fontSize:13}}>Belum ada pengeluaran hari ini</p>
          </div>
        ):expsToday.map(e=>(
          <div key={e.id} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:11,
            padding:"11px 14px",marginBottom:7,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <div style={{width:32,height:32,borderRadius:9,background:"var(--red-dim)",
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
              </div>
              <p style={{color:"var(--text)",fontSize:13}}>{e.description}</p>
            </div>
            <span style={{color:"var(--red)",fontWeight:700,fontSize:13,flexShrink:0,marginLeft:8}}>−{rupiah(e.amount)}</span>
          </div>
        ))}
      </div>

      {/* Kasir: omzet harian + grafik + menu terlaku (read-only, tanpa target edit) */}
      {user.role==="kasir"&&(<>
        <Card className="fu s4" style={{marginTop:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <p style={{color:"var(--muted)",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Omzet Hari Ini</p>
              <p className="sora" style={{color:"var(--amber)",fontWeight:800,fontSize:18,marginTop:2}}>{rupiah(pemasukan)}</p>
            </div>
            <div style={{textAlign:"right"}}>
              <p style={{color:"var(--muted)",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Target</p>
              <p className="sora" style={{color:"var(--text)",fontWeight:700,fontSize:15,marginTop:2}}>{rupiah(target)}</p>
            </div>
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
      </>)}

      {/* Owner: target + grafik + menu terlaku */}
      {user.role==="owner"&&(<>
        <Card className="fu s4" style={{marginTop:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <p style={{color:"var(--muted)",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Target Omzet Harian</p>
              {!editTarget&&<p className="sora" style={{color:"var(--text)",fontWeight:700,fontSize:15,marginTop:2}}>{rupiah(target)}</p>}
            </div>
            {editTarget?(
              <div style={{display:"flex",gap:7,alignItems:"center"}}>
                <div style={{background:"var(--card2)",border:"1px solid var(--border)",borderRadius:8,overflow:"hidden",width:110}}>
                  <input type="number" value={tmpTarget} onChange={e=>setTmpTarget(e.target.value)} style={{padding:"6px 10px",fontSize:14}}/>
                </div>
                <button onClick={()=>{setTarget(parseInt(tmpTarget)||target);setEditTarget(false);}} style={{color:"var(--green)",fontWeight:700,fontSize:13}}>OK</button>
              </div>
            ):(
              <button onClick={()=>{setTmpTarget(String(target));setEditTarget(true);}}
                style={{color:"var(--muted)",fontSize:12,border:"1px solid var(--border)",borderRadius:8,padding:"5px 10px"}}>Edit</button>
            )}
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
      </>)}
    </div>
  );
};

// ── POS ──
const POS = ({menus,orders,setOrders,user,businessDate,currentSessionId,kasirs,setScreen}) => {
  const [step,setStep]=useState("name");
  const [name,setName]=useState("");
  const [cat,setCat]=useState("Semua");
  const [cart,setCart]=useState([]);
  const [search,setSearch]=useState("");
  const [showSearch,setShowSearch]=useState(false);
  // bottom sheet untuk pilih suhu + catatan
  const [sheet,setSheet]=useState(null); // {menu} atau null
  const [sheetSuhu,setSheetSuhu]=useState("Ice");
  const [sheetNote,setSheetNote]=useState("");
  const [pgTrx,setPgTrx]=useState(0);

  const total=cart.reduce((s,c)=>s+c.price*c.qty,0);
  const cartKey=(menuId,suhu,note="",price=0,name="")=>buildItemKey({menuId,suhu,note,price,name});
  const qtyOf=(menuId,suhu,note="")=>cart.find(c=>c.cartKey===cartKey(menuId,suhu,note,c.price,c.name))?.qty||0;
  const totalQtyOf=menuId=>cart.filter(c=>c.menuId===menuId).reduce((s,c)=>s+c.qty,0);

  const openSheet=(m)=>{
    const def=m.suhu==="Hot"?"Hot":"Ice";
    setSheetSuhu(def);setSheetNote("");setSheet(m);
  };

  const addFromSheet=()=>{
    if(!sheet)return;
    const m=sheet;
    const needSuhu=!m.mitraId&&m.suhu&&m.suhu!=="Tidak Ada";
    const suhu=needSuhu?sheetSuhu:null;
    const note = sheetNote.trim();
    const displayName=needSuhu?`${m.name} (${suhu})`:m.name;
    const key=cartKey(m.id,suhu,note,m.price,displayName);
    setCart(p=>{
      const e=p.find(c=>c.cartKey===key);
      if(e)return p.map(c=>c.cartKey===key?{...c,qty:c.qty+1}:c);
      return [...p,{cartKey:key,menuId:m.id,name:displayName,price:m.price,qty:1,suhu,note,mitraId:m.mitraId||null,hargaMitra:m.hargaMitra||null}];
    });
    setSheet(null);setSheetNote("");
  };

  const chg=(key,d)=>setCart(p=>p.map(c=>c.cartKey===key?{...c,qty:c.qty+d}:c).filter(c=>c.qty>0));
  const reset=()=>{setStep("name");setName("");setCart([]);setCat("Semua");setSearch("");setShowSearch(false);};
  const quickMenus=useMemo(()=>{
    const freq={};orders.forEach(o=>o.items.forEach(i=>{freq[i.menuId]=(freq[i.menuId]||0)+i.qty;}));
    return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,4)
      .map(([id])=>menus.find(m=>String(m.id)===id)).filter(m=>m?.available);
  },[orders,menus]);

  const filtered=menus.filter(m=>{
    if(!m.available)return false;
    if(cat!=="Semua"&&m.category!==cat)return false;
    if(search&&!m.name.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });

  const [bayarModal,setBayarModal]=useState(false);
  const [uangDibayar,setUangDibayar]=useState("");
  const [successState,setSuccessState]=useState(null);
  const kembalian=uangDibayar&&parseInt(uangDibayar)>=total?parseInt(uangDibayar)-total:null;
  const submit=now=>{
    if(now){setBayarModal(true);return;}
    const newOrder=normalizeOrder({id:genId("ORD"),customerName:name,status:"open",
      sessionDate:businessDate,sessionId:currentSessionId||null,createdAt:localISO(),paidAt:null,items:cart,total,kasirId:user.id,lastDeviceId:user.id});
    setOrders(p=>[...p,newOrder]);
    setSuccessState({type:"nanti",kembalian:0,order:newOrder,mode:"nanti"});
  };
  const konfirmasiBayar=()=>{
    if(!uangDibayar||parseInt(uangDibayar)<total)return;
    const kemb=parseInt(uangDibayar)-total;
    const newOrder=normalizeOrder({id:genId("ORD"),customerName:name,status:"paid",
      sessionDate:businessDate,sessionId:currentSessionId||null,createdAt:localISO(),paidAt:localISO(),items:cart,total,kasirId:user.id,lastDeviceId:user.id});
    setOrders(p=>[...p,newOrder]);
    setBayarModal(false);setUangDibayar("");
    setSuccessState({type:"lunas",kembalian:kemb,order:newOrder,mode:"lunas"});
  };

  // Histori transaksi hari ini
  const todayOrders=orders.filter(o=>orderSessionDate(o)===businessDate).sort((a,b)=>b.id.localeCompare(a.id));
  const todayPaid=todayOrders.filter(o=>o.status==="paid");
  const todayOpen=todayOrders.filter(o=>o.status==="open");

  if(successState)return <SuccessOverlay
    type={successState.type}
    kembalian={successState.kembalian}
    onPrint={()=>printStruk(successState.order,successState.kembalian,kasirs,successState.mode || (successState.type==="lunas"||successState.type==="parsial"?"lunas":"nanti"))}
    onBack={()=>{setSuccessState(null);reset();}}
    backLabel="Kembali"
  />;
  if(step==="name")return(
    <div className="pos-name-screen" style={{flex:1,overflowY:"auto",padding:"18px 18px 12px",display:"flex",flexDirection:"column",gap:16}}>
      <div>
        <div className="fu"><p style={{color:"var(--muted)",fontSize:12,textTransform:"uppercase",letterSpacing:"0.05em",fontWeight:600}}>Pesanan Baru</p>
          <h2 className="sora" style={{fontSize:20,fontWeight:800,color:"var(--text)",marginTop:3}}>Nama Pelanggan</h2></div>
        <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:12}}>
          <TxtInput label="Nama" value={name} onChange={setName} placeholder="Contoh: Budi, Sari..."/>
          <Btn onClick={()=>setStep("menu")} disabled={!name.trim()} full>Pilih Menu →</Btn>
        </div>
      </div>
      {todayOpen.length>0&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
            <p style={{fontSize:11,color:"var(--red)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em"}}>⏳ Belum Bayar ({todayOpen.length})</p>
            <button onClick={()=>setScreen("tagihan")} style={{fontSize:12,color:"var(--amber)",fontWeight:600,background:"none",border:"none",cursor:"pointer"}}>Kelola →</button>
          </div>
          {todayOpen.map(o=>(
            <div key={o.id} onClick={()=>setScreen("tagihan")} style={{background:"var(--card)",border:"1px solid rgba(239,68,68,0.2)",
              borderRadius:11,padding:"10px 13px",marginBottom:7,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
              <div>
                <p style={{color:"var(--text)",fontWeight:600,fontSize:14}}>{o.customerName}</p>
                <p style={{color:"var(--muted)",fontSize:11,marginTop:2}}>{o.items.map(i=>`${i.name} ×${i.qty}`).join(" · ")}</p>
              </div>
              <span style={{color:"var(--red)",fontWeight:700,fontSize:13,flexShrink:0,marginLeft:8}}>{rupiah(o.total)}</span>
            </div>
          ))}
        </div>
      )}
      <div>
        <p style={{fontSize:11,color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:9}}>✅ Transaksi Sesi ({todayPaid.length})</p>
        {todayPaid.length===0?(
          <Card style={{textAlign:"center",padding:16}}><p style={{color:"var(--muted)",fontSize:13}}>Belum ada transaksi untuk sesi ini</p></Card>
        ):(()=>{
          const sorted=[...todayPaid].sort((a,b)=>(orderActualPaidAt(b)||"").localeCompare(orderActualPaidAt(a)||""));
          const PAGE=10;
          const total_pages=Math.ceil(sorted.length/PAGE);
          const pg=Math.min(pgTrx,total_pages-1);
          const slice=sorted.slice(pg*PAGE,(pg+1)*PAGE);
          return(<>
            {slice.map((o,i)=>(<div key={o.id} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:11,padding:"10px 13px",marginBottom:7}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <span style={{width:22,height:22,borderRadius:6,background:"var(--green-dim)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"var(--green)",flexShrink:0}}>{pg*PAGE+i+1}</span>
                    <div>
                      <p style={{color:"var(--text)",fontWeight:600,fontSize:14}}>{o.customerName}</p>
                      <PaymentMeta order={o}/>
                    </div>
                  </div>
                  <span style={{color:"var(--green)",fontWeight:700,fontSize:13,flexShrink:0,marginLeft:8}}>{rupiah(o.total)}</span>
                </div>
                <p style={{color:"var(--muted)",fontSize:11,marginTop:5,paddingLeft:29,lineHeight:1.4}}>
                  {o.items.map(i=>`${i.name} ×${i.qty}${i.note?` • ${i.note}`:""}`).join(" · ")}
                </p>
                {kasirs.length>1&&<div style={{paddingLeft:29,marginTop:4}}><KasirChip kasirId={o.kasirId} kasirs={kasirs}/></div>}
              </div>))}
            {total_pages>1&&(
              <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,marginTop:8}}>
                <button onClick={()=>setPgTrx(p=>Math.max(0,p-1))} disabled={pg===0}
                  style={{width:30,height:30,borderRadius:8,background:"var(--card2)",border:"1px solid var(--border)",
                  color:pg===0?"var(--muted)":"var(--text)",fontWeight:700,cursor:pg===0?"default":"pointer"}}>‹</button>
                <span style={{fontSize:12,color:"var(--muted)",fontWeight:600}}>{pg+1} / {total_pages}</span>
                <button onClick={()=>setPgTrx(p=>Math.min(total_pages-1,p+1))} disabled={pg===total_pages-1}
                  style={{width:30,height:30,borderRadius:8,background:"var(--card2)",border:"1px solid var(--border)",
                  color:pg===total_pages-1?"var(--muted)":"var(--text)",fontWeight:700,cursor:pg===total_pages-1?"default":"pointer"}}>›</button>
              </div>
            )}
          </>);
        })()}
      </div>
    </div>
  );

  if(step==="menu")return(<div className="pos-menu-screen" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative"}}>
    <div style={{padding:"11px 18px 9px",borderBottom:"1px solid var(--border)",flexShrink:0}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:showSearch?8:6}}>
        <div style={{minWidth:0}}>
          <p style={{color:"var(--amber)",fontWeight:700,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{name}</p>
          {!showSearch&&<p style={{color:"var(--muted)",fontSize:10,marginTop:1}}>Pilih menu untuk ditambahkan ke pesanan</p>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <button onClick={()=>{if(showSearch){setShowSearch(false);setSearch("");}else setShowSearch(true);}} style={{width:36,height:36,borderRadius:11,background:showSearch?"var(--amber-dim)":"rgba(255,255,255,0.82)",border:`1px solid ${showSearch?"rgba(245,158,11,0.28)":"var(--border)"}`,display:"flex",alignItems:"center",justifyContent:"center",color:showSearch?"var(--amber)":"var(--muted)",boxShadow:"0 8px 18px rgba(15,23,42,0.05)"}}>
            <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </button>
          <Btn v="ghost" sm onClick={reset}>Batal</Btn>
        </div>
      </div>
      {showSearch&&(
        <div style={{display:"flex",alignItems:"center",gap:8,background:"var(--card2)",border:"1px solid var(--border)",borderRadius:11,padding:"7px 11px",marginBottom:7}}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari menu..." style={{flex:1,background:"none",border:"none",outline:"none",fontSize:14,color:"var(--text)",fontFamily:"'DM Sans',sans-serif"}}/>
          {(search||showSearch)&&<button onClick={()=>{setSearch("");setShowSearch(false);}} style={{color:"var(--muted)",fontSize:16,lineHeight:1}}>×</button>}
        </div>
      )}
      {!showSearch&&quickMenus.length>0&&(<div style={{marginBottom:7}}>
        <p style={{color:"var(--muted)",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>⚡ Quick Order</p>
        <div style={{display:"flex",gap:7,overflowX:"auto",scrollbarWidth:"none",paddingBottom:2}}>
          {quickMenus.map(m=>{const q=totalQtyOf(m.id);return(<div key={m.id} onClick={()=>openSheet(m)} style={{flexShrink:0,
            background:q>0?"rgba(245,166,35,0.1)":"var(--card2)",border:`1px solid ${q>0?"rgba(245,166,35,0.3)":"var(--border)"}`,
            borderRadius:10,padding:"7px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
            {q>0&&<span style={{background:"var(--amber)",color:"#fff",borderRadius:"50%",width:18,height:18,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{q}</span>}
            <div><p style={{color:"var(--text)",fontWeight:600,fontSize:11,whiteSpace:"nowrap"}}>{m.name}</p>
              <p style={{color:"var(--amber)",fontWeight:700,fontSize:10}}>{rupiah(m.price)}</p></div>
          </div>);})}
        </div>
      </div>)}
      {!showSearch&&<CatBar val={cat} set={setCat}/>}
    </div>
    <div className="menu-grid" style={{flex:1,overflowY:"auto",padding:"8px 16px 10px"}}>
      {filtered.length===0&&(
        <div style={{gridColumn:"1/-1",textAlign:"center",padding:32}}>
          <p style={{color:"var(--muted)",fontSize:13}}>{search?`Menu "${search}" tidak ditemukan`:"Belum ada menu yang tampil di kategori ini"}</p>
        </div>
      )}
      {filtered.map(m=>{
        const q=totalQtyOf(m.id);
        const hasSuhu=!m.mitraId&&m.suhu&&m.suhu!=="Tidak Ada";
        return(<div key={m.id} style={{background:q>0?"rgba(245,166,35,0.07)":"var(--card)",
          border:`1px solid ${q>0?"rgba(245,166,35,0.3)":"var(--border)"}`,borderRadius:13,padding:"10px 9px"}}>
          <p style={{color:"var(--muted)",fontSize:9,marginBottom:2}}>{m.category}</p>
          <p style={{color:"var(--text)",fontWeight:600,fontSize:12,lineHeight:1.25,marginBottom:3}}>{m.name}</p>
          {hasSuhu&&(
            <div style={{display:"flex",gap:4,marginBottom:5}}>
              {m.suhu==="Keduanya"?(<>
                <span style={{fontSize:10,background:"var(--blue-dim)",color:"var(--blue)",padding:"1px 6px",borderRadius:99,fontWeight:600}}>🧊 Ice</span>
                <span style={{fontSize:10,background:"var(--red-dim)",color:"var(--red)",padding:"1px 6px",borderRadius:99,fontWeight:600}}>🔥 Hot</span>
              </>):m.suhu==="Ice"?(
                <span style={{fontSize:10,background:"var(--blue-dim)",color:"var(--blue)",padding:"1px 6px",borderRadius:99,fontWeight:600}}>🧊 Ice</span>
              ):(
                <span style={{fontSize:10,background:"var(--red-dim)",color:"var(--red)",padding:"1px 6px",borderRadius:99,fontWeight:600}}>🔥 Hot</span>
              )}
            </div>
          )}
          <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:7}}>
            <p style={{color:"var(--amber)",fontWeight:700,fontSize:12}}>{rupiah(m.price)}</p>
            {m.mitraId&&m.hargaMitra&&m.price>m.hargaMitra&&(
              <span style={{background:"var(--green-dim)",color:"var(--green)",fontSize:10,fontWeight:700,
                padding:"1px 6px",borderRadius:99,flexShrink:0}}>
                +{rupiah(m.price-m.hargaMitra)}
              </span>
            )}
          </div>
          <button onClick={()=>openSheet(m)} style={{width:"100%",padding:"6px",borderRadius:8,
            background:q>0?"var(--amber)":"var(--amber-dim)",
            color:q>0?"#fff":"var(--amber)",border:"1px solid rgba(245,166,35,0.2)",fontSize:11,fontWeight:700}}>
            {q>0?`${q}× Tambah`:"+ Tambah"}
          </button>
        </div>);
      })}
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

    {/* Bottom sheet suhu + catatan */}
    {sheet&&(<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",zIndex:300,display:"flex",alignItems:"flex-end"}}
      onClick={()=>setSheet(null)}>
      <div className="fu" style={{background:"var(--bg2)",borderRadius:"20px 20px 0 0",padding:"20px 20px 30px",
        width:"100%",display:"flex",flexDirection:"column",gap:14}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <p style={{color:"var(--muted)",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Tambah ke pesanan</p>
            <p className="sora" style={{color:"var(--text)",fontWeight:700,fontSize:16,marginTop:2}}>{sheet.name}</p>
          </div>
          <p className="sora" style={{color:"var(--amber)",fontWeight:800,fontSize:16}}>{rupiah(sheet.price)}</p>
        </div>

        {/* Pilih suhu — hanya untuk menu sendiri yang punya opsi suhu */}
        {!sheet.mitraId&&sheet.suhu&&sheet.suhu!=="Tidak Ada"&&(
          <div>
            <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:9}}>Suhu</p>
            <div style={{display:"flex",gap:9}}>
              {(sheet.suhu==="Keduanya"?["Ice","Hot"]:sheet.suhu==="Ice"?["Ice"]:["Hot"]).map(s=>(
                <button key={s} onClick={()=>setSheetSuhu(s)} style={{flex:1,padding:"11px",borderRadius:11,fontWeight:700,fontSize:14,
                  background:sheetSuhu===s?(s==="Ice"?"var(--blue-dim)":"var(--red-dim)"):"var(--card2)",
                  color:sheetSuhu===s?(s==="Ice"?"var(--blue)":"var(--red)"):"var(--muted)",
                  border:`1px solid ${sheetSuhu===s?(s==="Ice"?"rgba(59,130,246,0.4)":"rgba(239,68,68,0.4)"):"var(--border)"}`}}>
                  {s==="Ice"?"🧊 Ice":"🔥 Hot"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Catatan */}
        <div>
          <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Catatan (opsional)</p>
          <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:11,overflow:"hidden"}}>
            <textarea value={sheetNote} onChange={e=>setSheetNote(e.target.value)}
              placeholder="Misal: less sugar, extra pedas..."
              rows={2} style={{width:"100%",padding:"11px 14px",background:"none",border:"none",outline:"none",
                resize:"none",fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"var(--text)",boxSizing:"border-box"}}/>
          </div>
        </div>

        <Btn onClick={addFromSheet} full>Tambah ke Pesanan</Btn>
      </div>
    </div>)}
  </div>);

  // Step confirm
  return(<div className="pos-confirm-screen" style={{flex:1,overflowY:"auto",padding:"18px",display:"flex",flexDirection:"column",gap:13}}>
    <div className="fu"><p style={{color:"var(--muted)",fontSize:12}}>Konfirmasi pesanan</p>
      <h2 className="sora" style={{fontSize:20,fontWeight:800,color:"var(--amber)"}}>{name}</h2></div>
    <Card className="fu s1">{cart.map((item,i)=>(
      <div key={item.cartKey} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",
        borderBottom:i<cart.length-1?"1px solid var(--border)":"none"}}>
        <div style={{flex:1,minWidth:0}}>
          <p style={{color:"var(--text)",fontWeight:500,fontSize:14}}>{item.name}</p>
          {item.note&&<p style={{color:"var(--blue)",fontSize:11,marginTop:2}}>📝 {item.note}</p>}
          <p style={{color:"var(--muted)",fontSize:12,marginTop:1}}>{item.qty} × {rupiah(item.price)}</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0,marginLeft:8}}>
          <p style={{color:"var(--text)",fontWeight:700}}>{rupiah(item.price*item.qty)}</p>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <button onClick={()=>chg(item.cartKey,-1)} style={{width:24,height:24,borderRadius:6,background:"var(--card2)",border:"1px solid var(--border)",color:"var(--text)",fontSize:14}}>−</button>
            <button onClick={()=>chg(item.cartKey,1)} style={{width:24,height:24,borderRadius:6,background:"var(--amber)",color:"#fff",fontSize:14,border:"none"}}>+</button>
          </div>
        </div>
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
    {bayarModal&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={()=>{setBayarModal(false);setUangDibayar("");}}>
      <div className="fu" style={{background:"var(--bg2)",borderRadius:"20px 20px 0 0",padding:"22px 20px 36px",width:"100%",display:"flex",flexDirection:"column",gap:14}} onClick={e=>e.stopPropagation()}>
        <h3 className="sora" style={{fontWeight:700,color:"var(--text)",fontSize:16}}>💳 Pembayaran — {name}</h3>
        <div style={{background:"var(--card)",borderRadius:12,padding:"13px 15px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:"var(--muted)",fontSize:13}}>Total Tagihan</span>
          <span className="sora" style={{fontWeight:800,color:"var(--amber)",fontSize:18}}>{rupiah(total)}</span>
        </div>
        <TxtInput label="Uang Diterima" type="number" value={uangDibayar} onChange={v=>setUangDibayar(v)} placeholder="0" prefix="Rp"/>
        {uangDibayar&&parseInt(uangDibayar)<total&&(
          <p style={{color:"var(--red)",fontSize:13,fontWeight:600,textAlign:"center"}}>⚠ Kurang {rupiah(total-parseInt(uangDibayar))}</p>
        )}
        {kembalian!==null&&(
          <div style={{background:"var(--green-dim)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:12,padding:"13px 15px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:"var(--green)",fontWeight:600,fontSize:13}}>✓ Kembalian</span>
            <span className="sora" style={{fontWeight:800,color:"var(--green)",fontSize:20}}>{rupiah(kembalian)}</span>
          </div>
        )}
        <Btn v="success" onClick={konfirmasiBayar} disabled={!uangDibayar||parseInt(uangDibayar)<total} full>✓ Konfirmasi Lunas</Btn>
        <Btn v="ghost" onClick={()=>{setBayarModal(false);setUangDibayar("");}} full>Batal</Btn>
      </div>
    </div>)}
  </div>);
};

// ── Tagihan ──
const Tagihan = ({orders,setOrders,menus,user,kasirs,businessDate,currentSessionId}) => {
  const [sel,setSel]=useState(null);
  const [adding,setAdding]=useState(false);
  const [cat,setCat]=useState("Semua");
  const [sheet,setSheet]=useState(null);
  const [sheetSuhu,setSheetSuhu]=useState("Ice");
  const [sheetNote,setSheetNote]=useState("");
  const [bayarItem,setBayarItem]=useState(null);
  const [uangItem,setUangItem]=useState("");
  const [lunasModal,setLunasModal]=useState(false);
  const [uangLunas,setUangLunas]=useState("");
  const [successState,setSuccessState]=useState(null);

  const getLineKey = item => item?.cartKey || buildItemKey(item);
  const getItemsTotal = items => items.reduce((s,i)=>s+(Number(i.price)||0)*(Number(i.qty)||0),0);
  const openOrders=orders.filter(o=>o.status==="open"&&o.total>0&&orderSessionDate(o)===businessDate);
  const carryOverOrders=orders.filter(o=>o.status==="open"&&o.total>0&&orderSessionDate(o)!==businessDate);
  const ord=orders.find(o=>o.id===sel);

  const openSheet = m => {
    const def=m.suhu==="Hot"?"Hot":"Ice";
    setSheetSuhu(def);
    setSheetNote("");
    setSheet(m);
  };

  const addItemFromSheet = () => {
    if(!sheet || !sel || !ord) return;
    const m = sheet;
    const needSuhu=!m.mitraId&&m.suhu&&m.suhu!=="Tidak Ada";
    const suhu=needSuhu?sheetSuhu:null;
    const note=sheetNote.trim();
    const displayName=needSuhu?`${m.name} (${suhu})`:m.name;
    const lineKey=buildItemKey({menuId:m.id,name:displayName,suhu,note,price:m.price});
    const addedItem = {cartKey:lineKey,menuId:m.id,name:displayName,price:m.price,qty:1,suhu,note,mitraId:m.mitraId||null,hargaMitra:m.hargaMitra||null};
    const addedOrderForPrint = normalizeOrder({
      ...ord,
      status:"open",
      sessionDate: orderSessionDate(ord) || businessDate,
      sessionId: ord.sessionId || currentSessionId || null,
      paidAt:null,
      items:[addedItem],
      total:getItemsTotal([addedItem]),
      lastDeviceId:user.id,
    });

    setOrders(prev=>prev.map(order=>{
      if(order.id!==sel) return order;
      const items = [...(order.items||[])];
      const existingIndex = items.findIndex(item=>getLineKey(item)===lineKey && !item.paid);
      if(existingIndex>=0){
        items[existingIndex] = {...items[existingIndex], qty:(Number(items[existingIndex].qty)||0)+1};
      }else{
        items.push(addedItem);
      }
      return normalizeOrder({
        ...order,
        sessionDate: orderSessionDate(order) || businessDate,
        sessionId: order.sessionId || currentSessionId || null,
        items,
        total:getItemsTotal(items.filter(item=>!item.paid)),
        lastDeviceId:user.id,
      });
    }));

    setSheet(null);
    setSheetNote("");
    setAdding(false);
    setSuccessState({type:"tambah",kembalian:0,order:addedOrderForPrint,mode:"nanti"});
  };

  const bayarSatuItem=()=>{
    if(!bayarItem||!uangItem||parseInt(uangItem)<bayarItem.subtotal||!ord)return;
    const paidAt = localISO();
    const kemb = parseInt(uangItem)-bayarItem.subtotal;
    const remainingAfterPay = (ord.items||[]).filter(item=>getLineKey(item)!==bayarItem.lineKey && !item.paid);
    const isCompleted = remainingAfterPay.length===0;
    const paidItemsForPrint = (ord.items||[])
      .filter(item=>getLineKey(item)===bayarItem.lineKey)
      .map(item=>({...item,paid:true,cartKey:getLineKey(item)}));
    const paidOrderForPrint = normalizeOrder({
      ...ord,
      id:isCompleted ? ord.id : genId("PAY"),
      status:"paid",
      sessionDate: orderSessionDate(ord) || businessDate,
      sessionId: ord.sessionId || currentSessionId || null,
      paidAt,
      kasirId:user.id,
      items:paidItemsForPrint,
      total:bayarItem.subtotal,
      lastDeviceId:user.id,
    });

    setOrders(prev=>prev.flatMap(sourceOrder=>{
      if(sourceOrder.id!==sel) return [sourceOrder];
      const order = normalizeOrder(sourceOrder);
      const sessionDate = orderSessionDate(order) || businessDate;
      const sessionId = order.sessionId || currentSessionId || null;
      const paidLine = order.items.find(item=>getLineKey(item)===bayarItem.lineKey);
      if(!paidLine) return [order];

      const remainingItems = order.items
        .filter(item=>getLineKey(item)!==bayarItem.lineKey && !item.paid)
        .map(({paid,...rest})=>({...rest, cartKey:getLineKey(rest)}));
      const paidItem = {...paidLine, paid:true, cartKey:getLineKey(paidLine)};
      const paidTotal = getItemsTotal([paidItem]);

      if(remainingItems.length===0){
        return [normalizeOrder({
          ...order,
          status:"paid",
          sessionDate,
          sessionId,
          paidAt,
          kasirId:user.id,
          items:[paidItem],
          total:paidTotal,
          lastDeviceId:user.id,
        })];
      }

      return [
        normalizeOrder({
          ...order,
          status:"open",
          sessionDate,
          sessionId,
          paidAt:null,
          items:remainingItems,
          total:getItemsTotal(remainingItems),
          lastDeviceId:user.id,
        }),
        normalizeOrder({
          ...paidOrderForPrint,
          items:[paidItem],
          total:paidTotal,
        })
      ];
    }));

    setBayarItem(null);
    setUangItem("");
    if(isCompleted){
      setSel(null);
      setAdding(false);
      setSuccessState({type:"lunas",kembalian:kemb,order:paidOrderForPrint,mode:"lunas"});
    } else {
      setSuccessState({type:"parsial",kembalian:kemb,order:paidOrderForPrint,mode:"lunas"});
    }
  };

  const konfirmasiLunas=()=>{
    if(!uangLunas||!ord||parseInt(uangLunas)<ord.total)return;
    const paidAt = localISO();
    const kemb = parseInt(uangLunas)-ord.total;
    const updatedOrder = normalizeOrder({
      ...ord,
      status:"paid",
      sessionDate: orderSessionDate(ord) || businessDate,
      sessionId: ord.sessionId || currentSessionId || null,
      paidAt,
      kasirId:user.id,
      items:(ord.items||[]).map(item=>({...item,paid:true,cartKey:getLineKey(item)})),
      lastDeviceId:user.id,
    });
    setOrders(prev=>prev.map(order=>order.id===sel ? updatedOrder : order));
    setLunasModal(false);
    setUangLunas("");
    setSel(null);
    setSuccessState({type:"lunas",kembalian:kemb,order:updatedOrder,mode:"lunas"});
  };

  const kembalianItem=uangItem&&bayarItem&&parseInt(uangItem)>=bayarItem.subtotal?parseInt(uangItem)-bayarItem.subtotal:null;
  const kembalianLunas=uangLunas&&ord&&parseInt(uangLunas)>=ord.total?parseInt(uangLunas)-ord.total:null;

  if(successState)return <SuccessOverlay
    type={successState.type}
    kembalian={successState.kembalian}
    onPrint={()=>printStruk(successState.order,successState.kembalian,kasirs,successState.mode || (successState.type==="lunas"||successState.type==="parsial"?"lunas":"nanti"))}
    onBack={()=>setSuccessState(null)}
    backLabel={successState.type==="lunas"?"Kembali":"Kembali ke Tagihan"}
  />;
  if(sel&&ord)return(<div className="tagihan-detail-screen" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
    <Hdr title={ord.customerName} sub={`Sisa ${rupiah(ord.total)} · Sesi ${fmtShort(orderSessionDate(ord)||businessDate)}`}
      right={<div style={{display:"flex",alignItems:"center",gap:8}}>
        <KasirChip kasirId={ord.kasirId} kasirs={kasirs}/>
        <button onClick={()=>{setSel(null);setAdding(false);setSheet(null);}} style={{color:"var(--amber)",display:"flex"}}>
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
      <div className="menu-grid" style={{flex:1,overflowY:"auto",padding:"11px 18px"}}>
        {menus.filter(m=>m.available&&(cat==="Semua"||m.category===cat)).map(m=>{
          const hasSuhu=!m.mitraId&&m.suhu&&m.suhu!=="Tidak Ada";
          return(
            <div key={m.id} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:13,padding:"12px 10px"}}>
              <p style={{color:"var(--muted)",fontSize:10}}>{m.category}</p>
              <p style={{color:"var(--text)",fontWeight:600,fontSize:13,margin:"3px 0 6px"}}>{m.name}</p>
              {hasSuhu&&(
                <p style={{color:"var(--blue)",fontSize:10,fontWeight:600,marginBottom:6}}>{m.suhu==="Keduanya"?"Ice / Hot":m.suhu}</p>
              )}
              <p style={{color:"var(--amber)",fontWeight:700,fontSize:13,marginBottom:9}}>{rupiah(m.price)}</p>
              <button onClick={()=>openSheet(m)} style={{width:"100%",padding:"7px",borderRadius:8,
                background:"var(--amber-dim)",color:"var(--amber)",border:"1px solid rgba(245,166,35,0.2)",fontSize:12,fontWeight:600}}>+ Tambah</button>
            </div>
          );
        })}
      </div></>
    ):(
      <div style={{flex:1,overflowY:"auto",padding:"17px",display:"flex",flexDirection:"column",gap:13}}>
        <Card>{ord.items.map((item,i)=>{
          const subtotal=item.price*item.qty;
          const lineKey=getLineKey(item);
          return(<div key={lineKey} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",
            borderBottom:i<ord.items.length-1?"1px solid var(--border)":"none",
            opacity:item.paid?0.45:1}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                <p style={{color:"var(--text)",fontWeight:500,fontSize:14}}>{item.name}</p>
                {item.paid&&<span style={{background:"var(--green-dim)",color:"var(--green)",fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:99}}>✓ Dibayar</span>}
              </div>
              {item.note&&<p style={{color:"var(--blue)",fontSize:11,marginTop:2}}>📝 {item.note}</p>}
              <p style={{color:"var(--muted)",fontSize:12,marginTop:2}}>{item.qty} × {rupiah(item.price)}</p>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0,marginLeft:8}}>
              <p style={{color:item.paid?"var(--muted)":"var(--text)",fontWeight:700,fontSize:14}}>{rupiah(subtotal)}</p>
              {!item.paid&&(
                <button onClick={()=>{setBayarItem({...item,subtotal,lineKey});setUangItem("");}}
                  style={{background:"var(--amber)",color:"#fff",border:"none",borderRadius:8,padding:"5px 10px",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                  Bayar
                </button>
              )}
            </div>
          </div>);
        })}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:11,paddingTop:11,borderTop:"1px solid var(--border)"}}>
            <span className="sora" style={{fontWeight:700,color:"var(--text)"}}>Sisa Tagihan</span>
            <span className="sora" style={{fontWeight:800,color:"var(--amber)",fontSize:20}}>{rupiah(ord.total)}</span>
          </div>
        </Card>
        <Btn v="dark" onClick={()=>setAdding(true)} full>+ Tambah Pesanan</Btn>
        <Btn v="success" onClick={()=>{setUangLunas("");setLunasModal(true);}} full>✓ Lunasi Semua — {rupiah(ord.total)}</Btn>
      </div>
    )}

    {sheet&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:320,display:"flex",alignItems:"flex-end"}} onClick={()=>setSheet(null)}>
      <div className="fu" style={{background:"var(--bg2)",borderRadius:"20px 20px 0 0",padding:"22px 20px 36px",width:"100%",display:"flex",flexDirection:"column",gap:14}} onClick={e=>e.stopPropagation()}>
        <div>
          <p style={{color:"var(--muted)",fontSize:12}}>Tambah item ke tagihan</p>
          <h3 className="sora" style={{fontWeight:700,color:"var(--text)",fontSize:18,marginTop:2}}>{sheet.name}</h3>
          <p className="sora" style={{color:"var(--amber)",fontWeight:800,fontSize:16,marginTop:4}}>{rupiah(sheet.price)}</p>
        </div>
        {!sheet.mitraId&&sheet.suhu&&sheet.suhu!=="Tidak Ada"&&(
          <div>
            <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Suhu</p>
            <div style={{display:"flex",gap:8}}>
              {(sheet.suhu==="Keduanya"?[{label:"🧊 Ice",v:"Ice"},{label:"🔥 Hot",v:"Hot"}]:[{label:sheet.suhu==="Hot"?"🔥 Hot":"🧊 Ice",v:sheet.suhu==="Hot"?"Hot":"Ice"}]).map(opt=>(
                <button key={opt.v} onClick={()=>setSheetSuhu(opt.v)} style={{flex:1,padding:"10px 12px",borderRadius:10,
                  background:sheetSuhu===opt.v?"var(--amber-dim)":"var(--card)",color:sheetSuhu===opt.v?"var(--amber)":"var(--muted)",
                  border:`1px solid ${sheetSuhu===opt.v?"rgba(245,166,35,0.35)":"var(--border)"}`,fontSize:12,fontWeight:600}}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Catatan (opsional)</p>
          <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:11,overflow:"hidden"}}>
            <textarea value={sheetNote} onChange={e=>setSheetNote(e.target.value)} placeholder="Misal: less sugar, tanpa es, ekstra pedas..."
              rows={2} style={{width:"100%",padding:"11px 14px",background:"none",border:"none",outline:"none",resize:"none",fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"var(--text)",boxSizing:"border-box"}}/>
          </div>
        </div>
        <Btn onClick={addItemFromSheet} full>Tambah ke Tagihan</Btn>
      </div>
    </div>)}

    {bayarItem&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={()=>{setBayarItem(null);setUangItem("");}}>
      <div className="fu" style={{background:"var(--bg2)",borderRadius:"20px 20px 0 0",padding:"22px 20px 36px",width:"100%",display:"flex",flexDirection:"column",gap:14}} onClick={e=>e.stopPropagation()}>
        <h3 className="sora" style={{fontWeight:700,color:"var(--text)",fontSize:16}}>💳 Bayar Item</h3>
        <div style={{background:"var(--card)",borderRadius:12,padding:"13px 15px"}}>
          <p style={{color:"var(--text)",fontWeight:600,fontSize:14}}>{bayarItem.name}</p>
          {bayarItem.note&&<p style={{color:"var(--blue)",fontSize:11,marginTop:4}}>📝 {bayarItem.note}</p>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
            <span style={{color:"var(--muted)",fontSize:12}}>{bayarItem.qty} × {rupiah(bayarItem.price)}</span>
            <span className="sora" style={{fontWeight:800,color:"var(--amber)",fontSize:18}}>{rupiah(bayarItem.subtotal)}</span>
          </div>
        </div>
        <TxtInput label="Uang Diterima" type="number" value={uangItem} onChange={v=>setUangItem(v)} placeholder="0" prefix="Rp"/>
        {uangItem&&parseInt(uangItem)<bayarItem.subtotal&&(
          <p style={{color:"var(--red)",fontSize:13,fontWeight:600,textAlign:"center"}}>⚠ Kurang {rupiah(bayarItem.subtotal-parseInt(uangItem))}</p>
        )}
        {kembalianItem!==null&&(
          <div style={{background:"var(--green-dim)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:12,padding:"13px 15px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:"var(--green)",fontWeight:600,fontSize:13}}>✓ Kembalian</span>
            <span className="sora" style={{fontWeight:800,color:"var(--green)",fontSize:20}}>{rupiah(kembalianItem)}</span>
          </div>
        )}
        <Btn v="success" onClick={bayarSatuItem} disabled={!uangItem||parseInt(uangItem)<bayarItem.subtotal} full>✓ Konfirmasi Bayar</Btn>
        <Btn v="ghost" onClick={()=>{setBayarItem(null);setUangItem("");}} full>Batal</Btn>
      </div>
    </div>)}

    {lunasModal&&ord&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={()=>{setLunasModal(false);setUangLunas("");}}>
      <div className="fu" style={{background:"var(--bg2)",borderRadius:"20px 20px 0 0",padding:"22px 20px 36px",width:"100%",display:"flex",flexDirection:"column",gap:14}} onClick={e=>e.stopPropagation()}>
        <h3 className="sora" style={{fontWeight:700,color:"var(--text)",fontSize:16}}>💳 Lunasi Semua — {ord.customerName}</h3>
        <div style={{background:"var(--card)",borderRadius:12,padding:"13px 15px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:"var(--muted)",fontSize:13}}>Total Sisa</span>
          <span className="sora" style={{fontWeight:800,color:"var(--amber)",fontSize:18}}>{rupiah(ord.total)}</span>
        </div>
        <TxtInput label="Uang Diterima" type="number" value={uangLunas} onChange={v=>setUangLunas(v)} placeholder="0" prefix="Rp"/>
        {uangLunas&&parseInt(uangLunas)<ord.total&&(
          <p style={{color:"var(--red)",fontSize:13,fontWeight:600,textAlign:"center"}}>⚠ Kurang {rupiah(ord.total-parseInt(uangLunas))}</p>
        )}
        {kembalianLunas!==null&&(
          <div style={{background:"var(--green-dim)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:12,padding:"13px 15px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:"var(--green)",fontWeight:600,fontSize:13}}>✓ Kembalian</span>
            <span className="sora" style={{fontWeight:800,color:"var(--green)",fontSize:20}}>{rupiah(kembalianLunas)}</span>
          </div>
        )}
        <Btn v="success" onClick={konfirmasiLunas} disabled={!uangLunas||parseInt(uangLunas)<ord.total} full>✓ Konfirmasi Lunas</Btn>
        <Btn v="ghost" onClick={()=>{setLunasModal(false);setUangLunas("");}} full>Batal</Btn>
      </div>
    </div>)}
  </div>);

  return(<div className="tagihan-list-screen" style={{flex:1,overflowY:"auto",padding:"17px"}}>
    <div className="fu" style={{marginBottom:12}}>
      <h2 className="sora" style={{fontSize:20,fontWeight:800,color:"var(--text)"}}>Tagihan Terbuka</h2>
      <p style={{color:"var(--muted)",fontSize:13,marginTop:3}}>{openOrders.length} pelanggan sesi ini · <span style={{color:"var(--amber)",fontWeight:700}}>{rupiah(openOrders.reduce((s,o)=>s+o.total,0))}</span> potensi masuk</p>
    </div>
    {carryOverOrders.length>0&&(
      <Card style={{marginBottom:12,background:"rgba(212,130,10,0.08)",border:"1px solid rgba(212,130,10,0.2)"}}>
        <p style={{color:"var(--amber)",fontWeight:700,fontSize:13,marginBottom:6}}>⚠ Ada {carryOverOrders.length} tagihan lintas sesi</p>
        <p style={{color:"var(--text)",fontSize:13,lineHeight:1.5}}>Order terbuka dari sesi lama tidak ditampilkan sebagai tagihan aktif sesi hari ini agar rekap tidak tercampur. Buka ulang sesi asal atau selesaikan data legacy lebih dulu.</p>
      </Card>
    )}
    {openOrders.length===0?(<Card style={{textAlign:"center",padding:32}}><p style={{fontSize:28,marginBottom:8}}>🎉</p><p style={{color:"var(--muted)"}}>Tidak ada tagihan terbuka untuk sesi ini.</p></Card>)
    :openOrders.map(o=>(<div className="tagihan-card" key={o.id} onClick={()=>setSel(o.id)} style={{background:"var(--card)",border:"1px solid var(--border)",
      borderRadius:13,padding:"13px 15px",marginBottom:9,display:"flex",justifyContent:"space-between",cursor:"pointer",alignItems:"center"}}>
      <div style={{flex:1}}>
        <p style={{color:"var(--text)",fontWeight:700,fontSize:15}}>{o.customerName}</p>
        <p style={{color:"var(--muted)",fontSize:12,marginTop:2}}>{o.items.map(i=>`${i.name} ×${i.qty}${i.note?` • ${i.note}`:""}`).join(" • ")}</p>
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:5,flexWrap:"wrap"}}>
          <KasirChip kasirId={o.kasirId} kasirs={kasirs}/>
          <span style={{color:"var(--muted)",fontSize:11}}>Sesi {fmtShort(orderSessionDate(o)||businessDate)}</span>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0,marginLeft:10}}>
        <p className="sora" style={{color:"var(--amber)",fontWeight:800,fontSize:14}}>{rupiah(o.total)}</p>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </div>
    </div>))}
  </div>);
};



// ── Tim ──
const Tim = ({kasirs,setKasirs,mitras,setMitras,ownerPassword,setOwnerPassword,onClose}) => {
  const [tab,setTab]=useState("kasir");
  // kasir form
  const [kName,setKName]=useState(""); const [kPw,setKPw]=useState(""); const [kOk,setKOk]=useState(false);
  const addKasir=()=>{if(!kName||!kPw)return;setKasirs(p=>[...p,{id:genId("k"),name:kName,password:kPw}]);setKName("");setKPw("");setKOk(true);setTimeout(()=>setKOk(false),2000);};
  // mitra form
  const [mName,setMName]=useState(""); const [mPemilik,setMPemilik]=useState(""); const [mOk,setMOk]=useState(false);
  const addMitra=()=>{if(!mName)return;setMitras(p=>[...p,{id:genId("mtr"),name:mName,pemilik:mPemilik}]);setMName("");setMPemilik("");setMOk(true);setTimeout(()=>setMOk(false),2000);};
  // password management
  const [ownerCurrentPw,setOwnerCurrentPw]=useState("");
  const [ownerNewPw,setOwnerNewPw]=useState("");
  const [ownerConfirmPw,setOwnerConfirmPw]=useState("");
  const [ownerPwMsg,setOwnerPwMsg]=useState("");
  const [resetPw,setResetPw]=useState({});
  const [resetMsg,setResetMsg]=useState({});

  const saveOwnerPassword=()=>{
    if(ownerCurrentPw!==(ownerPassword||"owner123")){
      setOwnerPwMsg("Password owner saat ini salah.");
      setTimeout(()=>setOwnerPwMsg(""),2200);
      return;
    }
    if(!ownerNewPw||ownerNewPw.length<4){
      setOwnerPwMsg("Password owner baru minimal 4 karakter.");
      setTimeout(()=>setOwnerPwMsg(""),2200);
      return;
    }
    if(ownerNewPw!==ownerConfirmPw){
      setOwnerPwMsg("Konfirmasi password owner belum cocok.");
      setTimeout(()=>setOwnerPwMsg(""),2200);
      return;
    }
    setOwnerPassword(ownerNewPw);
    setOwnerCurrentPw("");
    setOwnerNewPw("");
    setOwnerConfirmPw("");
    setOwnerPwMsg("✓ Password owner berhasil diperbarui.");
    setTimeout(()=>setOwnerPwMsg(""),2200);
  };

  const resetKasirPassword=(kasirId)=>{
    const nextPw=(resetPw[kasirId]||"").trim();
    if(!nextPw || nextPw.length<4){
      setResetMsg(prev=>({...prev,[kasirId]:"Minimal 4 karakter."}));
      setTimeout(()=>setResetMsg(prev=>({...prev,[kasirId]:""})),2200);
      return;
    }
    setKasirs(prev=>prev.map(k=>k.id===kasirId?{...k,password:nextPw}:k));
    setResetPw(prev=>({...prev,[kasirId]:""}));
    setResetMsg(prev=>({...prev,[kasirId]:"✓ Password kasir diperbarui."}));
    setTimeout(()=>setResetMsg(prev=>({...prev,[kasirId]:""})),2200);
  };

  return(<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
    <Hdr title="Manajemen Tim" sub="Kasir, Mitra & Akses" right={
      <button onClick={onClose} style={{color:"var(--amber)",display:"flex"}}>
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5 M12 19l-7-7 7-7"/></svg>
      </button>}/>
    {/* Tab bar */}
    <div style={{display:"flex",padding:"10px 18px 0",gap:8,borderBottom:"1px solid var(--border)",flexShrink:0,overflowX:"auto"}}>
      {[
        {k:"kasir",label:`Kasir (${kasirs.length})`},
        {k:"mitra",label:`Mitra (${mitras.length})`},
        {k:"akses",label:"Akses"}
      ].map(t=>(
        <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:"8px 16px",borderRadius:"10px 10px 0 0",fontWeight:700,fontSize:13,
          background:tab===t.k?"var(--card)":"transparent",
          color:tab===t.k?"var(--amber)":"var(--muted)",
          border:tab===t.k?"1px solid var(--border)":"1px solid transparent",
          borderBottom:tab===t.k?"1px solid var(--card)":"none",marginBottom:tab===t.k?-1:0,whiteSpace:"nowrap"}}>
          {t.label}
        </button>
      ))}
    </div>
    <div style={{flex:1,overflowY:"auto",padding:"17px",display:"flex",flexDirection:"column",gap:13}}>
      {tab==="kasir"?(<>
        {kasirs.map((k,i)=>(<Card key={k.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:KASIR_COLORS_DIM[i%4],display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:KASIR_COLORS[i%4],fontWeight:800,fontSize:14}}>{k.name[0]}</span>
            </div>
            <div>
              <p style={{color:"var(--text)",fontWeight:700}}>{k.name}</p>
              <p style={{color:"var(--muted)",fontSize:12,marginTop:1}}>Akses kasir aktif</p>
            </div>
          </div>
          {kasirs.length>1&&(<button onClick={()=>setKasirs(p=>p.filter(x=>x.id!==k.id))} style={{width:32,height:32,borderRadius:8,
            background:"var(--red-dim)",border:"1px solid rgba(224,82,82,0.2)",color:"var(--red)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18 M8 6V4h8v2 M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
          </button>)}
        </Card>))}
        <Card style={{display:"flex",flexDirection:"column",gap:12}}>
          <h3 style={{color:"var(--text)",fontWeight:700,fontSize:15}}>Tambah Kasir</h3>
          <TxtInput label="Nama Kasir" value={kName} onChange={setKName} placeholder="Nama kasir baru"/>
          <TxtInput label="Password" type="text" value={kPw} onChange={setKPw} placeholder="Buat password login"/>
          {kOk&&<p className="fi" style={{color:"var(--green)",fontSize:13,textAlign:"center"}}>✓ Kasir berhasil ditambahkan!</p>}
          <Btn onClick={addKasir} disabled={!kName||!kPw} full>Tambah Kasir</Btn>
        </Card>
      </>):tab==="mitra"?(<>
        {mitras.length===0&&(
          <div style={{background:"var(--card)",border:"1px dashed var(--border)",borderRadius:12,padding:20,textAlign:"center"}}>
            <p style={{fontSize:24,marginBottom:8}}>🤝</p>
            <p style={{color:"var(--muted)",fontSize:13}}>Belum ada mitra. Tambah warung mitra di bawah.</p>
          </div>
        )}
        {mitras.map((m,i)=>(<Card key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:MITRA_COLORS_DIM[i%4],display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:MITRA_COLORS[i%4],fontWeight:800,fontSize:14}}>{m.name[0]}</span>
            </div>
            <div>
              <p style={{color:"var(--text)",fontWeight:700}}>{m.name}</p>
              {m.pemilik&&<p style={{color:"var(--muted)",fontSize:12,marginTop:1}}>{m.pemilik}</p>}
            </div>
          </div>
          <button onClick={()=>setMitras(p=>p.filter(x=>x.id!==m.id))} style={{width:32,height:32,borderRadius:8,
            background:"var(--red-dim)",border:"1px solid rgba(224,82,82,0.2)",color:"var(--red)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18 M8 6V4h8v2 M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
          </button>
        </Card>))}
        <Card style={{display:"flex",flexDirection:"column",gap:12}}>
          <h3 style={{color:"var(--text)",fontWeight:700,fontSize:15}}>🤝 Tambah Mitra</h3>
          <TxtInput label="Nama Warung/Mitra" value={mName} onChange={setMName} placeholder="Contoh: Bakso Bakar Pak Budi"/>
          <TxtInput label="Nama Pemilik (opsional)" value={mPemilik} onChange={setMPemilik} placeholder="Contoh: Pak Budi"/>
          {mOk&&<p className="fi" style={{color:"var(--green)",fontSize:13,textAlign:"center"}}>✓ Mitra berhasil ditambahkan!</p>}
          <Btn onClick={addMitra} disabled={!mName} full>Tambah Mitra</Btn>
        </Card>
      </>):(<>
        <Card style={{display:"flex",flexDirection:"column",gap:12}}>
          <div>
            <p style={{color:"var(--text)",fontWeight:700,fontSize:15}}>Password Owner</p>
            <p style={{color:"var(--muted)",fontSize:12,marginTop:4,lineHeight:1.5}}>Gunakan menu ini untuk mengganti password login owner. Setelah disimpan, login owner memakai password baru.</p>
          </div>
          <TxtInput label="Password Owner Saat Ini" type="password" value={ownerCurrentPw} onChange={setOwnerCurrentPw} placeholder="Masukkan password saat ini"/>
          <TxtInput label="Password Owner Baru" type="password" value={ownerNewPw} onChange={setOwnerNewPw} placeholder="Minimal 4 karakter"/>
          <TxtInput label="Konfirmasi Password Owner Baru" type="password" value={ownerConfirmPw} onChange={setOwnerConfirmPw} placeholder="Ulangi password baru"/>
          {ownerPwMsg&&<p className="fi" style={{color:ownerPwMsg.startsWith("✓")?"var(--green)":"var(--red)",fontSize:13,textAlign:"center"}}>{ownerPwMsg}</p>}
          <Btn onClick={saveOwnerPassword} disabled={!ownerCurrentPw||!ownerNewPw||!ownerConfirmPw} full>Simpan Password Owner</Btn>
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <p style={{fontSize:11,color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>Reset Password Kasir</p>
          {kasirs.length===0?(
            <Card style={{textAlign:"center",padding:18}}><p style={{color:"var(--muted)",fontSize:13}}>Belum ada kasir untuk diatur password-nya.</p></Card>
          ):kasirs.map((k,i)=>(
            <Card key={k.id} style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:38,height:38,borderRadius:12,background:KASIR_COLORS_DIM[i%4],display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{color:KASIR_COLORS[i%4],fontWeight:800,fontSize:14}}>{k.name[0]}</span>
                </div>
                <div>
                  <p style={{color:"var(--text)",fontWeight:700}}>{k.name}</p>
                  <p style={{color:"var(--muted)",fontSize:12}}>Reset password login kasir</p>
                </div>
              </div>
              <TxtInput label={`Password baru untuk ${k.name}`} type="text" value={resetPw[k.id]||""} onChange={v=>setResetPw(prev=>({...prev,[k.id]:v}))} placeholder="Masukkan password baru"/>
              {resetMsg[k.id]&&<p className="fi" style={{color:resetMsg[k.id].startsWith("✓")?"var(--green)":"var(--red)",fontSize:13,textAlign:"center"}}>{resetMsg[k.id]}</p>}
              <Btn onClick={()=>resetKasirPassword(k.id)} disabled={!(resetPw[k.id]||"").trim()} full sm>Reset Password {k.name}</Btn>
            </Card>
          ))}
        </div>
      </>)}
    </div>
  </div>);
};

// ── Menu Mgmt ──
const MenuMgmt = ({menus,setMenus,mitras,onClose}) => {
  const [show,setShow]=useState(false);const[eid,setEid]=useState(null);
  const [form,setForm]=useState({name:"",price:"",category:"Kopi",available:true,mitraId:null,hargaMitra:"",suhu:"Tidak Ada"});
  const [cat,setCat]=useState("Semua");
  const [saving,setSaving]=useState(false);
  const open=(m=null)=>{if(m){setEid(m.id);setForm({name:m.name,price:String(m.price),category:m.category,available:m.available,mitraId:m.mitraId||null,hargaMitra:m.hargaMitra?String(m.hargaMitra):"",suhu:m.suhu||"Tidak Ada"});}
    else{setEid(null);setForm({name:"",price:"",category:"Kopi",available:true,mitraId:null,hargaMitra:"",suhu:"Tidak Ada"});}setShow(true);};
  const save=async()=>{if(!form.name||!form.price)return;
    setSaving(true);
    const row={name:form.name,price:parseInt(form.price),category:form.category,available:form.available,mitra_id:form.mitraId||null,harga_mitra:form.mitraId&&form.hargaMitra?parseInt(form.hargaMitra):null,suhu:form.mitraId?null:form.suhu};
    if(eid){
      const{error}=await supabase.from("menus").upsert({id:eid,...row});
      if(error){alert("Gagal edit: "+error.message);setSaving(false);return;}
      const menuData={...form,price:parseInt(form.price),mitraId:form.mitraId||null,hargaMitra:form.mitraId&&form.hargaMitra?parseInt(form.hargaMitra):null,suhu:form.mitraId?null:form.suhu};
      setMenus(p=>p.map(m=>m.id===eid?{...m,...menuData}:m));
    }else{
      const{data,error}=await supabase.from("menus").insert(row).select().single();
      if(error){alert("Gagal simpan: "+error.message);setSaving(false);return;}
      const menuData={name:data.name,price:data.price,category:data.category,available:data.available,mitraId:data.mitra_id||null,hargaMitra:data.harga_mitra||null,suhu:data.suhu||null};
      setMenus(p=>[...p,{id:data.id,...menuData}]);
    }
    setSaving(false);setShow(false);};
  const filtered=menus.filter(m=>cat==="Semua"||m.category===cat);
  const getMitra=(id)=>mitras.find(m=>m.id===id);
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
      {filtered.map((m,mi)=>{
        const mitra=m.mitraId?getMitra(m.mitraId):null;
        const mitraIdx=mitra?mitras.findIndex(x=>x.id===mitra.id):0;
        return(<div key={m.id} style={{background:"var(--card)",border:`1px solid ${mitra?"rgba(124,58,237,0.2)":"var(--border)"}`,borderRadius:12,
          padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",opacity:m.available?1:0.5}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
              <p style={{color:"var(--text)",fontWeight:600,fontSize:14}}>{m.name}</p>
              {!m.available&&<span style={{background:"rgba(122,106,86,0.15)",color:"var(--muted)",fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:99}}>Habis</span>}
            </div>
            <div style={{display:"flex",gap:7,marginTop:4,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{background:"var(--amber-dim)",color:"var(--amber)",fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:99}}>{m.category}</span>
              {mitra?(
                <span style={{background:MITRA_COLORS_DIM[mitraIdx%4],color:MITRA_COLORS[mitraIdx%4],fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:99}}>🤝 {mitra.name}</span>
              ):(
                <span style={{background:"var(--blue-dim)",color:"var(--blue)",fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:99}}>Milik Saya</span>
              )}
            </div>
            <div style={{display:"flex",gap:9,marginTop:4,alignItems:"baseline"}}>
              <p style={{color:"var(--amber)",fontWeight:700,fontSize:13}}>{rupiah(m.price)}</p>
              {mitra&&m.hargaMitra&&(
                <p style={{color:"var(--muted)",fontSize:11}}>modal <span style={{color:"var(--red)",fontWeight:600}}>{rupiah(m.hargaMitra)}</span>
                  {" · "}untung <span style={{color:"var(--green)",fontWeight:600}}>{rupiah(m.price-m.hargaMitra)}</span></p>
              )}
            </div>
          </div>
          <div style={{display:"flex",gap:7,flexShrink:0,marginLeft:8}}>
            {[{act:()=>setMenus(p=>p.map(x=>x.id===m.id?{...x,available:!x.available}:x)),bg:m.available?"var(--green-dim)":"var(--card2)",col:m.available?"var(--green)":"var(--muted)",icon:m.available?"M20 6L9 17l-5-5":"M18 6L6 18 M6 6l12 12"},
              {act:()=>open(m),bg:"var(--amber-dim)",col:"var(--amber)",icon:"M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"},
              {act:()=>{supabase.from("menus").delete().eq("id",m.id).then();setMenus(p=>p.filter(x=>x.id!==m.id));},bg:"var(--red-dim)",col:"var(--red)",icon:"M3 6h18 M8 6V4h8v2 M19 6l-1 14"},
            ].map((b,j)=>(<button key={j} onClick={b.act} style={{width:32,height:32,borderRadius:8,background:b.bg,
              border:`1px solid ${b.col}33`,color:b.col,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={b.icon}/></svg>
            </button>))}
          </div>
        </div>);
      })}
    </div>
    {show&&(<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.75)",zIndex:200,display:"flex",alignItems:"flex-end"}} onClick={()=>setShow(false)}>
      <div className="fu" style={{background:"var(--bg2)",borderRadius:"20px 20px 0 0",padding:"20px 20px 34px",width:"100%",display:"flex",flexDirection:"column",gap:13,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <h3 className="sora" style={{fontWeight:700,color:"var(--text)",fontSize:16}}>{eid?"Edit":"Tambah"} Menu</h3>
        <TxtInput label="Nama Menu" value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} placeholder="Nama minuman"/>
        <TxtInput label="Harga Jual" type="number" value={form.price} onChange={v=>setForm(p=>({...p,price:v}))} placeholder="8000" prefix="Rp"/>

        {/* Kepemilikan menu */}
        <div>
          <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Kepemilikan Menu</p>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setForm(p=>({...p,mitraId:null,hargaMitra:""}))} style={{flex:1,padding:"10px",borderRadius:9,
              background:!form.mitraId?"var(--blue-dim)":"var(--card2)",
              color:!form.mitraId?"var(--blue)":"var(--muted)",
              border:`1px solid ${!form.mitraId?"rgba(59,130,246,0.35)":"var(--border)"}`,fontSize:12,fontWeight:600}}>
              ☕ Milik Saya
            </button>
            {mitras.length>0&&<button onClick={()=>setForm(p=>({...p,mitraId:p.mitraId||mitras[0].id}))} style={{flex:1,padding:"10px",borderRadius:9,
              background:form.mitraId?"var(--purple-dim)":"var(--card2)",
              color:form.mitraId?"var(--purple)":"var(--muted)",
              border:`1px solid ${form.mitraId?"rgba(124,58,237,0.35)":"var(--border)"}`,fontSize:12,fontWeight:600}}>
              🤝 Menu Mitra
            </button>}
            {mitras.length===0&&<div style={{flex:1,padding:"10px",borderRadius:9,background:"var(--card2)",
              border:"1px solid var(--border)",fontSize:11,color:"var(--muted)",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center"}}>
              Belum ada mitra
            </div>}
          </div>
        </div>

        {/* Pilih mitra mana */}
        {form.mitraId&&mitras.length>0&&(
          <div className="fi">
            <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Pilih Mitra</p>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {mitras.map((m,i)=>(
                <button key={m.id} onClick={()=>setForm(p=>({...p,mitraId:m.id}))} style={{padding:"10px 13px",borderRadius:9,
                  background:form.mitraId===m.id?MITRA_COLORS_DIM[i%4]:"var(--card2)",
                  color:form.mitraId===m.id?MITRA_COLORS[i%4]:"var(--muted)",
                  border:`1px solid ${form.mitraId===m.id?MITRA_COLORS[i%4]+"55":"var(--border)"}`,
                  fontSize:13,fontWeight:600,textAlign:"left",display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:28,height:28,borderRadius:7,background:form.mitraId===m.id?MITRA_COLORS[i%4]:"var(--border)",
                    color:form.mitraId===m.id?"#fff":"var(--muted)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,flexShrink:0}}>
                    {m.name[0]}
                  </span>
                  <div style={{textAlign:"left"}}>
                    <p>{m.name}</p>
                    {m.pemilik&&<p style={{fontSize:11,fontWeight:400,marginTop:1}}>{m.pemilik}</p>}
                  </div>
                </button>
              ))}
            </div>
            <div style={{marginTop:10}}>
              <TxtInput label="Harga Beli dari Mitra (modal)" type="number" value={form.hargaMitra} onChange={v=>setForm(p=>({...p,hargaMitra:v}))} placeholder="5000" prefix="Rp"/>
            </div>
            {form.hargaMitra&&form.price&&parseInt(form.price)>parseInt(form.hargaMitra)&&(
              <div style={{background:"var(--green-dim)",borderRadius:9,padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{color:"var(--muted)",fontSize:12}}>Untung per item</span>
                <span style={{color:"var(--green)",fontWeight:700,fontSize:13}}>{rupiah(parseInt(form.price)-parseInt(form.hargaMitra))}</span>
              </div>
            )}
          </div>
        )}

        {/* Pilih suhu — hanya untuk menu sendiri (bukan mitra) */}
        {!form.mitraId&&(
          <div>
            <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Opsi Suhu</p>
            <div style={{display:"flex",gap:8}}>
              {[{v:"Tidak Ada",label:"—  Tidak Ada"},{v:"Ice",label:"🧊 Ice Only"},{v:"Hot",label:"🔥 Hot Only"},{v:"Keduanya",label:"🧊🔥 Keduanya"}].map(opt=>(
                <button key={opt.v} onClick={()=>setForm(p=>({...p,suhu:opt.v}))} style={{flex:1,padding:"8px 4px",borderRadius:9,
                  background:form.suhu===opt.v?"var(--blue-dim)":"var(--card2)",
                  color:form.suhu===opt.v?"var(--blue)":"var(--muted)",
                  border:`1px solid ${form.suhu===opt.v?"rgba(59,130,246,0.35)":"var(--border)"}`,fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div><p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Kategori</p>
          <div style={{display:"flex",gap:8}}>
            {MCATS.map(c=>(<button key={c} onClick={()=>setForm(p=>({...p,category:c}))} style={{flex:1,padding:"9px",borderRadius:9,
              background:form.category===c?"var(--amber-dim)":"var(--card2)",color:form.category===c?"var(--amber)":"var(--muted)",
              border:`1px solid ${form.category===c?"rgba(245,166,35,0.35)":"var(--border)"}`,fontSize:12,fontWeight:600}}>{c}</button>))}
          </div>
        </div>
        <Btn onClick={save} disabled={!form.name||!form.price||saving} full>{saving?"Menyimpan...":"Simpan"}</Btn>
      </div>
    </div>)}
  </div>);
};

// ── APP ──
export default function AngkringanApp() {
  const [user,setUser]=useState(()=>{try{const s=localStorage.getItem("user");return s?JSON.parse(s):null;}catch{return null;}});
  const [screen,setScreen]=useState("home");
  const [overlay,setOverlay]=useState(null);
  const [navOpen,setNavOpen]=useState(false);
  const [menus,setMenus]=useState(()=>{try{const s=localStorage.getItem("menus");return s?JSON.parse(s):MENUS0;}catch{return MENUS0;}});
  const [orders,setOrders]=useState(()=>{try{const s=localStorage.getItem("orders");return s?JSON.parse(s).map(normalizeOrder):[];}catch{return [];}});
  const [expenses,setExpenses]=useState(()=>{try{const s=localStorage.getItem("expenses");return s?JSON.parse(s):[];}catch{return [];}});
  const [kasirs,setKasirs]=useState(()=>{try{const s=localStorage.getItem("kasirs");return s?JSON.parse(s):[];}catch{return [];}});
  const [mitras,setMitras]=useState(()=>{try{const s=localStorage.getItem("mitras");return s?JSON.parse(s):[];}catch{return [];}});
  const [target, setTarget] = useState(()=>{try{const s=localStorage.getItem("target");return s?JSON.parse(s):500000;}catch{return 500000;}});
  const [ownerPassword, setOwnerPassword] = useState(()=>{try{const s=localStorage.getItem("ownerPassword");return s?JSON.parse(s):"owner123";}catch{return "owner123";}});
  const [sessionOpen, setSessionOpen] = useState(()=>{try{const s=localStorage.getItem("sessionOpen");return s?JSON.parse(s):false;}catch{return false;}});
  const [sessionDate, setSessionDate] = useState(()=>{try{const s=localStorage.getItem("sessionDate");return s?JSON.parse(s):null;}catch{return null;}});
  const [currentSessionId, setCurrentSessionId] = useState(()=>{try{const s=localStorage.getItem("currentSessionId");return s?JSON.parse(s):null;}catch{return null;}});
  const [deviceId] = useState(()=>{
    try{
      const saved = localStorage.getItem("deviceId");
      if(saved) return saved;
      const fresh = genId("DEV");
      localStorage.setItem("deviceId", fresh);
      return fresh;
    }catch{
      return genId("DEV");
    }
  });
  const businessDate = sessionOpen ? (sessionDate || fmt(new Date())) : fmt(new Date());

  const initialized = useRef(false);
  const orderSnapshot = useRef(new Map());

  const unresolvedOpenOrders = useMemo(
    ()=>orders.filter(o=>o.status==="open"&&Number(o.total)>0),
    [orders]
  );
  const unresolvedSessionDates = useMemo(
    ()=>[...new Set(unresolvedOpenOrders.map(orderSessionDate).filter(Boolean))].sort(),
    [unresolvedOpenOrders]
  );

  useEffect(()=>{
    setNavOpen(false);
  },[screen, overlay]);

  const loadFromSupabase = async () => {
    try{
      const [kasirRes, mitraRes, menuRes, orderRes, expenseRes, settingsRes] = await Promise.all([
        supabase.from("kasirs").select("*"),
        supabase.from("mitras").select("*"),
        supabase.from("menus").select("*"),
        supabase.from("orders").select("*"),
        supabase.from("expenses").select("*"),
        supabase.from("settings").select("*"),
      ]);

      if(kasirRes.data?.length) setKasirs(kasirRes.data.map(r=>({id:r.id,name:r.name,password:r.password})));
      if(mitraRes.data?.length) setMitras(mitraRes.data.map(r=>({id:r.id,name:r.name,pemilik:r.pemilik})));
      if(menuRes.data?.length) setMenus(menuRes.data.map(r=>({id:r.id,name:r.name,price:r.price,category:r.category,available:r.available,mitraId:r.mitra_id||null,hargaMitra:r.harga_mitra||null,suhu:r.suhu||null})));
      if(orderRes.data){
        const nextOrders = orderRes.data.map(r=>normalizeOrder({
          id:r.id,
          customerName:r.customer_name,
          status:r.status,
          createdAt:r.created_at,
          sessionDate:r.session_date,
          sessionId:r.session_id,
          paidAt:r.paid_at,
          items:r.items,
          total:r.total,
          kasirId:r.kasir_id,
          updatedAt:r.updated_at,
          lastDeviceId:r.last_device_id,
        }));
        orderSnapshot.current = new Map(nextOrders.map(order=>[order.id, serializeOrderForSync(order)]));
        setOrders(nextOrders);
      }
      if(expenseRes.data) setExpenses(expenseRes.data.map(r=>({id:r.id,description:r.description,amount:r.amount,date:r.date})));
      if(settingsRes.data){
        const t=settingsRes.data.find(r=>r.key==="target"); if(t) setTarget(Number(t.value));
        const so=settingsRes.data.find(r=>r.key==="session_open"); if(so) setSessionOpen(so.value==="true");
        const sd=settingsRes.data.find(r=>r.key==="session_date"); if(sd) setSessionDate(sd.value||null);
        const cs=settingsRes.data.find(r=>r.key==="current_session_id"); if(cs) setCurrentSessionId(cs.value||null);
        const op=settingsRes.data.find(r=>r.key==="owner_password"); if(op?.value) setOwnerPassword(op.value);
      }
    }catch(err){
      console.error("loadFromSupabase error", err);
    }
  };

  const handleBuka = async () => {
    if(unresolvedSessionDates.length>1){
      alert("Masih ada tagihan terbuka di lebih dari satu sesi. Rapikan order legacy dulu agar sesi tidak bercampur.");
      setScreen("tagihan");
      return;
    }
    const resumeDate = unresolvedSessionDates[0] || fmt(new Date());
    const resumeSessionId = unresolvedOpenOrders.find(o=>orderSessionDate(o)===resumeDate && o.sessionId)?.sessionId || currentSessionId || genId("SES");
    setSessionOpen(true);
    setSessionDate(resumeDate);
    setCurrentSessionId(resumeSessionId);
    supabase.from("sessions").upsert({
      id:resumeSessionId,
      business_date:resumeDate,
      opened_at:new Date().toISOString(),
      opened_by:user?.id||null,
      status:"open",
    }).then();
  };

  const handleTutup = () => {
    const currentSessionOpenOrders = unresolvedOpenOrders.filter(o=>orderSessionDate(o)===businessDate);
    if(currentSessionOpenOrders.length>0){
      alert(`Sesi tidak bisa ditutup karena masih ada ${currentSessionOpenOrders.length} tagihan terbuka pada sesi ini.`);
      setScreen("tagihan");
      return;
    }
    if(currentSessionId){
      supabase.from("sessions").update({
        closed_at:new Date().toISOString(),
        closed_by:user?.id||null,
        status:"closed",
      }).eq("id", currentSessionId).then();
    }
    setSessionOpen(false);
    setSessionDate(null);
    setCurrentSessionId(null);
  };

  useEffect(()=>{if(user)localStorage.setItem("user",JSON.stringify(user));else localStorage.removeItem("user");},[user]);
  useEffect(()=>{if(!initialized.current) return; localStorage.setItem("target",JSON.stringify(target));supabase.from("settings").upsert({key:"target",value:target}).then();},[target]);
  useEffect(()=>{if(!initialized.current) return; localStorage.setItem("sessionOpen",JSON.stringify(sessionOpen));supabase.from("settings").upsert({key:"session_open",value:String(sessionOpen)}).then();},[sessionOpen]);
  useEffect(()=>{if(!initialized.current) return; localStorage.setItem("sessionDate",JSON.stringify(sessionDate));supabase.from("settings").upsert({key:"session_date",value:sessionDate||""}).then();},[sessionDate]);
  useEffect(()=>{if(!initialized.current) return; localStorage.setItem("currentSessionId",JSON.stringify(currentSessionId));supabase.from("settings").upsert({key:"current_session_id",value:currentSessionId||""}).then();},[currentSessionId]);
  useEffect(()=>{if(!initialized.current) return; localStorage.setItem("ownerPassword",JSON.stringify(ownerPassword));supabase.from("settings").upsert({key:"owner_password",value:ownerPassword||"owner123"}).then();},[ownerPassword]);

  useEffect(()=>{
    loadFromSupabase().finally(()=>{ initialized.current=true; });
  },[]);

  useEffect(()=>{
    if(!initialized.current) return;
    const refresh = ()=>loadFromSupabase();
    const interval = setInterval(refresh, 15000);
    const onVisible = ()=>{ if(document.visibilityState==="visible") refresh(); };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return ()=>{
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  },[]);

  useEffect(()=>{
    if(sessionOpen && !currentSessionId){
      const existingSessionId = unresolvedOpenOrders.find(o=>orderSessionDate(o)===sessionDate)?.sessionId;
      if(existingSessionId) setCurrentSessionId(existingSessionId);
    }
  },[sessionOpen, currentSessionId, sessionDate, unresolvedOpenOrders]);

  useEffect(()=>{
    if(!initialized.current) return;
    localStorage.setItem("kasirs",JSON.stringify(kasirs));
    kasirs.forEach(k=>supabase.from("kasirs").upsert({id:k.id,name:k.name,password:k.password}).then());
  },[kasirs]);

  useEffect(()=>{
    if(!initialized.current) return;
    localStorage.setItem("mitras",JSON.stringify(mitras));
    mitras.forEach(m=>supabase.from("mitras").upsert({id:m.id,name:m.name,pemilik:m.pemilik}).then());
  },[mitras]);

  useEffect(()=>{
    if(!initialized.current) return;
    localStorage.setItem("menus",JSON.stringify(menus));
    menus.forEach(m=>supabase.from("menus").upsert({id:m.id,name:m.name,price:m.price,category:m.category,available:m.available,mitra_id:m.mitraId||null,harga_mitra:m.hargaMitra||null,suhu:m.suhu||null}).then());
  },[menus]);

  useEffect(()=>{
    if(!initialized.current) return;
    const normalizedOrders = orders.map(normalizeOrder);
    localStorage.setItem("orders",JSON.stringify(normalizedOrders));
    normalizedOrders.forEach(order=>{
      const serialized = serializeOrderForSync(order);
      if(orderSnapshot.current.get(order.id)===serialized) return;
      orderSnapshot.current.set(order.id, serialized);
      supabase.from("orders").upsert(toDbOrder({...order, sessionId:order.sessionId || currentSessionId || null}, deviceId)).then();
    });
  },[orders, currentSessionId, deviceId]);

  useEffect(()=>{
    if(!initialized.current) return;
    localStorage.setItem("expenses",JSON.stringify(expenses));
    expenses.forEach(e=>supabase.from("expenses").upsert({id:e.id,description:e.description,amount:e.amount,date:e.date}).then());
  },[expenses]);

  if(!user)return(<><FontStyle/><div className="app-shell"><Login onLogin={u=>{setUser(u);setScreen("home");}} kasirs={kasirs} ownerPassword={ownerPassword}/></div></>);

  const titles={
    home:{title:"Dashboard",sub:getNow().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long"})},
    pos:{title:"Kasir",sub:`Jaga: ${user.name}`},
    tagihan:{title:"Tagihan",sub:"Pesanan belum lunas"},
    keuangan:{title:"Keuangan",sub:"Laporan Keuangan"},
  };
  const navItems = getNavItems(user.role);
  const isHome = screen==="home";
  const headerLeft = (
    <button onClick={()=>setNavOpen(true)} style={{width:44,height:44,minWidth:44,minHeight:44,borderRadius:14,background:"rgba(255,255,255,0.94)",border:"1px solid rgba(215,226,240,0.98)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)",flexShrink:0,overflow:"visible",boxShadow:"0 8px 18px rgba(15,23,42,0.06)"}}>
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>
  );
  const headerRight = isHome ? (
    <button onClick={()=>setUser(null)} style={{color:"var(--muted)",display:"flex",padding:8,borderRadius:12,background:"rgba(255,255,255,0.68)",border:"1px solid var(--border)",flexShrink:0}}>
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9"/></svg>
    </button>
  ) : (
    <button onClick={()=>setScreen("home")} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 10px",borderRadius:12,background:"rgba(255,255,255,0.68)",border:"1px solid var(--border)",color:"var(--muted)",fontWeight:700,fontSize:12,flexShrink:0}}>
      <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      <span>Kembali</span>
    </button>
  );

  return(<><FontStyle/>
    <div className="app-shell">
      <MenuDrawer open={navOpen&&!overlay} onClose={()=>setNavOpen(false)} items={navItems} screen={screen} onNavigate={setScreen} isOwner={user.role==="owner"} onOpenTim={()=>setOverlay("tim")} onOpenMenu={()=>setOverlay("menu")} onLogout={()=>setUser(null)}/>
      {overlay==="menu"&&<MenuMgmt menus={menus} setMenus={setMenus} mitras={mitras} onClose={()=>setOverlay(null)}/>}
      {overlay==="tim"&&<Tim kasirs={kasirs} setKasirs={setKasirs} mitras={mitras} setMitras={setMitras} ownerPassword={ownerPassword} setOwnerPassword={setOwnerPassword} onClose={()=>setOverlay(null)}/>}
      {!overlay&&(<div className="app-frame">
        <Hdr {...(titles[screen]||titles.home)} left={headerLeft} right={headerRight}/>
        <div key={screen} className="screen-shell fi">
          {screen==="home"&&<Dashboard orders={orders} expenses={expenses} setExpenses={setExpenses} user={user} setScreen={setScreen} target={target} setTarget={setTarget} kasirs={kasirs} mitras={mitras} menus={menus} businessDate={businessDate} sessionOpen={sessionOpen} sessionDate={sessionDate} onBuka={handleBuka} onTutup={handleTutup}/>}
          {screen==="pos"&&(user.role==="owner"||sessionOpen?
            <POS menus={menus} orders={orders} setOrders={setOrders} user={user} businessDate={businessDate} currentSessionId={currentSessionId} kasirs={kasirs} setScreen={setScreen}/>
            :<div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,gap:16}}>
              <div style={{width:64,height:64,borderRadius:"50%",background:"rgba(239,68,68,0.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <div style={{textAlign:"center"}}>
                <p style={{color:"var(--text)",fontWeight:700,fontSize:16,marginBottom:6}}>Sesi Belum Dibuka</p>
                <p style={{color:"var(--muted)",fontSize:13,lineHeight:1.5}}>Buka sesi terlebih dahulu di halaman Home untuk mulai menerima pesanan.</p>
              </div>
            </div>
          )}
          {screen==="tagihan"&&(user.role==="owner"||sessionOpen?
            <Tagihan orders={orders} setOrders={setOrders} menus={menus} user={user} kasirs={kasirs} businessDate={businessDate} currentSessionId={currentSessionId}/>
            :<div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,gap:16}}>
              <div style={{width:64,height:64,borderRadius:"50%",background:"rgba(239,68,68,0.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <div style={{textAlign:"center"}}>
                <p style={{color:"var(--text)",fontWeight:700,fontSize:16,marginBottom:6}}>Sesi Belum Dibuka</p>
                <p style={{color:"var(--muted)",fontSize:13,lineHeight:1.5}}>Buka sesi terlebih dahulu di halaman Home untuk mengakses tagihan.</p>
              </div>
            </div>
          )}
          {screen==="keuangan"&&user.role==="owner"&&<Keuangan orders={orders} expenses={expenses} setExpenses={setExpenses} kasirs={kasirs} menus={menus} businessDate={businessDate}/>}
        </div>
        <Nav screen={screen} set={setScreen} role={user.role}/>
      </div>)}
    </div>
  </>);
}
