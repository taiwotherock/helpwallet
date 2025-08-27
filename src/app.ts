import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
import { createWalletWithPhrase, fetchBalance } from './tron-wallet'
import { fetchContractBalance,fetchTransactionsByWallet } from './tron-contract-service'
import { transfer } from './tron-transfer'
import { approveBuyer } from './bpay-escrow-client'



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
      
      const response = await createWalletWithPhrase(req.query.username,req.query.entityCode,req.query.name);
  
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error creating wallet `)
      res.status(500).json({success:false,error:'error creating wallet ' + error})
    }
  })

  app.get('/balance/:address', async (req, res) => {
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
      
      const response = await fetchBalance(req.params.address);
  
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error fetch balance `)
      res.status(500).json({success:false,error:'error fetch balance ' + error})
    }
  })

  app.get('/contract-balance/:address', async (req, res) => {
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
      console.log('source code ' + xSourceCode + ' ' + xClientId)
      
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
      
      const response = await fetchTransactionsByWallet(req.params.address);
  
      res.json(response)
    
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

      const { receiverAddress,contractAddress,amount, senderAddress,chain,symbol} = req.body;
      console.log("transfer req: " + receiverAddress + " " + amount);
      
      const response = await transfer(receiverAddress,contractAddress,amount,senderAddress,chain,symbol);

      res.json(response)
    
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



