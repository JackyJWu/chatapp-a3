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
	return timestamp.getHours() + ":" +  timestamp.getMinutes();
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
	let user = usernames.get(get_cookie(socket_id));
	return user;
}



//   User Connects
io.on('connection', (socket) => {
	//Handle new connection
	io.emit('set cookie', socket.id, time_stamp());

	// current hours
	socket.on('disconnect', (msg) => {
	  let user = get_username(socket.id);
	  io.emit('user disconnect', user);
	  
	  clients.delete(socket.id);
	});

	socket.on('chat message', (msg) => {
		/*
		let msg_obj = {
			message: msg.message,
			cookie: msg.cookie,
			display: msg.display,
			type: msg.type,
			username: usernames.get(msg.cookie),
			timestamp: time_stamp()
		}
		*/
		// Backend retrieves username from cookie and sets timestamp
		msg.user = usernames.get(msg.cookie);
		msg.timestamp = time_stamp();

		if (!msg.display){	// Private messages, we just sent back to the user
			if (msg.type == "color"){
				let user = usernames.get(msg.cookie);
				
				user.color = msg.message; 
				usernames.set(msg.cookie, user);
				msg.message = "Color has been changed";
			}
			socket.emit('chat message', msg);
		}else{ // Public messages we send to all users
			// Removes the oldest line when history has 200 lines
			if (history.length == 200){
				history.shift()
			}
			history.push(msg);
			io.emit('chat message', msg);
		}

	});



	
	// Retrieve History

	//Update username
	socket.on('cookie success', (msg) => {		
		// If user name doesnt exist, we set it to anon user 
		if (!usernames.has(msg)){
			user = {
				name: "anon_user" + anon_user.toString(),
				color: "000000"
			}

			// name = "anon_user" + anon_user.toString();
			anon_user +=1;
			usernames.set(msg, user);
		}else{
			user = usernames.get(msg);
		}
		clients.set(socket.id, msg)
		for (iter in history){
			socket.emit('chat message', history[iter])
		}
		msg_obj = {
			message: user.name, 
			timestamp: time_stamp()
		};
		io.emit('user join', msg_obj);
		// io.emit('user join', name, time_stamp());
		
		// for (msg in history){
		// 	socket.emit('chat message', msg)
		// }
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
