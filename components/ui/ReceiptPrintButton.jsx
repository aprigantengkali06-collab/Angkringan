"use client";
import { memo, useState, useEffect, useRef, useCallback } from "react";

const ReceiptPrintButton = memo(({onClick, children="🧾 Cetak Struk", loadingLabel="Menyiapkan cetak...", doneLabel="✓ Terkirim ke printer", style={}, disabled=false}) => {
  const [state,setState] = useState("idle");
  const timerRef = useRef(null);

  useEffect(()=>()=>{
    if(timerRef.current) window.clearTimeout(timerRef.current);
  },[]);

  const handleClick = useCallback(async e=>{
    e?.stopPropagation?.();
    if(disabled || state === "loading") return;
    if(timerRef.current) window.clearTimeout(timerRef.current);
    setState("loading");
    try{
      const result = await Promise.resolve(onClick?.(e));
      if(result?.ok === false){
        setState("idle");
        return;
      }
      setState("done");
      timerRef.current = window.setTimeout(()=>setState("idle"), 1600);
    }catch(err){
      console.warn("Receipt print failed", err);
      setState("idle");
    }
  },[disabled, onClick, state]);

  const label = state === "loading" ? loadingLabel : state === "done" ? doneLabel : children;

  return (
    <button onClick={handleClick} disabled={disabled || state === "loading"} style={{
      display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,
      cursor:disabled ? "not-allowed" : (state === "loading" ? "wait" : "pointer"),
      opacity:disabled ? 0.6 : 1,
      transition:"all .16s ease",
      ...style
    }}>
      {state === "done" ? (
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
      ) : (
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7 M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2 M6 14h12v8H6z"/></svg>
      )}
      <span>{label}</span>
    </button>
  );
});

export default ReceiptPrintButton;
