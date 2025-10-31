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
exports.tranStatus = tranStatus;
const tronweb_1 = require("tronweb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function tranStatus(txId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: process.env.TRON_NODE_URL
            });
            console.log('fetch txId ' + txId);
            const txResponse = yield tronWeb.trx.getTransactionInfo(txId);
            console.log('response tx status ');
            console.log(txResponse);
            console.log(Object.keys(txResponse).length);
            let status = false;
            const rex = txResponse.receipt.result;
            if (Object.keys(txResponse).length === 0) {
                const msg = decodeRevertReason(txResponse.contractResult[0]);
                status = false;
                return { success: status, chain: 'TRON',
                    txId: txId, fee: 0,
                    toAddress: '',
                    fromAddress: '',
                    blockRefNo: '',
                    symbol: '',
                    amount: 0, blockNumber: txResponse.blockNumber,
                    blockTimestamp: 0,
                    contractAddress: txResponse.contract_address, crDr: '',
                    status: msg };
            }
            else {
                if (rex == 'SUCCESS')
                    status = true;
                return { success: status, chain: 'TRON',
                    txId: txId, fee: txResponse.fee / 1e6,
                    toAddress: '',
                    fromAddress: txResponse.contract_address,
                    blockRefNo: txResponse.blockNumber,
                    symbol: '',
                    amount: 0, blockNumber: txResponse.blockNumber,
                    blockTimestamp: txResponse.blockTimeStamp,
                    contractAddress: '', crDr: '',
                    status: txResponse.receipt.result };
            }
        }
        catch (err) {
            return { success: false, status: 'FAILED ' + err.message };
        }
    });
}
function decodeRevertReason(hexData) {
    if (!hexData || !hexData.startsWith('08c379a0')) {
        return null; // not a standard revert signature
    }
    try {
        // Remove the function selector (first 4 bytes = 8 hex chars)
        const data = hexData.slice(8);
        // Get the string offset (ignore for this case)
        const strOffset = parseInt(data.slice(0, 64), 16);
        // Get the string length (in bytes)
        const strLength = parseInt(data.slice(64, 128), 16);
        // Extract the string data (next strLength bytes = strLength * 2 hex chars)
        const strData = data.slice(128, 128 + strLength * 2);
        // Convert hex to UTF-8 string
        const revertReason = Buffer.from(strData, 'hex').toString('utf8');
        return revertReason;
    }
    catch (err) {
        console.error('Failed to decode revert reason:', err);
        return null;
    }
}
//# sourceMappingURL=tron-tx-status.js.map