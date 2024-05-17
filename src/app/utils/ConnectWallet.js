
import { ethers, Contract } from "ethers";
import { timelockAddress, timelock, toksAddress, liskToken } from "../context/constant";
import Web3 from "web3";



export const connectWallet = async () => {
  try {
    let [signer, TimelockContract, LiskTokenContract, provider, chainId] = [
      null,
      null,
      null,
      null,
      null,
    ];

    if (window.ethereum === null) {
      throw new Error("Metamask is not installed");
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const selectedAccount = accounts[0];

    let chainIdHex = await window.ethereum.request({
      method: "eth_chainId",
    });
    chainId = parseInt(chainIdHex, 16);

    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    const toksContractAddress = toksAddress;
    LiskTokenContract = new Contract(toksContractAddress, liskToken, signer);

    const timelockContractAddress = timelockAddress;
    TimelockContract = new Contract(timelockContractAddress, timelock, signer);


    const web3 = new Web3(window.ethereum);
    const tokenContract = new web3.eth.Contract(liskToken, toksAddress);

    const balance = await tokenContract.methods
      .balanceOf(selectedAccount)
      .call();
      const balanceInWei = ethers.formatUnits(balance.toString(), 18);

    const symbol = await tokenContract.methods.symbol().call();

    console.log("Selected Account:", selectedAccount);
    console.log("Token Balance:", balanceInWei);
    console.log("Token Symbol:", symbol);


    return {
      provider,
      selectedAccount,
      LiskTokenContract,
      balanceInWei,
      TimelockContract,
      symbol,
      chainId,
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

