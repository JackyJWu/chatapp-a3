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

$(function () {
    var socket = io();
    // Handle Input
    $('form').submit(function(e){
      e.preventDefault(); // prevents page reloading

      // Submit button case handle

      // Name Change
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
      socket.emit('chat message', msg);
      $('#m').val('');
      return false;
    });


    // User Entered
    socket.on('user join', function(msg){
      $('#messages').append($('<li>').text(`[${msg.timestamp}] ${msg.message} has joined the room`));
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
      // console.log(msg, extract_cookie(), msg.cookie);
      // msg_str = "[" + msg.timestamp+ "] "+ msg.username +":" +msg.message;

      if (extract_cookie() == msg.cookie){
        console.log("MATCHING", extract_cookie(), msg.cookie);
        $('#messages').append($(`<li>[${msg.timestamp}] ${msg.username}:<b>${msg.message}</b></li>`));

      }else{
        msg_str = "[" + msg.timestamp+ "] "+ msg.username +":" +msg.message;
        $('#messages').append($('<li>').text(msg_str));

      }
    });

    // socket.on('seq-num', function(msg,cur_time){
    //   $('#messages').append($('<li>').text(msg));
    // });

    // User Disconnect
    socket.on('user disconnect', function(username){
    $('#messages').append($('<li>').text(`${username} has disconnected`));
  });  
  });



// document.cookie = "name=TEST";