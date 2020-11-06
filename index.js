var express = require('express');
var app = express();

var http = require('http').createServer(app);
var io = require('socket.io')(http);

let timestamp = new Date();
app.use(express.static('public'))


// Connect Socket ID to a cookie
let clients = new Map();


// Connect Cookie to a username
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

/* Get cookie
* param takes in a socketid
* returns a username if there is.
*/
function get_cookie(socket_id) {
	let cookie = clients.get(socket_id);
	return cookie;
}

/* Get username
* param takes in a socketid
* returns a username if there is.
*/
function get_username(socket_id) {
	let username = usernames.get(get_cookie(socket_id));
	return username;
}



//   User Connects
io.on('connection', (socket) => {
	// current hours
	socket.on('disconnect', (msg) => {
	  let username = get_username(socket.id);
	  io.emit('user disconnect', username);
	  
	  clients.delete(socket.id);
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
		// If user name doesnt exist, we set it to anon user 
		if (!usernames.has(msg)){
			name = "anon_user" + anon_user.toString();
			anon_user +=1;
			usernames.set(msg, name);
		}
		clients.set(socket.id, msg)


		io.emit('user join', name, time_stamp());

		// io.emit('chat message', msg, time_stamp());
	});
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
