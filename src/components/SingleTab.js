import React, { useState } from 'react';
import ImageUploading from 'react-images-uploading';
import axios from 'axios';
//import { storeNFT } from '../services/ipfs';
import { base64ToArrayBuffer, getAllowance } from '../services/helpers';
import { NFTStorage, File } from 'nft.storage'
import { ipfskey } from '../config/config';
import { createNFT } from '../hashgraph';

function SingleTab() {
    const [images, setImages] = useState([]);
    const [name, setName] = useState(undefined);
    const [description, setDescription] = useState(undefined);
    const [creator, setCreator] = useState(undefined);
    const [quantity, setQuantity] = useState(undefined);
    const [tokenName, setTokenName] = useState(undefined);
    const [symbol, setSymbol] = useState(undefined);
    const [fallbackFee, setFallbackFee] = useState(undefined);
    const [numRoyaltyAccs, setNumRoyaltyAccs] = useState(undefined);
    const [numAttributes, setNumAttributes] = useState(undefined);
    const [royaltyAccs, setRoyaltyAccs] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [minting, setMinting] = useState(false);

    const onChange = (imageList) => {
        setImages(imageList);
    };
    const updateNumAttributes = (value) => {
        if(parseInt(value)<0) return;
        setNumAttributes(value);
        let newArr = new Array(parseInt(value)).fill({trait_type:"", value: ""});
        setAttributes(newArr);
    }
    const updateAttributes = (index, type, value) => {
        const newValues = attributes.map((item, i) => {
            return i === index ? type=="trait_type"?{trait_type: value, value: item.value}:{trait_type: item.trait_type, value: value} : item;
        });
        setAttributes(newValues);
    }
    const updateNumRoyaltyAccs = (value) => {
        if(parseInt(value)<0) return;
        setNumRoyaltyAccs(value);
        let newArr = new Array(parseInt(value)).fill({royalty_account:"", fee: ""});
        setRoyaltyAccs(newArr);
    }
    const updateRoyaltyAccs = (index, type, value) => {
        const newValues = royaltyAccs.map((item, i) => {
            return i === index ? type=="royalty_account"?{royalty_account: value, fee: item.value}:{royalty_account: item.royalty_account, fee: value} : item;
        });
        setRoyaltyAccs(newValues);
    }
    
    const mintNFT = async () => {
        // if(images.length==0) {
        //     alert("please select image")
        //     return;
        // }
        if(name==undefined || tokenName==undefined || symbol==undefined) { alert("Please enter required fields"); return; }
        // const imageData = base64ToArrayBuffer(images[0]["data_url"]);
        // const file = new File([imageData], images[0].file.name, { type: images[0].file.type });
        // const nftstorage = new NFTStorage({ token: ipfskey })
        // const response  = await nftstorage.store({
        //     image: file,
        //     type: images[0].file.type,
        //     name,
        //     description,
        //     creator,
        //     format: 'HIP412@2.0.0',
        //     attributes,
        //     properties:{token_name:tokenName, symbol, fee:royaltyAccs}
        // });
        //console.log(response)

        await createNFT(tokenName, symbol, 10000)
        //console.log(`https://ipfs.io/ipfs/${ipnft}/metadata.json`)
    }

    return (
        <>
            <ImageUploading
                value={images}
                onChange={onChange}
                maxNumber={10}
                dataURLKey="data_url"
            >
                {({
                imageList,
                onImageUpload,
                onImageUpdate,
                }) => (
                <div className="upload__image-wrapper">
                    {imageList.length==0 && <button className='flip-button' onClick={onImageUpload}> upload image</button>}
                    {imageList.length==1 && <img className='image-upload' src={imageList[0]["data_url"]} onClick={imageList.length==0 ? onImageUpload : () => onImageUpdate(0)} alt="" width="300" />}
                </div>
                )}
            </ImageUploading>
            <div className='box-container'>
                <input className='text-input' type='text' placeholder='Name (required)' onChange={(e) => setName(e.target.value)} value={name} />
            </div>
            <div className='box-container'>
                <input className='text-input' type='text' placeholder='Description' onChange={(e) => setDescription(e.target.value)} value={description} />
            </div>
            <div className='box-container'>
                <input className='text-input' type='text' placeholder='Creator' onChange={(e) => setCreator(e.target.value)} value={creator} />
            </div>
            <div className='box-container'>
                <input className='text-input' type='number' placeholder='Quantity' onChange={(e) => setQuantity(e.target.value)} value={quantity}/>
            </div>
            <div className='box-container'>
                <input className='text-input' type='text' placeholder='Token Name (required)' onChange={(e) => setTokenName(e.target.value)} value={tokenName}/>
            </div>
            <div className='box-container'>
                <input className='text-input' type='text' placeholder='Token Symbol (required)' onChange={(e) => setSymbol(e.target.value)} value={symbol}/>
            </div>
            <div className='box-container'>
                <input className='text-input' type='text' placeholder='Fallback Fee' onChange={(e) => setFallbackFee(e.target.value)} value={fallbackFee}/>
            </div>
            <div className='box-container'>
                <input className='text-input' type='number' placeholder='Number of Royalty Accounts' onChange={(e) => updateNumRoyaltyAccs(e.target.value)} value={numRoyaltyAccs} />
            </div>
            {royaltyAccs.map(
                (item, index) => (
                    <>
                <div className='box-container'>
                    <input className='text-input' type='text' placeholder={`Royalty Account ${index+1}`} value={item.trait_type} 
                        onChange={(e)=>updateRoyaltyAccs(index, "royalty_account", e.target.value)}
                    />
                </div>
                <div className='box-container'>
                    <input className='text-input' type='text' placeholder={`Fallback Fee ${index+1}`} value={item.value} 
                        onChange={(e)=>updateRoyaltyAccs(index, "fee", e.target.value)}
                    />
                </div>
            </>
                )
            )}
            <div className='box-container'>
                <input className='text-input' type='number' placeholder='Number of Attributes' onChange={(e) => updateNumAttributes(e.target.value)} value={numAttributes}/>
            </div>
            {attributes.map(
                (item, index) => (
                    <>
                <div className='box-container'>
                    <input className='text-input' type='text' placeholder={`Trait Type ${index+1}`} value={item.trait_type} 
                        onChange={(e)=>updateAttributes(index, "trait_type", e.target.value)}
                    />
                </div>
                <div className='box-container'>
                    <input className='text-input' type='text' placeholder={`Value ${index+1}`} value={item.value} 
                        onChange={(e)=>updateAttributes(index, "value", e.target.value)}
                    />
                </div>
            </>
                )
            )}
            <div className='box-container'>
                <input className='' type='checkbox'/>
                <label > Add a ADMIN Key</label>
            </div>
            <div className='box-container'>
                <input className='' type='checkbox'/>
                <label > Add a FREEZE Key</label>
            </div>
            <div className='box-container'>
                <button className="flip-button" tabIndex="0" style={{width:"100%"}} onClick={mintNFT}>
                    CREATE & MINT
                </button>
            </div>
        </>
    );
  }
  
  export default SingleTab;
  