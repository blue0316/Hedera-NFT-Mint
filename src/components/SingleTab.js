import React from 'react';
import ImageUploading from 'react-images-uploading';

function SingleTab() {
    const [images, setImages] = React.useState([]);
    const maxNumber = 69;

    const onChange = (imageList, addUpdateIndex) => {
        // data for submit
        console.log(imageList, addUpdateIndex);
        setImages(imageList);
    };
    return (
        <>
            <ImageUploading
                value={images}
                onChange={onChange}
                maxNumber={maxNumber}
                dataURLKey="data_url"
            >
                {({
                imageList,
                onImageUpload,
                onImageUpdate,
                }) => (
                // write your building UI
                <div className="upload__image-wrapper">
                    {imageList.length==0 && <button className='flip-button' onClick={onImageUpload}> upload image</button>}
                    {imageList.length==1 && <img className='image-upload' src={imageList[0]["data_url"]} onClick={imageList.length==0 ? onImageUpload : () => onImageUpdate(0)} alt="" width="300" />}
                </div>
                )}
            </ImageUploading>
            <div className='box-container'>
                <input className='text-input' type='text' placeholder='Name' />
            </div>
            <div className='box-container'>
                <input className='text-input' type='text' placeholder='Description'/>
            </div>
            <div className='box-container'>
                <input className='text-input' type='text' placeholder='Creator' />
            </div>
            <div className='box-container'>
                <input className='text-input' type='number' placeholder='Quantity' />
            </div>
            <div className='box-container'>
                <input className='text-input' type='text' placeholder='Token Symbol' />
            </div>
            <div className='box-container'>
                <input className='text-input' type='text' placeholder='Fallback Fee' />
            </div>
            <div className='box-container'>
                <input className='text-input' type='number' placeholder='Number of Royalty Accounts' />
            </div>
            <div className='box-container'>
                <input className='text-input' type='number' placeholder='Number of Attributes' />
            </div>
            <div className='box-container'>
                <input className='' type='checkbox'/>
                <label > Add a ADMIN Key</label>
            </div>
            <div className='box-container'>
                <input className='' type='checkbox'/>
                <label > Add a FREEZE Key</label>
            </div>
            <div className='box-container'>
                <button className="flip-button" tabIndex="0" style={{width:"100%"}}>
                    CREATE & MINT
                </button>
            </div>
        </>
    );
  }
  
  export default SingleTab;
  