import { ethers } from "ethers";
import { Wallet, JsonRpcProvider, Contract, keccak256, toUtf8Bytes } from "ethers";
import dotenv from 'dotenv';


dotenv.config();



// ====== ABI (minimal) ======
const ABI = [

  "function setAllowedPool(address pool, bool allowed) external",
  "function addTrustedAttestor(address attestor) external",
  "function setAttestation(address borrower, uint256 creditLimit, uint256 creditScore, bool kycVerified) external",
  "function increaseUsedCredit(address borrower, uint256 amount) external",
  "function decreaseUsedCredit(address borrower, uint256 amount) external",
  "function getAttestation(address borrower) external view returns (uint256 creditLimit, uint256 creditScore, bool kycVerified, uint256 utilizedLimit, address attestor, uint256 updatedAt)"
 ];


// Minimal ERC20 ABI
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) external",
  "function decimals() view returns (uint8)"
];

// ====== Provider & Wallet ======

//const wallet = new ethers.Wallet(PRIVATE_KEY!, provider);
//const contract = new ethers.Contract(CONTRACT_ADDRESS!, ABI, wallet);

// ====== Constants ======
const DECIMALS = ethers.parseUnits("1", 18); // For scaling rates


// ====== Main: Deposit into vault ======
export async function ethSetPoolAndAttestor(key: string,
  poolAddress: string,
  rpcUrl: string,
  contractAddress: string,
  attestorAddress: string
 ) {
    // Generate unique reference

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(key!, provider);
    const contract = new ethers.Contract(contractAddress!, ABI, wallet);
    const publicAddress = await wallet.getAddress();

    console.log("Public address:", publicAddress);

    //await contract.addTrustedAttestor(ethers.getAddress(publicAddress));
    //await contract.addTrustedAttestor(ethers.getAddress(attestorAddress));

    const tx = await contract.setAllowedPool(ethers.getAddress(poolAddress),true);
    console.log(`🚀 Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Mined in block ${receipt.blockNumber}`);

    await sleep(5000); 

    await contract.addTrustedAttestor(ethers.getAddress(attestorAddress));

    return {success: true, message: 'PENDING', txId: tx.hash  };
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export async function setBorrowerAttestation(key: string,
  borrower: string,
  creditLimit: string,
  creditScore: string,
  kycVerified: boolean,
  rpcUrl: string,
  contractAddress: string
 ) {
    

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(key!, provider);
    const contract = new ethers.Contract(contractAddress!, ABI, wallet);
    const publicAddress = await wallet.getAddress();

    console.log("Public address:", publicAddress);
    const creditLimitInt = ethers.parseUnits(creditLimit, 6);

     console.log('processing...')
     
     const tx = await contract.setAttestation( borrower,  creditLimitInt,  creditScore,  kycVerified);
       
    console.log(`🚀 Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Mined in block ${receipt.blockNumber}`);
    return {success: true, message: 'PENDING', txId: tx.hash  };
}

  type attestationData = [bigint, bigint, boolean,bigint, string, bigint];

export async function getBorrowerAttestation(borrower:string, rpcUrl: string, contractAddress: string) {
    
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
       
    const vault = new ethers.Contract(contractAddress, ABI, provider);

    // 3️⃣ Call the view function
    const response = await vault.getAttestation(borrower);
    console.log(response);
    const [creditLimit,  creditScore,  kycVerified,  utilizedLimit,  attestor,  updatedAt ] = response as attestationData;
    console.log(response);
    

    // 4️⃣ Format response for readability
    const result ={success: true, message:'SUCCESS',
       creditLimit: ethers.formatUnits(creditLimit.toString(),6),
       creditScore: creditScore.toString(),
       kycVerified: kycVerified,
       utilizedLimit: ethers.formatUnits(utilizedLimit.toString(),6),
       attestor: attestor,
       updatedAt: updatedAt.toString()
    };

    console.log("📦 attestation data :", result);
    return result;
}

function formatTimestamp(timestamp: number): string {
  // Convert seconds → milliseconds
  const date = new Date(timestamp * 1000);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1); // Months start from 0
  const year = date.getFullYear();

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

