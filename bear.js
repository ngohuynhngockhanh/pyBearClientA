var Mpg 		= require('mpg123');
var socket 		= require('socket.io-client')('http://127.0.0.1:1234/bear');
var php			= require('phpjs');
var fs			= require('fs');
var http		= require('http');
var MongoClient = require('mongodb').MongoClient;
var five = require("johnny-five");
var Raspi = require("raspi-io");
var board = new five.Board({
		io: new Raspi(),
		repl: false,
		debug: false,
	});
var Bear		= require('./lib/bear');


//constant
const DEBUG		= true;

//config
var player 	= new Mpg();
var bear	= new Bear(player, MongoClient);



//var Debug function
var Debug = function(data) {
	if (DEBUG)
		console.log(data);
}

/* Johnny-five Side */
board.on("ready", function() {
});

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