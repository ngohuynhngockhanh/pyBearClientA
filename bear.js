var Mpg 	= require('mpg123');
var socket 	= require('socket.io-client')('http://127.0.0.1:1234/bear');
var php		= require('phpjs');
var fs		= require('fs');
var http	= require('http');

//constant
var MP3_DIR	= './mp3';
var DEBUG	= true;
var ROOMID	= "BearNo1";

//config
var player 	= new Mpg();


//download function
var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};

//play music
var playMusic = function(path) {	
	player.stop();
	Debug("play " + path);
	player.play(path);
}

//var Debug function
var Debug = function(data) {
	if (DEBUG)
		console.log(data);
}


socket.on('connect', function(){
	Debug("connected");
	socket.emit("joinRoom", {roomID: ROOMID});
});
socket.on('play', function(data){
	Debug("play");
	Debug(data);
	if (phpjs.isset(data['url'])) {
		path = data['url'];
		playMusic(path);
	}
});
socket.on('disconnect', function(){
	Debug("disconnect");
	player.stop();
});