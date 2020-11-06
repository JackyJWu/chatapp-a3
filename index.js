var express = require('express');
var app = express();

var http = require('http').createServer(app);
var io = require('socket.io')(http);

let date_ob = new Date();
app.use(express.static('public'))

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
	return date_ob.getHours() + ":" +  date_ob.getMinutes() + ":" + date_ob.getSeconds();
}

//   User Connects
io.on('connection', (socket) => {
	// current hours
	// let hours = date_ob.getHours();
	// // current minutes
	// let minutes = date_ob.getMinutes();
	// // current seconds
	// let seconds = date_ob.getSeconds();


	socket.on('disconnect', (msg) => {
	//   console.log('user disconnected');
	  io.emit('disconnect', msg);
	});

	socket.on('chat message', (msg) => {
		// var cur_time = time_stamp();
		// console.log(cur_time);
		
		io.emit('chat message', msg, time_stamp());
	});
});

// io.emit('some event', { someProperty: 'some value', otherProperty: 'other value' }); // This will emit the event to all connected sockets

// io.on('connection', (socket) => {
// 	socket.broadcast.emit('hi');
//   });

http.listen(3000, () => {
	console.log('listening on *:3000');
});
