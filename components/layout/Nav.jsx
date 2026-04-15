"use client";
import { memo } from "react";
import { BRAND_LOGO } from "../lib/constants.js";

const NAV_OWNER_ITEMS=[
  {k:"home",label:"Dashboard",d:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10"},
  {k:"pos",label:"Kasir",d:"M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-3 M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M9 7h6"},
  {k:"tagihan",label:"Tagihan",d:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"},
  {k:"keuangan",label:"Keuangan",d:"M12 2v20 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"},
];
const NAV_KASIR_ITEMS=[
  {k:"home",label:"Dashboard",d:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10"},
  {k:"pos",label:"Kasir",d:"M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-3 M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M9 7h6"},
  {k:"tagihan",label:"Tagihan",d:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"},
];
export const getNavItems = role => role==="owner" ? NAV_OWNER_ITEMS : NAV_KASIR_ITEMS;

const Nav = memo(({screen,set,role}) => {
  const items = getNavItems(role);
  return(
    <div className="nav-shell" style={{position:"sticky",bottom:0,background:"rgba(255,255,255,0.78)",backdropFilter:"blur(20px)",
      borderTop:"1px solid var(--border)",display:"flex",padding:"10px 10px 14px",zIndex:100,flexShrink:0,gap:8}}>
      <div className="nav-brand">
        <div style={{width:52,height:52,borderRadius:18,background:"rgba(255,255,255,0.92)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 18px 34px rgba(15,23,42,0.12)",border:"1px solid rgba(215,226,240,0.95)"}}>
          <img src={BRAND_LOGO} alt="Logo usaha" style={{width:34,height:34,objectFit:"contain"}}/>
        </div>
      </div>
      {items.map(({k,label,d})=>{
        const a=screen===k;
        return(
          <button key={k} className={`nav-btn ${a?"active":""}`} onClick={()=>set(k)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
            justifyContent:"center",gap:5,padding:"10px 0",borderRadius:18,color:a?"var(--text)":"var(--muted)",background:a?"linear-gradient(180deg, rgba(245,158,11,0.14) 0%, rgba(255,255,255,0.92) 100%)":"transparent",boxShadow:a?"0 12px 24px rgba(15,23,42,0.06)":"none"}}>
            <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.2:1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d={d}/>
            </svg>
            <span style={{fontSize:10,fontWeight:a?800:600,letterSpacing:"0.01em"}}>{label}</span>
          </button>
        );
      })}
    </div>
  );
});

export default Nav;
