var omx 	= require('omx-manager');
var socket 	= require('socket.io-client')('http://127.0.0.1:1234');
var php		= require('phpjs');
var fs		= require('fs');
var http	= require('http');
var MP3_DIR	= './mp3';
var DEBUG	= true;


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
var playMusic = function(filename) {
	omx.stop();
	Debug("play " + filename);
	omx.play(filename);
}

//var Debug function
var Debug = function(data) {
	if (DEBUG)
		console.log(data);
}


socket.on('connect', function(){
	Debug("connected");
});
socket.on('play', function(data){
	Debug("play");
	Debug(data);
	if (phpjs.isset(data['url'])) {
		var filename = phpjs.basename(data['url']);
		var path = MP3_DIR + '/' + filename;
		download(data['url'], path, function() {
			playMusic(path);
		});
	}
});
socket.on('disconnect', function(){
	Debug("disconnect");
	omx.stop();
});