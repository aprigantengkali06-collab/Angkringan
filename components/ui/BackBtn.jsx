"use client";
import { memo } from "react";

const BackBtn = memo(({onClick}) => (
  <button onClick={onClick} style={{color:"var(--amber)",display:"flex",alignItems:"center",gap:6,
    fontSize:13,fontWeight:600,background:"none",border:"none",marginBottom:14}}>
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5 M12 19l-7-7 7-7"/>
    </svg>
    Kembali
  </button>
));

export default BackBtn;
