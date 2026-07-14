import { useState } from "react";
import { getContract } from "./utils/contract";
import { generateFileHash } from "./utils/hash";

const TABS = ["Upload", "Verify", "History", "Browse"];

const TAB_ICONS = {
  Upload: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  ),
  Verify: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  History: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5V15h5"/>
    </svg>
  ),
  Browse: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
    </svg>
  ),
};

function ShieldIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z"/>
    </svg>
  );
}

function DocumentIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}

function UploadIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  );
}

function FingerprintIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10"/>
      <path d="M5 12a7 7 0 0 1 7-7c1.66 0 3.18.58 4.37 1.54"/>
      <path d="M8 12a4 4 0 0 1 4-4c.95 0 1.82.33 2.5.88"/>
      <path d="M12 12v.01M12 16v.01M12 20v.01"/>
    </svg>
  );
}

function PersonIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function CalendarIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function LinkIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  );
}

// ─── FILE DROP ZONE ────────────────────────────────────────────────────────────
function DropZone({ onFile, label = "Drop your file here or click to browse", sub = "PDF, PNG or JPG up to 10MB", dark = false }) {
  const [drag, setDrag] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFile = (f) => {
    setFileName(f.name);
    onFile(f);
  };

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 12, padding: "2.5rem 2rem", cursor: "pointer",
        border: `2px dashed ${drag ? (dark ? "#c6c6c6" : "#000") : (dark ? "#4c4546" : "#CBD5E1")}`,
        borderRadius: 12, transition: "all 0.2s",
        background: drag ? (dark ? "#1c2024" : "#f0f0f0") : (dark ? "#181c20" : "#F9F9FB"),
        minHeight: 160,
      }}
    >
      <input type="file" style={{ display: "none" }} onChange={(e) => { const f = e.target.files[0]; if (f) handleFile(f); }} />
      <div style={{ color: dark ? "#988e90" : "#94A3B8", transition: "color 0.2s" }}>
        <UploadIcon size={36} />
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: 14, color: dark ? "#e0e2e8" : "#1a1a1a", margin: 0 }}>
          {fileName ? `✓ ${fileName}` : label}
        </p>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: dark ? "#988e90" : "#94A3B8", margin: "4px 0 0" }}>{sub}</p>
      </div>
    </label>
  );
}

// ─── PRIMARY BUTTON ────────────────────────────────────────────────────────────
function PrimaryBtn({ onClick, children, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", padding: "1rem", background: disabled ? "#333" : "#000", color: "#fff",
      border: "none", borderRadius: 6, fontFamily: "'Space Grotesk', sans-serif",
      fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
      cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center",
      justifyContent: "center", gap: 8, transition: "all 0.15s", opacity: disabled ? 0.5 : 1,
    }}>
      {children}
    </button>
  );
}

// ─── RESULT BOX ───────────────────────────────────────────────────────────────
function ResultBox({ result }) {
  if (!result) return null;
  const isSuccess = result.startsWith("✅");
  const isError = result.startsWith("❌");
  const isLoading = result.startsWith("⏳");

  return (
    <div style={{
      marginTop: 16, padding: "1rem 1.25rem",
      background: isSuccess ? "#f0fdf4" : isError ? "#fff1f2" : "#1c2024",
      border: `1px solid ${isSuccess ? "#bbf7d0" : isError ? "#fecdd3" : "#4c4546"}`,
      borderRadius: 8,
    }}>
      <pre style={{
        fontFamily: "'Space Grotesk', monospace", fontSize: 12, lineHeight: 1.7, margin: 0,
        whiteSpace: "pre-wrap", wordBreak: "break-all",
        color: isSuccess ? "#166534" : isError ? "#9f1239" : "#e0e2e8",
      }}>{result}</pre>
    </div>
  );
}

