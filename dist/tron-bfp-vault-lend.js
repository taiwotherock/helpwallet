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
exports.depositToVault = depositToVault;
exports.withdrawVault = withdrawVault;
exports.whitelistOrBlackVaultUser = whitelistOrBlackVaultUser;
exports.createLoan = createLoan;
exports.repayLoan = repayLoan;
exports.merchantWithdrawFund = merchantWithdrawFund;
exports.getBorrowerLoanOutstanding = getBorrowerLoanOutstanding;
exports.setFeeAndRates = setFeeAndRates;
exports.fetchBorrowerLoans = fetchBorrowerLoans;
const tronweb_1 = require("tronweb");
const dotenv_1 = __importDefault(require("dotenv"));
const fs = require('fs');
const path = require('path');
dotenv_1.default.config();
const bfpArtifact = JSON.parse(fs.readFileSync('./contracts-abi/VaultLendingV2.json', 'utf8'));
const abiusdt = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_upgradedAddress", "type": "address" }], "name": "deprecate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "deprecated", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_evilUser", "type": "address" }], "name": "addBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "upgradedAddress", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "maximumFee", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "_totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "unpause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_maker", "type": "address" }], "name": "getBlackListStatus", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "paused", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_subtractedValue", "type": "uint256" }], "name": "decreaseApproval", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "who", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "_value", "type": "uint256" }], "name": "calcFee", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "pause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "who", "type": "address" }], "name": "oldBalanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newBasisPoints", "type": "uint256" }, { "name": "newMaxFee", "type": "uint256" }], "name": "setParams", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "issue", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_addedValue", "type": "uint256" }], "name": "increaseApproval", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "redeem", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "basisPointsRate", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "isBlackListed", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_clearedUser", "type": "address" }], "name": "removeBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "MAX_UINT", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_blackListedUser", "type": "address" }], "name": "destroyBlackFunds", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "name": "_initialSupply", "type": "uint256" }, { "name": "_name", "type": "string" }, { "name": "_symbol", "type": "string" }, { "name": "_decimals", "type": "uint8" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_blackListedUser", "type": "address" }, { "indexed": false, "name": "_balance", "type": "uint256" }], "name": "DestroyedBlackFunds", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Issue", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Redeem", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "newAddress", "type": "address" }], "name": "Deprecate", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_user", "type": "address" }], "name": "AddedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_user", "type": "address" }], "name": "RemovedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "feeBasisPoints", "type": "uint256" }, { "indexed": false, "name": "maxFee", "type": "uint256" }], "name": "Params", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Pause", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Unpause", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "previousOwner", "type": "address" }, { "indexed": true, "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }];
function depositToVault(privateKey, tokenAddressToBorrow, requestedAmount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: process.env.TRON_NODE_URL,
                privateKey: privateKey,
            });
            //const fromAddress1 = tronWeb.defaultAddress.base58;
            let CONTRACT_ADDRESS = process.env.VAULT_LENDING_CONTRACT_ADDRESS;
            console.log('CONTRACT_ADDRESS ' + CONTRACT_ADDRESS);
            const me = tronWeb.defaultAddress.base58;
            console.log('from address ' + me);
            const amount = Number(requestedAmount) * 1000000;
            console.log(Number(requestedAmount) * 1000000);
            console.log('contract ' + tokenAddressToBorrow);
            let tokenContract = yield tronWeb.contract(abiusdt, tokenAddressToBorrow);
            let result = yield tokenContract.balanceOf(me).call();
            console.log('result-bal:: ' + result); //.toString(10));
            // Approve LoanVaultCore contract to spend tokens
            let approveTx = yield tokenContract
                .approve(CONTRACT_ADDRESS, amount)
                .send({
                from: me,
                feeLimit: 3000000000, // 100 TRX fee limit
            });
            console.log('approve contract usdt ' + approveTx);
            // --- Load BorderLessNFT ---
            const contract = yield tronWeb.contract(bfpArtifact.abi, CONTRACT_ADDRESS);
            console.log(Number(requestedAmount) * 1000000);
            // request for loan USDT
            const tx = yield contract.depositToVault(tokenAddressToBorrow, Number(requestedAmount) * 1000000).send({
                from: me,
                feeLimit: 3000000000 // 100 TRX energy fee limit
            });
            console.log("vault deposit collateral. TxID:", tx);
            return { success: true, txId: tx, message: 'PENDING' };
        }
        catch (err) {
            console.log(err);
            return { success: false, txId: '', message: err.message };
        }
    });
}
function withdrawVault(privateKey, tokenAddressToBorrow, requestedAmount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: process.env.TRON_NODE_URL,
                privateKey: privateKey,
            });
            //const fromAddress1 = tronWeb.defaultAddress.base58;
            let CONTRACT_ADDRESS = process.env.VAULT_LENDING_CONTRACT_ADDRESS;
            console.log('CONTRACT_ADDRESS ' + CONTRACT_ADDRESS);
            const me = tronWeb.defaultAddress.base58;
            console.log('from address ' + me);
            const amount = Number(requestedAmount) * 1000000;
            console.log(Number(requestedAmount) * 1000000);
            console.log('contract ' + tokenAddressToBorrow);
            let tokenContract = yield tronWeb.contract(abiusdt, tokenAddressToBorrow);
            let result = yield tokenContract.balanceOf(me).call();
            console.log('result-bal:: ' + result); //.toString(10));
            const contract = yield tronWeb.contract(bfpArtifact.abi, CONTRACT_ADDRESS);
            console.log(Number(requestedAmount) * 1000000);
            // request for loan USDT
            const tx = yield contract.withdrawFromVault(tokenAddressToBorrow, Number(requestedAmount) * 1000000).send({
                from: me,
                feeLimit: 3000000000 // 100 TRX energy fee limit
            });
            console.log(" withdraw from vault. TxID:", tx);
            return { success: true, txId: tx, message: 'PENDING' };
        }
        catch (err) {
            console.log(err);
            return { success: false, txId: '', message: err.message };
        }
    });
}
function whitelistOrBlackVaultUser(privateKey, address, status, whiteOrBlack) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: process.env.TRON_NODE_URL,
                privateKey: privateKey,
            });
            //const fromAddress1 = tronWeb.defaultAddress.base58;
            let CONTRACT_ADDRESS = process.env.VAULT_LENDING_CONTRACT_ADDRESS;
            console.log('CONTRACT_ADDRESS ' + CONTRACT_ADDRESS);
            const me = tronWeb.defaultAddress.base58;
            console.log('from address ' + me);
            const contract = yield tronWeb.contract(bfpArtifact.abi, CONTRACT_ADDRESS);
            const result = yield contract.whitelist(address).call();
            const isWhitelisted = result === true || result.toString() === '1';
            console.log(`Address ${address} whitelisted:`, isWhitelisted);
            if (isWhitelisted) {
                return { success: true, txId: '', message: 'SUCCESS' };
            }
            let tx;
            if (whiteOrBlack == 'W') {
                tx = yield contract.setWhitelist(address, status).send({
                    from: me,
                    feeLimit: 3000000000 // 100 TRX energy fee limit
                });
            }
            else {
                tx = yield contract.setBlacklist(address, status).send({
                    from: me,
                    feeLimit: 3000000000 // 100 TRX energy fee limit
                });
            }
            console.log(" whitelist or black list vault. TxID:", tx);
            return { success: true, txId: tx, message: 'PENDING' };
        }
        catch (err) {
            console.log(err);
            return { success: false, txId: '', message: err.message };
        }
    });
}
function createLoan(privateKey, tokenAddressToBorrow, ref, merchant, principal, fee, depositAmount, borrower) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: process.env.TRON_NODE_URL,
                privateKey: privateKey,
            });
            //const fromAddress1 = tronWeb.defaultAddress.base58;
            let CONTRACT_ADDRESS = process.env.VAULT_LENDING_CONTRACT_ADDRESS;
            console.log('CONTRACT_ADDRESS ' + CONTRACT_ADDRESS);
            const me = tronWeb.defaultAddress.base58;
            console.log('from address ' + me);
            const principalAmt = Number(principal) * 1000000;
            const depositAmt = Number(depositAmount) * 1000000;
            const feeAmt = Number(fee) * 1000000;
            const ref32 = stringToBytes32(ref, tronWeb);
            console.log('dep amt:: ' + depositAmount);
            console.log('principal amt:: ' + principalAmt);
            console.log('contract ' + tokenAddressToBorrow);
            console.log('ref32 ' + ref32);
            // --- Load Loan Vault ---
            const contract = yield tronWeb.contract(bfpArtifact.abi, CONTRACT_ADDRESS);
            let result = yield contract.getDepositContributionPercent().call();
            console.log('deposit percent:: ' + result);
            let result2 = yield contract.getBorrowerStats(borrower, tokenAddressToBorrow).call();
            console.log(typeof result2);
            let bdep = result2[0]; //.split(",")[0]
            console.log('borrower deposit:: ' + result2);
            console.log('borrower deposit:: ' + bdep);
            console.log('principal amt:: ' + principalAmt);
            const depRequired = principalAmt * Number(result) / 1000000;
            console.log('deposit required:: ' + depRequired);
            console.log('dep amt:: ' + depositAmt);
            // request for loan USDT
            const tx = yield contract.createLoan(ref32, tokenAddressToBorrow, merchant, principalAmt, feeAmt, depositAmt, borrower).send({
                from: me,
                feeLimit: 3000000000 // 100 TRX energy fee limit
            });
            console.log("create loan. TxID:", tx);
            return { success: true, txId: tx, message: 'PENDING' };
        }
        catch (err) {
            console.log(err);
            return { success: false, txId: '', message: err.message };
        }
    });
}
function repayLoan(privateKey, ref, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: process.env.TRON_NODE_URL,
                privateKey: privateKey,
            });
            //const fromAddress1 = tronWeb.defaultAddress.base58;
            let CONTRACT_ADDRESS = process.env.VAULT_LENDING_CONTRACT_ADDRESS;
            console.log('CONTRACT_ADDRESS ' + CONTRACT_ADDRESS);
            const me = tronWeb.defaultAddress.base58;
            console.log('from address ' + me);
            const amt = Number(amount) * 1000000;
            const ref32 = stringToBytes32(ref, tronWeb);
            console.log('amt ' + amt);
            console.log('ref32 ' + ref32);
            // --- Load Loan Vault ---
            const contract = yield tronWeb.contract(bfpArtifact.abi, CONTRACT_ADDRESS);
            // request for loan USDT
            const tx = yield contract.repayLoan(ref32, amt).send({
                from: me,
                feeLimit: 3000000000 // 100 TRX energy fee limit
            });
            console.log("repay loan. TxID:", tx);
            return { success: true, txId: tx, message: 'PENDING' };
        }
        catch (err) {
            console.log(err);
            return { success: false, txId: '', message: err.message };
        }
    });
}
function merchantWithdrawFund(privateKey, token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: process.env.TRON_NODE_URL,
                privateKey: privateKey,
            });
            //const fromAddress1 = tronWeb.defaultAddress.base58;
            let CONTRACT_ADDRESS = process.env.VAULT_LENDING_CONTRACT_ADDRESS;
            console.log('CONTRACT_ADDRESS ' + CONTRACT_ADDRESS);
            const me = tronWeb.defaultAddress.base58;
            console.log('from address ' + me);
            console.log('token ' + token);
            console.log('merchantAddress ' + me);
            // --- Load Loan Vault ---
            const contract = yield tronWeb.contract(bfpArtifact.abi, CONTRACT_ADDRESS);
            //let result = await contract.getLoans('TPBHCy5dD3NF2XBHGvhgFUiq5NND9Y3rBm',1,100).call();
            // console.log('loan outstanding details:: ' + result); 
            //let result2 = await contract.getMerchantFund(merchantAddress,token).call();
            //console.log(result2)
            // withdraw for loan USDT
            // withdrawMerchantFund(address token)
            const tx = yield contract.withdrawMerchantFund(token).send({
                from: me,
                feeLimit: 3000000000 // 100 TRX energy fee limit
            });
            console.log("withdrwa merchant fund. TxID:", tx);
            return { success: true, txId: tx, message: 'PENDING' };
        }
        catch (err) {
            console.log(err);
            return { success: false, txId: '', message: err.message };
        }
    });
}
function getBorrowerLoanOutstanding(borrowerAddr) {
    return __awaiter(this, void 0, void 0, function* () {
        const tronWeb = new tronweb_1.TronWeb({
            fullHost: process.env.TRON_NODE_URL,
            privateKey: process.env.PRIVATE_KEY_NILE
        });
        try {
            let CONTRACT_ADDRESS = process.env.VAULT_LENDING_CONTRACT_ADDRESS;
            console.log('contract pool ' + CONTRACT_ADDRESS);
            console.log('user address ' + borrowerAddr);
            // --- Load Token Contract ---
            const contract = yield tronWeb.contract(bfpArtifact.abi, CONTRACT_ADDRESS);
            //getLoans(address borrower, uint256 offset, uint256 limit)
            let result = yield contract.getLoans(borrowerAddr, 1, 100).call();
            console.log('loan outstanding details:: ' + result);
            return { success: true, message: 'SUCCESS', data: result };
        }
        catch (err) {
            console.log('error:: ' + err.message);
            return { success: false, message: err.message };
        }
    });
}
function setFeeAndRates(key, platformFee, lenderFee, depositPercent) {
    return __awaiter(this, void 0, void 0, function* () {
        const tronWeb = new tronweb_1.TronWeb({
            fullHost: process.env.TRON_NODE_URL,
            privateKey: key
        });
        try {
            let CONTRACT_ADDRESS = process.env.VAULT_LENDING_CONTRACT_ADDRESS;
            console.log('contract pool ' + CONTRACT_ADDRESS);
            console.log('user address ' + platformFee);
            const me = tronWeb.defaultAddress.base58;
            console.log('from address ' + me);
            // --- Load Token Contract ---
            const contract = yield tronWeb.contract(bfpArtifact.abi, CONTRACT_ADDRESS);
            //getLoans(address borrower, uint256 offset, uint256 limit)
            const amtp = Number(platformFee) * 1000000;
            const amtl = Number(lenderFee) * 1000000;
            const depositP = Number(depositPercent) * 1000000;
            //setFeeRate(uint256 platformFeeRate, uint256 lenderFeeRate)
            const tx = yield contract.setFeeRate(amtp, amtl).send({
                from: me,
                feeLimit: 3000000000 // 100 TRX energy fee limit
            });
            const tx2 = yield contract.setDepositContributionPercent(depositP).send({
                from: me,
                feeLimit: 3000000000 // 100 TRX energy fee limit
            });
            console.log('set rates:: ' + tx2 + " " + tx);
            return { success: true, message: 'SUCCESS', data: tx };
        }
        catch (err) {
            console.log('error:: ' + err.message);
            return { success: false, message: err.message };
        }
    });
}
function fetchBorrowerLoans(borrower) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: process.env.TRON_NODE_URL,
                privateKey: process.env.PRIVATE_KEY_NILE
            });
            //const fromAddress1 = tronWeb.defaultAddress.base58;
            let CONTRACT_ADDRESS = process.env.VAULT_LENDING_CONTRACT_ADDRESS;
            console.log('CONTRACT_ADDRESS ' + CONTRACT_ADDRESS);
            // --- Load Loan Vault ---
            const contract = yield tronWeb.contract(bfpArtifact.abi, CONTRACT_ADDRESS);
            let result = yield contract.getLoans(borrower, 0, 10).call();
            console.log('loan details:: ' + result);
            return { success: true, txId: '', data: mapToLoan(result, tronWeb) };
        }
        catch (err) {
            console.log(err);
            return { success: false, txId: '', message: err.message };
        }
    });
}
function bytes32HexToString(bytes32, tronWeb) {
    // 1️⃣ Remove the leading "0x" if necessary
    console.log(typeof bytes32);
    console.log(bytes32);
    let hexStr;
    hexStr = bytes32.toString("hex").replace(/^0x/, "");
    //const hexStr = bytes32.startsWith("0x") ? bytes32.slice(2) : bytes32;
    // 2️⃣ Convert from hex to UTF-8 string
    const text = tronWeb.toUtf8(hexStr).replace(/\u0000/g, "");
    return text;
}
function stringToBytes32(input, tronWeb) {
    // Convert string to hex
    let hex = tronWeb.toHex(input); // tronWeb.toHex exists
    // tronWeb.toHex may return variable length, need 32 bytes (64 chars)
    if (hex.length > 66) {
        // truncate to 32 bytes (0x + 64 chars)
        hex = '0x' + hex.slice(2, 66);
    }
    else {
        // pad with zeros to make 32 bytes
        hex = hex.padEnd(66, '0');
    }
    return hex;
}
function mapToLoan(raw, tronWeb) {
    const parts = raw[0][0]; //.split(",");
    //if (parts.length < 13) throw new Error("Invalid loan data");
    // Decode bytes32 ref to string
    const refHex = parts[0];
    console.log('refx ' + refHex);
    const ref = bytes32HexToString(refHex, tronWeb);
    console.log(ref);
    return {
        ref,
        borrower: tronWeb.address.fromHex(parts[1]),
        token: tronWeb.address.fromHex(parts[2]),
        merchant: tronWeb.address.fromHex(parts[3]),
        principal: (Number(parts[4]) / 1000000).toString(),
        outstanding: (Number(parts[5]) / 1000000).toString(),
        startedAt: parts[6].toString(),
        installmentsPaid: (Number(parts[7].toString()) / 1000000).toString(),
        fee: (Number(parts[8].toString()) / 1000000).toString(),
        totalPaid: (Number(parts[9].toString()) / 1000000).toString(),
        active: parts[10] === "true",
        disbursed: parts[11] === "true",
    };
}
//# sourceMappingURL=tron-bfp-vault-lend.js.map