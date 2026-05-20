export function ToolboxScene() {
  return (
    <svg
      className="toolbox-scene"
      viewBox="0 0 520 360"
      aria-hidden="true"
      role="img"
    >
      <rect x="74" y="253" width="374" height="16" rx="8" />
      <rect x="96" y="120" width="178" height="112" rx="20" />
      <rect x="114" y="78" width="144" height="70" rx="16" />
      <path d="M158 78c0-22 18-40 40-40s40 18 40 40" />
      <rect x="154" y="148" width="62" height="18" rx="9" />
      <rect x="303" y="74" width="128" height="166" rx="18" />
      <rect x="320" y="100" width="94" height="18" rx="9" />
      <rect x="320" y="132" width="74" height="12" rx="6" />
      <rect x="320" y="156" width="94" height="12" rx="6" />
      <rect x="320" y="180" width="64" height="12" rx="6" />
      <path d="M332 49h66l17 18v6H315v-6z" />
      <rect x="255" y="186" width="52" height="64" rx="12" />
      <path d="M268 186v-18a13 13 0 0 1 26 0v18" />
      <path d="M145 183h98" />
      <path d="M145 205h65" />
      <circle cx="372" cy="272" r="10" />
      <circle cx="403" cy="272" r="10" />
    </svg>
  );
}

export function UploadGlyph() {
  return (
    <svg className="upload-glyph" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 31V13" />
      <path d="m17 20 7-7 7 7" />
      <path d="M12 34.5h24" />
      <rect x="8" y="6.5" width="32" height="35" rx="10" />
    </svg>
  );
}

export function ToolIcon({ kind }) {
  const icons = {
    compress: (
      <>
        <rect x="7" y="9" width="10" height="10" rx="3" />
        <rect x="23" y="9" width="10" height="10" rx="3" />
        <path d="M13 25v8" />
        <path d="m10 30 3 3 3-3" />
        <path d="M27 33v-8" />
        <path d="m24 28 3-3 3 3" />
      </>
    ),
    resize: (
      <>
        <rect x="9" y="11" width="22" height="18" rx="5" />
        <path d="M19 19h9" />
        <path d="M28 19V10" />
        <path d="m22.5 10 5.5 0 0 5.5" />
      </>
    ),
    convert: (
      <>
        <rect x="8" y="9" width="11" height="14" rx="3" />
        <rect x="25" y="15" width="11" height="14" rx="3" />
        <path d="m16 28 4 4 4-4" />
        <path d="M20 31V18" />
      </>
    ),
    imagepdf: (
      <>
        <rect x="8" y="11" width="12" height="12" rx="3" />
        <path d="m10 21 3-4 3 2 2-3 2 5" />
        <path d="M26 10h6l4 4v14a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4v-1" />
        <path d="M32 10v5h5" />
      </>
    ),
    ocr: (
      <>
        <rect x="8" y="8" width="24" height="24" rx="6" />
        <path d="M13 15h5" />
        <path d="M13 20h14" />
        <path d="M13 25h10" />
        <path d="m27 26 3 3" />
        <circle cx="26" cy="25" r="3" />
      </>
    ),
    doc: (
      <>
        <path d="M12 8.5h14l7 7V31a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5v-17a5 5 0 0 1 5-5Z" />
        <path d="M26 8.5v8h8" />
        <path d="M13 23h14" />
        <path d="M13 28h10" />
      </>
    ),
    pdfimg: (
      <>
        <path d="M11 8.5h12l6 6V31a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4v-18a4 4 0 0 1 4-4Z" />
        <path d="M23 8.5v7h7" />
        <rect x="12" y="20" width="13" height="9" rx="2" />
        <path d="m14 27 3-3 2 1 2-3 2 5" />
      </>
    ),
    watermark: (
      <>
        <path d="M12 8.5h13l6 6V31a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4v-18a4 4 0 0 1 4-4Z" />
        <path d="M25 8.5v7h7" />
        <path d="M15 28c2-5 8-5 10 0" />
        <path d="M20 19v8" />
      </>
    ),
    merge: (
      <>
        <path d="M12 10v7c0 6 4 8 12 8h8" />
        <path d="m24 16-6 6 6 6" />
        <path d="M32 10v7c0 6-4 8-12 8H12" />
      </>
    ),
    split: (
      <>
        <path d="M24 8v24" />
        <path d="m17 16 7-7 7 7" />
        <path d="m17 24 7 7 7-7" />
      </>
    ),
    qr: (
      <>
        <rect x="8" y="8" width="9" height="9" rx="2" />
        <rect x="8" y="23" width="9" height="9" rx="2" />
        <rect x="23" y="8" width="9" height="9" rx="2" />
        <path d="M24 24h3v3h-3z" />
        <path d="M30 24h2v2h-2z" />
        <path d="M24 30h8" />
      </>
    ),
    sheet: (
      <>
        <path d="M12 8.5h13l6 6V31a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4v-18a4 4 0 0 1 4-4Z" />
        <path d="M25 8.5v7h7" />
        <path d="M13 21h14" />
        <path d="M13 26h14" />
        <path d="M18 16v15" />
      </>
    ),
    text: (
      <>
        <path d="M11 12h18" />
        <path d="M11 19h12" />
        <path d="M11 26h16" />
        <path d="m24 17 4 4-4 4" />
      </>
    ),
    time: (
      <>
        <circle cx="20" cy="20" r="12" />
        <path d="M20 13v8l5 3" />
        <path d="M12 8l-2-2" />
        <path d="M28 8l2-2" />
      </>
    )
  };

  return (
    <svg className="tool-icon" viewBox="0 0 40 40" aria-hidden="true">
      {icons[kind]}
    </svg>
  );
}