// ─── UPLOAD TAB ───────────────────────────────────────────────────────────────
function UploadTab({ file, setFile, subject, setSubject, handleUpload, result }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Upload card */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "2rem", color: "#000" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <span style={{
            display: "inline-block", background: "#F1F5F9", color: "#475569",
            padding: "3px 10px", borderRadius: 999, fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10,
          }}>New Entry</span>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, margin: "0 0 6px", color: "#000" }}>
            Anchor Document
          </h2>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: "#757575", margin: 0 }}>
            Securely upload your academic records to the decentralized ledger.
          </p>
        </div>

        <DropZone onFile={setFile} />

        <div style={{ marginTop: "1.25rem" }}>
          <label style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#757575", display: "block", marginBottom: 8 }}>
            Subject / Topic
          </label>
          <input
            type="text"
            placeholder="e.g. Mathematics, Physics, History..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{
              width: "100%", padding: "12px 14px", border: "1px solid #E2E8F0", borderRadius: 6,
              fontFamily: "Inter, sans-serif", fontSize: 15, color: "#000", background: "#fff",
              outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
            }}
            onFocus={(e) => e.target.style.borderColor = "#000"}
            onBlur={(e) => e.target.style.borderColor = "#E2E8F0"}
          />
        </div>

        <div style={{ marginTop: "1.25rem" }}>
          <PrimaryBtn onClick={handleUpload}>
            <ShieldIcon size={14} /> Upload to Blockchain
          </PrimaryBtn>
        </div>
      </div>

      {result && (
        <div style={{
          background: "#fff", borderRadius: 12, padding: "1.5rem",
          borderLeft: "4px solid #000",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", background: "#000",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {result.startsWith("✅") ? <CheckIcon /> : result.startsWith("❌") ? <AlertIcon /> : null}
            </div>
            <div>
              <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15, color: "#000", margin: 0 }}>
                {result.startsWith("✅") ? "Document successfully anchored to blockchain." :
                 result.startsWith("❌") ? "Upload failed." : "Processing..."}
              </p>
            </div>
          </div>
          <ResultBox result={result} />
        </div>
      )}

      <div style={{ textAlign: "center", paddingBottom: 16, opacity: 0.4 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "inline-block" }} />)}
        </div>
        <p style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#fff", margin: 0 }}>
          Institutional Grade Integrity Protocol v4.2
        </p>
      </div>
    </div>
  );
}

// ─── VERIFY TAB ───────────────────────────────────────────────────────────────
function VerifyTab({ file, setFile, handleVerify, result }) {
  const isSuccess = result?.startsWith("✅");
  const isError = result?.startsWith("❌");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", color: "#e0e2e8", margin: "0 0 6px" }}>
          Verify Authenticity
        </h1>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, color: "#988e90", margin: 0 }}>
          Instant validation against the blockchain ledger.
        </p>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: "2rem", display: "flex", flexDirection: "column", gap: 16 }}>
        <DropZone onFile={setFile} />

        <PrimaryBtn onClick={handleVerify}>
          <ShieldIcon size={14} /> Verify Authenticity
        </PrimaryBtn>

        {result && (
          <>
            <div style={{
              display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 6,
              background: isSuccess ? "#f0fdf4" : isError ? "#fff1f2" : "#f8f9fa",
              border: `1px solid ${isSuccess ? "#bbf7d0" : isError ? "#fecdd3" : "#e2e8f0"}`,
            }}>
              <span style={{ color: isSuccess ? "#16a34a" : isError ? "#dc2626" : "#6b7280" }}>
                {isSuccess ? <CheckIcon /> : <AlertIcon />}
              </span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: isSuccess ? "#166534" : "#9f1239" }}>
                {isSuccess ? "Authentic" : isError ? "Tampered / Not found" : "Verifying..."}
              </span>
            </div>

            {isSuccess && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                {[
                  { label: "Uploader", icon: <PersonIcon />, value: result.match(/Uploader:\s*(.+)/)?.[1] || "—" },
                  { label: "Subject", icon: null, value: result.match(/Subject:\s*(.+)/)?.[1] || "—", pill: true },
                  { label: "IPFS Link", icon: <LinkIcon />, value: result.match(/IPFS CID:\s*(.+)/)?.[1] || "—", link: true },
                  { label: "Version", icon: null, value: result.match(/Version:\s*(.+)/)?.[1] || "—" },
                ].map(({ label, icon, value, pill, link }) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#757575" }}>
                      {label}
                    </span>
                    {pill ? (
                      <span style={{ display: "inline-block", background: "#f1f5f9", color: "#000", padding: "2px 10px", borderRadius: 999, fontFamily: "Inter, sans-serif", fontSize: 12, width: "fit-content" }}>
                        {value}
                      </span>
                    ) : link ? (
                      <a href={`https://ipfs.io/ipfs/${value}`} target="_blank" rel="noreferrer" style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 13, color: "#2563eb", textDecoration: "underline", wordBreak: "break-all" }}>
                        {value.length > 20 ? value.slice(0, 20) + "..." : value}
                      </a>
                    ) : (
                      <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 13, color: "#000", wordBreak: "break-all" }}>
                        {value.length > 20 ? value.slice(0, 20) + "..." : value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isError && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: "#000", margin: 0, lineHeight: 1.6 }}>
                  The cryptographic hash of the provided file does not match any records in our blockchain database. This may indicate the document has been altered or was never officially registered.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setFile(null)} style={{ padding: "8px 16px", border: "1px solid #000", background: "transparent", borderRadius: 6, fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
                    Try Another File
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* How it works */}
      <div style={{ background: "#1c2024", borderRadius: 12, padding: "1.5rem", border: "1px solid #2D2D30", display: "flex", gap: 14 }}>
        <div style={{ color: "#c6c6c6", flexShrink: 0, marginTop: 2 }}><InfoIcon /></div>
        <div>
          <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, color: "#e0e2e8", margin: "0 0 6px" }}>How verification works</h4>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#988e90", margin: 0, lineHeight: 1.6 }}>
            We use SHA-256 hashing to generate a unique digital fingerprint for every document. This fingerprint is permanently stored on the decentralized ledger, making it impossible to forge or modify without detection.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 24, borderTop: "1px solid #2D2D30", opacity: 0.5 }}>
        <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#e0e2e8" }}>© 2024 Study Verifier Protocol</span>
        <div style={{ display: "flex", gap: 12, color: "#988e90" }}>
          <ShieldIcon size={16} />
          <DocumentIcon size={16} />
        </div>
      </div>
    </div>
  );
}

