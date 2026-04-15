"use client";
// PengeluaranScreen.jsx
// Komponen ini adalah wrapper untuk form pengeluaran yang dipakai di DashboardScreen.
// Berisi form catat pengeluaran + list pengeluaran harian.
import { memo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { rupiah, genId, fmt, getNow, fmtShort } from "../lib/helpers.js";
import Card from "../ui/Card.jsx";
import TxtInput from "../ui/TxtInput.jsx";
import Btn from "../ui/Btn.jsx";

const PengeluaranScreen = memo(({
  expenses, setExpenses, businessDate, sessionOpen, activeDashboardDate, user
}) => {
  const [showExpForm, setShowExpForm] = useState(false);
  const [expDesc, setExpDesc] = useState("");
  const [expAmt, setExpAmt] = useState("");
  const [expOk, setExpOk] = useState(false);

  const expsToday = activeDashboardDate
    ? expenses.filter(e => e.date === activeDashboardDate)
    : [];

  const saveExp = () => {
    if(!expDesc || !expAmt) return;
    const entryDate = sessionOpen ? businessDate : fmt(getNow());
    const newExp = {id:genId("EXP"),description:expDesc,amount:parseInt(expAmt),date:entryDate};
    setExpenses(p=>[...p,newExp]);
    supabase.from("expenses").upsert({id:newExp.id,description:newExp.description,amount:newExp.amount,date:newExp.date}).then();
    setExpDesc("");setExpAmt("");setExpOk(true);setTimeout(()=>setExpOk(false),1800);setShowExpForm(false);
  };

  const canAdd = user?.role==="owner" || (user?.role==="kasir" && sessionOpen);

  return (
    <div style={{marginTop:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
        <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>
          🧾 Pengeluaran {activeDashboardDate?fmtShort(activeDashboardDate):"Belum dipilih"} ({expsToday.length})
        </p>
        {canAdd?(
          <button onClick={()=>setShowExpForm(v=>!v)} style={{background:"var(--red)",color:"#fff",borderRadius:10,padding:"6px 14px",fontWeight:700,fontSize:12,border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5,boxShadow:"0 3px 10px rgba(239,68,68,0.25)"}}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            Tambah
          </button>
        ):(
          <span style={{fontSize:11,color:"var(--muted)",fontStyle:"italic"}}>Sesi belum buka</span>
        )}
      </div>
      {showExpForm&&(
        <div className="fi" style={{background:"var(--card)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:14,padding:"14px",marginBottom:10,display:"flex",flexDirection:"column",gap:10,boxShadow:"0 4px 16px rgba(239,68,68,0.08)"}}>
          <p style={{color:"var(--red)",fontWeight:700,fontSize:13,marginBottom:2}}>Catat Pengeluaran</p>
          <TxtInput label="Keterangan" value={expDesc} onChange={setExpDesc} placeholder="Beli es batu, gula, kopi..."/>
          <TxtInput label="Jumlah" moneyFormat value={expAmt} onChange={setExpAmt} placeholder="50.000" prefix="Rp"/>
          {expOk&&(
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"var(--green-dim)",borderRadius:8,padding:"8px"}}>
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
        <div style={{background:"var(--card)",border:"1px dashed var(--border)",borderRadius:11,padding:16,textAlign:"center"}}>
          <p style={{color:"var(--muted)",fontSize:13}}>Belum ada pengeluaran hari ini</p>
        </div>
      ):expsToday.map(e=>(
        <div key={e.id} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:11,padding:"11px 14px",marginBottom:7,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:32,height:32,borderRadius:9,background:"var(--red-dim)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            </div>
            <p style={{color:"var(--text)",fontSize:13}}>{e.description}</p>
          </div>
          <span style={{color:"var(--red)",fontWeight:700,fontSize:13,flexShrink:0,marginLeft:8}}>−{rupiah(e.amount)}</span>
        </div>
      ))}
    </div>
  );
});

export default PengeluaranScreen;
