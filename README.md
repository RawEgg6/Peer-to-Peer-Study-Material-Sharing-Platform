# 📄 Blockchain-based Study Material Verifier

## 🚀 Overview

A decentralized document verification and versioning platform for students. Every upload is anchored to an immutable blockchain record — ensuring authenticity, authorship, and a transparent revision history.

Built with:

- **Blockchain (Ethereum / Hardhat)** → immutable metadata, versioning, subject indexing
- **IPFS (Pinata)** → decentralized file storage
- **Frontend (React + Vite)** → upload, verify, browse, history
- **Backend (Node.js + Express)** → hashing, IPFS upload, blockchain interaction

---

## 🎯 Problem Statement

Students share study materials via WhatsApp, Google Drive, etc., but:

- ❌ No way to verify a file hasn't been modified
- ❌ No authorship or attribution tracking
- ❌ No version control or revision history
- ❌ Risk of unknowingly using outdated or tampered content

---

## ✅ Solution

This platform ensures:

- 🔒 **File authenticity** via SHA-256 cryptographic hashes stored on-chain
- 🧾 **Authorship tracking** via uploader wallet addresses
- 🔄 **Version history** via blockchain-linked parent records
- 🏷️ **Subject/topic metadata** stored on-chain for browsing
- ⚠️ **Tamper detection** by comparing recomputed hashes against the chain
- 📂 **Browse by subject** — find all documents under a topic

---

## 🧠 Core Idea

```
File → SHA-256 Hash → Stored on Blockchain
File → Uploaded to IPFS → CID stored on-chain
Subject/Topic → Indexed on-chain → Browsable by students
```

Each document version is a new blockchain entry linked to its predecessor:

```
v1 (parentId: 0) → v2 (parentId: 1) → v3 (parentId: 2)
```

---

## 🏗️ Architecture

```
Frontend (React)
      ↓
Backend (Express)
      ↓          ↘
Blockchain      IPFS (Pinata)
(Hardhat)
```

---

## 📂 Project Structure

```
p2p_file_share/
│
├── contracts/
│   └── DocumentVerifier.sol     # Smart contract
│
├── scripts/
│   └── deploy.js                # Deployment script
│
├── frontend/
│   └── src/
│       ├── App.jsx              # Main UI (Upload / Verify / History / Browse)
│       └── utils/
│           ├── contract.js      # Ethers.js contract interface + ABI
│           └── hash.js          # SHA-256 hashing (browser)
│
├── utils/                       # Backend utilities
│   ├── contract.js              # Ethers.js contract interface (Node)
│   ├── hash.js                  # SHA-256 hashing (Node)
│   └── ipfs.js                  # Pinata IPFS upload
│
├── server.js                    # Express backend
├── artifacts/                   # Hardhat compiled contracts
├── uploads/                     # Temp file storage (auto-cleared)
└── .env
```

---

## ⚙️ How It Works

### 1️⃣ Upload Flow

```
User selects file + enters subject
  → Backend hashes file (SHA-256)
  → File uploaded to IPFS via Pinata → CID returned
  → Backend checks if docKey (filename) has a prior version
  → Blockchain transaction stores:
       fileHash, CID, uploader wallet, subject,
       parentId (0 if first version), timestamp
  → latestByKey[docKey] updated to new version ID
  → If first version: indexed under subject for browsing
```

### 2️⃣ Versioning Logic

Each document has a linked version chain stored on-chain:

```
v1 → v2 → v3
     ↑
  parentId links
```

- `parentId = 0` means first upload
- Only the **original uploader** wallet can push a revision
- `getLatestByKey(docKey)` always points to the newest version
- `getHistory(latestId)` traverses the full chain backwards

### 3️⃣ Verification Flow

```
User selects file
  → Hash computed in browser (SHA-256)
  → verifyDocument(hash) called on-chain
  → If found: fetch document metadata
  → Compare document ID against latestByKey
  → Report: Authentic / Not latest version / Tampered
```

### 4️⃣ History Retrieval

```
File selected → hash computed → getDocumentByHash()
  → getLatestByKey(docKey) → getHistory(latestId)
  → Traverse parentId chain → return all versions
  (newest first, with uploader, CID, subject, timestamp)
```

### 5️⃣ Browse by Subject

```
getAllSubjects() → dropdown of all indexed subjects
  → getDocumentDetailsBySubject(subject)
  → Returns latest version of every document under that subject
  → Displayed with IPFS link, uploader, timestamp
```

---

## 🔐 Smart Contract

**`DocumentVerifier.sol`**

### Document Struct

```solidity
struct Document {
    uint256 id;
    address uploader;
    string  ipfsHash;    // IPFS CID
    bytes32 fileHash;    // SHA-256 of file content
    uint256 parentId;    // 0 = first version
    uint256 timestamp;
    string  docKey;      // stable identity (filename)
    string  subject;     // topic/subject metadata
}
```

### Key Functions

