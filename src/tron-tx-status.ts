import { TronWeb } from 'tronweb';
import dotenv from 'dotenv';

dotenv.config();



export async function tranStatus(txId : string) {
   
     try {
       
        const tronWeb = new TronWeb({
         fullHost: process.env.TRON_NODE_URL
       });

       console.log('fetch txId ' + txId);
     
      const txResponse = await tronWeb.trx.getTransactionInfo(txId);
      console.log('response tx status ')
      console.log(txResponse)
      console.log(Object.keys(txResponse).length)
      
       if(Object.keys(txResponse).length === 0)
        return {success:true,chain: 'TRON',
                        txId: txId, fee: 0,
                        toAddress: '',
                        fromAddress:'',
                        blockRefNo: '',
                        symbol: '',
                        amount: 0, blockNumber: '',
                        blockTimestamp: 0,
                        contractAddress: '' , crDr:'',
                        status: '' };
       else
        return  {success:true,chain: 'TRON',
                        txId: txId, fee: txResponse.fee / 1e6,
                        toAddress: '',
                        fromAddress:txResponse.contract_address,
                        blockRefNo: txResponse.blockNumber,
                        symbol: '',
                        amount: 0, blockNumber: txResponse.blockNumber,
                        blockTimestamp: txResponse.blockTimeStamp,
                        contractAddress: '' , crDr:'',
                        status: txResponse.receipt.result };
        }
        catch(err)
        {
          return {success:false, status:'FAILED ' + err.message};
        }
}
  

    