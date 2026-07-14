import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const CONTRACT_ADDRESS = "0xb09da8a5B236fE0295A345035287e80bb0008290";

const artifact = JSON.parse(
  fs.readFileSync("./artifacts/contracts/DocumentVerifier.sol/DocumentVerifier.json")
);

export function getContract() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  return new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, wallet);
}