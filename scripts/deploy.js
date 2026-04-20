import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const contractJson = JSON.parse(
    fs.readFileSync("./artifacts/contracts/DocumentVerifier.sol/DocumentVerifier.json")
  );

  const factory = new ethers.ContractFactory(
    contractJson.abi,
    contractJson.bytecode,
    wallet
  );

  const contract = await factory.deploy();

  console.log("⏳ Deploying...");
  await contract.waitForDeployment();

  console.log("✅ Contract deployed to:", await contract.getAddress());
}

main().catch(console.error);