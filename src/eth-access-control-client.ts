import { ethers } from "ethers";
import { Wallet, JsonRpcProvider, Contract, keccak256, toUtf8Bytes } from "ethers";
import dotenv from 'dotenv';

dotenv.config();

// ====== Config ======
const RPC_URL = process.env.B_RPC_URL; // Replace with your network RPC
const PRIVATE_KEY = process.env.B_KEY; // Admin wallet private key
const CONTRACT_ADDRESS = process.env.ACCESS_CONTROL_CONTRACT_ADDRESS; // Deployed contract address

// ====== ABI (minimal) ======
const ABI = [
  "function addCreditOfficer(address account) external",
  "function isCreditOfficer(address account) public view returns (bool)",
  "function isAdmin(address account) public view returns (bool)"
];

// ====== Constants ======
const ADMIN_ROLE = keccak256(toUtf8Bytes("ADMIN_ROLE"));

// ====== Provider & Wallet ======


// ====== Functions ======

/**
 * Grant admin role to an address
 */
export async function addAdmin(key: string, rpcUrl: string, contractAddress:string,
   address: string, role:string) {

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(key, provider);
  console.log("contract address: " + contractAddress);
  const contract = new ethers.Contract(contractAddress, ABI, wallet);
  const role2 = keccak256(toUtf8Bytes(role));
  console.log("grant role " + role + ' ' + role2);

   let result: boolean = false;

  if(role == 'CREDIT_OFFICER')
  {
      //addCreditOfficer
      result = await contract.isCreditOfficer(address);
      console.log(result)
      if(result)
      {
        return {success:true, message:"SUCCESS", txId: ''};
      }

       const tx = await contract.addCreditOfficer(address);
        console.log(`Transaction sent: ${tx.hash}`);
        await tx.wait();
        console.log(`credit role granted to ${address}`);
        return {success: true, message:'SUCCESS', txId: tx.hash }
  }
  else if(role == 'ADMIN')
  {
      result = await contract.isAdmin(address);
      console.log(result)
      if(result)
      {
        return {success:true, message:"SUCCESS", txId: ''};
      }

       const tx = await contract.addAdmin(address);
        console.log(`Transaction sent: ${tx.hash}`);
        await tx.wait();
        console.log(`admin role granted to ${address}`);
        return {success: true, message:'SUCCESS', txId: tx.hash }
  }
       
}

/**
 * Revoke admin role from an address
 */
export async function removeAdmin(key: string, rpcUrl: string, contractAddress:string,
   address: string,role: string) {

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(key, provider);
  const contract = new ethers.Contract(contractAddress, ABI, wallet);

  const role2 = keccak256(toUtf8Bytes(role));
  console.log("revoke role " + role +role2);

  const tx = await contract.revokeRole(role2, address);
  console.log(`Transaction sent: ${tx.hash}`);
  await tx.wait();
  console.log(`Admin role revoked from ${address}`);
  return {success: true, message:'SUCCESS', txId: tx.hash }
}

/**
 * Check if an address is an admin
 */
export async function checkIsAdmin(address: string,rpcUrl: string, contractAddress: string): Promise<boolean> {

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
 const contract = new ethers.Contract(contractAddress, ABI, provider);
  const result: boolean = await contract.isAdmin(address);
  console.log(`${address} is admin: ${result}`);
  return result;
}
