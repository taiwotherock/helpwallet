import {  ethers } from "ethers";



export async function fetchBalanceEth(walletAddress: string, rpcUrl: string) {
   
   
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

  const bal = await getBalanceEth(walletAddress,rpcUrl);

   var response = {success:true, balance: bal}; //{success:true,address: address.toString(), privateKey: privateKey, chain: 'ETH', phrase:wallet.mnemonic.phrase };
    
  return response;

  
}

async function getBalanceEth(address: string, rpcUrl: string) {
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
      
      return balanceEth;
    } catch (error) {
      throw new Error(`Failed to fetch balance: ${error}`);
    }
}
