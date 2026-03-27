"use client";
import { useState, useEffect } from "react";
import AngkringanApp from "../components/AngkringanApp";

export default function Page() {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  if (!ready) return null;
  return <AngkringanApp />;
}
