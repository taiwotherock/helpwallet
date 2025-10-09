import { TronWeb } from 'tronweb';
import dotenv from 'dotenv';
import { initWeb } from './tron-init';
import { Resource } from 'tronweb/lib/esm/types';

dotenv.config();



export async function tronSimulateContract(key: string, amount: number, borrowerAddr: string,
   merchantAddress: string) {

       try {

        const tronWeb = new TronWeb({
          fullHost: process.env.TRON_NODE_URL,
          privateKey: key,
        });

       
          const contractAddress = 'TPMQXFrkBJqS4s1xnsDRLsrAvuN6UanrJg';
          const callerAddress = 'TPBHCy5dD3NF2XBHGvhgFUiq5NND9Y3rBm';
          const tokenToBorrow = 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf';
          const requestedAmount = 2770000;  // adjust amount
          const merchantAddr = 'TGRSiHj6fMGh6rutgD3cS8tRPDquzm2Vr7';

          // --- Encode parameters ---
          const parameters = [
            { type: 'address', value: tokenToBorrow },
            { type: 'uint256', value: requestedAmount },
            { type: 'address', value: merchantAddr }
          ];

          // --- Build and trigger the contract call ---
          const functionSelector = 'requestLoan(address,uint256,address)';

         

          /*const tx = await tronWeb.transactionBuilder.triggerSmartContract(
            contractAddress,
            functionSelector,
            {
              feeLimit: 100_000_000,  // 100 TRX energy limit
              callValue: 0
            },
            parameters,
            tronWeb.address.toHex(callerAddress)
          );

          console.log('Trigger:', tx);
          console.log('Trigger Result:', tx.result);
          console.log('Constant Result (hex):', tx.constant_result);

          // --- Decode any returned data ---
          if (tx.constant_result && tx.constant_result.length > 0) {
            const outputHex = tx.constant_result[0];
            console.log('Output (decoded):', tronWeb.toAscii(outputHex));
          } else {
            console.log('No return data — likely revert or no output');
          }*/

            
        
        return {success:true, txId: '', code: '' , message: ''}
    } catch (err) {
        console.error("❌ Freeze Error:", err);
        return {success:false, error: err}
    }

}

tronSimulateContract('',277,'','');