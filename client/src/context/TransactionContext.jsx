import React, { useEffect, useState } from "react";
import { ethers } from "ethers";


import { contractABI, contractAddress } from "../utils/constants";
export const TransactionContext = React.createContext();
const { ethereum } = window;


const getEthereumContract=()=>{
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const TransactionContract= new ethers.Contract(contractAddress, contractABI, signer);

    
    
       return  TransactionContract;
  
}

export const TransactionsProvider = ({ children }) => {

  const [formData, setFormData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
  const [transactions, setTransactions] = useState([]);
  const handleChange=(e, name)=>{
    setFormData((prevState)=>({...prevState,[name]:e.target.value}));
  }
  
  const getAllTransactions= async ()=>{
    try{
      if (!ethereum) return alert("Please install MetaMask.");
      const TransactionContract= getEthereumContract();
      const availableTransactions= await TransactionContract.getAllTransactions();
      const structuredTransactions= availableTransactions.map((transaction)=>({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
          message: transaction.message,
          keyword: transaction.keyword,
          amount: parseInt(transaction.amount._hex) / (10 ** 18)
      }))
      console.log(structuredTransactions);
      console.log(availableTransactions);
      setTransactions(structuredTransactions);
    }
    catch(error){
      console.log(error);
    }
  }


 const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);

        getAllTransactions();
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfTransactionsExist = async () => {
    try {
      const TransactionContract= getEthereumContract();
      const transactionCount = await TransactionContract.getTransactionCount();

      window.localStorage.setItem("transactionCount",transactionCount)
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };

const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_requestAccounts", });

      setCurrentAccount(accounts[0]);
      window.location.reload();
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };



   
  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert("please install metamask");
      const {addressTo, amount, keyword ,message}=formData;
      const TransactionContract= getEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount);
      await ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from: currentAccount,
           to: addressTo,
          gas: "0x5208",
          value: parsedAmount._hex,
        }]
      });

      const TransactionHash = await TransactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);
      
        setIsLoading(true);
        console.log(`Loading - ${TransactionHash.hash}`);
        await TransactionHash.wait();
        setIsLoading(false);
        console.log(`Success - ${TransactionHash.hash}`);
        
        const transactionCount = await TransactionContract.getTransactionCount();
        setTransactionCount(transactionCount.toNumber());
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };




useEffect(()=>{
    checkIfWalletIsConnect();
    checkIfTransactionsExist();
},[])

    return (
        <TransactionContext.Provider value={{connectWallet,currentAccount,formData,transactions,sendTransaction,handleChange,isLoading}}>
             {children}
        </TransactionContext.Provider>
    );
}