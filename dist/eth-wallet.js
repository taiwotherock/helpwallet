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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWalletWithPhraseEth = createWalletWithPhraseEth;
exports.ethGasBalanceByKey = ethGasBalanceByKey;
const ethers_1 = require("ethers");
const ethers_2 = require("ethers");
function createWalletWithPhraseEth(chain, symbol) {
    return __awaiter(this, void 0, void 0, function* () {
        const wallet = ethers_2.Wallet.createRandom(); //.fromPhrase(mnemonic);
        console.log("Mnemonic word :" + wallet.mnemonic.phrase);
        console.log("Mnemonic pwd:" + wallet.mnemonic.password);
        //const mnemonic = Mnemonic.fromPhrase(seedPhrase);
        const hdWalletNode = ethers_2.HDNodeWallet.fromMnemonic(wallet.mnemonic, "m/44'/60'/0'/0");
        const hdWallet = hdWalletNode.derivePath('0');
        const address = hdWallet.address;
        const privateKey = hdWallet.privateKey.toString();
        console.log("Address:" + address);
        console.log("privateKey:" + privateKey);
        var response = { success: true, address: address.toString(), privateKey: privateKey,
            chain: chain, phrase: wallet.mnemonic.phrase, symbol: symbol };
        return response;
    });
}
function ethGasBalanceByKey(key, rpcUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        // Generate unique reference
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers_1.ethers.Wallet(key, provider);
        const publicAddress = yield wallet.getAddress();
        console.log("Public address:", publicAddress);
        const balanceWei = yield provider.getBalance(publicAddress);
        console.log('balanceWei: ' + balanceWei.toString());
        const balanceEth = Number(ethers_1.ethers.formatEther(balanceWei.toString()));
        return { success: true, message: publicAddress, balance: balanceEth };
    });
}
//# sourceMappingURL=eth-wallet.js.map