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
exports.addCreditOfficer = addCreditOfficer;
exports.isCreditOfficer = isCreditOfficer;
const tronweb_1 = require("tronweb");
const dotenv_1 = __importDefault(require("dotenv"));
const fs = require('fs');
const path = require('path');
dotenv_1.default.config();
const abiArtifact = JSON.parse(fs.readFileSync('./contracts-abi/AccessControlModuleV3.json', 'utf8'));
function addCreditOfficer(creditOfficer, privateKey) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: process.env.TRON_NODE_URL,
                privateKey: privateKey,
            });
            //const fromAddress1 = tronWeb.defaultAddress.base58;
            let CONTRACT_ADDRESS = process.env.ACCESS_CONTROL_CONTRACT_ADDRESS;
            console.log('CONTRACT_ADDRESS ' + CONTRACT_ADDRESS);
            console.log('credit address ' + creditOfficer);
            const me = tronWeb.defaultAddress.base58;
            console.log('from address ' + me);
            // --- Load JSON Contract ---
            const contract = yield tronWeb.contract(abiArtifact.abi, CONTRACT_ADDRESS);
            // issue Credit score NFT
            const tx = yield contract.addCreditOfficer(creditOfficer).send({
                from: me,
                feeLimit: 3000000000 // 100 TRX energy fee limit
            });
            console.log("Add address. TxID:", tx);
            return { success: true, txId: tx, message: 'SUCCESS' };
        }
        catch (err) {
            console.log(err);
            return { success: false, txId: '', message: err.message };
        }
    });
}
function isCreditOfficer(creditOfficer) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: process.env.TRON_NODE_URL,
                privateKey: 'CD6F76549C53F210AF67B6CBFDF1DFB54C07EB659C5DC7E0A66CBF8376FE70BB',
            });
            //const fromAddress1 = tronWeb.defaultAddress.base58;
            let CONTRACT_ADDRESS = process.env.ACCESS_CONTROL_CONTRACT_ADDRESS;
            console.log('CONTRACT_ADDRESS ' + CONTRACT_ADDRESS);
            console.log('credit address ' + creditOfficer);
            // --- Load JSON Contract ---
            const contract = yield tronWeb.contract(abiArtifact.abi, CONTRACT_ADDRESS);
            // issue credit officer
            let result = yield contract.isCreditOfficer(creditOfficer).call();
            console.log('is credit officer:: ' + result);
            return { success: true, txId: result, message: 'SUCCESS' };
        }
        catch (err) {
            console.log(err);
            return { success: false, txId: '', message: err.message };
        }
    });
}
//# sourceMappingURL=tron-access-control.js.map