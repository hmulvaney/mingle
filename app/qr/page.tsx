"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";

export default function QrPage() {
  const [dataUrl, setDataUrl] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    const url = window.location.origin;
    setOrigin(url);
    QRCode.toDataURL(url, {
      width: 560,
      margin: 1,
      color: { dark: "#101010", light: "#ffffff" },
    }).then(setDataUrl);
  }, []);

  return (
    <main className="wrap">
      <div className="brand no-print">
        <span className="dot" />
        <span className="gradient-name">Mingle</span>
      </div>
      <p className="lead no-print">
        This is your permanent QR code. Print it once and reuse it at every
        event — it always sends people to the same place, where they join
        whichever group is active.
      </p>

      <div className="qr-sheet">
        {dataUrl ? (
          <div className="qr-frame">
            <img src={dataUrl} alt="Mingle QR code" />
          </div>
        ) : (
          <p>Generating…</p>
        )}
        <h2>
          Scan to <span className="gradient-name">Mingle</span>
        </h2>
        <ol className="qr-steps">
          <li>Point your camera at the code.</li>
          <li>Add your name, email, phone &amp; LinkedIn.</li>
          <li>Instantly see everyone else in the room.</li>
        </ol>
        <p className="qr-url">{origin}</p>
      </div>

      <div className="stack no-print" style={{ marginTop: 20 }}>
        <button className="btn-primary" onClick={() => window.print()}>
          Print this QR
        </button>
        <Link className="btn btn-ghost" href="/">
          ← Back to Mingle
        </Link>
      </div>
    </main>
  );
}
