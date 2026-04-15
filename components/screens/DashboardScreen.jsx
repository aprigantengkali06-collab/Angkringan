"use client";
import { memo, useState, useMemo, useRef, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import {
  rupiah, fmt, getNow, fmtFull, fmtShort, genId,
  orderSessionDate, orderActualPaidAt, compareOrdersNewestFirst
} from "../lib/helpers.js";
import { buildFinanceDayMap, getFinanceSummaryForDate, emptyFinanceSummary } from "../lib/finance.js";
import { MITRA_COLORS, MITRA_COLORS_DIM } from "../lib/constants.js";
import Card from "../ui/Card.jsx";
import KasirChip from "../ui/KasirChip.jsx";
import PaymentMeta from "../ui/PaymentMeta.jsx";
import ReceiptPrintButton from "../ui/ReceiptPrintButton.jsx";
import { printOrderStrukRiwayat } from "../lib/receipt.js";

const ChartTooltip = memo(({active,payload,label}) => {
  if(!active||!payload?.length)return null;
  return(<div style={{background:"var(--card2)",border:"1px solid var(--border)",borderRadius:10,padding:"8px 12px"}}>
    <p style={{color:"var(--muted)",fontSize:11,marginBottom:3}}>{label}</p>
    <p className="sora" style={{color:"var(--amber)",fontWeight:700,fontSize:14}}>{rupiah(payload[0].value)}</p>
  </div>);
});

const getTopMenus = (orders,n=3) => {
  const freq={};orders.forEach(o=>o.items.forEach(i=>{freq[i.name]=(freq[i.name]||0)+i.qty;}));
  return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,n);
};

