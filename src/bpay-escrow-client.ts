import { TronWeb } from 'tronweb';
import dotenv from 'dotenv';

dotenv.config();

export async function approveBuyer(address: string,contractAddress: string) {

    const tronWeb = new TronWeb({
         fullHost: process.env.TRON_NODE_API,
         privateKey: process.env.PRIVATE_KEY_NILE,
       });

       const contract = await tronWeb.contract().at(contractAddress);

  // Example params for setVerified(address user, bool verified)
  const userToVerify = address; // "TQxW9gH7VbM8mUjAPBZRn1gNPLJAKdZC4n"; // sample user
  const verified = true;
  let receipt
  try {
    const tx = await contract
      .setVerified(userToVerify, verified)
      .send({
        feeLimit: 100_000_000,
      });

    console.log("✅ Transaction broadcasted:", tx);

    // Optionally fetch receipt
    receipt = await tronWeb.trx.getTransactionInfo(tx);
    console.log("📋 Receipt:", receipt);
    return {success:true, message: receipt, txId: tx };
  } catch (err) {
    console.error("❌ Error calling setVerified:", err);
  }

     return {success:false, message: 'error', txId: '' };
 
   
 }