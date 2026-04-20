import { useState } from "react";
import { getContract } from "./utils/contract";
import { generateFileHash } from "./utils/hash";

const TABS = ["Upload", "Verify", "History", "Browse"];

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

  // ─── RENDER ───────────────────────────────────────────────
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📄 Study Verifier</h1>
      <p style={styles.subtitle}>Blockchain-backed document authenticity for students</p>

      {/* Tab bar */}
      <div style={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setResult(""); setBrowseDocs([]); }}
            style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={styles.card}>

        {/* ── UPLOAD TAB ── */}
        {tab === "Upload" && (
          <>
            <label style={styles.label}>File</label>
            <input type="file" onChange={e => setFile(e.target.files[0])} style={styles.fileInput} />

            <label style={styles.label}>Subject / Topic</label>
            <input
              type="text"
              placeholder="e.g. Mathematics, Physics, History..."
              value={subject}
              onChange={e => setSubject(e.target.value)}
              style={styles.input}
            />

            <button onClick={handleUpload} style={styles.btn}>Upload to Blockchain</button>
          </>
        )}

        {/* ── VERIFY TAB ── */}
        {tab === "Verify" && (
          <>
            <label style={styles.label}>Select file to verify</label>
            <input type="file" onChange={e => setFile(e.target.files[0])} style={styles.fileInput} />
            <button onClick={handleVerify} style={styles.btn}>Verify Authenticity</button>
          </>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === "History" && (
          <>
            <label style={styles.label}>Select any version of the file</label>
            <input type="file" onChange={e => setFile(e.target.files[0])} style={styles.fileInput} />
            <button onClick={handleHistory} style={styles.btn}>View Version History</button>
          </>
        )}

        {/* ── BROWSE TAB ── */}
        {tab === "Browse" && (
          <>
            <button onClick={handleLoadSubjects} style={{ ...styles.btn, marginBottom: 12 }}>
              Load All Subjects
            </button>

            {subjects.length > 0 && (
              <>
                <label style={styles.label}>Select a Subject</label>
                <select
                  value={browseSubject}
                  onChange={e => setBrowseSubject(e.target.value)}
                  style={styles.input}
                >
                  <option value="">-- choose subject --</option>
                  {subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button onClick={handleBrowse} style={styles.btn}>Browse Documents</button>
              </>
            )}

            {browseDocs.length > 0 && (
              <div style={{ marginTop: 16 }}>
                {browseDocs.map(doc => (
                  <div key={doc.id} style={styles.docCard}>
                    <strong>{doc.docKey}</strong>
                    <div style={styles.docMeta}>Subject: {doc.subject}</div>
                    <div style={styles.docMeta}>Uploader: {doc.uploader}</div>
                    <div style={styles.docMeta}>
                      IPFS:{" "}
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${doc.ipfsHash}`}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.link}
                      >
                        {doc.ipfsHash.slice(0, 20)}...
                      </a>
                    </div>
                    <div style={styles.docMeta}>
                      Uploaded: {new Date(doc.timestamp * 1000).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {browseDocs.length === 0 && browseSubject && (
              <p style={{ color: "#888", marginTop: 12 }}>No documents found for this subject.</p>
            )}
          </>
        )}

        {/* Result output — shown for Upload/Verify/History tabs */}
        {result !== "" && tab !== "Browse" && (
          <pre style={styles.result}>{result}</pre>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 640,
    margin: "40px auto",
    fontFamily: "'Courier New', monospace",
    padding: "0 20px",
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
  },
  subtitle: {
    color: "#666",
    marginBottom: 24,
    marginTop: 4,
  },
  tabs: {
    display: "flex",
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    padding: "8px 18px",
    border: "1px solid #ccc",
    background: "white",
    cursor: "pointer",
    borderRadius: 6,
    fontSize: 14,
  },
  tabActive: {
    background: "#111",
    color: "white",
    borderColor: "#111",
  },
  card: {
    border: "1px solid #e0e0e0",
    borderRadius: 10,
    padding: 24,
    background: "#fafafa",
  },
  label: {
    display: "block",
    fontWeight: 600,
    marginBottom: 6,
    fontSize: 13,
  },
  fileInput: {
    marginBottom: 16,
    display: "block",
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #ccc",
    borderRadius: 6,
    fontSize: 14,
    marginBottom: 16,
    boxSizing: "border-box",
  },
  btn: {
    padding: "10px 22px",
    background: "#111",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  result: {
    marginTop: 20,
    padding: 16,
    background: "#f0f0f0",
    borderRadius: 8,
    fontSize: 13,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
  },
  docCard: {
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    background: "white",
    fontSize: 13,
  },
  docMeta: {
    color: "#555",
    marginTop: 4,
  },
  link: {
    color: "#0070f3",
  },
};