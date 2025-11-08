
import { ethers } from "ethers";
import { Wallet,HDNodeWallet, JsonRpcProvider, Contract, keccak256, toUtf8Bytes } from "ethers";



export async function createWalletWithPhraseEth(chain: string, symbol: string) {
   
    const wallet = Wallet.createRandom(); //.fromPhrase(mnemonic);

    
    console.log("Mnemonic word :" + wallet.mnemonic.phrase);
    console.log("Mnemonic pwd:" + wallet.mnemonic.password);

    //const mnemonic = Mnemonic.fromPhrase(seedPhrase);
    const hdWalletNode = HDNodeWallet.fromMnemonic(wallet.mnemonic, "m/44'/60'/0'/0");
    const hdWallet = hdWalletNode.derivePath('0');
    const address = hdWallet.address;
    const privateKey = hdWallet.privateKey.toString();
    console.log("Address:" + address);
    console.log("privateKey:" + privateKey);

    var response = {success:true,address: address.toString(), privateKey: privateKey, 
        chain: chain, phrase:wallet.mnemonic.phrase, symbol: symbol };
    
    return response;
  
}

export async function ethGasBalanceByKey(key: string,
  rpcUrl: string) {
    // Generate unique reference

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(key!, provider);
    const publicAddress = await wallet.getAddress();
    console.log("Public address:", publicAddress);
    
    const balanceWei = await provider.getBalance(publicAddress);
    console.log('balanceWei: ' + balanceWei.toString())
    const balanceEth = Number(ethers.formatEther(balanceWei.toString()));
    return {success: true, message: publicAddress, balance:balanceEth  };
    
  }