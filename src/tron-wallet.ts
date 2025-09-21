import { TronWeb } from 'tronweb';
import dotenv from 'dotenv';
import * as CryptoJS from 'crypto-js';
import { insertData } from './save-wallet';
import { initWeb } from './tron-init';

dotenv.config();


export async function createWalletWithPhrase(username: string, entityCode: string, name: string) {

      const tronWeb = new TronWeb(
        'https://api.trongrid.io',
        'https://api.trongrid.io',
        'https://api.trongrid.io'
    );

      const account = await tronWeb.createAccount();
      console.log(account);

      const key = process.env.ENC_KEY // Use a secure key
      //const dataToEncrypt = 'Sensitive Information';

      const encryptedData = encryptData(account.privateKey, key);
      console.log(`Encrypted Data: ${encryptedData}`);

      //insertData('TRX' ,name, 'TRON', 
      //account.address.base58,encryptedData, account.publicKey,username,entityCode)

      var response = {success:true,address: account.address.base58, privateKey: account.privateKey,
         chain: 'TRON', phrase:account.publicKey };

         console.log(response)
         
    
    return response;

  
}

export async function fetchBalance(address: string) {

       const tronWeb = initWeb();

       const result = await tronWeb.trx.getBalance(address)
       console.log("result: " + result)
       let balance = Number(result)/1000000

     var response = {success:true, balance: balance, symbol: 'TRX' };
     return response;
 
   
 }


function encryptData(data: string, key: string): string {
  // Encrypt the data using AES-256
  const encrypted = CryptoJS.AES.encrypt(data, key).toString();
  return encrypted;
}
// Example usage

function decryptData(encryptedData: string, key: string): string {
  // Decrypt the data using AES-256
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted;
}
