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
exports.tronSetPoolAndAttestor = tronSetPoolAndAttestor;
exports.tronSetBorrowerAttestation = tronSetBorrowerAttestation;
exports.tronGetBorrowerAttestation = tronGetBorrowerAttestation;
const tronweb_1 = require("tronweb");
const dotenv_1 = __importDefault(require("dotenv"));
const fs = require('fs');
const path = require('path');
dotenv_1.default.config();
const abiArtifact = JSON.parse(fs.readFileSync('./contracts-abi/BNPLAttestationOracle.json', 'utf8'));
function tronSetPoolAndAttestor(key, poolAddress, contractAddress, rpcUrl, attestorAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: rpcUrl,
                privateKey: key,
            });
            //const fromAddress1 = tronWeb.defaultAddress.base58;
            //let CONTRACT_ADDRESS = process.env.ACCESS_CONTROL_CONTRACT_ADDRESS
            console.log('CONTRACT_ADDRESS ' + " " + contractAddress + " " + attestorAddress);
            const me = tronWeb.defaultAddress.base58;
            console.log('from address ' + me);
            // --- Load JSON Contract ---
            const contract = yield tronWeb.contract(abiArtifact.abi, contractAddress);
            const tx2 = yield contract.addTrustedAttestor(attestorAddress).send({
                from: me,
                feeLimit: 3000000000 // 100 TRX energy fee limit
            });
            console.log(tx2);
            // issue Credit score NFT
            const tx = yield contract.setAllowedPool(poolAddress, true).send({
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
function tronSetBorrowerAttestation(key, borrower, creditLimit, creditScore, kycVerified, rpcUrl, contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: rpcUrl,
                privateKey: key,
            });
            //const fromAddress1 = tronWeb.defaultAddress.base58;
            //let CONTRACT_ADDRESS = process.env.ACCESS_CONTROL_CONTRACT_ADDRESS
            console.log('CONTRACT_ADDRESS ' + " " + contractAddress + " " + borrower);
            const me = tronWeb.defaultAddress.base58;
            console.log('from address ' + me);
            const amount = Number(creditLimit) * 1000000;
            // --- Load JSON Contract ---
            const contract = yield tronWeb.contract(abiArtifact.abi, contractAddress);
            // issue Credit score NFT
            const tx = yield contract.setAttestation(borrower, amount, creditScore, kycVerified).send({
                from: me,
                feeLimit: 3000000000 // 100 TRX energy fee limit
            });
            console.log("set credit limit:", tx);
            return { success: true, txId: tx, message: 'SUCCESS' };
        }
        catch (err) {
            console.log(err);
            return { success: false, txId: '', message: err.message };
        }
    });
}
function tronGetBorrowerAttestation(borrower, contractAddress, rpcUrl, key) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: rpcUrl,
                privateKey: key
            });
            //const fromAddress1 = tronWeb.defaultAddress.base58;
            //let CONTRACT_ADDRESS = process.env.VAULT_LENDING_CONTRACT_ADDRESS
            /*
            function getAttestation(address borrower) external view returns (uint256 creditLimit,
          uint256 creditScore, bool kycVerified, uint256 utilizedLimit, address attestor, uint256 updatedAt)
          */
            console.log('CONTRACT_ADDRESS ' + contractAddress);
            // --- Load Loan Vault ---
            const contract = yield tronWeb.contract(abiArtifact.abi, contractAddress);
            let result = yield contract.getAttestation(borrower).call();
            console.log('borrower details:: ' + result);
            const result2 = result.toString();
            console.log(result2);
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
//# sourceMappingURL=tron-attestation-oracle.js.map