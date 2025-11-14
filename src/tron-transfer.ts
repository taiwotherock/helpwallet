import { TronWeb } from 'tronweb';
import dotenv from 'dotenv';
import * as CryptoJS from 'crypto-js';
import { fetchWalletKey } from './save-wallet';
import { decryptData } from './encryption';
import { initWeb } from './tron-init';

dotenv.config();


export async function transfer(receiverAddress: string, contractAddress: string, amount: number, 
     senderAddress: string, chain: string, symbol: string, key2:string) {

      //const key = process.env.ENC_KEY

       /*let pk = await fetchWalletKey(symbol,chain,senderAddress);
       console.log('pk ' + pk);
       let pkey1 = decryptData(pk,key)
       console.log('pkey1 ' + pkey1);*/


     const tronWeb = new TronWeb({
        fullHost: process.env.TRON_NODE_URL,
        privateKey: key2,
      });

     const functionSelector = 'transfer(address,uint256)';
     const parameter = [{type:'address',value: receiverAddress},{type:'uint256',value:amount}]
     const tx = await tronWeb.transactionBuilder.triggerSmartContract(contractAddress, functionSelector, {}, parameter);
     console.log(tx)
     console.log('txx ' + tx + " " + JSON.stringify(tx));
     const signedTx = await tronWeb.trx.sign(tx.transaction);
     const result = await tronWeb.trx.sendRawTransaction(signedTx);
     console.log(result);
     console.log('result ' + result + " " + JSON.stringify(result));

     console.log('result code ' + result.code );


     // const key = '9ca418335b389449499e2b83aff09210050aa70140977c996d21d4f16fd0f9b1'; // Use a secure key
      //const dataToEncrypt = 'Sensitive Information';

      var response = {success: true, responsedata: result, responseCode: 'PP', message: 'PENDING', txId:''};

         
    
    return response;

  
}

export async function transferTrx(receiverAddress: string,  amt: string, key2:string) {

     const tronWeb = new TronWeb({
        fullHost: process.env.TRON_NODE_URL,
        privateKey: key2,
      });

    
      const amount = Number(amt) * 1e6; // unit in sun.
      const tx = await tronWeb.transactionBuilder.sendTrx(receiverAddress, amount);
      const signedTx = await tronWeb.trx.sign(tx);
      const result = await tronWeb.trx.sendRawTransaction(signedTx);
      console.log(result);

     //console.log('result code ' + result.code );


     // const key = '9ca418335b389449499e2b83aff09210050aa70140977c996d21d4f16fd0f9b1'; // Use a secure key
      //const dataToEncrypt = 'Sensitive Information';

      var response = {success: true, responsedata: result, responseCode: 'PP', message: 'PENDING', txId:''};

         
    
    return response;

  
}

export async function transactionTsq(walletAddress: string, rpcUrl: string) {

   //let rpcUrl2 : any ="https://nile.trongrid.io"

   let queryParams = "/v1/accounts/" + walletAddress + "/transactions?limit=10"

   const headers: Record<string, string> = {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['TRON-PRO-API-KEY'] = this.apiKey;
    }

    // Make the API request
    const response = await fetch(rpcUrl + queryParams, {
      method: 'GET',
      headers,
    });

    console.log(response)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, message: ${response.statusText}`);
    }

    const data: TronTransactionResponse = await response.json();
    
    if (!data.success) {
      throw new Error('API request was not successful');
    }

    return data;

}

interface TronTransaction {
   txID: string;
   blockNumber: number;
   blockTimeStamp: number;
   contractResult: string[];
   receipt: {
     energy_usage: number;
     energy_usage_total: number;
     net_usage: number;
     result: string;
   };
   log: any[];
 }
 
 interface TronTransactionResponse {
   data: TronTransaction[];
   success: boolean;
   meta: {
     at: number;
     page_size: number;
   };
 }

