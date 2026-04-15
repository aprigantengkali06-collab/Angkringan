"use client";
import { memo } from "react";

const Btn = memo(({children,onClick,v="primary",sm,disabled,full,style={}}) => {
  const vs={
    primary:{background:"linear-gradient(135deg,var(--amber) 0%, #F97316 100%)",color:"#fff",boxShadow:"0 14px 28px rgba(245,158,11,0.26)"},
    ghost:{background:"rgba(255,255,255,0.78)",color:"var(--text)",border:"1px solid var(--border)",boxShadow:"0 8px 18px rgba(15,23,42,0.04)"},
    success:{background:"linear-gradient(135deg, rgba(16,185,129,0.16) 0%, rgba(255,255,255,0.95) 100%)",color:"var(--green)",border:"1px solid rgba(16,185,129,0.22)"},
    danger:{background:"linear-gradient(135deg, rgba(239,68,68,0.14) 0%, rgba(255,255,255,0.95) 100%)",color:"var(--red)",border:"1px solid rgba(239,68,68,0.18)"},
    dark:{background:"linear-gradient(135deg,#1E293B 0%, #334155 100%)",color:"#fff",boxShadow:"0 14px 26px rgba(15,23,42,0.16)"},
    pdf:{background:"linear-gradient(135deg, rgba(37,99,235,0.16) 0%, rgba(255,255,255,0.95) 100%)",color:"var(--blue)",border:"1px solid rgba(37,99,235,0.2)"},
  };
  return <button onClick={disabled?undefined:onClick} style={{
    ...vs[v],borderRadius:16,fontWeight:700,fontSize:sm?13:15,
    padding:sm?"9px 14px":"13px 20px",display:"flex",alignItems:"center",
    justifyContent:"center",gap:8,opacity:disabled?0.45:1,
    cursor:disabled?"not-allowed":"pointer",width:full?"100%":undefined,
    letterSpacing:"-0.01em",...style
  }}>{children}</button>;
});

export default Btn;
