"use client";
import { memo } from "react";
import { formatThousands, parseNum } from "../lib/helpers.js";

const TxtInput = memo(({label,value,onChange,placeholder,type="text",prefix,moneyFormat=false}) => {
  const displayVal = moneyFormat ? formatThousands(value) : value;
  const handleChange = e => {
    if(moneyFormat){ onChange(parseNum(e.target.value)); }
    else { onChange(e.target.value); }
  };
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {label&&<label style={{fontSize:11,color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</label>}
      <div style={{display:"flex",alignItems:"center",background:"rgba(255,255,255,0.88)",border:"1px solid var(--border)",borderRadius:14,overflow:"hidden",boxShadow:"inset 0 1px 0 rgba(255,255,255,0.7)"}}>
        {prefix&&<span style={{padding:"0 6px 0 14px",color:"var(--muted)",fontSize:14,flexShrink:0,fontWeight:600}}>{prefix}</span>}
        <input type={moneyFormat?"text":type} inputMode={moneyFormat?"numeric":undefined} value={displayVal} onChange={handleChange} placeholder={placeholder}
          style={{paddingLeft:prefix?"4px":"14px"}}/>
      </div>
    </div>
  );
});

export default TxtInput;
