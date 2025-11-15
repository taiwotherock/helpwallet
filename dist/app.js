"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const tron_wallet_1 = require("./tron-wallet");
const tron_contract_service_1 = require("./tron-contract-service");
const tron_transfer_1 = require("./tron-transfer");
const tron_freeze_1 = require("./tron-freeze");
const bpay_escrow_client_1 = require("./bpay-escrow-client");
const circle_wallet_1 = require("./circle-wallet");
const eth_wallet_1 = require("./eth-wallet");
const eth_balance_1 = require("./eth-balance");
const tron_bfp_liquiditypool_1 = require("./tron-bfp-liquiditypool");
const tron_event_listeners_1 = require("./tron-event-listeners");
const tron_swap_route_1 = require("./tron-swap-route");
const tron_bcs_nft_1 = require("./tron-bcs-nft");
const tron_access_control_1 = require("./tron-access-control");
const tron_tx_status_1 = require("./tron-tx-status");
const tron_bfp_loanmgr_1 = require("./tron-bfp-loanmgr");
const tron_bfp_loanvault_1 = require("./tron-bfp-loanvault");
const tron_bfp_vault_lend_1 = require("./tron-bfp-vault-lend");
const eth_swap_1 = require("./eth-swap");
const eth_access_control_client_1 = require("./eth-access-control-client");
const eth_lending_1 = require("./eth-lending");
const eth_escrow_vault_1 = require("./eth-escrow-vault");
const eth_wallet_2 = require("./eth-wallet");
const eth_lending_arc_1 = require("./eth-lending-arc");
dotenv_1.default.config();
const PORT = process.env._PORT;
//const API_KEY = process.env.API_KEY
//const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const origins = process.env.CORS_ORIGIN;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.listen(PORT, () => {
    //listenDeposited().catch(console.error);
    return console.log(`Express is listening at http://localhost:${PORT}`);
});
app.post('/create-wallet', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers['authorization']; // lowercase key
        const sourceCode = req.headers['x-source-code'];
        const clientId = req.headers['x-client-id'];
        const clientSecret = req.headers['x-client-secret'];
        console.log('header ' + sourceCode + ' ' + clientId);
        const xClientId = process.env.X_CLIENT_ID;
        const xClientSecret = process.env.X_CLIENT_SECRET;
        const xSourceCode = process.env.X_SOURCE_CODE;
        console.log('source code ' + xSourceCode + ' ' + xClientId);
        const chain = req.query.chain;
        const symbol = req.query.symbol;
        var response;
        /*if(symbol == 'USDC')
        {
          response = await createWallet(req.query.name,'',chain);
          res.json(response)
         
        }
        else*/
        if (chain == 'TRON') {
            response = yield (0, tron_wallet_1.createWalletWithPhrase)(req.query.username, req.query.entityCode, req.query.name);
            res.json(response);
        }
        else {
            response = yield (0, eth_wallet_1.createWalletWithPhraseEth)(chain, symbol);
            res.json(response);
        }
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error creating wallet `);
        console.log(error);
        res.status(500).json({ success: false, error: 'error creating wallet ' + error });
    }
}));
app.get('/balance/:address', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!validateToken(req)) {
            console.log(`Invalid authentication API key or token `);
            res.status(500).json({ success: false, error: 'Invalid authentication API key or token ' });
            return;
        }
        const symbol = req.query.symbol;
        const chain = req.query.chain;
        const rpcUrl = req.query.rpcUrl;
        console.log('bal ' + symbol + ' ' + req.params.address);
        var response;
        if (symbol == 'USDC') {
            response = yield (0, circle_wallet_1.fetchBalanceUSDC)(req.params.address);
            res.json(response);
        }
        else if (chain == 'TRON' || symbol == 'TRX' || symbol == 'USDT') {
            if (symbol == 'USDT')
                response = yield (0, tron_contract_service_1.fetchContractBalance)(req.params.address, null);
            else
                response = yield (0, tron_wallet_1.fetchBalance)(req.params.address);
            res.json(response);
        }
        else {
            response = yield (0, eth_balance_1.fetchBalanceEth)(req.params.address, rpcUrl);
            res.json(response);
        }
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error fetch balance `);
        console.log(error);
        res.status(500).json({ success: false, error: 'error fetch balance ' + error });
    }
}));
app.post('/token-balance', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!validateToken(req)) {
            console.log(`Invalid authentication API key or token `);
            res.status(500).json({ success: false, error: 'Invalid authentication API key or token ' });
            return;
        }
        const { walletAddress, tokenAddress, rpcUrl, decimalNo, chain, symbol } = req.body;
        console.log('bal22 ' + walletAddress + ' ' + tokenAddress + " " + chain + " " + symbol);
        console.log('rpc: ' + rpcUrl);
        var response;
        if (chain == 'TRON') {
            if (symbol == 'TRX')
                response = yield (0, tron_wallet_1.fetchBalance)(walletAddress);
            else
                response = yield (0, tron_contract_service_1.fetchContractBalance)(walletAddress, tokenAddress);
        }
        else {
            if (symbol == 'ETH' || symbol == 'WETH' || symbol == 'BNB')
                response = yield (0, eth_balance_1.fetchBalanceEth)(walletAddress, rpcUrl);
            else
                response = yield (0, eth_balance_1.fetchTokenBalance)(tokenAddress, walletAddress, rpcUrl, decimalNo);
        }
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error fetch balance `);
        console.log(error);
        res.status(500).json({ success: false, error: 'error fetch balance ' + error });
    }
}));
app.post('/gas-balance', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!validateToken(req)) {
            console.log(`Invalid authentication API key or token `);
            res.status(500).json({ success: false, error: 'Invalid authentication API key or token ' });
            return;
        }
        const { walletAddress, rpcUrl, chain, symbol } = req.body;
        console.log('bal22 ' + " " + chain + " " + symbol);
        console.log('rpc: ' + rpcUrl);
        var response;
        if (chain == 'TRON') {
            response = yield (0, tron_wallet_1.fetchBalance)(walletAddress);
        }
        else {
            response = yield (0, eth_wallet_2.ethGasBalanceByKey)(walletAddress, rpcUrl);
        }
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error gas balance `);
        console.log(error);
        res.status(500).json({ success: false, error: 'error gas balance ' + error });
    }
}));
app.get('/contract-balance/:address', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!validateToken(req)) {
            console.log(`Invalid authentication API key or token `);
            res.status(500).json({ success: false, error: 'Invalid authentication API key or token ' });
            return;
        }
        const response = yield (0, tron_contract_service_1.fetchContractBalance)(req.params.address, req.query.contractAddress);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error fetch balance `);
        res.status(500).json({ success: false, error: 'error fetch balance ' + error });
    }
}));
app.get('/fetch-transaction-by-wallet/:address', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, tron_contract_service_1.fetchTransactionsByWallet)(req.params.address);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error fetching transactions `);
        res.status(500).json({ success: false, error: 'error fetching transactions ' + error });
    }
}));
app.post('/fetch-transaction-status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chain, symbol, txId, rpcUrl, timeAllow } = req.body;
        var response;
        console.log('fetch status ' + symbol + ' ' + txId);
        if (chain == 'TRON') {
            response = yield (0, tron_contract_service_1.fetchTransactionsByWallet)(txId);
            response = yield (0, tron_event_listeners_1.listenDeposited)(txId, symbol, timeAllow);
            res.json(response);
        }
        else if (symbol == 'USDC' && txId.indexOf('0x') < 0) {
            response = yield (0, circle_wallet_1.transferQueryUSDC)(txId, symbol);
            console.log(response);
            res.json(response);
        }
        else {
            console.log('eth api route ');
            response = yield (0, eth_balance_1.fetchTransactionDetailEth)(txId, symbol, chain, rpcUrl);
            res.json(response);
        }
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error fetching transactions `);
        res.status(500).json({ success: false, error: 'error fetching transactions ' + error });
    }
}));
app.post('/fetch-tx-byid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chain, symbol, txId, rpcUrl } = req.body;
        var response;
        console.log('fetch status by id' + symbol + ' ' + txId + ' ' + chain);
        if (chain == 'TRON') {
            response = yield (0, tron_tx_status_1.tranStatus)(txId);
            res.json(response);
        }
        else {
            console.log('eth api route ');
            response = yield (0, eth_balance_1.fetchTransactionDetailEth)(txId, symbol, chain, rpcUrl);
            res.json(response);
        }
        /*else if(symbol == 'USDC' && txId.indexOf('0x') < 0)
        {
           response = await transferQueryUSDC(txId,symbol)
           console.log(response)
  
           res.json(response)
        }*/
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error fetching transactions `);
        res.status(500).json({ success: false, error: 'error fetching transactions ' + error });
    }
}));
app.post('/freeze-trx', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, amount, resourceType, receiverAddress } = req.body;
        var response;
        console.log('freeze ' + receiverAddress + ' ' + resourceType);
        response = yield (0, tron_freeze_1.freezeTRX)(key, amount, receiverAddress, resourceType);
        res.json(response);
    }
    catch (error) {
        console.log(`Error fetching transactions `);
        res.status(500).json({ success: false, error: 'error fetching transactions ' + error });
    }
}));
app.post('/transfer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers['authorization']; // lowercase key
        const sourceCode = req.headers['x-source-code'];
        const clientId = req.headers['x-client-id'];
        const clientSecret = req.headers['x-client-secret'];
        console.log('header ' + sourceCode + ' ' + clientId);
        const xClientId = process.env.X_CLIENT_ID;
        const xClientSecret = process.env.X_CLIENT_SECRET;
        const xSourceCode = process.env.X_SOURCE_CODE;
        console.log('source code ' + xSourceCode + ' ' + xClientId);
        const { key, receiverAddress, contractAddress, amount, senderAddress, chain, symbol, externalRef, rpcUrl } = req.body;
        console.log("transfer req: " + receiverAddress + " " + amount);
        var response;
        /*if(symbol == 'USDC')
        {
          response = await transferUSDC(senderAddress, receiverAddress,amount,contractAddress,externalRef,chain);
          res.json(response)
  
        }*/
        if (chain == 'TRON') {
            if (symbol == 'TRX')
                response = yield (0, tron_transfer_1.transferTrx)(receiverAddress, amount, key);
            else
                response = yield (0, tron_transfer_1.transfer)(receiverAddress, contractAddress, amount, senderAddress, chain, symbol, key);
        }
        else {
            response = yield (0, eth_swap_1.internalTransfer)(key, amount, receiverAddress, symbol, rpcUrl, contractAddress);
        }
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error doing transfer `);
        res.status(500).json({ success: false, error: 'error doing transfer ' + error });
    }
}));
app.post('/approve-buyer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers['authorization']; // lowercase key
        const sourceCode = req.headers['x-source-code'];
        const clientId = req.headers['x-client-id'];
        const clientSecret = req.headers['x-client-secret'];
        console.log('header ' + sourceCode + ' ' + clientId);
        const xClientId = process.env.X_CLIENT_ID;
        const xClientSecret = process.env.X_CLIENT_SECRET;
        const xSourceCode = process.env.X_SOURCE_CODE;
        console.log('source code ' + xSourceCode + ' ' + xClientId);
        const { buyerAddress, contractAddress } = req.body;
        console.log("transfer req: " + buyerAddress + " " + contractAddress);
        const response = yield (0, bpay_escrow_client_1.approveBuyer)(buyerAddress, contractAddress);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error creating wallet `);
        res.status(500).json({ success: false, error: 'error creating wallet ' + error });
    }
}));
app.post('/deposit-into-liquidity-pool', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tokenAddress, userAddress, amount, key } = req.body;
        console.log("deposit into pool req: " + tokenAddress + " " + userAddress);
        const response = yield (0, tron_bfp_liquiditypool_1.depositIntoPool)(key, tokenAddress, amount, userAddress);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error creating wallet `);
        res.status(500).json({ success: false, error: 'error creating wallet ' + error });
    }
}));
app.post('/get-user-deposit-in-pool', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tokenAddress, userAddress } = req.body;
        console.log("deposit into pool req: " + tokenAddress + " " + userAddress);
        const response = yield (0, tron_bfp_liquiditypool_1.getUserDepositFromPool)(tokenAddress, userAddress);
        console.log(response);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error creating wallet `);
        res.status(500).json({ success: false, error: 'error creating wallet ' + error });
    }
}));
app.post('/fetch-tron-resources', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, userAddress } = req.body;
        console.log("fetch tron resources: " + " " + userAddress);
        const response = yield (0, tron_freeze_1.getTronResources)(key, userAddress);
        console.log(response);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error creating wallet `);
        res.status(500).json({ success: false, error: 'error creating wallet ' + error });
    }
}));
app.post('/swap', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tokenA, tokenB, key, amount, fromAddress } = req.body;
        console.log("do swap: " + " " + tokenA);
        const response = yield (0, tron_swap_route_1.tronswaptrx)(tokenA, tokenB, fromAddress, key);
        console.log(response);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error with swapping `);
        res.status(500).json({ success: false, error: 'error creating wallet ' + error });
    }
}));
app.post('/issue-bsc-nft', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, borrowerAddress, creditScore, creditLimit, creditOfficer, creditManager } = req.body;
        console.log("issue neft: " + " " + borrowerAddress);
        const response = yield (0, tron_bcs_nft_1.issueNftCreditScore)(key, borrowerAddress, creditScore, creditLimit, creditOfficer, creditManager);
        //console.log(response);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error creating wallet `);
        res.status(500).json({ success: false, error: 'error creating wallet ' + error });
    }
}));
app.post('/update-bsc-nft', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, tokenId, creditScore, creditLimit, creditOfficer } = req.body;
        console.log("update neft: " + " " + tokenId);
        const response = yield (0, tron_bcs_nft_1.updateNftCreditScore)(key, tokenId, creditScore, creditLimit, creditOfficer);
        //console.log(response);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error update nft `);
        res.status(500).json({ success: false, error: 'error update nft ' + error });
    }
}));
app.post('/manage-officer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, address, role, actionCode, rpcUrl, contractAddress, symbol, chain } = req.body;
        console.log("add credit officer: " + " " + address + " " + role + " " + actionCode);
        let response;
        if (chain == 'TRON')
            response = yield (0, tron_access_control_1.addCreditOfficer)(address, key);
        else
            response = yield (0, eth_access_control_client_1.addAdmin)(key, rpcUrl, contractAddress, address, role);
        //console.log(response);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error: add ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.get('/borrower-nft-profile/:address', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        /*if(!validateToken(req))
        {
          console.log(`Invalid authentication API key or token `)
          res.status(500).json({success:false,error:'Invalid authentication API key or token '})
          return;
        }*/
        const response = yield (0, tron_bcs_nft_1.getBorrowerCreditProfile)(req.params.address);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error: borrower profile ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.get('/validate-credit-officer/:address', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        /*if(!validateToken(req))
        {
          console.log(`Invalid authentication API key or token `)
          res.status(500).json({success:false,error:'Invalid authentication API key or token '})
          return;
        }*/
        const response = yield (0, tron_access_control_1.isCreditOfficer)(req.params.address);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error: is credit officer ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/request-loan', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, tokenToBorrow, borrower, merchantAddress, amount, depositAmount, fee, ref, chain, rpcUrl, contractAddress } = req.body;
        console.log("request-loan: " + " " + borrower);
        console.log("amount: " + " " + amount);
        let response;
        if (chain == 'TRON')
            response = yield (0, tron_bfp_vault_lend_1.createLoan)(key, tokenToBorrow, ref, merchantAddress, amount, fee, depositAmount, borrower);
        else
            response = yield (0, eth_lending_1.ethCreateLoan)(key, amount, rpcUrl, contractAddress, tokenToBorrow, ref, merchantAddress, fee, depositAmount, borrower);
        //console.log(response);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error: request loan ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/deposit-collateral', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, tokenToBorrow, amount, chain, rpcUrl } = req.body;
        console.log("deposit collateral: " + " " + tokenToBorrow);
        console.log("amount: " + " " + amount);
        let response;
        response = yield (0, tron_bfp_loanvault_1.depositCollateral)(key, tokenToBorrow, amount);
        //console.log(response);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error: deposit collateral ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/remove-collateral', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, borrower, tokenToBorrow, amount } = req.body;
        console.log("remove collateral: " + " " + tokenToBorrow);
        console.log("amount: " + " " + amount);
        const response = yield (0, tron_bfp_loanvault_1.removeCollateral)(key, borrower, tokenToBorrow, amount);
        //console.log(response);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error: deposit collateral ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/approve-disburse-loan', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, tokenToBorrow, borrower, merchantAddress, amount, depositAmount, fee } = req.body;
        console.log("borrower: " + " " + borrower);
        console.log("merchantAddress: " + " " + merchantAddress);
        console.log("tokenToBorrow: " + " " + tokenToBorrow);
        console.log("amount: " + " " + amount);
        const response = yield (0, tron_bfp_loanmgr_1.approveAndDisburseLoan)(key, borrower, tokenToBorrow, merchantAddress, amount, depositAmount, fee);
        //console.log(response);
        res.json(response);
    }
    catch (error) {
        console.log(`Error: /approve-disburse-loan ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/repay-loan', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, amount, ref, chain, rpcUrl, contractAddress, tokenToBorrow } = req.body;
        console.log("repay-loan: " + " " + ref);
        let response;
        if (chain == 'TRON')
            response = yield (0, tron_bfp_vault_lend_1.repayLoan)(key, ref, amount);
        else
            response = yield (0, eth_lending_1.ethRepayLoan)(key, amount, rpcUrl, contractAddress, tokenToBorrow, ref);
        console.log(response);
        res.json(response);
    }
    catch (error) {
        console.log(`Error: repay-loan ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/liquidate-loan', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, tokenToBorrow, borrower, amount } = req.body;
        console.log("liquidate-loan: " + " " + borrower);
        const response = yield (0, tron_bfp_loanmgr_1.liquidateLoanDue)(key, borrower, amount);
        //console.log(response);
        res.json(response);
    }
    catch (error) {
        console.log(`Error: liquidate-loan ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.get('/borrower-details/:address', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!validateToken(req)) {
            console.log(`Invalid authentication API key or token `);
            res.status(500).json({ success: false, error: 'Invalid authentication API key or token ' });
            return;
        }
        console.log(req.params.address);
        //const response = await fetchBorrowerLoans(req.params.address);
        //res.json(response)
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error: borrower details ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/deposit-into-lend-vault', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, tokenToBorrow, amount, chain, rpcUrl, contractAddress } = req.body;
        console.log("deposit-into-lend-vault: " + " " + tokenToBorrow + " " + contractAddress);
        console.log("amount: " + " " + amount + " " + chain);
        let response;
        if (chain == 'TRON')
            response = yield (0, tron_bfp_vault_lend_1.depositToVault)(key, tokenToBorrow, amount);
        else if (chain == 'ARC')
            response = yield (0, eth_lending_arc_1.arcDepositIntoVault)(key, amount, rpcUrl, contractAddress, tokenToBorrow);
        else
            response = yield (0, eth_lending_1.ethDepositIntoVault)(key, amount, rpcUrl, contractAddress, tokenToBorrow);
        //console.log(response);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error: deposit-into-lend-vault ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/withdraw-from-lend-vault', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!validateToken(req)) {
            console.log(`Invalid authentication API key or token `);
            res.status(500).json({ success: false, message: 'Invalid authentication API key or token ' });
            return;
        }
        const { key, tokenToBorrow, amount, chain, rpcUrl, contractAddress } = req.body;
        console.log("withdraw-from-lend-vault: " + " " + tokenToBorrow);
        console.log("amount: " + " " + amount);
        let response;
        if (chain == 'TRON')
            response = yield (0, tron_bfp_vault_lend_1.withdrawVault)(key, tokenToBorrow, amount);
        else
            response = yield (0, eth_lending_1.ethWithdrawFromVault)(key, amount, rpcUrl, contractAddress, tokenToBorrow);
        //console.log(response);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error: withdraw-from-lend-vault ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/white-black-status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!validateToken(req)) {
            console.log(`Invalid authentication API key or token `);
            res.status(500).json({ success: false, message: 'Invalid authentication API key or token ' });
            return;
        }
        const { key, address, whiteOrBlack, status, ctype, rpcUrl, contractAddress, chain } = req.body;
        console.log("address: " + " " + address + ' ' + ctype);
        let response;
        if (chain == 'TRON')
            response = yield (0, tron_bfp_vault_lend_1.whitelistOrBlackVaultUser)(key, address, status, whiteOrBlack);
        else
            response = yield (0, eth_lending_1.updateWhiteOrBlackListLend)(key, address, status, whiteOrBlack, rpcUrl, contractAddress);
        res.json(response);
    }
    catch (error) {
        console.log(`Error: whtelist error ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/post-rates', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!validateToken(req)) {
            console.log(`Invalid authentication API key or token `);
            res.status(500).json({ success: false, message: 'Invalid authentication API key or token ' });
            return;
        }
        const { key, platformFee, lenderFee, depositPercent, rpcUrl, contractAddress, chain, defaultRate } = req.body;
        console.log("post-rates: " + " " + depositPercent);
        let response;
        if (chain == 'TRON')
            response = yield (0, tron_bfp_vault_lend_1.setFeeAndRates)(key, platformFee, lenderFee, depositPercent);
        else
            response = yield (0, eth_lending_1.ethPostRates)(key, rpcUrl, contractAddress, lenderFee, platformFee, depositPercent, defaultRate);
        console.log(response);
        res.json(response);
    }
    catch (error) {
        console.log(`Error: post-rates ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/merchant-withdraw', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!validateToken(req)) {
            console.log(`Invalid authentication API key or token `);
            res.status(500).json({ success: false, message: 'Invalid authentication API key or token ' });
            return;
        }
        const { key, tokenToBorrow, rpcUrl, contractAddress, chain } = req.body;
        console.log("merchant-withdraw: " + " " + tokenToBorrow);
        let response;
        if (chain == 'TRON')
            response = yield (0, tron_bfp_vault_lend_1.merchantWithdrawFund)(key, tokenToBorrow);
        else
            response = yield (0, eth_lending_1.ethDisburseLoanToMerchant)(key, rpcUrl, contractAddress, tokenToBorrow);
        console.log(response);
        res.json(response);
    }
    catch (error) {
        console.log(`Error: merchant-withdraw ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.get('/check-role/:address', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!validateToken(req)) {
            console.log(`Invalid authentication API key or token `);
            res.status(500).json({ success: false, message: 'Invalid authentication API key or token ' });
            return;
        }
        const rpcUrl = req.headers['x-rpc-url'];
        console.log(rpcUrl);
        const response = yield (0, eth_access_control_client_1.checkIsAdmin)(req.params.address, rpcUrl, req.query.contractAddress);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error: access control check role ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/create-offer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //"fiatSymbol":"NGN","fiatAmount":"1486","fiatTokenRate":"1486.000000","isBuy":true,"usdtAmt":"1.0000"
        const { key, token, counterparty, fiatSymbol, fiatAmount, fiatTokenRate, isBuy, usdtAmt, ref, contractAddress, rpcUrl } = req.body;
        console.log("counterparty: " + " " + counterparty);
        console.log("rate: " + " " + fiatTokenRate);
        console.log("is buy: " + " " + isBuy + " " + fiatAmount);
        const response = yield (0, eth_escrow_vault_1.createOffer)(key, counterparty, token, fiatSymbol, fiatAmount, fiatTokenRate, isBuy, usdtAmt, ref, contractAddress, rpcUrl);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error: create offer ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/release-offer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, refNo, token, contractAddress, rpcUrl } = req.body;
        console.log("refNo: " + " " + refNo);
        const response = yield (0, eth_escrow_vault_1.releaseOffer)(key, refNo, token, contractAddress, rpcUrl);
        res.json(response);
    }
    catch (error) {
        console.log(`Error: release offer ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/pick-offer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, refNo, tokenAmount, isBuy, contractAddress, rpcUrl } = req.body;
        console.log("refNo: " + " " + refNo);
        const response = yield (0, eth_escrow_vault_1.pickOffer)(key, refNo, contractAddress, rpcUrl);
        res.json(response);
    }
    catch (error) {
        console.log(`Error: pick offer ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/mark-paid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, refNo, contractAddress, rpcUrl } = req.body;
        console.log("refNo: " + " " + refNo);
        const response = yield (0, eth_escrow_vault_1.markOfferPaid)(key, refNo, contractAddress, rpcUrl);
        res.json(response);
    }
    catch (error) {
        console.log(`Error: release offer ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/white-black-status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!validateToken(req)) {
            console.log(`Invalid authentication API key or token `);
            res.status(500).json({ success: false, message: 'Invalid authentication API key or token ' });
            return;
        }
        const { key, address, whiteOrBlack, status, ctype, rpcUrl, contractAddress } = req.body;
        console.log("address: " + " " + address + ' ' + ctype);
        let response;
        if (ctype == 'ESCROW')
            response = yield (0, eth_escrow_vault_1.updateWhiteOrBlackList)(key, address, status, whiteOrBlack, contractAddress, rpcUrl);
        else
            response = yield (0, eth_lending_1.updateWhiteOrBlackListLend)(key, address, status, whiteOrBlack, rpcUrl, contractAddress);
        res.json(response);
    }
    catch (error) {
        console.log(`Error: release offer ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/vault-balance', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, contractAddr, rpcUrl } = req.body;
        console.log("refNo: " + " " + token);
        const response = yield (0, eth_escrow_vault_1.getVaultTokenBalance)(token, contractAddr, rpcUrl);
        res.json(response);
    }
    catch (error) {
        console.log(`Error: vault balance ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/fetch-loan-data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ref, contractAddress, rpcUrl, chain } = req.body;
        console.log("fetch loan data refNo: " + " " + ref);
        let response;
        if (chain == 'TRON')
            response = yield (0, tron_bfp_vault_lend_1.getLoanDataTron)(ref, contractAddress);
        else
            response = yield (0, eth_lending_1.getLoanData)(ref, rpcUrl, contractAddress);
        res.json(response);
    }
    catch (error) {
        console.log(`Error: fetch loan data ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/loan-dashboard-view', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ref, contractAddress, rpcUrl, chain } = req.body;
        console.log("fetch loan-dashboard-view: " + " " + ref);
        let response;
        if (chain == 'TRON')
            response = yield (0, tron_bfp_vault_lend_1.getLoanDataTron)(ref, contractAddress);
        else
            response = yield (0, eth_lending_1.getDashboardView)(rpcUrl, contractAddress);
        res.json(response);
    }
    catch (error) {
        console.log(`Error: loan-dashboard-view ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/testoffer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!validateToken(req)) {
            console.log(`Invalid authentication API key or token `);
            res.status(500).json({ success: false, message: 'Invalid authentication API key or token ' });
            return;
        }
        /*
          1. Set contract
          2. Add admin control
          3. Add white list control
          4. Create offer
          
        */
        const { key, key2, token, counterparty, fiatSymbol, fiatAmount, fiatTokenRate, isBuy, usdtAmt, ref, contractAddress, address1, address2, rpcUrl } = req.body;
        console.log("counterparty: " + " " + counterparty);
        console.log("rate: " + " " + fiatTokenRate);
        console.log("is buy: " + " " + isBuy + " " + fiatAmount);
        let response = yield (0, eth_balance_1.fetchBalanceEth)(address1, rpcUrl);
        console.log('baleth ' + address1 + " " + response);
        response = yield (0, eth_balance_1.fetchBalanceEth)(address2, rpcUrl);
        console.log('baleth ' + address2 + " " + response);
        response = yield (0, eth_balance_1.fetchTokenBalance)(token, address1, rpcUrl, 6);
        console.log('balusd ' + address1 + " " + response);
        response = yield (0, eth_balance_1.fetchTokenBalance)(token, address2, rpcUrl, 6);
        console.log('balusd ' + address2 + " " + response);
        const resp1 = yield (0, eth_escrow_vault_1.updateWhiteOrBlackList)(key, address1, true, 'W', contractAddress, rpcUrl);
        console.log(resp1);
        const resp2 = yield (0, eth_escrow_vault_1.updateWhiteOrBlackList)(key, address2, true, 'W', contractAddress, rpcUrl);
        console.log(resp2);
        const response55 = yield (0, eth_escrow_vault_1.createOffer)(key, counterparty, token, fiatSymbol, fiatAmount, fiatTokenRate, isBuy, usdtAmt, ref, contractAddress, rpcUrl);
        console.log(response55);
        console.log(yield (0, eth_escrow_vault_1.fetchOfferStatus)(ref, contractAddress, rpcUrl));
        let response2;
        if (response55.success) {
            response2 = yield (0, eth_escrow_vault_1.pickOffer)(key2, ref, contractAddress, rpcUrl);
            console.log(response2);
        }
        console.log(yield (0, eth_escrow_vault_1.fetchOfferStatus)(ref, contractAddress, rpcUrl));
        let response3;
        if (response2.success) {
            response3 = yield (0, eth_escrow_vault_1.markOfferPaid)(key2, ref, contractAddress, rpcUrl);
            console.log(response3);
        }
        if (response3.success) {
            let response4 = yield (0, eth_escrow_vault_1.releaseOffer)(key, ref, token, contractAddress, rpcUrl);
            console.log(response4);
        }
        //console.log(response);
        //res.json(response)
    }
    catch (error) {
        console.log(`Error: error  ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
function validateToken(req) {
    const authHeader = req.headers['authorization']; // lowercase key
    const sourceCode = req.headers['x-source-code'];
    const clientId = req.headers['x-client-id'];
    const clientSecret = req.headers['x-client-secret'];
    console.log('header ' + sourceCode + ' ' + clientId);
    const xClientId = process.env.X_CLIENT_ID;
    const xClientSecret = process.env.X_CLIENT_SECRET;
    const xSourceCode = process.env.X_SOURCE_CODE;
    console.log('source code ' + xSourceCode + ' ' + xClientId);
    console.log('source code ' + xSourceCode + ' ' + xClientId);
    return true;
}
//listenDeposited().catch(console.error);
//# sourceMappingURL=app.js.map