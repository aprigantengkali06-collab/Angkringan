"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const SuccessOverlay = ({message, onDone, onPrint, onBack, backLabel, kembalian, type}) => {
  const [printState,setPrintState] = useState("idle");
  const printTimerRef = useRef(null);

  useEffect(()=>()=>{
    if(printTimerRef.current) window.clearTimeout(printTimerRef.current);
  },[]);

  const handlePrint = useCallback(async ()=>{
    if(!onPrint || printState === "loading") return;
    if(printTimerRef.current) window.clearTimeout(printTimerRef.current);
    setPrintState("loading");
    try{
      const result = await Promise.resolve(onPrint());
      if(result?.ok === false){
        setPrintState("idle");
        return;
      }
      setPrintState("done");
      printTimerRef.current = window.setTimeout(()=>setPrintState("idle"), 1600);
    }catch(err){
      console.warn("Receipt print failed", err);
      setPrintState("idle");
    }
  },[onPrint, printState]);

  const printLabel = printState === "loading"
    ? "Menyiapkan cetak..."
    : printState === "done"
      ? "✓ Perintah cetak dikirim"
      : "🧾 Cetak Struk";

  return (
    <div style={{
      position:"fixed",inset:0,zIndex:9999,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      background:"rgba(0,0,0,0.65)",backdropFilter:"blur(8px)",
      animation:"fadeIn 0.2s ease both",
      padding:"0 20px"
    }}>
      <div className="fu" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,width:"100%",maxWidth:340}}>
        <div style={{animation:"popIn 0.3s ease both",display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
          <div style={{width:72,height:72,borderRadius:99,background:"var(--green)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 12px 32px rgba(16,185,129,0.35)"}}>
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{color:"#fff",fontSize:20,fontWeight:800,letterSpacing:"-0.3px"}}>
            {type==="nanti"?"Pesanan Dicatat!":type==="tambah"?"Item Ditambahkan!":message||"Pembayaran Lunas!"}
          </span>
          {type!=="nanti"&&type!=="tambah"&&kembalian!=null&&(
            <div style={{background:"rgba(255,255,255,0.14)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:14,padding:"12px 24px",textAlign:"center"}}>
              <p style={{color:"rgba(255,255,255,0.7)",fontSize:12,marginBottom:4}}>Kembalian</p>
              <p style={{color:"#fff",fontSize:28,fontWeight:800,letterSpacing:"-0.5px"}}>Rp {Number(kembalian).toLocaleString("id-ID")}</p>
            </div>
          )}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%"}}>
          {onPrint&&(
            <button onClick={handlePrint} disabled={printState === "loading"} style={{
              width:"100%",padding:"14px",borderRadius:14,border:"none",
              background:printState === "done" ? "linear-gradient(135deg,#ECFDF5 0%,#DCFCE7 100%)" : "linear-gradient(135deg,#fff 0%,#F0FDF4 100%)",
              color:"var(--green)",fontWeight:800,fontSize:15,
              display:"flex",alignItems:"center",justifyContent:"center",gap:9,
              boxShadow:"0 8px 20px rgba(0,0,0,0.18)",cursor:printState === "loading" ? "wait" : "pointer",
              opacity:printState === "loading" ? 0.88 : 1
            }}>
              {printState === "done" ? (
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
              ) : (
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9V2h12v7 M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2 M6 14h12v8H6z"/>
                </svg>
              )}
              {printLabel}
            </button>
          )}
          <button onClick={onBack||onDone} style={{
            width:"100%",padding:"13px",borderRadius:14,
            border:"1px solid rgba(255,255,255,0.28)",
            background:"rgba(255,255,255,0.14)",
            color:"#fff",fontWeight:700,fontSize:14,
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,
            cursor:"pointer"
          }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5 M12 19l-7-7 7-7"/>
            </svg>
            {backLabel||"Kembali"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessOverlay;
