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
exports.transfer = transfer;
exports.transactionTsq = transactionTsq;
const dotenv_1 = __importDefault(require("dotenv"));
const tron_init_1 = require("./tron-init");
dotenv_1.default.config();
function transfer(receiverAddress, contractAddress, amount, senderAddress, chain, symbol) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = process.env.ENC_KEY;
        /*let pk = await fetchWalletKey(symbol,chain,senderAddress);
        console.log('pk ' + pk);
        let pkey1 = decryptData(pk,key)
        console.log('pkey1 ' + pkey1);*/
        const tronWeb = (0, tron_init_1.initWeb)();
        const functionSelector = 'transfer(address,uint256)';
        const parameter = [{ type: 'address', value: receiverAddress }, { type: 'uint256', value: amount }];
        const tx = yield tronWeb.transactionBuilder.triggerSmartContract(contractAddress, functionSelector, {}, parameter);
        console.log('txx ' + tx + " " + JSON.stringify(tx));
        const signedTx = yield tronWeb.trx.sign(tx.transaction);
        const result = yield tronWeb.trx.sendRawTransaction(signedTx);
        console.log('result ' + result + " " + JSON.stringify(result));
        console.log('result code ' + result.code);
        // const key = '9ca418335b389449499e2b83aff09210050aa70140977c996d21d4f16fd0f9b1'; // Use a secure key
        //const dataToEncrypt = 'Sensitive Information';
        var response = { success: true, responsedata: result, responseCode: 'PP', responseMessage: '', txId: '', blockNumber: '',
            blockTimeStamp: '' };
        return response;
    });
}
function transactionTsq(walletAddress, rpcUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        let rpcUrl2 = "https://nile.trongrid.io";
        let queryParams = "/v1/accounts/" + walletAddress + "/transactions?limit=10";
        const headers = {
            'accept': 'application/json',
            'Content-Type': 'application/json',
        };
        if (this.apiKey) {
            headers['TRON-PRO-API-KEY'] = this.apiKey;
        }
        // Make the API request
        const response = yield fetch(rpcUrl2 + queryParams, {
            method: 'GET',
            headers,
        });
        console.log(response);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, message: ${response.statusText}`);
        }
        const data = yield response.json();
        if (!data.success) {
            throw new Error('API request was not successful');
        }
        return data;
    });
}
//# sourceMappingURL=tron-transfer.js.map