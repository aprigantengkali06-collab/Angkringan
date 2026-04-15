// lib/printLock.js — Global print lock untuk mencegah spam cetak
let _printing = false;

export const acquirePrintLock = () => {
  if (_printing) return false;
  _printing = true;
  return true;
};

export const releasePrintLock = () => {
  _printing = false;
};

export const isPrinting = () => _printing;
