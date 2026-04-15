"use client";
import { memo } from "react";
import { KASIR_COLORS, KASIR_COLORS_DIM } from "../lib/constants.js";

const KasirChip = memo(({kasirId, kasirs}) => {
  const k = (kasirs||[]).find(k=>k.id===kasirId);
  if(!k) return null;
  const idx = (kasirs||[]).indexOf(k);
  const bg = KASIR_COLORS_DIM[idx % KASIR_COLORS_DIM.length];
  const color = KASIR_COLORS[idx % KASIR_COLORS.length];
  return (
    <span style={{
      display:"inline-flex",alignItems:"center",gap:4,
      fontSize:11,fontWeight:600,
      background:bg,color:color,
      padding:"2px 10px",borderRadius:99,
      whiteSpace:"nowrap"
    }}>
      {k.name}
    </span>
  );
});

export default KasirChip;
