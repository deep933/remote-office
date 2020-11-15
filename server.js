
const express = require("express")
const app = express()
const server = require("http").createServer(app);
const io = require("socket.io")(server)
const path = require('path');
const port = 3300



app.use(express.static(path.join(__dirname, '/build')));
    
io.on('connection', function(socket){


  socket.on('join',(roomId)=>{

    console.log(roomId)
    socket.join(roomId)
    io.to(roomId).emit("user-joined", roomId, socket.id, Object.keys(io.of('/').adapter.rooms[roomId].sockets));

  });

	socket.on('signal', (toId, message) => {
    console.log(toId,message);
		io.to(toId).emit('signal', socket.id, message);
  	});


	socket.on('disconnect', function() {
		io.sockets.emit("user-left", socket.id);
	})
});


app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '/build', 'index.html'));
});


server.listen(process.env.PORT || port, () => {
    console.log(`Example app listening at ${port}`)
  })