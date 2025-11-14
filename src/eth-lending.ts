import { ethers } from "ethers";
import { Wallet, JsonRpcProvider, Contract, keccak256, toUtf8Bytes } from "ethers";
import dotenv from 'dotenv';


dotenv.config();

// ====== Config ======
const RPC_URL = process.env.B_RPC_URL; // Replace with your network RPC
const PRIVATE_KEY = process.env.B_KEY; // Admin wallet private key Seller's private key
const CONTRACT_ADDRESS = ethers.getAddress(process.env.ESCROW_VAULT_CONTRACT_ADDRESS); // Deployed TradeEscrowVault contract

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
const DECIMALS = ethers.parseUnits("1", 18); // For scaling rates



// ====== Main: Deposit into vault ======
export async function ethDepositIntoVault(key: string,
  amount: string,
  rpcUrl: string,
  contractAddress: string,
  tokenAddress: string
 ) {
    // Generate unique reference

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(key!, provider);
    const contract = new ethers.Contract(contractAddress!, ABI, wallet);
    const publicAddress = await wallet.getAddress();

    console.log('amount in ' + amount)

    console.log("Public address:", publicAddress);
   
    const usdtAddress = ethers.getAddress(tokenAddress); //USDT
    const usdtContract = new ethers.Contract(usdtAddress, ERC20_ABI, wallet);
    const decimalNo = await usdtContract.decimals();
    console.log('decimalNo ' + decimalNo);

    const amountInt = ethers.parseUnits(amount, decimalNo); // scaled to 1e18
    console.log('usdt amt ' + amountInt);

    const userBalance = await usdtContract.balanceOf(publicAddress);
    console.log("USDT user balance " + userBalance);
    const userBalInt = Number(ethers.formatUnits(userBalance.toString(), decimalNo));
    console.log("USDT user balance " + userBalInt);

    if(userBalInt <= Number(amount) )
    {
       return {success: false, message: 'Insufficient Balance', txId: ''  };
    }
   

   // const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    /*const [allowance, decimals2] = await Promise.all([
      usdtContract.allowance(publicAddress, contractAddress),
      usdtContract.decimals()
    ]);

    console.log("decimals allowance " + allowance + " " + decimals2);*/

    const approveTx = await usdtContract.approve(contractAddress, amountInt); /*, {
      maxFeePerGas: ethers.parseUnits('100', 'gwei'),          // increase from your last
      maxPriorityFeePerGas: ethers.parseUnits('30', 'gwei'),
    });*/
    const tx3 = await approveTx.wait();
    console.log(tx3);
    console.log("USDT approved to spend USDT ");

    console.log('contract address: ' + contractAddress)
    
    // Send transaction
    //function depositToVault(address token, uint256 amount) external
    console.log('processing...' + amountInt)
    const tx = await contract.deposit(tokenAddress,amountInt) /*, {
      maxFeePerGas: ethers.parseUnits('40', 'gwei'),          // increase from your last
      maxPriorityFeePerGas: ethers.parseUnits('3', 'gwei'),
    });*/
       

    console.log(`🚀 Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Mined in block ${receipt.blockNumber}`);
    

    const userBalance2 = await usdtContract.balanceOf(publicAddress);
    console.log("USDT user balance 2 " + userBalance2);
    console.log("USDT user balance 2 " + ethers.parseUnits(userBalance2.toString(), 18));
    console.log("USDT user balance 1 " + userBalance);
    if(userBalance2 < userBalance)
    {
         console.log('user balance reduce');
    }

     const txDetail = await provider.getTransaction(tx.hash);
    console.log("Raw tx data:", txDetail.data);
    console.log(`\n🎉 deposit into vault success created! Ref: `);
   
  
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balance: bigint = await tokenContract.balanceOf(contractAddress);
    const decimals: number = await tokenContract.decimals();
    console.log('bal ' + balance + ' ' + decimals);
    const bal = ethers.formatUnits(balance, decimals);
    console.log(`Vault Token Balance: ${bal}`);

    return {success: true, message: 'PENDING', txId: tx.hash  };
}

