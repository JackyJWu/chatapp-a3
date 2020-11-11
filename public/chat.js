function extract_cookie(){
  let unique_id = null;
  document.cookie.split(';').forEach(value => {
    if (value.trim().startsWith('unique_user')){
      // console.log(value.split('=')[1]);
      unique_id = value.split('=')[1];
    }
  });
  return unique_id;
}

// Check hex (Change this before submission)
function isHex (hex) {
  return typeof hex === 'string'
      && hex.length === 6
      && !isNaN(Number('0x' + hex))
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
      // Handle when user types new name
      if (words[0] == "/name"){
        console.log(msg);
      }
      // Handle when the user wants to change color
      else if (words[0] == "/color"){
        msg.display = false; // We only display message back to ther user
        if (words.length == 2 && isHex(words[1])){
          msg.message = words[1];
          msg.type = "color";
        }else{
          // Handle incorrect input
          msg.message = "This feature only accepts hex color codes (6 letter/numbers). Usage: /color *insert hex color code*";
        }
      }
      
      // Name Change
      /*
      if ($('#m').val() == "/name"){
        console.log("JACKY WU");
      };
      // Color Change
      if ($('#m').val() == "/color"){
        console.log("JACKY WU");
      };
            // Send message to socket
      let msg = {
        message:  $('#m').val(),
        cookie: extract_cookie()
      }
      */


      socket.emit('chat message', msg);
      $('#m').val('');

      return false;
    });


    // User Entered
    socket.on('user join', function(msg){
      $('#messages').append($('<li>').text(`[${msg.timestamp}] ${msg.message} has joined the room`));
      
      var msgbox = document.getElementById("messages");
      msgbox.scrollTop = msgbox.scrollHeight;
    });

      // Handle Cookie
    if (document.cookie.split(';').some((item) => item.trim().startsWith('unique_user='))) {
      // Case where cookie exists. If it exists, return cookie value to the server
      socket.emit('cookie success', extract_cookie());
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
        console.log("MATCHING", extract_cookie(), msg.cookie);
        $('#messages').append($(`<li>[${msg.timestamp}] <span style="color: #${msg.user.color}">${msg.user.name}</span>:<b>${msg.message}</b></li>`));

      }else{ // Print message from somebody else
        console.log(msg);
        msg_str = "[" + msg.timestamp+ "] "+ msg.user.name +":" +msg.message;
        $('#messages').append($(`<li>[${msg.timestamp}] <span style="color: #${msg.user.color}">${msg.user.name}</span>:${msg.message}</li>`))
        // $('#messages').append($('<li>').text(msg_str));
      }

      // Scroll down when new message
      var msgbox = document.getElementById("messages");
      msgbox.scrollTop = msgbox.scrollHeight;

    });

    // socket.on('seq-num', function(msg,cur_time){
    //   $('#messages').append($('<li>').text(msg));
    // });

    // User Disconnect
    socket.on('user disconnect', function(user){
      $('#messages').append($('<li>').text(`${user.name} has disconnected`));
      var msgbox = document.getElementById("messages");
      msgbox.scrollTop = msgbox.scrollHeight;
    });  
  });



// document.cookie = "name=TEST";