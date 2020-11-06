$(function () {
    var socket = io();

    $('form').submit(function(e){
      e.preventDefault(); // prevents page reloading

      // Submit button case handle
      socket.emit('chat message', $('#m').val());
      $('#m').val('');
      return false;
    });

    // Message is entered
    socket.on('chat message', function(msg,cur_time){
      $('#messages').append($('<li>').text(cur_time));
    });

    // User Disconnect
    socket.on('disconnect', function(msg){
    $('#messages').append($('<li>').text("User Disconnected"));
  });
  
  });