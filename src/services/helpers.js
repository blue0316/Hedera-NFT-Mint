export const base64ToArrayBuffer = (base64) => {
    const cleanBase64String = base64.replace(/^data:image\/[a-z]+;base64,/, "");
    const binaryString = atob(cleanBase64String);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
  
    for (let i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
  
    return bytes.buffer;
}


export const sleep = async (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}