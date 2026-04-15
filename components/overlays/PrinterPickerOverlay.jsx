"use client";
import PrinterToolsCard from "./PrinterToolsCard.jsx";

const PrinterPickerOverlay = ({printerStatus, printerBusy, onSelect, onRefresh, onClear, onClose}) => (
  <div style={{position:"fixed",inset:0,zIndex:650,background:"rgba(15,23,42,0.34)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
    <div className="fu" style={{width:"min(100%, 440px)",background:"linear-gradient(180deg,#FFFFFF 0%,#F8FAFC 100%)",border:"1px solid var(--border)",borderRadius:24,padding:18,boxShadow:"0 24px 60px rgba(15,23,42,0.20)",display:"flex",flexDirection:"column",gap:14}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:44,height:44,borderRadius:14,background:"rgba(254,243,199,0.9)",border:"1px solid rgba(245,158,11,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🖨️</div>
          <div>
            <p className="sora" style={{fontSize:18,fontWeight:800,color:"var(--text)"}}>Printer Struk</p>
            <p style={{fontSize:12,color:"var(--muted)",lineHeight:1.5,marginTop:2}}>Pilih printer Bluetooth untuk cetak struk</p>
          </div>
        </div>
        <button onClick={onClose} style={{width:40,height:40,borderRadius:12,border:"1px solid var(--border)",background:"rgba(255,255,255,0.92)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)",flexShrink:0}}>
          <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <PrinterToolsCard status={printerStatus} busy={printerBusy} onSelect={onSelect} onRefresh={onRefresh} onClear={onClear}/>
    </div>
  </div>
);

export default PrinterPickerOverlay;
