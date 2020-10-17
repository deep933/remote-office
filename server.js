const express = require("express")
const app = express()

const server = require("http").createServer(app);
const socket = require("socket.io").bind(server)

app.use("/",(req,res)=>{
    res.send("hello world")
})

server.listen(5000);