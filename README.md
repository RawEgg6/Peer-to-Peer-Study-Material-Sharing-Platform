# 🛡️ Study Verifier — Blockchain-Backed Document Authenticity

> **Anchoring academic documents to the blockchain** — upload, verify, version, and browse study materials with cryptographic guarantees. Every file hash lives on-chain; every revision is linked; tampering is instantly detectable.

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [How It Works](#-how-it-works)
- [Architecture](#️-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#1-install-dependencies)
  - [Environment Setup](#2-configure-environment)
  - [Smart Contract Deployment](#3-deploy-the-smart-contract)
  - [Running the App](#4-start-the-application)
- [Smart Contract](#-smart-contract)
  - [Document Structure](#document-structure)
  - [Key Functions](#key-functions)
  - [Access Control](#access-control)
- [API Endpoints](#-api-endpoints)
- [Frontend Tabs](#-frontend)
  - [Upload](#upload-tab)
  - [Verify](#verify-tab)
  - [History](#history-tab)
  - [Browse](#browse-tab)
- [CLI Scripts](#-cli-scripts)
- [Testing Guide](#-testing-guide)
- [Design Decisions](#-design-decisions)
- [Limitations](#-limitations)
- [Future Improvements](#-future-improvements)
- [Feature Summary](#-feature-summary)

---

## 🎯 Problem Statement

Students and educators share study materials through WhatsApp, Google Drive, and LMS platforms, but face fundamental trust issues:

| Problem | Consequence |
|---|---|
| ❌ No way to verify a file hasn't been modified | Outdated or tampered content spreads unnoticed |
| ❌ No authorship or attribution tracking | Material origin is impossible to prove |
| ❌ No version control or revision history | "Which version is current?" is guesswork |
| ❌ No immutable timestamping | "When was this uploaded?" is hearsay |

---

## ✅ Solution

This platform solves each problem with cryptographic and blockchain primitives:

| Mechanism | What It Provides |
|---|---|
| 🔒 **SHA-256 hashing** + on-chain storage | File authenticity — any modification changes the hash |
| 🧾 **Uploader wallet address** stored on-chain | Permanent authorship attribution |
| 🔄 **Linked parent IDs** in the smart contract | Full version history (newest → original) |
| ⏱️ **`block.timestamp`** recorded on-chain | Immutable, trustless timestamps |
| 🏷️ **Subject metadata** indexed on-chain | Browse and discover documents by topic |
| 🌐 **IPFS decentralized storage** | Censorship-resistant, content-addressed file hosting |

---

## 🧠 How It Works

```
                  ┌─────────────┐
                  │   User      │
                  │  (Browser)  │
                  └──────┬──────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │  Upload  │   │  Verify  │   │  Browse  │
   │  File    │   │  Hash    │   │  by Subj │
   └────┬─────┘   └────┬─────┘   └────┬─────┘
        │               │              │
        ▼               ▼              ▼
   ┌────────────────────────────────────────┐
   │          Express Backend (:3001)       │
   │  ┌─────────┐  ┌──────────┐  ┌──────┐  │
   │  │ SHA-256 │  │  IPFS    │  │Contract│  │
   │  │  Hash   │  │ (Pinata) │  │(Ethers)│  │
   │  └─────────┘  └──────────┘  └──────┘  │
   └──────────────────┬─────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼                         ▼
   ┌──────────────┐       ┌──────────────────┐
   │  Blockchain  │       │  IPFS / Pinata   │
   │  (Hardhat)   │       │  (File Storage)  │
   │  :8545       │       │                  │
   └──────────────┘       └──────────────────┘
```

### Upload Flow

1. User selects a file and enters a subject/topic
2. Backend hashes the file with **SHA-256**
3. File is uploaded to **IPFS via Pinata** → returns a content identifier (CID)
4. Backend checks if the filename (`docKey`) has a prior version on-chain
5. A blockchain transaction stores:
   - `fileHash` (SHA-256), `ipfsHash` (CID), `uploader` (wallet), `subject`, `parentId`, `timestamp`
6. `latestByKey[docKey]` is updated to the new version ID
7. First versions are indexed under the subject for browsing

### Verification Flow

1. User selects a file in the Verify tab
2. Hash is computed **in the browser** (client-side SHA-256) — no upload needed
3. `verifyDocument(hash)` is called on the smart contract
4. If found: metadata is fetched and compared against `latestByKey`
5. Result: **Authentic**, **Not the latest version**, or **Tampered / Not found**

### Versioning Logic

```
v1 (parentId: 0)  ←  v2 (parentId: 1)  ←  v3 (parentId: 2)
                      ↑
                 parentId links
```

- `parentId = 0` means first upload (root document)
- Only the **original uploader's wallet** can push a revision
- `getLatestByKey(docKey)` always points to the newest version
- `getHistory(latestId)` traverses the full chain backwards

---

## 🏗️ Architecture

```
p2p_file_share/
│
├── contracts/                    # Solidity smart contract
├── scripts/                      # Deployment & CLI utilities
├── frontend/                     # React + Vite SPA
├── utils/                        # Backend Node.js utilities
├── server.js                     # Express API server
├── hardhat.config.js             # Hardhat configuration
└── .env                          # Environment variables
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Blockchain** | Ethereum (Hardhat local node / Polygon testnet) |
| **Smart Contract** | Solidity ^0.8.20 |
| **File Storage** | IPFS via Pinata |
| **Backend** | Node.js + Express 5 |
| **Frontend** | React 19 + Vite 8 |
| **Blockchain SDK** | ethers.js v6 |
| **Hashing** | SHA-256 (`js-sha256`) |
| **Build Tools** | Hardhat, esbuild, Vite |

---

## 📁 Project Structure

```
p2p_file_share/
│
├── contracts/
│   └── DocumentVerifier.sol      # 📝 Smart contract (upload, verify, history, browse)
│
├── scripts/
│   ├── deploy.js                 # 🚀 Deploy contract to the blockchain
│   ├── upload.js                 # 📤 CLI tool for uploading files
│   └── verify.js                 # 🔍 CLI tool for verifying files
│
├── frontend/
│   ├── index.html                # Entry HTML
│   ├── vite.config.js            # Vite configuration
│   ├── package.json              # Frontend dependencies
│   └── src/
│       ├── main.jsx              # React entry point
│       ├── App.jsx               # 🖥️ Main UI (Upload / Verify / History / Browse)
│       ├── App.css               # Component CSS classes
│       ├── index.css             # Global styles + CSS variables
│       └── utils/
│           ├── contract.js       # 🔗 Ethers.js contract interface + ABI
│           └── hash.js           # 🔐 Browser-side SHA-256 hashing
│
├── utils/
│   ├── contract.js               # 🔗 Node.js contract interface (Ethers)
│   ├── hash.js                   # 🔐 Node.js SHA-256 hashing
│   └── ipfs.js                   # ☁️ Pinata IPFS upload client
│
├── server.js                     # ⚡ Express backend API server
├── hardhat.config.js             # ⛓️ Hardhat network & compiler config
├── package.json                  # Root dependencies
├── .env                          # 🔑 Environment variables (PRIVATE_KEY, PINATA_JWT)
├── sample.pdf                    # Sample file for testing
├── uploads/                      # Temporary file storage (auto-cleaned)
├── artifacts/                    # Hardhat compilation output
└── cache/                        # Hardhat cache
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18 (uses ES modules)
- **npm** or **pnpm**
- **MetaMask** browser extension (or any Ethereum wallet)
- A **Pinata** account (free tier works) for IPFS uploads

---

### 1. Install Dependencies

```bash
# Root (backend + smart contract tooling)
npm install

# Frontend
cd frontend && npm install && cd ..
```

---

### 2. Configure Environment

Copy or create a `.env` file in the project root:

```env
# Hardhat account private key (for local node or testnet)
PRIVATE_KEY=df57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e

# Optional: RPC URL for testnet deployment (e.g. Polygon Amoy)
RPC_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY

# Pinata JWT token (get from https://app.pinata.cloud/developers/api-keys)
PINATA_JWT=your_pinata_jwt_here
```

> **Note:** The default `PRIVATE_KEY` is the first Hardhat development account, which has 10,000 ETH on the local node. **Never use this key on mainnet.**

---

### 3. Deploy the Smart Contract

#### Option A: Local Hardhat Node (development)

```bash
# Start a local Hardhat blockchain node (keep this terminal open)
npx hardhat node

# In a new terminal:
npx hardhat compile     # Compile Solidity
npx hardhat run scripts/deploy.js --network localhost
```

Copy the printed contract address (e.g., `0xb09da8a5B236fE0295A345035287e80bb0008290`).

#### Option B: Polygon Amoy Testnet

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network polygonAmoy
```

> To use a custom network, add it to `hardhat.config.js` under `networks`.

#### Update Contract Address

Update the `CONTRACT_ADDRESS` constant in **both** files:

- `frontend/src/utils/contract.js`
- `utils/contract.js`

---

### 4. Start the Application

```bash
# Terminal 1: Hardhat node (if not already running)
npx hardhat node

# Terminal 2: Backend server (port 3001)
node server.js

# Terminal 3: Frontend dev server (port 5173)
cd frontend && npm run dev
```

### 5. Connect MetaMask

1. Open the frontend at `http://localhost:5173`
2. Connect MetaMask to **Localhost:8545**:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`
3. Import a Hardhat private key (printed when the node starts, or use `0xdf57...`)
4. Refresh the page and approve the connection request

---

## 🔐 Smart Contract

### DocumentVerifier.sol

The core of the system — an Ethereum smart contract written in Solidity ^0.8.20 deployed with Hardhat.

#### Document Structure

```solidity
struct Document {
    uint256 id;            // Unique document ID (auto-incrementing)
    address uploader;      // Wallet address that uploaded
    string  ipfsHash;      // IPFS content identifier (CID)
    bytes32 fileHash;      // SHA-256 hash of file content
    uint256 parentId;      // 0 = first version, otherwise links to previous
    uint256 timestamp;     // block.timestamp of upload
    string  docKey;        // Stable identity (filename) — used for version chains
    string  subject;       // Subject/topic metadata (e.g. "Mathematics")
}
```

#### Key Functions

| Function | Description |
|---|---|
| `uploadDocument(cid, hash, docKey, parentId, subject)` | Register a new document or revision |
| `verifyDocument(hash) → bool` | Returns `true` if hash exists on-chain |
| `getDocumentByHash(hash) → Document` | Fetch full document by file hash |
| `getDocument(id) → Document` | Fetch document by numeric ID |
| `getLatestByKey(key) → uint256` | Get latest version ID for a document |
| `getHistory(id) → Document[]` | Full version chain (latest → v1) |
| `getAllSubjects() → string[]` | List all subjects ever indexed |
| `getDocumentsBySubject(subject) → uint256[]` | Root document IDs for a subject |
| `getDocumentDetailsBySubject(subject) → Document[]` | Latest version structs for a subject |

#### Access Control

```solidity
if (parentId != 0) {
    require(
        documents[parentId].uploader == msg.sender,
        "Only original uploader can update"
    );
}
```

- **First upload**: anyone can upload any file
- **Revisions**: only the wallet that originally uploaded a `docKey` can push updates
- Subject indexing: only root documents (parentId == 0) are indexed under subjects — revisions are not duplicated in browse results

#### Events

```solidity
event DocumentUploaded(
    uint256 indexed id,
    address indexed uploader,
    string docKey,
    string subject,
    uint256 parentId,
    uint256 timestamp
);
```

---

## 🌐 API Endpoints

The Express backend runs on `http://localhost:3001`.

### `POST /upload`
Upload a file to IPFS and register it on the blockchain.

| Field | Type | Description |
|---|---|---|
| `file` (multipart) | File | The file to upload |
| `subject` (form) | String | Subject/topic (defaults to "General") |

**Response:**
```json
{
  "success": true,
  "hash": "abc123...",
  "cid": "Qm...",
  "parentId": 0,
  "docKey": "notes.pdf",
  "subject": "Mathematics"
}
```

### `GET /subjects`
List all subjects that have indexed documents.

**Response:**
```json
{
  "success": true,
  "subjects": ["Mathematics", "Physics", "History"]
}
```

### `GET /browse/:subject`
Get all documents (latest versions) for a specific subject.

**Response:**
```json
{
  "success": true,
  "documents": [
    {
      "id": 1,
      "uploader": "0xf39F...",
      "ipfsHash": "Qm...",
      "docKey": "notes.pdf",
      "subject": "Mathematics",
      "timestamp": 1700000000
    }
  ]
}
```

---

## 🖥️ Frontend

The React SPA features four main tabs in a dark-themed UI with a sidebar navigation.

### Upload Tab
- **Drag-and-drop** file upload zone with visual feedback
- **Subject field** to categorize the document
- Displays upload result with file name, subject, IPFS CID, and parent ID

### Verify Tab
- Drop a file to compute its SHA-256 hash **client-side** (file never leaves your machine)
- Checks the hash against the blockchain
- Shows: uploader, subject, IPFS link, and version info
- Flags if the file is **tampered**, **authentic**, or **not the latest version**

### History Tab
- Visual **timeline** of all versions for a document
- Each version shows uploader, IPFS CID, and timestamp
- Latest version is highlighted

### Browse Tab
- **"Load Subjects"** button fetches all indexed subjects from the chain
- Click a subject pill to select it, then **"Browse Documents"** to fetch
- Document cards show name, uploader, date, and a **"View on IPFS"** link

---

## 📟 CLI Scripts

Alongside the web UI, the project includes command-line scripts for automation and testing.

### Upload a file from the terminal

```bash
node scripts/upload.js
```

Edit `scripts/upload.js` to change the `filePath` variable. The script:
1. Hashes the file (SHA-256)
2. Uploads to IPFS via Pinata
3. Reads the latest document count from the contract
4. Stores a new document on-chain linked to the previous one

### Verify a file from the terminal

```bash
node scripts/verify.js
```

Edit `scripts/verify.js` to change the `filePath` variable. The script:
1. Hashes the file
2. Calls `verifyDocument()` on-chain
3. If found, prints full document metadata

---

## 🧪 Testing Guide

### ✅ Test 1 — Upload
Select a file, enter a subject (e.g. "Mathematics"), click **Upload**.
```
✅ Uploaded!
File: notes.pdf
Subject: Mathematics
CID: Qm...
Parent ID: None (first version)
```

### ❌ Test 2 — Tamper Detection
Modify the file, then click **Verify**.
```
❌ File not found on chain — may be tampered or never uploaded
```

### 🔄 Test 3 — Versioning
Upload the same filename again with updated content.
```
✅ Uploaded!
Parent ID: 1   ← linked to first version
```

### ⚠️ Test 4 — Old Version Detection
Verify the original (v1) file after uploading v2.
```
✅ Authentic
⚠️  This is NOT the latest version
Version: 1 of 2 (2 total)
```

### 📜 Test 5 — Version History
Select any version, click **View Version History**.
```
── Version 2 (latest)
   ID: 2 | Subject: Mathematics | Parent ID: 1
── Version 1
   ID: 1 | Subject: Mathematics | Parent ID: None
```

### 📂 Test 6 — Browse by Subject
Click **"Load Subjects"** → select a subject → **"Browse Documents"**.
```
notes.pdf
Subject: Mathematics
Uploader: 0xf39F...
IPFS: Qm...
```

### Test 7 — CLI Verification
```bash
node scripts/upload.js    # Upload sample.pdf
node scripts/verify.js    # Verify it
```

---

## 🧠 Design Decisions

| Decision | Rationale |
|---|---|
| **SHA-256** | Deterministic (same file → same hash), collision-resistant, industry standard for integrity verification |
| **IPFS + Pinata** | Decentralized, censorship-resistant, content-addressed storage. Keeps large files off-chain to minimize gas costs |
| **filename as `docKey`** | Provides a stable, human-readable identity for cross-version linking. Hash-only systems can't link "the same document" across edits |
| **Ethers.js v6** | Modern, well-maintained Ethereum library with type-safe contract interactions |
| **Client-side hashing for verify** | The file never leaves your machine during verification — the hash is computed in the browser for privacy |
| **Hardhat local node** | Fast, deterministic finality in development with zero gas costs. Perfect for testing before testnet deployment |

---

## ⚠️ Limitations

- **MetaMask required** — the frontend needs a browser wallet extension
- **Local dev by default** — runs on a local Hardhat node (configurable for testnet/mainnet)
- **Filename-dependent identity** — renaming a file breaks the version chain (`docKey` is based on the original filename)
- **No role-based access** — beyond original-uploader enforcement, there are no admin/moderator roles
- **No document deletion** — blockchain is append-only; entries cannot be removed
- **Single uploader per doc** — only the original uploader can push revisions (not a shared document model)

---

## 🚀 Future Improvements

- **Public deployment** on Polygon Amoy or Ethereum Sepolia testnet
- **IPFS gateway viewer** built into the Browse tab (preview PDFs/images inline)
- **Role-based permissions** (e.g. course admin can moderate uploads)
- **Search** by uploader wallet, keyword, or date range
- **Content-derived document identity** (hash-based `docKey`, not filename-based)
- **Notifications** when a subscribed document gets a new version
- **Batch upload** for multiple files at once
- **Dark/light mode toggle** (currently dark-only; CSS variables are prepared)
- **Mobile responsive** layout improvements

---

## ✅ Feature Summary

| Feature | Status |
|---|---|
| Cryptographic SHA-256 hash stored on-chain | ✅ |
| Uploader wallet address recorded | ✅ |
| Immutable `block.timestamp` timestamps | ✅ |
| Subject/topic metadata indexed on-chain | ✅ |
| Full version history with parent links | ✅ |
| Only original uploader can push revisions | ✅ |
| Client-side tamper detection via hash comparison | ✅ |
| IPFS decentralized file storage | ✅ |
| Browse documents by subject | ✅ |
| Auto-incrementing unique document IDs | ✅ |
| Drag-and-drop file upload | ✅ |
| Visual timeline for version history | ✅ |
| CLI scripts for automation | ✅ |
| Dark-themed responsive UI | ✅ |

---

## 📄 License

ISC

---

## 🙌 Contributing

This is an open educational tool. Feel free to fork, submit issues, or open PRs to improve the platform.

---

<p align="center">
  Built with ❤️ for decentralized education<br />
  <sub>Copyright © 2024 — Study Verifier Protocol</sub>
</p>
