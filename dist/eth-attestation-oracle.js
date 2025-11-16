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
exports.ethSetPoolAndAttestor = ethSetPoolAndAttestor;
exports.setBorrowerAttestation = setBorrowerAttestation;
exports.getBorrowerAttestation = getBorrowerAttestation;
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// ====== ABI (minimal) ======
const ABI = [
    "function setAllowedPool(address pool, bool allowed) external",
    "function addTrustedAttestor(address attestor) external",
    "function setAttestation(address borrower, uint256 creditLimit, uint256 creditScore, bool kycVerified) external",
    "function increaseUsedCredit(address borrower, uint256 amount) external",
    "function decreaseUsedCredit(address borrower, uint256 amount) external",
    "function getAttestation(address borrower) external view returns (uint256 creditLimit, uint256 creditScore, bool kycVerified, uint256 utilizedLimit, address attestor, uint256 updatedAt)"
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
function ethSetPoolAndAttestor(key, poolAddress, rpcUrl, contractAddress, attestorAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        // Generate unique reference
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers_1.ethers.Wallet(key, provider);
        const contract = new ethers_1.ethers.Contract(contractAddress, ABI, wallet);
        const publicAddress = yield wallet.getAddress();
        console.log("Public address:", publicAddress);
        //await contract.addTrustedAttestor(ethers.getAddress(publicAddress));
        //await contract.addTrustedAttestor(ethers.getAddress(attestorAddress));
        const tx = yield contract.setAllowedPool(ethers_1.ethers.getAddress(poolAddress), true);
        console.log(`🚀 Transaction sent: ${tx.hash}`);
        const receipt = yield tx.wait();
        console.log(`✅ Mined in block ${receipt.blockNumber}`);
        yield sleep(5000);
        yield contract.addTrustedAttestor(ethers_1.ethers.getAddress(attestorAddress));
        return { success: true, message: 'PENDING', txId: tx.hash };
    });
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function setBorrowerAttestation(key, borrower, creditLimit, creditScore, kycVerified, rpcUrl, contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers_1.ethers.Wallet(key, provider);
        const contract = new ethers_1.ethers.Contract(contractAddress, ABI, wallet);
        const publicAddress = yield wallet.getAddress();
        console.log("Public address:", publicAddress);
        const creditLimitInt = ethers_1.ethers.parseUnits(creditLimit, 6);
        console.log('processing...');
        const tx = yield contract.setAttestation(borrower, creditLimitInt, creditScore, kycVerified);
        console.log(`🚀 Transaction sent: ${tx.hash}`);
        const receipt = yield tx.wait();
        console.log(`✅ Mined in block ${receipt.blockNumber}`);
        return { success: true, message: 'PENDING', txId: tx.hash };
    });
}
function getBorrowerAttestation(borrower, rpcUrl, contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const vault = new ethers_1.ethers.Contract(contractAddress, ABI, provider);
        // 3️⃣ Call the view function
        const response = yield vault.getAttestation(borrower);
        console.log(response);
        const [creditLimit, creditScore, kycVerified, utilizedLimit, attestor, updatedAt] = response;
        console.log(response);
        // 4️⃣ Format response for readability
        const result = { success: true, message: 'SUCCESS',
            creditLimit: ethers_1.ethers.formatUnits(creditLimit.toString(), 6),
            creditScore: creditScore.toString(),
            kycVerified: kycVerified,
            utilizedLimit: ethers_1.ethers.formatUnits(utilizedLimit.toString(), 6),
            attestor: attestor,
            updatedAt: updatedAt.toString()
        };
        console.log("📦 attestation data :", result);
        return result;
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
//# sourceMappingURL=eth-attestation-oracle.js.map