// ====== Main: Withdraw into vault ======
export async function ethWithdrawFromVault(key: string,
  amount: string,
  rpcUrl: string,
  contractAddress: string,
  tokenAddress: string
 ) {
    

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(key!, provider);
    const contract = new ethers.Contract(contractAddress!, ABI, wallet);
    const publicAddress = await wallet.getAddress();

    console.log('amount ' + amount)

    console.log("Public address:", publicAddress);

   
    //fetch vault balance
    const vaultContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
    const balancev: bigint = await vaultContract.balanceOf(contractAddress);
    const decimalNo = await vaultContract.decimals();
    console.log('decimalNo ' + decimalNo);
    const vaultBal =  ethers.parseUnits(balancev.toString(), decimalNo);
    console.log(' vault bal ' + vaultBal);
    if(vaultBal < Number(amount))
    {
        return {success: false, message: 'Insufficient balance in vault ' + vaultBal, txId: ''  };
    }

    const amountInt = ethers.parseUnits(amount, decimalNo); // scaled to 1e18
    console.log(' amt ' + amountInt);

    //fetch user balance
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balance: bigint = await tokenContract.balanceOf(publicAddress);
    const decimals: number = await tokenContract.decimals();
    const userBal =  ethers.parseUnits(balance.toString(), decimals);
    console.log(' user bal ' + userBal);
    console.log('contract address: ' + contractAddress)
    
    // Send transaction
     console.log('processing...')
     
     const tx = await contract.withdraw(tokenAddress,amountInt);
       
    console.log(`🚀 Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Mined in block ${receipt.blockNumber}`);
    

    const userBalance2 = await tokenContract.balanceOf(publicAddress);
    console.log("USDT user balance 2 " + userBalance2);
    console.log("USDT user balance 2 " + ethers.parseUnits(userBalance2.toString(), 18));
    console.log("USDT user balance 1 " + userBalance2);
    if(userBalance2 > balance)
    {
         console.log('user balance increase');
    }

     const txDetail = await provider.getTransaction(tx.hash);
    console.log("Raw tx data:", txDetail.data);
    console.log(`\n🎉 Offer successfully created! Ref: `);
   
  
    //const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balance3: bigint = await vaultContract.balanceOf(contractAddress);
    console.log('bal ' + balance3 + ' ' + decimalNo);
    const bal = ethers.formatUnits(balance3, decimalNo);
    console.log(`Vault Token Balance: ${bal}`);

    return {success: true, message: 'PENDING', txId: tx.hash  };
}

export async function updateWhiteOrBlackListLend(key:string,address:
     string,status: boolean, whiteOrBlack: string, rpcUrl: string, contractAddress: string) {

     // Send transaction

     const provider = new ethers.JsonRpcProvider(rpcUrl);
     const wallet = new ethers.Wallet(key!, provider);
    const contract = new ethers.Contract(contractAddress!, ABI, wallet);
    const publicAddress = await wallet.getAddress();

    console.log("Public address:", publicAddress);
    console.log(`\n📦 white or black list r...` + address + ' ' + status 
        + ' ' + whiteOrBlack);
    if(whiteOrBlack == 'W')
    {
        const tx1 = await contract.setWhitelist(ethers.getAddress(address),status);
        const tx1res = tx1.wait();
        console.log(" tx1res setWhitelist " + tx1res);
        return {success:true, txId: tx1.hash, message: 'PENDING'};
    }
    else
    {
        const tx1 = await contract.setBlacklist(ethers.getAddress(address),status);
        const tx1res = tx1.wait();
        console.log(" tx1res setBlacklist " + tx1res);
        return {success:true, txId: tx1.hash, message: 'PENDING'};
    }
  
}


