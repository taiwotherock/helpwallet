import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
import { createWalletWithPhrase, fetchBalance } from './tron-wallet'
import { fetchContractBalance,fetchTransactionsByWallet } from './tron-contract-service'
import { transfer } from './tron-transfer'
import { freezeTRX,getTronResources,unfreezeTRX } from './tron-freeze'
import { approveBuyer } from './bpay-escrow-client'
import { createWallet,fetchBalanceUSDC,transferQueryUSDC,transferUSDC } from './circle-wallet'
import { createWalletWithPhraseEth } from './eth-wallet'
import { fetchTokenBalance,fetchBalanceEth,fetchTransactionDetailEth } from './eth-balance'
import { scanCurrentBlock} from './tron-scan-block'
import { depositIntoPool,getUserDepositFromPool} from './tron-bfp-liquiditypool'
import { listenDeposited} from './tron-event-listeners'
import { tronswap} from './tron-swap'
import { tronswapv2,tronswaptrx} from './tron-swap-route'
import { issueNftCreditScore,getBorrowerCreditProfile,updateNftCreditScore} from './tron-bcs-nft'
import { addCreditOfficer,isCreditOfficer} from './tron-access-control'
import { tranStatus} from './tron-tx-status'
import { requestLoan,repay,liquidateLoanDue,approveAndDisburseLoan,getBorrowerOutstanding} from './tron-bfp-loanmgr'
import { depositCollateral,removeCollateral} from './tron-bfp-loanvault'
import { depositToVault,withdrawVault,whitelistOrBlackVaultUser,
  merchantWithdrawFund,createLoan,repayLoan,setFeeAndRates,getBorrowerLoanOutstanding
  ,fetchBorrowerLoans
} from './tron-bfp-vault-lend'


dotenv.config();
const PORT = process.env._PORT;
//const API_KEY = process.env.API_KEY
//const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const origins = process.env.CORS_ORIGIN

const app = express();
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  //listenDeposited().catch(console.error);
  return console.log(`Express is listening at http://localhost:${PORT}`);
});

