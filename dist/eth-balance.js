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
exports.fetchTokenBalance = fetchTokenBalance;
exports.fetchBalanceEth = fetchBalanceEth;
exports.fetchTransactionDetailEth = fetchTransactionDetailEth;
exports.extractAmount = extractAmount;
exports.decodeUSDCAmountFromInput = decodeUSDCAmountFromInput;
const ethers_1 = require("ethers");
function fetchTokenBalance(tokenAddress, walletAddress, rpcUrl, decimalNo) {
    return __awaiter(this, void 0, void 0, function* () {
        // Set the Ethereum address you want to check the balance of
        //const address = walletAddress; // '0x98435DDA1EAAeD248975e87B8ab743866C840205';
        // Set the timestamp you want to check the balance at (in Unix time)
        const timestamp = Math.floor(Date.now() / 1000);
        // Set the contract address and ABI of the ERC-20 token you want to check the balance of
        //const tokenAddress = '0x4D6DEEE55785f033d00005Ade08D035B1537A5d9';
        const tokenAbi = ['function balanceOf(address) view returns (uint256)'];
        // Create an Ethereum provider using Infura
        //const provider = ethers.JsonRpcProvider.bind.JsonRpcProvider(rpcUrl);
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl); //.JsonRpcProvider(
        // Get the ETH balance of the address at the specified timestamp
        //const ethBalancePromise = provider.getBalance(address, timestamp);
        // Get the balance of the ERC-20 token at the specified timestamp
        const tokenContract = new ethers_1.ethers.Contract(tokenAddress, tokenAbi, provider);
        const tokenBalancePromise = yield tokenContract.balanceOf(walletAddress);
        console.log("Balance:", ethers_1.ethers.formatUnits(tokenBalancePromise, 6));
        console.log("Balance 3:", ethers_1.ethers.formatUnits(tokenBalancePromise, 6));
        console.log(tokenBalancePromise);
        //const bal = await getBalanceEth(walletAddress,rpcUrl);
        var response = { success: true, balance: ethers_1.ethers.formatUnits(tokenBalancePromise, 6) }; //{success:true,address: address.toString(), privateKey: privateKey, chain: 'ETH', phrase:wallet.mnemonic.phrase };
        return response;
    });
}
function fetchBalanceEth(address, rpcUrl) {
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
function fetchTransactionDetailEth(txId, symbol, chain, rpcUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('txId: ' + txId);
            const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
            const txReceipt = yield provider.send("eth_getTransactionByHash", [
                txId,
            ]);
            console.log(txReceipt);
            //const gasDecimal = parseInt(gasHex, 16);
            console.log('gas fee ' + BigInt(txReceipt.gasPrice).toString());
            console.log('input amt ' + txReceipt.input);
            const amt = decodeUSDCAmountFromInput(txReceipt.input).toString();
            console.log('amt ' + amt);
            return { success: true, chain: chain,
                txId: txId, fee: BigInt(txReceipt.gasPrice).toString(),
                toAddress: txReceipt.to,
                fromAddress: txReceipt.from,
                blockRefNo: txReceipt.blockHash,
                symbol: symbol,
                amount: amt, blockNumber: txReceipt.blockNumber,
                blockTimestamp: '',
                contractAddress: '', crDr: '', status: 'SUCCESS'
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch transaction : ${error}`);
        }
    });
}
/**
 * Decodes the USDC amount from an ERC-20 transfer transaction input field.
 * @param input The transaction input data (hex string)
 * @param decimals Number of decimals for the token (USDC = 6)
 * @returns The amount in normal units (e.g., 10.5 USDC)
 */
function extractAmount(input, decimals = 6) {
    if (!input || input.length < 138) {
        throw new Error("Invalid input data");
    }
    // Amount is in the last 32 bytes
    const amountHex = "0x" + input.slice(74);
    // Convert hex to BigInt safely
    const amountRaw = BigInt(amountHex);
    // Create divisor = 10^decimals without exponentiation
    let divisor = BigInt(1);
    for (let i = 0; i < decimals; i++) {
        divisor *= BigInt(10);
    }
    // Split into integer and fractional parts
    const integerPart = amountRaw / divisor;
    const fractionalPart = amountRaw % divisor;
    // Convert to number with proper decimal scaling
    return Number(integerPart) + Number(fractionalPart) / Number(divisor);
}
function decodeUSDCAmountFromInput(input) {
    const TRANSFER_SIG = "a9059cbb"; // ERC-20 transfer(address,uint256)
    // Find where the transfer call starts
    const idx = input.indexOf(TRANSFER_SIG);
    if (idx === -1)
        return null; // No transfer found
    // Start right after "a9059cbb"
    const dataStart = idx + TRANSFER_SIG.length;
    // Extract recipient (ignore for amount)
    const recipient = "0x" + input.slice(dataStart, dataStart + 64).slice(24); // last 40 chars = address
    // Extract amount (next 32 bytes = 64 hex chars)
    const amountStart = dataStart + 64;
    const amountHex = "0x" + input.slice(amountStart, amountStart + 64);
    // Convert raw amount → USDC (6 decimals)
    const raw = BigInt(amountHex);
    const human = ethers_1.ethers.formatUnits(raw, 6); // USDC uses 6 decimals
    console.log("Recipient:", recipient);
    console.log("Raw Amount:", raw.toString());
    console.log("USDC Amount:", human);
    return human;
}
//# sourceMappingURL=eth-balance.js.map