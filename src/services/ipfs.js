import axios from "axios";
import { NFTStorage } from 'nft.storage'
const UPLOAD_URL = "https://api.nft.storage";
const ipfsKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDFDNjYwNDlFQzEyNTNCQTAwM0M3NEVDNDMzMTQ5NEQxNkYwMDAwRWYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY5Mjg1NzEyNzMwNiwibmFtZSI6ImhlZGVyYW5mdG1pbnQifQ._14L0Ryrr3oJ4XSusW1OyV3q0D57kCJ2GuT5fW7iVMM";

export const storeNFT = async (image, name, description) => {
    const nftstorage = new NFTStorage({ token: ipfsKey })
    // call client.store, passing in the image & metadata
    return nftstorage.store({
        image,
        name,
        description,
    })
}

export const uploadFile =  async (file) => {
    try {
      return await axios.post(UPLOAD_URL, file);
    } catch (e) {
      throw new Error('We are experiencing very high demand. Please retry in 2 minutes.')
    }
}