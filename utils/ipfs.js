import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

export async function uploadToIPFS(filePath) {
  try {
    const data = new FormData();
    data.append("file", fs.createReadStream(filePath));

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data,
      {
        maxBodyLength: "Infinity",
        headers: {
          ...data.getHeaders(),
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
      }
    );

    return res.data.IpfsHash;

  } catch (err) {
    console.error("❌ Pinata Upload Error:");
    console.error(err.response?.data || err.message);
    throw err;
  }
}