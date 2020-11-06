var express = require('express');
var app = express();

var http = require('http').createServer(app);
var io = require('socket.io')(http);

let timestamp = new Date();
app.use(express.static('public'))

let clients = new Map();
let usernames = new Map();


console.log("JACKY");
console.log(usernames.keys());

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});
  
//   io.on('connection', (socket) => {
// 	console.log('a user connected');
// 	socket.on('disconnect', () => {
// 	  console.log('user disconnected');
// 	});
//   });

// io.on('connection', (socket) => {
// 	socket.on('chat message', (msg) => {
// 	  console.log('message: ' + msg);
// 	});
//   });

// TimeStamp
function time_stamp() {
	timestamp = new Date();
	return timestamp.getHours() + ":" +  timestamp.getMinutes() + ":" + timestamp.getSeconds();
}

//   User Connects
io.on('connection', (socket) => {
	// current hours
	clients.set(socket, 1);

	socket.on('disconnect', (msg) => {
	//   console.log('user disconnected');
	  io.emit('user disconnect', msg);
	  clients.delete(socket);
	});

	socket.on('chat message', (msg) => {
		var cur_time = time_stamp();
		console.log(cur_time);
		
		io.emit('chat message', msg, time_stamp());
	});


	//Handle new connection

	io.emit('set cookie', socket.id, time_stamp());

	//Update username
	socket.on('cookie success', (msg) => {
		console.log(msg, socket.id);
		io.emit('chat message', msg, time_stamp());
	});




	// During Connection Announce user connection
	io.emit('user join', socket.id, time_stamp());

});

// sends each client its current sequence number
setInterval(() => {

    // for (const [client, sequenceNumber] of clients.entries()) {
    //     client.emit("seq-num", sequenceNumber);
    //     clients.set(client, sequenceNumber + 1);
	// }
	// date_ob = new Date();
	// console.log(time_stamp());
}, 1000);

// io.emit('some event', { someProperty: 'some value', otherProperty: 'other value' }); // This will emit the event to all connected sockets

// io.on('connection', (socket) => {
// 	socket.broadcast.emit('hi');
//   });

http.listen(3000, () => {
	console.log('listening on *:3000');
});
