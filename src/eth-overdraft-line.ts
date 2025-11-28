import { ethers } from "ethers";
import { Wallet, JsonRpcProvider, Contract, keccak256, toUtf8Bytes } from "ethers";
import dotenv from 'dotenv';


dotenv.config();


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
const DECIMALS = ethers.parseUnits("1", 18); // For scaling rates



// ====== Main: Deposit into vault ======
export async function ethSetVaultAdmin(key: string,
  address: string,
  rpcUrl: string,
  contractAddress: string
 ) {
    // Generate unique reference

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(key!, provider);
    const contract = new ethers.Contract(contractAddress!, ABI, wallet);
    const publicAddress = await wallet.getAddress();

   
    console.log("Public address:", publicAddress);
    console.log('contract address: ' + contractAddress)
    
    // Send transaction
    //function depositToVault(address token, uint256 amount) external
    console.log('processing...' + address)
    const tx = await contract.setVaultAdmin(address); /*, {
      maxFeePerGas: ethers.parseUnits('40', 'gwei'),          // increase from your last
      maxPriorityFeePerGas: ethers.parseUnits('3', 'gwei'),
    });*/
       

    console.log(`🚀 Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Mined in block ${receipt.blockNumber}`);

    return {success: true, message: 'SUCCESS', txId: tx.hash  };
}

// ====== Main: Deposit into vault ======
export async function ethOdDepositCollateral(key: string,
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
    const tx = await contract.depositCollateral(amountInt) /*, {
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



function formatTimestamp(timestamp: number): string {
  // Convert seconds → milliseconds
  const date = new Date(timestamp * 1000);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1); // Months start from 0
  const year = date.getFullYear();

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

