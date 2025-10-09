import { TronWeb } from 'tronweb';
import dotenv from 'dotenv';
const fs = require('fs');
const path = require('path');

dotenv.config();


const bfpArtifact =JSON.parse(
    fs.readFileSync('./contracts-abi/LoanManagerV11.json', 'utf8')
);


export async function requestLoan(privateKey: string, 
  borrower: string,
  tokenAddressToBorrow: string,
  merchantAddress: string,
  requestedAmount: string) {

    try {

    const tronWeb = new TronWeb({
        fullHost: process.env.TRON_NODE_URL,
        privateKey: privateKey,
      });

      //const fromAddress1 = tronWeb.defaultAddress.base58;
      let CONTRACT_ADDRESS = process.env.LOAN_MANAGER_CONTRACT_ADDRESS

      console.log('CONTRACT_ADDRESS ' + CONTRACT_ADDRESS)
      const me = tronWeb.defaultAddress.base58;    
      console.log('from address ' + me); 
      console.log('merchant Address ' + merchantAddress);   
      console.log(Number(requestedAmount) * 1000000)
      console.log('contract ' + tokenAddressToBorrow )
      if(borrower != me)
      {
         console.log('not borrower ' + borrower); 
         return {success:false, txId: '', message: 'Not borrower'};
      }
  
      // --- Load BorderLessNFT ---
      const contract = await tronWeb.contract(bfpArtifact.abi, CONTRACT_ADDRESS);
      
      console.log(Number(requestedAmount) * 1000000)

      // request for loan USDT
      const tx = await contract.requestLoan(
        tokenAddressToBorrow, 
        Number(requestedAmount) * 1000000,
        merchantAddress
      ).send({
        from: me,
        feeLimit: 3_000_000_000 // 100 TRX energy fee limit
      });

      console.log("Loan requested. TxID:", tx);
      return {success:true, txId: tx, message: 'SUCCESS'};
    }
    catch(err)
    {
       console.log(err)
       return {success:false, txId: '', message: err.message};

    }
}

export async function approveAndDisburseLoan(privateKey: string, 
  borrower: string,
  tokenAddressToBorrow: string,
  merchantAddress: string,
  approvedAmount: string,
  depositAmount: Number,fee: Number) {

    try {

    const tronWeb = new TronWeb({
        fullHost: process.env.TRON_NODE_URL,
        privateKey: privateKey,
      });

      //const fromAddress1 = tronWeb.defaultAddress.base58;
      let CONTRACT_ADDRESS = process.env.LOAN_MANAGER_CONTRACT_ADDRESS

      console.log('CONTRACT_ADDRESS ' + CONTRACT_ADDRESS)
      const me = tronWeb.defaultAddress.base58;    
      console.log('from address ' + me); 
      console.log('from address ' + borrower);   
      if(borrower == me)
      {
         console.log('you cannot approve your own loan ' + borrower); 
         return {success:false, txId: '', message: 'you cannot approve your own loan'};
      }
  
      // --- Load BorderLessNFT ---
      const contract = await tronWeb.contract(bfpArtifact.abi, CONTRACT_ADDRESS);

            
      // request for loan USDT
      const tx = await contract.approveAndDisburse(
        borrower, tokenAddressToBorrow, Number(approvedAmount) * 1000000,
        Number(depositAmount) *1000000,  Number(fee) * 100000,
        merchantAddress
      ).send({
        from: me,
        feeLimit: 3_000_000_000 // 100 TRX energy fee limit
      });

      console.log("Loan approve and disburse. TxID:", tx);
      return {success:true, txId: tx, message: 'SUCCESS'};
    }
    catch(err)
    {
       console.log(err)
       return {success:false, txId: '', message: err.message};

    }
}

export async function liquidateLoanDue(privateKey: string, 
  borrower: string,
  amountToPay: string) {

    try {

    const tronWeb = new TronWeb({
        fullHost: process.env.TRON_NODE_URL,
        privateKey: privateKey,
      });

      //const fromAddress1 = tronWeb.defaultAddress.base58;
      let CONTRACT_ADDRESS = process.env.LOAN_MANAGER_CONTRACT_ADDRESS

      console.log('CONTRACT_ADDRESS ' + CONTRACT_ADDRESS)
      const me = tronWeb.defaultAddress.base58;    
      console.log('from address ' + me); 
      console.log('from address ' + borrower);   
      if(borrower == me)
      {
         console.log('you cannot approve your own loan ' + borrower); 
         return {success:false, txId: '', message: 'you cannot approve your own loan'};
      }
  
      // --- Load BorderLessNFT ---
      const contract = await tronWeb.contract(bfpArtifact.abi, CONTRACT_ADDRESS);
      
      // request for loan USDT
      const tx = await contract.liquidateDue(
        borrower, Number(amountToPay) * 1000000
      ).send({
        from: me,
        feeLimit: 3_000_000_000 // 100 TRX energy fee limit
      });

      console.log("Loan liquidate. TxID:", tx);
      return {success:true, txId: tx, message: 'SUCCESS'};
    }
    catch(err)
    {
       console.log(err)
       return {success:false, txId: '', message: err.message};

    }
}

export async function repay(privateKey: string, 
  tokenAddressToBorrow: string,
  amountToPay: string) {

    try {

    const tronWeb = new TronWeb({
        fullHost: process.env.TRON_NODE_URL,
        privateKey: privateKey,
      });

      //const fromAddress1 = tronWeb.defaultAddress.base58;
      let CONTRACT_ADDRESS = process.env.LOAN_MANAGER_CONTRACT_ADDRESS

      console.log('CONTRACT_ADDRESS ' + CONTRACT_ADDRESS)
      const me = tronWeb.defaultAddress.base58;    
      console.log('from address ' + me); 
      console.log('from address ' + tokenAddressToBorrow);   
      
  
      // --- Load BorderLessNFT ---
      const contract = await tronWeb.contract(bfpArtifact.abi, CONTRACT_ADDRESS);
      
      // request for loan USDT
      const tx = await contract.repay(
        tokenAddressToBorrow, Number(amountToPay) * 1000000
      ).send({
        from: me,
        feeLimit: 3_000_000_000 // 100 TRX energy fee limit
      });

      console.log("Loan repay. TxID:", tx);
      return {success:true, txId: tx, message: 'SUCCESS'};
    }
    catch(err)
    {
       console.log(err)
       return {success:false, txId: '', message: err.message};

    }
}


export async function getBorrowerOutstanding(borrowerAddr: string) {

  const tronWeb = new TronWeb({
      fullHost: process.env.TRON_NODE_URL,
      privateKey: process.env.PRIVATE_KEY_NILE
    });
    try {

          let CONTRACT_ADDRESS = process.env.LOAN_MANAGER_CONTRACT_ADDRESS;

          console.log('contract pool ' + CONTRACT_ADDRESS)
          console.log('user address ' + borrowerAddr)

        // --- Load Token Contract ---
        const contract = await tronWeb.contract(bfpArtifact.abi, CONTRACT_ADDRESS);

        let result = await contract.getLoanDetails(borrowerAddr).call();
        console.log('loan outstanding details:: ' + result); 
        return {success:true, message:'SUCCESS', data:result};
    }
    catch(err)
    {
      console.log('error:: ' + err.message)
      return {success:false, message: err.message };
    }

}
