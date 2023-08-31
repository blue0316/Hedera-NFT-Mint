import './App.css';
import 'react-tabs/style/react-tabs.css';
import Footer from './components/Footer';
import { useEffect, useState } from 'react';
import { pairClient, disconnect } from './hashgraph';
import BulkTab from './components/BulkTab';
import SingleTab from './components/SingleTab';
import soundMusic from './assets/music/Click.mp3';
import useSound from 'use-sound';


function App() {
  const [playSound] = useSound(soundMusic, { volume: 0.5 });
  const [pairingData, setPairingData] = useState(null);
  const [bulkTab, setBulkTab] = useState(true);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [clickPlaying, setClickPlaying] = useState(false);

  const clickPlay = () => { if(clickPlaying==true) playSound(); }

  const connectWallet = async () => {
    const data = await pairClient();
    console.log("DATADATA", data)
    setPairingData(data)
  }
  useEffect(() => {
    connectWallet();
  }, [])

  const disconnectWallet = async () => {
    await disconnect();
    setPairingData(null)
    setShowDisconnect(false)
  }
  return (
    <div className="App" >
      <div className='background-container'>
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>
      <header>
        <div className="toolbar">
          <div onClick={()=> setClickPlaying(!clickPlaying)}>
            <img className="sound-img" src={clickPlaying ? "./images/on.png": "./images/off.png"} />
            <p className="text-green">SOUND</p>
          </div>
          {pairingData && pairingData.savedPairings && pairingData.savedPairings.length>0 &&
            <div onClick={()=> {setShowDisconnect(!showDisconnect)}} className='account-section'>
              <span className="text-green account-text">{pairingData.savedPairings[0].accountIds[0]}</span>
              <svg viewBox="0 0 13 8" fill="#6AFF52" xmlns="http://www.w3.org/2000/svg" height="8px" width="12px" ><path fill-rule="evenodd" clip-rule="evenodd" d="m6.5 8-6-6L1.91.59 6.5 5.17 11.09.59 12.5 2l-6 6Z"></path></svg>
            </div>
          }
          {(pairingData == null || pairingData.savedPairings == undefined || pairingData.savedPairings.length==0) &&
            <div onClick={()=> connectWallet()} className='account-section'>
              <button className='flip-button'>Connect Wallet</button>
            </div>
          }
        </div>
        {showDisconnect && <div className='disconnect-modal'>
          <button className='disconnect-btn text-green' onClick={() => disconnectWallet()}>Disconnect Account</button>
        </div>}
      </header>
      <main >
        <div className="container">
          <div className="main-content">
            <div className="flip-box">
              <p className="bet-on-title">NFT MINTING</p>
              <div className='flip-inner-box'>
                {pairingData && 
                <>
                  <div className="tab-section">
                    <div className="tab-inner-section">
                      <div className={'tab1 tab ' + (bulkTab==true? "selected-tab":"")} onClick={()=>(clickPlay(), setBulkTab(true))}>
                        BULK MINTING
                      </div>
                      <div className={'tab2 tab ' + (bulkTab==false? "selected-tab":"")} onClick={()=> (clickPlay(), setBulkTab(false))}>
                        SINGLE MINTING
                      </div>
                    </div>
                  </div>
                  {bulkTab && <BulkTab pairingData = {pairingData} />}
                  {!bulkTab && <SingleTab pairingData = {pairingData} />}
                </>}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
