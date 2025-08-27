"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWeb = initWeb;
const tronweb_1 = require("tronweb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function initWeb() {
    const tronWeb = new tronweb_1.TronWeb({
        fullHost: process.env.TRON_NODE_URL,
        privateKey: process.env.PRIVATE_KEY_NILE,
    });
    return tronWeb;
}
//# sourceMappingURL=tron-init.js.map