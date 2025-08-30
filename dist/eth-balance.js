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
exports.fetchBalanceEth = fetchBalanceEth;
const ethers_1 = require("ethers");
function fetchBalanceEth(walletAddress, rpcUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        // Set the Ethereum address you want to check the balance of
        //const address = walletAddress; // '0x98435DDA1EAAeD248975e87B8ab743866C840205';
        // Set the timestamp you want to check the balance at (in Unix time)
        const timestamp = Math.floor(Date.now() / 1000);
        // Set the contract address and ABI of the ERC-20 token you want to check the balance of
        //const tokenAddress = '0x4D6DEEE55785f033d00005Ade08D035B1537A5d9';
        const tokenAbi = ['function balanceOf(address) view returns (uint256)'];
        // Create an Ethereum provider using Infura
        //const provider = ethers.JsonRpcProvider.bind .JsonRpcProvider(infuraUrl);
        // Get the ETH balance of the address at the specified timestamp
        //const ethBalancePromise = provider.getBalance(address, timestamp);
        // Get the balance of the ERC-20 token at the specified timestamp
        //const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);
        //const tokenBalancePromise = tokenContract.balanceOf(address, timestamp);
        const bal = yield getBalanceEth(walletAddress, rpcUrl);
        var response = { success: true, balance: bal }; //{success:true,address: address.toString(), privateKey: privateKey, chain: 'ETH', phrase:wallet.mnemonic.phrase };
        return response;
    });
}
function getBalanceEth(address, rpcUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Validate the address format
            if (!ethers_1.ethers.isAddress(address)) {
                throw new Error('Invalid Ethereum address format');
            }
            //Promise<string>
            // Get balance in wei
            const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
            const network = yield provider.getNetwork();
            const blockNumber = yield provider.getBlockNumber();
            console.log('network: ' + network.chainId);
            console.log('network: ' + network.name);
            console.log('blockNumber: ' + blockNumber);
            const balanceWei = yield provider.getBalance(address);
            console.log('balanceWei: ' + balanceWei);
            // Convert wei to ether
            const balanceEth = ethers_1.ethers.formatEther(balanceWei);
            console.log('balanceEth: ' + balanceEth);
            return balanceEth;
        }
        catch (error) {
            throw new Error(`Failed to fetch balance: ${error}`);
        }
    });
}
//# sourceMappingURL=eth-balance.js.map