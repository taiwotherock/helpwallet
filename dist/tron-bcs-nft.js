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
exports.issueNftCreditScore = issueNftCreditScore;
exports.updateNftCreditScore = updateNftCreditScore;
exports.getBorrowerCreditProfile = getBorrowerCreditProfile;
const tronweb_1 = require("tronweb");
const dotenv_1 = __importDefault(require("dotenv"));
const fs = require('fs');
const path = require('path');
dotenv_1.default.config();
const bcsNftArtifact = JSON.parse(fs.readFileSync('./contracts-abi/BorderlessCreditScoreNFT.json', 'utf8'));
function issueNftCreditScore(privateKey, borrower, creditScore, creditLimit, creditOfficer, creditManager) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: process.env.TRON_NODE_URL,
                privateKey: process.env.PRIVATE_KEY_NILE,
            });
            //const fromAddress1 = tronWeb.defaultAddress.base58;
            let CONTRACT_ADDRESS = process.env.BORDERLESSCS_NFT_CONTRACT_ADDRESS;
            console.log('CONTRACT_ADDRESS ' + CONTRACT_ADDRESS);
            const me = tronWeb.defaultAddress.base58;
            console.log('from address ' + me);
            // --- Load BorderLessNFT ---
            const contract = yield tronWeb.contract(bcsNftArtifact.abi, CONTRACT_ADDRESS);
            // issue Credit score NFT
            const tx = yield contract.issueCreditNFT(borrower, Number(creditScore), Number(creditLimit), creditOfficer, creditManager).send({
                from: me,
                feeLimit: 3000000000 // 100 TRX energy fee limit
            });
            console.log("Credit NFT Issued. TxID:", tx);
            return { success: true, txId: tx, message: 'SUCCESS' };
        }
        catch (err) {
            console.log(err);
            return { success: false, txId: '', message: err.message };
        }
    });
}
function updateNftCreditScore(privateKey, tokenId, creditScore, creditLimit, creditOfficer) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: process.env.TRON_NODE_URL,
                privateKey: process.env.PRIVATE_KEY_NILE,
            });
            //const fromAddress1 = tronWeb.defaultAddress.base58;
            let CONTRACT_ADDRESS = process.env.BORDERLESSCS_NFT_CONTRACT_ADDRESS;
            console.log('CONTRACT_ADDRESS ' + CONTRACT_ADDRESS);
            const me = tronWeb.defaultAddress.base58;
            console.log('from address ' + me);
            // --- Load BorderLessNFT ---
            const contract = yield tronWeb.contract(bcsNftArtifact.abi, CONTRACT_ADDRESS);
            // issue Credit score NFT
            const tx = yield contract.updateCreditNFT(1, Number(creditScore), Number(creditLimit), creditOfficer).send({
                from: me,
                feeLimit: 3000000000 // 100 TRX energy fee limit
            });
            console.log("Credit NFT Updated. TxID:", tx);
            return { success: true, txId: tx, message: 'SUCCESS' };
        }
        catch (err) {
            console.log(err);
            return { success: false, txId: '', message: err.message };
        }
    });
}
function getBorrowerCreditProfile(borrowerAddr) {
    return __awaiter(this, void 0, void 0, function* () {
        const tronWeb = new tronweb_1.TronWeb({
            fullHost: process.env.TRON_NODE_URL,
            privateKey: process.env.PRIVATE_KEY_NILE
        });
        try {
            let CONTRACT_ADDRESS = process.env.BORDERLESSCS_NFT_CONTRACT_ADDRESS;
            console.log('contract pool ' + CONTRACT_ADDRESS);
            console.log('user address ' + borrowerAddr);
            // --- Load Token Contract ---
            const contract = yield tronWeb.contract(bcsNftArtifact.abi, CONTRACT_ADDRESS);
            let result = yield contract.getCreditProfileByBorrower(borrowerAddr).call();
            console.log('result-profiles:: ' + result); //.toString(10));
            return { success: true, message: result };
        }
        catch (err) {
            console.log('error:: ' + err.message);
            return { success: false, message: err.message };
        }
    });
}
//# sourceMappingURL=tron-bcs-nft.js.map