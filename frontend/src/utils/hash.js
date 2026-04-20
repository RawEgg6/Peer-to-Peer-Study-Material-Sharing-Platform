import { sha256 } from "js-sha256";

export async function generateFileHash(file) {
  const buffer = await file.arrayBuffer();
  const hash = sha256(new Uint8Array(buffer));
  return hash;
}