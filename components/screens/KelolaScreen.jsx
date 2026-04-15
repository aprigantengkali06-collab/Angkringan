"use client";
// KelolaScreen.jsx
// Exports: TimScreen, MenuMgmtScreen, DataToolsScreen
// Semua ini dipanggil sebagai overlay dari AngkringanApp.jsx
import { memo, useState, useRef, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import {
  rupiah, genId, getCategoryOptions, fmtShort
} from "../lib/helpers.js";
import {
  DEFAULT_OWNER_PASSWORD, KASIR_COLORS, KASIR_COLORS_DIM,
  MITRA_COLORS, MITRA_COLORS_DIM, DEFAULT_MENU_CATS
} from "../lib/constants.js";
import { normalizeReceiptSettings, DEFAULT_RECEIPT_SETTINGS } from "../lib/printer.js";
import Card from "../ui/Card.jsx";
import Btn from "../ui/Btn.jsx";
import TxtInput from "../ui/TxtInput.jsx";
import Hdr from "../layout/Hdr.jsx";
import PrinterToolsCard from "../overlays/PrinterToolsCard.jsx";

// ── Tim ──
export const TimScreen = ({kasirs,setKasirs,mitras,setMitras,ownerPassword,setOwnerPassword,onClose}) => {
  const [tab,setTab]=useState("kasir");
  const [kName,setKName]=useState(""); const [kPw,setKPw]=useState(""); const [kOk,setKOk]=useState(false);
  const addKasir=()=>{if(!kName||!kPw)return;setKasirs(p=>[...p,{id:genId("k"),name:kName,password:kPw}]);setKName("");setKPw("");setKOk(true);setTimeout(()=>setKOk(false),2000);};
  const [mName,setMName]=useState(""); const [mPemilik,setMPemilik]=useState(""); const [mOk,setMOk]=useState(false);
  const addMitra=()=>{if(!mName)return;setMitras(p=>[...p,{id:genId("mtr"),name:mName,pemilik:mPemilik}]);setMName("");setMPemilik("");setMOk(true);setTimeout(()=>setMOk(false),2000);};
  const [ownerCurrentPw,setOwnerCurrentPw]=useState("");
  const [ownerNewPw,setOwnerNewPw]=useState("");
  const [ownerConfirmPw,setOwnerConfirmPw]=useState("");
  const [ownerPwMsg,setOwnerPwMsg]=useState("");
  const [resetPw,setResetPw]=useState({});
  const [resetMsg,setResetMsg]=useState({});

  const saveOwnerPassword=()=>{
    if(ownerCurrentPw!==(ownerPassword||DEFAULT_OWNER_PASSWORD)){setOwnerPwMsg("Password owner saat ini salah.");setTimeout(()=>setOwnerPwMsg(""),2200);return;}
    if(!ownerNewPw||ownerNewPw.length<4){setOwnerPwMsg("Password owner baru minimal 4 karakter.");setTimeout(()=>setOwnerPwMsg(""),2200);return;}
    if(ownerNewPw!==ownerConfirmPw){setOwnerPwMsg("Konfirmasi password owner belum cocok.");setTimeout(()=>setOwnerPwMsg(""),2200);return;}
    setOwnerPassword(ownerNewPw);setOwnerCurrentPw("");setOwnerNewPw("");setOwnerConfirmPw("");
    setOwnerPwMsg("✓ Password owner berhasil diperbarui.");setTimeout(()=>setOwnerPwMsg(""),2200);
  };
  const resetKasirPassword=(kasirId)=>{
    const nextPw=(resetPw[kasirId]||"").trim();
    if(!nextPw||nextPw.length<4){setResetMsg(prev=>({...prev,[kasirId]:"Minimal 4 karakter."}));setTimeout(()=>setResetMsg(prev=>({...prev,[kasirId]:""})),2200);return;}
    setKasirs(prev=>prev.map(k=>k.id===kasirId?{...k,password:nextPw}:k));
    setResetPw(prev=>({...prev,[kasirId]:""}));
    setResetMsg(prev=>({...prev,[kasirId]:"✓ Password kasir diperbarui."}));
    setTimeout(()=>setResetMsg(prev=>({...prev,[kasirId]:""})),2200);
  };

  return(<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
    <Hdr title="Manajemen Tim" sub="Kasir, Mitra & Akses" right={<button onClick={onClose} style={{color:"var(--amber)",display:"flex"}}><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5 M12 19l-7-7 7-7"/></svg></button>}/>
    <div style={{display:"flex",padding:"10px 18px 0",gap:8,borderBottom:"1px solid var(--border)",flexShrink:0,overflowX:"auto"}}>
      {[{k:"kasir",label:`Kasir (${kasirs.length})`},{k:"mitra",label:`Mitra (${mitras.length})`},{k:"akses",label:"Akses"}].map(t=>(
        <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:"8px 16px",borderRadius:"10px 10px 0 0",fontWeight:700,fontSize:13,background:tab===t.k?"var(--card)":"transparent",color:tab===t.k?"var(--amber)":"var(--muted)",border:tab===t.k?"1px solid var(--border)":"1px solid transparent",borderBottom:tab===t.k?"1px solid var(--card)":"none",marginBottom:tab===t.k?-1:0,whiteSpace:"nowrap"}}>{t.label}</button>
      ))}
    </div>
    <div style={{flex:1,overflowY:"auto",padding:"17px",display:"flex",flexDirection:"column",gap:13}}>
      {tab==="kasir"?(<>
        {kasirs.map((k,i)=>(<Card key={k.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:KASIR_COLORS_DIM[i%4],display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:KASIR_COLORS[i%4],fontWeight:800,fontSize:14}}>{k.name[0]}</span></div>
            <div><p style={{color:"var(--text)",fontWeight:700}}>{k.name}</p><p style={{color:"var(--muted)",fontSize:12,marginTop:1}}>Akses kasir aktif</p></div>
          </div>
          {kasirs.length>1&&(<button onClick={()=>{supabase.from("kasirs").delete().eq("id",k.id).then();setKasirs(p=>p.filter(x=>x.id!==k.id));}} style={{width:32,height:32,borderRadius:8,background:"var(--red-dim)",border:"1px solid rgba(224,82,82,0.2)",color:"var(--red)",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18 M8 6V4h8v2 M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg></button>)}
        </Card>))}
        <Card style={{display:"flex",flexDirection:"column",gap:12}}>
          <h3 style={{color:"var(--text)",fontWeight:700,fontSize:15}}>Tambah Kasir</h3>
          <TxtInput label="Nama Kasir" value={kName} onChange={setKName} placeholder="Nama kasir baru"/>
          <TxtInput label="Password" type="text" value={kPw} onChange={setKPw} placeholder="Buat password login"/>
          {kOk&&<p className="fi" style={{color:"var(--green)",fontSize:13,textAlign:"center"}}>✓ Kasir berhasil ditambahkan!</p>}
          <Btn onClick={addKasir} disabled={!kName||!kPw} full>Tambah Kasir</Btn>
        </Card>
      </>):tab==="mitra"?(<>
        {mitras.length===0&&(<div style={{background:"var(--card)",border:"1px dashed var(--border)",borderRadius:12,padding:20,textAlign:"center"}}><p style={{fontSize:24,marginBottom:8}}>🤝</p><p style={{color:"var(--muted)",fontSize:13}}>Belum ada mitra. Tambah warung mitra di bawah.</p></div>)}
        {mitras.map((m,i)=>(<Card key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:MITRA_COLORS_DIM[i%4],display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:MITRA_COLORS[i%4],fontWeight:800,fontSize:14}}>{m.name[0]}</span></div>
            <div><p style={{color:"var(--text)",fontWeight:700}}>{m.name}</p>{m.pemilik&&<p style={{color:"var(--muted)",fontSize:12,marginTop:1}}>{m.pemilik}</p>}</div>
          </div>
          <button onClick={()=>{supabase.from("mitras").delete().eq("id",m.id).then();setMitras(p=>p.filter(x=>x.id!==m.id));}} style={{width:32,height:32,borderRadius:8,background:"var(--red-dim)",border:"1px solid rgba(224,82,82,0.2)",color:"var(--red)",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18 M8 6V4h8v2 M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg></button>
        </Card>))}
        <Card style={{display:"flex",flexDirection:"column",gap:12}}>
          <h3 style={{color:"var(--text)",fontWeight:700,fontSize:15}}>🤝 Tambah Mitra</h3>
          <TxtInput label="Nama Warung/Mitra" value={mName} onChange={setMName} placeholder="Contoh: Bakso Bakar Pak Budi"/>
          <TxtInput label="Nama Pemilik (opsional)" value={mPemilik} onChange={setMPemilik} placeholder="Contoh: Pak Budi"/>
          {mOk&&<p className="fi" style={{color:"var(--green)",fontSize:13,textAlign:"center"}}>✓ Mitra berhasil ditambahkan!</p>}
          <Btn onClick={addMitra} disabled={!mName} full>Tambah Mitra</Btn>
        </Card>
      </>):(<>
        {ownerPassword===DEFAULT_OWNER_PASSWORD&&(<div style={{background:"var(--amber-dim)",border:"1px solid rgba(245,166,35,0.25)",borderRadius:12,padding:"12px 14px"}}><p style={{color:"var(--amber)",fontWeight:700,fontSize:13}}>Keamanan: password owner masih default</p><p style={{color:"var(--muted)",fontSize:12,marginTop:4,lineHeight:1.5}}>Segera ganti password owner agar akses tidak mudah ditebak.</p></div>)}
        <Card style={{display:"flex",flexDirection:"column",gap:12}}>
          <div><p style={{color:"var(--text)",fontWeight:700,fontSize:15}}>Password Owner</p><p style={{color:"var(--muted)",fontSize:12,marginTop:4,lineHeight:1.5}}>Gunakan menu ini untuk mengganti password login owner. Setelah disimpan, login owner memakai password baru.</p></div>
          <TxtInput label="Password Owner Saat Ini" type="password" value={ownerCurrentPw} onChange={setOwnerCurrentPw} placeholder="Masukkan password saat ini"/>
          <TxtInput label="Password Owner Baru" type="password" value={ownerNewPw} onChange={setOwnerNewPw} placeholder="Minimal 4 karakter"/>
          <TxtInput label="Konfirmasi Password Owner Baru" type="password" value={ownerConfirmPw} onChange={setOwnerConfirmPw} placeholder="Ulangi password baru"/>
          {ownerPwMsg&&<p className="fi" style={{color:ownerPwMsg.startsWith("✓")?"var(--green)":"var(--red)",fontSize:13,textAlign:"center"}}>{ownerPwMsg}</p>}
          <Btn onClick={saveOwnerPassword} disabled={!ownerCurrentPw||!ownerNewPw||!ownerConfirmPw} full>Simpan Password Owner</Btn>
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <p style={{fontSize:11,color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>Reset Password Kasir</p>
          {kasirs.length===0?(<Card style={{textAlign:"center",padding:18}}><p style={{color:"var(--muted)",fontSize:13}}>Belum ada kasir untuk diatur password-nya.</p></Card>)
          :kasirs.map((k,i)=>(
            <Card key={k.id} style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:38,height:38,borderRadius:12,background:KASIR_COLORS_DIM[i%4],display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:KASIR_COLORS[i%4],fontWeight:800,fontSize:14}}>{k.name[0]}</span></div>
                <div><p style={{color:"var(--text)",fontWeight:700}}>{k.name}</p><p style={{color:"var(--muted)",fontSize:12}}>Reset password login kasir</p></div>
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

// ── MenuMgmt ──
export const MenuMgmtScreen = memo(({menus,setMenus,mitras,onClose}) => {
  const [show,setShow]=useState(false);const[eid,setEid]=useState(null);
  const [showAddCat,setShowAddCat]=useState(false);
  const [newCatInput,setNewCatInput]=useState("");
  const [editCat,setEditCat]=useState(null);
  const [extraCats,setExtraCats]=useState(()=>{try{const s=localStorage.getItem("extraMenuCats");return s?JSON.parse(s):[];}catch{return [];}});
  const allCats=useMemo(()=>{
    const fromMenus=Array.from(new Set((menus||[]).map(m=>String(m?.category||"").trim()).filter(Boolean)));
    const merged=Array.from(new Set([...fromMenus,...extraCats,...DEFAULT_MENU_CATS]));
    return merged;
  },[menus,extraCats]);
  const addCategory=()=>{
    const v=newCatInput.trim();if(!v)return;
    if(!allCats.includes(v)){const next=[...extraCats,v];setExtraCats(next);localStorage.setItem("extraMenuCats",JSON.stringify(next));}
    setForm(p=>({...p,category:v}));setNewCatInput("");setShowAddCat(false);
  };
  const renameCategory=(oldName,newName)=>{
    const v=newName.trim();if(!v||v===oldName){setEditCat(null);return;}
    const updatedMenus=menus.map(m=>m.category===oldName?{...m,category:v}:m);
    updatedMenus.filter(m=>m.category===v&&menus.find(om=>om.id===m.id)?.category===oldName).forEach(m=>supabase.from("menus").update({category:v}).eq("id",m.id).then());
    setMenus(updatedMenus);
    const nextExtra=extraCats.map(c=>c===oldName?v:c);setExtraCats(nextExtra);localStorage.setItem("extraMenuCats",JSON.stringify(nextExtra));
    if(form.category===oldName)setForm(p=>({...p,category:v}));
    if(cat===oldName)setCat(v);setEditCat(null);
  };
  const deleteCategory=(name)=>{
    const hasMenus=menus.some(m=>m.category===name);
    if(hasMenus){window.__angkringanAlert?.(`Kategori "${name}" masih dipakai oleh ${menus.filter(m=>m.category===name).length} menu. Pindahkan atau hapus menu tersebut dulu.`,"warning");return;}
    const nextExtra=extraCats.filter(c=>c!==name);setExtraCats(nextExtra);localStorage.setItem("extraMenuCats",JSON.stringify(nextExtra));
    if(form.category===name)setForm(p=>({...p,category:allCats.find(c=>c!==name)||""}));
    if(cat===name)setCat("Semua");
  };
  const [layoutMenu,setLayoutMenu]=useState(()=>{try{return localStorage.getItem("menuMgmtLayout")||"list";}catch{return "list";}});
  const setLayoutSaveMenu=v=>{setLayoutMenu(v);try{localStorage.setItem("menuMgmtLayout",v);}catch{}};
  const [form,setForm]=useState({name:"",price:"",category:getCategoryOptions(menus,false)[0]||"Kopi",available:true,mitraId:null,hargaMitra:"",suhu:"Tidak Ada"});
  const [cat,setCat]=useState("Semua");
  const [saving,setSaving]=useState(false);
  const open=(m=null)=>{
    if(m){setEid(m.id);setForm({name:m.name,price:String(m.price),category:m.category,available:m.available,mitraId:m.mitraId||null,hargaMitra:m.hargaMitra?String(m.hargaMitra):"",suhu:m.suhu||"Tidak Ada"});}
    else{setEid(null);setForm({name:"",price:"",category:allCats[0]||"Kopi",available:true,mitraId:null,hargaMitra:"",suhu:"Tidak Ada"});}
    setShow(true);
  };
  const showAlert = (msg, type) => {if(typeof window.__angkringanAlert==="function")window.__angkringanAlert(msg,type);};
  const save=async()=>{
    if(!form.name||!form.price)return;setSaving(true);
    const row={name:form.name.trim().toUpperCase(),price:parseInt(form.price),category:form.category,available:form.available,mitra_id:form.mitraId||null,harga_mitra:form.mitraId&&form.hargaMitra?parseInt(form.hargaMitra):null,suhu:form.mitraId?null:form.suhu};
    try{
      if(eid){
        const{error}=await supabase.from("menus").upsert({id:eid,...row});
        if(error){showAlert("Gagal edit: "+error.message,"error");return;}
        const menuData={name:row.name,price:row.price,category:row.category,available:row.available,mitraId:form.mitraId||null,hargaMitra:form.mitraId&&form.hargaMitra?parseInt(form.hargaMitra):null,suhu:row.suhu};
        setMenus(p=>p.map(m=>m.id===eid?{...m,...menuData}:m));
      }else{
        const{data,error}=await supabase.from("menus").insert(row).select().single();
        if(error){showAlert("Gagal simpan: "+error.message,"error");return;}
        const menuData={name:data.name,price:data.price,category:data.category,available:data.available,mitraId:data.mitra_id||null,hargaMitra:data.harga_mitra||null,suhu:data.suhu||null};
        setMenus(p=>[...p,{id:data.id,...menuData}]);
      }
      setShow(false);
    }catch(err){showAlert("Terjadi kesalahan: "+err.message,"error");}finally{setSaving(false);}
  };
  const filtered=menus.filter(m=>cat==="Semua"||m.category===cat);
  const getMitra=(id)=>mitras.find(m=>m.id===id);

  return(<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative"}}>
    <Hdr title="Manajemen Menu" sub={`${menus.length} menu`}
      right={<div style={{display:"flex",gap:8}}><Btn sm onClick={()=>open()}>+ Tambah</Btn>
        <button onClick={onClose} style={{color:"var(--amber)",display:"flex"}}><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5 M12 19l-7-7 7-7"/></svg></button></div>}/>
    <div style={{padding:"9px 18px",borderBottom:"1px solid var(--border)",flexShrink:0,display:"flex",alignItems:"center",gap:8}}>
      <div style={{flex:1,minWidth:0,display:"flex",gap:6,overflowX:"auto",paddingBottom:6,scrollbarWidth:"none"}}>
        {["Semua",...Array.from(new Set(menus.map(m=>m.category).filter(Boolean)))].map(c=>(
          <button key={c} onClick={()=>setCat(c)} style={{padding:"6px 16px",borderRadius:99,fontSize:13,fontWeight:600,whiteSpace:"nowrap",background:cat===c?"var(--text)":"rgba(255,255,255,0.85)",color:cat===c?"#fff":"var(--muted)",border:cat===c?"none":"1px solid var(--border)",boxShadow:cat===c?"0 2px 8px rgba(15,23,42,0.15)":"none"}}>{c}</button>
        ))}
      </div>
      <div style={{display:"flex",background:"var(--card2)",border:"1px solid var(--border)",borderRadius:9,padding:2,gap:2,flexShrink:0}}>
        <button onClick={()=>setLayoutSaveMenu("grid")} style={{width:30,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",border:"none",background:layoutMenu==="grid"?"#fff":"transparent",color:layoutMenu==="grid"?"var(--amber)":"var(--muted)",boxShadow:layoutMenu==="grid"?"0 1px 4px rgba(0,0,0,0.10)":"none",transition:"all .15s"}}><svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg></button>
        <button onClick={()=>setLayoutSaveMenu("list")} style={{width:30,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",border:"none",background:layoutMenu==="list"?"#fff":"transparent",color:layoutMenu==="list"?"var(--amber)":"var(--muted)",boxShadow:layoutMenu==="list"?"0 1px 4px rgba(0,0,0,0.10)":"none",transition:"all .15s"}}><svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></button>
      </div>
    </div>
    <div style={{flex:1,overflowY:"auto",padding:"11px 18px",...(layoutMenu==="grid"?{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10,gridAutoRows:"1fr",alignContent:"start"}:{display:"flex",flexDirection:"column",gap:8})}}>
      {filtered.map((m,mi)=>{
        const mitra=m.mitraId?getMitra(m.mitraId):null;
        const mitraIdx=mitra?mitras.findIndex(x=>x.id===mitra.id):0;
        const actionBtns=(
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            {[{act:()=>setMenus(p=>p.map(x=>x.id===m.id?{...x,available:!x.available}:x)),bg:m.available?"var(--green-dim)":"var(--card2)",col:m.available?"var(--green)":"var(--muted)",icon:m.available?"M20 6L9 17l-5-5":"M18 6L6 18 M6 6l12 12"},
              {act:()=>open(m),bg:"var(--amber-dim)",col:"var(--amber)",icon:"M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"},
              {act:()=>{supabase.from("menus").delete().eq("id",m.id).then();setMenus(p=>p.filter(x=>x.id!==m.id));},bg:"var(--red-dim)",col:"var(--red)",icon:"M3 6h18 M8 6V4h8v2 M19 6l-1 14"},
            ].map((b,j)=>(<button key={j} onClick={b.act} style={{width:30,height:30,borderRadius:8,background:b.bg,border:`1px solid ${b.col}33`,color:b.col,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={b.icon}/></svg></button>))}
          </div>
        );
        if(layoutMenu==="grid") return(
          <div key={m.id} className="menu-card" style={{opacity:m.available?1:0.55,border:`1.5px solid ${mitra?"rgba(124,58,237,0.2)":"var(--border)"}`}}>
            <div className="menu-card-head">
              <p style={{color:"var(--muted)",fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.04em"}}>{m.category}</p>
              <p className="menu-card-title">{m.name}</p>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:2}}>
                {!m.available&&<span style={{background:"rgba(122,106,86,0.15)",color:"var(--muted)",fontSize:9,fontWeight:600,padding:"1px 5px",borderRadius:99}}>Habis</span>}
                {mitra?<span style={{background:MITRA_COLORS_DIM[mitraIdx%4],color:MITRA_COLORS[mitraIdx%4],fontSize:9,fontWeight:600,padding:"1px 5px",borderRadius:99}}>🤝 {mitra.name}</span>:<span style={{background:"var(--blue-dim)",color:"var(--blue)",fontSize:9,fontWeight:600,padding:"1px 5px",borderRadius:99}}>Milik Saya</span>}
              </div>
            </div>
            <div>
              <div className="menu-card-price-row" style={{marginBottom:6}}>
                <p style={{color:"var(--amber)",fontWeight:800,fontSize:12}}>{rupiah(m.price)}</p>
                {mitra&&m.hargaMitra&&<span style={{color:"var(--green)",fontSize:9,fontWeight:700}}>+{rupiah(m.price-m.hargaMitra)}</span>}
              </div>
              {actionBtns}
            </div>
          </div>
        );
        return(<div key={m.id} style={{background:"var(--card)",border:`1px solid ${mitra?"rgba(124,58,237,0.2)":"var(--border)"}`,borderRadius:12,padding:"11px 13px",display:"flex",justifyContent:"space-between",alignItems:"center",opacity:m.available?1:0.5}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
              <p style={{color:"var(--text)",fontWeight:600,fontSize:14,textTransform:"uppercase"}}>{m.name}</p>
              {!m.available&&<span style={{background:"rgba(122,106,86,0.15)",color:"var(--muted)",fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:99}}>Habis</span>}
            </div>
            <div style={{display:"flex",gap:7,marginTop:3,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{background:"var(--amber-dim)",color:"var(--amber)",fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:99}}>{m.category}</span>
              {mitra?<span style={{background:MITRA_COLORS_DIM[mitraIdx%4],color:MITRA_COLORS[mitraIdx%4],fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:99}}>🤝 {mitra.name}</span>:<span style={{background:"var(--blue-dim)",color:"var(--blue)",fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:99}}>Milik Saya</span>}
            </div>
            <div style={{display:"flex",gap:8,marginTop:3,alignItems:"baseline"}}>
              <p style={{color:"var(--amber)",fontWeight:700,fontSize:13}}>{rupiah(m.price)}</p>
              {mitra&&m.hargaMitra&&(<p style={{color:"var(--muted)",fontSize:11}}>modal <span style={{color:"var(--red)",fontWeight:600}}>{rupiah(m.hargaMitra)}</span>{" · "}untung <span style={{color:"var(--green)",fontWeight:600}}>{rupiah(m.price-m.hargaMitra)}</span></p>)}
            </div>
          </div>
          <div style={{marginLeft:8}}>{actionBtns}</div>
        </div>);
      })}
    </div>
    {show&&(<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.75)",zIndex:200,display:"flex",alignItems:"flex-end"}} onClick={()=>setShow(false)}>
      <div className="fu" style={{background:"var(--bg2)",borderRadius:"20px 20px 0 0",padding:"20px 20px 34px",width:"100%",display:"flex",flexDirection:"column",gap:13,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <h3 className="sora" style={{fontWeight:700,color:"var(--text)",fontSize:16}}>{eid?"Edit":"Tambah"} Menu</h3>
        <TxtInput label="Nama Menu" value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} placeholder="Nama minuman"/>
        <TxtInput label="Harga Jual" moneyFormat value={form.price} onChange={v=>setForm(p=>({...p,price:v}))} placeholder="8.000" prefix="Rp"/>
        <div>
          <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Kepemilikan Menu</p>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setForm(p=>({...p,mitraId:null,hargaMitra:""}))} style={{flex:1,padding:"10px",borderRadius:9,background:!form.mitraId?"var(--blue-dim)":"var(--card2)",color:!form.mitraId?"var(--blue)":"var(--muted)",border:`1px solid ${!form.mitraId?"rgba(59,130,246,0.35)":"var(--border)"}`,fontSize:12,fontWeight:600}}>☕ Milik Saya</button>
            {mitras.length>0&&<button onClick={()=>setForm(p=>({...p,mitraId:p.mitraId||mitras[0].id}))} style={{flex:1,padding:"10px",borderRadius:9,background:form.mitraId?"var(--purple-dim)":"var(--card2)",color:form.mitraId?"var(--purple)":"var(--muted)",border:`1px solid ${form.mitraId?"rgba(124,58,237,0.35)":"var(--border)"}`,fontSize:12,fontWeight:600}}>🤝 Menu Mitra</button>}
            {mitras.length===0&&<div style={{flex:1,padding:"10px",borderRadius:9,background:"var(--card2)",border:"1px solid var(--border)",fontSize:11,color:"var(--muted)",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center"}}>Belum ada mitra</div>}
          </div>
        </div>
        {form.mitraId&&mitras.length>0&&(
          <div className="fi">
            <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Pilih Mitra</p>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {mitras.map((m,i)=>(
                <button key={m.id} onClick={()=>setForm(p=>({...p,mitraId:m.id}))} style={{padding:"10px 13px",borderRadius:9,background:form.mitraId===m.id?MITRA_COLORS_DIM[i%4]:"var(--card2)",color:form.mitraId===m.id?MITRA_COLORS[i%4]:"var(--muted)",border:`1px solid ${form.mitraId===m.id?MITRA_COLORS[i%4]+"55":"var(--border)"}`,fontSize:13,fontWeight:600,textAlign:"left",display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:28,height:28,borderRadius:7,background:form.mitraId===m.id?MITRA_COLORS[i%4]:"var(--border)",color:form.mitraId===m.id?"#fff":"var(--muted)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,flexShrink:0}}>{m.name[0]}</span>
                  <div style={{textAlign:"left"}}><p>{m.name}</p>{m.pemilik&&<p style={{fontSize:11,fontWeight:400,marginTop:1}}>{m.pemilik}</p>}</div>
                </button>
              ))}
            </div>
            <div style={{marginTop:10}}>
              <TxtInput label="Harga Beli dari Mitra (modal)" moneyFormat value={form.hargaMitra} onChange={v=>setForm(p=>({...p,hargaMitra:v}))} placeholder="5.000" prefix="Rp"/>
            </div>
            {form.hargaMitra&&form.price&&parseInt(form.price)>parseInt(form.hargaMitra)&&(
              <div style={{background:"var(--green-dim)",borderRadius:9,padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{color:"var(--muted)",fontSize:12}}>Untung per item</span>
                <span style={{color:"var(--green)",fontWeight:700,fontSize:13}}>{rupiah(parseInt(form.price)-parseInt(form.hargaMitra))}</span>
              </div>
            )}
          </div>
        )}
        {!form.mitraId&&(
          <div>
            <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Opsi Suhu</p>
            <div style={{display:"flex",gap:8}}>
              {[{v:"Tidak Ada",label:"—  Tidak Ada"},{v:"Ice",label:"🧊 Ice Only"},{v:"Hot",label:"🔥 Hot Only"},{v:"Keduanya",label:"🧊🔥 Keduanya"}].map(opt=>(
                <button key={opt.v} onClick={()=>setForm(p=>({...p,suhu:opt.v}))} style={{flex:1,padding:"8px 4px",borderRadius:9,background:form.suhu===opt.v?"var(--blue-dim)":"var(--card2)",color:form.suhu===opt.v?"var(--blue)":"var(--muted)",border:`1px solid ${form.suhu===opt.v?"rgba(59,130,246,0.35)":"var(--border)"}`,fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{opt.label}</button>
              ))}
            </div>
          </div>
        )}
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Kategori</p>
            <button onClick={()=>setShowAddCat(v=>!v)} style={{fontSize:11,color:"var(--amber)",fontWeight:700,background:"var(--amber-dim)",border:"1px solid rgba(245,166,35,0.3)",borderRadius:7,padding:"3px 9px",cursor:"pointer"}}>+ Baru</button>
          </div>
          {showAddCat&&(
            <div style={{display:"flex",gap:7,marginBottom:9}}>
              <input value={newCatInput} onChange={e=>setNewCatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCategory()} placeholder="Nama kategori baru..." style={{flex:1,padding:"9px 12px",borderRadius:9,border:"1px solid var(--border)",background:"rgba(255,255,255,0.88)",fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
              <button onClick={addCategory} style={{padding:"9px 14px",borderRadius:9,background:"var(--amber)",color:"#fff",fontWeight:700,fontSize:13,border:"none",cursor:"pointer",flexShrink:0}}>OK</button>
            </div>
          )}
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {allCats.map(c=>(
              <div key={c} style={{display:"flex",alignItems:"center",gap:0,borderRadius:9,overflow:"hidden",border:`1.5px solid ${form.category===c?"rgba(245,166,35,0.45)":"var(--border)"}`,background:form.category===c?"var(--amber-dim)":"var(--card2)",flexShrink:0}}>
                {editCat?.old===c?(
                  <div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 6px"}}>
                    <input autoFocus value={editCat.val} onChange={e=>setEditCat(p=>({...p,val:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter")renameCategory(c,editCat.val);if(e.key==="Escape")setEditCat(null);}} style={{width:90,padding:"3px 7px",borderRadius:6,border:"1px solid var(--border)",background:"#fff",fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif",color:"var(--text)"}}/>
                    <button onClick={()=>renameCategory(c,editCat.val)} style={{padding:"3px 8px",borderRadius:6,background:"var(--amber)",color:"#fff",fontWeight:700,fontSize:11,border:"none",cursor:"pointer",flexShrink:0}}>✓</button>
                    <button onClick={()=>setEditCat(null)} style={{padding:"3px 6px",borderRadius:6,background:"var(--card2)",color:"var(--muted)",fontWeight:700,fontSize:11,border:"1px solid var(--border)",cursor:"pointer",flexShrink:0}}>✕</button>
                  </div>
                ):(
                  <>
                    <button onClick={()=>setForm(p=>({...p,category:c}))} style={{padding:"7px 10px",background:"none",border:"none",color:form.category===c?"var(--amber)":"var(--muted)",fontSize:12,fontWeight:600,cursor:"pointer"}}>{c}</button>
                    <button onClick={()=>setEditCat({old:c,val:c})} style={{padding:"5px 5px",background:"none",border:"none",borderLeft:"1px solid var(--border)",color:"var(--muted)",cursor:"pointer",display:"flex",alignItems:"center",lineHeight:1}}><svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                    <button onClick={()=>deleteCategory(c)} style={{padding:"5px 5px",background:"none",border:"none",borderLeft:"1px solid var(--border)",color:"var(--red)",cursor:"pointer",display:"flex",alignItems:"center",lineHeight:1}}><svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18 M8 6V4h8v2 M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg></button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <label style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",padding:"8px 0"}}>
            <div onClick={()=>setForm(p=>({...p,available:!p.available}))} style={{width:40,height:22,borderRadius:11,background:form.available?"var(--green)":"var(--card2)",border:`1px solid ${form.available?"var(--green)":"var(--border)"}`,position:"relative",transition:"background 0.18s",cursor:"pointer",flexShrink:0}}>
              <div style={{position:"absolute",top:2,left:form.available?20:2,width:16,height:16,borderRadius:8,background:"#fff",transition:"left 0.18s",boxShadow:"0 1px 4px rgba(0,0,0,0.15)"}}/>
            </div>
            <span style={{color:"var(--text)",fontSize:13,fontWeight:600}}>{form.available?"Tersedia":"Habis"}</span>
          </label>
        </div>
        <Btn onClick={save} disabled={!form.name||!form.price||saving} full>{saving?"Menyimpan...":"Simpan"}</Btn>
      </div>
    </div>)}
  </div>);
});

// ── DataTools ──
export const DataToolsScreen = ({busy,onClose,onBackup,onRestore,onReset,receiptSettings,onSaveReceiptSettings,printerStatus,printerBusy,onPrinterSelect,onPrinterRefresh,onPrinterClear}) => {
  const fileRef = useRef(null);
  const [receiptDraft, setReceiptDraft] = useState(()=>normalizeReceiptSettings(receiptSettings));
  useEffect(()=>{ setReceiptDraft(normalizeReceiptSettings(receiptSettings)); },[receiptSettings]);
  const handleReceiptSave = () => { onSaveReceiptSettings?.(receiptDraft); };
  const handleReceiptReset = () => { const defaults=normalizeReceiptSettings(DEFAULT_RECEIPT_SETTINGS);setReceiptDraft(defaults);onSaveReceiptSettings?.(defaults); };
  return(
    <div style={{position:"fixed",inset:0,zIndex:650,background:"rgba(15,23,42,0.34)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div className="fu" style={{width:"min(100%, 480px)",maxHeight:"min(86vh, 760px)",overflowY:"auto",background:"linear-gradient(180deg,#FFFFFF 0%,#F8FAFC 100%)",border:"1px solid var(--border)",borderRadius:24,padding:18,boxShadow:"0 24px 60px rgba(15,23,42,0.20)",display:"flex",flexDirection:"column",gap:14}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
          <div>
            <p style={{fontSize:11,color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>Tools Owner</p>
            <p className="sora" style={{fontSize:22,fontWeight:800,color:"var(--text)",marginTop:4}}>Backup, Reset & Struk</p>
            <p style={{fontSize:12,color:"var(--muted)",lineHeight:1.6,marginTop:6}}>Kelola backup data, reset ringan, dan kata-kata yang muncul di struk cetak.</p>
          </div>
          <button onClick={onClose} style={{width:42,height:42,borderRadius:14,border:"1px solid var(--border)",background:"rgba(255,255,255,0.92)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)",flexShrink:0}}><svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
        </div>
        <PrinterToolsCard status={printerStatus} busy={printerBusy} onSelect={onPrinterSelect} onRefresh={onPrinterRefresh} onClear={onPrinterClear}/>
        <Card style={{display:"flex",flexDirection:"column",gap:12}}>
          <div><p className="sora" style={{fontSize:16,fontWeight:800,color:"var(--text)"}}>Pengaturan struk</p><p style={{fontSize:12,color:"var(--muted)",lineHeight:1.6,marginTop:4}}>Struk disetel ke format 58mm supaya item dan keterangan lebih aman tidak kepotong. Header dan footer bisa Anda ubah dari sini.</p></div>
          <div style={{display:"grid",gap:10}}>
            <div style={{display:"grid",gap:6}}>
              <p style={{fontSize:11,color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>Header struk</p>
              <textarea rows={4} value={receiptDraft.header} onChange={e=>setReceiptDraft(prev=>({...prev,header:e.target.value}))} placeholder={DEFAULT_RECEIPT_SETTINGS.header} style={{minHeight:92,padding:"12px 14px",borderRadius:14,border:"1px solid var(--border)",background:"rgba(255,255,255,0.92)",resize:"vertical"}}/>
              <p style={{fontSize:11,color:"var(--muted)"}}>Gunakan Enter untuk ganti baris. Disarankan singkat: nama usaha + alamat/judul pendek.</p>
            </div>
            <div style={{display:"grid",gap:6}}>
              <p style={{fontSize:11,color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>Footer struk lunas</p>
              <textarea rows={3} value={receiptDraft.footerPaid} onChange={e=>setReceiptDraft(prev=>({...prev,footerPaid:e.target.value}))} placeholder={DEFAULT_RECEIPT_SETTINGS.footerPaid} style={{minHeight:78,padding:"12px 14px",borderRadius:14,border:"1px solid var(--border)",background:"rgba(255,255,255,0.92)",resize:"vertical"}}/>
            </div>
            <div style={{display:"grid",gap:6}}>
              <p style={{fontSize:11,color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>Footer struk tagihan</p>
              <textarea rows={3} value={receiptDraft.footerOpen} onChange={e=>setReceiptDraft(prev=>({...prev,footerOpen:e.target.value}))} placeholder={DEFAULT_RECEIPT_SETTINGS.footerOpen} style={{minHeight:78,padding:"12px 14px",borderRadius:14,border:"1px solid var(--border)",background:"rgba(255,255,255,0.92)",resize:"vertical"}}/>
            </div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <Btn onClick={handleReceiptSave} v="dark" disabled={!!busy}>💾 Simpan Teks Struk</Btn>
              <Btn onClick={handleReceiptReset} v="ghost" disabled={!!busy}>↺ Reset Default</Btn>
            </div>
          </div>
        </Card>
        <Card style={{display:"flex",flexDirection:"column",gap:12}}>
          <div><p className="sora" style={{fontSize:16,fontWeight:800,color:"var(--text)"}}>Backup & Restore</p><p style={{fontSize:12,color:"var(--muted)",lineHeight:1.6,marginTop:4}}>Backup menyimpan menu, kasir, mitra, transaksi, pengeluaran, <strong>sesi dashboard</strong>, target, password owner, dan <strong>pengaturan struk</strong> ke satu file <strong>.json</strong>.</p></div>
          <div style={{display:"grid",gap:10}}>
            <Btn onClick={onBackup} v="pdf" full disabled={!!busy}>⬇️ Backup Sekarang</Btn>
            <Btn onClick={()=>fileRef.current?.click()} v="ghost" full disabled={!!busy}>📂 Pulihkan dari Backup</Btn>
            <input ref={fileRef} type="file" accept="application/json,.json" style={{display:"none"}} onChange={async e=>{const file=e.target.files?.[0];if(file)await onRestore(file);e.target.value="";}}/>
          </div>
        </Card>
        <Card style={{display:"flex",flexDirection:"column",gap:12,border:"1px solid rgba(239,68,68,0.16)",background:"linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(254,242,242,0.98) 100%)"}}>
          <div><p className="sora" style={{fontSize:16,fontWeight:800,color:"var(--text)"}}>Reset ringan</p><p style={{fontSize:12,color:"var(--muted)",lineHeight:1.6,marginTop:4}}>Menghapus <strong>menu, transaksi, pengeluaran, dan sesi</strong>, tetapi tetap menyimpan data kasir, mitra, target, password owner, dan pengaturan struk.</p></div>
          <Btn onClick={onReset} v="danger" full disabled={!!busy}>🧹 Kosongkan Data Transaksi</Btn>
        </Card>
        {busy&&(<div style={{padding:"12px 14px",borderRadius:16,background:"var(--blue-dim)",border:"1px solid rgba(37,99,235,0.18)",color:"var(--blue)",fontWeight:700,fontSize:13}}>{busy}</div>)}
      </div>
    </div>
  );
};
