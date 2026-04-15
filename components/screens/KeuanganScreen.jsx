"use client";
import { memo, useState, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import {
  rupiah, genId, fmtFull, fmtShort, fmt, getNow, pad, orderSessionDate,
  orderActualPaidAt, expenseDateKey, calcFinanceSummary, getMonths
} from "../lib/helpers.js";
import {
  buildFinanceDayMap, getFinanceSummaryForDate, getFinanceSummaryForMonth, emptyFinanceSummary
} from "../lib/finance.js";
import { printDayPDF, printMonthPDF } from "../lib/pdf.js";
import Card from "../ui/Card.jsx";
import BackBtn from "../ui/BackBtn.jsx";
import KasirChip from "../ui/KasirChip.jsx";
import PaymentMeta from "../ui/PaymentMeta.jsx";
import ReceiptPrintButton from "../ui/ReceiptPrintButton.jsx";
import TxtInput from "../ui/TxtInput.jsx";
import Btn from "../ui/Btn.jsx";
import { printOrderStrukRiwayat } from "../lib/receipt.js";
import { KASIR_COLORS, KASIR_COLORS_DIM } from "../lib/constants.js";

// ── MonthList ──
const MonthList = memo(({months, onSelect, getMonthSummary}) => (
  <div style={{display:"flex",flexDirection:"column",gap:9}}>
    {months.map((m,i)=>{
      const {pemasukan,totalKeluar,kas} = getMonthSummary(m.key);
      const now = getNow();
      const isThisMonth = m.key === `${now.getFullYear()}-${pad(now.getMonth()+1)}`;
      return(
        <div key={m.key} className={`fu s${Math.min(i+1,5)}`} onClick={()=>onSelect(m)}
          style={{background:"var(--card)",border:`1px solid ${isThisMonth?"rgba(245,166,35,0.3)":"var(--border)"}`,borderRadius:14,padding:"14px 16px",cursor:"pointer",transition:"border-color 0.15s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <p style={{color:isThisMonth?"var(--amber)":"var(--cream)",fontWeight:700,fontSize:16}}>{m.label}</p>
              {isThisMonth&&<span style={{background:"var(--amber-dim)",color:"var(--amber)",fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:99,marginTop:4,display:"inline-block"}}>Bulan ini</span>}
            </div>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </div>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1,background:"var(--green-dim)",borderRadius:9,padding:"8px 10px",textAlign:"center"}}>
              <p style={{color:"var(--muted)",fontSize:10,marginBottom:2}}>Masuk</p>
              <p style={{color:"var(--green)",fontWeight:700,fontSize:12}}>{rupiah(pemasukan)}</p>
            </div>
            <div style={{flex:1,background:"var(--red-dim)",borderRadius:9,padding:"8px 10px",textAlign:"center"}}>
              <p style={{color:"var(--muted)",fontSize:10,marginBottom:2}}>Total Keluar</p>
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
));

// ── DayDetail ──
const DayDetail = ({date, orders, expenses, setExpenses, kasirs, menus, onBack, businessDate, baseSummary, receiptSettings}) => {
  const [showAddExp, setShowAddExp] = useState(false);
  const [desc, setDesc] = useState("");
  const [amt, setAmt] = useState("");
  const [ok, setOk] = useState(false);
  const [pgOrders, setPgOrders] = useState(0);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const seedSummary = baseSummary || calcFinanceSummary({
    orders: orders.filter(o=>o.status==="paid"&&orderSessionDate(o)===date),
    expenses: expenses.filter(e=>expenseDateKey(e)===date),
    menus,
  });
  const paid = seedSummary.paidOrders;
  const allExps = seedSummary.expenses;
  const pemasukan = seedSummary.pemasukan;
  const modalMitra = seedSummary.modalMitra;
  const pengeluaran = seedSummary.pengeluaran;
  const totalKeluar = pengeluaran + modalMitra;
  const kas = pemasukan - totalKeluar;
  const isToday = date===businessDate;

  const saveExp = () => {
    const amount = parseInt(amt,10);
    if(!desc||!amount)return;
    const newExp = {id:genId("EXP"),description:desc.trim(),amount,date};
    setExpenses(prev=>[...prev,newExp]);
    supabase.from("expenses").upsert({id:newExp.id,description:newExp.description,amount:newExp.amount,date:newExp.date}).then();
    setDesc("");setAmt("");setOk(true);setTimeout(()=>setOk(false),1800);setShowAddExp(false);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <p style={{color:isToday?"var(--amber)":"var(--cream)",fontWeight:700,fontSize:16}}>{isToday?"Hari Ini":fmtShort(date)}</p>
          <p style={{color:"var(--muted)",fontSize:12,marginTop:2}}>{fmtFull(date)}</p>
        </div>
        <button onClick={()=>printDayPDF(date,orders,expenses,kasirs,menus)} style={{background:"var(--blue-dim)",border:"1px solid rgba(91,141,239,0.25)",borderRadius:12,padding:"9px 14px",color:"var(--blue)",display:"flex",alignItems:"center",gap:7,fontWeight:700,fontSize:13}}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3"/></svg>
          PDF
        </button>
      </div>
      <div style={{display:"flex",gap:8}}>
        {[{label:"Pemasukan",val:pemasukan,color:"var(--green)",bg:"var(--green-dim)"},
          {label:"Total Keluar",val:totalKeluar,color:"var(--red)",bg:"var(--red-dim)"},
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
      <div>
        <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:9}}>Pesanan ({paid.length})</p>
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
              const isExpanded = expandedOrderId === o.id;
              return(
                <div key={o.id} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:11,marginBottom:7,overflow:"hidden",transition:"box-shadow 0.18s ease",boxShadow:isExpanded?"0 4px 16px rgba(0,0,0,0.09)":"none"}}>
                  <div onClick={()=>setExpandedOrderId(isExpanded?null:o.id)} style={{padding:"11px 13px",cursor:"pointer",userSelect:"none"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{width:22,height:22,borderRadius:6,background:"var(--card2)",border:"1px solid var(--border)",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)",flexShrink:0}}>{pg*PAGE+idx+1}</span>
                        <div>
                          <p style={{color:"var(--text)",fontWeight:600,fontSize:14}}>{o.customerName}</p>
                          <PaymentMeta order={o}/>
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0,marginLeft:8}}>
                        <span style={{color:"var(--green)",fontWeight:700,fontSize:14}}>{rupiah(o.total)}</span>
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{transition:"transform 0.2s ease",transform:isExpanded?"rotate(180deg)":"rotate(0deg)"}}>
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </div>
                    </div>
                    <p style={{color:"var(--muted)",fontSize:11,lineHeight:1.4,paddingLeft:30,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.items.map(i=>`${i.name} ×${i.qty}`).join(" · ")}</p>
                  </div>
                  {isExpanded&&(
                    <div style={{borderTop:"1px solid var(--border)",animation:"fadeUp 0.18s ease both"}}>
                      <div style={{padding:"10px 13px",display:"flex",flexDirection:"column",gap:0}}>
                        {o.items.map((it,i)=>(
                          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:i===0?0:7,paddingBottom:i<o.items.length-1?7:0,borderBottom:i<o.items.length-1?"1px solid var(--bg2)":"none"}}>
                            <div>
                              <p style={{color:"var(--text)",fontSize:12,fontWeight:600}}>{it.name}{it.suhu?` (${it.suhu})`:""}</p>
                              {it.note&&<p style={{color:"var(--muted)",fontSize:10,marginTop:1}}>📝 {it.note}</p>}
                              <p style={{color:"var(--muted)",fontSize:11,marginTop:1}}>×{it.qty} @ {rupiah(it.price)}</p>
                            </div>
                            <p style={{color:"var(--text)",fontWeight:700,fontSize:12,flexShrink:0,marginLeft:12}}>{rupiah(it.qty*it.price)}</p>
                          </div>
                        ))}
                      </div>
                      <div style={{margin:"0 13px",borderTop:"1px solid var(--border)",paddingTop:8,paddingBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <p style={{color:"var(--muted)",fontSize:11,fontWeight:600}}>Total</p>
                        <p className="sora" style={{color:"var(--green)",fontWeight:800,fontSize:14}}>{rupiah(o.total)}</p>
                      </div>
                      <div style={{background:"var(--card2)",padding:"8px 13px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <KasirChip kasirId={o.kasirId} kasirs={kasirs}/>
                        <ReceiptPrintButton onClick={()=>printOrderStrukRiwayat(o,kasirs,receiptSettings)} loadingLabel="Mencetak..." doneLabel="✓ Tercetak" style={{padding:"6px 12px",borderRadius:8,marginLeft:"auto",background:"var(--blue-dim)",border:"1px solid rgba(37,99,235,0.2)",color:"var(--blue)",fontWeight:700,fontSize:11,flexShrink:0}}>Struk</ReceiptPrintButton>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {total_pages>1&&(
              <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,marginTop:8,marginBottom:4}}>
                <button onClick={()=>setPgOrders(p=>Math.max(0,p-1))} disabled={pg===0} style={{width:30,height:30,borderRadius:8,background:"var(--card2)",border:"1px solid var(--border)",color:pg===0?"var(--muted)":"var(--text)",fontWeight:700,cursor:pg===0?"default":"pointer"}}>‹</button>
                <span style={{fontSize:12,color:"var(--muted)",fontWeight:600}}>{pg+1} / {total_pages}</span>
                <button onClick={()=>setPgOrders(p=>Math.min(total_pages-1,p+1))} disabled={pg===total_pages-1} style={{width:30,height:30,borderRadius:8,background:"var(--card2)",border:"1px solid var(--border)",color:pg===total_pages-1?"var(--muted)":"var(--text)",fontWeight:700,cursor:pg===total_pages-1?"default":"pointer"}}>›</button>
              </div>
            )}
          </>);
        })()}
      </div>
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
          <p style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Pengeluaran ({allExps.length})</p>
          {isToday&&(<button onClick={()=>setShowAddExp(!showAddExp)} style={{background:"var(--amber)",color:"#fff",borderRadius:9,padding:"5px 11px",fontWeight:700,fontSize:12,display:"flex",alignItems:"center",gap:4}}>+ Tambah</button>)}
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
          <div key={e.id} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:11,padding:"11px 13px",marginBottom:7,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <p style={{color:"var(--text)",fontSize:13}}>{e.description}</p>
            <span style={{color:"var(--red)",fontWeight:700,fontSize:13,flexShrink:0,marginLeft:8}}>−{rupiah(e.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── KeuanganScreen ──
const KeuanganScreen = memo(({orders, expenses, setExpenses, kasirs, menus, businessDate, receiptSettings}) => {
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

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{flex:1,overflowY:"auto",padding:"14px 18px"}}>
        {selDay?(
          <div className="fi">
            <BackBtn onClick={()=>setSelDay(null)}/>
            <DayDetail date={selDay} orders={orders} expenses={expenses} setExpenses={setExpenses}
              kasirs={kasirs} menus={menus} onBack={()=>setSelDay(null)} businessDate={businessDate}
              baseSummary={getDaySummary(selDay)} receiptSettings={receiptSettings}/>
          </div>
        ):selMonth?(
          <div className="fi">
            <BackBtn onClick={()=>setSelMonth(null)}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div>
                <p style={{color:"var(--amber)",fontWeight:700,fontSize:17}}>{selMonth.label}</p>
                <p style={{color:"var(--muted)",fontSize:12,marginTop:2}}>{daysInMonth.length} hari tercatat</p>
              </div>
              <button onClick={()=>printMonthPDF(selMonth.key, selMonth.label, orders, expenses, kasirs, menus)} style={{background:"var(--blue-dim)",border:"1px solid rgba(91,141,239,0.25)",borderRadius:12,padding:"9px 14px",color:"var(--blue)",display:"flex",alignItems:"center",gap:7,fontWeight:700,fontSize:13,flexShrink:0}}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3"/></svg>
                PDF
              </button>
            </div>
            {(()=>{const {pemasukan,pengeluaran,modalMitra,totalKeluar,kas}=getMonthSummary(selMonth.key);return(
              <>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                {[{label:"Pemasukan",val:pemasukan,color:"var(--green)",bg:"var(--green-dim)"},{label:"Total Keluar",val:totalKeluar,color:"var(--red)",bg:"var(--red-dim)"},{label:"Kas Bersih",val:kas,color:kas>=0?"var(--amber)":"var(--red)",bg:kas>=0?"var(--amber-dim)":"var(--red-dim)"}].map(s=>(
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
            {daysInMonth.length===0?(
              <Card style={{textAlign:"center",padding:28}}><p style={{color:"var(--muted)"}}>Tidak ada data di bulan ini</p></Card>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:8,flex:"0 0 auto"}}>
                {daysInMonth.map((ds,i)=>{
                  const {pemasukan,totalKeluar,kas}=getDaySummary(ds);
                  const isToday=ds===businessDate;
                  return(
                    <div key={ds} className={`fu s${Math.min(i+1,5)}`} onClick={()=>setSelDay(ds)} style={{background:"var(--card)",border:`1px solid ${isToday?"rgba(245,166,35,0.25)":"var(--border)"}`,borderRadius:12,padding:"13px 15px",cursor:"pointer"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <div>
                          <p style={{color:isToday?"var(--amber)":"var(--text)",fontWeight:700,fontSize:14}}>{isToday?"Hari Ini":fmtShort(ds)}</p>
                          <p style={{color:"var(--muted)",fontSize:11,marginTop:2}}>{fmtFull(ds)}</p>
                        </div>
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                      </div>
                      <div style={{display:"flex",gap:7}}>
                        <div style={{flex:1,background:"var(--green-dim)",borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                          <p style={{color:"var(--muted)",fontSize:9,marginBottom:1}}>Masuk</p>
                          <p style={{color:"var(--green)",fontWeight:700,fontSize:11}}>{rupiah(pemasukan)}</p>
                        </div>
                        <div style={{flex:1,background:"var(--red-dim)",borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                          <p style={{color:"var(--muted)",fontSize:9,marginBottom:1}}>Total Keluar</p>
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
        ):(
          <div className="fi">
            <div style={{marginBottom:14}}>
              <p style={{color:"var(--muted)",fontSize:12}}>Pilih bulan untuk melihat detail & laporan PDF</p>
            </div>
            {months.length===0?(
              <Card style={{textAlign:"center",padding:28}}><p style={{color:"var(--muted)"}}>Belum ada data</p></Card>
            ):(
              <MonthList months={months} onSelect={setSelMonth} getMonthSummary={getMonthSummary}/>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default KeuanganScreen;
