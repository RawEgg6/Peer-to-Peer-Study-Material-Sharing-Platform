import { generateFileHash } from "../utils/hash.js";
import { getContract } from "../utils/contract.js";

const filePath = "./sample.txt";

async function main() {
  const hash = generateFileHash(filePath);
  console.log("File Hash:", hash);

  const contract = getContract();

  const exists = await contract.verifyDocument("0x" + hash);

  if (exists) {
    console.log("✅ File exists (authentic)");

    const doc = await contract.getDocumentByHash("0x" + hash);

    console.log("📄 Document Details:");
    console.log("Uploader:", doc[1]);
    console.log("IPFS:", doc[2]);
    console.log("Parent ID:", doc[4].toString());
  } else {
    console.log("❌ File NOT found (tampered/new)");
  }
}

main().catch(console.error);