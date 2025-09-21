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
exports.scanCurrentBlock = scanCurrentBlock;
const tronweb_1 = require("tronweb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const tronWeb = new tronweb_1.TronWeb({
    fullHost: process.env.TRON_NODE_URL,
    privateKey: process.env.PRIVATE_KEY_NILE,
});
function scanCurrentBlock(receiverAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // get latest block number
            const chainInfo = yield tronWeb.trx.getCurrentBlock(); // returns block object
            const latestNum = chainInfo.block_header.raw_data.number;
            console.log(chainInfo);
            console.log(latestNum);
            let lastProcessedBlock = 0;
            if (lastProcessedBlock === null) {
                lastProcessedBlock = latestNum - 100; // start from previous block
            }
            for (let n = lastProcessedBlock + 1; n <= latestNum; n++) {
                const block = yield tronWeb.trx.getBlock(n); // may be heavy — rate limit
                console.log('block ' + block);
                if (!block || !block.transactions)
                    continue;
                for (const tx of block.transactions) {
                    // TX raw data -> parse contracts
                    console.log('tx ');
                    console.log(tx);
                    const contracts = tx.raw_data.contract || [];
                    for (const c of contracts) {
                        console.log(c);
                        const type = c.type;
                        const param = c.parameter && c.parameter.value;
                        // Typical transfer contract values hold 'owner_address' or 'to_address'
                        if (param) {
                            const fromHex = param.owner_address;
                            const toHex = param.owner_address; // || null;
                            // compare addresses (hex) after converting your base58 to hex
                            const myHex = tronWeb.address.toHex(receiverAddress); // your address
                            if (fromHex === myHex || toHex === myHex) {
                                console.log(`Tx in block ${n} involves address:`, tx.txID);
                            }
                        }
                        // For TRC20 transfers, data is in triggerSmartContract data or event logs:
                        // decode input or call tronWeb.trx.getTransactionInfo(tx.txID) to inspect vmEvents
                    } //
                }
                lastProcessedBlock = n; // persist after successful processing
            }
        }
        catch (err) {
            console.error('scanBlocks error', err);
        }
    });
}
//# sourceMappingURL=tron-scan-block.js.map