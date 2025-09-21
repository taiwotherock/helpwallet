import { TronWeb } from 'tronweb';
import dotenv from 'dotenv';

dotenv.config();

const tronWeb = new TronWeb({
    fullHost: process.env.TRON_NODE_URL,
    privateKey: process.env.PRIVATE_KEY_NILE,
  });


export async function listenDeposited(userAddress : string, symbol:string, timeAllow: number) {
    // Load contract
    let LIQUIDITY_POOL_ADDRESS = process.env.LIQUIDITY_POOL_CONTRACT_ADDRESS
    //const contract = await tronWeb.contract().at(LIQUIDITY_POOL_ADDRESS);

    //setInterval(async () => {
    const events  = await tronWeb.event.getEventsByContractAddress(
        LIQUIDITY_POOL_ADDRESS,
        {
          eventName: 'Deposited'
        }
      );
      //console.log(events);
      let i =0;
      let count = events.data?.length;
      //if(count > 20)
         // count = 20;

         console.log('count: ' + count);

      for(i=0;i<events.data?.length;i++)
      {
        
        var caller_contract_address = events.data[i].caller_contract_address 
        var txId = events.data[i].transaction_id
        console.log('block no ' + events.data[i].block_number);
        console.log('user & tx ' + caller_contract_address + " " + txId + ' ' + userAddress)
        //if(userAddress === caller_contract_address )
        {
            let diffInMin = timeDiff(events.data[i].block_timestamp);
            
        
            if(diffInMin <= timeAllow)
            {
                const txResponse = await tronWeb.trx.getTransactionInfo(txId);
                console.log(txResponse)
            

                const fromAddress = hexToAddress(txResponse.log[0].topics[1]);
                console.log("fromAddress:", fromAddress + " " + userAddress);

                if(fromAddress == userAddress) {
                    
                    // Extract amount
                    const amountRaw = hexToNumber(txResponse.log[0].data); // raw amount in smallest unit (USDT = 6 decimals)
                    const amountUSDT = amountRaw / 1e6;
                    console.log("Amount USDT:", amountUSDT);

                    const userAddress2 = hexToAddress(txResponse.log[1].address);
                    console.log("User Address:", userAddress2);

                    return  {success:true,chain: 'TRON',
                        txId: txId, fee: txResponse.fee / 1e6,
                        toAddress: hexToAddress(txResponse.log[0].topics[2]),
                        fromAddress: hexToAddress(txResponse.log[0].topics[1]),
                        blockRefNo: txResponse.blockNumber,
                        symbol: symbol,
                        amount: amountUSDT, blockNumber: txResponse.blockNumber,
                        blockTimestamp: txResponse.blockTimeStamp,
                        contractAddress: caller_contract_address , crDr:'',
                        status: txResponse.receipt.result };
                }
                 

            }
        }
        
      }

      return {success: false, data: null};



    //}, 3000);

    
}


function hexToAddress(hex: string): string {
    if (hex.startsWith("41")) return tronWeb.address.fromHex(hex);
    return tronWeb.address.fromHex("41" + hex.slice(-40));

}

function hexToNumber(hex: string): number {
    return parseInt(hex, 16);
}

function timeDiff(blockTimestampMs : number)
{
    //const blockTimestampMs = 1758392544000;

    // Convert to Date object
    const blockDate = new Date(blockTimestampMs);
    console.log("Block Date:", blockDate.toLocaleString());

    // Current time
    const now = new Date();

    // Difference in seconds
    const diffInMin = Math.floor((now.getTime() - blockDate.getTime()) / (1000 * 60) );
    console.log("Minutes since block:", diffInMin);
    return diffInMin;
}

interface DepositedEventResult {
    lender: string;
    token: string;
    amount: string;
    shares: string;
  }
  
  interface DepositedEvent {
    block_number: number;
    block_timestamp: number;
    caller_contract_address: string;
    contract_address: string;
    event_index: number;
    event_name: string;
    result: DepositedEventResult;
    transaction_id: string;
  }
  
  interface TronGridResponse {
    data: DepositedEvent[];
    success: boolean;
    meta: any;
  }
    