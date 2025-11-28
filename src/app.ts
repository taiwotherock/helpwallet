import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
import { createWalletWithPhrase, fetchBalance } from './tron-wallet'
import { fetchContractBalance,fetchTransactionsByWallet } from './tron-contract-service'
import { transfer,transferTrx } from './tron-transfer'
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
  merchantWithdrawFund,createLoan,repayLoan,tronSetFeeAndRates,getBorrowerLoanOutstanding
  ,getLoanDataTron, tronGetVaultStats
} from './tron-bfp-vault-lend'
import {internalTransfer,ethTranStatus} from './eth-swap'
import {addAdmin,removeAdmin,checkIsAdmin} from './eth-access-control-client'
import {ethCreateLoan,ethDepositIntoVault,ethRepayLoan,ethDisburseLoanToMerchant,
  ethWithdrawFromVault,updateWhiteOrBlackListLend,ethPostRates,getLoanData,getDashboardView} from './eth-lending'

import { createOffer,releaseOffer,markOfferPaid,
  getVaultTokenBalance,getWalletBalance,
  pickOffer,updateWhiteOrBlackList,fetchOfferStatus } from './eth-escrow-vault'

  import {ethGasBalanceByKey} from './eth-wallet'

  import {arcDepositIntoVault,arcPostRates,arcWithdrawFromVault,arcCreateLoan,arcDisburseLoanToMerchant,arcRepayLoan,getShareWorth} from './eth-lending-arc'

  import {ethSetPoolAndAttestor,setBorrowerAttestation,getBorrowerAttestation} from './eth-attestation-oracle'

  import {tronSetBorrowerAttestation,tronSetPoolAndAttestor,tronGetBorrowerAttestation} from './tron-attestation-oracle'
   import {ethOdDepositCollateral,ethSetVaultAdmin} from './eth-overdraft-line'



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
      /*if(symbol == 'USDC')
      {
        response = await createWallet(req.query.name,'',chain); 
        res.json(response) 
       
      }
      else*/
      
      if(chain == 'TRON') {
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

      const { walletAddress,tokenAddress,rpcUrl,decimalNo,chain,symbol,key} = req.body;
      
      console.log('bal22 ' + walletAddress + ' ' + tokenAddress + " " + chain + " " + symbol)
      console.log('rpc: ' + rpcUrl);
      var response : any;
      if(chain == 'TRON')
      {
        if(symbol == 'TRX')
           response = await fetchBalance(walletAddress);
        else 
          response = await fetchContractBalance(walletAddress,tokenAddress);
      }
      else {
        if(symbol == 'ETH' || symbol == 'WETH' || symbol == 'BNB')
          response = await fetchBalanceEth(walletAddress,rpcUrl);
        else
          response = await fetchTokenBalance(tokenAddress, walletAddress,rpcUrl,decimalNo);
      }
      
      res.json(response)
    
  
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error fetch balance `)
      console.log(error)
      res.status(500).json({success:false,error:'error fetch balance ' + error})
    }
  })

  app.post('/gas-balance', async (req, res) => {
    try {
  
      if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,error:'Invalid authentication API key or token '})
        return;
      }

      const { walletAddress,rpcUrl,chain,symbol} = req.body;
      
      console.log('bal22 '  + " " + chain + " " + symbol)
      console.log('rpc: ' + rpcUrl);
      var response : any;
      if(chain == 'TRON')
      {
           response = await fetchBalance(walletAddress);
      }
      else {
        response = await ethGasBalanceByKey(walletAddress,rpcUrl);
      }
      
      res.json(response)
    
  
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error gas balance `)
      console.log(error)
      res.status(500).json({success:false,error:'error gas balance ' + error})
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
      else 
      {
          console.log('eth api route ') 
          response = await fetchTransactionDetailEth(txId, symbol, chain, rpcUrl);
          res.json(response)
      }

      /*else if(symbol == 'USDC' && txId.indexOf('0x') < 0)
      {
         response = await transferQueryUSDC(txId,symbol)
         console.log(response)

         res.json(response)
      }*/

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

      const { key,receiverAddress,contractAddress,amount, senderAddress,chain,symbol,externalRef,rpcUrl} = req.body;
      console.log("transfer req: " + receiverAddress + " " + amount);
      var response: any;
      
      /*if(symbol == 'USDC')
      {
        response = await transferUSDC(senderAddress, receiverAddress,amount,contractAddress,externalRef,chain);
        res.json(response)

      }*/
      
      if(chain == 'TRON')  
      {
        if(symbol == 'TRX') 
           response = await transferTrx(receiverAddress,amount,key);
        else 
           response = await transfer(receiverAddress,contractAddress,amount,senderAddress,chain,symbol,key);
        
      }
      else
      {
          response = await internalTransfer(key,amount,receiverAddress,symbol,rpcUrl,contractAddress)
      }

      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error doing transfer `)
      res.status(500).json({success:false,error:'error doing transfer ' + error})
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

  app.post('/manage-officer', async (req, res) => {
    try {
  
     
      const { key, address, role,actionCode,rpcUrl,contractAddress,symbol,chain} = req.body;
      console.log("add credit officer: "  + " " + address + " " + role + " " + actionCode);
    
      let response : any;
      if(chain == 'TRON') 
         response = await addCreditOfficer(address,key);
      else  
         response = await addAdmin(key,rpcUrl,contractAddress,address,role);
      
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

  app.post('/validate-role', async (req, res) => {
    try {
  
      /*if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,error:'Invalid authentication API key or token '})
        return;
      }*/

      const { key, rpcUrl,contractAddress,symbol,chain,address,role} = req.body;
      console.log("is credit officer: "  + " " + address + " " );
      
      let response: any;
      if(chain == 'TRON')
        response = await isCreditOfficer(key,address,contractAddress,rpcUrl);
  
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
     console.log(`Error: is credit officer ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.post('/request-loan', async (req, res) => {
    try {
  
     
      const { key, tokenToBorrow,borrower,merchantAddress,amount,depositAmount,fee,ref,chain,rpcUrl,contractAddress} = req.body;
      console.log("request-loan: "  + " " + borrower);
      console.log("amount: "  + " " + amount);
    
      let response : any;
      if(chain == 'TRON')
        response = await createLoan(key,tokenToBorrow,ref,merchantAddress,amount,fee,depositAmount,borrower,rpcUrl,contractAddress);
      else if(chain == 'ARC')
        response = await arcCreateLoan(key,amount,rpcUrl,contractAddress,tokenToBorrow,ref,merchantAddress,fee,depositAmount,borrower);
      else
        response = await ethCreateLoan(key,amount,rpcUrl,contractAddress,tokenToBorrow,ref,merchantAddress,fee,depositAmount,borrower);
      
      
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
  
     
      const { key, tokenToBorrow,amount,chain,rpcUrl} = req.body;
      console.log("deposit collateral: "  + " " + tokenToBorrow);
      console.log("amount: "  + " " + amount);
    
      let response : any;
      response = await depositCollateral(key,tokenToBorrow,amount);
      
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
  
     
      const { key, amount,ref,chain,rpcUrl,contractAddress,tokenToBorrow} = req.body;
      console.log("repay-loan: "  + " " + ref);
    
      let response : any;
      if(chain == 'TRON')
         response = await repayLoan(key,ref,amount,rpcUrl,contractAddress);
      else if(chain == 'ARC')
          response = await arcRepayLoan(key,amount,rpcUrl,contractAddress,tokenToBorrow,ref);
      else 
         response = await ethRepayLoan(key,amount,rpcUrl,contractAddress,tokenToBorrow,ref);
      
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
      //const response = await fetchBorrowerLoans(req.params.address);
  
      //res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
     console.log(`Error: borrower details ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  
  app.post('/deposit-into-lend-vault', async (req, res) => {
    try {
  
     
      const { key, tokenToBorrow,amount,chain,rpcUrl,contractAddress} = req.body;
      console.log("deposit-into-lend-vault: "  + " " + tokenToBorrow + " " + contractAddress);
      console.log("amount: "  + " " + amount + " " + chain);
    
      let response : any;
      
      if(chain == 'TRON')
        response = await depositToVault(key,tokenToBorrow,amount,rpcUrl,contractAddress);
      else if(chain == 'ARC')
        response = await arcDepositIntoVault(key,amount,rpcUrl,contractAddress,tokenToBorrow);
      else
         response = await ethDepositIntoVault(key,amount,rpcUrl,contractAddress,tokenToBorrow);
      
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

      const { key, tokenToBorrow,amount,chain,rpcUrl,contractAddress} = req.body;
      console.log("withdraw-from-lend-vault: "  + " " + tokenToBorrow);
      console.log("amount: "  + " " + amount);
    
      let response : any;
      if(chain == 'TRON')
        response = await withdrawVault(key,tokenToBorrow,amount,rpcUrl,contractAddress);
      else if(chain == 'ARC')
        response = await arcWithdrawFromVault(key,amount,rpcUrl,contractAddress,tokenToBorrow);
      else 
        response = await ethWithdrawFromVault(key,amount,rpcUrl,contractAddress,tokenToBorrow);
          
      
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
     
      const { key, address, whiteOrBlack,status,ctype,rpcUrl,contractAddress,chain} = req.body;
      console.log("address: "  + " " + address + ' ' + ctype);
      let response : any;
 
      if(chain == 'TRON')
        response = await whitelistOrBlackVaultUser(key,address,status,whiteOrBlack,rpcUrl,contractAddress);
      else
        response = await updateWhiteOrBlackListLend(key,address,status,whiteOrBlack,rpcUrl,contractAddress);

      res.json(response)
 
    } catch (error) {
      console.log(`Error: whtelist error ` + error.message)
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

      const { key, platformFee,lenderFee,depositPercent,rpcUrl,contractAddress,chain,defaultRate} = req.body;
      console.log("post-rates: "  + " " + depositPercent);
    
      let response : any;
      
      if(chain == 'TRON')
        response = await tronSetFeeAndRates(key,platformFee,lenderFee,depositPercent,rpcUrl,contractAddress);
      else if(chain == 'ARC')
         response = await arcPostRates(key,rpcUrl,contractAddress,lenderFee,platformFee,depositPercent,defaultRate);
      else 
        response = await ethPostRates(key,rpcUrl,contractAddress,lenderFee,platformFee,depositPercent,defaultRate);

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

      const { key, tokenToBorrow,rpcUrl,contractAddress,chain} = req.body;
      console.log("merchant-withdraw: "  + " " + tokenToBorrow);
    
      let response: any;
      if(chain == 'TRON')
        response = await merchantWithdrawFund(key,tokenToBorrow);
      else if(chain == 'ARC')
        response = await arcDisburseLoanToMerchant(key,rpcUrl,contractAddress,tokenToBorrow);
      else 
        response = await ethDisburseLoanToMerchant(key,rpcUrl,contractAddress,tokenToBorrow);

      console.log(response);
      res.json(response)
    
    } catch (error) {
      console.log(`Error: merchant-withdraw ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

   app.get('/check-role/:address', async (req, res) => {
    try {
  
      if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,message:'Invalid authentication API key or token '})
        return;
      }
      const rpcUrl = req.headers['x-rpc-url'] as string;
      console.log(rpcUrl);
      const response = await checkIsAdmin(req.params.address,rpcUrl,req.query.contractAddress as string);
   
  
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
     console.log(`Error: access control check role ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  });

  app.post('/create-offer', async (req, res) => {
    try {
  
     
      //"fiatSymbol":"NGN","fiatAmount":"1486","fiatTokenRate":"1486.000000","isBuy":true,"usdtAmt":"1.0000"
      const { key, token,counterparty,fiatSymbol,fiatAmount,fiatTokenRate,isBuy,usdtAmt,ref,contractAddress,rpcUrl} = req.body;
      console.log("counterparty: "  + " " + counterparty);
      console.log("rate: "  + " " + fiatTokenRate);
      console.log("is buy: "  + " " + isBuy + " " + fiatAmount);
      const response = await createOffer(key,counterparty,token,fiatSymbol,fiatAmount,
        fiatTokenRate,isBuy,usdtAmt,ref,contractAddress,rpcUrl);

      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error: create offer ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

   app.post('/release-offer', async (req, res) => {
    try {
  
     
      const { key, refNo,token,contractAddress,rpcUrl} = req.body;
      console.log("refNo: "  + " " + refNo);
      const response = await releaseOffer(key,refNo,token,contractAddress,rpcUrl);

      res.json(response)
 
    } catch (error) {
      console.log(`Error: release offer ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.post('/pick-offer', async (req, res) => {
    try {
  
     
      const { key, refNo,tokenAmount,isBuy,contractAddress,rpcUrl} = req.body;
      console.log("refNo: "  + " " + refNo);
      const response = await pickOffer(key,refNo,contractAddress,rpcUrl);

      res.json(response)
 
    } catch (error) {
      console.log(`Error: pick offer ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.post('/mark-paid', async (req, res) => {
    try {
  
     
      const { key, refNo,contractAddress,rpcUrl} = req.body;
      console.log("refNo: "  + " " + refNo);
      const response = await markOfferPaid(key,refNo,contractAddress,rpcUrl);

      res.json(response)
 
    } catch (error) {
      console.log(`Error: release offer ` + error.message)
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
      
      if(ctype == 'ESCROW')
        response = await updateWhiteOrBlackList(key,address,status,whiteOrBlack,contractAddress,rpcUrl);
      else 
        response = await updateWhiteOrBlackListLend(key,address,status,whiteOrBlack,rpcUrl,contractAddress);

      res.json(response)
 
    } catch (error) {
      console.log(`Error: release offer ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.post('/vault-balance', async (req, res) => {
    try {
  
     
      const { token, contractAddr,rpcUrl} = req.body;
      console.log("refNo: "  + " " + token);
      const response = await getVaultTokenBalance(token,contractAddr,rpcUrl);

      res.json(response)
 
    } catch (error) {
      console.log(`Error: vault balance ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })



  app.post('/fetch-loan-data', async (req, res) => {
    try {
  
     
      const { ref, contractAddress,rpcUrl,chain} = req.body;
      console.log("fetch loan data refNo: "  + " " + ref);

      let response : any;
      if(chain == 'TRON')
        response = await getLoanDataTron(ref,rpcUrl,contractAddress);
      else
        response = await getLoanData(ref,rpcUrl,contractAddress);
     
      res.json(response)
 
    } catch (error) {
      console.log(`Error: fetch loan data ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.post('/loan-dashboard-view', async (req, res) => {
    try {
  
     
      const { ref, contractAddress,rpcUrl,chain} = req.body;
      console.log("fetch loan-dashboard-view: "  + " " + ref);

      let response : any;
      if(chain == 'TRON')
        response = await getLoanDataTron(ref,rpcUrl,contractAddress);
      else
        response = await getDashboardView(rpcUrl,contractAddress);
     
      res.json(response)
 
    } catch (error) {
      console.log(`Error: loan-dashboard-view ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.post('/setup-attestor', async (req, res) => {
    try {
  
     
      const { key, contractAttestAddress,rpcUrl,chain,attestorAddress,bnplPoolAddress} = req.body;
      console.log("setup-attestor: "  + " " + contractAttestAddress);

      let response : any;
      if(chain == 'TRON')
      {
         response = await tronSetPoolAndAttestor(key,bnplPoolAddress,contractAttestAddress,rpcUrl,attestorAddress);
      }
      else if(chain == 'ARC') {
        response = await ethSetPoolAndAttestor(key,bnplPoolAddress,rpcUrl,contractAttestAddress,attestorAddress);
      }
     
      res.json(response)
 
    } catch (error) {
      console.log(`Error: setup-attestor ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.post('/borrower-attestation', async (req, res) => {
    try {
  
      const { key, rpcUrl, chain, contractAddress, borrowerAddress, creditScore, creditLimit, kycVerified} = req.body;
      console.log("issue neft: "  + " " + borrowerAddress);
    
      let response : any;
            
      if(chain == 'TRON')
        response = await tronSetBorrowerAttestation(key,borrowerAddress,creditLimit,creditScore,kycVerified,rpcUrl,contractAddress);
      else
        response = await  setBorrowerAttestation(key,borrowerAddress,creditLimit,creditScore,kycVerified,rpcUrl,contractAddress);
      
      //console.log(response);
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error borrower attestation `)
      res.status(500).json({success:false,error:'error attestation borrower ' + error})
    }
  })

  app.post('/fetch-borrower-attestation', async (req, res) => {
    try {
  
      const {  rpcUrl, chain, contractAddress, borrowerAddress,key} = req.body;
      console.log("fetch-borrower-attestation: "  + " " + borrowerAddress);
    
      let response : any;
      if(chain == 'ARC')
        response = await getBorrowerAttestation(borrowerAddress,rpcUrl,contractAddress);
      else if(chain == 'TRON')
        response = await tronGetBorrowerAttestation(borrowerAddress,contractAddress,rpcUrl,key);
      
      //console.log(response);
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error fetch-borrower-attestation `)
      res.status(500).json({success:false,error:'error fetch-borrower-attestation ' + error})
    }
  })

  app.post('/share-worth', async (req, res) => {
    try {
  
      const {  rpcUrl, chain, contractAddress, address,amount} = req.body;
      console.log("share-worth: "  + " " + amount);
    
      let response : any;
      if(chain == 'ARC')
        response = await getShareWorth(rpcUrl,contractAddress,amount);
      else if(chain == 'TRON')
         response = await tronGetVaultStats(rpcUrl,contractAddress,amount);
      
      //console.log(response);
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error share-worth `)
      res.status(500).json({success:false,error:'error share-worth ' + error})
    }
  })

  app.post('/set-od-vault-officer', async (req, res) => {
    try {
  
      const {  key,rpcUrl, chain, contractAddress, address} = req.body;
      console.log("set-od-vault-officer: "  + " " );
    
      let response : any;
      response = await ethSetVaultAdmin(key,address,rpcUrl,contractAddress);
      
      //console.log(response);
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error set-od-vault-officer `)
      res.status(500).json({success:false,error:'error set-od-vault-officer ' + error})
    }
  })

  app.post('/post-od-deposit', async (req, res) => {
    try {
  
      const {  key,rpcUrl, chain, contractAddress, amount,tokenAddress} = req.body;
      console.log("post-od-deposit: "  + " " );
    
      let response : any;
      response = await ethOdDepositCollateral(key,amount, rpcUrl,contractAddress,tokenAddress);
      
      //console.log(response);
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error post-od-deposit `)
      res.status(500).json({success:false,error:'error post-od-deposit ' + error})
    }
  })

   app.post('/testoffer', async (req, res) => {
    try {
  
     if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,message:'Invalid authentication API key or token '})
        return;
      }
      /*
        1. Set contract 
        2. Add admin control
        3. Add white list control
        4. Create offer
        
      */

      const { key, key2, token,counterparty,fiatSymbol,fiatAmount,fiatTokenRate,isBuy,usdtAmt,
        ref,contractAddress,address1,address2,rpcUrl} = req.body;
      console.log("counterparty: "  + " " + counterparty);
      console.log("rate: "  + " " + fiatTokenRate);
      console.log("is buy: "  + " " + isBuy + " " + fiatAmount);


       let response = await fetchBalanceEth(address1,rpcUrl);
       console.log('baleth ' + address1 + " " + response)

       response = await fetchBalanceEth(address2,rpcUrl);
       console.log('baleth ' + address2 + " " + response)

       response = await fetchTokenBalance(token, address1,rpcUrl,6);
       console.log('balusd ' + address1 + " " + response)
      response = await fetchTokenBalance(token, address2,rpcUrl,6);
       console.log('balusd ' + address2 + " " + response);

       const resp1 = await updateWhiteOrBlackList(key,address1,true,'W',contractAddress,rpcUrl);
       console.log(resp1)

       const resp2 = await updateWhiteOrBlackList(key,address2,true,'W',contractAddress,rpcUrl);
       console.log(resp2)
   
          
       const response55 = await createOffer(key,counterparty,token,fiatSymbol,fiatAmount,
        fiatTokenRate,isBuy,usdtAmt,ref,contractAddress,rpcUrl);
        console.log(response55);

        console.log(await fetchOfferStatus(ref,contractAddress,rpcUrl));

        let response2 : any;
        if(response55.success) {
          response2 = await pickOffer(key2,ref,contractAddress,rpcUrl);
          console.log(response2);
        }

        console.log(await fetchOfferStatus(ref,contractAddress,rpcUrl));

        let response3 : any;
         if(response2.success) {
            response3 = await markOfferPaid(key2,ref,contractAddress,rpcUrl)
            console.log(response3)
         }

         if(response3.success) {
          let response4 = await releaseOffer(key,ref,token,contractAddress,rpcUrl)
          console.log(response4)
        }
      
      //console.log(response);
      //res.json(response)
    
    } catch (error) {
      console.log(`Error: error  ` + error.message)
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



