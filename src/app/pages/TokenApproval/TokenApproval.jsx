import React from "react";
import { useRef, useContext } from "react";
import {ethers} from 'ethers'
import Web3Context from '../../context/Web3Context'
import toast from 'react-hot-toast'


const TokenApproval = () => {
  const {LiskTokenContract, TimelockContract} = useContext(Web3Context)
  const approveTokenRef = useRef();

  const approveToken = async (e) => {
    e.preventDefault();

    const amount = approveTokenRef.current.value.trim();
    if (isNaN(amount) || amount <= 0){
      toast.error("Please enter a valid positive number")

      return;
    }

    const amountToSend = ethers.parseUnits(amount, 18).toString();
    try {
      
      const transaction = await LiskTokenContract.approve(
        TimelockContract.target, amountToSend
      );

      await toast.promise(transaction.wait(),{

        loading :"Transaction is pending....",
        success: "Token Approved!!", 
        error: "Transaction failed"
      })
    } catch (error) {
      console.error("Token Approval Failed", error.message)
    }
  }



  return (
    <div className="ml-5">
      <section className="">
        <h1 className="text-center">Approve Token</h1>
        <form onSubmit={approveToken}>
          <div>
            <label htmlFor="">Token Approval:</label>
            <input type="text" ref={approveTokenRef} placeholder="Enter amount" class="px-2 py-1 border border-gray-300 rounded mr-2"/>
            <button onClick={approveToken} type="submit" className="bg-green-500 p-1 rounded">Approve</button>
          </div>

          
        </form>
      </section>
    </div>
  );
};

export default TokenApproval;