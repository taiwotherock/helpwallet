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
exports.ethDepositIntoVault = ethDepositIntoVault;
exports.ethWithdrawFromVault = ethWithdrawFromVault;
exports.updateWhiteOrBlackListLend = updateWhiteOrBlackListLend;
exports.ethCreateLoan = ethCreateLoan;
exports.ethRepayLoan = ethRepayLoan;
exports.ethDisburseLoanToMerchant = ethDisburseLoanToMerchant;
exports.ethPostRates = ethPostRates;
exports.getProtocolStats = getProtocolStats;
exports.getBorrowerStats = getBorrowerStats;
exports.getLenderStats = getLenderStats;
exports.getLoanData = getLoanData;
exports.getDashboardView = getDashboardView;
const ethers_1 = require("ethers");
const ethers_2 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// ====== Config ======
const RPC_URL = process.env.B_RPC_URL; // Replace with your network RPC
const PRIVATE_KEY = process.env.B_KEY; // Admin wallet private key Seller's private key
const CONTRACT_ADDRESS = ethers_1.ethers.getAddress(process.env.ESCROW_VAULT_CONTRACT_ADDRESS); // Deployed TradeEscrowVault contract
// ====== ABI (minimal) ======
const ABI = [
    "function deposit(address token,uint256 amount) external returns (uint256 sharesMinted)",
    "function withdraw(address token,uint256 sharesToBurn) external",
    "function setWhitelist(address user, bool status) external",
    "function repayLoan(bytes32 ref, uint256 amount) external",
    "function withdrawMerchantFund(address token) external",
    "function setFeeRate(uint256 platformFeeRate, uint256 lenderFeeRate,uint256 bp) external",
    "function setDepositContributionPercent(uint256 depositContributionPercent) external",
    "function markDefault(bytes32 ref) external",
    "function writeOffLoan(bytes32 ref) external",
    "function getMerchantFund(address merchant, address token) external",
    "function withdrawPlatformFees(uint256 amount,address token) external",
    "function createLoan(bytes32 ref,address token, address merchant, uint256 principal,uint256 fee, uint256 depositAmount, address borrower, uint256 maturitySeconds) external",
    //"function createLoan(bytes32 ref,address token, address merchant, uint256 principal,uint256 fee, uint256 depositAmount, address borrower, uint256 maturitySeconds) external ",
    "function getLoanData(bytes32 ref) external view returns (address borrower, address token, uint256 principal, uint256 outstanding, uint256 totalPaid,uint256 maturityDate,string memory status)",
    "function fetchDashboardView() external view returns (uint256 noOfLoans, uint256 poolBalance, uint256 totalPrincipal, uint256 poolCashTotal, uint256 totalPaidToMerchant, uint256 totalReserveBalance, uint256 totalPlatformFees, uint256 totalLenderFees, uint256 totalPastDue)",
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
function ethDepositIntoVault(key, amount, rpcUrl, contractAddress, tokenAddress) {
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
        const tx = yield contract.deposit(tokenAddress, amountInt); /*, {
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
// ====== Main: Withdraw into vault ======
function ethWithdrawFromVault(key, amount, rpcUrl, contractAddress, tokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers_1.ethers.Wallet(key, provider);
        const contract = new ethers_1.ethers.Contract(contractAddress, ABI, wallet);
        const publicAddress = yield wallet.getAddress();
        console.log('amount ' + amount);
        console.log("Public address:", publicAddress);
        //fetch vault balance
        const vaultContract = new ethers_1.ethers.Contract(tokenAddress, ERC20_ABI, wallet);
        const balancev = yield vaultContract.balanceOf(contractAddress);
        const decimalNo = yield vaultContract.decimals();
        console.log('decimalNo ' + decimalNo);
        const vaultBal = ethers_1.ethers.parseUnits(balancev.toString(), decimalNo);
        console.log(' vault bal ' + vaultBal);
        if (vaultBal < Number(amount)) {
            return { success: false, message: 'Insufficient balance in vault ' + vaultBal, txId: '' };
        }
        const amountInt = ethers_1.ethers.parseUnits(amount, decimalNo); // scaled to 1e18
        console.log(' amt ' + amountInt);
        //fetch user balance
        const tokenContract = new ethers_1.ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const balance = yield tokenContract.balanceOf(publicAddress);
        const decimals = yield tokenContract.decimals();
        const userBal = ethers_1.ethers.parseUnits(balance.toString(), decimals);
        console.log(' user bal ' + userBal);
        console.log('contract address: ' + contractAddress);
        // Send transaction
        console.log('processing...');
        const tx = yield contract.withdraw(amountInt);
        console.log(`🚀 Transaction sent: ${tx.hash}`);
        const receipt = yield tx.wait();
        console.log(`✅ Mined in block ${receipt.blockNumber}`);
        const userBalance2 = yield tokenContract.balanceOf(publicAddress);
        console.log("USDT user balance 2 " + userBalance2);
        console.log("USDT user balance 2 " + ethers_1.ethers.parseUnits(userBalance2.toString(), 18));
        console.log("USDT user balance 1 " + userBalance2);
        if (userBalance2 > balance) {
            console.log('user balance increase');
        }
        const txDetail = yield provider.getTransaction(tx.hash);
        console.log("Raw tx data:", txDetail.data);
        console.log(`\n🎉 Offer successfully created! Ref: `);
        //const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const balance3 = yield vaultContract.balanceOf(contractAddress);
        console.log('bal ' + balance3 + ' ' + decimalNo);
        const bal = ethers_1.ethers.formatUnits(balance3, decimalNo);
        console.log(`Vault Token Balance: ${bal}`);
        return { success: true, message: 'PENDING', txId: tx.hash };
    });
}
function updateWhiteOrBlackListLend(key, address, status, whiteOrBlack, rpcUrl, contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        // Send transaction
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers_1.ethers.Wallet(key, provider);
        const contract = new ethers_1.ethers.Contract(contractAddress, ABI, wallet);
        const publicAddress = yield wallet.getAddress();
        console.log("Public address:", publicAddress);
        console.log(`\n📦 white or black list r...` + address + ' ' + status
            + ' ' + whiteOrBlack);
        if (whiteOrBlack == 'W') {
            const tx1 = yield contract.setWhitelist(ethers_1.ethers.getAddress(address), status);
            const tx1res = tx1.wait();
            console.log(" tx1res setWhitelist " + tx1res);
            return { success: true, txId: tx1.hash, message: 'PENDING' };
        }
        else {
            const tx1 = yield contract.setBlacklist(ethers_1.ethers.getAddress(address), status);
            const tx1res = tx1.wait();
            console.log(" tx1res setBlacklist " + tx1res);
            return { success: true, txId: tx1.hash, message: 'PENDING' };
        }
    });
}
// ====== Main: Deposit into vault ======
//"function createLoan(bytes32 ref,address token, address merchant, uint256 principal, uint256 fee)",
function ethCreateLoan(key, amount, rpcUrl, contractAddress, tokenAddress, refx, merchantAddress, fee, depositAmount, borrower) {
    return __awaiter(this, void 0, void 0, function* () {
        // Generate unique reference
        const ref = (0, ethers_2.keccak256)((0, ethers_2.toUtf8Bytes)(refx));
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers_1.ethers.Wallet(key, provider);
        const contract = new ethers_1.ethers.Contract(contractAddress, ABI, wallet);
        const publicAddress = yield wallet.getAddress();
        contractAddress = ethers_1.ethers.getAddress(contractAddress);
        console.log('amount ' + amount + " ref " + ref);
        console.log("Public address:", publicAddress);
        const tokenContractAddress = ethers_1.ethers.getAddress(tokenAddress); //USDT or USDC
        const tokenContract1 = new ethers_1.ethers.Contract(tokenContractAddress, ERC20_ABI, wallet);
        const decimalNo = yield tokenContract1.decimals();
        /*const userBalance = await tokenContract1.balanceOf(publicAddress);
        const userBal = ethers.formatUnits(userBalance, decimalNo);
        console.log('decimalNo ' + decimalNo);
        console.log(" user balance " + userBalance);
        console.log(" user balance " + userBal);
        */
        const balanceWei = yield provider.getBalance(publicAddress);
        console.log('balanceWei: ' + balanceWei.toString());
        //const balanceEth = Number(ethers.formatEther(balanceWei));
        if (Number(balanceWei.toString()) <= 0) {
            return { success: false, message: 'Insufficient gas token', txId: balanceWei.toString() };
        }
        if (fee == "0")
            fee = "1";
        console.log('decimalNo ' + decimalNo);
        console.log('amount ' + amount);
        console.log('depositAmt ' + depositAmount);
        console.log('feeInt ' + fee);
        const amountInt = ethers_1.ethers.parseUnits(amount, decimalNo); // scaled to 1e18
        const depositAmt = ethers_1.ethers.parseUnits(depositAmount, decimalNo);
        const maturityDate = Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60;
        const feeInt = ethers_1.ethers.parseUnits(fee, decimalNo);
        console.log('amt to send ' + amountInt);
        //console.log(" user balance " + ethers.parseUnits(userBalance.toString(), decimalNo));
        //const approveTx = await tokenContract1.approve(contractAddress, amountInt);
        //const tx3 = await approveTx.wait();
        //console.log(tx3);
        //console.log(" approved to spend contract coin ");
        //console.log('contract address: ' + contractAddress)
        // Send transaction
        console.log('processing...' + depositAmt + " " + amountInt);
        console.log('processing...' + tokenContractAddress);
        console.log('processing...' + maturityDate);
        //function createLoan(bytes32 ref,address token, address merchant, uint256 principal, uint256 fee)
        const tx = yield contract.createLoan(ref, tokenContractAddress, ethers_1.ethers.getAddress(merchantAddress), amountInt, feeInt, depositAmt, borrower, maturityDate);
        console.log(`🚀 Transaction sent: ${tx.hash}`);
        const receipt = yield tx.wait();
        console.log(`✅ Mined in block ${receipt.blockNumber}`);
        const userBalance2 = yield tokenContract1.balanceOf(publicAddress);
        console.log("USDT user balance 2 " + userBalance2);
        console.log("USDT user balance 2 " + ethers_1.ethers.parseUnits(userBalance2.toString(), 18));
        const txDetail = yield provider.getTransaction(tx.hash);
        console.log("Raw tx data:", txDetail.data);
        console.log(`\n🎉 Loan successfully created! Ref: `);
        const tokenContract = new ethers_1.ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const balance = yield tokenContract.balanceOf(contractAddress);
        const decimals = yield tokenContract.decimals();
        console.log('bal ' + balance + ' ' + decimals);
        const bal = ethers_1.ethers.formatUnits(balance, decimals);
        console.log(`Vault Token Balance: ${bal}`);
        return { success: true, message: 'PENDING', txId: tx.hash };
    });
}
function ethRepayLoan(key, amount, rpcUrl, contractAddress, tokenAddress, refx) {
    return __awaiter(this, void 0, void 0, function* () {
        // Generate unique reference
        const ref = (0, ethers_2.keccak256)((0, ethers_2.toUtf8Bytes)(refx));
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers_1.ethers.Wallet(key, provider);
        const contract = new ethers_1.ethers.Contract(contractAddress, ABI, wallet);
        const publicAddress = yield wallet.getAddress();
        console.log('amount ' + amount + " ref " + ref);
        console.log("Public address:", publicAddress);
        console.log("contract address:", tokenAddress);
        console.log("lending contract address:", contractAddress);
        const tokenContractAddress = ethers_1.ethers.getAddress(tokenAddress); //USDT or USDC
        const tokenContract1 = new ethers_1.ethers.Contract(tokenContractAddress, ERC20_ABI, wallet);
        const decimalNo = yield tokenContract1.decimals();
        const userBalance = yield tokenContract1.balanceOf(publicAddress);
        const userBal = ethers_1.ethers.formatUnits(userBalance, decimalNo);
        console.log('decimalNo ' + decimalNo);
        console.log(" user balance " + userBalance);
        console.log(" user balance " + userBal);
        const amountInt = ethers_1.ethers.parseUnits(amount, decimalNo); // scaled to 1e18
        console.log('amt to send ' + amountInt);
        console.log(" user balance " + ethers_1.ethers.parseUnits(userBalance.toString(), decimalNo));
        const approveTx = yield tokenContract1.approve(contractAddress, amountInt);
        const tx3 = yield approveTx.wait();
        console.log(tx3);
        console.log(" approved to spend contract coin ");
        console.log('contract address: ' + contractAddress);
        // Send transaction
        console.log('processing...');
        //function createLoan(bytes32 ref,address token, address merchant, uint256 principal, uint256 fee)
        //function repayLoan(bytes32 ref, uint256 amount) external
        const tx = yield contract.repayLoan(ref, amountInt);
        console.log(`🚀 Transaction sent: ${tx.hash}`);
        const receipt = yield tx.wait();
        console.log(`✅ Mined in block ${receipt.blockNumber}`);
        const userBalance2 = yield tokenContract1.balanceOf(publicAddress);
        console.log("USDT user balance 2 " + userBalance2);
        console.log("USDT user balance 2 " + ethers_1.ethers.parseUnits(userBalance2.toString(), 18));
        console.log("USDT user balance 1 " + userBalance);
        if (userBalance2 < userBalance) {
            console.log('user balance reduce');
        }
        const txDetail = yield provider.getTransaction(tx.hash);
        console.log("Raw tx data:", txDetail.data);
        console.log(`\n🎉 Loan successfully created! Ref: `);
        const tokenContract = new ethers_1.ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const balance = yield tokenContract.balanceOf(contractAddress);
        const decimals = yield tokenContract.decimals();
        console.log('bal ' + balance + ' ' + decimals);
        const bal = ethers_1.ethers.formatUnits(balance, decimals);
        console.log(`Vault Token Balance: ${bal}`);
        return { success: true, message: 'PENDING', txId: tx.hash };
    });
}
//function disburseLoanToMerchant(bytes32 ref) external onlyCreditOfficer
function ethDisburseLoanToMerchant(key, rpcUrl, contractAddress, tokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        // Generate unique reference
        console.log('rpc ' + rpcUrl);
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers_1.ethers.Wallet(key, provider);
        const contract = new ethers_1.ethers.Contract(contractAddress, ABI, wallet);
        const publicAddress = yield wallet.getAddress();
        console.log('token address ' + tokenAddress);
        console.log("Public address:", publicAddress);
        const tokenContractAddress = ethers_1.ethers.getAddress(tokenAddress); //USDT or USDC
        const tokenContract1 = new ethers_1.ethers.Contract(tokenContractAddress, ERC20_ABI, wallet);
        const vaultBalance1 = yield tokenContract1.balanceOf(contractAddress);
        console.log("vault balance " + vaultBalance1);
        console.log('contract address: ' + contractAddress);
        console.log('contract address: ' + tokenContractAddress);
        //console.log("Contract address:", contract.address);
        // console.log("Available functions:", Object.keys(contract.functions));
        // Send transaction
        console.log('processing...');
        //function createLoan(bytes32 ref,address token, address merchant, uint256 principal, uint256 fee)
        //function repayLoan(bytes32 ref, uint256 amount) external
        const nonce = yield wallet.getNonce();
        // const response = await contract.getMerchantFund(publicAddress,tokenAddress, {nonce});
        //  console.log(response);
        const tx = yield contract.withdrawMerchantFund(tokenAddress, { nonce: nonce,
            maxFeePerGas: ethers_1.ethers.parseUnits('40', 'gwei'), // increase from your last
            maxPriorityFeePerGas: ethers_1.ethers.parseUnits('3', 'gwei')
        });
        console.log(`🚀 Transaction sent: ${tx.hash}`);
        const receipt = yield tx.wait();
        console.log(`✅ Mined in block ${receipt.blockNumber}`);
        const vaultBalance2 = yield tokenContract1.balanceOf(contractAddress);
        console.log("vault balance " + vaultBalance2);
        return { success: true, message: 'PENDING', txId: tx.hash };
    });
}
function ethPostRates(key, rpcUrl, contractAddress, lenderFee, platformFee, defaultRate, depositContribution) {
    return __awaiter(this, void 0, void 0, function* () {
        // Generate unique reference
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers_1.ethers.Wallet(key, provider);
        const contract = new ethers_1.ethers.Contract(contractAddress, ABI, wallet);
        const publicAddress = yield wallet.getAddress();
        console.log("Public address:", publicAddress);
        //const platformFeeInt = ethers.parseUnits(platformFee, 18); 
        //const lenderFeeInt = ethers.parseUnits(lenderFee, 18); 
        //const depositAmt = ethers.parseUnits(depositContribution, 18); 
        const SCALE = 100; // 1e6;
        const platformFeeInt = Math.floor(Number(platformFee) * SCALE);
        const lenderFeeInt = Math.floor(Number(lenderFee) * SCALE);
        const depositAmtInt = Math.floor(Number(depositContribution) * SCALE);
        const defaultRateInt = Math.floor(Number(defaultRate) * SCALE);
        if (platformFeeInt + lenderFeeInt > 10000) {
            return { success: false, message: 'Invalid fee setup — total exceeds 100%', txId: '' };
        }
        // Send transaction
        console.log('processing post rates...' + platformFeeInt + " " + lenderFeeInt + " " + depositAmtInt);
        console.log('processing default rates...' + defaultRateInt);
        let tx;
        //function createLoan(bytes32 ref,address token, address merchant, uint256 principal, uint256 fee)
        //function repayLoan(bytes32 ref, uint256 amount) external
        tx = yield contract.setFeeRate(platformFeeInt, lenderFeeInt, defaultRateInt, {
            maxFeePerGas: ethers_1.ethers.parseUnits('50', 'gwei'), // must be > previous tx
            maxPriorityFeePerGas: ethers_1.ethers.parseUnits('10', 'gwei'),
        });
        const tx2 = yield contract.setDepositContributionPercent(depositAmtInt);
        console.log(`🚀 Transaction sent: ${tx.hash}     ${tx2.hash}`);
        const receipt = yield tx.wait();
        console.log(`✅ Mined in block ${receipt.blockNumber}`);
        return { success: true, message: 'PENDING', txId: tx.hash };
    });
}
/*
"function getBorrowerStats(address borrower, address token)",
  "function getLenderStats(address lender, address token) ",
  "function getProtocolStats(address token) ",
  */
