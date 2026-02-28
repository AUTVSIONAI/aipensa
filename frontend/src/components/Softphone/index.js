import React from 'react'
import  SoftPhone  from 'react-softphone'
import { WebSocketInterface } from 'jssip';


  const config = {
    domain: process.env.REACT_APP_SIP_DOMAIN || '',
    uri: process.env.REACT_APP_SIP_URI || '',
    password: process.env.REACT_APP_SIP_PASSWORD || '',
    ws_servers: process.env.REACT_APP_SIP_WS_SERVERS || '',
    sockets: new WebSocketInterface(process.env.REACT_APP_SIP_WS_URL || 'wss://localhost:8089/ws'),
    display_name: process.env.REACT_APP_SIP_DISPLAY_NAME || '',
    websocket_url: process.env.REACT_APP_SIP_WEBSOCKET_URL || '',
    sip_outbound_ur: process.env.REACT_APP_SIP_OUTBOUND_URL || '',
    debug: process.env.NODE_ENV !== 'production'
  };
const setConnectOnStartToLocalStorage =(newValue)=>{
// Handle save the auto connect value to local storage
return true
}
const setNotifications =(newValue)=>{
// Handle save the Show notifications of an incoming call to local storage
return true
}
const setCallVolume =(newValue)=>{
// Handle save the call Volume value to local storage
return true
}
const setRingVolume =(newValue)=>{
// Handle save the Ring Volume value to local storage
return true
}

console.log(setConnectOnStartToLocalStorage)

function SoftPhone() {
  return (
    <div className="SoftPhone">
      <header className="SoftPhone-header">
         <SoftPhone
                     callVolume={33} //Set Default callVolume
                     ringVolume={44} //Set Default ringVolume
                     connectOnStart={false} //Auto connect to sip
                     notifications={false} //Show Browser Notification of an incoming call
                     config={config} //Voip config
                     setConnectOnStartToLocalStorage={setConnectOnStartToLocalStorage} // Callback function
                     setNotifications={setNotifications} // Callback function
                     setCallVolume={setCallVolume} // Callback function
                     setRingVolume={setRingVolume} // Callback function
                     timelocale={'UTC+3'} //Set time local for call history
                   />
      </header>
    </div>
  );
}

export default SoftPhone;