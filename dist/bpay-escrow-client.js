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
exports.approveBuyer = approveBuyer;
const tronweb_1 = require("tronweb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function approveBuyer(address, contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const tronWeb = new tronweb_1.TronWeb({
            fullHost: process.env.TRON_NODE_API,
            privateKey: process.env.PRIVATE_KEY_NILE,
        });
        const contract = yield tronWeb.contract().at(contractAddress);
        // Example params for setVerified(address user, bool verified)
        const userToVerify = address; // "TQxW9gH7VbM8mUjAPBZRn1gNPLJAKdZC4n"; // sample user
        const verified = true;
        let receipt;
        try {
            const tx = yield contract
                .setVerified(userToVerify, verified)
                .send({
                feeLimit: 100000000,
            });
            console.log("✅ Transaction broadcasted:", tx);
            // Optionally fetch receipt
            receipt = yield tronWeb.trx.getTransactionInfo(tx);
            console.log("📋 Receipt:", receipt);
            return { success: true, message: receipt, txId: tx };
        }
        catch (err) {
            console.error("❌ Error calling setVerified:", err);
        }
        return { success: false, message: 'error', txId: '' };
    });
}
//# sourceMappingURL=bpay-escrow-client.js.map