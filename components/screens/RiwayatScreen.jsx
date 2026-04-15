"use client";
import { memo, useState } from "react";
import { orderSessionDate, orderActualPaidAt, compareOrdersNewestFirst, rupiah, fmtTanggalWaktu } from "../lib/helpers.js";
import Card from "../ui/Card.jsx";
import KasirChip from "../ui/KasirChip.jsx";
import PaymentMeta from "../ui/PaymentMeta.jsx";
import ReceiptPrintButton from "../ui/ReceiptPrintButton.jsx";
import { printOrderStrukRiwayat } from "../lib/receipt.js";

// RiwayatScreen — ditampilkan sebagai tab di dalam KeuanganScreen (DayDetail)
// Tapi juga dipakai standalone di Tagihan Riwayat (lihat DayDetail)
// Komponen ini adalah "DayDetail orders list" yang reusable
const RiwayatScreen = memo(({orders, kasirs, receiptSettings, businessDate}) => {
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [pgOrders, setPgOrders] = useState(0);

  const paidOrders = [...orders.filter(o=>o.status==="paid")].sort(compareOrdersNewestFirst);

  const PAGE = 10;
  const total_pages = Math.ceil(paidOrders.length / PAGE);
  const pg = Math.min(pgOrders, Math.max(0, total_pages - 1));
  const slice = paidOrders.slice(pg * PAGE, (pg + 1) * PAGE);

  if(paidOrders.length === 0) {
    return (
      <Card style={{textAlign:"center",padding:20}}>
        <p style={{color:"var(--muted)",fontSize:13}}>Tidak ada transaksi lunas</p>
      </Card>
    );
  }

  return (
    <div>
      {slice.map((o, idx) => {
        const isExpanded = expandedOrderId === o.id;
        return (
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
              <p style={{color:"var(--muted)",fontSize:11,lineHeight:1.4,paddingLeft:30,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {o.items.map(i=>`${i.name} ×${i.qty}`).join(" · ")}
              </p>
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
                  <ReceiptPrintButton
                    onClick={()=>printOrderStrukRiwayat(o, kasirs, receiptSettings)}
                    loadingLabel="Mencetak..."
                    doneLabel="✓ Tercetak"
                    style={{padding:"6px 12px",borderRadius:8,marginLeft:"auto",background:"var(--blue-dim)",border:"1px solid rgba(37,99,235,0.2)",color:"var(--blue)",fontWeight:700,fontSize:11,flexShrink:0}}
                  >
                    Struk
                  </ReceiptPrintButton>
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
    </div>
  );
});

export default RiwayatScreen;
