// lib/helpers.js

export const seedToday = new Date();
export const getNow = () => new Date();
export const pad2 = n => String(n).padStart(2,"0");
export const fmt = d => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
export const dateKey = value => value ? String(value).slice(0,10) : null;
export const safeTextKey = value => String(value||"").trim().toLowerCase().replace(/\s+/g," ");
export const buildItemKey = item => [
  item?.menuId ?? "menu",
  safeTextKey(item?.name),
  safeTextKey(item?.suhu),
  safeTextKey(item?.note),
  Number(item?.price)||0,
].join("::");
export const paidAtDate = pa => dateKey(pa);
export const orderSessionDate = order => dateKey(order?.sessionDate || order?.session_date)
  || ((typeof order?.createdAt === "string" && order.createdAt.length===10) ? dateKey(order.createdAt) : null)
  || paidAtDate(order?.paidAt);
export const orderCreatedAt = order => {
  const raw = order?.createdAt || null;
  if(typeof raw === "string" && raw.length===10) return null;
  return raw;
};
export const orderActualPaidAt = order => order?.paidAt || null;
export const getOrderNewestStamp = order => orderActualPaidAt(order) || orderCreatedAt(order) || order?.id || "";
export const compareOrdersNewestFirst = (a,b) => getOrderNewestStamp(b).localeCompare(getOrderNewestStamp(a));
export const hasCrossDatePayment = order => {
  const reportDate = orderSessionDate(order);
  const actualDate = paidAtDate(orderActualPaidAt(order));
  return Boolean(reportDate && actualDate && reportDate !== actualDate);
};
export const normalizeOrder = raw => {
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
export const serializeOrderForSync = order => JSON.stringify({
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
export const toDbOrder = (order, deviceId=null) => ({
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
export const mapKasirRow = row => ({id:row.id,name:row.name,password:row.password});
export const mapMitraRow = row => ({id:row.id,name:row.name,pemilik:row.pemilik});
export const mapMenuRow = row => ({id:row.id,name:row.name,price:row.price,category:row.category,available:row.available,mitraId:row.mitra_id||null,hargaMitra:row.harga_mitra||null,suhu:row.suhu||null});
export const mapExpenseRow = row => ({id:row.id,description:row.description,amount:row.amount,date:row.date});
export const mapOrderRow = row => normalizeOrder({
  id:row.id,
  customerName:row.customer_name,
  status:row.status,
  createdAt:row.created_at,
  sessionDate:row.session_date,
  sessionId:row.session_id,
  paidAt:row.paid_at,
  items:row.items,
  total:row.total,
  kasirId:row.kasir_id,
  updatedAt:row.updated_at,
  lastDeviceId:row.last_device_id,
});
export const upsertById = (list, item) => {
  const idx = list.findIndex(entry => String(entry?.id) === String(item?.id));
  if(idx === -1) return [...list, item];
  const next = [...list];
  next[idx] = item;
  return next;
};
export const removeById = (list, id) => list.filter(entry => String(entry?.id) !== String(id));
export const serializeSimpleRow = row => JSON.stringify(row);

export const fmtWaktu = pa => {
  if(!pa) return "";
  if(pa.length===10) return "";
  const d = new Date(pa);
  return d.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"});
};
export const fmtTanggalWaktu = pa => {
  if(!pa) return "";
  if(pa.length===10){
    return new Date(pa+"T00:00:00").toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"});
  }
  const d = new Date(pa);
  const tgl = d.toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"});
  const jam = d.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"});
  return `${tgl}, ${jam}`;
};

export const todayStr = fmt(seedToday);
export const rupiah = n => "Rp " + Number(n).toLocaleString("id-ID");
export const genId = prefix => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
export const localISO = () => {
  const d = new Date();
  const datePart = `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
  return `${datePart}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
};

export const fmtFull = ds => new Date(ds+"T00:00:00").toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
export const fmtShort = ds => new Date(ds+"T00:00:00").toLocaleDateString("id-ID",{weekday:"short",day:"numeric",month:"short"});
export const fmtMonth = (y,m) => new Date(y,m,1).toLocaleDateString("id-ID",{month:"long",year:"numeric"});
export const pad = n => String(n).padStart(2,"0");

export const getMonths = (dates) => {
  const set = new Set(dates.map(d => d.slice(0,7)));
  return [...set].sort((a,b)=>b.localeCompare(a)).map(ym => {
    const [y,m] = ym.split("-");
    return { key: ym, year: parseInt(y), month: parseInt(m)-1,
      label: new Date(parseInt(y), parseInt(m)-1, 1).toLocaleDateString("id-ID",{month:"long",year:"numeric"}) };
  });
};

export const expenseDateKey = expense => dateKey(expense?.date);

export const formatThousands = v => v ? Number(String(v).replace(/\D/g,'')||0).toLocaleString('id-ID') : '';
export const parseNum = v => String(v||'').replace(/\D/g,'');

const _DEFAULT_FILTER_CATS = ["Semua","Kopi","Makanan"];
const _DEFAULT_MENU_CATS = ["Kopi","Makanan"];
export const getCategoryOptions = (menus, includeAll=true) => {
  const seen = new Set();
  (menus||[]).forEach(m=>{
    const cat = String(m?.category||"").trim();
    if(cat) seen.add(cat);
  });
  const cats = [...seen];
  const base = cats.length ? cats : (includeAll ? _DEFAULT_FILTER_CATS.slice(1) : _DEFAULT_MENU_CATS);
  return includeAll ? ["Semua", ...base] : base;
};
