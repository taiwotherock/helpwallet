import { TronWeb } from 'tronweb';
import dotenv from 'dotenv';
const fs = require('fs');
const path = require('path');

dotenv.config();


const abiArtifact =JSON.parse(
    fs.readFileSync('./contracts-abi/AccessControlModuleV3.json', 'utf8')
);


export async function addCreditOfficer(creditOfficer: string, privateKey: string) {

    try {

    const tronWeb = new TronWeb({
        fullHost: process.env.TRON_NODE_URL,
        privateKey: privateKey,
      });

      //const fromAddress1 = tronWeb.defaultAddress.base58;
      let CONTRACT_ADDRESS = process.env.ACCESS_CONTROL_CONTRACT_ADDRESS

      console.log('CONTRACT_ADDRESS ' + CONTRACT_ADDRESS)
      console.log('credit address ' + creditOfficer)

      const me = tronWeb.defaultAddress.base58;    
      console.log('from address ' + me)   
      
      // --- Load JSON Contract ---
      const contract = await tronWeb.contract(abiArtifact.abi, CONTRACT_ADDRESS);

      // issue Credit score NFT
      const tx = await contract.addCreditOfficer(creditOfficer).send({
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