// ─── HISTORY TAB ──────────────────────────────────────────────────────────────
function HistoryTab({ file, setFile, handleHistory, result }) {
  const versionBlocks = result ? parseHistory(result) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Drop zone + button */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <DropZone onFile={setFile} dark sub="PDF, JSON or Verified Assets (Max 50MB)" label="Drop academic records here" />
        <button onClick={handleHistory} style={{
          width: "100%", padding: "1rem", background: "#fff", color: "#000",
          border: "none", borderRadius: 6, fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5V15h5"/></svg>
          View Version History
        </button>
      </div>

      {/* Timeline */}
      {versionBlocks && versionBlocks.length > 0 ? (
        <div style={{ position: "relative" }}>
          {/* vertical line */}
          <div style={{ position: "absolute", left: 19, top: 24, bottom: 24, width: 2, background: "#4c4546" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {versionBlocks.map((v, i) => (
              <div key={i} style={{ position: "relative", paddingLeft: 56 }}>
                <div style={{ position: "absolute", left: 0, top: 20, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {i === 0 ? (
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#fff", boxShadow: "0 0 0 4px #0F0F12" }} />
                  ) : (
                    <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid #4c4546", background: "#0F0F12", boxShadow: "0 0 0 4px #0F0F12" }} />
                  )}
                </div>
                <div style={{
                  background: i === 0 ? "#fff" : "#1c2024",
                  borderRadius: 8, padding: "1.25rem",
                  border: i === 0 ? "none" : "1px solid #2D2D30", color: i === 0 ? "#000" : "#e0e2e8",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{
                      display: "inline-block",
                      background: i === 0 ? "#000" : "#2D2D30",
                      color: i === 0 ? "#fff" : "#988e90",
                      padding: "3px 10px", borderRadius: 999,
                      fontFamily: "'Space Grotesk', sans-serif", fontSize: 10,
                      fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                    }}>
                      {i === 0 ? "Latest" : v.label}
                    </span>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, opacity: 0.5 }}>{v.time}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: i === 0 ? "#000" : "#e0e2e8" }}>
                      <PersonIcon />
                      <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 13 }}>{v.uploader}</span>
                    </div>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 4,
                      background: i === 0 ? "#f1f5f9" : "#0F0F12",
                      border: `1px solid ${i === 0 ? "#e2e8f0" : "#2D2D30"}`,
                    }}>
                      <FingerprintIcon />
                      <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 11, wordBreak: "break-all", lineHeight: 1.4, color: i === 0 ? "#000" : "#988e90" }}>
                        {v.cid}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : result && (
        <ResultBox result={result} />
      )}
    </div>
  );
}

