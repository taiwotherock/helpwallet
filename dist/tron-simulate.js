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
exports.tronSimulateContract = tronSimulateContract;
const tronweb_1 = require("tronweb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function tronSimulateContract(key, amount, borrowerAddr, merchantAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: process.env.TRON_NODE_URL,
                privateKey: key,
            });
            const contractAddress = 'TPMQXFrkBJqS4s1xnsDRLsrAvuN6UanrJg';
            const callerAddress = 'TPBHCy5dD3NF2XBHGvhgFUiq5NND9Y3rBm';
            const tokenToBorrow = 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf';
            const requestedAmount = 2770000; // adjust amount
            const merchantAddr = 'TGRSiHj6fMGh6rutgD3cS8tRPDquzm2Vr7';
            // --- Encode parameters ---
            const parameters = [
                { type: 'address', value: tokenToBorrow },
                { type: 'uint256', value: requestedAmount },
                { type: 'address', value: merchantAddr }
            ];
            // --- Build and trigger the contract call ---
            const functionSelector = 'requestLoan(address,uint256,address)';
            /*const tx = await tronWeb.transactionBuilder.triggerSmartContract(
              contractAddress,
              functionSelector,
              {
                feeLimit: 100_000_000,  // 100 TRX energy limit
                callValue: 0
              },
              parameters,
              tronWeb.address.toHex(callerAddress)
            );
  
            console.log('Trigger:', tx);
            console.log('Trigger Result:', tx.result);
            console.log('Constant Result (hex):', tx.constant_result);
  
            // --- Decode any returned data ---
            if (tx.constant_result && tx.constant_result.length > 0) {
              const outputHex = tx.constant_result[0];
              console.log('Output (decoded):', tronWeb.toAscii(outputHex));
            } else {
              console.log('No return data — likely revert or no output');
            }*/
            return { success: true, txId: '', code: '', message: '' };
        }
        catch (err) {
            console.error("❌ Freeze Error:", err);
            return { success: false, error: err };
        }
    });
}
tronSimulateContract('', 277, '', '');
//# sourceMappingURL=tron-simulate.js.map