// ====== Main: Deposit into vault ======
//"function createLoan(bytes32 ref,address token, address merchant, uint256 principal, uint256 fee)",
export async function ethCreateLoan(key: string,
  amount: string,
  rpcUrl: string,
  contractAddress: string,
  tokenAddress: string,
  refx: string,
  merchantAddress: string,
  fee: string,
  depositAmount: string,
  borrower: string
 ) {
    // Generate unique reference

    const ref = keccak256(toUtf8Bytes(refx));
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(key!, provider);
    const contract = new ethers.Contract(contractAddress!, ABI, wallet);
    const publicAddress = await wallet.getAddress();
    contractAddress =ethers.getAddress(contractAddress);

    console.log('amount ' + amount + " ref " + ref)

    console.log("Public address:", publicAddress);
   
    const tokenContractAddress = ethers.getAddress(tokenAddress); //USDT or USDC
    const tokenContract1 = new ethers.Contract(tokenContractAddress, ERC20_ABI, wallet);
    const decimalNo = await tokenContract1.decimals();
    
    /*const userBalance = await tokenContract1.balanceOf(publicAddress);
    const userBal = ethers.formatUnits(userBalance, decimalNo);
    console.log('decimalNo ' + decimalNo);
    console.log(" user balance " + userBalance);
    console.log(" user balance " + userBal);
    */

    const balanceWei = await provider.getBalance(publicAddress);
    console.log('balanceWei: ' + balanceWei.toString())
    //const balanceEth = Number(ethers.formatEther(balanceWei));
    if(Number(balanceWei.toString()) <= 0)
    {
      return {success: false, message: 'Insufficient gas token', txId: balanceWei.toString()  };
    }

    if(fee == "0")
        fee = "1";

    console.log('decimalNo ' + decimalNo);
    console.log('amount ' + amount);
    console.log('depositAmt ' + depositAmount);
    console.log('feeInt ' + fee);

    const amountInt = ethers.parseUnits(amount, decimalNo); // scaled to 1e18
    const depositAmt = ethers.parseUnits(depositAmount, decimalNo); 
    const maturityDate = Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60;
    const feeInt = ethers.parseUnits(fee, decimalNo); 
    console.log('amt to send ' + amountInt);
    
    //console.log(" user balance " + ethers.parseUnits(userBalance.toString(), decimalNo));
   
    //const approveTx = await tokenContract1.approve(contractAddress, amountInt);
    //const tx3 = await approveTx.wait();
    //console.log(tx3);
    //console.log(" approved to spend contract coin ");

    //console.log('contract address: ' + contractAddress)
    
    // Send transaction
      console.log('processing...' + depositAmt +" " + amountInt)
      console.log('processing...' + tokenContractAddress)
      console.log('processing...' + maturityDate)
      //function createLoan(bytes32 ref,address token, address merchant, uint256 principal, uint256 fee)
    const tx = await contract.createLoan(ref,tokenContractAddress,ethers.getAddress(merchantAddress),
       amountInt, feeInt,depositAmt,borrower,maturityDate);
      
      

    console.log(`🚀 Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Mined in block ${receipt.blockNumber}`);
    

    const userBalance2 = await tokenContract1.balanceOf(publicAddress);
    console.log("USDT user balance 2 " + userBalance2);
    console.log("USDT user balance 2 " + ethers.parseUnits(userBalance2.toString(), 18));
   

     const txDetail = await provider.getTransaction(tx.hash);
    console.log("Raw tx data:", txDetail.data);
    console.log(`\n🎉 Loan successfully created! Ref: `);
   
  
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balance: bigint = await tokenContract.balanceOf(contractAddress);
    const decimals: number = await tokenContract.decimals();
    console.log('bal ' + balance + ' ' + decimals);
    const bal = ethers.formatUnits(balance, decimals);
    console.log(`Vault Token Balance: ${bal}`);

    return {success: true, message: 'PENDING', txId: tx.hash  };
}


