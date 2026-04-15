// lib/finance.js
import { dateKey, orderSessionDate, expenseDateKey } from "./helpers.js";

export const getItemMitraModal = (item, menus=[]) => {
  const menuRef = Array.isArray(menus) ? menus.find(m=>String(m.id)===String(item?.menuId)) : null;
  const mitraId = item?.mitraId || menuRef?.mitraId;
  if(!mitraId) return 0;
  const hargaMitra = Number(item?.hargaMitra ?? menuRef?.hargaMitra) || 0;
  const qty = Number(item?.qty) || 0;
  return hargaMitra * qty;
};
export const getOrderMitraModal = (order, menus=[]) => (order?.items||[]).reduce((sum,item)=>sum+getItemMitraModal(item, menus),0);
export const getOrdersMitraModal = (orders, menus=[]) => orders.reduce((sum,order)=>sum+getOrderMitraModal(order, menus),0);
export const getItemOmsetMitra = (item, menus=[]) => {
  const menuRef = Array.isArray(menus) ? menus.find(m=>String(m.id)===String(item?.menuId)) : null;
  const mitraId = item?.mitraId || menuRef?.mitraId;
  if(!mitraId) return 0;
  return (Number(item?.price)||0) * (Number(item?.qty)||0);
};
export const getOrderOmsetMitra = (order, menus=[]) => (order?.items||[]).reduce((sum,item)=>sum+getItemOmsetMitra(item, menus),0);
export const getOrdersOmsetMitra = (orders, menus=[]) => orders.reduce((sum,order)=>sum+getOrderOmsetMitra(order, menus),0);

export const emptyFinanceSummary = (date=null) => ({
  date,
  paidOrders: [],
  expenses: [],
  pemasukan: 0,
  pengeluaran: 0,
  modalMitra: 0,
  omsetMitra: 0,
  totalKeluar: 0,
  kas: 0,
});
export const calcFinanceSummary = ({orders=[], expenses=[], menus=[]}) => {
  const paidOrders = (orders||[]).filter(o=>o?.status === "paid");
  const normalizedExpenses = (expenses||[]).filter(Boolean);
  const pemasukan = paidOrders.reduce((sum,o)=>sum+(Number(o?.total)||0),0);
  const pengeluaran = normalizedExpenses.reduce((sum,e)=>sum+(Number(e?.amount)||0),0);
  const modalMitra = getOrdersMitraModal(paidOrders, menus);
  const omsetMitra = getOrdersOmsetMitra(paidOrders, menus);
  const totalKeluar = pengeluaran + modalMitra;
  return {
    paidOrders,
    expenses: normalizedExpenses,
    pemasukan,
    pengeluaran,
    modalMitra,
    omsetMitra,
    totalKeluar,
    kas: pemasukan - totalKeluar,
  };
};
export const buildFinanceDayMap = (orders=[], expenses=[], menus=[]) => {
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
    bucket.omsetMitra += getOrderOmsetMitra(order, menus);
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
export const getFinanceSummaryForDate = (dayMap, date) => {
  const key = dateKey(date);
  return (key && dayMap?.[key]) ? dayMap[key] : emptyFinanceSummary(key);
};
export const getFinanceSummaryForMonth = (dayMap, monthKey) => {
  const rows = Object.values(dayMap||{}).filter(row=>row.date?.startsWith(monthKey));
  return rows.reduce((acc,row)=>({
    paidOrders: acc.paidOrders.concat(row.paidOrders||[]),
    expenses: acc.expenses.concat(row.expenses||[]),
    pemasukan: acc.pemasukan + (Number(row.pemasukan)||0),
    pengeluaran: acc.pengeluaran + (Number(row.pengeluaran)||0),
    modalMitra: acc.modalMitra + (Number(row.modalMitra)||0),
    omsetMitra: acc.omsetMitra + (Number(row.omsetMitra)||0),
    totalKeluar: acc.totalKeluar + (Number(row.totalKeluar)||0),
    kas: acc.kas + (Number(row.kas)||0),
  }), emptyFinanceSummary(monthKey));
};
