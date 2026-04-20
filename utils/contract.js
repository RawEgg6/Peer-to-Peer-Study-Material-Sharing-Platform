import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const CONTRACT_ADDRESS = "0xB581C9264f59BF0289fA76D61B2D0746dCE3C30D";

const artifact = JSON.parse(
  fs.readFileSync("./artifacts/contracts/DocumentVerifier.sol/DocumentVerifier.json")
);

export function getContract() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  return new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, wallet);
}