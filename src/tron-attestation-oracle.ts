import { TronWeb } from 'tronweb';
import dotenv from 'dotenv';
const fs = require('fs');
const path = require('path');

dotenv.config();


const abiArtifact =JSON.parse(
    fs.readFileSync('./contracts-abi/BNPLAttestationOracle.json', 'utf8')
);


export async function tronSetPoolAndAttestor(key: string,
  poolAddress: string,
  contractAddress: string,
  rpcUrl: string,
  attestorAddress: string
 )  {

    try {

    const tronWeb = new TronWeb({
        fullHost: rpcUrl,
        privateKey: key,
      });

      //const fromAddress1 = tronWeb.defaultAddress.base58;
      //let CONTRACT_ADDRESS = process.env.ACCESS_CONTROL_CONTRACT_ADDRESS

      console.log('CONTRACT_ADDRESS ' + " " + contractAddress + " " +  attestorAddress)
     
      const me = tronWeb.defaultAddress.base58;    
      console.log('from address ' + me)   
      
      // --- Load JSON Contract ---
      const contract = await tronWeb.contract(abiArtifact.abi, contractAddress);

      const tx2 = await contract.addTrustedAttestor(attestorAddress).send({
        from: me,
        feeLimit: 3_000_000_000 // 100 TRX energy fee limit
      });
      console.log(tx2);

      // issue Credit score NFT
      const tx = await contract.setAllowedPool(poolAddress,true).send({
        from: me,
        feeLimit: 3_000_000_000 // 100 TRX energy fee limit
      });

      console.log("Add address. TxID:", tx);

      
  
      return {success:true, txId: tx, message: 'SUCCESS'};
    }
    catch(err)
    {
       console.log(err)
       return {success:false, txId: '', message: err.message};

    }
}

export async function tronSetBorrowerAttestation(key: string,
  borrower: string,
  creditLimit: string,
  creditScore: string,
  kycVerified: boolean,
  rpcUrl: string,
  contractAddress: string
 )  {

    try {

    const tronWeb = new TronWeb({
        fullHost: rpcUrl,
        privateKey: key,
      });

      //const fromAddress1 = tronWeb.defaultAddress.base58;
      //let CONTRACT_ADDRESS = process.env.ACCESS_CONTROL_CONTRACT_ADDRESS

      console.log('CONTRACT_ADDRESS ' + " " + contractAddress + " " +  borrower)
     
      const me = tronWeb.defaultAddress.base58;    
      console.log('from address ' + me)   

      const amount = Number(creditLimit) * 1000000;
      
      // --- Load JSON Contract ---
      const contract = await tronWeb.contract(abiArtifact.abi, contractAddress);

      // issue Credit score NFT
      const tx = await contract.setAttestation( borrower,  amount,  creditScore,  kycVerified).send({
        from: me,
        feeLimit: 3_000_000_000 // 100 TRX energy fee limit
      });

      console.log("set credit limit:", tx);
  
      return {success:true, txId: tx, message: 'SUCCESS'};
    }
    catch(err)
    {
       console.log(err)
       return {success:false, txId: '', message: err.message};

    }
}

export async function tronGetBorrowerAttestation(borrower: string, contractAddress: string, rpcUrl: string, key:string
   ) {


    try {

    const tronWeb = new TronWeb({
        fullHost: rpcUrl,
        privateKey: key
      });

      //const fromAddress1 = tronWeb.defaultAddress.base58;
      //let CONTRACT_ADDRESS = process.env.VAULT_LENDING_CONTRACT_ADDRESS
      /*
      function getAttestation(address borrower) external view returns (uint256 creditLimit, 
    uint256 creditScore, bool kycVerified, uint256 utilizedLimit, address attestor, uint256 updatedAt)
    */

      console.log('CONTRACT_ADDRESS ' + contractAddress)
     
      // --- Load Loan Vault ---
      const contract = await tronWeb.contract(abiArtifact.abi, contractAddress);

      let result = await contract.getAttestation(borrower).call();
       console.log('borrower details:: ' + result); 
      const result2 = result.toString();
      console.log(result2);
       
       
      return {success:true, txId: '', data: mapToLoan(result,tronWeb)};
    }
    catch(err)
    {
       console.log(err)
       return {success:false, txId: '', message: err.message};

    }
}

function bytes32HexToString(bytes32: any, tronWeb: TronWeb): string
{
    // 1️⃣ Remove the leading "0x" if necessary

    console.log(typeof bytes32);
    console.log(bytes32)
    let hexStr: string;

    hexStr = bytes32.toString("hex").replace(/^0x/, "");

  //const hexStr = bytes32.startsWith("0x") ? bytes32.slice(2) : bytes32;

  // 2️⃣ Convert from hex to UTF-8 string
  const text = tronWeb.toUtf8(hexStr).replace(/\u0000/g, "");
  return text;

}


function stringToBytes32(input: string, tronWeb: TronWeb): string {
    // Convert string to hex
    let hex = tronWeb.toHex(input); // tronWeb.toHex exists

    // tronWeb.toHex may return variable length, need 32 bytes (64 chars)
    if (hex.length > 66) {
        // truncate to 32 bytes (0x + 64 chars)
        hex = '0x' + hex.slice(2, 66);
    } else {
        // pad with zeros to make 32 bytes
        hex = hex.padEnd(66, '0');
    }
    return hex;
}


function mapToLoan(raw: string, tronWeb: TronWeb): Loan {
  const parts = raw[0][0]; //.split(",");

  //if (parts.length < 13) throw new Error("Invalid loan data");

  // Decode bytes32 ref to string
  const refHex = parts[0];
  console.log('refx ' + refHex);
  const ref = bytes32HexToString(refHex,tronWeb);
  console.log(ref)

  return {
    ref,
    borrower: tronWeb.address.fromHex(parts[1]),
    token: tronWeb.address.fromHex(parts[2]),
    merchant: tronWeb.address.fromHex(parts[3]),
    principal: (Number(parts[4])/1000000).toString(),
    outstanding: (Number(parts[5])/1000000).toString(),
    startedAt: parts[6].toString(),
    installmentsPaid: (Number(parts[7].toString())/1000000).toString(),
    fee: (Number(parts[8].toString())/1000000).toString(),
    totalPaid: (Number(parts[9].toString())/1000000).toString(),
    active: parts[10] === "true",
    disbursed: parts[11] === "true",
  };
}

interface Loan {
  ref: string;
  borrower: string;
  token: string;
  merchant: string;
  principal: string;
  outstanding: string;
  startedAt: string;
  installmentsPaid: string;
  fee: string;
  totalPaid: string;
  active: boolean;
  disbursed: boolean;
}
