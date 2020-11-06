$(function () {
    var socket = io();

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


      socket.emit('chat message', $('#m').val());
      $('#m').val('');
      return false;
    });
    // User Entered
    socket.on('user join', function(msg){
      $('#messages').append($('<li>').text(msg + "Joined"));
    });


    // Message is entered
    socket.on('chat message', function(msg,cur_time){
      $('#messages').append($('<li>').text(msg));
    });

    socket.on('seq-num', function(msg,cur_time){
      $('#messages').append($('<li>').text(msg));
    });

    // User Disconnect
    socket.on('user disconnect', function(msg){
    $('#messages').append($('<li>').text("User Disconnected"));
  });
  
  });