import { TronWeb } from 'tronweb';
import dotenv from 'dotenv';
const fs = require('fs');
const path = require('path');

dotenv.config();


const bcsNftArtifact =JSON.parse(
    fs.readFileSync('./contracts-abi/BorderlessCreditScoreNFT.json', 'utf8')
);


export async function issueNftCreditScore(privateKey: string, 
  borrower: string,
  creditScore: number,
  creditLimit: string,
  creditOfficer: string,
  creditManager: string) {

    try {

    const tronWeb = new TronWeb({
        fullHost: process.env.TRON_NODE_URL,
        privateKey: privateKey,
      });

      //const fromAddress1 = tronWeb.defaultAddress.base58;
      let CONTRACT_ADDRESS = process.env.BORDERLESSCS_NFT_CONTRACT_ADDRESS

      console.log('CONTRACT_ADDRESS ' + CONTRACT_ADDRESS)
      const me = tronWeb.defaultAddress.base58;    
      console.log('from address ' + me);   
  
      // --- Load BorderLessNFT ---
      const contract = await tronWeb.contract(bcsNftArtifact.abi, CONTRACT_ADDRESS);
      
      

      // issue Credit score NFT
      const tx = await contract.issueCreditNFT(
        borrower,
        Number(creditScore),
        Number(creditLimit),
        creditOfficer,
        creditManager
      ).send({
        from: me,
        feeLimit: 3_000_000_000 // 100 TRX energy fee limit
      });

      console.log("Credit NFT Issued. TxID:", tx);
    return {success:true, txId: tx, message: 'SUCCESS'};
    }
    catch(err)
    {
       console.log(err)
       return {success:false, txId: '', message: err.message};

    }
}
