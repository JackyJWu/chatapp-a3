$(function () {
    var socket = io();
    $('form').submit(function(e){
      e.preventDefault(); // prevents page reloading
      socket.emit('chat message', $('#m').val());
      $('#m').val('');
      return false;
    });
    socket.on('chat message', function(msg,cur_time){
        console.log("JSDAFS");
        console.log(cur_time);
      $('#messages').append($('<li>').text(cur_time));
    });
  });