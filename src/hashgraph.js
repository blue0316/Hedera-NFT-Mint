import { HashConnect } from "hashconnect";
import axios from "axios";
import {
    AccountAllowanceApproveTransaction,
    AccountId,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    ContractId,
    TokenId,
} from '@hashgraph/sdk';
import coindata from "./constants"

import { apiBaseUrl, NFTCreator, sauceInu, sauceInuFee, network } from "./config/config";

const hashconnect = new HashConnect(true);
const contractId = ContractId.fromString(NFTCreator);
let saveData = {
    topic: "",
    pairingString: "",
    encryptionKey: "",
    savedPairings: []
}
const appMetaData = {
    name: "SauceFlip",
    description: "A HBAR wallet",
    icon: "https://wallet.hashpack.app/assets/favicon/favicon.ico",
    url:""
}



export const pairClient = async () => {
    hashconnect.pairingEvent.on(pairingData => {
        console.log(pairingData, "PPP")
        saveData.savedPairings.push(pairingData);
    })
    let initData = await hashconnect.init(appMetaData, network, false);
    saveData = initData;
    if(initData.savedPairings.length === 0) {
        hashconnect.connectToLocalWallet();
    } else {
        console.log("already paired")
    }
    console.log("SAVED DATA", saveData)
    return saveData
}

export const getAllowance = async (ownerId) => {
    const { data } = await axios.get(apiBaseUrl+"accounts/"+ownerId+"/allowances/tokens?limit=10&order=desc&spender.id="+NFTCreator+"&token.id="+sauceInu);
    if(data&&data.allowances &&data.allowances.length>0) return data.allowances[0].amount_granted;
    else return 0;
}

export const approveSauceInu = async (qty) => {
    let provider = hashconnect.getProvider(network, saveData.topic, saveData.savedPairings[0].accountIds[0]);
    let signer = hashconnect.getSigner(provider);
    const balance = (await provider.getAccountBalance(signer.getAccountId())).tokens.get(sauceInu);
    const tokenAllowance = await getAllowance(saveData.savedPairings[0].accountIds[0]);
    const amount = qty*sauceInuFee;
    if(balance<amount) return false;
    else if(tokenAllowance<amount) {
        const allowanceTx = new AccountAllowanceApproveTransaction()
            .approveTokenAllowance(TokenId.fromString(sauceInu), signer.getAccountId(), AccountId.fromString(contractId.toString()), 10000000000*10**7)
            .freezeWithSigner(signer);
        const allowanceSign = await (await allowanceTx).signWithSigner(signer);
        const allowanceSubmit = await allowanceSign.executeWithSigner(signer);
        if(allowanceSubmit) return true;
        else return false;
    }
    return true;
}
  
export const createNFT = async (name, symbol, maxSupply) => {
    let provider = hashconnect.getProvider(network, saveData.topic, saveData.savedPairings[0].accountIds[0]);
    let signer = hashconnect.getSigner(provider);
    try {
        const createNFTTx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(1000000)
                    .setPayableAmount(20)
                    .setFunction("createNft",
                      new ContractFunctionParameters()
                      .addString(name)
                      .addString(symbol)
                      .addString("")
                      .addInt64(maxSupply)
                      .addInt64(7000000))
                    .freezeWithSigner(signer);
        const result = await createNFTTx.executeWithSigner(signer);
        return result;
    } catch (error) {
        console.log(error, "error")
    }
}

export const createNFT1 = async (address) => {
    let provider = hashconnect.getProvider(network, saveData.topic, saveData.savedPairings[0].accountIds[0]);
    let signer = hashconnect.getSigner(provider);
    try {
        const createNFTTx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(1000000)
                    .setPayableAmount(20)
                    .setFunction("createNonFungibleTokenPublic",
                      new ContractFunctionParameters()
                      .addAddress(address))
                    .freezeWithSigner(signer);
        const result = await createNFTTx.executeWithSigner(signer);
        return result;
    } catch (error) {
        console.log(error, "error")
    }
}

