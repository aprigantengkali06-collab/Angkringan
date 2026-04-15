"use client";
import { memo } from "react";

const Card = memo(({children,style={},className=""}) => (
  <div className={className} style={{
    background:"linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
    border:"1px solid rgba(215,226,240,0.95)",borderRadius:20,padding:16,
    boxShadow:"0 14px 34px rgba(15,23,42,0.06)",
    ...style
  }}>{children}</div>
));

export default Card;
