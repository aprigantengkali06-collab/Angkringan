"use client";
import Card from "../ui/Card.jsx";
import Btn from "../ui/Btn.jsx";
import { getPrinterBadgeMeta, defaultPrinterStatus } from "../lib/printer.js";

const PrinterToolsCard = ({status,busy,onSelect,onRefresh,onClear}) => {
  const meta = getPrinterBadgeMeta(status || defaultPrinterStatus());
  const checkedLabel = status?.checkedAt
    ? new Date(status.checkedAt).toLocaleTimeString("id-ID", {hour:"2-digit", minute:"2-digit", second:"2-digit"})
    : "belum dicek";
  return (
    <Card style={{display:"flex",flexDirection:"column",gap:12,border:`1px solid ${meta.dot}22`,background:"linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)"}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"flex-start"}}>
        <div>
          <p className="sora" style={{fontSize:16,fontWeight:800,color:"var(--text)"}}>Printer struk Bluetooth</p>
          <p style={{fontSize:12,color:"var(--muted)",lineHeight:1.6,marginTop:4}}>Untuk printer thermal Bluetooth Classic / SPP. Bukan untuk BLE generic.</p>
        </div>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:12,background:meta.bg,color:meta.color,fontWeight:800,fontSize:12,flexShrink:0}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:meta.dot}}/>
          {busy || meta.label}
        </div>
      </div>
      <div style={{display:"grid",gap:8,padding:"12px 14px",borderRadius:16,background:"rgba(255,255,255,0.86)",border:"1px solid var(--border)"}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:12,fontSize:12}}><span style={{color:"var(--muted)"}}>Printer</span><strong style={{color:"var(--text)",textAlign:"right"}}>{status?.printerName || "Belum dipilih"}</strong></div>
        <div style={{display:"flex",justifyContent:"space-between",gap:12,fontSize:12}}><span style={{color:"var(--muted)"}}>Alamat</span><span style={{color:"var(--text)",fontWeight:600,textAlign:"right"}}>{status?.printerAddress || "-"}</span></div>
        <div style={{display:"flex",justifyContent:"space-between",gap:12,fontSize:12}}><span style={{color:"var(--muted)"}}>Bluetooth</span><span style={{color:"var(--text)",fontWeight:700,textAlign:"right"}}>{status?.nativeShell ? (status?.bluetoothEnabled ? "Aktif" : "Tidak aktif") : "Tidak tersedia di browser"}</span></div>
        <div style={{display:"flex",justifyContent:"space-between",gap:12,fontSize:12}}><span style={{color:"var(--muted)"}}>Update live</span><span style={{color:"var(--text)",fontWeight:700,textAlign:"right"}}>{checkedLabel}</span></div>
        <div style={{paddingTop:4,borderTop:"1px dashed var(--border)"}}>
          <p style={{fontSize:12,color:meta.color,fontWeight:700}}>{status?.message || meta.label}</p>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10}}>
        <Btn onClick={onSelect} disabled={!!busy || !status?.nativeShell}>🖨️ Pilih Printer</Btn>
        <Btn onClick={onRefresh} v="ghost" disabled={!!busy || !status?.nativeShell}>🔄 Cek Status</Btn>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <Btn onClick={onClear} v="danger" sm disabled={!!busy || !status?.nativeShell || !status?.selected}>Hapus Printer Tersimpan</Btn>
        <p style={{fontSize:11,color:"var(--muted)",lineHeight:1.6,flex:1,minWidth:180}}>Status live akan dicek otomatis berkala selama aplikasi dibuka. Saat status <strong style={{color:"var(--green)"}}>Printer siap</strong>, aplikasi sudah bisa lanjut cetak struk.</p>
      </div>
    </Card>
  );
};

export default PrinterToolsCard;
