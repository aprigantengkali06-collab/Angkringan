"use client";
import { memo } from "react";

const CatBar = memo(({cats, active, onChange}) => (
  <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:6,scrollbarWidth:"none"}}>
    {(cats||[]).map(c=>(
      <button key={c} onClick={()=>onChange(c)} style={{
        padding:"6px 16px",borderRadius:99,fontSize:13,fontWeight:600,
        whiteSpace:"nowrap",
        background:active===c?"var(--text)":"rgba(255,255,255,0.85)",
        color:active===c?"#fff":"var(--muted)",
        border:active===c?"none":"1px solid var(--border)",
        boxShadow:active===c?"0 2px 8px rgba(15,23,42,0.15)":"none",
      }}>{c}</button>
    ))}
  </div>
));

export default CatBar;
