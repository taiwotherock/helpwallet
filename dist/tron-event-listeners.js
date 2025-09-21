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
exports.listenDeposited = listenDeposited;
const tronweb_1 = require("tronweb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const tronWeb = new tronweb_1.TronWeb({
    fullHost: process.env.TRON_NODE_URL,
    privateKey: process.env.PRIVATE_KEY_NILE,
});
function listenDeposited(userAddress, symbol, timeAllow) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        // Load contract
        let LIQUIDITY_POOL_ADDRESS = process.env.LIQUIDITY_POOL_CONTRACT_ADDRESS;
        //const contract = await tronWeb.contract().at(LIQUIDITY_POOL_ADDRESS);
        //setInterval(async () => {
        const events = yield tronWeb.event.getEventsByContractAddress(LIQUIDITY_POOL_ADDRESS, {
            eventName: 'Deposited'
        });
        //console.log(events);
        let i = 0;
        let count = (_a = events.data) === null || _a === void 0 ? void 0 : _a.length;
        //if(count > 20)
        // count = 20;
        console.log('count: ' + count);
        for (i = 0; i < ((_b = events.data) === null || _b === void 0 ? void 0 : _b.length); i++) {
            var caller_contract_address = events.data[i].caller_contract_address;
            var txId = events.data[i].transaction_id;
            console.log('block no ' + events.data[i].block_number);
            console.log('user & tx ' + caller_contract_address + " " + txId + ' ' + userAddress);
            //if(userAddress === caller_contract_address )
            {
                let diffInMin = timeDiff(events.data[i].block_timestamp);
                if (diffInMin <= timeAllow) {
                    const txResponse = yield tronWeb.trx.getTransactionInfo(txId);
                    console.log(txResponse);
                    const fromAddress = hexToAddress(txResponse.log[0].topics[1]);
                    console.log("fromAddress:", fromAddress + " " + userAddress);
                    if (fromAddress == userAddress) {
                        // Extract amount
                        const amountRaw = hexToNumber(txResponse.log[0].data); // raw amount in smallest unit (USDT = 6 decimals)
                        const amountUSDT = amountRaw / 1e6;
                        console.log("Amount USDT:", amountUSDT);
                        const userAddress2 = hexToAddress(txResponse.log[1].address);
                        console.log("User Address:", userAddress2);
                        return { success: true, chain: 'TRON',
                            txId: txId, fee: txResponse.fee / 1e6,
                            toAddress: hexToAddress(txResponse.log[0].topics[2]),
                            fromAddress: hexToAddress(txResponse.log[0].topics[1]),
                            blockRefNo: txResponse.blockNumber,
                            symbol: symbol,
                            amount: amountUSDT, blockNumber: txResponse.blockNumber,
                            blockTimestamp: txResponse.blockTimeStamp,
                            contractAddress: caller_contract_address, crDr: '',
                            status: txResponse.receipt.result };
                    }
                }
            }
        }
        return { success: false, data: null };
        //}, 3000);
    });
}
function hexToAddress(hex) {
    if (hex.startsWith("41"))
        return tronWeb.address.fromHex(hex);
    return tronWeb.address.fromHex("41" + hex.slice(-40));
}
function hexToNumber(hex) {
    return parseInt(hex, 16);
}
function timeDiff(blockTimestampMs) {
    //const blockTimestampMs = 1758392544000;
    // Convert to Date object
    const blockDate = new Date(blockTimestampMs);
    console.log("Block Date:", blockDate.toLocaleString());
    // Current time
    const now = new Date();
    // Difference in seconds
    const diffInMin = Math.floor((now.getTime() - blockDate.getTime()) / (1000 * 60));
    console.log("Minutes since block:", diffInMin);
    return diffInMin;
}
//# sourceMappingURL=tron-event-listeners.js.map