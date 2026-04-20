import { generateFileHash } from "../utils/hash.js";
import { uploadToIPFS } from "../utils/ipfs.js";
import { getContract } from "../utils/contract.js";

const filePath = "./sample.txt";

async function main() {
    const hash = generateFileHash(filePath);
    console.log("File Hash:", hash);

    const cid = await uploadToIPFS(filePath);
    console.log("IPFS CID:", cid);

    const contract = getContract();

    // get last doc
    const count = await contract.getDocumentCount();

    const tx = await contract.uploadDocument(
    cid,
    "0x" + hash,
    "Math",
    count   // 🔥 link to previous version
    ); 

    await tx.wait();

    console.log("✅ Stored on blockchain!");
}

main().catch(console.error);