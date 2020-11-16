import React from 'react'
import { useState, useEffect } from 'react'
import adapter from 'webrtc-adapter'
import io from 'socket.io-client';
import { useLocation } from "react-router-dom";
import queryString from 'query-string';
import ClipboardJs from 'clipboard'


import './Room.css';

function Room(props) {
    const location = useLocation();
    let localVideo;
    var firstPerson = false;
    var socketCount = 0;
    var socketId;
    var localStream;
    let socket;
    var connections = [];
    let clientlist = []
    let stream

    var peerConnectionConfig = {
        'iceServers': [
            // {
            //     urls: 'turn:numb.viagenie.ca',
            //     username: 'deepmal933@gmail.com'            },
            // // },
            { 'urls': 'stun:stun.services.mozilla.com' },
            { 'urls': 'stun:stun.l.google.com:19302' }
        ]
    }

    useEffect(() => {
        const query = queryString.parse(location.search)
        new ClipboardJs('.copy')
        pageReady(query.roomId)
    }, [])

    function pageReady(roomId) {

        localVideo = document.getElementById('localVideo');

        var constraints = {
            video: true,
            audio: true,
        };

        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(constraints)
                .then(getUserMediaSuccess)
                .then(function () {



                    socket = io.connect("https://remotee-office.herokuapp.com/", { secure: true });
                    socket.on('signal', gotMessageFromServer);
                    socket.on('connect', function () {

                        socketId = socket.id;
                        console.log(socketId, roomId)

                        socket.emit('join', roomId)

                        socket.on('user-left', function (id) {
                            var video = document.querySelector('[data-socket="' + id + '"]');
                            var parentDiv = video.parentElement;
                            video.parentElement.parentElement.removeChild(parentDiv);
                        });


                        socket.on('user-joined', function (roomId, id, clients) {

                            clientlist = clients
                            console.log(roomId, id, count, clients)
                            const count = clients.length;
                            clientlist.forEach(function (socketListId) {
                                if (!connections[socketListId]) {
                                    connections[socketListId] = new RTCPeerConnection(peerConnectionConfig);
                                    //Wait for their ice candidate       
                                    connections[socketListId].onicecandidate = function (event) {
                                        if (event.candidate != null) {
                                            console.log('SENDING ICE');
                                            socket.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }));
                                        }
                                    }

                                    //Wait for their video stream
                                    connections[socketListId].onaddstream = function (event) {
                                        gotRemoteStream(event, socketListId)
                                    }

                                    //Add the local video stream
                                    connections[socketListId].addStream(localStream);
                                }
                            });

                            //Create an offer to connect with your local description

                            if (count >= 2) {
                                connections[id].createOffer().then(function (description) {
                                    connections[id].setLocalDescription(description).then(function () {
                                        // console.log(connections);
                                        socket.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription, 'type': 'camera' }));
                                    }).catch(e => console.log(e));
                                });
                            }
                        });
                    })

                });
        } else {
            alert('Your browser does not support getUserMedia API');
        }
    }

    const handleScreenshare = (e) => {
        console.log(clientlist)
        var displayMediaStreamConstraints = {
            video: true // or pass HINTS
        };

        if (navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia(displayMediaStreamConstraints)
                .then(stream => {
                    handleReplaceStream(stream)

                }).catch(console.log);
        } else {
            navigator.getDisplayMedia(displayMediaStreamConstraints)
                .then(stream => {
                    handleReplaceStream(stream)
                })
                .catch(console.log);
        }
    }

    const handleReplaceStream = (stream) => {
        clientlist.forEach(function (socketListId) {
            if (connections[socketListId]) {

                //Add the local video stream


                connections[socketListId].addStream(stream)
                connections[socketListId].createOffer().then(function (description) {
                    connections[socketListId].setLocalDescription(description).then(function () {
                        // console.log(connections);
                        socket.emit('signal', socketListId, JSON.stringify({ 'sdp': connections[socketListId].localDescription, 'type': 'screen' }));
                    }).catch(e => console.log(e));
                });

            }
        });
    }

    function getUserMediaSuccess(stream) {
        localStream = stream;
        localVideo.srcObject = localStream;
        localVideo.addEventListener('loadedmetadata', () => {
            localVideo.play()
        })
    }

    function gotRemoteStream(event, id) {
        var v = document.querySelector('[data-socket="' + id + '"]');

        
            let videos = document.querySelectorAll('video'),
                video = document.createElement('video'),
                vdiv = document.createElement('div'),
                control_div = document.createElement('div'),
                button = document.createElement('button')

                vdiv.className = "relative"
                control_div.className = "control-panel absolute left-0 top-0 pt-2 pl-2"
                button.className = "unmute bg-blue-600 h-8 text-sm  pl-4 pr-4 text-white shadow-sm rounded-md outline-none focus:outline-none"
                button.innerText = "Unmute"
                button.addEventListener('click', (e) => {
                video.muted = !video.muted
                if(video.muted){
                    e.target.classList.replace("mute","unmute")
                    e.target.innerText = "Unmute"
                }
                else{
                    e.target.classList.replace("unmute","mute")
                    e.target.innerText = "Mute"
                }
            })

            if(v){
                video.setAttribute('data-socket-2', id);

            }
            video.setAttribute('data-socket', id);
            
            video.srcObject = event.stream;
            video.autoplay = true;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;

            video.addEventListener('click', handleVideoClickListner)

            control_div.appendChild(button)
            vdiv.appendChild(video);
            vdiv.appendChild(control_div);
            document.querySelector('.videos').appendChild(vdiv);

          
            
       
    }

    function gotMessageFromServer(fromId, message) {

        //Parse the incoming signal
        var signal = JSON.parse(message)

        //Make sure it's not coming from yourself
        if (fromId != socketId) {

            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function () {
                    if (signal.sdp.type == 'offer') {
                        if (signal.type == 'screen') {
                            handleScreenShareResponse(fromId)
                        }
                        else{

                        }
                        connections[fromId].createAnswer().then(function (description) {
                            connections[fromId].setLocalDescription(description).then(function () {
                                socket.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }));
                            }).catch(e => console.log(e));
                        }).catch(e => console.log(e));
                    }
                }).catch(e => console.log(e));
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
            }
        }
    }

    const handleScreenShareResponse = (id) =>{
        let video = document.querySelector('[data-socket-2="' + id + '"]')
        video.style.transform = "scaleX(1)"
        // video.className = "zoomin"
    }

    const handleVideoClickListner = (e) =>{
        if (e.target.className == "zoomin") {
            e.target.className = "zoomout"
        }
        else {
            e.target.className = "zoomin"
        }
    }

    const handleLocalVideoMic = (e) =>{
        let video = document.getElementById("localVideo")
        video.muted = !video.muted
                if(video.muted){
                    e.target.classList.replace("mute","unmute")
                    e.target.value = "unmute"
                    
                }
                else{
                    e.target.classList.replace("unmute","mute")
                    e.target.valye = "mute"

                }
    } 

    return (
        <div className="Room">
            <div className="mb-6 flex bg-gray-200 p-2 text-gray-700 text-sm items-center justify-center">
    Invite Others <p className="text-blue-600 ml-4">{window.location.href}</p><button data-clipboard-text={window.location.href} className="copy bg-blue-600 ml-4 h-8 text-sm  pl-4 pr-4 text-white shadow-sm rounded-md outline-none focus:outline-none">Copy & Share</button>
            </div>
            <div class="videos grid md:grid-cols-3 sm:grid-cols-1 gap-3 md:m-6 sm:m-4 m-4">
                <div className="relative">
                    <video id="localVideo" muted loop playsInline autoPlay></video>
                    <div className="control-panel absolute left-0 top-0 pt-2 pl-2">
                    <button onClick={handleScreenshare} className="screenshare bg-black h-10 w-10 pl-4 pr-4 text-white shadow-sm rounded-md outline-none focus:outline-none"
                    ></button>
           
                    </div>
                    

                </div>
            </div>

            <br />
            <div id="connections"></div>




        </div>
    );
}

export default Room;
