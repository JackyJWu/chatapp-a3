// Extract the cookie value
function extract_cookie(){
  let unique_id = null;
  document.cookie.split(';').forEach(value => {
    if (value.trim().startsWith('unique_user')){
      unique_id = value.split('=')[1];
    }
  });
  return unique_id;
}

// Check hex 
function check_hex (hex) {
  return typeof hex === 'string'
      && !isNaN(Number('0x' + hex))
      && hex.length === 6

}

function incorrect_slash(cmd){
  if (cmd.charAt(0) == '/'){
    if (cmd == '/color' || cmd == '/name'){
      return false
    }else{
      return true
    }
  }
  return false
}

// Emoji converted
let emoji = {
	':)': '&#128513;',
	':(': '&#128577;',
	':o': '&#128558;'
}

$(function () {
    var socket = io();
    // Handle Input
    $('form').submit(function(e){
      e.preventDefault(); // prevents page reloading

      let msg = {
        message:  $('#m').val(),
        cookie: extract_cookie(),
        display: true, // if display is "true", we send msg to every user. If display is "false", we send back to the current user.
        type: "message" // type can be 'name', 'color' or 'message'
      }
      // Submit button case handle
      let words = $('#m').val().split(" ")
      // Handle emoji
      for (let i = 0; i < words.length; i++){
        if (emoji[words[i]] !== undefined){
          words[i] = emoji[words[i]];
        }
      }
      msg.message = words.join(" ");
      // Handle when user types new name
      if (words[0] == "/name"){
        if (words.length >1){
          words.shift();
          msg.message = words.join(" ");
          msg.type = "name";
        }else{
          msg.message = "Correct Usage: /name *new name*";
        }

      }
      // Handle when the user wants to change color
      else if (words[0] == "/color"){
        msg.display = false; // We only display message back to ther user
        if (words.length == 2 && check_hex(words[1])){
          msg.message = words[1];
          msg.type = "color";
        }else{
          // Handle incorrect input
          msg.message = "This feature only accepts hex color codes (6 letter/numbers). Usage: /color *insert hex color code*";
        }
      }

      // Checks for incorrect commands
      if (incorrect_slash(words[0])){
        $('#messages').append($(`<li>Error: <b>${words[0]}</b> is an invalid command</li>`));
        var msgbox = document.getElementById("messages");
        msgbox.scrollTop = msgbox.scrollHeight;
        $('#m').val('');
      }else{
        socket.emit('chat message', msg);
        $('#m').val('');
      }


      return false;
    });


    // User Entered
    socket.on('user join', function(msg){
      $('#messages').append($(`<li>[${msg.timestamp}] <span style="color: #${msg.user.color}; font-size: 15px;">${msg.user.name}</span> has joined the room</li>`));      
      var msgbox = document.getElementById("messages");
      msgbox.scrollTop = msgbox.scrollHeight;
      $('#activeusers').empty();
    });

    socket.on('active users', function(user){
      $('#activeusers').append($(`<li> <span style="color: #${user.color}; font-size: 15px;">${user.name}</span></li>`));      
    });


      // Handle Cookie
    if (document.cookie.split(';').some((item) => item.trim().startsWith('unique_user='))) {
      // Case where cookie exists. If it exists, return cookie value to the server

      socket.on('set cookie', function(msg){
        document.cookie = `unique_user=${extract_cookie()}`
        socket.emit('cookie success', extract_cookie());

      });
    }else{
      // New User
      socket.on('set cookie', function(msg){
        document.cookie = `unique_user=${msg}`
        socket.emit('cookie success', msg);
      });
    }

    // Message is entered
    socket.on('chat message', function(msg){
      // Printing your own message
      if (extract_cookie() == msg.cookie){
        if (msg.type == "message"){
          $('#messages').append($(`<li>[${msg.timestamp}] <span style="color: #${msg.user.color}; font-size: 15px;">${msg.user.name}:</span> <span style="font-weight: 900; color: black;"><b>${msg.message}</b></span></li>`));
        }else if (msg.type == "name"){
          $('#messages').append($(`<li>[${msg.timestamp}] <b>${msg.message}</b></li>`));
        }else{
          $('#messages').append($(`<li>[${msg.timestamp}] <b>${msg.message}</b></li>`));
        }

      }else{ // Print message from somebody else
        if (msg.type == "message"){
          $('#messages').append($(`<li>[${msg.timestamp}] <span style="color: #${msg.user.color}; font-size: 15px;">${msg.user.name}:</span> ${msg.message}</li>`));
        }else if (msg.type == "name"){
          $('#messages').append($(`<li>[${msg.timestamp}] ${msg.message}</li>`));
        }else{
          $('#messages').append($(`<li>[${msg.timestamp}] ${msg.message}</li>`));

        }
      }

      // Scroll down when new message
      var msgbox = document.getElementById("messages");
      msgbox.scrollTop = msgbox.scrollHeight;
    });

    // Clear all messages 
    socket.on('clear message', function(user){
      $('#messages').empty();
      var msgbox = document.getElementById("messages");
      msgbox.scrollTop = msgbox.scrollHeight;
    });  
    // Clear and update the name identifier
    socket.on('name display', function(msg){   
      $('#namedisplay').text(msg.user.name)
      $('#namedisplay').css('color', `#${msg.user.color}`);
    });  

    // Clear and update the active users
    socket.on('update active', function(msg){
      $('#activeusers').empty();
    });


    // User Disconnect
    socket.on('user disconnect', function(msg){
      if (msg.user != null){
        $('#messages').append($(`<li>[${msg.timestamp}] <span style="color: #${msg.user.color}; font-size: 15px;">${msg.user.name}</span> has disconnected</li>`));
        var msgbox = document.getElementById("messages");
        msgbox.scrollTop = msgbox.scrollHeight;
      }
    });  
  });
