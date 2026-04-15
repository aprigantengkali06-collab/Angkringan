"use client";
import { memo } from "react";
import { orderActualPaidAt, orderSessionDate, fmtTanggalWaktu, fmtShort, hasCrossDatePayment } from "../lib/helpers.js";

const PaymentMeta = memo(({order}) => {
  const actualPaidAt = orderActualPaidAt(order);
  const actualLabel = fmtTanggalWaktu(actualPaidAt);
  const reportDate = orderSessionDate(order);
  return (
    <>
      {actualLabel && <p style={{color:"var(--muted)",fontSize:10,marginTop:1}}>🕐 Dibayar {actualLabel}</p>}
      {hasCrossDatePayment(order) && reportDate && (
        <p style={{color:"var(--amber)",fontSize:10,marginTop:2,fontWeight:600}}>📒 Dibukukan ke {fmtShort(reportDate)}</p>
      )}
    </>
  );
});

export default PaymentMeta;
