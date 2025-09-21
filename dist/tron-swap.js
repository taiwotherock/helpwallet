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
exports.tronswap = tronswap;
const tronweb_1 = require("tronweb");
const fs = require('fs');
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const poolswapArtifact = JSON.parse(fs.readFileSync('./contracts-abi/tronswapv3.json', 'utf8'));
function tronswap(tokenA, tokenB, fromAddress, key) {
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
            let smartrouterAbi = [
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "_old3pool",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "_usdcPool",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "_v2Router",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "_v1Foctroy",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "_usdt",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "_usdj",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "_tusd",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "_usdc",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "_psmUsdd",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "_v3Router",
                            "type": "address"
                        }
                    ],
                    "stateMutability": "nonpayable",
                    "type": "constructor"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "owner",
                            "type": "address"
                        },
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "pool",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "internalType": "address[]",
                            "name": "tokens",
                            "type": "address[]"
                        }
                    ],
                    "name": "AddPool",
                    "type": "event",
                    "stateMutability": "nonpayable"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "admin",
                            "type": "address"
                        },
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "pool",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "internalType": "address[]",
                            "name": "tokens",
                            "type": "address[]"
                        }
                    ],
                    "name": "ChangePool",
                    "type": "event",
                    "stateMutability": "nonpayable"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "buyer",
                            "type": "address"
                        },
                        {
                            "indexed": true,
                            "internalType": "uint256",
                            "name": "amountIn",
                            "type": "uint256"
                        },
                        {
                            "indexed": false,
                            "internalType": "uint256[]",
                            "name": "amountsOut",
                            "type": "uint256[]"
                        }
                    ],
                    "name": "SwapExactETHForTokens",
                    "type": "event",
                    "stateMutability": "nonpayable"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "buyer",
                            "type": "address"
                        },
                        {
                            "indexed": true,
                            "internalType": "uint256",
                            "name": "amountIn",
                            "type": "uint256"
                        },
                        {
                            "indexed": false,
                            "internalType": "uint256[]",
                            "name": "amountsOut",
                            "type": "uint256[]"
                        }
                    ],
                    "name": "SwapExactTokensForTokens",
                    "type": "event",
                    "stateMutability": "nonpayable"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "originOwner",
                            "type": "address"
                        },
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "newOwner",
                            "type": "address"
                        }
                    ],
                    "name": "TransferAdminship",
                    "type": "event",
                    "stateMutability": "nonpayable"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "originOwner",
                            "type": "address"
                        },
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "newOwner",
                            "type": "address"
                        }
                    ],
                    "name": "TransferOwnership",
                    "type": "event",
                    "stateMutability": "nonpayable"
                },
                {
                    "stateMutability": "payable",
                    "type": "fallback",
                    "name": "fallback"
                },
                {
                    "inputs": [],
                    "name": "admin",
                    "outputs": [
                        {
                            "internalType": "address",
                            "name": "",
                            "type": "address"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "owner",
                    "outputs": [
                        {
                            "internalType": "address",
                            "name": "",
                            "type": "address"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "psmUsdd",
                    "outputs": [
                        {
                            "internalType": "address",
                            "name": "",
                            "type": "address"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "v1Factory",
                    "outputs": [
                        {
                            "internalType": "address",
                            "name": "",
                            "type": "address"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "v2Router",
                    "outputs": [
                        {
                            "internalType": "address",
                            "name": "",
                            "type": "address"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "v3Router",
                    "outputs": [
                        {
                            "internalType": "address",
                            "name": "",
                            "type": "address"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "stateMutability": "payable",
                    "type": "receive",
                    "name": "receive"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "newOwner",
                            "type": "address"
                        }
                    ],
                    "name": "transferOwnership",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "newAdmin",
                            "type": "address"
                        }
                    ],
                    "name": "transferAdminship",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "token",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "to",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "amount",
                            "type": "uint256"
                        }
                    ],
                    "name": "retrieve",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "string",
                            "name": "poolVersion",
                            "type": "string"
                        },
                        {
                            "internalType": "address",
                            "name": "pool",
                            "type": "address"
                        },
                        {
                            "internalType": "address[]",
                            "name": "tokens",
                            "type": "address[]"
                        }
                    ],
                    "name": "addPool",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "string",
                            "name": "poolVersion",
                            "type": "string"
                        },
                        {
                            "internalType": "address",
                            "name": "pool",
                            "type": "address"
                        },
                        {
                            "internalType": "address[]",
                            "name": "tokens",
                            "type": "address[]"
                        }
                    ],
                    "name": "addUsdcPool",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "string",
                            "name": "poolVersion",
                            "type": "string"
                        },
                        {
                            "internalType": "address",
                            "name": "pool",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "gemJoin",
                            "type": "address"
                        },
                        {
                            "internalType": "address[]",
                            "name": "tokens",
                            "type": "address[]"
                        }
                    ],
                    "name": "addPsmPool",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "string",
                            "name": "poolVersion",
                            "type": "string"
                        }
                    ],
                    "name": "isUsdcPool",
                    "outputs": [
                        {
                            "internalType": "bool",
                            "name": "",
                            "type": "bool"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "string",
                            "name": "poolVersion",
                            "type": "string"
                        }
                    ],
                    "name": "isPsmPool",
                    "outputs": [
                        {
                            "internalType": "bool",
                            "name": "",
                            "type": "bool"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "pool",
                            "type": "address"
                        },
                        {
                            "internalType": "address[]",
                            "name": "tokens",
                            "type": "address[]"
                        }
                    ],
                    "name": "changePool",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address[]",
                            "name": "path",
                            "type": "address[]"
                        },
                        {
                            "internalType": "string[]",
                            "name": "poolVersion",
                            "type": "string[]"
                        },
                        {
                            "internalType": "uint256[]",
                            "name": "versionLen",
                            "type": "uint256[]"
                        },
                        {
                            "internalType": "uint24[]",
                            "name": "fees",
                            "type": "uint24[]"
                        },
                        {
                            "components": [
                                {
                                    "internalType": "uint256",
                                    "name": "amountIn",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "amountOutMin",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "address",
                                    "name": "to",
                                    "type": "address"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "deadline",
                                    "type": "uint256"
                                }
                            ],
                            "internalType": "struct SmartExchangeRouter.SwapData",
                            "name": "data",
                            "type": "tuple"
                        }
                    ],
                    "name": "swapExactInput",
                    "outputs": [
                        {
                            "internalType": "uint256[]",
                            "name": "amountsOut",
                            "type": "uint256[]"
                        }
                    ],
                    "stateMutability": "payable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "amountMinimum",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address",
                            "name": "recipient",
                            "type": "address"
                        }
                    ],
                    "name": "unwrapWTRX",
                    "outputs": [],
                    "stateMutability": "payable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "amountMax",
                            "type": "uint256"
                        }
                    ],
                    "name": "warpWTRX",
                    "outputs": [],
                    "stateMutability": "payable",
                    "type": "function"
                }
            ];
            let abiusdt = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_upgradedAddress", "type": "address" }], "name": "deprecate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "deprecated", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_evilUser", "type": "address" }], "name": "addBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "upgradedAddress", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "maximumFee", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "_totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "unpause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_maker", "type": "address" }], "name": "getBlackListStatus", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "paused", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_subtractedValue", "type": "uint256" }], "name": "decreaseApproval", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "who", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "_value", "type": "uint256" }], "name": "calcFee", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "pause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "who", "type": "address" }], "name": "oldBalanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newBasisPoints", "type": "uint256" }, { "name": "newMaxFee", "type": "uint256" }], "name": "setParams", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "issue", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_addedValue", "type": "uint256" }], "name": "increaseApproval", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "redeem", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "basisPointsRate", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "isBlackListed", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_clearedUser", "type": "address" }], "name": "removeBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "MAX_UINT", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_blackListedUser", "type": "address" }], "name": "destroyBlackFunds", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "name": "_initialSupply", "type": "uint256" }, { "name": "_name", "type": "string" }, { "name": "_symbol", "type": "string" }, { "name": "_decimals", "type": "uint8" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_blackListedUser", "type": "address" }, { "indexed": false, "name": "_balance", "type": "uint256" }], "name": "DestroyedBlackFunds", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Issue", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Redeem", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "newAddress", "type": "address" }], "name": "Deprecate", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_user", "type": "address" }], "name": "AddedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_user", "type": "address" }], "name": "RemovedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "feeBasisPoints", "type": "uint256" }, { "indexed": false, "name": "maxFee", "type": "uint256" }], "name": "Params", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Pause", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Unpause", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "previousOwner", "type": "address" }, { "indexed": true, "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }];
            let usdtContract = 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf';
            const usdt = yield tronWeb.contract(abiusdt, usdtContract);
            yield usdt.approve('TFkswj6rUfK3cQtFGzungCkNXxD2UCpEVD', 2000000).send();
            const router = yield tronWeb.contract(smartrouterAbi, 'TFkswj6rUfK3cQtFGzungCkNXxD2UCpEVD');
            const trx = '0x0000000000000000000000000000000000000000';
            let result = yield router
                .swapExactInput([usdtContract, '0x0000000000000000000000000000000000000000'], // USDT -> TRX
            ['v1'], // use v1 pool for this swap
            [2], // direction forward
            [0, 0], // no tick arrays needed (not V3)
            [
                2000000, // amountIn = 2 USDT (6 decimals → 2,000,000 units)
                1, // minAmountOut to avoid slippage
                fromAddress, // recipient address for TRX
                Math.floor(Date.now() / 1000 + 86400) // deadline = now + 1 day
            ])
                .send({
                callValue: 0, // no TRX sent because we are swapping from USDT
                feeLimit: 10000 * 1e6 // max energy cost in Sun
            });
            console.log(result);
            const txResponse = yield tronWeb.trx.getTransactionInfo(result);
            console.log(txResponse);
            return { success: true, txId: result, msg: txResponse };
        }
        catch (err) {
            console.log(err);
            return { success: false, txId: '', msg: err };
        }
    });
}
//# sourceMappingURL=tron-swap.js.map