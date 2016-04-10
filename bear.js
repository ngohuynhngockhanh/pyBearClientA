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

function run_cmd(cmd, args, callBack ) {
    var spawn = require('child_process').spawn;
    var child = spawn(cmd, args);
    var resp = "";

    child.stdout.on('data', function (buffer) { resp += buffer.toString() });
    child.stdout.on('end', function() { callBack (resp) });
} // ()				
				
/* Johnny-five Side */
board.on("ready", function() {

	//define button
	var shutdownButton = new five.Button({
		pin: 4,
		isPullup: true,
		holdtime: 2000
	});
	var playButton = new five.Button({
		pin: 27,
		isPullup: true,
		holdtime: 1000
	});
	
	
	//playbutton
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
	
	//shutdownButton
	shutdownButton.on("hold", function() {
		Debug("shutdown the bear");
		run_cmd( "mongod", ["--shutdown"], function(text) { console.log (text) });//shutdown the bear
		run_cmd( "init", ["0"], function(text) { console.log (text) });//shutdown the bear
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