| Function | Description |
|---|---|
| `uploadDocument(cid, hash, docKey, parentId, subject)` | Register a new document or version |
| `verifyDocument(hash)` | Returns true if hash exists on-chain |
| `getDocumentByHash(hash)` | Fetch full document by file hash |
| `getHistory(id)` | Full version chain from latest → v1 |
| `getLatestByKey(docKey)` | Get latest version ID for a document |
| `getAllSubjects()` | List all subjects ever used |
| `getDocumentsBySubject(subject)` | Get root document IDs for a subject |
| `getDocumentDetailsBySubject(subject)` | Get latest version structs for a subject |

### Access Control

```solidity
if (parentId != 0) {
    require(
        documents[parentId].uploader == msg.sender,
        "Only original uploader can update"
    );
}
```

Only the wallet that originally uploaded a document can push revisions.

---

## 🧪 How to Run

### 1. Install Dependencies

```bash
# Root
npm install

# Frontend
cd frontend && npm install
```

### 2. Configure `.env`

```env
PRIVATE_KEY=<hardhat_account_private_key>
PINATA_JWT=<your_pinata_jwt_token>
```

### 3. Start Hardhat Node

```bash
npx hardhat node
```

### 4. Compile & Deploy Contract

```bash
npx hardhat clean
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

Copy the printed contract address.

### 5. Update Contract Address

Update the address in **both**:
- `frontend/src/utils/contract.js`
- `utils/contract.js`

### 6. Start Backend

```bash
node server.js
```

### 7. Start Frontend

```bash
cd frontend
npm run dev
```

### 8. Connect MetaMask

- Network: `localhost:8545`
- Chain ID: `31337`
- Import a Hardhat account private key (printed when node starts)

---

## 🧪 Testing Guide

### ✅ Test 1 — Upload
Select a file, enter subject (e.g. "Mathematics"), click Upload.
```
✅ Uploaded!
File: notes.pdf
Subject: Mathematics
CID: Qm...
Parent ID: None (first version)
```

### ❌ Test 2 — Tamper Detection
Modify the file, then click Verify.
```
❌ File not found on chain — may be tampered or never uploaded
```

### 🔄 Test 3 — Versioning
Upload the same filename again (updated content).
```
✅ Uploaded!
Parent ID: 1   ← linked to first version
```

### ⚠️ Test 4 — Old Version Detection
Verify the original (v1) file after uploading v2.
```
✅ Authentic
⚠️ This is NOT the latest version
Version: 1 of 2 (2 total)
```

### 📜 Test 5 — Version History
Select any version of the file, click History.
```
── Version 2 (latest)
   ID: 2 | Subject: Mathematics | Parent ID: 1

── Version 1
   ID: 1 | Subject: Mathematics | Parent ID: None
```

### 📂 Test 6 — Browse by Subject
Click "Load All Subjects" → select "Mathematics" → Browse.
```
notes.pdf
Subject: Mathematics
Uploader: 0xf39F...
IPFS: Qm...
```

---

## 🧠 Design Decisions

### Why SHA-256?
- Deterministic — same file always produces same hash
- Collision-resistant — different files never share a hash
- Industry standard for document integrity verification

### Why IPFS?
- Decentralized, censorship-resistant storage
- Content-addressable (CID is derived from content)
- Keeps large file data off-chain, reducing gas costs

### Why Proof of Authority (PoA)?
Hardhat's local network uses **Proof of Authority** consensus. This was chosen because:
- Document verification requires **fast, deterministic finality** — PoA provides near-instant confirmation vs PoW's probabilistic finality
- **Zero mining cost** — critical for a student platform where gas fees must be minimal
- Trust is anchored to **cryptographic hashes**, not the validator set — so PoA's trusted validator model doesn't compromise the system's integrity
- For production, Ethereum mainnet's **Proof of Stake** would be appropriate for the same reasons: fast finality, low energy cost, and economic security

### Why filename as `docKey`?
Provides a stable, human-readable identity for a document across versions. A hash-only system would have no way to link "the same document" across edits.

---

## ⚠️ Limitations

- Requires MetaMask browser extension
- Currently runs on local Hardhat node (not mainnet/testnet)
- Document identity relies on consistent filename (`docKey`) — renaming a file breaks the version chain
- No role-based access beyond original-uploader enforcement

---

## 🚀 Future Improvements

- Public deployment on Polygon or Ethereum Sepolia testnet
- IPFS gateway viewer built into the Browse tab
- Role-based permissions (e.g. course admin can approve uploads)
- Search by uploader wallet or keyword
- Better document identity system (content-derived key, not filename)
- Email/notification when a document you rely on is updated

---

## 📌 Summary

| Feature | Status |
|---|---|
| Cryptographic hash stored on-chain | ✅ |
| Uploader wallet recorded | ✅ |
| Timestamp recorded | ✅ |
| Subject/topic metadata on-chain | ✅ |
| Version history with parent links | ✅ |
| Only original uploader can revise | ✅ |
| Tamper detection via hash comparison | ✅ |
| IPFS decentralized file storage | ✅ |
| Browse documents by subject | ✅ |
| Unique on-chain ID per document | ✅ |