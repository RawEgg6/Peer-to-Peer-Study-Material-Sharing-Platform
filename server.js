import express from "express";
import multer from "multer";
import fs from "fs";
import cors from "cors";

import { generateFileHash } from "./utils/hash.js";
import { uploadToIPFS } from "./utils/ipfs.js";
import { getContract } from "./utils/contract.js";

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    // ✅ subject comes from the form field — default to "General" if not provided
    const subject = req.body.subject?.trim() || "General";

    const hash = await generateFileHash(filePath);
    const cid = await uploadToIPFS(filePath);
    const contract = await getContract();

    const docKey = req.file.originalname;

    let parentId = 0;

    try {
      const lastId = await contract.getLatestByKey(docKey);
      if (Number(lastId) !== 0) {
        parentId = Number(lastId);
      }
    } catch (err) {
      parentId = 0;
    }

    // ✅ pass subject as 5th argument — matches updated contract signature
    const tx = await contract.uploadDocument(
      cid,
      "0x" + hash,
      docKey,
      parentId,
      subject
    );

    await tx.wait();

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      hash,
      cid,
      parentId,
      docKey,
      subject,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// ✅ NEW: get all documents for a subject
app.get("/browse/:subject", async (req, res) => {
  try {
    const contract = await getContract();
    const subject = decodeURIComponent(req.params.subject);
    const docs = await contract.getDocumentDetailsBySubject(subject);

    const formatted = docs.map(d => ({
      id: Number(d[0]),
      uploader: d[1],
      ipfsHash: d[2],
      docKey: d[6],
      subject: d[7],
      timestamp: Number(d[5]),
    }));

    res.json({ success: true, documents: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Browse failed" });
  }
});

// ✅ NEW: get all known subjects
app.get("/subjects", async (req, res) => {
  try {
    const contract = await getContract();
    const subjects = await contract.getAllSubjects();
    res.json({ success: true, subjects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});