import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xB581C9264f59BF0289fA76D61B2D0746dCE3C30D"; // update after redeploy

const ABI = [
  // subject is now the 5th argument
  "function uploadDocument(string,bytes32,string,uint256,string)",

  "function verifyDocument(bytes32) view returns (bool)",

  // tuple now has 8 fields (added subject at the end)
  "function getDocumentByHash(bytes32) view returns (tuple(uint256,address,string,bytes32,uint256,uint256,string,string))",
  "function getDocument(uint256) view returns (tuple(uint256,address,string,bytes32,uint256,uint256,string,string))",
  "function getHistory(uint256) view returns (tuple(uint256,address,string,bytes32,uint256,uint256,string,string)[])",
  "function getLatestByKey(string) view returns (uint256)",

  // ✅ new functions
  "function getAllSubjects() view returns (string[])",
  "function getDocumentsBySubject(string) view returns (uint256[])",
  "function getDocumentDetailsBySubject(string) view returns (tuple(uint256,address,string,bytes32,uint256,uint256,string,string)[])",

  // ✅ event (optional but useful for future listeners)
  "event DocumentUploaded(uint256 indexed id, address indexed uploader, string docKey, string subject, uint256 parentId, uint256 timestamp)"
];

export async function getContract() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}