import React from 'react';
import { useState, useEffect } from 'react';

import logo from './logo.svg';
import io from 'socket.io-client';
import { v4 as uuid } from 'uuid'
import Peer from 'peerjs'

import './App.css';

function App() {
  const [roomId, setRoomId] = useState(10)
  const [connectedUsers,setConnectedUsers] = useState([])
  const [nouser,setNoUser] = useState(0);
  const [screenShare, setScreenShare] = useState(false);
  const [displayMediaOptions, setDispalyMediaOption] = useState({ video: true, audio: true })

  useEffect(() => {
    const socket = io();
    const localVideo = document.getElementById('localVideo');
    localVideo.muted = true

    navigator.mediaDevices.getUserMedia(displayMediaOptions).then(stream=>{
      localVideo.srcObject = stream;
      localVideo.addEventListener('loadedmetadata',()=>{
        localVideo.play()
      })
    })

    socket.emit('join-room',roomId,uuid());


    socket.on("user-connected", (userId,nouser) => {
      setNoUser(nouser)

      setConnectedUsers(connectedUsers => connectedUsers.concat(userId))
      console.log("User connected:" + userId, connectedUsers,nouser);

    })
  

    socket.on('user-disconnected', (userId,nouser) => {
      setNoUser(nouser)

     setConnectedUsers(connectedUsers => connectedUsers.filter(id=>id!=userId))
     console.log("user disconnected"+ userId,connectedUsers)

      })

    },[])

    useEffect(()=>{
console.log(connectedUsers);
    },[connectedUsers])


  return (
    <div className="App">
      {nouser} connected<br></br>
{connectedUsers}
      <br></br>

      <video id="localVideo"></video>

      <div id="video-grid">

      </div>

    </div>
  );
}

export default App;
