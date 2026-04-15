"use client";
import { memo, useState, useMemo, useRef } from "react";
import {
  rupiah, buildItemKey, normalizeOrder, compareOrdersNewestFirst,
  genId, localISO, orderSessionDate, getCategoryOptions, fmtShort
} from "../lib/helpers.js";
import Card from "../ui/Card.jsx";
import Btn from "../ui/Btn.jsx";
import TxtInput from "../ui/TxtInput.jsx";
import CatBar from "../ui/CatBar.jsx";
import KasirChip from "../ui/KasirChip.jsx";
import PaymentMeta from "../ui/PaymentMeta.jsx";
import SuccessOverlay from "../ui/SuccessOverlay.jsx";
import { printStruk } from "../lib/receipt.js";

const OpenSearchBtn = ({active, onClick}) => (
  <button onClick={onClick} style={{width:28,height:28,borderRadius:8,background:active?"var(--amber-dim)":"rgba(255,255,255,0.82)",border:`1px solid ${active?"rgba(245,158,11,0.28)":"var(--border)"}`,display:"flex",alignItems:"center",justifyContent:"center",color:active?"var(--amber)":"var(--muted)",cursor:"pointer",boxShadow:"0 2px 6px rgba(15,23,42,0.07)",flexShrink:0,transition:"all .15s ease"}}>
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
  </button>
);

