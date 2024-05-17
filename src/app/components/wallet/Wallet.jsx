



import React, { useState, useEffect } from "react";
import { connectWallet } from "../../utils/ConnectWallet";
import Web3Context from '../../context/Web3Context';
import Button from "../button/Button";
import { handleAccountChange } from "../../utils/handleAccountChange";
import { handleChainChange } from "../../utils/handleChainChange";

const Wallet = ({children}) => {
  const [state, setState] = useState({
    provider: null,
    account: null,
    TimelockContract: null,
    LiskTokenContract: null,
    chainId: null,  
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.ethereum.on('accountsChanged', () => handleAccountChange(setState));
    window.ethereum.on('chainChanged', () => handleChainChange(setState));

    return () => {
      window.ethereum.removeListener('accountsChanged', () => handleAccountChange(setState));
      window.ethereum.removeListener('chainChanged', () => handleChainChange(setState));
    };
  }, []);

  const handleWalletToggle = async () => {
    try {
      setIsLoading(true);
      if (state.selectedAccount) {
        // If already connected, disconnect wallet
        setState({
          provider: null,
          account: null,
          TimelockContract: null,
          LiskTokenContract: null,
          chainId: null,
        });
      } else {
        // If not connected, connect wallet
        const {
          provider,
          selectedAccount,
          TimelockContract,
          LiskTokenContract,
          chainId,
        } = await connectWallet();
                    console.log(
                  "Provider:", provider,
                  "selectedAccount:",selectedAccount,
                  "TimelockContract:",TimelockContract,
                  "LiskTokenContract:", LiskTokenContract,
                  "chainId:",chainId,  
            )
        setState({
          provider,
          selectedAccount,
          TimelockContract,
          LiskTokenContract,
          chainId,
        });
      }
    } catch (error) {
      console.error("Error connecting Wallet: ", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
        <div className='flex justify-end mr-10 pt-3'>
            <Button

                onClick={handleWalletToggle}
                type="button"
                label={state.selectedAccount ? "Disconnect wallet" : "Connect wallet"}
                disabled={isLoading}
            />
        </div>
        <Web3Context.Provider value={state}>{children}</Web3Context.Provider>
        {isLoading && <p>Loading...</p>}
    </div>
  );
};

export default Wallet;
