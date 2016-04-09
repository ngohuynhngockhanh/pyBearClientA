var socket 		= require('socket.io-client')('http://127.0.0.1:1234/bear');
var php			= require('phpjs');
var fs			= require('fs');
var http		= require('http');
var five 		= require("johnny-five");
var Raspi 		= require("raspi-io");
var board 		= new five.Board({
					io: new Raspi(),
					repl: false,
					debug: false,
				});

/* Johnny-five Side */
board.on("ready", function() {
	var playButton = new five.Button({
		pin: 27,
		isPullup: true,
		holdtime: 1000
	});
	
	
	
	playButton.on("hold", function(value) {
		Debug("button down hold");
		bear.togglePlaylist();
	});
	
	playButton.on("down", function() {
		if (bear.isPlayingPlaylist()) {
			Debug("next song");
			bear.nextSongPlaylist();
		}		
	});
});
				
//lib
var Bear		= require('./lib/bear');


//constant
const DEBUG		= true;

//config

var bear	= new Bear();



//var Debug function
var Debug = function(data) {
	if (DEBUG)
		console.log(data);
}



/* Socket side */
socket.on('connect', function(){
	Debug("connected");
	socket.emit("joinRoom", {roomID: bear.getRoomId()});
});
socket.on('play', function(data){
	Debug("play");
	Debug(data);
	if (phpjs.isset(data['url'])) {
		data['path'] = data['url'];
		bear.playMusic(data);
	}
});

socket.on('setVolume', function(data) {
	bear.setVolume(phpjs.intval(data['volume']));
});

socket.on('disconnect', function(){
	Debug("disconnect");
	bear.stop();
});

socket.on('updatePlaylist', function(data) {
	Debug("updatePlaylist");
	bear.updatePlaylist(data['uid'], data['playlist']);
});


//bear handle
bear.on('onCompleted', function() {
	Debug("script side - bear has just played song!")
});

bear.on('onPlayMusic', function(obj) {
	Debug("playing " + obj.path);
});