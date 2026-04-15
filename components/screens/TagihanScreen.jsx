"use client";
import { memo, useState, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import {
  normalizeOrder, orderSessionDate, compareOrdersNewestFirst,
  buildItemKey, rupiah, genId, localISO, fmtShort, getCategoryOptions
} from "../lib/helpers.js";
import Card from "../ui/Card.jsx";
import Btn from "../ui/Btn.jsx";
import CatBar from "../ui/CatBar.jsx";
import KasirChip from "../ui/KasirChip.jsx";
import SuccessOverlay from "../ui/SuccessOverlay.jsx";
import ReceiptPrintButton from "../ui/ReceiptPrintButton.jsx";
import Hdr from "../layout/Hdr.jsx";
import { printStruk } from "../lib/receipt.js";

const TagihanScreen = memo(({orders,setOrders,menus,user,kasirs,businessDate,currentSessionId,receiptSettings}) => {
  const [sel,setSel]=useState(null);
  const [adding,setAdding]=useState(false);
  const [cat,setCat]=useState("Semua");
  const [sheet,setSheet]=useState(null);
  const [sheetSuhu,setSheetSuhu]=useState("Ice");
  const [sheetQty,setSheetQty]=useState({});
  const [sheetNote,setSheetNote]=useState("");
  const [bayarItem,setBayarItem]=useState(null);
  const [uangItem,setUangItem]=useState("");
  const [lunasModal,setLunasModal]=useState(false);
  const [uangLunas,setUangLunas]=useState("");
  const [successState,setSuccessState]=useState(null);
  const [hapusModal,setHapusModal]=useState(null);
  const [expandedItems,setExpandedItems]=useState({});
  const toggleExpandItem=key=>setExpandedItems(prev=>({...prev,[key]:!prev[key]}));
  const [viewMode,setViewMode]=useState("list");

  const getLineKey = item => item?.cartKey || buildItemKey(item);
  const getItemsTotal = items => items.reduce((s,i)=>s+(Number(i.price)||0)*(Number(i.qty)||0),0);
  const openOrders=useMemo(()=>[...orders.filter(o=>o.status==="open"&&o.total>0&&orderSessionDate(o)===businessDate)].sort(compareOrdersNewestFirst),[orders,businessDate]);
  const carryOverOrders=useMemo(()=>[...orders.filter(o=>o.status==="open"&&o.total>0&&orderSessionDate(o)!==businessDate)].sort(compareOrdersNewestFirst),[orders,businessDate]);
  const ord=useMemo(()=>orders.find(o=>o.id===sel),[orders,sel]);

  const getSheetVariants = menu => {
    if(!menu || menu.mitraId || !menu.suhu || menu.suhu==="Tidak Ada") return [];
    return menu.suhu==="Keduanya" ? ["Ice","Hot"] : [menu.suhu==="Hot" ? "Hot" : "Ice"];
  };
  const closeSheet = () => { setSheet(null); setSheetNote(""); setSheetQty({}); };
  const totalSelectedSheetQty = Object.values(sheetQty).reduce((sum,qty)=>sum+(Number(qty)||0),0);

  const openSheet = m => {
    const def=m.suhu==="Hot"?"Hot":"Ice";
    const variants = getSheetVariants(m);
    setSheetSuhu(def);
    setSheetQty(variants.reduce((acc,key)=>({ ...acc, [key]:0 }), {}));
    setSheetNote("");
    setSheet(m);
  };

  const addItemFromSheet = () => {
    if(!sheet || !sel || !ord) return;
    const m = sheet;
    const note = sheetNote.trim();
    const variants = getSheetVariants(m);
    const itemsToAdd = variants.length
      ? variants.map(suhu => {
          const qty = Number(sheetQty[suhu] || 0);
          if(qty <= 0) return null;
          const displayName = `${m.name} (${suhu})`;
          const lineKey = buildItemKey({menuId:m.id,name:displayName,suhu,note,price:m.price});
          return {cartKey:lineKey,menuId:m.id,name:displayName,price:m.price,qty,suhu,note,mitraId:m.mitraId||null,hargaMitra:m.hargaMitra||null};
        }).filter(Boolean)
      : [{
          cartKey:buildItemKey({menuId:m.id,name:m.name,suhu:null,note,price:m.price}),
          menuId:m.id,name:m.name,price:m.price,qty:1,suhu:null,note,
          mitraId:m.mitraId||null,hargaMitra:m.hargaMitra||null,
        }];
    if(!itemsToAdd.length) return;

    const addedOrderForPrint = normalizeOrder({
      ...ord,status:"open",sessionDate:orderSessionDate(ord)||businessDate,
      sessionId:ord.sessionId||currentSessionId||null,paidAt:null,
      items:itemsToAdd,total:getItemsTotal(itemsToAdd),lastDeviceId:user.id,
    });

    setOrders(prev=>prev.map(order=>{
      if(order.id!==sel) return order;
      const items = [...(order.items||[])];
      itemsToAdd.forEach(addedItem=>{
        const existingIndex = items.findIndex(item=>getLineKey(item)===addedItem.cartKey && !item.paid);
        if(existingIndex>=0){ items[existingIndex]={...items[existingIndex],qty:(Number(items[existingIndex].qty)||0)+(Number(addedItem.qty)||0)}; }
        else { items.push(addedItem); }
      });
      return normalizeOrder({...order,sessionDate:orderSessionDate(order)||businessDate,sessionId:order.sessionId||currentSessionId||null,items,total:getItemsTotal(items.filter(item=>!item.paid)),lastDeviceId:user.id});
    }));
    closeSheet(); setAdding(false);
    setSuccessState({type:"tambah",kembalian:0,order:addedOrderForPrint,mode:"nanti"});
  };

  const bayarSatuItem=()=>{
    if(!bayarItem||!uangItem||parseInt(uangItem)<bayarItem.subtotal||!ord)return;
    const paidAt=localISO(); const kemb=parseInt(uangItem)-bayarItem.subtotal;
    const remainingAfterPay=(ord.items||[]).filter(item=>getLineKey(item)!==bayarItem.lineKey&&!item.paid);
    const isCompleted=remainingAfterPay.length===0;
    const paidItemsForPrint=(ord.items||[]).filter(item=>getLineKey(item)===bayarItem.lineKey).map(item=>({...item,paid:true,cartKey:getLineKey(item)}));
    const paidOrderForPrint=normalizeOrder({...ord,id:isCompleted?ord.id:genId("PAY"),status:"paid",sessionDate:orderSessionDate(ord)||businessDate,sessionId:ord.sessionId||currentSessionId||null,paidAt,kasirId:user.id,items:paidItemsForPrint,total:bayarItem.subtotal,lastDeviceId:user.id});

    setOrders(prev=>prev.flatMap(sourceOrder=>{
      if(sourceOrder.id!==sel) return [sourceOrder];
      const order=normalizeOrder(sourceOrder);
      const sessionDate=orderSessionDate(order)||businessDate;
      const sessionId=order.sessionId||currentSessionId||null;
      const paidLine=order.items.find(item=>getLineKey(item)===bayarItem.lineKey);
      if(!paidLine) return [order];
      const remainingItems=order.items.filter(item=>getLineKey(item)!==bayarItem.lineKey&&!item.paid).map(({paid,...rest})=>({...rest,cartKey:getLineKey(rest)}));
      const paidItem={...paidLine,paid:true,cartKey:getLineKey(paidLine)};
      const paidTotal=getItemsTotal([paidItem]);
      if(remainingItems.length===0){ return [normalizeOrder({...order,status:"paid",sessionDate,sessionId,paidAt,kasirId:user.id,items:[paidItem],total:paidTotal,lastDeviceId:user.id})]; }
      return [
        normalizeOrder({...order,status:"open",sessionDate,sessionId,paidAt:null,items:remainingItems,total:getItemsTotal(remainingItems),lastDeviceId:user.id}),
        normalizeOrder({...paidOrderForPrint,items:[paidItem],total:paidTotal})
      ];
    }));
    setBayarItem(null); setUangItem("");
    if(isCompleted){ setSel(null); setAdding(false); setSuccessState({type:"lunas",kembalian:kemb,order:paidOrderForPrint,mode:"lunas"}); }
    else { setSuccessState({type:"parsial",kembalian:kemb,order:paidOrderForPrint,mode:"lunas"}); }
  };

  const hapusItem=(lineKey)=>{
    if(!ord) return;
    const newItems=(ord.items||[]).filter(item=>getLineKey(item)!==lineKey);
    if(newItems.length===0){ setOrders(prev=>prev.filter(o=>o.id!==sel)); setSel(null); }
    else { setOrders(prev=>prev.map(order=>order.id===sel?normalizeOrder({...order,items:newItems,total:getItemsTotal(newItems.filter(item=>!item.paid)),lastDeviceId:user.id}):order)); }
    setHapusModal(null);
  };

  const kurangiQty=(lineKey,currentQty,itemName)=>{
    if(!ord) return;
    if(currentQty<=1){ setHapusModal({lineKey,name:itemName}); return; }
    setOrders(prev=>prev.map(order=>{
      if(order.id!==sel) return order;
      const newItems=(order.items||[]).map(item=>getLineKey(item)!==lineKey?item:{...item,qty:(Number(item.qty)||1)-1});
      return normalizeOrder({...order,items:newItems,total:getItemsTotal(newItems.filter(item=>!item.paid)),lastDeviceId:user.id});
    }));
  };

  const konfirmasiLunas=()=>{
    if(!uangLunas||!ord||parseInt(uangLunas)<ord.total)return;
    const paidAt=localISO(); const kemb=parseInt(uangLunas)-ord.total;
    const updatedOrder=normalizeOrder({...ord,status:"paid",sessionDate:orderSessionDate(ord)||businessDate,sessionId:ord.sessionId||currentSessionId||null,paidAt,kasirId:user.id,items:(ord.items||[]).map(item=>({...item,paid:true,cartKey:getLineKey(item)})),lastDeviceId:user.id});
    setOrders(prev=>prev.map(order=>order.id===sel?updatedOrder:order));
    setLunasModal(false); setUangLunas(""); setSel(null);
    setSuccessState({type:"lunas",kembalian:kemb,order:updatedOrder,mode:"lunas"});
  };

  const kembalianItem=uangItem&&bayarItem&&parseInt(uangItem)>bayarItem.subtotal?parseInt(uangItem)-bayarItem.subtotal:null;
  const kembalianLunas=uangLunas&&ord&&parseInt(uangLunas)>ord.total?parseInt(uangLunas)-ord.total:null;

  if(successState)return <SuccessOverlay
    type={successState.type} kembalian={successState.kembalian}
    onPrint={()=>printStruk(successState.order,successState.kembalian,kasirs,receiptSettings,successState.mode||(successState.type==="lunas"||successState.type==="parsial"?"lunas":"nanti"))}
    onBack={()=>setSuccessState(null)} backLabel={successState.type==="lunas"?"Kembali":"Kembali ke Tagihan"}
  />;

  return (sel&&ord) ? (<div className="tagihan-detail-screen" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
    <Hdr title={ord.customerName} sub={`Sisa ${rupiah(ord.total)} · Sesi ${fmtShort(orderSessionDate(ord)||businessDate)}`}
      right={<div style={{display:"flex",alignItems:"center",gap:8}}>
        <KasirChip kasirId={ord.kasirId} kasirs={kasirs}/>
        <button onClick={()=>{setSel(null);setAdding(false);closeSheet();}} style={{color:"var(--amber)",display:"flex"}}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5 M12 19l-7-7 7-7"/></svg>
        </button>
      </div>}/>
    {adding?(
      <><div style={{padding:"10px 18px",borderBottom:"1px solid var(--border)",flexShrink:0}}>
        <p style={{color:"var(--muted)",fontSize:13,marginBottom:8}}>Tambah untuk <strong style={{color:"var(--amber)"}}>{ord.customerName}</strong></p>
        <CatBar cats={getCategoryOptions(menus)} active={cat} onChange={setCat}/>
      </div>
      <div className="menu-grid" style={{flex:1,overflowY:"auto",padding:"11px 18px"}}>
        {menus.filter(m=>m.available&&(cat==="Semua"||m.category===cat)).map(m=>{
          const hasSuhu=!m.mitraId&&m.suhu&&m.suhu!=="Tidak Ada";
          return(
            <div key={m.id} className="menu-card">
              <div className="menu-card-head">
                <p style={{color:"var(--muted)",fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.04em"}}>{m.category}</p>
                <p className="menu-card-title">{m.name}</p>
                {hasSuhu&&(<div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {(m.suhu==="Keduanya"||m.suhu==="Ice")&&<span style={{fontSize:9,background:"var(--blue-dim)",color:"var(--blue)",padding:"2px 6px",borderRadius:99,fontWeight:700}}>🧊 Ice</span>}
                  {(m.suhu==="Keduanya"||m.suhu==="Hot")&&<span style={{fontSize:9,background:"var(--red-dim)",color:"var(--red)",padding:"2px 6px",borderRadius:99,fontWeight:700}}>🔥 Hot</span>}
                </div>)}
              </div>
              <div className="menu-card-price-row">
                <p style={{color:"var(--amber)",fontWeight:800,fontSize:13}}>{rupiah(m.price)}</p>
                {m.mitraId&&m.hargaMitra&&m.price>m.hargaMitra&&(<span style={{background:"var(--green-dim)",color:"var(--green)",fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:99}}>+{rupiah(m.price-m.hargaMitra)}</span>)}
              </div>
              <button className="menu-card-action" onClick={()=>openSheet(m)}>+ Tambah</button>
            </div>
          );
        })}
      </div></>
    ):(
      <>
        <div style={{flex:1,overflowY:"auto",padding:"17px 17px 8px",display:"flex",flexDirection:"column",gap:13}}>
          <Card>{ord.items.map((item,i)=>{
            const subtotal=item.price*item.qty;
            const lineKey=getLineKey(item);
            return(<div key={lineKey} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<ord.items.length-1?"1px solid var(--border)":"none",opacity:item.paid?0.45:1}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  {(()=>{const isLong=item.name.length>22;const exp=!!expandedItems[lineKey];return(<p onClick={()=>isLong&&toggleExpandItem(lineKey)} style={{color:"var(--text)",fontWeight:500,fontSize:14,lineHeight:1.4,overflow:exp?"visible":"hidden",display:exp?"block":"-webkit-box",WebkitLineClamp:exp?undefined:1,WebkitBoxOrient:"vertical",cursor:isLong?"pointer":"default",wordBreak:"break-word"}}>{item.name}{isLong&&<span style={{color:"var(--amber)",fontSize:11,fontWeight:700,marginLeft:4}}>{exp?"▲":"▼"}</span>}</p>);})()} 
                  {item.paid&&<span style={{background:"var(--green-dim)",color:"var(--green)",fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:99}}>✓ Dibayar</span>}
                </div>
                {item.note&&<p style={{color:"var(--blue)",fontSize:11,marginTop:2}}>📝 {item.note}</p>}
                <p style={{color:"var(--muted)",fontSize:12,marginTop:2}}>{item.qty} × {rupiah(item.price)}</p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0,marginLeft:8}}>
                <p style={{color:item.paid?"var(--muted)":"var(--text)",fontWeight:700,fontSize:14}}>{rupiah(subtotal)}</p>
                {!item.paid&&(<>
                  <button onClick={()=>kurangiQty(lineKey,item.qty,item.name)} style={{width:30,height:30,borderRadius:8,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,fontSize:18,fontWeight:700,color:"var(--red)"}}>−</button>
                  <button onClick={()=>{setBayarItem({...item,subtotal,lineKey});setUangItem(String(subtotal));}} style={{background:"var(--amber)",color:"#fff",border:"none",borderRadius:8,padding:"5px 10px",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>Bayar</button>
                </>)}
              </div>
            </div>);
          })}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:11,paddingTop:11,borderTop:"1px solid var(--border)"}}>
              <span className="sora" style={{fontWeight:700,color:"var(--text)"}}>Sisa Tagihan</span>
              <span className="sora" style={{fontWeight:800,color:"var(--amber)",fontSize:20}}>{rupiah(ord.total)}</span>
            </div>
          </Card>
        </div>
        <div style={{padding:"12px 16px 16px",display:"flex",flexDirection:"column",gap:9}}>
          <div style={{display:"flex",gap:9}}>
            <Btn v="dark" onClick={()=>setAdding(true)} full sm>+ Tambah</Btn>
            <ReceiptPrintButton onClick={()=>printStruk(ord,0,kasirs,receiptSettings,"nanti")} loadingLabel="Menyiapkan struk..." doneLabel="✓ Struk siap" style={{flex:1,padding:"10px 12px",borderRadius:16,background:"rgba(255,255,255,0.78)",color:"var(--text)",border:"1px solid var(--border)",boxShadow:"0 8px 18px rgba(15,23,42,0.04)",fontWeight:700,fontSize:13,minHeight:44}}>🧾 Struk</ReceiptPrintButton>
          </div>
          <Btn v="success" onClick={()=>{setUangLunas(String(ord.total));setLunasModal(true);}} full>✓ Konfirmasi Lunas — {rupiah(ord.total)}</Btn>
        </div>
      </>
    )}

    {sheet&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:320,display:"flex",alignItems:"flex-end"}} onClick={closeSheet}>
      <div className="fu" style={{background:"var(--bg2)",borderRadius:"20px 20px 0 0",width:"100%",display:"flex",flexDirection:"column",maxHeight:"85vh"}} onClick={e=>e.stopPropagation()}>
        <div style={{overflowY:"auto",flex:1,padding:"22px 20px 14px",display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <p style={{color:"var(--muted)",fontSize:12}}>Tambah item ke tagihan</p>
            <h3 className="sora" style={{fontWeight:700,color:"var(--text)",fontSize:18,marginTop:2}}>{sheet.name}</h3>
            <p className="sora" style={{color:"var(--amber)",fontWeight:800,fontSize:16,marginTop:4}}>{rupiah(sheet.price)}</p>
          </div>
          {!sheet.mitraId&&sheet.suhu&&sheet.suhu!=="Tidak Ada"?(
            <div>
              <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Suhu</p>
              <div style={{display:"flex",gap:8}}>
                {getSheetVariants(sheet).map(s=>{
                  const isIce=s==="Ice";const clr=isIce?"var(--blue)":"var(--red)";const bgDim=isIce?"var(--blue-dim)":"var(--red-dim)";const brd=isIce?"rgba(59,130,246,0.4)":"rgba(239,68,68,0.4)";const countSuhu=Number(sheetQty[s]||0);
                  return(
                    <div key={s} style={{flex:1,display:"flex",alignItems:"center",gap:6,background:bgDim,borderRadius:11,padding:"10px 10px",border:`1px solid ${brd}`}}>
                      <button onClick={()=>setSheetQty(prev=>({...prev,[s]:Math.max(0,(Number(prev[s])||0)-1)}))} style={{width:28,height:28,borderRadius:7,background:"rgba(0,0,0,0.08)",border:"none",fontSize:18,fontWeight:800,color:clr,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>−</button>
                      <span style={{flex:1,textAlign:"center",fontWeight:700,fontSize:13,color:clr}}>{isIce?"🧊 Ice":"🔥 Hot"}</span>
                      <button onClick={()=>setSheetQty(prev=>({...prev,[s]:(Number(prev[s])||0)+1}))} style={{width:28,height:28,borderRadius:7,background:"rgba(0,0,0,0.08)",border:"none",fontSize:18,fontWeight:800,color:clr,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>+</button>
                      <span style={{fontWeight:800,fontSize:16,color:clr,minWidth:18,textAlign:"center"}}>{countSuhu}</span>
                    </div>
                  );
                })}
              </div>
              <p style={{color:"var(--muted)",fontSize:11,marginTop:8}}>Hitungan di popup ini mulai dari 0 dan hanya untuk tambahan baru ke tagihan aktif.</p>
            </div>
          ):null}
          <div>
            <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Catatan (opsional)</p>
            <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:11,overflow:"hidden"}}>
              <textarea value={sheetNote} onChange={e=>setSheetNote(e.target.value)} placeholder="Misal: less sugar, tanpa es, ekstra pedas..."
                rows={2} style={{width:"100%",padding:"11px 14px",background:"none",border:"none",outline:"none",resize:"none",fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"var(--text)",boxSizing:"border-box"}}/>
            </div>
          </div>
        </div>
        <div style={{padding:"12px 20px calc(env(safe-area-inset-bottom) + 88px)",borderTop:"1px solid var(--border)"}}>
          <Btn onClick={addItemFromSheet} disabled={getSheetVariants(sheet).length>0 && totalSelectedSheetQty===0} full>Tambah ke Tagihan</Btn>
        </div>
      </div>
    </div>)}

    {bayarItem&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={()=>{setBayarItem(null);setUangItem("");}}>
      <div className="fu" style={{background:"var(--bg2)",borderRadius:"20px 20px 0 0",padding:"22px 20px 28px",width:"100%",display:"flex",flexDirection:"column",gap:14,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <h3 className="sora" style={{fontWeight:700,color:"var(--text)",fontSize:16}}>💳 Bayar Item</h3>
        <div style={{background:"var(--card)",borderRadius:12,padding:"13px 15px"}}>
          <p style={{color:"var(--text)",fontWeight:600,fontSize:14}}>{bayarItem.name}</p>
          {bayarItem.note&&<p style={{color:"var(--blue)",fontSize:11,marginTop:4}}>📝 {bayarItem.note}</p>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
            <span style={{color:"var(--muted)",fontSize:12}}>{bayarItem.qty} × {rupiah(bayarItem.price)}</span>
            <span className="sora" style={{fontWeight:800,color:"var(--amber)",fontSize:18}}>{rupiah(bayarItem.subtotal)}</span>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          <label style={{fontSize:11,color:'var(--muted)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>UANG DITERIMA</label>
          <div style={{display:'flex',alignItems:'center',background:'rgba(255,255,255,0.88)',border:'1px solid var(--border)',borderRadius:14,overflow:'hidden'}}>
            <span style={{padding:'0 6px 0 14px',color:'var(--muted)',fontSize:14,flexShrink:0,fontWeight:600}}>Rp</span>
            <input type="text" inputMode="numeric" value={uangItem?Number(uangItem).toLocaleString('id-ID'):''} onChange={e=>{const raw=e.target.value.replace(/\D/g,'');setUangItem(raw);}} placeholder="0" style={{paddingLeft:'4px'}}/>
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:2}}>
            {bayarItem.subtotal>0&&<button type="button" onClick={()=>setUangItem(String(bayarItem.subtotal))} style={{padding:'5px 11px',borderRadius:8,background:'var(--green-dim)',color:'var(--green)',border:'1px solid rgba(16,185,129,0.3)',fontSize:12,fontWeight:700,flexShrink:0,cursor:'pointer'}}>✓ Uang Pas</button>}
            {[15000,20000,50000,100000].map(a=><button type="button" key={a} onClick={()=>setUangItem(String(a))} style={{padding:'5px 10px',borderRadius:8,background:'var(--card2)',color:'var(--muted)',border:'1px solid var(--border)',fontSize:12,fontWeight:600,flexShrink:0,cursor:'pointer'}}>{a/1000}rb</button>)}
          </div>
        </div>
        {uangItem&&parseInt(uangItem)<bayarItem.subtotal&&<p style={{color:"var(--red)",fontSize:13,fontWeight:600,textAlign:"center"}}>⚠ Kurang {rupiah(bayarItem.subtotal-parseInt(uangItem))}</p>}
        {kembalianItem!==null&&(<div style={{background:"var(--green-dim)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:12,padding:"13px 15px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:"var(--green)",fontWeight:600,fontSize:13}}>✓ Kembalian</span>
          <span className="sora" style={{fontWeight:800,color:"var(--green)",fontSize:20}}>{rupiah(kembalianItem)}</span>
        </div>)}
        <Btn v="success" onClick={bayarSatuItem} disabled={!uangItem||parseInt(uangItem)<bayarItem.subtotal} full>✓ Konfirmasi Bayar</Btn>
        <Btn v="ghost" onClick={()=>{setBayarItem(null);setUangItem("");}} full>Batal</Btn>
      </div>
    </div>)}

    {hapusModal&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 20px"}} onClick={()=>setHapusModal(null)}>
      <div style={{background:"var(--card)",borderRadius:18,padding:"22px 20px",width:"100%",maxWidth:340,display:"flex",flexDirection:"column",gap:16}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:42,height:42,borderRadius:12,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </div>
          <div>
            <p style={{fontWeight:700,color:"var(--text)",fontSize:15}}>Hapus Item?</p>
            <p style={{color:"var(--muted)",fontSize:13,marginTop:2}}>{hapusModal.name}</p>
          </div>
        </div>
        <p style={{color:"var(--muted)",fontSize:13,lineHeight:1.5}}>Qty sudah 1. Yakin hapus pesanan <strong style={{color:"var(--text)"}}>{hapusModal.name}</strong> dari tagihan ini?</p>
        <div style={{display:"flex",gap:9}}>
          <Btn v="ghost" onClick={()=>setHapusModal(null)} full sm>Batal</Btn>
          <Btn v="danger" onClick={()=>hapusItem(hapusModal.lineKey)} full sm>Hapus</Btn>
        </div>
      </div>
    </div>)}

    {lunasModal&&ord&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={()=>{setLunasModal(false);setUangLunas("");}}>
      <div className="fu" style={{background:"var(--bg2)",borderRadius:"20px 20px 0 0",padding:"22px 20px 28px",width:"100%",display:"flex",flexDirection:"column",gap:14,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <h3 className="sora" style={{fontWeight:700,color:"var(--text)",fontSize:16}}>💳 Lunasi Semua — {ord.customerName}</h3>
        <div style={{background:"var(--card)",borderRadius:12,padding:"13px 15px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:"var(--muted)",fontSize:13}}>Total Sisa</span>
          <span className="sora" style={{fontWeight:800,color:"var(--amber)",fontSize:18}}>{rupiah(ord.total)}</span>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          <label style={{fontSize:11,color:'var(--muted)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>UANG DITERIMA</label>
          <div style={{display:'flex',alignItems:'center',background:'rgba(255,255,255,0.88)',border:'1px solid var(--border)',borderRadius:14,overflow:'hidden'}}>
            <span style={{padding:'0 6px 0 14px',color:'var(--muted)',fontSize:14,flexShrink:0,fontWeight:600}}>Rp</span>
            <input type="text" inputMode="numeric" value={uangLunas?Number(uangLunas).toLocaleString('id-ID'):''} onChange={e=>{const raw=e.target.value.replace(/\D/g,'');setUangLunas(raw);}} placeholder="0" style={{paddingLeft:'4px'}}/>
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:2}}>
            {ord.total>0&&<button type="button" onClick={()=>setUangLunas(String(ord.total))} style={{padding:'5px 11px',borderRadius:8,background:'var(--green-dim)',color:'var(--green)',border:'1px solid rgba(16,185,129,0.3)',fontSize:12,fontWeight:700,flexShrink:0,cursor:'pointer'}}>✓ Uang Pas</button>}
            {[15000,20000,50000,100000].map(a=><button type="button" key={a} onClick={()=>setUangLunas(String(a))} style={{padding:'5px 10px',borderRadius:8,background:'var(--card2)',color:'var(--muted)',border:'1px solid var(--border)',fontSize:12,fontWeight:600,flexShrink:0,cursor:'pointer'}}>{a/1000}rb</button>)}
          </div>
        </div>
        {uangLunas&&parseInt(uangLunas)<ord.total&&<p style={{color:"var(--red)",fontSize:13,fontWeight:600,textAlign:"center"}}>⚠ Kurang {rupiah(ord.total-parseInt(uangLunas))}</p>}
        {kembalianLunas!==null&&(<div style={{background:"var(--green-dim)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:12,padding:"13px 15px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:"var(--green)",fontWeight:600,fontSize:13}}>✓ Kembalian</span>
          <span className="sora" style={{fontWeight:800,color:"var(--green)",fontSize:20}}>{rupiah(kembalianLunas)}</span>
        </div>)}
        <Btn v="success" onClick={konfirmasiLunas} disabled={!uangLunas||parseInt(uangLunas)<ord.total} full>✓ Konfirmasi Lunas</Btn>
        <Btn v="ghost" onClick={()=>{setLunasModal(false);setUangLunas("");}} full>Batal</Btn>
      </div>
    </div>)}
  </div>)
  : (<div className="tagihan-list-screen" style={{flex:1,overflowY:"auto",padding:"17px"}}>
    <div className="fu" style={{marginBottom:12,display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
      <div>
        <h2 className="sora" style={{fontSize:20,fontWeight:800,color:"var(--text)"}}>Tagihan Terbuka</h2>
        <p style={{color:"var(--muted)",fontSize:13,marginTop:3}}>{openOrders.length} pelanggan sesi ini · <span style={{color:"var(--amber)",fontWeight:700}}>{rupiah(openOrders.reduce((s,o)=>s+o.total,0))}</span> potensi masuk</p>
      </div>
      <div style={{display:"flex",background:"var(--bg2)",borderRadius:10,padding:3,gap:2,flexShrink:0,marginTop:2}}>
        <button onClick={()=>setViewMode("list")} style={{width:34,height:34,borderRadius:8,background:viewMode==="list"?"var(--card)":"transparent",border:"none",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:viewMode==="list"?"0 2px 6px rgba(15,23,42,0.1)":"none",transition:"all 0.15s"}}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={viewMode==="list"?"var(--amber)":"var(--muted)"} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        </button>
        <button onClick={()=>setViewMode("grid")} style={{width:34,height:34,borderRadius:8,background:viewMode==="grid"?"var(--card)":"transparent",border:"none",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:viewMode==="grid"?"0 2px 6px rgba(15,23,42,0.1)":"none",transition:"all 0.15s"}}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={viewMode==="grid"?"var(--amber)":"var(--muted)"} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        </button>
      </div>
    </div>
    {carryOverOrders.length>0&&(
      <Card style={{marginBottom:12,background:"rgba(212,130,10,0.08)",border:"1px solid rgba(212,130,10,0.2)"}}>
        <p style={{color:"var(--amber)",fontWeight:700,fontSize:13,marginBottom:6}}>⚠ Ada {carryOverOrders.length} tagihan lintas sesi</p>
        <p style={{color:"var(--text)",fontSize:13,lineHeight:1.5}}>Order terbuka dari sesi lama tidak ditampilkan sebagai tagihan aktif sesi hari ini agar rekap tidak tercampur. Buka ulang sesi asal atau selesaikan data legacy lebih dulu.</p>
      </Card>
    )}
    {openOrders.length===0?(
      <Card style={{textAlign:"center",padding:32}}><p style={{fontSize:28,marginBottom:8}}>🎉</p><p style={{color:"var(--muted)"}}>Tidak ada tagihan terbuka untuk sesi ini.</p></Card>
    ):viewMode==="list"?(
      openOrders.map(o=>(
        <div className="tagihan-card" key={o.id} onClick={()=>setSel(o.id)} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:13,padding:"13px 15px",marginBottom:9,cursor:"pointer",boxShadow:"0 2px 8px rgba(15,23,42,0.05)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <p style={{color:"var(--text)",fontWeight:700,fontSize:15,fontFamily:"'Sora',sans-serif"}}>{o.customerName}</p>
            <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
              <p className="sora" style={{color:"var(--amber)",fontWeight:800,fontSize:14}}>{rupiah(o.total)}</p>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>
          <div style={{height:1,background:"var(--bg2)",marginBottom:7}}/>
          {o.items.slice(0,3).map((item,idx)=>(
            <div key={idx} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"2.5px 0"}}>
              <p style={{color:"var(--muted)",fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"80%",lineHeight:1.4}}>{item.name}{item.note?` · ${item.note}`:""}</p>
              <span style={{color:"var(--text)",fontSize:12,fontWeight:700,flexShrink:0}}>×{item.qty}</span>
            </div>
          ))}
          {o.items.length>3&&<p style={{color:"var(--amber)",fontSize:11,fontWeight:600,marginTop:3}}>··· +{o.items.length-3} item lainnya</p>}
          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:9}}>
            <KasirChip kasirId={o.kasirId} kasirs={kasirs}/>
            <span style={{color:"var(--muted)",fontSize:11}}>Sesi {fmtShort(orderSessionDate(o)||businessDate)}</span>
          </div>
        </div>
      ))
    ):(
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,gridAutoRows:"1fr",alignItems:"stretch"}}>
        {openOrders.map(o=>{
          const MAX=3; const visible=o.items.slice(0,MAX); const overflow=o.items.length-MAX;
          const totalQty=o.items.reduce((s,i)=>s+(Number(i.qty)||0),0);
          return(
            <div key={o.id} onClick={()=>setSel(o.id)} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:14,padding:"12px 12px 11px",cursor:"pointer",boxShadow:"0 2px 8px rgba(15,23,42,0.05)",display:"flex",flexDirection:"column",height:"100%"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <p style={{color:"var(--text)",fontWeight:700,fontSize:13,fontFamily:"'Sora',sans-serif",lineHeight:1.3,flex:1,paddingRight:4}}>{o.customerName}</p>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                <span className="sora" style={{color:"var(--amber)",fontWeight:800,fontSize:13}}>{rupiah(o.total)}</span>
                <span style={{background:"var(--amber-dim)",color:"var(--amber)",fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:99}}>{totalQty} item</span>
              </div>
              <div style={{height:1,background:"var(--bg2)",marginBottom:7}}/>
              <div style={{flex:1}}>
                {visible.map((item,idx)=>(<div key={idx} style={{display:"flex",justifyContent:"space-between",padding:"1.5px 0"}}><p style={{color:"var(--muted)",fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"78%",lineHeight:1.4}}>{item.name}</p><span style={{color:"var(--text)",fontSize:11,fontWeight:700,flexShrink:0}}>×{item.qty}</span></div>))}
                {overflow>0&&<p style={{color:"var(--amber)",fontSize:10,fontWeight:600,marginTop:3}}>+{overflow} lainnya</p>}
              </div>
              <div style={{marginTop:8,paddingTop:7,borderTop:"1px solid var(--bg2)"}}><KasirChip kasirId={o.kasirId} kasirs={kasirs}/></div>
            </div>
          );
        })}
      </div>
    )}
  </div>);
});

export default TagihanScreen;
