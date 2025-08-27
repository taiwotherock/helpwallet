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
const bpay_escrow_client_1 = require("./bpay-escrow-client");
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
        const response = yield (0, tron_wallet_1.createWalletWithPhrase)(req.query.username, req.query.entityCode, req.query.name);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error creating wallet `);
        res.status(500).json({ success: false, error: 'error creating wallet ' + error });
    }
}));
app.get('/balance/:address', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const response = yield (0, tron_wallet_1.fetchBalance)(req.params.address);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error fetch balance `);
        res.status(500).json({ success: false, error: 'error fetch balance ' + error });
    }
}));
app.get('/contract-balance/:address', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        console.log('source code ' + xSourceCode + ' ' + xClientId);
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
        const response = yield (0, tron_contract_service_1.fetchTransactionsByWallet)(req.params.address);
        res.json(response);
        //res.json(successResponse(response))
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
        const { receiverAddress, contractAddress, amount, senderAddress, chain, symbol } = req.body;
        console.log("transfer req: " + receiverAddress + " " + amount);
        const response = yield (0, tron_transfer_1.transfer)(receiverAddress, contractAddress, amount, senderAddress, chain, symbol);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error creating wallet `);
        res.status(500).json({ success: false, error: 'error creating wallet ' + error });
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
//# sourceMappingURL=app.js.map