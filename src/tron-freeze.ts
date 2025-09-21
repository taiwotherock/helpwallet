import { TronWeb } from 'tronweb';
import dotenv from 'dotenv';
import { initWeb } from './tron-init';
import { Resource } from 'tronweb/lib/esm/types';

dotenv.config();

/*const tronWeb = new TronWeb(
  process.env.TRON_NODE_URL,
  process.env.TRON_NODE_URL,
  process.env.TRON_NODE_URL
 );*/

 /*const tronWeb = new TronWeb({
  fullHost: process.env.TRON_NODE_URL,
  privateKey: process.env.PRIVATE_KEY_NILE,
});*/

export async function freezeTRX(key: string, amount: number, receiverAddress: string,
   resourceType: string, ownerAddress: string) {

       try {

        const tronWeb = new TronWeb({
          fullHost: process.env.TRON_NODE_URL,
          privateKey: key,
        });

        var resource: Resource 
        if(resourceType == 'ENERGY')
           resource = 'ENERGY'
        else
           resource = 'BANDWIDTH'



        const tx = await tronWeb.transactionBuilder.freezeBalanceV2(
          amount * 1000000,
          resource,
          receiverAddress
        );
    

        //|| tronWeb.defaultAddress.base58

        const signedTx = await tronWeb.trx.sign(tx);
        const receipt = await tronWeb.trx.sendRawTransaction(signedTx);

        console.log(`✅ ${resource} Freeze TX:`, receipt);
        var msg ='';
       
        if(!receipt.result)
        {
          msg = decodeHexMessage(receipt.message)
          console.log(`✅ ${resource} Message:`, msg);
        }
        
        return {success:true, txId: receipt.txid, code: receipt.code , message: msg}
    } catch (err) {
        console.error("❌ Freeze Error:", err);
        return {success:false, error: err}
    }

}

export async function unfreezeTRX(key: string,resource : Resource, receiverAddress: string) {
  try {

    const tronWeb = new TronWeb({
      fullHost: process.env.TRON_NODE_URL,
      privateKey: key,
    });

      const tx = await tronWeb.transactionBuilder.unfreezeBalance(
          resource,
          receiverAddress
      );

      const signedTx = await tronWeb.trx.sign(tx);
      const receipt = await tronWeb.trx.sendRawTransaction(signedTx);

      console.log(`✅ Unfreeze ${resource} TX:`, receipt);
      return {success:true, txId: receipt}
    } catch (err) {
        console.error("❌ UnFreeze Error:", err);
        return {success:false, error: err}
    }
}

async function fetchBalance(address: string) {

       const tronWeb = initWeb();

       const result = await tronWeb.trx.getBalance(address)
       console.log("result: " + result)
       let balance = Number(result)/1000000
       console.log("bal final : " + balance)

     var response = {success:true, balance: balance, symbol: 'TRX' };
     return response;
 
   
 }

 export async function getTronResources(key: string, address: string) {
  // 1) TRX balance in SUN (1 TRX = 1e6 SUN)

  const tronWeb = new TronWeb({
    fullHost: process.env.TRON_NODE_URL,
    privateKey: key,
  });

  const balanceSun = await tronWeb.trx.getBalance(address);
  const trxBalance = (balanceSun / 1e6).toFixed(6); // Convert SUN → TRX

  // 2) Account resources: energy + bandwidth
  const resources = await tronWeb.trx.getAccountResources(address);

  return {
    trxBalance,
    energyUsed: resources.EnergyUsed ?? 0,
    energyLimit: resources.EnergyLimit ?? 0,
    freeBandwidthUsed: resources.freeNetUsed ?? 0,
    freeBandwidthLimit: resources.freeNetLimit ?? 0,
    bandwidthUsed: resources.NetUsed ?? 0,
    bandwidthLimit: resources.NetLimit ?? 0
  };
}

 function decodeHexMessage(hex: string): string {
  // Remove 0x if it exists
  if (hex.startsWith("0x")) {
    hex = hex.slice(2);
  }

  // Convert hex to readable text
  let decoded = "";
  for (let i = 0; i < hex.length; i += 2) {
    decoded += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return decoded;
}

 //freezeTRX(1000,'TLQZunpWvD8EQKEEwLQuPF1cteKknHvXGi','ENERGY','TLQZunpWvD8EQKEEwLQuPF1cteKknHvXGi');



