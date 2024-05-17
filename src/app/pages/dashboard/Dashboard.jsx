import styles from '../../../../styles/Home.module.css';
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react';
import { connectWallet } from "../../utils/ConnectWallet";
import Link from 'next/link';
import { ethers } from "ethers";
import { useContext } from "react";
import Web3Context from "../../context/Web3Context";
import TokenApproval from '../TokenApproval/TokenApproval';




export default function Home() {


    const [walletAddress, setWalletAddress] = useState(null);
    const [walletBalance, setWalletBalance] = useState(null);
    const [walletSymbol, setWalletSymbol] = useState(null);
    const { TimelockContract, selectedAccount } = useContext(Web3Context);
    const autoDepositAmountRef = useRef();
    const autoWithdrawAmountRef = useRef();
    const autoDepositTimeRef = useRef();
    const autoWithdrawTimeRef = useRef();
    const currentTime = new Date();
    const [balanceVal, setBalanceVal] = useState('0');


    const automatedDeposit = async (e) => {
        e.preventDefault();

        const inputedTime = autoDepositTimeRef.current.value.trim();
        const [hours, minutes] = inputedTime.split(":");
        const inputTimeDate = new Date();
        inputTimeDate.setHours(hours);
        inputTimeDate.setMinutes(minutes);
        inputTimeDate.setSeconds(0);

        const timeDifference = inputTimeDate.getTime() - currentTime.getTime();
        const timeDifferenceInSeconds = Math.abs(timeDifference / 1000);

        if (timeDifferenceInSeconds <= 0) {
            toast.error("Time must be in the future");
            return;
        }

        const amount = autoDepositAmountRef.current.value.trim();
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid positive number");
            return;
        }

        const timeDifferenceInSecondsToString = Math.round(
            timeDifferenceInSeconds
        ).toString();

        const amountToDeposit = ethers.parseUnits(amount, 18).toString();
        try {
            const transaction = await TimelockContract.setAutoDeposit(
                amountToDeposit,
                timeDifferenceInSecondsToString
            );
            await toast.promise(transaction.wait(), {
                loading: "Transaction is Pending...",
                success: "Amount Deposited Successfully",
                error: "Transaction Failed",
            });
            autoDepositAmountRef.current.value = "";
            autoDepositTimeRef.current.value = "";
            setIsReload(!isReload);
        } catch (error) {
            toast.error("Auto Deposit Failed");
            console.error(error.message);
        }
    };

    const automatedWithdrawal = async (e) => {
        e.preventDefault();

        const inputedTime = autoWithdrawTimeRef.current.value.trim();
        const [hours, minutes] = inputedTime.split(":");
        const inputTimeDate = new Date();
        inputTimeDate.setHours(hours);
        inputTimeDate.setMinutes(minutes);
        inputTimeDate.setSeconds(0);

        const timeDifference = inputTimeDate.getTime() - currentTime.getTime();
        const timeDifferenceInSeconds = Math.abs(timeDifference / 1000);

        if (timeDifferenceInSeconds <= 0) {
            toast.error("Time must be in the future");
            return;
        }

        const amount = autoWithdrawAmountRef.current.value.trim();
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid positive number");
            return;
        }

        const timeDifferenceInSecondsToString = Math.round(
            timeDifferenceInSeconds
        ).toString();
        console.log(timeDifferenceInSecondsToString);

        const amountToWithdraw = ethers.parseUnits(amount, 18).toString();
        try {
            const transaction = await TimelockContract.setAutoWithdraw(
                amountToWithdraw,
                timeDifferenceInSecondsToString
            );
            await toast.promise(transaction.wait(), {
                loading: "Transaction is Pending...",
                success: "Amount Deposited Successfully",
                error: "Transaction Failed",
            });
            autoWithdrawAmountRef.current.value = "";
            autoWithdrawTimeRef.current.value = "";
            setIsReload(!isReload);
        } catch (error) {
            toast.error("Auto Deposit Failed");
            console.error(error.message);
        }
    };

    useEffect(() => {
        const fetchBalanceInfo = async () => {
            try {
                const balanceValueWei = await TimelockContract.getAutoBalance(selectedAccount);
                const balanceValueEth = ethers.formatUnits(balanceValueWei, 18).toString();
                const roundedBalance = parseFloat(balanceValueEth).toFixed(2)
                setBalanceVal(roundedBalance)

            } catch (error) {
                toast.error("Error Fetching Balance")
                console.error(error.message)
            }
        }
        const interval = setInterval(() => {
            TimelockContract && fetchBalanceInfo();
        }, 2000)
        return () => clearInterval(interval)
    }, [TimelockContract, selectedAccount])


    useEffect(() => {
        const fetchData = async () => {
            try {
                const walletData = await connectWallet();
                setWalletAddress(walletData.selectedAccount);

                setWalletBalance(walletData.balanceInWei);
                setWalletSymbol(walletData.symbol);
            } catch (error) {
                console.error("Error connecting wallet:", error);
            }
        };

        fetchData();
    }, []);

    const loading = () => {
        return (
            <h1>This may take a few seconds</h1>
        )
    }

    //RenderThisIfConnected
    const renderConnected = () => {
        return (
            <>
                <strong>Wallet Address {walletAddress}</strong>
                <strong className='mb-5'>Total Balance Wallet : {walletBalance} {walletSymbol}{" "}</strong>
                <TokenApproval/>
                <div className="innerBox">
                    <form onSubmit={automatedDeposit}>
                        <label>
                            Deposit :
                            <input
                                id="deposit"
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder='Amount Of LSK'
                                class="px-2 py-1 border border-gray-300 rounded mr-2 my-3"
                                ref={autoDepositAmountRef}

                            >
                            </input>
                        </label>
                        <div>
                            <label htmlFor="">Time to deposit :</label>
                            <input class="px-4 py-2 text-black rounded cursor-pointer mr-2"
                             ref={autoDepositTimeRef} 
                             type="time" 
                             defaultValue="00:00" />
                        </div>
                        <button
                            className="border-gray-500 border-2 my-3 ml-2 p-1 px-2 py-2"
                            onClick={automatedDeposit}
                        >
                            Schedule Deposit
                        </button>
                    </form>
                    <form onSubmit={automatedWithdrawal}>
                        <div>
                            <label htmlFor="">Amount to withdraw:</label>
                            <input
                                ref={autoWithdrawAmountRef}
                                type="text"
                                placeholder="Enter amount"
                                class="px-2 py-1 border border-gray-300 rounded mr-2 my-3"

                            />
                        </div>

                        <div>
                            <label htmlFor="">Time to withdraw :</label>
                            <input className='px-4 py-2 text-black rounded cursor-pointer mr-2' ref={autoWithdrawTimeRef} type="time" defaultValue="00:00" />
                        </div>

                        <button
                             className="border-gray-500 border-2 my-3 ml-2 p-1 mt-2 px-2 py-2"
                            onClick={automatedWithdrawal}
                        >
                            Schedule Withdraw
                        </button>
                    </form>
                    <p className='mt-3 ml-3'>Balance: {balanceVal}</p>
                </div>

            </>
        )

    }






    return (
        <>
            <div className="container">
                <div className="flexBox">
                    <h1 className='text-xl font-bold mb-5 mt-20'>Welcome Crystal!!</h1>
                    Come Drop Off YOUR CRYPTO
                    <Image className='my-5' src="/lockImg.jpg" alt='chestimage' width={200} height={200}></Image>
                    {renderConnected()}
                </div>


            </div>

        </>
    )
}