const POSScreen = memo(({menus,orders,setOrders,user,businessDate,currentSessionId,kasirs,setScreen,posStep:step,setPosStep:setStep,posName:name,setPosName:setName,posCart:cart,setPosCart:setCart,receiptSettings,setDetailOrder,loadFromSupabase}) => {
  const [cat,setCat]=useState("Semua");
  const [search,setSearch]=useState("");
  const [showSearch,setShowSearch]=useState(false);
  const searchRef=useRef(null);
  const [openSearch,setOpenSearch]=useState(false);
  const [openQ,setOpenQ]=useState("");
  const openSearchRef=useRef(null);
  const [layout,setLayout]=useState(()=>{try{return localStorage.getItem("posLayout")||"grid";}catch{return "grid";}});
  const setLayoutSave=v=>{setLayout(v);try{localStorage.setItem("posLayout",v);}catch{}};
  const [sheet,setSheet]=useState(null);
  const [sheetSuhu,setSheetSuhu]=useState("Ice");
  const [sheetNote,setSheetNote]=useState("");

  const total=cart.reduce((s,c)=>s+c.price*c.qty,0);
  const cartKey=(menuId,suhu,note="",price=0,nm="")=>buildItemKey({menuId,suhu,note,price,name:nm});
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
    const note=sheetNote.trim();
    const displayName=needSuhu?`${m.name} (${suhu})`:m.name;
    const key=cartKey(m.id,suhu,note,m.price,displayName);
    setCart(p=>{
      const e=p.find(c=>c.cartKey===key);
      if(e)return p.map(c=>c.cartKey===key?{...c,qty:c.qty+1}:c);
      return [...p,{cartKey:key,menuId:m.id,name:displayName,price:m.price,qty:1,suhu,note,mitraId:m.mitraId||null,hargaMitra:m.hargaMitra||null}];
    });
    setSheet(null);setSheetNote("");
  };

  const quickAdd=(m)=>{
    const needSuhu=!m.mitraId&&m.suhu&&m.suhu!=="Tidak Ada";
    const suhu=needSuhu?(m.suhu==="Ice"?"Ice":"Hot"):null;
    const displayName=needSuhu?`${m.name} (${suhu})`:m.name;
    const key=cartKey(m.id,suhu,"",m.price,displayName);
    setCart(p=>{
      const e=p.find(c=>c.cartKey===key);
      if(e)return p.map(c=>c.cartKey===key?{...c,qty:c.qty+1}:c);
      return [...p,{cartKey:key,menuId:m.id,name:displayName,price:m.price,qty:1,suhu,note:"",mitraId:m.mitraId||null,hargaMitra:m.hargaMitra||null}];
    });
  };
  const chg=(key,d)=>setCart(p=>p.map(c=>c.cartKey===key?{...c,qty:c.qty+d}:c).filter(c=>c.qty>0));
  const reset=()=>{setStep("name");setName("");setCart([]);setCat("Semua");setSearch("");setShowSearch(false);setOpenSearch(false);setOpenQ("");};

  const quickMenus=useMemo(()=>{
    const freq={};orders.forEach(o=>o.items.forEach(i=>{freq[i.menuId]=(freq[i.menuId]||0)+i.qty;}));
    return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([id])=>menus.find(m=>String(m.id)===id)).filter(m=>m?.available);
  },[orders,menus]);

  const filtered=useMemo(()=>menus.filter(m=>{
    if(!m.available)return false;
    if(cat!=="Semua"&&m.category!==cat)return false;
    if(search&&!m.name.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  }),[menus,cat,search]);

  const [bayarModal,setBayarModal]=useState(false);
  const [uangDibayar,setUangDibayar]=useState("");
  const [successState,setSuccessState]=useState(null);
  const kembalian=uangDibayar&&parseInt(uangDibayar)>total?parseInt(uangDibayar)-total:null;

  const submit=now=>{
    if(now){setUangDibayar(String(total));setBayarModal(true);return;}
    const newOrder=normalizeOrder({id:genId("ORD"),customerName:name,status:"open",sessionDate:businessDate,sessionId:currentSessionId||null,createdAt:localISO(),paidAt:null,items:cart,total,kasirId:user.id,lastDeviceId:user.id});
    setOrders(p=>[...p,newOrder]);
    setSuccessState({type:"nanti",kembalian:0,order:newOrder,mode:"nanti"});
  };
  const konfirmasiBayar=()=>{
    if(!uangDibayar||parseInt(uangDibayar)<total)return;
    const kemb=parseInt(uangDibayar)-total;
    const newOrder=normalizeOrder({id:genId("ORD"),customerName:name,status:"paid",sessionDate:businessDate,sessionId:currentSessionId||null,createdAt:localISO(),paidAt:localISO(),items:cart,total,kasirId:user.id,lastDeviceId:user.id});
    setOrders(p=>[...p,newOrder]);
    setBayarModal(false);setUangDibayar("");
    setSuccessState({type:"lunas",kembalian:kemb,order:newOrder,mode:"lunas"});
  };

  const todayOrders=[...orders.filter(o=>orderSessionDate(o)===businessDate)].sort(compareOrdersNewestFirst);
  const todayPaid=todayOrders.filter(o=>o.status==="paid");
  const todayOpen=todayOrders.filter(o=>o.status==="open");

  if(successState)return <SuccessOverlay
    type={successState.type}
    kembalian={successState.kembalian}
    onPrint={successState.type!=="nanti"?()=>printStruk(successState.order,successState.kembalian,kasirs,receiptSettings,successState.mode||(successState.type==="parsial"?"parsial":"lunas")):undefined}
    onBack={()=>{setSuccessState(null);reset();}}
    backLabel="Kembali"
  />;

  if(step==="name")return(
    <div className="pos-name-screen" style={{flex:1,overflowY:"auto",padding:"18px 18px 12px",display:"flex",flexDirection:"column",gap:16}}>
      <div>
        <div className="fu">
          <p style={{color:"var(--muted)",fontSize:12,textTransform:"uppercase",letterSpacing:"0.05em",fontWeight:600}}>Pesanan Baru</p>
          <h2 className="sora" style={{fontSize:20,fontWeight:800,color:"var(--text)",marginTop:3}}>Nama Pelanggan</h2>
        </div>
        <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:12}}>
          <TxtInput label="Nama" value={name} onChange={setName} placeholder="Contoh: Budi, Sari..."/>
          <Btn onClick={()=>setStep("menu")} disabled={!name.trim()} full>Pilih Menu →</Btn>
        </div>
      </div>
      {todayOpen.length>0&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
            <p style={{fontSize:11,color:"var(--red)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em"}}>⏳ Belum Bayar ({todayOpen.length})</p>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <OpenSearchBtn active={openSearch} onClick={()=>{setOpenSearch(v=>{if(v){setOpenQ("");return false;}return true;});setTimeout(()=>openSearchRef.current?.focus(),60);}}/>
              <button onClick={()=>setScreen("tagihan")} style={{fontSize:12,color:"var(--amber)",fontWeight:600,background:"none",border:"none",cursor:"pointer"}}>Kelola →</button>
            </div>
          </div>
          {openSearch&&(
            <div style={{display:"flex",alignItems:"center",gap:8,background:"#fff",border:"1.5px solid rgba(245,158,11,0.35)",borderRadius:10,padding:"7px 12px",marginBottom:9,boxShadow:"0 2px 8px rgba(245,158,11,0.08)"}}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input ref={openSearchRef} value={openQ} onChange={e=>setOpenQ(e.target.value)} placeholder="Cari nama pelanggan..." style={{flex:1,fontSize:13,color:"var(--text)",background:"transparent",border:"none",outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
              {openQ&&<button onClick={()=>{setOpenQ("");openSearchRef.current?.focus();}} style={{background:"none",border:"none",cursor:"pointer",color:"#94A3B8",display:"flex",alignItems:"center",padding:0}}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>}
            </div>
          )}
          {(openSearch&&openQ?todayOpen.filter(o=>o.customerName?.toLowerCase().includes(openQ.toLowerCase())):todayOpen).map((o,i)=>(
            <div key={o.id} onClick={()=>setScreen("tagihan")} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:13,padding:"13px 15px",marginBottom:9,cursor:"pointer",boxShadow:"0 2px 8px rgba(15,23,42,0.05)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:22,height:22,borderRadius:6,background:"rgba(239,68,68,0.10)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"var(--red)",flexShrink:0}}>{i+1}</span>
                  <p style={{color:"var(--text)",fontWeight:700,fontSize:15,fontFamily:"'Sora',sans-serif"}}>{o.customerName}</p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                  <p className="sora" style={{color:"var(--red)",fontWeight:800,fontSize:14}}>{rupiah(o.total)}</p>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              </div>
              <div style={{height:1,background:"var(--bg2)",marginBottom:7}}/>
              {o.items.slice(0,3).map((item,idx)=>(<div key={idx} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"2.5px 0"}}><p style={{color:"var(--muted)",fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"80%",lineHeight:1.4}}>{item.name}{item.note?` · ${item.note}`:""}</p><span style={{color:"var(--text)",fontSize:12,fontWeight:700,flexShrink:0}}>×{item.qty}</span></div>))}
              {o.items.length>3&&<p style={{color:"var(--red)",fontSize:11,fontWeight:600,marginTop:3}}>··· +{o.items.length-3} item lainnya</p>}
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:9}}>
                <KasirChip kasirId={o.kasirId} kasirs={kasirs}/>
                <span style={{color:"var(--muted)",fontSize:11}}>Sesi {fmtShort(orderSessionDate(o)||businessDate)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {todayPaid.length>0&&(
        <div>
          <p style={{fontSize:11,color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:9}}>✅ Transaksi Sesi ({todayPaid.length})</p>
          {[...todayPaid].sort(compareOrdersNewestFirst).map((o,i)=>(
            <div key={o.id} onClick={()=>setDetailOrder(o)} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:13,padding:"13px 15px",marginBottom:9,cursor:"pointer",boxShadow:"0 2px 8px rgba(15,23,42,0.05)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:22,height:22,borderRadius:6,background:"var(--green-dim)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"var(--green)",flexShrink:0}}>{i+1}</span>
                  <p style={{color:"var(--text)",fontWeight:700,fontSize:15,fontFamily:"'Sora',sans-serif"}}>{o.customerName}</p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                  <p className="sora" style={{color:"var(--green)",fontWeight:800,fontSize:14}}>{rupiah(o.total)}</p>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              </div>
              <div style={{height:1,background:"var(--bg2)",marginBottom:7}}/>
              {o.items.slice(0,3).map((item,idx)=>(<div key={idx} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"2.5px 0"}}><p style={{color:"var(--muted)",fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"80%",lineHeight:1.4}}>{item.name}{item.note?` · ${item.note}`:""}</p><span style={{color:"var(--text)",fontSize:12,fontWeight:700,flexShrink:0}}>×{item.qty}</span></div>))}
              {o.items.length>3&&<p style={{color:"var(--green)",fontSize:11,fontWeight:600,marginTop:3}}>··· +{o.items.length-3} item lainnya</p>}
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:9}}>
                <KasirChip kasirId={o.kasirId} kasirs={kasirs}/>
                <PaymentMeta order={o}/>
              </div>
            </div>
          ))}
        </div>
      )}
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
          <button onClick={()=>{if(showSearch){setShowSearch(false);setSearch("");}else{setShowSearch(true);setTimeout(()=>searchRef.current?.focus(),50);}}} style={{width:36,height:36,borderRadius:11,background:showSearch?"var(--amber-dim)":"rgba(255,255,255,0.82)",border:`1px solid ${showSearch?"rgba(245,158,11,0.28)":"var(--border)"}`,display:"flex",alignItems:"center",justifyContent:"center",color:showSearch?"var(--amber)":"var(--muted)",boxShadow:"0 8px 18px rgba(15,23,42,0.05)"}}>
            <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </button>
          <Btn v="ghost" sm onClick={reset}>Batal</Btn>
        </div>
      </div>
      {showSearch&&(
        <div style={{display:"flex",alignItems:"center",gap:8,background:"var(--card2)",border:"1px solid var(--border)",borderRadius:11,padding:"7px 11px",marginBottom:7}}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari menu..." style={{flex:1,background:"none",border:"none",outline:"none",fontSize:14,color:"var(--text)",fontFamily:"'DM Sans',sans-serif"}}/>
          {(search||showSearch)&&<button onClick={()=>{setSearch("");setShowSearch(false);}} style={{color:"var(--muted)",fontSize:16,lineHeight:1}}>×</button>}
        </div>
      )}
      {!showSearch&&quickMenus.length>0&&(<div style={{marginBottom:7}}>
        <p style={{color:"var(--muted)",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>⚡ Quick Order</p>
        <div style={{display:"flex",gap:7,overflowX:"auto",scrollbarWidth:"none",paddingBottom:2}}>
          {quickMenus.map(m=>{const q=totalQtyOf(m.id);return(<div key={m.id} onClick={()=>openSheet(m)} style={{flexShrink:0,background:q>0?"rgba(245,166,35,0.1)":"var(--card2)",border:`1px solid ${q>0?"rgba(245,166,35,0.3)":"var(--border)"}`,borderRadius:10,padding:"7px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
            {q>0&&<span style={{background:"var(--amber)",color:"#fff",borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{q}</span>}
            <div><p style={{color:"var(--text)",fontWeight:600,fontSize:11,whiteSpace:"nowrap"}}>{m.name}</p><p style={{color:"var(--amber)",fontWeight:700,fontSize:10}}>{rupiah(m.price)}</p></div>
          </div>);})}
        </div>
      </div>)}
      {!showSearch&&<div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{flex:1,minWidth:0}}><CatBar cats={getCategoryOptions(menus)} active={cat} onChange={setCat}/></div>
        <div style={{display:"flex",background:"var(--card2)",border:"1px solid var(--border)",borderRadius:9,padding:2,gap:2,flexShrink:0}}>
          <button onClick={()=>setLayoutSave("grid")} style={{width:30,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",border:"none",background:layout==="grid"?"#fff":"transparent",color:layout==="grid"?"var(--amber)":"var(--muted)",boxShadow:layout==="grid"?"0 1px 4px rgba(0,0,0,0.10)":"none",transition:"all .15s"}}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
          <button onClick={()=>setLayoutSave("list")} style={{width:30,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",border:"none",background:layout==="list"?"#fff":"transparent",color:layout==="list"?"var(--amber)":"var(--muted)",boxShadow:layout==="list"?"0 1px 4px rgba(0,0,0,0.10)":"none",transition:"all .15s"}}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
        </div>
      </div>}
    </div>
    <div style={{flex:1,overflowY:"auto",padding:"8px 14px",alignContent:"start",paddingBottom:cart.length>0?"72px":"10px",...(layout==="grid"?{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10,gridAutoRows:"1fr"}:{display:"flex",flexDirection:"column",gap:7})}}>
      {filtered.length===0&&(<div style={{gridColumn:"1/-1",textAlign:"center",padding:32}}><p style={{color:"var(--muted)",fontSize:13}}>{search?`Menu "${search}" tidak ditemukan`:"Belum ada menu yang tampil di kategori ini"}</p></div>)}
      {filtered.map(m=>{
        const q=totalQtyOf(m.id);
        const hasSuhu=!m.mitraId&&m.suhu&&m.suhu!=="Tidak Ada";
        if(layout==="list")return(
          <div key={m.id} onClick={()=>openSheet(m)} style={{background:q>0?"rgba(245,166,35,0.06)":"var(--card)",border:`1.5px solid ${q>0?"rgba(245,166,35,0.35)":"var(--border)"}`,borderRadius:12,padding:"10px 13px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",boxShadow:"0 2px 8px rgba(15,23,42,0.04)"}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                <p style={{color:"var(--text)",fontWeight:700,fontSize:13}}>{m.name}</p>
                {hasSuhu&&<>{(m.suhu==="Keduanya"||m.suhu==="Ice")&&<span style={{fontSize:9,background:"var(--blue-dim)",color:"var(--blue)",padding:"1px 5px",borderRadius:99,fontWeight:700}}>🧊</span>}{(m.suhu==="Keduanya"||m.suhu==="Hot")&&<span style={{fontSize:9,background:"var(--red-dim)",color:"var(--red)",padding:"1px 5px",borderRadius:99,fontWeight:700}}>🔥</span>}</>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                <span style={{color:"var(--amber)",fontWeight:700,fontSize:12}}>{rupiah(m.price)}</span>
                {m.mitraId&&m.hargaMitra&&m.price>m.hargaMitra&&(<span style={{background:"var(--green-dim)",color:"var(--green)",fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:99}}>+{rupiah(m.price-m.hargaMitra)}</span>)}
                <span style={{color:"var(--muted)",fontSize:10}}>{m.category}</span>
              </div>
            </div>
            <button className={q>0?"menu-card-action active":"menu-card-action"} style={{width:"auto",padding:"7px 14px",margin:0,flexShrink:0}} onClick={e=>{e.stopPropagation();openSheet(m);}}>{q>0?`${q}×`:"+ Tambah"}</button>
          </div>
        );
        const isKeduanya=m.suhu==="Keduanya";
        const handleGridTap=()=>isKeduanya?openSheet(m):quickAdd(m);
        return(
          <div key={m.id} className={q>0?"menu-card active":"menu-card"} onClick={handleGridTap} style={{cursor:"pointer"}}>
            <div className="menu-card-head">
              <p style={{color:"var(--muted)",fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.04em"}}>{m.category}</p>
              <p className="menu-card-title">{m.name}</p>
              {hasSuhu&&(<div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{(m.suhu==="Keduanya"||m.suhu==="Ice")&&<span style={{fontSize:9,background:"var(--blue-dim)",color:"var(--blue)",padding:"2px 6px",borderRadius:99,fontWeight:700}}>🧊 Ice</span>}{(m.suhu==="Keduanya"||m.suhu==="Hot")&&<span style={{fontSize:9,background:"var(--red-dim)",color:"var(--red)",padding:"2px 6px",borderRadius:99,fontWeight:700}}>🔥 Hot</span>}</div>)}
            </div>
            <div className="menu-card-price-row">
              <p style={{color:"var(--amber)",fontWeight:800,fontSize:13}}>{rupiah(m.price)}</p>
              {m.mitraId&&m.hargaMitra&&m.price>m.hargaMitra&&(<span style={{background:"var(--green-dim)",color:"var(--green)",fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:99}}>+{rupiah(m.price-m.hargaMitra)}</span>)}
            </div>
            <div className={q>0?"menu-card-action active":"menu-card-action"} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,borderRadius:10,marginTop:4,padding:"8px 10px",fontSize:12,fontWeight:700,border:`1.5px solid ${q>0?"rgba(245,166,35,0.5)":"rgba(245,166,35,0.2)"}`,background:q>0?"var(--amber)":"var(--amber-dim)",color:q>0?"#fff":"var(--amber)"}}>
              {q>0&&<span style={{background:q>0?"rgba(255,255,255,0.25)":"rgba(245,158,11,0.15)",borderRadius:6,minWidth:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,padding:"0 4px"}}>{q}×</span>}
              <span>{isKeduanya?"Pilih Suhu":q>0?"Tambah":"+ Tambah"}</span>
            </div>
          </div>
        );
      })}
    </div>
    {cart.length>0&&(
      <div onClick={()=>setStep("confirm")} style={{margin:"0 14px 10px",background:"var(--amber)",borderRadius:13,padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",flexShrink:0,boxShadow:"0 6px 24px rgba(245,166,35,0.28)"}}>
        <div style={{background:"rgba(0,0,0,0.15)",borderRadius:8,padding:"4px 12px"}}><span style={{color:"#fff",fontWeight:700,fontSize:13}}>{cart.reduce((s,c)=>s+c.qty,0)} item</span></div>
        <span style={{color:"#fff",fontWeight:700,fontSize:14}}>Konfirmasi →</span>
        <span className="sora" style={{color:"#fff",fontWeight:800,fontSize:14}}>{rupiah(total)}</span>
      </div>
    )}
    {sheet&&(<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={()=>setSheet(null)}>
      <div className="fu" style={{background:"var(--bg2)",borderRadius:"20px 20px 0 0",padding:"20px 20px 28px",width:"100%",display:"flex",flexDirection:"column",gap:14,maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <p style={{color:"var(--muted)",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Tambah ke pesanan</p>
            <p className="sora" style={{color:"var(--text)",fontWeight:700,fontSize:16,marginTop:2}}>{sheet.name}</p>
          </div>
          <p className="sora" style={{color:"var(--amber)",fontWeight:800,fontSize:16}}>{rupiah(sheet.price)}</p>
        </div>
        {!sheet.mitraId&&sheet.suhu&&sheet.suhu!=="Tidak Ada"?(
          <div>
            <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:9}}>Suhu</p>
            <div style={{display:"flex",gap:9}}>
              {(sheet.suhu==="Keduanya"?["Ice","Hot"]:sheet.suhu==="Ice"?["Ice"]:["Hot"]).map(s=>{
                const m=sheet;
                const displayName=`${m.name} (${s})`;
                const countSuhu=cart.filter(c=>c.menuId===m.id&&c.suhu===s).reduce((sum,c)=>sum+(Number(c.qty)||0),0);
                const isIce=s==="Ice";const clr=isIce?"var(--blue)":"var(--red)";const bgDim=isIce?"var(--blue-dim)":"var(--red-dim)";const brd=isIce?"rgba(59,130,246,0.4)":"rgba(239,68,68,0.4)";
                const addOne=()=>{setCart(p=>{const note=sheetNote.trim();const k=cartKey(m.id,s,note,m.price,displayName);const e=p.find(c=>c.cartKey===k);if(e)return p.map(c=>c.cartKey===k?{...c,qty:c.qty+1}:c);return [...p,{cartKey:k,menuId:m.id,name:displayName,price:m.price,qty:1,suhu:s,note,mitraId:m.mitraId||null,hargaMitra:m.hargaMitra||null}];});};
                const removeOne=()=>{setCart(p=>{const items=[...p].filter(c=>c.menuId===m.id&&c.suhu===s);if(!items.length)return p;const last=items[items.length-1];return p.map(c=>c.cartKey===last.cartKey?{...c,qty:c.qty-1}:c).filter(c=>c.qty>0);});};
                return(
                  <div key={s} style={{flex:1,display:"flex",alignItems:"center",gap:6,background:bgDim,borderRadius:11,padding:"10px 10px",border:`1px solid ${brd}`}}>
                    <button onClick={removeOne} style={{width:28,height:28,borderRadius:7,background:"rgba(0,0,0,0.08)",border:"none",fontSize:18,fontWeight:800,color:clr,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>−</button>
                    <span style={{flex:1,textAlign:"center",fontWeight:700,fontSize:13,color:clr}}>{isIce?"🧊 Ice":"🔥 Hot"}</span>
                    <button onClick={addOne} style={{width:28,height:28,borderRadius:7,background:"rgba(0,0,0,0.08)",border:"none",fontSize:18,fontWeight:800,color:clr,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>+</button>
                    <span style={{fontWeight:800,fontSize:16,color:clr,minWidth:18,textAlign:"center"}}>{countSuhu}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ):null}
        <div>
          <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Catatan (opsional)</p>
          <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:11,overflow:"hidden"}}>
            <textarea value={sheetNote} onChange={e=>setSheetNote(e.target.value)} placeholder="Misal: less sugar, extra pedas..." rows={2} style={{width:"100%",padding:"11px 14px",background:"none",border:"none",outline:"none",resize:"none",fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"var(--text)",boxSizing:"border-box"}}/>
          </div>
        </div>
        {(!sheet.mitraId&&sheet.suhu&&sheet.suhu!=="Tidak Ada")
          ? <Btn onClick={()=>setSheet(null)} full>Selesai</Btn>
          : <Btn onClick={addFromSheet} full>Tambah ke Pesanan</Btn>
        }
      </div>
    </div>)}
  </div>);

  // step === "confirm"
  return(<div className="pos-confirm-screen" style={{flex:1,overflowY:"auto",padding:"18px",display:"flex",flexDirection:"column",gap:13}}>
    <div className="fu"><p style={{color:"var(--muted)",fontSize:12}}>Konfirmasi pesanan</p>
      <h2 className="sora" style={{fontSize:20,fontWeight:800,color:"var(--amber)"}}>{name}</h2></div>
    <Card className="fu s1">{cart.map((item,i)=>(
      <div key={item.cartKey} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:i<cart.length-1?"1px solid var(--border)":"none"}}>
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
      <div className="fu" style={{background:"var(--bg2)",borderRadius:"20px 20px 0 0",padding:"22px 20px 28px",width:"100%",display:"flex",flexDirection:"column",gap:14,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <h3 className="sora" style={{fontWeight:700,color:"var(--text)",fontSize:16}}>💳 Pembayaran — {name}</h3>
        <div style={{background:"var(--card)",borderRadius:12,padding:"13px 15px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:"var(--muted)",fontSize:13}}>Total Tagihan</span>
          <span className="sora" style={{fontWeight:800,color:"var(--amber)",fontSize:18}}>{rupiah(total)}</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <label style={{fontSize:11,color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>UANG DITERIMA</label>
          <div style={{display:"flex",alignItems:"center",background:"rgba(255,255,255,0.88)",border:"1px solid var(--border)",borderRadius:14,overflow:"hidden"}}>
            <span style={{padding:"0 6px 0 14px",color:"var(--muted)",fontSize:14,flexShrink:0,fontWeight:600}}>Rp</span>
            <input type="text" inputMode="numeric" value={uangDibayar?Number(uangDibayar).toLocaleString("id-ID"):""} onChange={e=>{const raw=e.target.value.replace(/\D/g,"");setUangDibayar(raw);}} placeholder="0" style={{paddingLeft:"4px"}}/>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:2}}>
            {total>0&&<button type="button" onClick={()=>setUangDibayar(String(total))} style={{padding:"5px 11px",borderRadius:8,background:"var(--green-dim)",color:"var(--green)",border:"1px solid rgba(16,185,129,0.3)",fontSize:12,fontWeight:700,flexShrink:0,cursor:"pointer"}}>✓ Uang Pas</button>}
            {[15000,20000,50000,100000].map(a=><button type="button" key={a} onClick={()=>setUangDibayar(String(a))} style={{padding:"5px 10px",borderRadius:8,background:"var(--card2)",color:"var(--muted)",border:"1px solid var(--border)",fontSize:12,fontWeight:600,flexShrink:0,cursor:"pointer"}}>{a/1000}rb</button>)}
          </div>
        </div>
        {uangDibayar&&parseInt(uangDibayar)<total&&(<p style={{color:"var(--red)",fontSize:13,fontWeight:600,textAlign:"center"}}>⚠ Kurang {rupiah(total-parseInt(uangDibayar))}</p>)}
        {kembalian!==null&&(<div style={{background:"var(--green-dim)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:12,padding:"13px 15px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{color:"var(--green)",fontWeight:600,fontSize:13}}>✓ Kembalian</span><span className="sora" style={{fontWeight:800,color:"var(--green)",fontSize:20}}>{rupiah(kembalian)}</span></div>)}
        <Btn v="success" onClick={konfirmasiBayar} disabled={!uangDibayar||parseInt(uangDibayar)<total} full>✓ Konfirmasi Lunas</Btn>
        <Btn v="ghost" onClick={()=>{setBayarModal(false);setUangDibayar("");}} full>Batal</Btn>
      </div>
    </div>)}
  </div>);
});

export default POSScreen;
