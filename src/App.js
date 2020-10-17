import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {

  const mediaStreamConstraints = {
    video: true,
  };
  
  
  // Local stream that will be reproduced on the video.
  let localStream;
  
  // Handles success by adding the MediaStream to the video element.
  function gotLocalMediaStream(mediaStream) {
    const localVideo = document.querySelector('video');

    localStream = mediaStream;
    localVideo.srcObject = mediaStream;
  }
  
  // Handles error by logging a message to the console with the error message.
  function handleLocalMediaStreamError(error) {
    console.log('navigator.getUserMedia error: ', error);
  }
  
  // Initializes media stream.
  navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
    .then(gotLocalMediaStream).catch(handleLocalMediaStreamError);

  return (
    <div className="App">
   
        <video autoPlay playsInline></video>
       
    </div>
  );
}

export default App;
