import {  ethers } from "ethers";



export async function fetchTokenBalance(tokenAddress: string, walletAddress:
   string, rpcUrl: string, decimalNo: Number) {
   
   
// Set the Ethereum address you want to check the balance of
//const address = walletAddress; // '0x98435DDA1EAAeD248975e87B8ab743866C840205';

// Set the timestamp you want to check the balance at (in Unix time)
const timestamp = Math.floor(Date.now() / 1000);

// Set the contract address and ABI of the ERC-20 token you want to check the balance of
//const tokenAddress = '0x4D6DEEE55785f033d00005Ade08D035B1537A5d9';
const tokenAbi = ['function balanceOf(address) view returns (uint256)'];

// Create an Ethereum provider using Infura
 //const provider = ethers.JsonRpcProvider.bind.JsonRpcProvider(rpcUrl);
 const provider = new ethers.JsonRpcProvider(rpcUrl) //.JsonRpcProvider(

// Get the ETH balance of the address at the specified timestamp
//const ethBalancePromise = provider.getBalance(address, timestamp);

// Get the balance of the ERC-20 token at the specified timestamp
  const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);
  const tokenBalancePromise = await tokenContract.balanceOf(walletAddress);
  console.log("Balance:", ethers.formatUnits(tokenBalancePromise, 6));
  console.log("Balance 3:", ethers.formatUnits(tokenBalancePromise, 6));
  console.log(tokenBalancePromise);

  //const bal = await getBalanceEth(walletAddress,rpcUrl);

   var response = {success:true, balance: ethers.formatUnits(tokenBalancePromise, 6) }; //{success:true,address: address.toString(), privateKey: privateKey, chain: 'ETH', phrase:wallet.mnemonic.phrase };
    
  return response;

  
}

export async function fetchBalanceEth(address: string, rpcUrl: string) {
    try {
      // Validate the address format
      if (!ethers.isAddress(address)) {
        throw new Error('Invalid Ethereum address format');
      }

      //Promise<string>

      // Get balance in wei
      const provider = new ethers.JsonRpcProvider(rpcUrl);

      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();

      console.log('network: ' + network.chainId);
      console.log('network: ' + network.name);
      console.log('blockNumber: ' + blockNumber)
      

      const balanceWei = await provider.getBalance(address);
      console.log('balanceWei: ' + balanceWei)
      
      // Convert wei to ether
      const balanceEth = ethers.formatEther(balanceWei);

      console.log('balanceEth: ' + balanceEth)

      return {success:true, balance: balanceEth };
      
      //return balanceEth;
    } catch (error) {
      throw new Error(`Failed to fetch balance: ${error}`);
    }
}

export async function fetchTransactionDetailEth(txId: string, symbol:string, chain: string, rpcUrl: string) {
  try {
 
    console.log('txId: ' + txId);
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const txReceipt = await provider.send("eth_getTransactionByHash", [
      txId,
    ]);

    console.log(txReceipt);
    //const gasDecimal = parseInt(gasHex, 16);
    console.log('gas fee ' + BigInt(txReceipt.gasPrice).toString())
    console.log('input amt ' +txReceipt.input);
    const amt = decodeUSDCAmountFromInput(txReceipt.input).toString()
    console.log('amt ' +  amt)

    return {success:true,chain:chain,
      txId: txId, fee: BigInt(txReceipt.gasPrice).toString(),
       toAddress: txReceipt.to,
      fromAddress: txReceipt.from,
      blockRefNo: txReceipt.blockHash,
      symbol: symbol,
      amount: amt, blockNumber: txReceipt.blockNumber,
      blockTimestamp: '',
      contractAddress: '', crDr:'',status: 'SUCCESS'
     };
   
    
  } catch (error) {
    throw new Error(`Failed to fetch transaction : ${error}`);
  }
}

/**
 * Decodes the USDC amount from an ERC-20 transfer transaction input field.
 * @param input The transaction input data (hex string)
 * @param decimals Number of decimals for the token (USDC = 6)
 * @returns The amount in normal units (e.g., 10.5 USDC)
 */
 export function extractAmount(input: string, decimals: number = 6): number {
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


export function decodeUSDCAmountFromInput(input: string): string | null {
  
  const TRANSFER_SIG = "a9059cbb"; // ERC-20 transfer(address,uint256)

  // Find where the transfer call starts
  const idx = input.indexOf(TRANSFER_SIG);
  if (idx === -1) return null; // No transfer found

  // Start right after "a9059cbb"
  const dataStart = idx + TRANSFER_SIG.length;

  // Extract recipient (ignore for amount)
  const recipient = "0x" + input.slice(dataStart, dataStart + 64).slice(24); // last 40 chars = address

  // Extract amount (next 32 bytes = 64 hex chars)
  const amountStart = dataStart + 64;
  const amountHex = "0x" + input.slice(amountStart, amountStart + 64);

  // Convert raw amount → USDC (6 decimals)
  const raw = BigInt(amountHex);
  const human = ethers.formatUnits(raw, 6); // USDC uses 6 decimals

  console.log("Recipient:", recipient);
  console.log("Raw Amount:", raw.toString());
  console.log("USDC Amount:", human);

  return human;
}



