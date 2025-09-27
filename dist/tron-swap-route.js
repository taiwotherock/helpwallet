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
exports.tronswapv2 = tronswapv2;
exports.tronswaptrx = tronswaptrx;
const tronweb_1 = require("tronweb");
const fs = require('fs');
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const v3RouterAbi = [{
        name: 'swapExactInput',
        type: 'function',
        stateMutability: 'payable',
        inputs: [
            { internalType: 'address[]', name: 'path', type: 'address[]' },
            { internalType: 'string[]', name: 'poolVersion', type: 'string[]' },
            { internalType: 'uint256[]', name: 'versionLen', type: 'uint256[]' },
            { internalType: 'uint24[]', name: 'fees', type: 'uint24[]' },
            {
                internalType: 'struct SwapData',
                name: 'data',
                type: 'tuple',
                components: [
                    { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
                    { internalType: 'address', name: 'to', type: 'address' },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' }
                ]
            }
        ],
        outputs: [
            { internalType: 'uint256[]', name: 'amountsOut', type: 'uint256[]' }
        ]
    }];
const v3RouterAbiTrx = [
    {
        name: 'swapExactInput',
        type: 'function',
        stateMutability: 'payable',
        inputs: [
            { internalType: 'address[]', name: 'path', type: 'address[]' },
            { internalType: 'string[]', name: 'poolVersion', type: 'string[]' },
            { internalType: 'uint256[]', name: 'versionLen', type: 'uint256[]' },
            { internalType: 'uint24[]', name: 'fees', type: 'uint24[]' },
            {
                internalType: 'struct SwapData',
                name: 'data',
                type: 'tuple',
                components: [
                    { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
                    { internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
                    { internalType: 'address', name: 'to', type: 'address' },
                    { internalType: 'uint256', name: 'deadline', type: 'uint256' }
                ]
            }
        ],
        outputs: [{ internalType: 'uint256[]', name: 'amountsOut', type: 'uint256[]' }]
    },
    // Optional helpers some routers expose:
    { name: 'WTRX', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
    { name: 'WETH', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] }
];
// Minimal WTRX ABI (to check balance & unwrap to TRX)
const wtrxAbi = [
    { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ type: 'uint256' }] },
    { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
    { name: 'withdraw', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'wad', type: 'uint256' }], outputs: [] },
    { name: 'deposit', type: 'function', stateMutability: 'payable', inputs: [], outputs: [] }
];
function tronswapv2(tokenA, tokenB, fromAddress, key) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: process.env.TRON_NODE_URL,
                privateKey: process.env.PRIVATE_KEY_NILE,
            });
            /*const poolabi = [{"entrys":[{"stateMutability":"Nonpayable","type":"Constructor"},{"inputs":[{"indexed":true,"name":"fee","type":"uint24"},{"indexed":true,"name":"tickSpacing","type":"int24"}],"name":"FeeAmountEnabled","type":"Event"},{"inputs":[{"indexed":true,"name":"oldOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnerChanged","type":"Event"},{"inputs":[{"indexed":true,"name":"token0","type":"address"},{"indexed":true,"name":"token1","type":"address"},{"indexed":true,"name":"fee","type":"uint24"},{"name":"tickSpacing","type":"int24"},{"name":"pool","type":"address"},{"name":"poolLength","type":"uint256"}],"name":"PoolCreated","type":"Event"},{"outputs":[{"type":"address"}],"inputs":[{"type":"uint256"}],"name":"allPools","stateMutability":"View","type":"Function"},{"outputs":[{"type":"uint256"}],"name":"allPoolsLength","stateMutability":"View","type":"Function"},{"outputs":[{"name":"pool","type":"address"}],"inputs":[{"name":"tokenA","type":"address"},{"name":"tokenB","type":"address"},{"name":"fee","type":"uint24"}],"name":"createPool","stateMutability":"Nonpayable","type":"Function"},{"inputs":[{"name":"fee","type":"uint24"},{"name":"tickSpacing","type":"int24"}],"name":"enableFeeAmount","stateMutability":"Nonpayable","type":"Function"},{"outputs":[{"type":"int24"}],"inputs":[{"type":"uint24"}],"name":"feeAmountTickSpacing","stateMutability":"View","type":"Function"},{"outputs":[{"type":"bytes32"}],"name":"getPairHash","stateMutability":"Pure","type":"Function"},{"outputs":[{"type":"address"}],"inputs":[{"type":"address"},{"type":"address"},{"type":"uint24"}],"name":"getPool","stateMutability":"View","type":"Function"},{"outputs":[{"type":"address"}],"name":"owner","stateMutability":"View","type":"Function"},{"outputs":[{"name":"factory","type":"address"},{"name":"token0","type":"address"},{"name":"token1","type":"address"},{"name":"fee","type":"uint24"},{"name":"tickSpacing","type":"int24"}],"name":"parameters","stateMutability":"View","type":"Function"},{"inputs":[{"name":"_owner","type":"address"}],"name":"setOwner","stateMutability":"Nonpayable","type":"Function"}]}]
            const factory_v3 = await tronWeb.contract(poolswapArtifact, "TLJWAScHZ4Qmk1axyKMzrnoYuu2pSLer1F")
            const pooladderss_ = await factory_v3.getPool("TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf", "TYsb")
            console.log(tronWeb.address.fromHex(pooladderss_))
          
            return {success: false, data: pooladderss_};*/
            let abiusdt = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_upgradedAddress", "type": "address" }], "name": "deprecate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "deprecated", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_evilUser", "type": "address" }], "name": "addBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "upgradedAddress", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "maximumFee", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "_totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "unpause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_maker", "type": "address" }], "name": "getBlackListStatus", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "paused", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_subtractedValue", "type": "uint256" }], "name": "decreaseApproval", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "who", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "_value", "type": "uint256" }], "name": "calcFee", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "pause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "who", "type": "address" }], "name": "oldBalanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newBasisPoints", "type": "uint256" }, { "name": "newMaxFee", "type": "uint256" }], "name": "setParams", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "issue", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_addedValue", "type": "uint256" }], "name": "increaseApproval", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "redeem", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "basisPointsRate", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "isBlackListed", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_clearedUser", "type": "address" }], "name": "removeBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "MAX_UINT", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_blackListedUser", "type": "address" }], "name": "destroyBlackFunds", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "name": "_initialSupply", "type": "uint256" }, { "name": "_name", "type": "string" }, { "name": "_symbol", "type": "string" }, { "name": "_decimals", "type": "uint8" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_blackListedUser", "type": "address" }, { "indexed": false, "name": "_balance", "type": "uint256" }], "name": "DestroyedBlackFunds", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Issue", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Redeem", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "newAddress", "type": "address" }], "name": "Deprecate", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_user", "type": "address" }], "name": "AddedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_user", "type": "address" }], "name": "RemovedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "feeBasisPoints", "type": "uint256" }, { "indexed": false, "name": "maxFee", "type": "uint256" }], "name": "Params", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Pause", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Unpause", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "previousOwner", "type": "address" }, { "indexed": true, "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }];
            let usdtContract = 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf';
            //const usdt = await tronWeb.contract(abiusdt, usdtContract);
            //await usdt.approve('TFkswj6rUfK3cQtFGzungCkNXxD2UCpEVD', 2_000000).send();
            const routerAddr = 'TDAQGC5Ekd683GjekSaLzCaeg7jGsGSmbh';
            const usdtAddr = 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf';
            const usdjAddr = 'TLBaRhANQoJFTqre9Nf1mjuwNWjCJeYqUL';
            const trxAddr = '0x0000000000000000000000000000000000000000';
            const me = tronWeb.defaultAddress.base58;
            console.log('from address ' + me);
            const amountIn = (2 * Math.pow(10, 6)).toString();
            const amountOutMin = '1';
            const deadline = Math.floor(Date.now() / 1000) + 300;
            console.log('Approving router to spend 100 USDT…' + Date.now());
            yield (yield tronWeb.contract().at(usdtAddr))
                .approve(routerAddr, amountIn)
                .send({ feeLimit: 1e8, callValue: 0, shouldPollResponse: true });
            console.log('✅ Approval confirmed.' + +Date.now());
            const router = yield tronWeb.contract(v3RouterAbi, routerAddr);
            const path = [usdtAddr, trxAddr];
            const poolVersion = ['v2'];
            const versionLen = [2];
            const fees = [0, 0];
            const data = [amountIn, amountOutMin, me, deadline];
            console.log('Swapping USDT → USDJ…' + Date.now());
            const result = yield router
                .swapExactInput(path, poolVersion, versionLen, fees, data)
                .send({ feeLimit: 1e8, callValue: 0, shouldPollResponse: true });
            console.log('✅ Swap complete, amountsOut:', result);
            /*console.log('Fetching USDJ balance…' + Date.now());
            const usdj = await tronWeb.contract().at(usdjAddr);
            const balSun = await usdj.balanceOf(me).call();
            const decs   = await usdj.decimals().call();
            console.log(
              `🎉 You now have ${Number(balSun) / 10**Number(decs)} USDJ`
            );*/
            const resultt = yield tronWeb.trx.getBalance(me);
            console.log("result: " + resultt);
            let balance = Number(resultt) / 1000000;
            console.log("trx balance: " + resultt);
            return { success: true, txId: result, msg: result };
        }
        catch (err) {
            console.log(err);
            return { success: false, txId: '', msg: err };
        }
    });
}
function tronswaptrx(tokenA, tokenB, fromAddress, key) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tronWeb = new tronweb_1.TronWeb({
                fullHost: process.env.TRON_NODE_URL,
                privateKey: process.env.PRIVATE_KEY_NILE,
            });
            // --- Addresses (Nile) ---
            const routerAddr = 'TDAQGC5Ekd683GjekSaLzCaeg7jGsGSmbh'; // your router
            const usdtAddr = 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf'; // USDT (Nile)
            // WTRX will be auto-detected from router if possible; otherwise use env var
            let wtrxAddr = 'TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a'; // process.env.WTRX_ADDR || '';
            const me = tronWeb.defaultAddress.base58;
            // --- Amounts ---
            const amountIn = (50 * Math.pow(10, 6)).toString(); // 100 USDT with 6 decimals
            const amountOutMin = '100'; // slippage protection - adjust as needed
            const deadline = Math.floor(Date.now() / 1000) + 300;
            // Helper to convert hex address to base58 if needed
            const toB58 = (a) => {
                try {
                    return tronWeb.address.fromHex(a);
                }
                catch (_a) {
                    return a;
                }
            };
            // Prepare router contract
            const router = yield tronWeb.contract(v3RouterAbi, routerAddr);
            // --- Detect WTRX address if not supplied ---
            if (!wtrxAddr) {
                try {
                    const res = yield router.WTRX().call();
                    wtrxAddr = toB58(res);
                }
                catch (_) { }
            }
            if (!wtrxAddr) {
                try {
                    const res = yield router.WETH().call(); // some routers keep Ethereum naming
                    wtrxAddr = toB58(res);
                }
                catch (_) { }
            }
            if (!wtrxAddr) {
                throw new Error('Cannot determine WTRX address. Set WTRX_ADDR in your .env for Nile.');
            }
            // --- 1) Approve router to spend USDT ---
            console.log('Approving router to spend 100 USDT…');
            yield (yield tronWeb.contract().at(usdtAddr))
                .approve(routerAddr, amountIn)
                .send({ feeLimit: 1e8, callValue: 0, shouldPollResponse: true });
            console.log('✅ Approval confirmed.');
            // --- (Optional) Check TRX balance before for comparison ---
            const trxBefore = yield tronWeb.trx.getBalance(me);
            // --- 2) Swap USDT -> WTRX ---
            // NOTE: poolVersion/versionLen/fees are kept identical to your working USDJ swap.
            const path = [usdtAddr, wtrxAddr];
            const poolVersion = ['v2'];
            const versionLen = [2];
            const fees = [0, 0];
            const data = [amountIn, amountOutMin, me, deadline];
            console.log('Swapping USDT → WTRX…');
            const swapRes = yield router
                .swapExactInput(path, poolVersion, versionLen, fees, data)
                .send({ feeLimit: 1e8, callValue: 0, shouldPollResponse: true });
            console.log('✅ Swap tx sent. Router response:', swapRes);
            // --- 3) Unwrap WTRX -> TRX ---
            console.log('Unwrapping WTRX → TRX…');
            const wtrx = yield tronWeb.contract(wtrxAbi, wtrxAddr);
            const wtrxBalSun = yield wtrx.balanceOf(me).call(); // returns string/bn
            // If you only want to unwrap what you just received, you could use swapRes amount.
            yield wtrx.withdraw(wtrxBalSun).send({ feeLimit: 1e8, callValue: 0, shouldPollResponse: true });
            console.log('✅ Unwrap complete.');
            // --- 4) Show resulting TRX balance ---
            const trxAfter = yield tronWeb.trx.getBalance(me);
            const delta = (Number(trxAfter) - Number(trxBefore)) / 1e6;
            console.log(`🎉 TRX balance increased by approximately ${delta} TRX (after fees).`);
            return { success: true, txId: swapRes, msg: swapRes };
        }
        catch (err) {
            console.log(err);
            return { success: false, txId: '', msg: err };
        }
    });
}
function checkPoolExists(routerContract_1, token0_1, token1_1) {
    return __awaiter(this, arguments, void 0, function* (routerContract, token0, token1, fee = 0) {
        try {
            // For V2 pools (no fee parameter)
            if (fee === 0) {
                const pairAddress = yield routerContract.getPair(token0, token1).call();
                return pairAddress && pairAddress !== '0x0000000000000000000000000000000000000000';
            }
            else {
                // For V3 pools (with fee parameter) 
                const poolAddress = yield routerContract.getPool(token0, token1, fee).call();
                return poolAddress && poolAddress !== '0x0000000000000000000000000000000000000000';
            }
        }
        catch (error) {
            console.log(`Pool check failed for ${token0}/${token1} with fee ${fee}:`, error.message);
            return false;
        }
    });
}
//# sourceMappingURL=tron-swap-route.js.map