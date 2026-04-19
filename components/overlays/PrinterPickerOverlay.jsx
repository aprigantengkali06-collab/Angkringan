"use client";
import { useState, useEffect } from "react";
import { getNativePrinterBridge, isNativePrinterShell } from "../lib/printer.js";

const DOT_COLORS = ["#10B981","#3B82F6","#8B5CF6","#F59E0B","#EF4444","#06B6D4","#EC4899","#F97316"];

const DeviceRow = ({ device, isSelected, onPick, disabled }) => {
  const initial   = (device.name||"?")[0].toUpperCase();
  const colorIdx  = device.address ? device.address.charCodeAt(device.address.length-1)%DOT_COLORS.length : 0;
  const color     = isSelected ? "#10B981" : DOT_COLORS[colorIdx];
  const bgColor   = isSelected ? "rgba(16,185,129,0.10)" : "rgba(148,163,184,0.10)";
  return (
    <button onClick={()=>!disabled&&onPick(device)} disabled={disabled} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 16px",borderRadius:14,background:isSelected?"rgba(16,185,129,0.06)":"var(--card)",border:`1.5px solid ${isSelected?"rgba(16,185,129,0.30)":"var(--border)"}`,cursor:disabled?"default":"pointer",textAlign:"left",width:"100%",opacity:disabled?0.55:1,transition:"all .12s",WebkitTapHighlightColor:"transparent"}}>
      <div style={{width:40,height:40,borderRadius:12,background:bgColor,border:`2px solid ${color}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,position:"relative"}}>
        <span style={{color,fontWeight:800,fontSize:15}}>{initial}</span>
        <span style={{position:"absolute",bottom:-2,right:-2,width:12,height:12,borderRadius:"50%",background:isSelected?"#10B981":"#CBD5E1",border:"2px solid #fff"}}/>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <p style={{color:"var(--text)",fontWeight:700,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
          {device.name||"Unknown Device"}
          {isSelected&&<span style={{color:"#10B981",fontSize:11,fontWeight:600,marginLeft:6}}>✓ Aktif</span>}
        </p>
        <p style={{color:"var(--muted)",fontSize:11,marginTop:1,fontFamily:"monospace"}}>{device.address}</p>
      </div>
      {!disabled&&<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={isSelected?"#10B981":"var(--muted)"} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>}
    </button>
  );
};

const PrinterPickerOverlay = ({ printerStatus, onRefresh, onClear, onClose, onPicked }) => {
  const [devices,    setDevices]    = useState(null);
  const [loadErr,    setLoadErr]    = useState("");
  const [picking,    setPicking]    = useState(false);
  const [pickErr,    setPickErr]    = useState("");
  const [pickedAddr, setPickedAddr] = useState(null);

  const currentAddr = printerStatus?.printerAddress || null;
  const isNative    = isNativePrinterShell();

  useEffect(() => { if(!isNative){setDevices([]);return;} fetchDevices(); }, []); // eslint-disable-line

  const fetchDevices = async () => {
    setLoadErr(""); setDevices(null);
    try {
      const bridge = getNativePrinterBridge();
      if(!bridge){ setLoadErr("Plugin printer tidak ditemukan. Pastikan APK versi terbaru."); setDevices([]); return; }
      const result = await bridge.getPairedDevices();
      if(!result?.ok){ setLoadErr(result?.message||"Gagal ambil daftar perangkat Bluetooth."); setDevices([]); return; }
      let list=[];
      try{ list=JSON.parse(result.devices||"[]"); }catch{}
      setDevices(list);
    } catch(err){ setLoadErr(err?.message||"Terjadi kesalahan."); setDevices([]); }
  };

  const handlePick = async (device) => {
    if(picking) return;
    setPicking(true); setPickErr("");
    try {
      const bridge = getNativePrinterBridge();
      if(!bridge){ setPickErr("Plugin tidak ditemukan."); return; }
      const result = await bridge.setPrinterByAddress(device.address, device.name);
      if(result?.ok){ setPickedAddr(device.address); onPicked?.(device); setTimeout(()=>onClose(), 600); }
      else setPickErr(result?.message||"Gagal menyimpan printer. Coba lagi.");
    } catch(err){ setPickErr(err?.message||"Terjadi kesalahan."); }
    finally{ setPicking(false); }
  };

  const handleClear = async () => {
    if(picking) return;
    setPicking(true);
    try { const bridge=getNativePrinterBridge(); if(bridge?.clearPrinter) await bridge.clearPrinter(); onClear?.(); setTimeout(()=>onRefresh?.(),300); }
    catch{} finally{ setPicking(false); }
  };

  const subtitle = !isNative ? "Hanya tersedia di APK Android"
    : devices===null ? "Mengambil daftar perangkat..."
    : devices.length===0 ? "Tidak ada perangkat paired"
    : `${devices.length} printer Bluetooth Classic siap dipilih`;

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:650,background:"rgba(15,23,42,0.45)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:480,background:"var(--bg2)",borderRadius:"22px 22px 0 0",padding:`0 0 calc(env(safe-area-inset-bottom) + 16px)`,boxShadow:"0 -8px 48px rgba(15,23,42,0.22)",display:"flex",flexDirection:"column",maxHeight:"88vh"}}>
        {/* Handle */}
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 0"}}><div style={{width:44,height:4,borderRadius:99,background:"#D1D5DB"}}/></div>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px 12px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:14,background:"rgba(254,243,199,0.9)",border:"1px solid rgba(245,158,11,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🖨️</div>
            <div>
              <p className="sora" style={{fontSize:17,fontWeight:800,color:"var(--text)"}}>Pilih Printer Struk</p>
              <p style={{fontSize:12,color:devices?.length?"var(--amber)":"var(--muted)",marginTop:1,fontWeight:600}}>{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} style={{width:38,height:38,borderRadius:11,border:"1px solid var(--border)",background:"rgba(255,255,255,0.9)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)"}}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style={{height:1,background:"var(--border)",margin:"0 20px"}}/>
        {/* Body */}
        <div style={{flex:1,overflowY:"auto",padding:"14px 20px"}}>
          {/* Loading */}
          {devices===null&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 0",gap:12}}>
              <div style={{width:36,height:36,borderRadius:"50%",border:"3px solid var(--amber)",borderTopColor:"transparent",animation:"spin 0.8s linear infinite"}}/>
              <p style={{color:"var(--muted)",fontSize:13}}>Mengambil daftar printer Bluetooth...</p>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}
          {/* Bukan APK */}
          {!isNative&&devices!==null&&(
            <div style={{textAlign:"center",padding:"32px 0"}}>
              <p style={{fontSize:32,marginBottom:10}}>📱</p>
              <p style={{color:"var(--text)",fontWeight:700,fontSize:14,marginBottom:6}}>Fitur khusus APK Android</p>
              <p style={{color:"var(--muted)",fontSize:12,lineHeight:1.6}}>Printer Bluetooth Classic hanya aktif saat dijalankan dari APK. Build dulu dengan Android Studio.</p>
            </div>
          )}
          {/* Kosong / error */}
          {isNative&&devices!==null&&devices.length===0&&(
            <div style={{textAlign:"center",padding:"28px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
              {loadErr
                ?<><p style={{fontSize:28}}>⚠️</p><p style={{color:"var(--red)",fontWeight:600,fontSize:13}}>{loadErr}</p></>
                :<><p style={{fontSize:28}}>🔍</p><p style={{color:"var(--text)",fontWeight:700,fontSize:13,marginBottom:4}}>Tidak ada perangkat paired</p><p style={{color:"var(--muted)",fontSize:12,lineHeight:1.6}}>Pair printer dulu di Pengaturan Android → Bluetooth, lalu kembali ke sini.</p></>
              }
              <button onClick={fetchDevices} style={{marginTop:8,padding:"10px 24px",borderRadius:12,background:"var(--amber)",color:"#fff",border:"none",fontWeight:700,fontSize:13,cursor:"pointer"}}>🔄 Coba Lagi</button>
            </div>
          )}
          {/* Device list */}
          {isNative&&devices&&devices.length>0&&(
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {devices.map(dev=>(
                <DeviceRow key={dev.address} device={dev} isSelected={pickedAddr?dev.address===pickedAddr:dev.address===currentAddr} onPick={handlePick} disabled={picking}/>
              ))}
            </div>
          )}
          {pickErr&&<p style={{color:"var(--red)",fontSize:12,fontWeight:600,textAlign:"center",marginTop:12}}>⚠ {pickErr}</p>}
        </div>
        {/* Footer */}
        <div style={{padding:"10px 20px 4px",borderTop:"1px solid var(--border)",display:"flex",gap:10}}>
          <button onClick={fetchDevices} disabled={picking||devices===null} style={{flex:1,padding:"11px",borderRadius:12,border:"1px solid var(--border)",background:"transparent",color:"var(--muted)",fontWeight:600,fontSize:13,cursor:"pointer",opacity:picking||devices===null?0.5:1}}>🔄 Refresh</button>
          {currentAddr&&<button onClick={handleClear} disabled={picking} style={{flex:1,padding:"11px",borderRadius:12,border:"1px solid rgba(239,68,68,0.3)",background:"rgba(239,68,68,0.06)",color:"var(--red)",fontWeight:600,fontSize:13,cursor:"pointer",opacity:picking?0.5:1}}>🗑 Hapus Printer</button>}
        </div>
      </div>
    </div>
  );
};

export default PrinterPickerOverlay;
