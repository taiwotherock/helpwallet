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
exports.ethSetVaultAdmin = ethSetVaultAdmin;
exports.ethOdDepositCollateral = ethOdDepositCollateral;
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// ====== ABI (minimal) ======
const ABI = [
    "function setVaultAdmin(address _newAdmin) external",
    "function toggleCreditOfficer(address _o, bool _enable) external",
    "function depositCollateral( uint256 amount) external",
    "function setConfigValues(uint256 rate ) external",
];
// Minimal ERC20 ABI
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) external",
    "function decimals() view returns (uint8)"
];
// ====== Provider & Wallet ======
//const wallet = new ethers.Wallet(PRIVATE_KEY!, provider);
//const contract = new ethers.Contract(CONTRACT_ADDRESS!, ABI, wallet);
// ====== Constants ======
const DECIMALS = ethers_1.ethers.parseUnits("1", 18); // For scaling rates
// ====== Main: Deposit into vault ======
function ethSetVaultAdmin(key, address, rpcUrl, contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        // Generate unique reference
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers_1.ethers.Wallet(key, provider);
        const contract = new ethers_1.ethers.Contract(contractAddress, ABI, wallet);
        const publicAddress = yield wallet.getAddress();
        console.log("Public address:", publicAddress);
        console.log('contract address: ' + contractAddress);
        // Send transaction
        //function depositToVault(address token, uint256 amount) external
        console.log('processing...' + address);
        const tx = yield contract.setVaultAdmin(address); /*, {
          maxFeePerGas: ethers.parseUnits('40', 'gwei'),          // increase from your last
          maxPriorityFeePerGas: ethers.parseUnits('3', 'gwei'),
        });*/
        console.log(`🚀 Transaction sent: ${tx.hash}`);
        const receipt = yield tx.wait();
        console.log(`✅ Mined in block ${receipt.blockNumber}`);
        return { success: true, message: 'SUCCESS', txId: tx.hash };
    });
}
// ====== Main: Deposit into vault ======
function ethOdDepositCollateral(key, amount, rpcUrl, contractAddress, tokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        // Generate unique reference
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers_1.ethers.Wallet(key, provider);
        const contract = new ethers_1.ethers.Contract(contractAddress, ABI, wallet);
        const publicAddress = yield wallet.getAddress();
        console.log('amount in ' + amount);
        console.log("Public address:", publicAddress);
        const usdtAddress = ethers_1.ethers.getAddress(tokenAddress); //USDT
        const usdtContract = new ethers_1.ethers.Contract(usdtAddress, ERC20_ABI, wallet);
        const decimalNo = yield usdtContract.decimals();
        console.log('decimalNo ' + decimalNo);
        const amountInt = ethers_1.ethers.parseUnits(amount, decimalNo); // scaled to 1e18
        console.log('usdt amt ' + amountInt);
        const userBalance = yield usdtContract.balanceOf(publicAddress);
        console.log("USDT user balance " + userBalance);
        const userBalInt = Number(ethers_1.ethers.formatUnits(userBalance.toString(), decimalNo));
        console.log("USDT user balance " + userBalInt);
        if (userBalInt <= Number(amount)) {
            return { success: false, message: 'Insufficient Balance', txId: '' };
        }
        // const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        /*const [allowance, decimals2] = await Promise.all([
          usdtContract.allowance(publicAddress, contractAddress),
          usdtContract.decimals()
        ]);
    
        console.log("decimals allowance " + allowance + " " + decimals2);*/
        const approveTx = yield usdtContract.approve(contractAddress, amountInt); /*, {
          maxFeePerGas: ethers.parseUnits('100', 'gwei'),          // increase from your last
          maxPriorityFeePerGas: ethers.parseUnits('30', 'gwei'),
        });*/
        const tx3 = yield approveTx.wait();
        console.log(tx3);
        console.log("USDT approved to spend USDT ");
        console.log('contract address: ' + contractAddress);
        // Send transaction
        //function depositToVault(address token, uint256 amount) external
        console.log('processing...' + amountInt);
        const tx = yield contract.depositCollateral(amountInt); /*, {
          maxFeePerGas: ethers.parseUnits('40', 'gwei'),          // increase from your last
          maxPriorityFeePerGas: ethers.parseUnits('3', 'gwei'),
        });*/
        console.log(`🚀 Transaction sent: ${tx.hash}`);
        const receipt = yield tx.wait();
        console.log(`✅ Mined in block ${receipt.blockNumber}`);
        const userBalance2 = yield usdtContract.balanceOf(publicAddress);
        console.log("USDT user balance 2 " + userBalance2);
        console.log("USDT user balance 2 " + ethers_1.ethers.parseUnits(userBalance2.toString(), 18));
        console.log("USDT user balance 1 " + userBalance);
        if (userBalance2 < userBalance) {
            console.log('user balance reduce');
        }
        const txDetail = yield provider.getTransaction(tx.hash);
        console.log("Raw tx data:", txDetail.data);
        console.log(`\n🎉 deposit into vault success created! Ref: `);
        const tokenContract = new ethers_1.ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const balance = yield tokenContract.balanceOf(contractAddress);
        const decimals = yield tokenContract.decimals();
        console.log('bal ' + balance + ' ' + decimals);
        const bal = ethers_1.ethers.formatUnits(balance, decimals);
        console.log(`Vault Token Balance: ${bal}`);
        return { success: true, message: 'PENDING', txId: tx.hash };
    });
}
function formatTimestamp(timestamp) {
    // Convert seconds → milliseconds
    const date = new Date(timestamp * 1000);
    const pad = (n) => n.toString().padStart(2, "0");
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // Months start from 0
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}
//# sourceMappingURL=eth-overdraft-line.js.map