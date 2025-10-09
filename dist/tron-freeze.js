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
exports.freezeTRX = freezeTRX;
exports.unfreezeTRX = unfreezeTRX;
exports.getTronResources = getTronResources;
const tronweb_1 = require("tronweb");
const dotenv_1 = __importDefault(require("dotenv"));
const tron_init_1 = require("./tron-init");
dotenv_1.default.config();
/*const tronWeb = new TronWeb(
  process.env.TRON_NODE_URL,
  process.env.TRON_NODE_URL,
  process.env.TRON_NODE_URL
 );*/
/*const tronWeb = new TronWeb({
 fullHost: process.env.TRON_NODE_URL,
 privateKey: process.env.PRIVATE_KEY_NILE,
});*/
function freezeTRX(key, amount, receiverAddress, resourceType) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: process.env.TRON_NODE_URL,
                privateKey: key,
            });
            var resource;
            if (resourceType == 'ENERGY')
                resource = 'ENERGY';
            else
                resource = 'BANDWIDTH';
            const tx = yield tronWeb.transactionBuilder.freezeBalanceV2(amount * 1000000, resource, receiverAddress);
            //|| tronWeb.defaultAddress.base58
            const signedTx = yield tronWeb.trx.sign(tx);
            const receipt = yield tronWeb.trx.sendRawTransaction(signedTx);
            console.log(`✅ ${resource} Freeze TX:`, receipt);
            var msg = '';
            if (!receipt.result) {
                msg = decodeHexMessage(receipt.message);
                console.log(`✅ ${resource} Message:`, msg);
            }
            return { success: true, txId: receipt.txid, code: receipt.code, message: msg };
        }
        catch (err) {
            console.error("❌ Freeze Error:", err);
            return { success: false, error: err };
        }
    });
}
function unfreezeTRX(key, resource, receiverAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: process.env.TRON_NODE_URL,
                privateKey: key,
            });
            const tx = yield tronWeb.transactionBuilder.unfreezeBalance(resource, receiverAddress);
            const signedTx = yield tronWeb.trx.sign(tx);
            const receipt = yield tronWeb.trx.sendRawTransaction(signedTx);
            console.log(`✅ Unfreeze ${resource} TX:`, receipt);
            return { success: true, txId: receipt };
        }
        catch (err) {
            console.error("❌ UnFreeze Error:", err);
            return { success: false, error: err };
        }
    });
}
function fetchBalance(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const tronWeb = (0, tron_init_1.initWeb)();
        const result = yield tronWeb.trx.getBalance(address);
        console.log("result: " + result);
        let balance = Number(result) / 1000000;
        console.log("bal final : " + balance);
        var response = { success: true, balance: balance, symbol: 'TRX' };
        return response;
    });
}
function getTronResources(key, address) {
    return __awaiter(this, void 0, void 0, function* () {
        // 1) TRX balance in SUN (1 TRX = 1e6 SUN)
        var _a, _b, _c, _d, _e, _f;
        const tronWeb = new tronweb_1.TronWeb({
            fullHost: process.env.TRON_NODE_URL,
            privateKey: key,
        });
        const balanceSun = yield tronWeb.trx.getBalance(address);
        const trxBalance = (balanceSun / 1e6).toFixed(6); // Convert SUN → TRX
        // 2) Account resources: energy + bandwidth
        const resources = yield tronWeb.trx.getAccountResources(address);
        return {
            trxBalance,
            energyUsed: (_a = resources.EnergyUsed) !== null && _a !== void 0 ? _a : 0,
            energyLimit: (_b = resources.EnergyLimit) !== null && _b !== void 0 ? _b : 0,
            freeBandwidthUsed: (_c = resources.freeNetUsed) !== null && _c !== void 0 ? _c : 0,
            freeBandwidthLimit: (_d = resources.freeNetLimit) !== null && _d !== void 0 ? _d : 0,
            bandwidthUsed: (_e = resources.NetUsed) !== null && _e !== void 0 ? _e : 0,
            bandwidthLimit: (_f = resources.NetLimit) !== null && _f !== void 0 ? _f : 0
        };
    });
}
function decodeHexMessage(hex) {
    // Remove 0x if it exists
    if (hex.startsWith("0x")) {
        hex = hex.slice(2);
    }
    // Convert hex to readable text
    let decoded = "";
    for (let i = 0; i < hex.length; i += 2) {
        decoded += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return decoded;
}
//freezeTRX(1000,'TLQZunpWvD8EQKEEwLQuPF1cteKknHvXGi','ENERGY','TLQZunpWvD8EQKEEwLQuPF1cteKknHvXGi');
//# sourceMappingURL=tron-freeze.js.map