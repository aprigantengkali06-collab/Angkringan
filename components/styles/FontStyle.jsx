"use client";
import { memo } from "react";

const FontStyle = memo(() => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@400;600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:#F4F7FB;--bg2:#EAF1FF;--card:#FFFFFF;--card2:#F8FAFC;--border:#D7E2F0;
      --amber:#F59E0B;--amber-dim:rgba(245,158,11,0.12);
      --green:#10B981;--green-dim:rgba(16,185,129,0.12);
      --red:#EF4444;--red-dim:rgba(239,68,68,0.12);
      --blue:#2563EB;--blue-dim:rgba(37,99,235,0.12);
      --purple:#7C3AED;--purple-dim:rgba(124,58,237,0.12);
      --cream:#4338CA;--muted:#64748B;--text:#0F172A;--shadow:0 4px 16px rgba(15,23,42,0.07);
    }
    html,body{background:#0F172A;width:100%;min-height:100%;overflow:hidden}
    .sora{font-family:'Sora',sans-serif}
    input,textarea{outline:none;border:none;background:transparent;color:var(--text);font-family:'DM Sans',sans-serif;font-size:15px;width:100%}
    input{padding:12px 14px}
    button{cursor:pointer;border:none;background:none;font-family:'DM Sans',sans-serif;transition:opacity .12s ease}
    button:active{opacity:0.72}
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes popIn{from{opacity:0;transform:scale(0.3)}to{opacity:1;transform:scale(1)}}
    .fu{animation:fadeUp 0.22s ease both}
    .fi{animation:fadeIn 0.18s ease both}
    .s1{animation-delay:.03s}.s2{animation-delay:.06s}.s3{animation-delay:.09s}.s4{animation-delay:.12s}.s5{animation-delay:.15s}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-thumb{background:rgba(100,116,139,0.25);border-radius:99px}
    .app-shell{width:100vw;max-width:none;min-height:100dvh;height:100dvh;display:flex;flex-direction:column;background:#F0F5FF;margin:0;position:relative;overflow:hidden;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);-webkit-transform:translateZ(0);transform:translateZ(0)}
    .app-frame{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) auto;grid-template-areas:"header" "content" "nav"}
    .hdr-shell{grid-area:header;padding:12px calc(env(safe-area-inset-right) + 16px) 10px calc(env(safe-area-inset-left) + 16px)}
    .screen-shell{grid-area:content;min-height:0;display:flex;flex-direction:column;overflow:hidden}
    .nav-shell{grid-area:nav}
    .nav-brand{display:none}
    .dashboard-summary-grid{display:grid;grid-template-columns:1fr;gap:10px}
    .menu-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;grid-auto-rows:1fr;align-items:stretch}
    .menu-card{height:100%;display:flex;flex-direction:column;justify-content:space-between;gap:8px;padding:12px 11px;border-radius:14px;background:var(--card);border:1.5px solid var(--border);box-shadow:0 2px 8px rgba(15,23,42,0.05)}
    .menu-card.active{background:rgba(245,166,35,0.06);border-color:rgba(245,166,35,0.35)}
    .menu-card-head{display:flex;flex-direction:column;gap:6px;min-height:84px}
    .menu-card-title{color:var(--text);font-weight:700;font-size:13px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:36px;text-transform:uppercase}
    .menu-card-price-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:auto}
    .menu-card-action{width:100%;padding:8px 10px;border-radius:10px;margin-top:4px;font-size:12px;font-weight:700;border:1.5px solid rgba(245,158,11,0.2);background:var(--amber-dim);color:var(--amber)}
    .menu-card-action.active{background:var(--amber);color:#fff;border-color:rgba(245,158,11,0.5)}
    .glass-card{background:rgba(255,255,255,0.92)}
    .nav-btn{position:relative;z-index:1}
    .nav-btn.active{color:var(--text)}
    .nav-btn.active::after{content:"";position:absolute;inset:0;border-radius:18px;background:rgba(245,158,11,0.14);box-shadow:0 4px 16px rgba(15,23,42,0.06);z-index:-1}
    .dashboard-scroll{-webkit-overflow-scrolling:touch;overflow-y:auto}
    .pos-name-screen,.tagihan-list-screen{-webkit-overflow-scrolling:touch}
    @media (min-width: 560px) and (orientation: landscape), (min-width: 560px) and (max-height: 500px){
      .app-shell{width:100vw;max-width:none;height:100dvh;min-height:100dvh;margin:0;border-radius:0;border:none;box-shadow:none}
      .app-frame{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);grid-template-areas:"header" "content"}
      .nav-shell{display:none !important}
      .hdr-shell{padding:12px calc(env(safe-area-inset-right) + 18px) 10px calc(env(safe-area-inset-left) + 18px) !important}
      .dashboard-summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      .menu-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
      .dashboard-scroll,.pos-name-screen,.pos-confirm-screen,.tagihan-list-screen{padding-left:16px !important;padding-right:16px !important}
      .login-screen{justify-content:flex-start !important;overflow-y:auto !important;padding:16px 18px 24px !important}
      .login-panel{max-width:540px !important}
      .login-header{margin-bottom:18px !important}
      .login-card{padding:18px !important}
    }
    @media (min-width: 820px) and (orientation: landscape), (min-width: 820px) and (max-height: 500px){
      .menu-grid{grid-template-columns:repeat(4,minmax(0,1fr))}
    }
    @media (min-width: 1024px) and (orientation: landscape), (min-width: 1024px) and (max-height: 500px){
      .app-shell{width:100vw;max-width:none;height:100dvh;min-height:100dvh;margin:0;border-radius:0;box-shadow:none}
      .app-frame{grid-template-columns:minmax(0,1fr)}
      .hdr-shell{padding:13px calc(env(safe-area-inset-right) + 20px) 11px calc(env(safe-area-inset-left) + 20px) !important}
      .dashboard-scroll,.pos-name-screen,.pos-confirm-screen,.tagihan-list-screen{padding-left:18px !important;padding-right:18px !important}
    }
    @media (min-width: 1200px) and (orientation: landscape), (min-width: 1200px) and (max-height: 500px){
      .dashboard-summary-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
      .menu-grid{grid-template-columns:repeat(5,minmax(0,1fr))}
    }
  `}</style>
));

export default FontStyle;
