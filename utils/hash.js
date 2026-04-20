import fs from "fs";
import { sha256 } from "js-sha256";

export function generateFileHash(filePath) {
  const buffer = fs.readFileSync(filePath);
  return sha256(buffer);
}