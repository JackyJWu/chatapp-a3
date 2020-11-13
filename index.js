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

let anon_user = 0; //Create user
let history = []; //Message History


app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});
  


// TimeStamp
function time_stamp() {
	timestamp = new Date();
	let hour = timestamp.getHours();
	let min = timestamp.getMinutes();
	min = min < 10 ? '0'+min : min;
	let pmam = hour >= 12 ? 'PM' : 'AM';
	hour = hour % 12;
	hour = hour ? hour : '12';
	return hour + ":" +  min + pmam;
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

/* username exists
* returns true if username exists and false otherwise
*/
function username_exist(username) {

	for (let [key, value] of clients) {
		if(usernames.get(value).name == username){
			return true
		}
	}
	return false;
}

/* Add message to history
*  param takes a message type
*  updates history
*  only keeps past 200 liens
*/

function msg_to_history(msg) {
	if (history.length == 200){
		history.shift()
	}
	history.push(msg);
}

// Function to print history
function output_history(socket){
	for (iter in history){
		if (history[iter].type == "message" || history[iter].type == "name"){
			socket.emit('chat message', history[iter]);
		}
		else if (history[iter].type == "disconnect"){
			socket.emit('user disconnect', history[iter]);
		}
		else if (history[iter].type == "join"){
			socket.emit('user join', history[iter]);
		}
	}
}


//   User Connects
io.on('connection', (socket) => {
	//Handle new connection
	io.emit('set cookie', socket.id, time_stamp());

	// current hours
	socket.on('disconnect', (status) => {
		let user = get_username(socket.id);
		

		let msg = {
			user: get_username(socket.id),
			timestamp: time_stamp(),
			type: 'disconnect'
		}
		msg_to_history(msg);

		io.emit('user disconnect', msg);
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
			io.emit('color change', msg);
			output_history(io);
			socket.emit('chat message', msg);
		}else{ // Public messages we send to all users
			if (msg.type == "name"){
				if (!username_exist(msg.message)){
					let old_name = msg.user.name
					msg.user.name = msg.message;
					usernames.set(msg.cookie, user);
					msg.message = `${old_name} has changed his name to ${msg.user.name}`
					msg.user = ""
					msg_to_history(msg);
					socket.emit('name display', msg_obj)
					io.emit('chat message', msg);
				}else{
					msg.message = `The username "${msg.message}" has been taken`
					socket.emit('chat message', msg);
				}

				// io.emit('chat message', msg);
			}else{
				msg_to_history(msg);
				io.emit('chat message', msg);
			}

		}

	});



	

	//Update username
	function username_taken(username, currentuser){
		for (let [key, value] of clients) {
			if(usernames.get(value).name == username && key != currentuser){
				return true
			}
		}
		return false
	}

	socket.on('cookie success', (msg) => {		
		// If user name doesnt exist, we set it to anon user 
		if (!usernames.has(msg)){
			user = {
				name: "anon_user" + anon_user.toString(),
				color: "000000"
			}

			anon_user +=1;
			usernames.set(msg, user);
		}
		else{
			user = usernames.get(msg);
			// If username is taken, randomly assign a username
			console.log("test");
			if (username_taken(user.name, msg)){
				user.name = "anon_user" + anon_user.toString()
				anon_user +=1;
				usernames.set(msg,user);
			}

		}
		clients.set(socket.id, msg)
		output_history(socket);
		msg_obj = {
			user: user,
			timestamp: time_stamp(),
			type: 'join'
		};
		msg_to_history(msg_obj);
		socket.emit('name display', msg_obj)
		io.emit('user join', msg_obj);
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

http.listen(3000, () => {
	console.log('listening on *:3000');
});