export const getTokenAddress = async (txHash) => {
        const arr = txHash.split("@");
        const secPart = arr[1].split(".");
        const formattedStr = arr[0]+"-"+secPart[0]+"-"+secPart[1];
        console.log(formattedStr, "fomartedSTR");
        const { data } = await axios.get(apiBaseUrl+"contracts/results/"+formattedStr);
        return data;
}

export const mintNFT = async (tokenAddr, qty, metadata) => {
    let provider = hashconnect.getProvider(network, saveData.topic, saveData.savedPairings[0].accountIds[0]);
    let signer = hashconnect.getSigner(provider);
    try {
        const mintNFTTx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(1000000)
                    .setFunction("mintNft",
                      new ContractFunctionParameters()
                      .addAddress(tokenAddr)
                      .addInt64(qty)
                      .addBytesArray([Buffer.from(metadata)]))
                    .freezeWithSigner(signer);
        const result = await mintNFTTx.executeWithSigner(signer);
        return result;
    } catch (error) {
        console.log(error, "error")
    }
    
    
}

export const flipToken = async (tokenIndex, amountIndex, option) => {
    
    let provider = hashconnect.getProvider(network, saveData.topic, saveData.savedPairings[0].accountIds[0]);
    let signer = hashconnect.getSigner(provider);
    const beforeBal = (await provider.getAccountBalance(signer.getAccountId())).tokens.get(coindata[tokenIndex].address);
    console.log(beforeBal, "beforeBal")
    const totalAmount = sauceInu*1.025;
    let targetTokenId = TokenId.fromString(coindata[tokenIndex].address);
    const tokenAllowance = await getAllowance(targetTokenId.toString(), signer.getAccountId().toString(), contractId.toString());
    if(tokenAllowance<totalAmount) {
        const allowanceTx = new AccountAllowanceApproveTransaction()
            .approveTokenAllowance(targetTokenId, signer.getAccountId(), AccountId.fromString(contractId.toString()), coindata[tokenIndex].maxSupply)
            .freezeWithSigner(signer);
        const allowanceSign = await (await allowanceTx).signWithSigner(signer);
        const allowanceSubmit = await allowanceSign.executeWithSigner(signer);
    }

    const flipTx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(100000)
                    .setFunction("flip",
                      new ContractFunctionParameters()
                      .addBool(option)
                      .addUint256(tokenIndex)
                      .addUint256(amountIndex))
                    .freezeWithSigner(signer);
    await flipTx.executeWithSigner(signer)
    const afterBalBal = (await provider.getAccountBalance(signer.getAccountId())).tokens.get(coindata[tokenIndex].address);
    console.log(afterBalBal, "beforeBal");
    console.log(afterBalBal.compare(beforeBal), "beforeBal")
    return afterBalBal.compare(beforeBal) == 1;
}

export const flipHBar = async (selectedAmountIndex, selectedOption) => {
    let provider = hashconnect.getProvider(network, saveData.topic, saveData.savedPairings[0].accountIds[0]);
    let signer = hashconnect.getSigner(provider);
    const beforeBal = (await provider.getAccountBalance(signer.getAccountId())).hbars.toBigNumber();
    const amount = coindata[3].amounts[selectedAmountIndex];
    const totalAmount = amount*1.025;
    if(saveData.savedPairings.length==0) return;
    const flipTx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(100000)
                    .setPayableAmount(totalAmount)
                    .setFunction("flipForHBar",
                      new ContractFunctionParameters()
                      .addBool(selectedOption)
                      .addUint256(selectedAmountIndex))
                    .freezeWithSigner(signer);
    await flipTx.executeWithSigner(signer)
    const afterBal = (await provider.getAccountBalance(signer.getAccountId())).hbars.toBigNumber();
    return afterBal.comparedTo(beforeBal) == 1;
}

export const setAdminWallet = async () => {
    let provider = hashconnect.getProvider(network, saveData.topic, saveData.savedPairings[0].accountIds[0]);
    let signer = hashconnect.getSigner(provider);
    const flipTx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(100000)
                    .setFunction("takeToken",
                      new ContractFunctionParameters()
                      .addUint256(0))
                    .freezeWithSigner(signer);
    await flipTx.executeWithSigner(signer)
}

export const disconnect = async () => {
    localStorage.clear();
    //await hashconnect.disconnect(saveData.topic);
}
