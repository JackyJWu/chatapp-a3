var express = require('express');
var app = express();

var http = require('http').createServer(app);
var io = require('socket.io')(http);

let timestamp = new Date();
app.use(express.static('public'))

let clients = new Map();
let usernames = new Map();
let anon_user = 0;
// History
let history = [];


app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});
  


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
	  io.emit('user disconnect', msg);
	  clients.delete(socket);
	});

	socket.on('chat message', (msg) => {
		let msg_obj = {
			message: msg.message,
			cookie: msg.cookie,
			username: usernames.get(msg.cookie),
			timestamp: time_stamp()
		}
		io.emit('chat message', msg_obj);
	});


	//Handle new connection
	io.emit('set cookie', socket.id, time_stamp());
	
	// Retrieve History

	//Update username
	socket.on('cookie success', (msg) => {
		console.log("COOKIE Success");
		console.log(msg, socket.id);
		if (!usernames.has(msg)){
			name = "anon_user" + anon_user.toString();
			anon_user +=1;
			usernames.set(msg, name);
		}

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
