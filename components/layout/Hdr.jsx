"use client";
import { memo } from "react";

const Hdr = memo(({title,sub,left,right}) => (
  <div className="hdr-shell glass-card" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,
    borderBottom:"1px solid rgba(215,226,240,0.92)",flexShrink:0,boxShadow:"0 8px 26px rgba(15,23,42,0.05)",minHeight:68}}>
    <div style={{display:"flex",alignItems:"center",gap:12,minWidth:0,flex:1}}>
      {left}
      <div style={{minWidth:0}}>
        <h2 className="sora" style={{fontSize:16,fontWeight:800,color:"var(--text)",letterSpacing:"-0.03em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{title}</h2>
        {sub&&<p style={{fontSize:10,color:"var(--muted)",marginTop:2,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{sub}</p>}
      </div>
    </div>
    {right}
  </div>
));

export default Hdr;