export async function ethRepayLoan(key: string,
  amount: string,
  rpcUrl: string,
  contractAddress: string,
  tokenAddress: string,
  refx: string,
 ) {
    // Generate unique reference

    const ref = keccak256(toUtf8Bytes(refx));
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(key!, provider);
    const contract = new ethers.Contract(contractAddress!, ABI, wallet);
    const publicAddress = await wallet.getAddress();

    console.log('amount ' + amount + " ref " + ref)

    console.log("Public address:", publicAddress  );
    console.log("contract address:", tokenAddress  );
    console.log("lending contract address:", contractAddress  );
   
    const tokenContractAddress = ethers.getAddress(tokenAddress); //USDT or USDC
    const tokenContract1 = new ethers.Contract(tokenContractAddress, ERC20_ABI, wallet);
    const decimalNo = await tokenContract1.decimals();
    const userBalance = await tokenContract1.balanceOf(publicAddress);
    const userBal = ethers.formatUnits(userBalance, decimalNo);
    console.log('decimalNo ' + decimalNo);
    console.log(" user balance " + userBalance);
    console.log(" user balance " + userBal);

    const amountInt = ethers.parseUnits(amount, decimalNo); // scaled to 1e18
    console.log('amt to send ' + amountInt);
    
    console.log(" user balance " + ethers.parseUnits(userBalance.toString(), decimalNo));
   
    const approveTx = await tokenContract1.approve(contractAddress, amountInt);
    const tx3 = await approveTx.wait();
    console.log(tx3);
    console.log(" approved to spend contract coin ");

    console.log('contract address: ' + contractAddress)
    
    // Send transaction
      console.log('processing...')
      //function createLoan(bytes32 ref,address token, address merchant, uint256 principal, uint256 fee)
    //function repayLoan(bytes32 ref, uint256 amount) external
      const tx = await contract.repayLoan(ref,amountInt);
       

    console.log(`🚀 Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Mined in block ${receipt.blockNumber}`);
    

    const userBalance2 = await tokenContract1.balanceOf(publicAddress);
    console.log("USDT user balance 2 " + userBalance2);
    console.log("USDT user balance 2 " + ethers.parseUnits(userBalance2.toString(), 18));
    console.log("USDT user balance 1 " + userBalance);
    if(userBalance2 < userBalance)
    {
         console.log('user balance reduce');
    }

     const txDetail = await provider.getTransaction(tx.hash);
    console.log("Raw tx data:", txDetail.data);
    console.log(`\n🎉 Loan successfully created! Ref: `);
   
  
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balance: bigint = await tokenContract.balanceOf(contractAddress);
    const decimals: number = await tokenContract.decimals();
    console.log('bal ' + balance + ' ' + decimals);
    const bal = ethers.formatUnits(balance, decimals);
    console.log(`Vault Token Balance: ${bal}`);

    return {success: true, message: 'PENDING', txId: tx.hash  };
}

//function disburseLoanToMerchant(bytes32 ref) external onlyCreditOfficer

export async function ethDisburseLoanToMerchant(key: string,
  rpcUrl: string,
  contractAddress: string,
  tokenAddress: string
 ) {
    // Generate unique reference

    console.log('rpc ' + rpcUrl)
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(key!, provider);
    const contract = new ethers.Contract(contractAddress!, ABI, wallet);
    const publicAddress = await wallet.getAddress();

    console.log('token address ' + tokenAddress)

    console.log("Public address:", publicAddress);
   
    const tokenContractAddress = ethers.getAddress(tokenAddress); //USDT or USDC
    const tokenContract1 = new ethers.Contract(tokenContractAddress, ERC20_ABI, wallet);
    const vaultBalance1 = await tokenContract1.balanceOf(contractAddress);
    console.log("vault balance " + vaultBalance1);


    console.log('contract address: ' + contractAddress)
    console.log('contract address: ' + tokenContractAddress)

    //console.log("Contract address:", contract.address);
   // console.log("Available functions:", Object.keys(contract.functions));
    
    // Send transaction
      console.log('processing...')
      //function createLoan(bytes32 ref,address token, address merchant, uint256 principal, uint256 fee)
    //function repayLoan(bytes32 ref, uint256 amount) external
    const nonce = await wallet.getNonce();
    // const response = await contract.getMerchantFund(publicAddress,tokenAddress, {nonce});
   //  console.log(response);

     
      const tx = await contract.withdrawMerchantFund(tokenAddress, {nonce: nonce,
        maxFeePerGas: ethers.parseUnits('40', 'gwei'),          // increase from your last
        maxPriorityFeePerGas: ethers.parseUnits('3', 'gwei')
      });
       
    console.log(`🚀 Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Mined in block ${receipt.blockNumber}`);

    const vaultBalance2 = await tokenContract1.balanceOf(contractAddress);
    console.log("vault balance " + vaultBalance2);
 

    return {success: true, message: 'PENDING', txId: tx.hash  };
}

export async function ethPostRates(key: string,
  rpcUrl: string,
  contractAddress: string,
  lenderFee: string,
  platformFee: string,
  defaultRate: string,
  depositContribution: string,
 ) {
    // Generate unique reference

    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(key!, provider);
    const contract = new ethers.Contract(contractAddress!, ABI, wallet);
    const publicAddress = await wallet.getAddress();

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
      return {success: false, message: 'Invalid fee setup — total exceeds 100%', txId: ''  };
    
    }

    
    // Send transaction
      console.log('processing post rates...' + platformFeeInt + " " + lenderFeeInt + " " + depositAmtInt )
      console.log('processing default rates...' + defaultRateInt);
      let tx : any;
      //function createLoan(bytes32 ref,address token, address merchant, uint256 principal, uint256 fee)
    //function repayLoan(bytes32 ref, uint256 amount) external
      tx = await contract.setFeeRate(platformFeeInt,lenderFeeInt, defaultRateInt,  {
        maxFeePerGas: ethers.parseUnits('50', 'gwei'), // must be > previous tx
        maxPriorityFeePerGas: ethers.parseUnits('10', 'gwei'),
      });

      const tx2 = await contract.setDepositContributionPercent(depositAmtInt);
      
       
    console.log(`🚀 Transaction sent: ${tx.hash}     ${tx2.hash}` );
    const receipt = await tx.wait();
    console.log(`✅ Mined in block ${receipt.blockNumber}`);
 
    return {success: true, message: 'PENDING', txId: tx.hash  };
}



