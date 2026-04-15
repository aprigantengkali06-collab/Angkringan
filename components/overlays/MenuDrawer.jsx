"use client";
import { BRAND_LOGO } from "../lib/constants.js";

const MenuDrawer = ({open,onClose,items,screen,onNavigate,isOwner,onOpenTim,onOpenMenu,onOpenData,onOpenPrinter,onLogout}) => {
  if(!open) return null;
  return(
    <div style={{position:"absolute",inset:0,zIndex:450,background:"rgba(15,23,42,0.34)",backdropFilter:"blur(4px)",display:"flex"}} onClick={onClose}>
      <div className="fu" style={{width:"min(86vw,320px)",height:"100dvh",maxHeight:"100dvh",background:"linear-gradient(180deg,#FFFFFF 0%,#F8FAFC 100%)",borderRight:"1px solid var(--border)",padding:"18px 14px calc(env(safe-area-inset-bottom) + 20px)",display:"flex",flexDirection:"column",gap:12,boxShadow:"0 22px 50px rgba(15,23,42,0.18)",overflowY:"auto",WebkitOverflowScrolling:"touch"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:14,background:"rgba(255,255,255,0.92)",border:"1px solid rgba(215,226,240,0.95)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 10px 22px rgba(15,23,42,0.08)"}}>
              <img src={BRAND_LOGO} alt="Logo usaha" style={{width:28,height:28,objectFit:"contain"}}/>
            </div>
            <div>
              <p style={{fontSize:11,color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>Navigasi</p>
              <p className="sora" style={{fontSize:18,fontWeight:800,color:"var(--text)",marginTop:3}}>POS Kasir</p>
            </div>
          </div>
          <button onClick={onClose} style={{width:40,height:40,borderRadius:12,border:"1px solid var(--border)",background:"rgba(255,255,255,0.88)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)"}}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {items.map(({k,label,d})=>{
            const active = screen===k;
            return(
              <button key={k} onClick={()=>{onNavigate(k);onClose();}} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 14px",borderRadius:16,border:`1px solid ${active?"rgba(245,158,11,0.22)":"var(--border)"}`,
                background:active?"linear-gradient(180deg, rgba(245,158,11,0.12) 0%, rgba(255,255,255,0.98) 100%)":"rgba(255,255,255,0.88)",color:active?"var(--text)":"var(--muted)",boxShadow:active?"0 14px 28px rgba(245,158,11,0.08)":"none"}}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active?2.2:1.9} strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
                <span style={{fontSize:14,fontWeight:active?800:700}}>{label}</span>
              </button>
            );
          })}
        </div>
        {isOwner&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(3, minmax(0,1fr))",gap:8,flex:"0 0 auto"}}>
            <button onClick={()=>{onClose();onOpenTim();}} style={{padding:"12px 10px",borderRadius:14,background:"var(--blue-dim)",color:"var(--blue)",border:"1px solid rgba(37,99,235,0.18)",fontWeight:800,fontSize:13}}>Tim</button>
            <button onClick={()=>{onClose();onOpenMenu();}} style={{padding:"12px 10px",borderRadius:14,background:"var(--amber-dim)",color:"var(--amber)",border:"1px solid rgba(245,158,11,0.18)",fontWeight:800,fontSize:13}}>Menu</button>
            <button onClick={()=>{onClose();onOpenData();}} style={{padding:"12px 10px",borderRadius:14,background:"var(--green-dim)",color:"var(--green)",border:"1px solid rgba(16,185,129,0.18)",fontWeight:800,fontSize:13}}>Data</button>
          </div>
        )}
        <button onClick={()=>{onClose();onOpenPrinter();}} style={{padding:"12px 14px",borderRadius:16,background:"rgba(254,243,199,0.85)",color:"var(--amber)",border:"1px solid rgba(245,158,11,0.22)",fontWeight:800,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8,flex:"0 0 auto"}}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z"/></svg>
          Pilih Printer Struk
        </button>
        <div style={{marginTop:"auto",paddingTop:4,flex:"0 0 auto"}}>
          <button onClick={()=>{onClose();onLogout();}} style={{width:"100%",padding:"13px 14px",borderRadius:16,background:"rgba(239,68,68,0.10)",color:"var(--red)",border:"1px solid rgba(239,68,68,0.18)",fontWeight:800,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9"/></svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuDrawer;