app.post('/create-wallet', async (req, res) => {
    try {
  
      const authHeader = req.headers['authorization']; // lowercase key
      const sourceCode = req.headers['x-source-code'];
      const clientId = req.headers['x-client-id'];
      const clientSecret = req.headers['x-client-secret'];
  
      console.log('header ' + sourceCode + ' ' + clientId)
      const xClientId = process.env.X_CLIENT_ID
      const xClientSecret = process.env.X_CLIENT_SECRET;
      const xSourceCode = process.env.X_SOURCE_CODE;
  
      console.log('source code ' + xSourceCode + ' ' + xClientId)
      const chain = req.query.chain
      const symbol = req.query.symbol
      var response : any;
      if(symbol == 'USDC')
      {
        response = await createWallet(req.query.name,'',chain); 
        res.json(response) 
       
      }
      else if(chain == 'TRON') {
        response = await createWalletWithPhrase(req.query.username,req.query.entityCode,req.query.name);
        res.json(response)
      }
      else
      {
        response = await createWalletWithPhraseEth(chain,symbol);
        res.json(response)
      }
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error creating wallet `)
      console.log(error)
      res.status(500).json({success:false,error:'error creating wallet ' + error})
    }
  })

  app.get('/balance/:address', async (req, res) => {
    try {
  
      if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,error:'Invalid authentication API key or token '})
        return;
      }

      const symbol = req.query.symbol
      const chain = req.query.chain
      const rpcUrl = req.query.rpcUrl
      console.log('bal ' + symbol + ' ' + req.params.address)
      var response : any;
      if(symbol == 'USDC')
      {
         response = await fetchBalanceUSDC(req.params.address);
         res.json(response)
      }
      else if(chain == 'TRON' || symbol == 'TRX' || symbol == 'USDT') {
        if(symbol == 'USDT')
             response = await fetchContractBalance(req.params.address, null)
          else 
              response = await fetchBalance(req.params.address);
         
            res.json(response)
      }
      else  {

          response = await fetchBalanceEth(req.params.address,rpcUrl);
          res.json(response)
    }
  
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error fetch balance `)
      console.log(error)
      res.status(500).json({success:false,error:'error fetch balance ' + error})
    }
  })

  app.post('/token-balance', async (req, res) => {
    try {
  
      if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,error:'Invalid authentication API key or token '})
        return;
      }

      const { walletAddress,tokenAddress,rpcUrl,decimalNo,chain} = req.body;
      
      console.log('bal ' + walletAddress + ' ' + tokenAddress + " " + chain)
      var response : any;
      if(chain == 'TRON')
        response = await fetchContractBalance(walletAddress,tokenAddress);
      else
        response = await fetchTokenBalance(tokenAddress, walletAddress,rpcUrl,decimalNo);
      
      res.json(response)
    
  
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error fetch balance `)
      console.log(error)
      res.status(500).json({success:false,error:'error fetch balance ' + error})
    }
  })

  app.get('/contract-balance/:address', async (req, res) => {
    try {
  
      if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,error:'Invalid authentication API key or token '})
        return;
      }
      
      const response = await fetchContractBalance(req.params.address,req.query.contractAddress);
  
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error fetch balance `)
      res.status(500).json({success:false,error:'error fetch balance ' + error})
    }
  })

  app.get('/fetch-transaction-by-wallet/:address', async (req, res) => {
    try {
  
      
      
      const response = await fetchTransactionsByWallet(req.params.address);
  
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error fetching transactions `)
      res.status(500).json({success:false,error:'error fetching transactions ' + error})
    }
  })

  app.post('/fetch-transaction-status', async (req, res) => {
    try {

   
      const { chain,symbol,txId,rpcUrl, timeAllow} = req.body;
      var response : any;
      console.log('fetch status ' + symbol + ' ' + txId )
      if(chain == 'TRON') {
        response = await fetchTransactionsByWallet(txId);
        response = await listenDeposited(txId,symbol,timeAllow)
        res.json(response)
      }
      else if(symbol == 'USDC' && txId.indexOf('0x') < 0)
      {
         response = await transferQueryUSDC(txId,symbol)
         console.log(response)

         res.json(response)
      }
      else 
      {
        console.log('eth api route ') 
        response = await fetchTransactionDetailEth(txId, symbol, chain, rpcUrl);
         res.json(response)
      }

      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error fetching transactions `)
      res.status(500).json({success:false,error:'error fetching transactions ' + error})
    }
  })

  app.post('/fetch-tx-byid', async (req, res) => {
    try {

   
      const { chain,symbol,txId,rpcUrl} = req.body;
      var response : any;
      console.log('fetch status by id' + symbol + ' ' + txId +' ' + chain )
      if(chain == 'TRON') {

        response = await tranStatus(txId);
        res.json(response)
      }
      else if(symbol == 'USDC' && txId.indexOf('0x') < 0)
      {
         response = await transferQueryUSDC(txId,symbol)
         console.log(response)

         res.json(response)
      }
      else 
      {
        console.log('eth api route ') 
        response = await fetchTransactionDetailEth(txId, symbol, chain, rpcUrl);
         res.json(response)
      }

      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error fetching transactions `)
      res.status(500).json({success:false,error:'error fetching transactions ' + error})
    }
  })

  app.post('/freeze-trx', async (req, res) => {
    try {

   
      const { key,amount, resourceType, receiverAddress} = req.body;
      
      var response : any;
      console.log('freeze ' + receiverAddress + ' ' + resourceType )
      response = await freezeTRX(key,amount,receiverAddress,resourceType)
      res.json(response)
      
    } catch (error) {
      console.log(`Error fetching transactions `)
      res.status(500).json({success:false,error:'error fetching transactions ' + error})
    }
  })

  app.post('/transfer', async (req, res) => {
    try {
  
      const authHeader = req.headers['authorization']; // lowercase key
      const sourceCode = req.headers['x-source-code'];
      const clientId = req.headers['x-client-id'];
      const clientSecret = req.headers['x-client-secret'];
  
      console.log('header ' + sourceCode + ' ' + clientId)
      const xClientId = process.env.X_CLIENT_ID
      const xClientSecret = process.env.X_CLIENT_SECRET;
      const xSourceCode = process.env.X_SOURCE_CODE;
  
      console.log('source code ' + xSourceCode + ' ' + xClientId)

      const { receiverAddress,contractAddress,amount, senderAddress,chain,symbol,externalRef} = req.body;
      console.log("transfer req: " + receiverAddress + " " + amount);
      var response: any;
      
      if(symbol == 'USDC')
      {
        response = await transferUSDC(senderAddress, receiverAddress,amount,contractAddress,externalRef,chain);
        res.json(response)

      }
      else 
      {
        response = await transfer(receiverAddress,contractAddress,amount,senderAddress,chain,symbol);
        res.json(response)
      }
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error creating wallet `)
      res.status(500).json({success:false,error:'error creating wallet ' + error})
    }
  })

  app.post('/approve-buyer', async (req, res) => {
    try {
  
      const authHeader = req.headers['authorization']; // lowercase key
      const sourceCode = req.headers['x-source-code'];
      const clientId = req.headers['x-client-id'];
      const clientSecret = req.headers['x-client-secret'];
  
      console.log('header ' + sourceCode + ' ' + clientId)
      const xClientId = process.env.X_CLIENT_ID
      const xClientSecret = process.env.X_CLIENT_SECRET;
      const xSourceCode = process.env.X_SOURCE_CODE;
  
      console.log('source code ' + xSourceCode + ' ' + xClientId)

      const { buyerAddress,contractAddress} = req.body;
      console.log("transfer req: " + buyerAddress + " " + contractAddress);
      
      const response = await approveBuyer(buyerAddress,contractAddress)

      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error creating wallet `)
      res.status(500).json({success:false,error:'error creating wallet ' + error})
    }
  })

  app.post('/deposit-into-liquidity-pool', async (req, res) => {
    try {
  
      const { tokenAddress,userAddress, amount,key} = req.body;
      console.log("deposit into pool req: " + tokenAddress + " " + userAddress);
      
      const response = await depositIntoPool(key,tokenAddress,amount,userAddress);

      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error creating wallet `)
      res.status(500).json({success:false,error:'error creating wallet ' + error})
    }
  })

  app.post('/get-user-deposit-in-pool', async (req, res) => {
    try {
  
     
      const { tokenAddress,userAddress} = req.body;
      console.log("deposit into pool req: " + tokenAddress + " " + userAddress);
    
      const response = await getUserDepositFromPool(tokenAddress,userAddress);
      console.log(response);
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error creating wallet `)
      res.status(500).json({success:false,error:'error creating wallet ' + error})
    }
  })

  app.post('/fetch-tron-resources', async (req, res) => {
    try {
  
     
      const { key,userAddress} = req.body;
      console.log("fetch tron resources: "  + " " + userAddress);
    
      const response = await getTronResources(key,userAddress)
      console.log(response);
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error creating wallet `)
      res.status(500).json({success:false,error:'error creating wallet ' + error})
    }
  })

  app.post('/swap', async (req, res) => {
    try {
  
     
      const { tokenA,tokenB, key, amount, fromAddress} = req.body;
      console.log("do swap: "  + " " + tokenA);
    
      const response = await tronswaptrx(tokenA,tokenB,fromAddress,key)
      console.log(response);
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error with swapping `)
      res.status(500).json({success:false,error:'error creating wallet ' + error})
    }
  })

  app.post('/issue-bsc-nft', async (req, res) => {
    try {
  
     
      const { key, borrowerAddress, creditScore, creditLimit, creditOfficer,creditManager} = req.body;
      console.log("issue neft: "  + " " + borrowerAddress);
    
      const response = await issueNftCreditScore(key,borrowerAddress,
        creditScore,creditLimit,creditOfficer,creditManager);
      //console.log(response);
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error creating wallet `)
      res.status(500).json({success:false,error:'error creating wallet ' + error})
    }
  })

    app.post('/update-bsc-nft', async (req, res) => {
    try {
  
     
      const { key, tokenId, creditScore, creditLimit, creditOfficer} = req.body;
      console.log("update neft: "  + " " + tokenId);
    
      const response = await updateNftCreditScore(key,tokenId,
        creditScore,creditLimit,creditOfficer);
      //console.log(response);
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error update nft `)
      res.status(500).json({success:false,error:'error update nft ' + error})
    }
  })

  app.post('/add-credit-officer', async (req, res) => {
    try {
  
     
      const { key, creditOfficer} = req.body;
      console.log("add credit officer: "  + " " + creditOfficer);
    
      const response = await addCreditOfficer(creditOfficer,key);
      
      //console.log(response);
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
     console.log(`Error: add ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

   app.get('/borrower-nft-profile/:address', async (req, res) => {
    try {
  
      /*if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,error:'Invalid authentication API key or token '})
        return;
      }*/
      
      const response = await getBorrowerCreditProfile(req.params.address);
  
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
     console.log(`Error: borrower profile ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.get('/validate-credit-officer/:address', async (req, res) => {
    try {
  
      /*if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,error:'Invalid authentication API key or token '})
        return;
      }*/
      
      const response = await isCreditOfficer(req.params.address);
  
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
     console.log(`Error: is credit officer ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.post('/request-loan', async (req, res) => {
    try {
  
     
      const { key, tokenToBorrow,borrower,merchantAddress,amount,depositAmount,fee,ref} = req.body;
      console.log("request-loan: "  + " " + borrower);
      console.log("amount: "  + " " + amount);
    
      const response = await createLoan(key,tokenToBorrow,ref,merchantAddress,amount,fee,depositAmount,borrower);
      //requestLoan(key,borrower,tokenToBorrow,merchantAddress,amount);
      
      //console.log(response);
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error: request loan ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.post('/deposit-collateral', async (req, res) => {
    try {
  
     
      const { key, tokenToBorrow,amount} = req.body;
      console.log("deposit collateral: "  + " " + tokenToBorrow);
      console.log("amount: "  + " " + amount);
    
      const response = await depositCollateral(key,tokenToBorrow,amount);
      
      //console.log(response);
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error: deposit collateral ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.post('/remove-collateral', async (req, res) => {
    try {
  
     
      const { key, borrower, tokenToBorrow,amount} = req.body;
      console.log("remove collateral: "  + " " + tokenToBorrow);
      console.log("amount: "  + " " + amount);
    
      const response = await removeCollateral(key,borrower,tokenToBorrow,amount);
      
      //console.log(response);
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error: deposit collateral ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

   app.post('/approve-disburse-loan', async (req, res) => {
    try {
  
     
      const { key, tokenToBorrow,borrower,merchantAddress,amount,depositAmount,fee} = req.body;
      console.log("borrower: "  + " " + borrower);
      console.log("merchantAddress: "  + " " + merchantAddress);
      console.log("tokenToBorrow: "  + " " + tokenToBorrow);
      console.log("amount: "  + " " + amount);
      
      const response = await approveAndDisburseLoan(key,borrower,tokenToBorrow,merchantAddress,amount,
        depositAmount,fee
      );
      
      //console.log(response);
      res.json(response)
    
    } catch (error) {
      console.log(`Error: /approve-disburse-loan ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.post('/repay-loan', async (req, res) => {
    try {
  
     
      const { key, amount,ref} = req.body;
      console.log("repay-loan: "  + " " + ref);
    
      const response = await repayLoan(key,ref,amount);
      
      console.log(response);
      res.json(response)
    
    } catch (error) {
      console.log(`Error: repay-loan ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.post('/liquidate-loan', async (req, res) => {
    try {
  
     
      const { key, tokenToBorrow,borrower,amount} = req.body;
      console.log("liquidate-loan: "  + " " + borrower);
    
      const response = await liquidateLoanDue(key,borrower,amount);
      
      //console.log(response);
      res.json(response)
    
    } catch (error) {
      console.log(`Error: liquidate-loan ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.get('/borrower-details/:address', async (req, res) => {
    try {
  
      if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,error:'Invalid authentication API key or token '})
        return;
      }
      
      console.log(req.params.address)
      const response = await fetchBorrowerLoans(req.params.address);
  
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
     console.log(`Error: borrower details ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  
  app.post('/deposit-into-lend-vault', async (req, res) => {
    try {
  
     
      const { key, tokenToBorrow,amount} = req.body;
      console.log("deposit-into-lend-vault: "  + " " + tokenToBorrow);
      console.log("amount: "  + " " + amount);
    
      const response = await depositToVault(key,tokenToBorrow,amount);
      
      //console.log(response);
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error: deposit-into-lend-vault ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.post('/withdraw-from-lend-vault', async (req, res) => {
    try {
  
     
      if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,message:'Invalid authentication API key or token '})
        return;
      }

      const { key, tokenToBorrow,amount} = req.body;
      console.log("withdraw-from-lend-vault: "  + " " + tokenToBorrow);
      console.log("amount: "  + " " + amount);
    
      const response = await withdrawVault(key,tokenToBorrow,amount);
      
      //console.log(response);
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error: withdraw-from-lend-vault ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.post('/white-black-status', async (req, res) => {
    try {
  
      if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,message:'Invalid authentication API key or token '})
        return;
      }
     
      const { key, address, whiteOrBlack,status,ctype,rpcUrl,contractAddress} = req.body;
      console.log("address: "  + " " + address + ' ' + ctype);
      let response : any;
 
      response = await whitelistOrBlackVaultUser(key,address,status,whiteOrBlack);
     

      res.json(response)
 
    } catch (error) {
      console.log(`Error: release offer ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.post('/post-rates', async (req, res) => {
    try {
  
     if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,message:'Invalid authentication API key or token '})
        return;
      }

      const { key, platformFee,lenderFee,depositPercent} = req.body;
      console.log("post-rates: "  + " " + depositPercent);
    
      const response = await setFeeAndRates(key,platformFee,lenderFee,depositPercent);
      console.log(response);
      res.json(response)
    
    } catch (error) {
      console.log(`Error: post-rates ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.post('/merchant-withdraw', async (req, res) => {
    try {
  
     if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,message:'Invalid authentication API key or token '})
        return;
      }

      const { key, tokenToBorrow} = req.body;
      console.log("merchant-withdraw: "  + " " + tokenToBorrow);
    
      const response = await merchantWithdrawFund(key,tokenToBorrow);
      console.log(response);
      res.json(response)
    
    } catch (error) {
      console.log(`Error: merchant-withdraw ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })


  function validateToken(req: any)
  {
    const authHeader = req.headers['authorization']; // lowercase key
    const sourceCode = req.headers['x-source-code'];
    const clientId = req.headers['x-client-id'];
    const clientSecret = req.headers['x-client-secret'];

    console.log('header ' + sourceCode + ' ' + clientId)
    const xClientId = process.env.X_CLIENT_ID
    const xClientSecret = process.env.X_CLIENT_SECRET;
    const xSourceCode = process.env.X_SOURCE_CODE;

    console.log('source code ' + xSourceCode + ' ' + xClientId)
    console.log('source code ' + xSourceCode + ' ' + xClientId)

    return true;

  }

  //listenDeposited().catch(console.error);



