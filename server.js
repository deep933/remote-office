const express = require("express")
const app = express()
const server = require("http").createServer(app);
const io = require("socket.io")(server)
const path = require('path');
const port = 8080
const { ExpressPeerServer } = require('peer');
const peerServer =  ExpressPeerServer(server, {
    path: '/myapp'
  });

app.use('/peerjs',peerServer)


app.use(express.static(path.join(__dirname, '/build')));
    
io.on('connection', socket => { 

  socket.on('join-room', (roomId,userId)=>{
      socket.join(roomId); 

    const nouser = io.sockets.adapter.rooms[roomId];
      io.to(roomId).emit("user-connected",userId,nouser.length);
      socket.on('disconnect',()=>{
        const nouser = io.sockets.adapter.rooms[roomId];
          io.to(roomId).emit("user-disconnected",userId,nouser.length);
      })
    });

});


app.use('/ws',(req,res)=>{


res.send("");
})



app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '/build', 'index.html'));
});


server.listen(process.env.PORT || port, () => {
    console.log(`Example app listening at`)
  })