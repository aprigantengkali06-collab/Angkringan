"use client";
import { rupiah } from "../lib/helpers.js";

const MoneyInput = ({label, value, onChange, total=0}) => {
  const display = value ? Number(value).toLocaleString('id-ID') : '';
  const handleInput = e => { const raw = e.target.value.replace(/\D/g,''); onChange(raw); };
  const presets = [15000,20000,50000,100000];
  return (
    <div style={{display:'flex',flexDirection:'column',gap:6}}>
      {label&&<label style={{fontSize:11,color:'var(--muted)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>{label}</label>}
      <div style={{display:'flex',alignItems:'center',background:'rgba(255,255,255,0.88)',border:'1px solid var(--border)',borderRadius:14,overflow:'hidden',boxShadow:'inset 0 1px 0 rgba(255,255,255,0.7)'}}>
        <span style={{padding:'0 6px 0 14px',color:'var(--muted)',fontSize:14,flexShrink:0,fontWeight:600}}>Rp</span>
        <input type="text" inputMode="numeric" value={display} onChange={handleInput} placeholder="0" style={{paddingLeft:'4px'}}/>
      </div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:2}}>
        {total>0&&<button type="button" onClick={()=>onChange(String(total))} style={{padding:'5px 11px',borderRadius:8,background:'var(--green-dim)',color:'var(--green)',border:'1px solid rgba(16,185,129,0.3)',fontSize:12,fontWeight:700,flexShrink:0,cursor:'pointer'}}>✓ Uang Pas</button>}
        {presets.map(a=><button type="button" key={a} onClick={()=>onChange(String(a))} style={{padding:'5px 10px',borderRadius:8,background:'var(--card2)',color:'var(--muted)',border:'1px solid var(--border)',fontSize:12,fontWeight:600,flexShrink:0,cursor:'pointer'}}>{a/1000}rb</button>)}
      </div>
    </div>
  );
};

export default MoneyInput;
