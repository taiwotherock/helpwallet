import { TronWeb } from 'tronweb';
import dotenv from 'dotenv';

dotenv.config();

const tronWeb = new TronWeb({
    fullHost: process.env.TRON_NODE_URL,
    privateKey: process.env.PRIVATE_KEY_NILE,
  });

export async function scanCurrentBlock(receiverAddress: string) {

    try {
        // get latest block number
        const chainInfo = await tronWeb.trx.getCurrentBlock(); // returns block object
        const latestNum = chainInfo.block_header.raw_data.number;

        console.log(chainInfo)
        console.log(latestNum)

        let lastProcessedBlock =0;
    
        if (lastProcessedBlock === null) {
          lastProcessedBlock = latestNum - 100; // start from previous block
        }
    
        for (let n = lastProcessedBlock + 1; n <= latestNum; n++) {
          const block = await tronWeb.trx.getBlock(n); // may be heavy — rate limit
          console.log('block ' + block)
          if (!block || !block.transactions) continue;
    
          for (const tx of block.transactions) {
            // TX raw data -> parse contracts
            console.log('tx ' )
            console.log(tx);

            const contracts = tx.raw_data.contract || [];
            for (const c of contracts) {

                console.log(c)
              const type = c.type;
              const param = c.parameter && c.parameter.value;
    
              // Typical transfer contract values hold 'owner_address' or 'to_address'
              if (param) {
                const fromHex = param.owner_address 
                const toHex   = param.owner_address; // || null;
    
                // compare addresses (hex) after converting your base58 to hex
                const myHex = tronWeb.address.toHex(receiverAddress); // your address
                if (fromHex === myHex || toHex === myHex) {
                  console.log(`Tx in block ${n} involves address:`, tx.txID);
                }
              }
    
              // For TRC20 transfers, data is in triggerSmartContract data or event logs:
              // decode input or call tronWeb.trx.getTransactionInfo(tx.txID) to inspect vmEvents
            }//

          }
          lastProcessedBlock = n; // persist after successful processing
        }
      } catch (err) {
        console.error('scanBlocks error', err);
      }

}