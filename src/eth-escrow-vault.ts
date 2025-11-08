import { ethers } from "ethers";
import { Wallet, JsonRpcProvider, Contract, keccak256, toUtf8Bytes } from "ethers";
import dotenv from 'dotenv';


dotenv.config();

// ====== Config ======
const RPC_URL = process.env.B_RPC_URL; // Replace with your network RPC
const PRIVATE_KEY = process.env.B_KEY; // Admin wallet private key Seller's private key
//const CONTRACT_ADDRESS = ethers.getAddress(process.env.ESCROW_VAULT_CONTRACT_ADDRESS); // Deployed TradeEscrowVault contract

// ====== ABI (minimal) ======
const ABI = [
  "function createOffer(bytes32 ref, address counterparty, address token, bool isBuy, uint32 expiry, string calldata fiatSymbol, uint256 fiatAmount, uint256 fiatToTokenRate, uint256 tokenAmount) external",
  "function setWhitelist(address user, bool status) external",
  "function releaseOffer(bytes32 ref) external",
  "function pickOffer(bytes32 ref) external",
  "function releaseFund(address token1) external",
  "function createAppeal(bytes32 ref) external",
  "function resolveAppeal(bytes32 ref, bool release) external",
  "function markPaid(bytes32 ref) external",
  "function whitelist(address) view returns (bool)",
  "function blacklist(address) view returns (bool)",
  "event OfferCreated(bytes32 indexed ref, address indexed creator, address indexed counterparty, uint256 tokenAmount, address token, bool isBuy, uint32 expiry, bytes3 fiatSymbol, uint64 fiatAmount, uint64 fiatToTokenRate)"
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



// ====== Main: Create Offer ======
export async function createOffer(key: string,
  counterparty: string,
  token: string,
  fiatSymbol: string,
  fiatAmount: string,
  fiatToTokenRate: string,
  isBuy: boolean = false,
  usdtAmt: string,
  refx: string,
  contractAddress: string,
  rpcUrl: string
) {
    // Generate unique reference

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(key!, provider);
    const contract = new ethers.Contract(contractAddress!, ABI, wallet);
    const publicAddress = await wallet.getAddress();

    console.log('fiat-amount ' + fiatAmount)
    

     //const seed = `${wallet.address}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    const ref = keccak256(toUtf8Bytes(refx));
     const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    //const rateScaled = ethers.toBigInt(Math.floor(fiatToTokenRate * 1e18)); // scaled to 18 decimals

    //const fiatAmountInt = BigInt(Math.floor(fiatAmount * 1e18));  
    
    const fiatAmountInt = ethers.parseUnits(fiatAmount, 6); // scaled to 1e18
    const rateScaled =  ethers.parseUnits(fiatToTokenRate, 6);  // scaled to 1e18
    const usdtAmt2 = ethers.parseUnits(usdtAmt, 6); 
    //const DECIMALS = BigInt(18);
   //let tokenAmount1 = Number(fiatAmount) * Number(fiatToTokenRate);
   //const usdtAmt = (fiatAmountInt * rateScaled) / (10n ** 18n)
   //const usdtAmt2 = ethers.formatUnits(usdtAmt, 18)
   console.log('usdt amt ' + usdtAmt + ' ' + usdtAmt2);
   
   //(uint256(fiatAmount) * uint256(fiatToTokenRate)) / DECIMALS;

    console.log("Public address:", publicAddress);
    console.log(`\n📦 Creating offer...`);
    console.log(`Ref: ${ref}`);
    console.log(`Counterparty: ${counterparty}`);
    console.log(`Token: ${token}`);
     console.log(`TokenAmount: ${usdtAmt2}`);
    console.log(`Fiat: ${fiatAmount} ${fiatSymbol} @ rate ${fiatToTokenRate}`);
    console.log(`Fiat: ${fiatAmountInt} ${fiatSymbol} @ rate ${rateScaled}`);
    console.log('contract address: ' + contractAddress)
    
    const usdtAddress = ethers.getAddress(token); //process.env.USDC_CONTRACT_ADDRESS);
    const usdtContract = new ethers.Contract(usdtAddress, ERC20_ABI, wallet);
    console.log('usd contract: ' + usdtAddress);

    const userBalance = await usdtContract.balanceOf(publicAddress);
    const userDecimal = await usdtContract.decimals();

    const userBal2 = ethers.parseUnits(userBalance.toString(), userDecimal)
    console.log("USDT user balance " + userBalance);
    console.log("USDT user balance " + userBal2 + " " + userDecimal);
    
    console.log("USDT transfer amount " + usdtAmt2);
     console.log("USDT transfer amount " + usdtAmt);
     if(userBal2 < Number(usdtAmt))
     {
        return {success: false, message: 'Insufficient balance ' + userBal2, txId: ''};
     }

     const nativeBalance = await provider.getBalance(publicAddress);
     console.log("Native Balance:", ethers.formatEther(nativeBalance));
     if(nativeBalance <= 0.001)
     {
         return {success: false, message: 'Insufficient Gas Fee ' + nativeBalance, txId: ''};
     }

     console.log("Escrow Contract " + contractAddress);

    const approveTx = await usdtContract.approve(contractAddress, usdtAmt2);
    const tx3 = await approveTx.wait();
    console.log(tx3);
    console.log("USDT approved to spend USDT ");

    
    //const allowanceTx = await usdtContract.allowance(publicAddress,CONTRACT_ADDRESS );
   // const tx4 = await allowanceTx.wait();
    //console.log(tx4);
    //console.log(" allowance " + allowanceTx.toString() );
    //console.log("Allowance (formatted):", ethers.formatUnits(allowanceTx, 18));
    
    // Send transaction
    /*const tx1 = await contract.setWhitelist(ethers.getAddress(counterparty),true);
    const tx1res = tx1.wait();
    console.log(" tx1res " + tx1res);
    const tx2 = await contract.setWhitelist(ethers.getAddress(publicAddress),true);
    const tx2res = await tx2.wait();
    console.log(" tx2res " + tx2res);*/
    const whiteList = await contract.whitelist(publicAddress);
    console.log(' whiteList: ' + whiteList);
    if(!whiteList)
     {
         return {success: false, message: 'Address not whitelisted ' + publicAddress, txId: ''};
     }
    const blacklist = await contract.blacklist(counterparty);
    console.log(' blacklist: ' + blacklist);
    if(blacklist)
     {
         return {success: false, message: 'Address is blacklisted ' + publicAddress, txId: ''};
     }

    // Send transaction
    console.log('processing...' + isBuy)
    const tx = await contract.createOffer(
        ref,
        counterparty,
        token,
        isBuy,
        expiry,
        fiatSymbol,
        fiatAmountInt,
        rateScaled,
        usdtAmt2

    );

    console.log(`🚀 Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Mined in block ${receipt.blockNumber}`);
    decodeReceipt(receipt);

    const userBalance2 = await usdtContract.balanceOf(publicAddress);
    console.log("USDT user balance 2 " + userBalance2);
    console.log("USDT user balance 2 " + ethers.parseUnits(userBalance2.toString(), 6));

    const txDetail = await provider.getTransaction(tx.hash);
    console.log("Raw tx data:", txDetail.data);
    console.log(`\n🎉 Offer successfully created! Ref: ${ref}\n`);

    const ethBalance = await provider.getBalance(contractAddress);
    console.log(`Vault ETH balance: ${ethers.formatEther(ethBalance)} ETH`);
  
    const tokenContract = new ethers.Contract(token, ERC20_ABI, provider);
    const balance: bigint = await tokenContract.balanceOf(contractAddress);
    const decimals: number = await tokenContract.decimals();
    console.log('bal ' + balance + ' ' + decimals);
    const bal = ethers.formatUnits(balance, decimals);
    console.log(`Vault Token Balance: ${bal}`);

    return {success: true, message: txDetail, txId: tx.hash, refNo: ref  };
}



// ====== Main: Release Offer ======
export async function releaseOffer(key: string,
  refx: string, token: string, contractAddress: string,rpcUrl:string
) {
    

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(key!, provider);
    const contract = new ethers.Contract(contractAddress!, ABI, wallet);
    const publicAddress = await wallet.getAddress();

    const tokenContract = new ethers.Contract(ethers.getAddress(token), ERC20_ABI, provider);
    const balance: bigint = await tokenContract.balanceOf(contractAddress);
    const decimals: number = await tokenContract.decimals();
    console.log('bal ' + balance + ' ' + decimals);
    const bal = ethers.formatUnits(balance, decimals);
    console.log(`Vault Token Balance: ${bal}`);

    console.log("Public address:", publicAddress);
    const refNo = keccak256(toUtf8Bytes(refx));
    console.log(`\n📦 releasing offer...` + refNo);
    
  
     // Send transaction
    const tx = await contract.releaseOffer(refNo);
    //const tx = await contract.releaseFund(ethers.getAddress(token));

    console.log(`🚀 Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Mined in block ${receipt.blockNumber}`);

     const balance1: bigint = await tokenContract.balanceOf(contractAddress);
    const decimals1: number = await tokenContract.decimals();
    console.log('bal ' + balance1 + ' ' + decimals1);
    const bal1 = ethers.formatUnits(balance1, decimals1);
    console.log(`Vault Token Balance: ${bal1}`);

    //decodeData(receipt.data);


    console.log(`\n🎉 Offer successfully releas! Ref: \n`);

    return {success: true, message: receipt, txId: tx.hash, refNo: refNo  };
}

// ====== Main: Release Offer ======
export async function markOfferPaid(key: string,
  refx: string, contractAddress: string, rpcUrl: string
) {
    

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(key!, provider);
    const contract = new ethers.Contract(contractAddress!, ABI, wallet);
    const publicAddress = await wallet.getAddress();

    console.log("Public address:", publicAddress);
    const refNo = keccak256(toUtf8Bytes(refx));
    console.log(`\n📦 mark paid offer...` + refNo);
    
  
     // Send transaction
    const tx = await contract.markPaid(
        refNo);

    console.log(`🚀 Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Mined in block ${receipt.blockNumber}`);

    //decodeData(receipt.data);


    console.log(`\n🎉 Offer successfully paid! Ref: \n`);
    return {success: true, message: receipt, txId: tx.hash, refNo: refNo  };
}

// ====== Main: Release Offer ======
export async function pickOffer(key: string,
  refx: string,contractAddress: string, rpcUrl:string
) {
    

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(key!, provider);
    const contract = new ethers.Contract(contractAddress!, ABI, wallet);
    const publicAddress = await wallet.getAddress();

    console.log("Public address:", publicAddress);
    const refNo = keccak256(toUtf8Bytes(refx));
    console.log(`\n📦 pick offer...` + refNo);

    /*const usdtAddress = ethers.getAddress(token);
    const usdtContract = new ethers.Contract(usdtAddress, ERC20_ABI, wallet);

    const userBalance2: bigint = await usdtContract.balanceOf(publicAddress);
    console.log("USDT user balance 2 " + userBalance2);
     const decimals: number = await usdtContract.decimals();
     const availBalance = ethers.formatUnits(userBalance2, decimals);
    console.log("USDT user balance 2 " + availBalance + " " + tokenAmount);
    */

    /*if(Number(availBalance) < Number(tokenAmount) && isBuy)
    {
        return {success: false, message: "Insufficient token balance" }
    }*/

    /*if(isBuy)
    {
        const usdtAmt2 = ethers.parseUnits(tokenAmount, 18); 
        const approveTx = await usdtContract.approve(contractAddress, usdtAmt2);
        const tx3 = await approveTx.wait();
        console.log(tx3);
        console.log("USDT approved to spend USDT ");
    }*/
  
       // Send transaction
    const tx = await contract.pickOffer(refNo);

    console.log(`🚀 Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Mined in block ${receipt.blockNumber}`);
    console.log(`\n🎉 Offer successfully picked! Ref: \n`);
    
     return {success: true, message: receipt, txId: tx.hash, refNo: refNo  };
    
}

////{"inputs":[{"internalType":"bytes32","name":"ref","type":"bytes32"}],"name":"getOffer","outputs":[{"internalType":"address","name":"creator","type":"address"},{"internalType":"address","name":"counterparty","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"bool","name":"isBuy","type":"bool"},{"internalType":"uint32","name":"expiry","type":"uint32"},{"internalType":"bytes3","name":"fiatSymbol","type":"bytes3"},{"internalType":"uint64","name":"fiatAmount","type":"uint64"},{"internalType":"uint64","name":"fiatToTokenRate","type":"uint64"},{"internalType":"bool","name":"appealed","type":"bool"},{"internalType":"bool","name":"paid","type":"bool"},{"internalType":"bool","name":"released","type":"bool"},{"internalType":"uint256","name":"tokenAmount","type":"uint256"}],"stateMutability":"view","type":"function"}



export async function getVaultTokenBalance(token: string, contractAddr: string,rpcUrl:string) {

  console.log('contract addr ' + contractAddr);
  console.log('token addr ' + token);

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const ethBalance = await provider.getBalance(ethers.getAddress(token));
  console.log(`Vault ETH balance: ${ethers.formatEther(ethBalance)} ETH`);
  
    const tokenContract = new ethers.Contract(ethers.getAddress(token), ERC20_ABI, provider);
  const balance: bigint = await tokenContract.balanceOf(contractAddr);
  const decimals: number = await tokenContract.decimals();
  console.log('bal ' + balance + ' ' + decimals);
  const bal = ethers.formatUnits(balance, decimals);
  console.log(`Vault Token Balance: ${bal}`);

  return {success: true, balance: bal }
}

export async function getWalletBalance(token: string, publicAddress: 
    string, symbol: string, rpcUrl: string) {

  console.log('public address ' + publicAddress);
  console.log('token addr ' + token);
  const provider2 = new ethers.JsonRpcProvider(rpcUrl);

  if(symbol == 'WBNB' || symbol == 'WETH' || symbol == 'ETH' || symbol == 'BNB')
  {

    const balanceWei = await provider2.getBalance(publicAddress);
    // 🧮 Convert from Wei to BNB
    console.log(" balanceWei " + balanceWei);
     const balanceBNB = ethers.formatEther(balanceWei);
     console.log(symbol + " balance " + balanceWei);

     return {success: true, balance: balanceBNB }
  }
  else {
    
    const tokenContract = new ethers.Contract(ethers.getAddress(token), ERC20_ABI, provider2);
    const balance = await tokenContract.balanceOf(publicAddress);
    const decimals: number = await tokenContract.decimals();
    console.log( symbol + " user balance 2 " + balance);
    console.log('bal ' + balance + ' ' + decimals);
    const bal = ethers.formatUnits(balance, decimals);
    console.log(`Wallet Balance: ${bal}`);
    return {success: true, balance: bal }
  }

}

export async function updateWhiteOrBlackList(key:string,address:
     string,status: boolean, whiteOrBlack: string, contractAddress: string,rpcUrl:string) {

     // Send transaction

     console.log("contract address:", contractAddress);
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

export async function fetchOfferStatus(ref: string, contractAddress: string, rpcUrl:string) {
    

  const provider = new ethers.JsonRpcProvider(rpcUrl);

    const vaultAbi: string[] = [
  "function getOffer(bytes32 ref) view returns (address creator, address counterparty, address token, bool isBuy, uint32 expiry, bytes3 fiatSymbol, uint64 fiatAmount, uint64 fiatToTokenRate, bool appealed, bool paid, bool released, uint256 tokenAmount)"
];
    const fetchABI ='{"inputs":[{"internalType":"bytes32","name":"ref","type":"bytes32"}],"name":"getOffer","outputs":[{"internalType":"address","name":"creator","type":"address"},{"internalType":"address","name":"counterparty","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"bool","name":"isBuy","type":"bool"},{"internalType":"uint32","name":"expiry","type":"uint32"},{"internalType":"bytes3","name":"fiatSymbol","type":"bytes3"},{"internalType":"uint64","name":"fiatAmount","type":"uint64"},{"internalType":"uint64","name":"fiatToTokenRate","type":"uint64"},{"internalType":"bool","name":"appealed","type":"bool"},{"internalType":"bool","name":"paid","type":"bool"},{"internalType":"bool","name":"released","type":"bool"},{"internalType":"uint256","name":"tokenAmount","type":"uint256"}],"stateMutability":"view","type":"function"}'
   // 2️⃣ Create contract instance
  const vault = new ethers.Contract(contractAddress, vaultAbi, provider);

  // 3️⃣ Call the view function
  const refNo = keccak256(toUtf8Bytes(ref));
  const offer = await vault.getOffer(refNo);
  console.log(offer);

  // 4️⃣ Format response for readability
  const result = {
    creator: offer.creator,
    counterparty: offer.counterparty,
    token: offer.token,
    isBuy: offer.isBuy,
    expiry: Number(offer.expiry),
    fiatSymbol:  ethers.toUtf8String(offer.fiatSymbol).replace(/\0/g, ''),
    fiatAmount: offer.fiatAmount.toString(),
    fiatToTokenRate: offer.fiatToTokenRate.toString(),
    appealed: offer.appealed,
    paid: offer.paid,
    released: offer.released,
    tokenAmount: offer.tokenAmount.toString(),
  };

  console.log("📦 Offer Info:", result);
  return result;
}


async function decodeData(data: string){


    const ABI = [
    "function createOffer(bytes32,address,address,bool,uint32,string,uint64,uint64)"
    ];

    const iface = new ethers.Interface(ABI);

    const decoded = iface.decodeFunctionData("createOffer", data);
    console.log(decoded);

}

async function decodeReceipt(receipt: any) {

    const iface = new ethers.Interface(ABI);
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed.name === "OfferCreated") {
        console.log("✅ OfferCreated Event:");
        console.log({
          ref: parsed.args.ref,
          creator: parsed.args.creator,
          counterparty: parsed.args.counterparty,
          tokenAmount: parsed.args.tokenAmount.toString(),
          token: parsed.args.token,
          isBuy: parsed.args.isBuy,
          expiry: parsed.args.expiry,
          fiatSymbol: parsed.args.fiatSymbol,
          fiatAmount: parsed.args.fiatAmount.toString(),
          fiatToTokenRate: parsed.args.fiatToTokenRate.toString()
        });
      }
    } catch (e) {
      // log didn't match ABI, ignore
    }
  }
    
}