const DashboardScreen = memo(({orders,expenses,setExpenses,user,setScreen,target,setTarget,kasirs,mitras,menus,businessDate,sessionOpen,sessionDate,onBuka,onTutup,setDetailOrder}) => {
  const [editTarget,setEditTarget]=useState(false);
  const [tmpTarget,setTmpTarget]=useState(String(target));
  const targetInputRef=useRef(null);
  useEffect(()=>{
    if(editTarget&&targetInputRef.current){
      const formatted=String(target).replace(/\B(?=(\d{3})+(?!\d))/g,".");
      targetInputRef.current.value=formatted;
      setTmpTarget(String(target));
    }
  },[editTarget]);
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
        const mitraId=item.mitraId||menuRef?.mitraId;
        if(!mitraId) return;
        const hargaMitra=Number(item.hargaMitra??menuRef?.hargaMitra)||0;
        if(!sm[mitraId]) sm[mitraId]={penjualan:0,modal:0};
        const qty=Number(item.qty)||0;const hargaJual=Number(item.price)||0;
        sm[mitraId].penjualan+=hargaJual*qty;sm[mitraId].modal+=hargaMitra*qty;
      });
    });
    return mitras.map((m,i)=>({...m,colorIdx:i,penjualan:sm[m.id]?.penjualan||0,modal:sm[m.id]?.modal||0,profit:(sm[m.id]?.penjualan||0)-(sm[m.id]?.modal||0)})).filter(m=>m.penjualan>0||m.modal>0);
  },[paidToday,mitras,menus]);
  const totalMitraPenjualan = mitraStats.reduce((s,m)=>s+m.penjualan,0);
  const totalMitraModal = daySummary.modalMitra;
  const totalMitraProfit = mitraStats.reduce((s,m)=>s+m.profit,0);
  const totalPengeluaran = daySummary.totalKeluar;
  const bersih = daySummary.kas;
  const topToday=getTopMenus(paidToday,5);
  const recentDates=useMemo(()=>Array.from({length:7},(_,i)=>{const d=getNow();d.setDate(d.getDate()-i);return fmt(d);}),[]);
  const chartData=useMemo(()=>Array.from({length:7},(_,i)=>{
    const d=getNow();d.setDate(d.getDate()-(6-i));const ds=fmt(d);
    return {day:d.toLocaleDateString("id-ID",{weekday:"short"}),total:orders.filter(o=>o.status==="paid"&&orderSessionDate(o)===ds).reduce((s,o)=>s+o.total,0),isToday:ds===activeDashboardDate};
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

      {/* Tombol Buka/Tutup Sesi — owner */}
      {user.role==="owner"&&(
        <div className="fu" style={{marginBottom:12}}>
          {sessionOpen?(
            <div style={{background:"var(--green-dim)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:16,padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><div style={{width:9,height:9,borderRadius:"50%",background:"var(--green)",boxShadow:"0 0 8px var(--green)",flexShrink:0}}/><p style={{color:"var(--green)",fontWeight:700,fontSize:14}}>Sesi Sedang Berjalan</p></div>
              <p style={{color:"var(--muted)",fontSize:12,marginBottom:12}}>Tanggal rekap: <strong style={{color:"var(--text)"}}>{fmtFull(sessionDate)}</strong></p>
              <button onClick={onTutup} style={{width:"100%",padding:"11px",borderRadius:11,background:"var(--red)",color:"#fff",fontWeight:700,fontSize:14,border:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer"}}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                Tutup Sesi Angkringan
              </button>
            </div>
          ):(
            <div style={{background:"var(--card)",border:"2px dashed var(--border)",borderRadius:16,padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><div style={{width:9,height:9,borderRadius:"50%",background:"var(--muted)",flexShrink:0}}/><p style={{color:"var(--muted)",fontWeight:700,fontSize:14}}>Angkringan Belum Buka</p></div>
              <p style={{color:"var(--muted)",fontSize:12,marginBottom:12}}>Tekan tombol di bawah untuk mulai sesi. Semua transaksi akan direkap ke tanggal hari ini.</p>
              <button onClick={onBuka} style={{width:"100%",padding:"13px",borderRadius:11,background:"var(--green)",color:"#fff",fontWeight:700,fontSize:15,border:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",boxShadow:"0 6px 20px rgba(16,185,129,0.25)"}}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Buka Sesi Angkringan
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tombol Buka/Tutup Sesi — kasir */}
      {user.role==="kasir"&&(
        <div className="fu" style={{marginBottom:12}}>
          {sessionOpen?(
            <div style={{background:"var(--green-dim)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:16,padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><div style={{width:9,height:9,borderRadius:"50%",background:"var(--green)",boxShadow:"0 0 8px var(--green)",flexShrink:0}}/><p style={{color:"var(--green)",fontWeight:700,fontSize:14}}>Sesi Sedang Berjalan</p></div>
              <p style={{color:"var(--muted)",fontSize:12,marginBottom:12}}>Tanggal rekap: <strong style={{color:"var(--text)"}}>{fmtFull(sessionDate)}</strong></p>
              <button onClick={onTutup} style={{width:"100%",padding:"11px",borderRadius:11,background:"var(--red)",color:"#fff",fontWeight:700,fontSize:14,border:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer"}}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                Tutup Sesi Angkringan
              </button>
            </div>
          ):(
            <div style={{background:"var(--card)",border:"2px dashed var(--border)",borderRadius:16,padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><div style={{width:9,height:9,borderRadius:"50%",background:"var(--muted)",flexShrink:0}}/><p style={{color:"var(--muted)",fontWeight:700,fontSize:14}}>Angkringan Belum Buka</p></div>
              <p style={{color:"var(--muted)",fontSize:12,marginBottom:12}}>Tekan tombol di bawah untuk mulai sesi. Semua transaksi akan direkap ke tanggal hari ini.</p>
              <button onClick={onBuka} style={{width:"100%",padding:"13px",borderRadius:11,background:"var(--green)",color:"#fff",fontWeight:700,fontSize:15,border:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",boxShadow:"0 6px 20px rgba(16,185,129,0.25)"}}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
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
                <button key={ds} onClick={()=>setSelectedHistoryDate(v=>v===ds?null:ds)} style={{flexShrink:0,padding:"8px 11px",borderRadius:999,background:active?"var(--amber)":"var(--card2)",color:active?"#fff":"var(--text)",border:`1px solid ${active?"rgba(245,166,35,0.35)":"var(--border)"}`,fontSize:12,fontWeight:700}}>
                  {fmtShort(ds)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Ringkasan Keuangan Hari Ini */}
      <div className="dashboard-summary-grid" style={{gap:9,alignItems:"start"}}>
        {[{label:"Total Omset",val:pemasukan,color:"var(--green)",bg:"var(--green-dim)"},{label:"Total Keluar",val:totalPengeluaran,color:"var(--red)",bg:"var(--red-dim)"}].map((s,i)=>(
          <div key={s.label} className={`fu s${i+1}`} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:13,padding:"13px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:11}}>
              <div style={{width:36,height:36,borderRadius:10,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:9,height:9,borderRadius:"50%",background:s.color}}/></div>
              <span style={{color:"var(--muted)",fontSize:14}}>{s.label}</span>
            </div>
            <span className="sora" style={{fontSize:15,fontWeight:700,color:s.color}}>{rupiah(s.val)}</span>
          </div>
        ))}
        {/* Card Mitra */}
        {(mitraStats.length>0||mitras.length>0)&&(
          <div className="fu s3" style={{background:"var(--card)",border:"1px solid rgba(124,58,237,0.2)",borderRadius:13,padding:"12px 14px"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:10}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:10,flex:1}}>
                <div style={{width:36,height:36,borderRadius:10,background:"var(--purple-dim)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75"/></svg>
                </div>
                <div style={{minWidth:0}}>
                  <span style={{color:"var(--muted)",fontSize:14}}>Penjualan Mitra</span>
                  <p style={{color:"var(--muted)",fontSize:11,marginTop:3}}>Sudah termasuk ke pemasukan hari ini.</p>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                <span style={{color:"var(--purple)",fontSize:10,fontWeight:700,background:"var(--purple-dim)",padding:"3px 7px",borderRadius:999,whiteSpace:"nowrap"}}>Omzet {rupiah(totalMitraPenjualan)}</span>
                <span style={{color:"var(--green)",fontSize:10,fontWeight:700,background:"var(--green-dim)",padding:"3px 7px",borderRadius:999,whiteSpace:"nowrap"}}>Laba {rupiah(totalMitraProfit)}</span>
              </div>
            </div>
            {mitraStats.map((m,i)=>{
              const idx=m.colorIdx%4;
              return(
                <div key={m.id} style={{padding:"8px 9px",borderRadius:10,background:MITRA_COLORS_DIM[idx],border:`1px solid ${MITRA_COLORS[idx]}22`,marginBottom:i<mitraStats.length-1?7:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <span style={{width:24,height:24,borderRadius:7,background:MITRA_COLORS[idx],color:"#fff",fontSize:11,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{m.name[0]}</span>
                      <span style={{color:"var(--text)",fontWeight:700,fontSize:13}}>{m.name}</span>
                    </div>
                    <span className="sora" style={{color:MITRA_COLORS[idx],fontWeight:700,fontSize:13}}>{rupiah(m.penjualan)}</span>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <div style={{flex:1,background:"rgba(255,255,255,0.55)",borderRadius:7,padding:"5px 8px",textAlign:"center"}}><p style={{color:"var(--muted)",fontSize:9,marginBottom:1}}>Modal</p><p style={{color:"var(--red)",fontWeight:700,fontSize:11}}>{rupiah(m.modal)}</p></div>
                    <div style={{flex:1,background:"rgba(255,255,255,0.55)",borderRadius:7,padding:"5px 8px",textAlign:"center"}}><p style={{color:"var(--muted)",fontSize:9,marginBottom:1}}>Profit</p><p style={{color:"var(--green)",fontWeight:700,fontSize:11}}>{rupiah(m.profit)}</p></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Ringkasan Omset & Mitra */}
        {(()=>{
          const omsetMitraDay=daySummary.omsetMitra||0;
          const omsetNonMitraDay=pemasukan-omsetMitraDay;
          const untungMitraDay=omsetMitraDay-totalMitraModal;
          const totalBersihDay=omsetNonMitraDay+untungMitraDay;
          return(
            <div className={mitraStats.length>0?"fu s4":"fu s3"} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:13,padding:"12px 14px",display:"flex",flexDirection:"column",alignItems:"stretch"}}>
              <div style={{background:"var(--card2)",border:"1px dashed var(--border)",borderRadius:12,padding:"10px 11px",display:"flex",flexDirection:"column",gap:8}}>
                {[{label:"Total Omset",val:rupiah(pemasukan),color:"var(--green)"},{label:"Omset (non-mitra)",val:rupiah(omsetNonMitraDay),color:"var(--blue)"},{label:"Total Modal Mitra",val:rupiah(totalMitraModal),color:"var(--red)"},{label:"Untung Mitra",val:rupiah(untungMitraDay),color:"var(--purple)"}].map((item,idx)=>(
                  <div key={item.label} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,alignItems:"center",paddingBottom:7,borderBottom:"1px solid rgba(215,226,240,0.8)"}}>
                    <p style={{color:"var(--muted)",fontSize:10,fontWeight:600}}>{item.label}</p>
                    <p className="sora" style={{color:item.color,fontWeight:700,fontSize:12,textAlign:"right"}}>{item.val}</p>
                  </div>
                ))}
                {user.role==="owner"&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,alignItems:"center",paddingTop:3}}>
                    <p style={{color:"var(--text)",fontSize:11,fontWeight:800}}>Total Bersih</p>
                    <p className="sora" style={{color:totalBersihDay>=0?"var(--amber)":"var(--red)",fontWeight:800,fontSize:14,textAlign:"right"}}>{rupiah(totalBersihDay)}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Form Pengeluaran */}
      <div style={{marginTop:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
          <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>🧾 Pengeluaran {activeDashboardDate?fmtShort(activeDashboardDate):"Belum dipilih"} ({expsToday.length})</p>
          {(user.role==="owner"||(user.role==="kasir"&&sessionOpen))?(
            <button onClick={()=>setShowExpForm(v=>!v)} style={{background:"var(--red)",color:"#fff",borderRadius:10,padding:"6px 14px",fontWeight:700,fontSize:12,border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5,boxShadow:"0 3px 10px rgba(239,68,68,0.25)"}}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              Tambah
            </button>
          ):(<span style={{fontSize:11,color:"var(--muted)",fontStyle:"italic"}}>Sesi belum buka</span>)}
        </div>
        {showExpForm&&(
          <div className="fi" style={{background:"var(--card)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:14,padding:"14px",marginBottom:10,display:"flex",flexDirection:"column",gap:10,boxShadow:"0 4px 16px rgba(239,68,68,0.08)"}}>
            <p style={{color:"var(--red)",fontWeight:700,fontSize:13,marginBottom:2}}>Catat Pengeluaran</p>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <label style={{fontSize:11,color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>KETERANGAN</label>
              <div style={{display:"flex",alignItems:"center",background:"rgba(255,255,255,0.88)",border:"1px solid var(--border)",borderRadius:14,overflow:"hidden"}}><input type="text" value={expDesc} onChange={e=>setExpDesc(e.target.value)} placeholder="Beli es batu, gula, kopi..." style={{paddingLeft:"14px"}}/></div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <label style={{fontSize:11,color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>JUMLAH</label>
              <div style={{display:"flex",alignItems:"center",background:"rgba(255,255,255,0.88)",border:"1px solid var(--border)",borderRadius:14,overflow:"hidden"}}>
                <span style={{padding:"0 6px 0 14px",color:"var(--muted)",fontSize:14,flexShrink:0,fontWeight:600}}>Rp</span>
                <input type="text" inputMode="numeric" value={expAmt?Number(expAmt).toLocaleString('id-ID'):''} onChange={e=>setExpAmt(e.target.value.replace(/\D/g,''))} placeholder="50.000" style={{paddingLeft:"4px"}}/>
              </div>
            </div>
            {expOk&&(<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"var(--green-dim)",borderRadius:8,padding:"8px"}}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg><p style={{color:"var(--green)",fontSize:12,fontWeight:600}}>Pengeluaran tersimpan!</p></div>)}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{setShowExpForm(false);setExpDesc("");setExpAmt("");}} style={{flex:1,padding:"9px 14px",borderRadius:16,fontWeight:700,fontSize:13,background:"rgba(255,255,255,0.78)",color:"var(--text)",border:"1px solid var(--border)"}}>Batal</button>
              <button onClick={saveExp} disabled={!expDesc||!expAmt} style={{flex:1,padding:"9px 14px",borderRadius:16,fontWeight:700,fontSize:13,background:"linear-gradient(135deg,var(--amber) 0%,#F97316 100%)",color:"#fff",border:"none",opacity:(!expDesc||!expAmt)?0.45:1}}>Simpan</button>
            </div>
          </div>
        )}
        {!activeDashboardDate?(<div style={{background:"var(--card)",border:"1px dashed var(--border)",borderRadius:11,padding:16,textAlign:"center"}}><p style={{color:"var(--muted)",fontSize:13}}>Pilih tanggal dari 7 hari terakhir untuk melihat detail Home.</p></div>)
        :expsToday.length===0?(<div style={{background:"var(--card)",border:"1px dashed var(--border)",borderRadius:11,padding:16,textAlign:"center"}}><p style={{color:"var(--muted)",fontSize:13}}>Belum ada pengeluaran hari ini</p></div>)
        :expsToday.map(e=>(
          <div key={e.id} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:11,padding:"11px 14px",marginBottom:7,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <div style={{width:32,height:32,borderRadius:9,background:"var(--red-dim)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div>
              <p style={{color:"var(--text)",fontSize:13}}>{e.description}</p>
            </div>
            <span style={{color:"var(--red)",fontWeight:700,fontSize:13,flexShrink:0,marginLeft:8}}>−{rupiah(e.amount)}</span>
          </div>
        ))}
      </div>

      {/* Kasir: omzet + grafik + menu terlaku */}
      {user.role==="kasir"&&(<>
        <Card className="fu s4" style={{marginTop:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div><p style={{color:"var(--muted)",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Omzet Hari Ini</p><p className="sora" style={{color:"var(--amber)",fontWeight:800,fontSize:18,marginTop:2}}>{rupiah(pemasukan)}</p></div>
            <div style={{textAlign:"right"}}><p style={{color:"var(--muted)",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Target</p><p className="sora" style={{color:"var(--text)",fontWeight:700,fontSize:15,marginTop:2}}>{rupiah(target)}</p></div>
          </div>
          <div style={{background:"var(--card2)",borderRadius:99,height:8,overflow:"hidden"}}><div style={{width:`${progress}%`,height:"100%",borderRadius:99,background:progress>=100?"var(--green)":"var(--amber)",transition:"width 0.5s ease"}}/></div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}><span style={{color:"var(--muted)",fontSize:12}}>{Math.round(progress)}% tercapai</span><span style={{color:"var(--muted)",fontSize:12}}>Sisa {rupiah(Math.max(target-pemasukan,0))}</span></div>
        </Card>
        {topToday.length>0&&(<Card className="fu s5" style={{marginTop:12}}>
          <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>⭐ Menu Terlaku Hari Ini</p>
          {topToday.map(([name,qty],i)=>(<div key={name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<topToday.length-1?"1px solid var(--border)":"none"}}><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{width:22,height:22,borderRadius:6,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",background:i===0?"var(--amber)":"var(--amber-dim)",color:i===0?"#fff":"var(--amber)",flexShrink:0}}>{i+1}</span><span style={{color:"var(--text)",fontSize:13}}>{name}</span></div><span style={{color:"var(--amber)",fontWeight:700}}>{qty}x</span></div>))}
        </Card>)}
        <Card style={{marginTop:12,padding:"16px 12px 12px"}}>
          <p style={{color:"var(--muted)",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:12,paddingLeft:4}}>Pemasukan 7 Hari Terakhir</p>
          <ResponsiveContainer width="100%" height={110}><BarChart data={chartData} barCategoryGap="25%"><XAxis dataKey="day" tick={{fill:"var(--muted)",fontSize:11}} axisLine={false} tickLine={false}/><Tooltip content={<ChartTooltip/>} cursor={{fill:"rgba(245,166,35,0.05)"}}/><Bar dataKey="total" radius={[6,6,0,0]}>{chartData.map((e,i)=>(<Cell key={i} fill={e.isToday?"var(--amber)":"rgba(245,166,35,0.28)"}/>))}</Bar></BarChart></ResponsiveContainer>
        </Card>
      </>)}

      {/* Owner: target + grafik + menu terlaku */}
      {user.role==="owner"&&(<>
        <Card className="fu s4" style={{marginTop:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div><p style={{color:"var(--muted)",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Target Omzet Harian</p>{!editTarget&&<p className="sora" style={{color:"var(--text)",fontWeight:700,fontSize:15,marginTop:2}}>{rupiah(target)}</p>}</div>
            {editTarget?(
              <div style={{display:"flex",gap:7,alignItems:"center"}}>
                <div style={{background:"var(--card2)",border:"1px solid var(--amber)",borderRadius:8,overflow:"hidden",width:130}}>
                  <input ref={targetInputRef} type="text" inputMode="numeric"
                    onChange={e=>{const input=e.target;const pos=input.selectionStart;const oldVal=input.value;const dotsBeforeCursor=(oldVal.slice(0,pos).match(/\./g)||[]).length;const raw=oldVal.replace(/[^\d]/g,"");const formatted=raw.replace(/\B(?=(\d{3})+(?!\d))/g,".");input.value=formatted;setTmpTarget(raw);const newDots=(formatted.slice(0,pos).match(/\./g)||[]).length;const newPos=pos+(newDots-dotsBeforeCursor);try{input.setSelectionRange(newPos,newPos);}catch(err){}}}
                    onKeyDown={e=>{if(e.key==="Enter"){setTarget(parseInt(tmpTarget.replace(/\./g,""))||target);setEditTarget(false);}}}
                    style={{padding:"6px 10px",fontSize:14,fontWeight:700,textAlign:"right"}} placeholder="0"/>
                </div>
                <button onClick={()=>{setTarget(parseInt(tmpTarget.replace(/\./g,""))||target);setEditTarget(false);}} style={{color:"var(--green)",fontWeight:700,fontSize:13}}>OK</button>
              </div>
            ):(<button onClick={()=>{setTmpTarget(String(target));setEditTarget(true);}} style={{color:"var(--muted)",fontSize:12,border:"1px solid var(--border)",borderRadius:8,padding:"5px 10px"}}>Edit</button>)}
          </div>
          <div style={{background:"var(--card2)",borderRadius:99,height:8,overflow:"hidden"}}><div style={{width:`${progress}%`,height:"100%",borderRadius:99,background:progress>=100?"var(--green)":"var(--amber)",transition:"width 0.5s ease"}}/></div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}><span style={{color:"var(--muted)",fontSize:12}}>{Math.round(progress)}% tercapai</span><span style={{color:"var(--muted)",fontSize:12}}>Sisa {rupiah(Math.max(target-pemasukan,0))}</span></div>
        </Card>
        {topToday.length>0&&(<Card className="fu s5" style={{marginTop:12}}>
          <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>⭐ Menu Terlaku Hari Ini</p>
          {topToday.map(([name,qty],i)=>(<div key={name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<topToday.length-1?"1px solid var(--border)":"none"}}><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{width:22,height:22,borderRadius:6,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",background:i===0?"var(--amber)":"var(--amber-dim)",color:i===0?"#fff":"var(--amber)",flexShrink:0}}>{i+1}</span><span style={{color:"var(--text)",fontSize:13}}>{name}</span></div><span style={{color:"var(--amber)",fontWeight:700}}>{qty}x</span></div>))}
        </Card>)}
        <Card style={{marginTop:12,padding:"16px 12px 12px"}}>
          <p style={{color:"var(--muted)",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:12,paddingLeft:4}}>Pemasukan 7 Hari Terakhir</p>
          <ResponsiveContainer width="100%" height={110}><BarChart data={chartData} barCategoryGap="25%"><XAxis dataKey="day" tick={{fill:"var(--muted)",fontSize:11}} axisLine={false} tickLine={false}/><Tooltip content={<ChartTooltip/>} cursor={{fill:"rgba(245,166,35,0.05)"}}/><Bar dataKey="total" radius={[6,6,0,0]}>{chartData.map((e,i)=>(<Cell key={i} fill={e.isToday?"var(--amber)":"rgba(245,166,35,0.28)"}/>))}</Bar></BarChart></ResponsiveContainer>
        </Card>
        {openOrders.length>0&&(
          <div style={{marginTop:14}}>
            <p style={{fontSize:12,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:9}}>Belum Bayar ({openOrders.length})</p>
            {openOrders.map(o=>{
              const totalQty=o.items.reduce((sum,item)=>sum+(Number(item.qty)||0),0);
              const visibleItems=o.items.slice(0,3);const overflowItems=o.items.length-visibleItems.length;
              return(
                <div key={o.id} className="tagihan-card" onClick={()=>setScreen("tagihan")} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:13,padding:"13px 15px",marginBottom:9,cursor:"pointer",boxShadow:"0 2px 8px rgba(15,23,42,0.05)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,gap:10}}>
                    <p style={{color:"var(--text)",fontWeight:700,fontSize:15,fontFamily:"'Sora',sans-serif",flex:1,lineHeight:1.3}}>{o.customerName}</p>
                    <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                      <p className="sora" style={{color:"var(--amber)",fontWeight:800,fontSize:14}}>{rupiah(o.total)}</p>
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                    </div>
                  </div>
                  <div style={{height:1,background:"var(--bg2)",marginBottom:7}}/>
                  {visibleItems.map((item,idx)=>(<div key={`${o.id}-${idx}`} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"2.5px 0",gap:10}}><p style={{color:"var(--muted)",fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"80%",lineHeight:1.4}}>{item.name}{item.note?` · ${item.note}`:""}</p><span style={{color:"var(--text)",fontSize:12,fontWeight:700,flexShrink:0}}>×{item.qty}</span></div>))}
                  {overflowItems>0&&(<p style={{color:"var(--amber)",fontSize:11,fontWeight:600,marginTop:3}}>··· +{overflowItems} item lainnya</p>)}
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:9,flexWrap:"wrap"}}><KasirChip kasirId={o.kasirId} kasirs={kasirs}/><span style={{color:"var(--muted)",fontSize:11}}>{totalQty} item</span></div>
                </div>
              );
            })}
          </div>
        )}
        {/* Histori transaksi — paid */}
        <div>
          <p style={{fontSize:11,color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:9,marginTop:14}}>✅ Transaksi Sesi ({paidToday.length})</p>
          {paidToday.length===0?(<Card style={{textAlign:"center",padding:16}}><p style={{color:"var(--muted)",fontSize:13}}>Belum ada transaksi untuk sesi ini</p></Card>):(
            [...paidToday].sort(compareOrdersNewestFirst).map((o,i)=>(
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
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:9}}><KasirChip kasirId={o.kasirId} kasirs={kasirs}/><PaymentMeta order={o}/></div>
              </div>
            ))
          )}
        </div>
      </>)}
    </div>
  );
});

export default DashboardScreen;