/*
"function getBorrowerStats(address borrower, address token)",
  "function getLenderStats(address lender, address token) ",
  "function getProtocolStats(address token) ",
  */

export async function getProtocolStats(tokenAddress: string, rpcUrl: string, contractAddress: string) {
    

  const provider = new ethers.JsonRpcProvider(rpcUrl);
    const fetchAbi: string[] = [
  "function getProtocolStats(address token) external view returns (uint256 numLenders, uint256 numBorrowers, uint256 totalLenderDeposits, uint256 totalBorrowed, uint256 totalOutstanding, uint256 totalPaid);"
];
     // 2️⃣ Create contract instance
  const vault = new ethers.Contract(contractAddress, fetchAbi, provider);

  // 3️⃣ Call the view function
  const response = await vault.getProtocolStats(tokenAddress);
  console.log(response);

  // 4️⃣ Format response for readability
  const result = {
    //creator: offer.creator,
   
  };

  console.log("📦 Protocol Stats:", result);
  return result;
}



export async function getBorrowerStats(tokenAddress: string, borrower: string, rpcUrl: string, contractAddress: string) {
    

  const provider = new ethers.JsonRpcProvider(rpcUrl);
    const fetchAbi: string[] = [
  " function getBorrowerStats(address borrower, address token) " +
        " external view " +
        " returns (uint256 vaultBalance, uint256 totalPaidToPool" ];
     // 2️⃣ Create contract instance
  const vault = new ethers.Contract(contractAddress, fetchAbi, provider);

  // 3️⃣ Call the view function
  const response = await vault.getBorrowerStats(tokenAddress,borrower);
  console.log(response);

  // 4️⃣ Format response for readability
  const result = {
    //creator: offer.creator,
   
  };

  console.log("📦 Protocol Stats:", result);
  return result;
}

export async function getLenderStats(tokenAddress: string, lender: string, rpcUrl: string, contractAddress: string) {
    

  const provider = new ethers.JsonRpcProvider(rpcUrl);
    const fetchAbi: string[] = [
  " function getLenderStats(address lender, address token) "+
        " external  view returns ( " +
          "  uint256 deposit," +
           " uint256 poolShare," +
             "uint256 totalFeesEarned, " +
             " uint256 feesClaimed  ) "]
     // 2️⃣ Create contract instance
  const vault = new ethers.Contract(contractAddress, fetchAbi, provider);

  // 3️⃣ Call the view function
  const response = await vault.getLenderStats(lender,tokenAddress);
  console.log(response);

  // 4️⃣ Format response for readability
  const result = {
    //creator: offer.creator,
   
  };

  console.log("📦 Protocol Stats:", result);
  return result;
}

  type LoanTuple = [string, string, bigint, bigint, bigint];

export async function getLoanData(refx: string, rpcUrl: string, contractAddress: string) {
    
    const ref = keccak256(toUtf8Bytes(refx));
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    console.log('ref ' + ref + ' ' + refx)
    
    const vault = new ethers.Contract(contractAddress, ABI, provider);

    // 3️⃣ Call the view function
    const response = await vault.getLoanData(ref);
    const [borrower, token, principal, outstanding, paid] = response as LoanTuple;
    console.log(response);

    const p = ethers.formatUnits(principal.toString(), 6);
    const o = ethers.formatUnits(outstanding.toString(), 6);
    const paid1 = ethers.formatUnits(paid.toString(), 6);

    // 4️⃣ Format response for readability
    const result ={success: true, message:'SUCCESS',
       principal: p, outstanding: o,
        totalPaid: paid1
    };

    console.log("📦 loan data :", result);
    return result;
}
