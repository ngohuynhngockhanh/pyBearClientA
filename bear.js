var socket 		= require('socket.io-client')('http://ourshark.co:8000/bear');
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
	console.log("started PRi bear");
	//define button
	var shutdownButton = new five.Button({
		pin: 4,
		isPullup: true,
		holdtime: 2000
	});
	var playButton = new five.Button({
		pin: 5,
		isPullup: true,
		holdtime: 1000
	});
	
	
	
	var BearIn1 = new five.Relay({
	  pin: 0,
	  type: "NC"
	});
	
	var BearIn2 = new five.Relay({
	  pin: 2,
	  type: "NC"
	}); 
	
	BearIn1.open();
	BearIn2.open();
	
	var timeOutHeadBear = undefined;
	
	var stopBear = function(stopAll) {
		BearIn1.close();
		BearIn2.close();
		if (stopAll)
			if (timeOutHeadBear) {
				clearTimeout(timeOutHeadBear)
				bearDown(1000)
			}
	}
	
	var bearDown = function(timeout, randomMove) {
		BearIn1.open();
		BearIn2.close();
		if (timeout) {
			if (timeOutHeadBear)
				clearTimeout(timeOutHeadBear);
			timeOutHeadBear = setTimeout(function() {
				
				if (randomMove) {
					var time = php.rand(300, 700);
					bearUp(time, true)
				}
				else stopBear();
			}, timeout);
		}
	}
	
	var bearUp = function(timeout, randomMove) {
		BearIn1.close();
		BearIn2.open();
		if (timeout) {
			if (timeOutHeadBear)
				clearTimeout(timeOutHeadBear);
			timeOutHeadBear = setTimeout(function() {
				if (randomMove) {
					var time = php.rand(400, 1000);
					bearDown(time, true)
				}
				else stopBear();
			}, timeout);
		}
	}
	
	bearUp(1000)
	
	//bear handle
	bear.on('onCompleted', function() {
		Debug("script side - bear has just played song!")
		stopBear(true)
	});

	bear.on('onPlayChapter', function(obj) {
		Debug("playing Chappter (Sid " + obj.sid + ", index " + obj.index + "), path: " + obj.path);
		bearDown(1000, true)
	});
	
	//playbutton
	var isHold = false;
	playButton.on("hold", function() {
		if (!isHold) {
			bear.togglePlaylist();
			isHold = true;
		}
		Debug("button down hold");
	});
	
	playButton.on("up", function() {
		Debug("button up");
		isHold = false;
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
socket.on('playFromURL', function(data) {
	Debug("play from url");
	var url = data['url'];
	var uid = data['uid'];
	bear.playMusicFromPath(url);
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



console.log("started bear");