var express = require('express');
var app = express();

// This is for heroku
port = process.env.PORT || 80
// port = 3334;
// port = 3000;


var http = require('http').createServer(app);
var io = require('socket.io')(http);

// Timestamp object
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
	// We iterate through all the connected clients and check if there is any client with the current name
	for (let [key, value] of clients) {
		if(usernames.get(value).name == username){
			return true
		}
	}
	return false;
}

/*
* updates active users
*/
function update_activeusers() {
	for (let [key, value] of clients) {
		let active_user = usernames.get(value);
		io.emit('active users', active_user);
	}
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

//Check all the usernames to see if the requested name is taken
function username_taken(username, currentuser){
	for (let [key, value] of clients) {
		if(usernames.get(value).name == username && value != currentuser){
			return true
		}
	}
	return false
}



//   User Connects
io.on('connection', (socket) => {
	//Handle new connection
	
	if (usernames.get(socket.id) == null){
		socket.emit('set cookie', socket.id, time_stamp());
	}
	// socket.emit('set cookie', socket.id, time_stamp());

	// current hours
	socket.on('disconnect', (status) => {
		io.emit('update active'); // Remove user from active list
		let msg = {
			user: get_username(socket.id),
			timestamp: time_stamp(),
			type: 'disconnect'
		}
		msg_to_history(msg);

		// Fix bug
		io.emit('user disconnect', msg);
		clients.delete(socket.id);
		update_activeusers();
	});

	// Chat message
	socket.on('chat message', (msg) => {

		// Backend retrieves username from cookie and sets timestamp
		msg.user = usernames.get(msg.cookie);
		msg.timestamp = time_stamp();

		if (!msg.display){	// Private messages, we just sent back to the user
			if (msg.type == "color"){ //When the user tries to change their color
				io.emit('update active'); // Remove user from active list
				let user = usernames.get(msg.cookie);
				user.color = msg.message; 
				usernames.set(msg.cookie, user);
				msg.message = "Color has been changed";
				msg.user = usernames.get(msg.cookie);
				socket.emit('name display', msg)
			}
			io.emit('clear message', msg);
			output_history(io); //update history
			socket.emit('chat message', msg);
			update_activeusers(); // Update the active list
		}else{ // Public messages we send to all users
			io.emit('update active'); // Remove user from active list

			if (msg.type == "name"){ //When user tries to change name
				if (!username_exist(msg.message)){ //Check all the sockets connected and see if their username is the same as the requested name
					let old_name = msg.user.name
					msg.user.name = msg.message;
					usernames.set(msg.cookie, msg.user);
					msg.message = `${old_name} has changed his name to ${msg.user.name}`
					socket.emit('name display', msg)
					msg.user = ""
					msg_to_history(msg);
					io.emit('chat message', msg);
				}else{ // If a connected socket has the username, we output message already taken
					msg.message = `The username "${msg.message}" has been taken`
					socket.emit('chat message', msg);
				}

			}else{
				msg_to_history(msg);
				io.emit('chat message', msg);
			}
			update_activeusers();

		}

	});

	// Handle cookie
	socket.on('cookie success', (msg) => {		
		
		io.emit('update active'); // Clear active list
		if (!usernames.has(msg)){ // If user name doesnt exist, we set it to anon user 
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
			if (username_taken(user.name, msg)){ // This function is broken
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

		update_activeusers()
	});
});


http.listen(port, () => {
	console.log(`listening on *:${port}`);
});
