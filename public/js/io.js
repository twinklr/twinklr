/*
 * handle websockets
 */
var socket = io();
socket.on('movement', function(data){
  window.stave.trigger('mousewheelUpdate', data);
});
