import React from 'react';
import logo from './logo.svg';
import io from 'socket.io-client';
import { v4 as uuid } from 'uuid'
import Peer from 'peerjs'

import './App.css';

function App() {
  const roomId = 100;
  const peer = new Peer(undefined); 

  const localVideo = document.createElement('video');

  const socket = io();



  peer.on('open',id=>{
    console.log(id)
    socket.emit("join-room",roomId,id);
  })

  navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
  }).then(stream=>{
    addVideoStream(localVideo,stream);
    socket.on("user-connected",userId=>{
      console.log("User connected:"+userId);
      connectToNewUser(userId,stream)
    })
    peer.on('call',call=>{
      call.answer(stream)
      const video2 = document.createElement('video')
      call.on('stream',uservideostream=>{
        addVideoStream(video2,uservideostream)
      })
    })
  })


  const addVideoStream = (video,stream) =>{
    video.srcObject = stream
    video.addEventListener('loadedmetadata',()=>{
      video.play()
    })
    document.getElementById("video-grid").append(video)
  }

  const connectToNewUser = (userId,stream)=>{
    const call = peer.call(userId,stream)
    const video = document.createElement('video')
    call.on('stream',recievedVideoStream=>{
addVideoStream(video,recievedVideoStream)
    })
  }



  socket.on('connect', () => {
    console.log(socket.connected); // true
    
  });


  
  socket.on('disconnect', () => {
    console.log(socket.connected); // false
  });

  return (
    <div className="App">

      <div id="video-grid">

      </div>
     
    </div>
  );
}

export default App;
