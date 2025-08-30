import { TronWeb } from 'tronweb';
import dotenv from 'dotenv';
import * as CryptoJS from 'crypto-js';
import { fetchWalletKey } from './save-wallet';
import { decryptData } from './encryption';
import { initWeb } from './tron-init';

dotenv.config();


export async function transfer(receiverAddress: string, contractAddress: string, amount: number, 
     senderAddress: string, chain: string, symbol: string) {

      const key = process.env.ENC_KEY

       /*let pk = await fetchWalletKey(symbol,chain,senderAddress);
       console.log('pk ' + pk);
       let pkey1 = decryptData(pk,key)
       console.log('pkey1 ' + pkey1);*/


    const tronWeb = initWeb()

     const functionSelector = 'transfer(address,uint256)';
     const parameter = [{type:'address',value: receiverAddress},{type:'uint256',value:amount}]
     const tx = await tronWeb.transactionBuilder.triggerSmartContract(contractAddress, functionSelector, {}, parameter);
     console.log('txx ' + tx + " " + JSON.stringify(tx));
     const signedTx = await tronWeb.trx.sign(tx.transaction);
     const result = await tronWeb.trx.sendRawTransaction(signedTx);
     console.log('result ' + result + " " + JSON.stringify(result));

     console.log('result code ' + result.code );


     // const key = '9ca418335b389449499e2b83aff09210050aa70140977c996d21d4f16fd0f9b1'; // Use a secure key
      //const dataToEncrypt = 'Sensitive Information';

      var response = {success: true, responsedata: result, responseCode: 'PP', responseMessage: '', txId: '', blockNumber: '',
       blockTimeStamp: ''};

         
    
    return response;

  
}