function getProtocolStats(tokenAddress, rpcUrl, contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const fetchAbi = [
            "function getProtocolStats(address token) external view returns (uint256 numLenders, uint256 numBorrowers, uint256 totalLenderDeposits, uint256 totalBorrowed, uint256 totalOutstanding, uint256 totalPaid);"
        ];
        // 2️⃣ Create contract instance
        const vault = new ethers_1.ethers.Contract(contractAddress, fetchAbi, provider);
        // 3️⃣ Call the view function
        const response = yield vault.getProtocolStats(tokenAddress);
        console.log(response);
        // 4️⃣ Format response for readability
        const result = {
        //creator: offer.creator,
        };
        console.log("📦 Protocol Stats:", result);
        return result;
    });
}
function getBorrowerStats(tokenAddress, borrower, rpcUrl, contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const fetchAbi = [
            " function getBorrowerStats(address borrower, address token) " +
                " external view " +
                " returns (uint256 vaultBalance, uint256 totalPaidToPool"
        ];
        // 2️⃣ Create contract instance
        const vault = new ethers_1.ethers.Contract(contractAddress, fetchAbi, provider);
        // 3️⃣ Call the view function
        const response = yield vault.getBorrowerStats(tokenAddress, borrower);
        console.log(response);
        // 4️⃣ Format response for readability
        const result = {
        //creator: offer.creator,
        };
        console.log("📦 Protocol Stats:", result);
        return result;
    });
}
function getLenderStats(tokenAddress, lender, rpcUrl, contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const fetchAbi = [
            " function getLenderStats(address lender, address token) " +
                " external  view returns ( " +
                "  uint256 deposit," +
                " uint256 poolShare," +
                "uint256 totalFeesEarned, " +
                " uint256 feesClaimed  ) "
        ];
        // 2️⃣ Create contract instance
        const vault = new ethers_1.ethers.Contract(contractAddress, fetchAbi, provider);
        // 3️⃣ Call the view function
        const response = yield vault.getLenderStats(lender, tokenAddress);
        console.log(response);
        // 4️⃣ Format response for readability
        const result = {
        //creator: offer.creator,
        };
        console.log("📦 Protocol Stats:", result);
        return result;
    });
}
function getLoanData(refx, rpcUrl, contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const ref = (0, ethers_2.keccak256)((0, ethers_2.toUtf8Bytes)(refx));
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        console.log('ref ' + ref + ' ' + refx);
        const vault = new ethers_1.ethers.Contract(contractAddress, ABI, provider);
        // 3️⃣ Call the view function
        const response = yield vault.getLoanData(ref);
        const [borrower, token, principal, outstanding, paid, maturityDate, loanStatus] = response;
        console.log(response);
        const p = ethers_1.ethers.formatUnits(principal.toString(), 6);
        const o = ethers_1.ethers.formatUnits(outstanding.toString(), 6);
        const paid1 = ethers_1.ethers.formatUnits(paid.toString(), 6);
        // 4️⃣ Format response for readability
        const result = { success: true, message: 'SUCCESS',
            principal: p, outstanding: o,
            totalPaid: paid1,
            maturityDate: formatTimestamp(Number(maturityDate.toString())),
            loanStatus: loanStatus
        };
        console.log("📦 loan data :", result);
        return result;
    });
}
function getDashboardView(rpcUrl, contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const vault = new ethers_1.ethers.Contract(contractAddress, ABI, provider);
        // 3️⃣ Call the view function
        const response = yield vault.fetchDashboardView();
        console.log(response);
        const [noOfLoans, poolBalance, totalPrincipal, poolCashTotal, totalPaidToMerchant, totalReserveBalance, totalPlatformFees, totalLenderFees, totalPastDue] = response;
        console.log(response);
        /*
         ( uint256 noOfLoans, uint256 poolBalance,
        uint256 totalPrincipal, uint256 poolCashTotal,uint256 totalPaidToMerchant,
        uint256 totalReserveBalance,
        uint256 totalPlatformFees,uint256 totalLenderFees,uint256 totalPastDue)*/
        const p = ethers_1.ethers.formatUnits(noOfLoans.toString(), 6);
        const o = ethers_1.ethers.formatUnits(poolBalance.toString(), 6);
        //const paid1 = ethers.formatUnits(paid.toString(), 6);
        // 4️⃣ Format response for readability
        const result = { success: true, message: 'SUCCESS',
            noOfLoans: noOfLoans.toString(),
            poolBalance: ethers_1.ethers.formatUnits(poolBalance.toString(), 6),
            totalPrincipal: ethers_1.ethers.formatUnits(totalPrincipal.toString(), 6),
            poolCashTotal: ethers_1.ethers.formatUnits(poolCashTotal.toString(), 6),
            totalPaidToMerchant: ethers_1.ethers.formatUnits(totalPaidToMerchant.toString(), 6),
            totalReserveBalance: ethers_1.ethers.formatUnits(totalReserveBalance.toString(), 6),
            totalPlatformFees: ethers_1.ethers.formatUnits(totalPlatformFees.toString(), 6),
            totalLenderFees: ethers_1.ethers.formatUnits(totalLenderFees.toString(), 6),
            totalPastDue: ethers_1.ethers.formatUnits(totalPastDue.toString(), 6)
        };
        console.log("📦 loan data :", result);
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
//# sourceMappingURL=eth-lending.js.map