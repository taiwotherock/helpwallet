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
exports.requestLoan = requestLoan;
exports.approveAndDisburseLoan = approveAndDisburseLoan;
exports.liquidateLoanDue = liquidateLoanDue;
exports.repay = repay;
exports.getBorrowerOutstanding = getBorrowerOutstanding;
const tronweb_1 = require("tronweb");
const dotenv_1 = __importDefault(require("dotenv"));
const fs = require('fs');
const path = require('path');
dotenv_1.default.config();
const bfpArtifact = JSON.parse(fs.readFileSync('./contracts-abi/LoanManagerV11.json', 'utf8'));
function requestLoan(privateKey, borrower, tokenAddressToBorrow, merchantAddress, requestedAmount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: process.env.TRON_NODE_URL,
                privateKey: privateKey,
            });
            //const fromAddress1 = tronWeb.defaultAddress.base58;
            let CONTRACT_ADDRESS = process.env.LOAN_MANAGER_CONTRACT_ADDRESS;
            console.log('CONTRACT_ADDRESS ' + CONTRACT_ADDRESS);
            const me = tronWeb.defaultAddress.base58;
            console.log('from address ' + me);
            console.log('merchant Address ' + merchantAddress);
            console.log(Number(requestedAmount) * 1000000);
            console.log('contract ' + tokenAddressToBorrow);
            if (borrower != me) {
                console.log('not borrower ' + borrower);
                return { success: false, txId: '', message: 'Not borrower' };
            }
            // --- Load BorderLessNFT ---
            const contract = yield tronWeb.contract(bfpArtifact.abi, CONTRACT_ADDRESS);
            console.log(Number(requestedAmount) * 1000000);
            // request for loan USDT
            const tx = yield contract.requestLoan(tokenAddressToBorrow, Number(requestedAmount) * 1000000, merchantAddress).send({
                from: me,
                feeLimit: 3000000000 // 100 TRX energy fee limit
            });
            console.log("Loan requested. TxID:", tx);
            return { success: true, txId: tx, message: 'SUCCESS' };
        }
        catch (err) {
            console.log(err);
            return { success: false, txId: '', message: err.message };
        }
    });
}
function approveAndDisburseLoan(privateKey, borrower, tokenAddressToBorrow, merchantAddress, approvedAmount, depositAmount, fee) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: process.env.TRON_NODE_URL,
                privateKey: privateKey,
            });
            //const fromAddress1 = tronWeb.defaultAddress.base58;
            let CONTRACT_ADDRESS = process.env.LOAN_MANAGER_CONTRACT_ADDRESS;
            console.log('CONTRACT_ADDRESS ' + CONTRACT_ADDRESS);
            const me = tronWeb.defaultAddress.base58;
            console.log('from address ' + me);
            console.log('from address ' + borrower);
            if (borrower == me) {
                console.log('you cannot approve your own loan ' + borrower);
                return { success: false, txId: '', message: 'you cannot approve your own loan' };
            }
            // --- Load BorderLessNFT ---
            const contract = yield tronWeb.contract(bfpArtifact.abi, CONTRACT_ADDRESS);
            // request for loan USDT
            const tx = yield contract.approveAndDisburse(borrower, tokenAddressToBorrow, Number(approvedAmount) * 1000000, Number(depositAmount) * 1000000, Number(fee) * 100000, merchantAddress).send({
                from: me,
                feeLimit: 3000000000 // 100 TRX energy fee limit
            });
            console.log("Loan approve and disburse. TxID:", tx);
            return { success: true, txId: tx, message: 'SUCCESS' };
        }
        catch (err) {
            console.log(err);
            return { success: false, txId: '', message: err.message };
        }
    });
}
function liquidateLoanDue(privateKey, borrower, amountToPay) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: process.env.TRON_NODE_URL,
                privateKey: privateKey,
            });
            //const fromAddress1 = tronWeb.defaultAddress.base58;
            let CONTRACT_ADDRESS = process.env.LOAN_MANAGER_CONTRACT_ADDRESS;
            console.log('CONTRACT_ADDRESS ' + CONTRACT_ADDRESS);
            const me = tronWeb.defaultAddress.base58;
            console.log('from address ' + me);
            console.log('from address ' + borrower);
            if (borrower == me) {
                console.log('you cannot approve your own loan ' + borrower);
                return { success: false, txId: '', message: 'you cannot approve your own loan' };
            }
            // --- Load BorderLessNFT ---
            const contract = yield tronWeb.contract(bfpArtifact.abi, CONTRACT_ADDRESS);
            // request for loan USDT
            const tx = yield contract.liquidateDue(borrower, Number(amountToPay) * 1000000).send({
                from: me,
                feeLimit: 3000000000 // 100 TRX energy fee limit
            });
            console.log("Loan liquidate. TxID:", tx);
            return { success: true, txId: tx, message: 'SUCCESS' };
        }
        catch (err) {
            console.log(err);
            return { success: false, txId: '', message: err.message };
        }
    });
}
function repay(privateKey, tokenAddressToBorrow, amountToPay) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: process.env.TRON_NODE_URL,
                privateKey: privateKey,
            });
            //const fromAddress1 = tronWeb.defaultAddress.base58;
            let CONTRACT_ADDRESS = process.env.LOAN_MANAGER_CONTRACT_ADDRESS;
            console.log('CONTRACT_ADDRESS ' + CONTRACT_ADDRESS);
            const me = tronWeb.defaultAddress.base58;
            console.log('from address ' + me);
            console.log('from address ' + tokenAddressToBorrow);
            // --- Load BorderLessNFT ---
            const contract = yield tronWeb.contract(bfpArtifact.abi, CONTRACT_ADDRESS);
            // request for loan USDT
            const tx = yield contract.repay(tokenAddressToBorrow, Number(amountToPay) * 1000000).send({
                from: me,
                feeLimit: 3000000000 // 100 TRX energy fee limit
            });
            console.log("Loan repay. TxID:", tx);
            return { success: true, txId: tx, message: 'SUCCESS' };
        }
        catch (err) {
            console.log(err);
            return { success: false, txId: '', message: err.message };
        }
    });
}
function getBorrowerOutstanding(borrowerAddr) {
    return __awaiter(this, void 0, void 0, function* () {
        const tronWeb = new tronweb_1.TronWeb({
            fullHost: process.env.TRON_NODE_URL,
            privateKey: process.env.PRIVATE_KEY_NILE
        });
        try {
            let CONTRACT_ADDRESS = process.env.LOAN_MANAGER_CONTRACT_ADDRESS;
            console.log('contract pool ' + CONTRACT_ADDRESS);
            console.log('user address ' + borrowerAddr);
            // --- Load Token Contract ---
            const contract = yield tronWeb.contract(bfpArtifact.abi, CONTRACT_ADDRESS);
            let result = yield contract.getLoanDetails(borrowerAddr).call();
            console.log('loan outstanding details:: ' + result);
            return { success: true, message: 'SUCCESS', data: result };
        }
        catch (err) {
            console.log('error:: ' + err.message);
            return { success: false, message: err.message };
        }
    });
}
//# sourceMappingURL=tron-bfp-loanmgr.js.map