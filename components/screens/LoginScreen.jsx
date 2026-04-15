"use client";
import { memo, useState } from "react";
import { BRAND_LOGO, DEFAULT_OWNER_PASSWORD } from "../lib/constants.js";
import Card from "../ui/Card.jsx";
import Btn from "../ui/Btn.jsx";
import TxtInput from "../ui/TxtInput.jsx";

const LoginScreen = memo(({onLogin, kasirs, ownerPassword}) => {
  const [role,setRole] = useState(null);
  const [selKasir,setSelKasir] = useState(null);
  const [pw,setPw] = useState("");
  const [err,setErr] = useState("");
  const canProceed = role==="owner" || (role==="kasir" && (kasirs.length===1 || selKasir));
  const go = () => {
    if(role==="owner"){
      if(pw===(ownerPassword||DEFAULT_OWNER_PASSWORD)){
        onLogin({id:"owner",name:"Owner",role:"owner"});
      }else{
        setErr("Password owner salah.");
        setTimeout(()=>setErr(""),2000);
      }
    } else {
      const k = kasirs.length===1 ? kasirs[0] : kasirs.find(k=>k.id===selKasir);
      if(!k){ setErr("Pilih kasir dulu."); return; }
      if(pw===k.password){
        onLogin({id:k.id,name:k.name,role:"kasir"});
      }else{
        setErr("Password kasir salah.");
        setTimeout(()=>setErr(""),2000);
      }
    }
  };
  return(
    <div className="login-screen" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px 32px",background:"linear-gradient(180deg,#F0F5FF 0%,#E8EFFF 100%)"}}>
      <div className="login-panel" style={{width:"100%",maxWidth:400}}>
        <div className="login-header" style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:72,height:72,borderRadius:22,background:"rgba(255,255,255,0.92)",border:"1px solid rgba(215,226,240,0.95)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:"0 18px 34px rgba(15,23,42,0.12)"}}>
            <img src={BRAND_LOGO} alt="Logo" style={{width:48,height:48,objectFit:"contain"}}/>
          </div>
          <h1 className="sora" style={{fontSize:24,fontWeight:800,color:"var(--text)",letterSpacing:"-0.5px"}}>Angkringan POS</h1>
          <p style={{color:"var(--muted)",fontSize:14,marginTop:6}}>Masuk untuk mulai berjualan</p>
        </div>
        <Card className="login-card fu" style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <p style={{fontSize:11,color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Masuk sebagai</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
              {[{k:"owner",label:"👑 Owner",desc:"Akses penuh"},{k:"kasir",label:"🧑‍💼 Kasir",desc:"Akses kasir"}].map(r=>(
                <button key={r.k} onClick={()=>{setRole(r.k);setSelKasir(null);setPw("");setErr("");}} style={{
                  padding:"13px 10px",borderRadius:14,textAlign:"left",
                  background:role===r.k?"linear-gradient(135deg,rgba(245,158,11,0.14),rgba(255,255,255,0.98))":"rgba(255,255,255,0.78)",
                  border:`1.5px solid ${role===r.k?"rgba(245,158,11,0.35)":"var(--border)"}`,
                  boxShadow:role===r.k?"0 6px 18px rgba(245,158,11,0.12)":"none",
                  cursor:"pointer"
                }}>
                  <p style={{fontWeight:700,fontSize:14,color:"var(--text)"}}>{r.label}</p>
                  <p style={{fontSize:11,color:"var(--muted)",marginTop:3}}>{r.desc}</p>
                </button>
              ))}
            </div>
          </div>
          {role==="kasir"&&kasirs.length>1&&(
            <div className="fi">
              <p style={{fontSize:11,color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Pilih Kasir</p>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {kasirs.map((k,i)=>(
                  <button key={k.id} onClick={()=>setSelKasir(k.id)} style={{
                    padding:"11px 14px",borderRadius:12,textAlign:"left",
                    background:selKasir===k.id?"linear-gradient(135deg,rgba(245,158,11,0.12),rgba(255,255,255,0.98))":"rgba(255,255,255,0.78)",
                    border:`1.5px solid ${selKasir===k.id?"rgba(245,158,11,0.35)":"var(--border)"}`,
                    cursor:"pointer",display:"flex",alignItems:"center",gap:10
                  }}>
                    <div style={{width:32,height:32,borderRadius:9,background:selKasir===k.id?"var(--amber)":"var(--amber-dim)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <span style={{color:selKasir===k.id?"#fff":"var(--amber)",fontWeight:800,fontSize:13}}>{k.name[0]}</span>
                    </div>
                    <span style={{fontWeight:700,fontSize:14,color:"var(--text)"}}>{k.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {role==="kasir"&&kasirs.length===1&&(
            <div className="fi" style={{marginBottom:10,padding:"10px 12px",background:"var(--card2)",borderRadius:10}}>
              <p style={{color:"var(--muted)",fontSize:12}}>Login sebagai <strong style={{color:"var(--text)"}}>{kasirs[0].name}</strong></p>
            </div>
          )}
          {canProceed&&(
            <div className="fi" style={{display:"flex",flexDirection:"column",gap:12}}>
              <TxtInput label="Password" type="password" value={pw} onChange={setPw} placeholder="Masukkan password"/>
              {err&&<p style={{color:"var(--red)",fontSize:13,textAlign:"center"}}>{err}</p>}
              <Btn onClick={go} disabled={!pw} full>Masuk →</Btn>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
});

export default LoginScreen;