function parseHistory(raw) {
  if (!raw || !raw.includes("Version")) return null;
  const blocks = [];
  const lines = raw.split("\n");
  let current = null;
  for (const line of lines) {
    if (line.includes("── Version")) {
      if (current) blocks.push(current);
      current = { label: line.replace(/──\s*/, "").trim(), uploader: "", cid: "", time: "", subject: "" };
    } else if (current) {
      if (line.includes("Uploader:")) current.uploader = line.split("Uploader:")[1].trim();
      if (line.includes("CID:")) current.cid = line.split("CID:")[1].trim();
      if (line.includes("Time:")) current.time = line.split("Time:")[1].trim();
      if (line.includes("Subject:")) current.subject = line.split("Subject:")[1].trim();
    }
  }
  if (current) blocks.push(current);
  return blocks;
}

// ─── BROWSE TAB ───────────────────────────────────────────────────────────────
function BrowseTab({ subjects, browseSubject, setBrowseSubject, browseDocs, handleLoadSubjects, handleBrowse }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", color: "#e0e2e8", margin: "0 0 8px" }}>
          Explore the Archives
        </h2>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 16, color: "#757575", margin: 0 }}>
          Authenticated educational resources secured by decentralized consensus.
        </p>
      </div>

      {/* Load + filter */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
        <button onClick={handleLoadSubjects} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 28px", background: "transparent", color: "#c6c6c6",
          border: "1px solid #4c4546", borderRadius: 0, cursor: "pointer",
          fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em",
          transition: "all 0.15s",
        }}>
          <RefreshIcon /> Load Subjects
        </button>

        {subjects.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
            {subjects.map((s) => (
              <button key={s} onClick={() => { setBrowseSubject(s); handleBrowse && setTimeout(() => {}, 0); }} style={{
                padding: "6px 16px", borderRadius: 999, cursor: "pointer",
                background: browseSubject === s ? "#fff" : "#272a2e",
                color: browseSubject === s ? "#000" : "#cfc4c5",
                border: browseSubject === s ? "none" : "1px solid transparent",
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 500, letterSpacing: "0.05em",
                boxShadow: browseSubject === s ? "0 0 15px rgba(255,255,255,0.1)" : "none",
                transition: "all 0.15s",
              }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {subjects.length > 0 && browseSubject && (
          <button onClick={handleBrowse} style={{
            padding: "8px 22px", background: "#000", color: "#fff", border: "none", borderRadius: 6,
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
          }}>
            Browse Documents
          </button>
        )}
      </div>

      {/* Document cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {browseDocs.length > 0 ? browseDocs.map((doc) => (
          <div key={doc.id} style={{
            background: "#fff", borderRadius: 8, padding: "1.5rem",
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20,
            flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ padding: 10, background: "#101417", border: "1px solid #4c4546", flexShrink: 0 }}>
                <DocumentIcon size={28} />
              </div>
              <div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, color: "#000", margin: "0 0 6px" }}>
                  {doc.docKey}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#757575", margin: 0, display: "flex", alignItems: "center", gap: 5 }}>
                    <PersonIcon /> Uploader: <span style={{ fontFamily: "monospace", color: "#000" }}>{doc.uploader?.slice(0, 10)}...</span>
                  </p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#757575", margin: 0, display: "flex", alignItems: "center", gap: 5 }}>
                    <CalendarIcon /> {new Date(doc.timestamp * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
            </div>
            <a
              href={`https://gateway.pinata.cloud/ipfs/${doc.ipfsHash}`}
              target="_blank" rel="noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
                background: "#000", color: "#fff", textDecoration: "none",
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em",
                borderRadius: 4, flexShrink: 0,
              }}
            >
              View on IPFS <LinkIcon />
            </a>
          </div>
        )) : browseSubject ? (
          <div style={{
            padding: "3rem 2rem", border: "2px dashed #4c4546", borderRadius: 8,
            display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", opacity: 0.5,
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e0e2e8" strokeWidth="1" style={{ marginBottom: 16 }}>
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>
              <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/>
            </svg>
            <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, color: "#e0e2e8", margin: "0 0 8px" }}>No documents found for this subject.</h4>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: "#757575", margin: 0, maxWidth: 280 }}>
              Contribute to the decentralized library by uploading a verified document.
            </p>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 40, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #2D2D30", paddingTop: 24, opacity: 0.5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Space Grotesk', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#e0e2e8" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
          Blockchain Node Connected
        </div>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#e0e2e8" }}>v2.4.0-release</span>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("Upload");

  // Upload state
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState("");

  // Browse state
  const [subjects, setSubjects] = useState([]);
  const [browseSubject, setBrowseSubject] = useState("");
  const [browseDocs, setBrowseDocs] = useState([]);

  const [result, setResult] = useState("");

  // ─── UPLOAD ───────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return setResult("❌ Please select a file");
    if (!subject.trim()) return setResult("❌ Please enter a subject");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("subject", subject.trim());

    try {
      setResult("⏳ Uploading...");
      const res = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        setResult("❌ Upload failed");
        return;
      }

      setResult(
        `✅ Uploaded!\n\nFile: ${data.docKey}\nSubject: ${data.subject}\nCID: ${data.cid}\nParent ID: ${data.parentId || "None (first version)"}`
      );
    } catch (err) {
      console.error(err);
      setResult("❌ Upload error");
    }
  };

  // ─── VERIFY ───────────────────────────────────────────────
  const handleVerify = async () => {
    if (!file) return setResult("❌ Please select a file");

    try {
      setResult("⏳ Verifying...");
      const hash = await generateFileHash(file);
      const contract = await getContract();

      const exists = await contract.verifyDocument("0x" + hash);

      if (!exists) {
        setResult("❌ File not found on chain — may be tampered or never uploaded");
        return;
      }

      const doc = await contract.getDocumentByHash("0x" + hash);
      const id = Number(doc[0]);
      const uploader = doc[1];
      const ipfs = doc[2];
      const docKey = doc[6];
      const docSubject = doc[7];

      const latestId = Number(await contract.getLatestByKey(docKey));
      const history = await contract.getHistory(latestId);
      const isLatest = id === latestId;

      let output = "✅ Authentic — file matches on-chain record\n";
      if (!isLatest) output += "⚠️  This is NOT the latest version\n";

      output += `\nFile:     ${docKey}`;
      output += `\nSubject:  ${docSubject}`;
      output += `\nUploader: ${uploader}`;
      output += `\nIPFS CID: ${ipfs}`;
      output += `\nVersion:  ${id} of ${latestId} (${history.length} total)`;

      setResult(output);
    } catch (err) {
      console.error(err);
      setResult("❌ Verification failed");
    }
  };

  // ─── HISTORY ──────────────────────────────────────────────
  const handleHistory = async () => {
    if (!file) return setResult("❌ Please select a file");

    try {
      setResult("⏳ Fetching history...");
      const hash = await generateFileHash(file);
      const contract = await getContract();

      const doc = await contract.getDocumentByHash("0x" + hash);
      const docKey = doc[6];

      const latestId = Number(await contract.getLatestByKey(docKey));
      const history = await contract.getHistory(latestId);

      let output = `📜 Version History for "${docKey}":\n\n`;

      history.forEach((d, i) => {
        const vNum = history.length - i;
        output += `── Version ${vNum} ${ i === 0 ? "(latest)" : "" }\n`;
        output += `   ID:        ${Number(d[0])}\n`;
        output += `   Uploader:  ${d[1]}\n`;
        output += `   Subject:   ${d[7]}\n`;
        output += `   CID:       ${d[2]}\n`;
        output += `   Parent ID: ${Number(d[4]) || "None"}\n`;
        output += `   Time:      ${new Date(Number(d[5]) * 1000).toLocaleString()}\n\n`;
      });

      setResult(output);
    } catch (err) {
      console.error(err);
      setResult("❌ History failed");
    }
  };

  // ─── BROWSE ───────────────────────────────────────────────
  const handleLoadSubjects = async () => {
    try {
      const res = await fetch("http://localhost:3001/subjects");
      const data = await res.json();
      setSubjects(data.subjects || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBrowse = async () => {
    if (!browseSubject) return;
    try {
      const res = await fetch(
        `http://localhost:3001/browse/${encodeURIComponent(browseSubject)}`
      );
      const data = await res.json();
      setBrowseDocs(data.documents || []);
    } catch (err) {
      console.error(err);
      setBrowseDocs([]);
    }
  };

  const switchTab = (t) => {
    setTab(t);
    setResult("");
    setBrowseDocs([]);
  };

  // ─── RENDER ───────────────────────────────────────────────
  return (
    <div style={{ background: "#0F0F12", minHeight: "100vh", color: "#e0e2e8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #0F0F12; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0F0F12; }
        ::-webkit-scrollbar-thumb { background: #4c4546; border-radius: 3px; }
        input::placeholder { color: #757575; }
      `}</style>

      {/* Side Nav (desktop) */}
      <aside style={{
        position: "fixed", left: 0, top: 0, height: "100%", width: 220,
        borderRight: "1px solid #2D2D30", background: "#0F0F12",
        display: "flex", flexDirection: "column", padding: "1.5rem",
        zIndex: 100,
      }}>
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ color: "#fff" }}><ShieldIcon size={18} /></div>
            <span style={{ fontFamily: "'Space Grotesk', monospace", fontWeight: 700, fontSize: 16, color: "#fff" }}>Study Verifier</span>
          </div>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "#757575", margin: 0 }}>
            Blockchain-backed document authenticity
          </p>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => switchTab(t)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              background: tab === t ? "#fff" : "transparent", color: tab === t ? "#000" : "#757575",
              border: "none", borderRadius: 4, cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 600,
              letterSpacing: "0.1em", textTransform: "uppercase", transition: "all 0.15s", width: "100%", textAlign: "left",
            }}>
              {TAB_ICONS[t]} {t}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: "auto", padding: "1rem", background: "#1c2024", borderRadius: 6, border: "1px solid #2D2D30" }}>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 9, color: "#c6c6c6", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>Network Status</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 11, color: "#e0e2e8" }}>Mainnet Connected</span>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div style={{ marginLeft: 220 }}>
        {/* Top bar */}
        <header style={{
          position: "sticky", top: 0, background: "#0F0F12", borderBottom: "1px solid #2D2D30",
          zIndex: 50, padding: "1.5rem 2rem 0",
        }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ color: "#fff" }}><ShieldIcon size={18} /></div>
                <span style={{ fontFamily: "'Space Grotesk', monospace", fontWeight: 700, fontSize: 16, color: "#fff" }}>Study Verifier</span>
              </div>
              <div style={{ display: "flex", gap: 12, color: "#fff", opacity: 0.6 }}>
                <ShieldIcon size={16} />
                <DocumentIcon size={16} />
              </div>
            </div>
            <nav style={{ display: "flex", gap: 28, borderBottom: "1px solid #2D2D30" }}>
              {TABS.map((t) => (
                <button key={t} onClick={() => switchTab(t)} style={{
                  background: "none", border: "none", cursor: "pointer", padding: "0 0 12px",
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 500,
                  color: tab === t ? "#fff" : "#757575", borderBottom: tab === t ? "2px solid #fff" : "2px solid transparent",
                  marginBottom: -1, transition: "color 0.15s",
                }}>
                  {t}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Page content */}
        <main style={{ maxWidth: 680, margin: "0 auto", padding: "2.5rem 2rem 5rem" }}>
          {tab === "Upload" && (
            <UploadTab file={file} setFile={setFile} subject={subject} setSubject={setSubject} handleUpload={handleUpload} result={result} />
          )}
          {tab === "Verify" && (
            <VerifyTab file={file} setFile={setFile} handleVerify={handleVerify} result={result} />
          )}
          {tab === "History" && (
            <HistoryTab file={file} setFile={setFile} handleHistory={handleHistory} result={result} />
          )}
          {tab === "Browse" && (
            <BrowseTab
              subjects={subjects} browseSubject={browseSubject}
              setBrowseSubject={setBrowseSubject} browseDocs={browseDocs}
              handleLoadSubjects={handleLoadSubjects} handleBrowse={handleBrowse}
            />
          )}
        </main>
      </div>
    </div>
  );
}