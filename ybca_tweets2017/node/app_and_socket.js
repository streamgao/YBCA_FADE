var express = require('express'),
    app=express(),
    http=require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server, {log: false}),
    osc = require('node-osc'),
    jquery = require('jquery'),
    platform = process.platform

var oscServer, oscClient;
oscServer = new osc.Server(3334, '127.0.0.1');
oscClient = new osc.Client(3333, '127.0.0.1');

var connectedSockets=[];

oscServer.on('message', function(msg, rinfo) {
  // console.log(msg.length);
  console.log(msg);
  connectedSockets.forEach(function(s){
    s.emit("msg", msg);
  });
});

server.listen(8080);

app.use(express.static(__dirname + "/public"));

io.sockets.on('connection', function (socket) {  
  connectedSockets.push(socket);
  console.log('a new connection. Number of connectedSockets is '+(connectedSockets.length));
  
  socket.emit('from server', {hello:'client'});
  
  socket.on('disconnect', function(){
    var idx = connectedSockets.indexOf(socket);
    connectedSockets.splice(idx,1);

    console.log('disconnected, remaining connections: '+ (connectedSockets.length));
  })

});

var send=function(msg){
  connectedSockets.forEach(s=>{
    s.emit("msg", msg)
  })
};

module.exports = {
  send: send
};

