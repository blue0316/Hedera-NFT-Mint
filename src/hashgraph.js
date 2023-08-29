import { HashConnect } from "hashconnect";
import axios from "axios";
import {
    TokenAssociateTransaction,
    AccountAllowanceApproveTransaction,
    AccountId,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    ContractId,
    CustomFixedFee,
    CustomRoyaltyFee,
    TokenId,
    Hbar,
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    PublicKey,
    Client,
    Key,
    PrivateKey,
    TokenUpdateTransaction,
    ContractInfoQuery
} from '@hashgraph/sdk';
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

const getAccountInfo = async (account_id) => {
    const {data} = await axios.get(apiBaseUrl+"accounts/"+account_id);
    return data;
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

export const shouldApprove = async (qty) => {
    let provider = hashconnect.getProvider(network, saveData.topic, saveData.savedPairings[0].accountIds[0]);
    let signer = hashconnect.getSigner(provider);
    const tokenAllowance = await getAllowance(saveData.savedPairings[0].accountIds[0]);
    const amount = qty*sauceInuFee;
    if(tokenAllowance<amount) return true;
    return false;
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
                      .addInt64(7000000)
                      .addBytes32Array()
                      )
                    .freezeWithSigner(signer);
        const result = await createNFTTx.executeWithSigner(signer);
        return result;
    } catch (error) {
        console.log(error, "error")
    }
}

export const createNFTWithFees = async (name, symbol, maxSupply, fallback_fee, royalty_fee) => {
    console.log(fallback_fee, royalty_fee);
    // let provider = hashconnect.getProvider(network, saveData.topic, saveData.savedPairings[0].accountIds[0]);
    // let signer = hashconnect.getSigner(provider);
    // try {
    //     const createNFTTx = await new ContractExecuteTransaction()
    //                 .setContractId(contractId)
    //                 .setGas(1000000)
    //                 .setPayableAmount(20)
    //                 .setFunction("createNft",
    //                   new ContractFunctionParameters()
    //                   .addString(name)
    //                   .addString(symbol)
    //                   .addString("")
    //                   .addInt64(maxSupply)
    //                   .addInt64(7000000)
    //                   .addBytes32Array()
    //                   )
    //                 .freezeWithSigner(signer);
    //     const result = await createNFTTx.executeWithSigner(signer);
    //     return result;
    // } catch (error) {
    //     console.log(error, "error")
    // }
}

export const createTokenWithJs = async (name, symbol, maxSupply, royaltyFees, fallback_fee) => {
    let provider = hashconnect.getProvider(network, saveData.topic, saveData.savedPairings[0].accountIds[0]);
    let signer = hashconnect.getSigner(provider);
    const { key } = await getAccountInfo(saveData.savedPairings[0].accountIds[0]);
    const _publicKey = PublicKey.fromString(key.key)
    try {
        let customFees = [];
        for(var i=0; i<royaltyFees.length; i++) {
            console.log(royaltyFees[i]);
            let fee = await new CustomRoyaltyFee()
            .setNumerator(parseInt(royaltyFees[i].fee))
            .setDenominator(100)
            .setFeeCollectorAccountId(royaltyFees[i].royalty_account)
            .setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(fallback_fee)));
            customFees.push(fee);
        }
        let tokenCreateTx = await new TokenCreateTransaction()
            .setTokenName(name)
            .setTokenSymbol(symbol)
            .setTokenType(TokenType.NonFungibleUnique)
            .setDecimals(0)
            .setInitialSupply(0)
            .setMaxTransactionFee(new Hbar(100))
            .setTreasuryAccountId(signer.getAccountId())
            .setSupplyType(TokenSupplyType.Finite)
            .setMaxSupply(maxSupply)
            .setSupplyKey(_publicKey)
            .setAdminKey(_publicKey)
            .setAutoRenewAccountId(signer.getAccountId());
        if(customFees.length>0) {
            tokenCreateTx = await tokenCreateTx.setCustomFees(customFees);
        }
        const freezedTx = await tokenCreateTx.freezeWithSigner(signer);
        const signedTx = await freezedTx.signWithSigner(signer);
        const submitTx = await signedTx.executeWithSigner(signer);
        const _receipt = await provider.getTransactionReceipt(submitTx.transactionId);
        
        const tokenId = _receipt.tokenId;
        return tokenId.toString();
    } catch (error) {
        console.log(error, "ERRR");
    }
}

export const updateTokenSupplyKey = async (tokenId, supplyKey) => {
    let provider = hashconnect.getProvider(network, saveData.topic, saveData.savedPairings[0].accountIds[0]);
    let signer = hashconnect.getSigner(provider);
    try {
        const transaction = await new TokenUpdateTransaction()
            .setTokenId(tokenId)
            .setSupplyKey(supplyKey)
            .freezeWithSigner(signer);
        const signTx = await transaction.signWithSigner(signer);
        const transactionId = await signTx.executeWithSigner(signer);
        return transactionId;
    } catch (error) {
        console.log(error, "STEPPPP")
    }
    
}

export const associateToken = async (tokenId) => {
    let provider = hashconnect.getProvider(network, saveData.topic, saveData.savedPairings[0].accountIds[0]);
    let signer = hashconnect.getSigner(provider);
    try {
        const transaction = await new TokenAssociateTransaction()
            .setAccountId(saveData.savedPairings[0].accountIds[0])
            .setTokenIds([tokenId])
            .freezeWithSigner(signer);
        const signTx = await transaction.signWithSigner(signer);
        const transactionId = await signTx.executeWithSigner(signer);
        return transactionId;
    } catch (error) {
        console.log(error, "STEPPPP")
    }
    
}

export const getTokenAddress = async (txHash) => {
        const arr = txHash.split("@");
        const secPart = arr[1].split(".");
        const formattedStr = arr[0]+"-"+secPart[0]+"-"+secPart[1];
        const { data } = await axios.get(apiBaseUrl+"contracts/results/"+formattedStr);
        return data;
}

export const mintNFT = async (tokenAddr, qty, metadata) => {
    console.log(tokenAddr, qty, metadata);
    let provider = hashconnect.getProvider(network, saveData.topic, saveData.savedPairings[0].accountIds[0]);
    let signer = hashconnect.getSigner(provider);
    try {
        const mintNFTTx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(10000000)
                    .setFunction("mintNft",
                      new ContractFunctionParameters()
                      .addAddress(tokenAddr)
                      .addInt64(qty)
                      .addBytesArray([Buffer.from(metadata)]))
                    .freezeWithSigner(signer);
        const signedTx = await mintNFTTx.signWithSigner(signer);
        const result = await signedTx.executeWithSigner(signer);
        return result;
    } catch (error) {
        console.log(error, "error")
    }
}

export const transferNFT = async (tokenAddr, receiver, serial) => {
    let provider = hashconnect.getProvider(network, saveData.topic, saveData.savedPairings[0].accountIds[0]);
    let signer = hashconnect.getSigner(provider);
    try {
        const transferNFTTx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(1000000)
                    .setFunction("transferNft",
                      new ContractFunctionParameters()
                      .addAddress(tokenAddr)
                      .addAddress(receiver)
                      .addInt64(serial))
                    .freezeWithSigner(signer);
        const result = await transferNFTTx.executeWithSigner(signer);
        return result;
    } catch (error) {
        console.log(error, "error")
    }
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
