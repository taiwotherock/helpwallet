import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
import { createWalletWithPhrase, fetchBalance } from './tron-wallet'
import { fetchContractBalance,fetchTransactionsByWallet } from './tron-contract-service'
import { transfer } from './tron-transfer'
import { approveBuyer } from './bpay-escrow-client'
import { createWallet,fetchBalanceUSDC,transferQueryUSDC,transferUSDC } from './circle-wallet'
import { createWalletWithPhraseEth } from './eth-wallet'
import { fetchTokenBalance,fetchBalanceEth,fetchTransactionDetailEth } from './eth-balance'



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

      const { walletAddress,tokenAddress,rpcUrl,decimalNo} = req.body;
      
      console.log('bal ' + walletAddress + ' ' + tokenAddress)
      var response : any;
      

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

  app.post('/fetch-transaction-status/', async (req, res) => {
    try {

   
      const { chain,symbol,txId,rpcUrl} = req.body;
      var response : any;
      console.log('fetch status ' + symbol + ' ' + txId )
      if(chain == 'TRON') {
        response = await fetchTransactionsByWallet(txId);
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



