
const express = require("express")
const app = express()
const server = require("http").createServer(app);
const io = require("socket.io")(server)
const path = require('path');
const port = 3300



app.use(express.static(path.join(__dirname, '/build')));
    
io.on('connection', function(socket){
	io.sockets.emit("user-joined", socket.id, io.engine.clientsCount, Object.keys(io.sockets.clients().sockets));

	socket.on('signal', (toId, message) => {
		io.to(toId).emit('signal', socket.id, message);
  	});

    socket.on("message", function(data){
		io.sockets.emit("broadcast-message", socket.id, data);
    })

	socket.on('disconnect', function() {
		io.sockets.emit("user-left", socket.id);
	})
});

app.use('/',(req,res)=>{
	res.send("Hello!!")
})


app.use('/ws',(req,res)=>{


res.send("");
})



app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '/build', 'index.html'));
});


server.listen(process.env.PORT || port, () => {
    console.log(`Example app listening at`)
  })