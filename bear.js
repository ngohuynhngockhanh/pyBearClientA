var Mpg 		= require('mpg123');
var socket 		= require('socket.io-client')('http://127.0.0.1:1234/bear');
var php			= require('phpjs');
var fs			= require('fs');
var http		= require('http');
var MongoClient = require('mongodb').MongoClient,
	assert 		= require('assert');
var Download = require('download');
var fileExists = require('file-exists');

//constant
const MP3_DIR	= './mp3';
const DEBUG		= true;
const ROOMID	= "BearNo1";
const MONGO_URL	= "mongodb://localhost:27017/pyBearClient";

//config
var player 	= new Mpg();
player.volume(100);


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
var playMusicFromPath = function(path) {
	player.stop();
	if (path != "") {
		Debug("play " + path);
		player.play(path);
	}	
}
var playMusic = function(obj) {	
	var path 	= obj['path'];
	var sid		= obj['sid'];
	var uid		= obj['uid'];
	//function
	var formatObject = function(obj) {
		return {
			sid: obj.sid,
			uid: obj.uid,
			'delete': false,
			extra: obj
		};
	}
	//find story
	var findStorys = function(db, callback) {
		// Get the documents collection 
		var collection = db.collection('storyMP3');
		// Find some documents 
		collection.find({
			'sid': sid
		}).toArray(function(err, docs) {
			callback(docs);
		});
	}
	
	//insert story
	var insertStory = function(db, callback) {
		// Get the documents collection 
		var collection = db.collection('storyMP3');
		collection.insert(formatObject(obj), function(err, result) {
			Debug("Inserted");
			callback(result);
		});
	}
	
	//update story
	var updateStory = function(oldObj, newObj, db, callback) {
		var collection = db.collection('storyMP3');
		var path = '';
		if (oldObj.extra.path != newObj.extra.path || !oldObj.extra.localPath || !fileExists(oldObj.extra.localPath)) {
			var url = newObj.extra.path;
			var url_explode = phpjs.explode("/", url);
			url_explode[url_explode.length - 1] = phpjs.urlencode(url_explode[url_explode.length - 1]);
			url = phpjs.implode("/", url_explode);
			path = url;
			new Download({mode: '755'})
				.get(url)
				.dest(MP3_DIR)
				.run(function (err, files) {
					Debug(err);
					if (err == null) {
						var localPath = MP3_DIR + '/' + url.substring(url.lastIndexOf('/')+1);
						collection.updateOne({
							sid : obj.sid 
						}, {
							$set: {
								"extra.localPath": localPath,
								'delete'		 : false,
							}
						}, function(err, result) {
							Debug("Downloaded!");
							callback(url);
						});
					} else {
						callback(url);
					}
				});
		} else {
			callback(oldObj.extra.localPath);
			path = oldObj.extra.localPath;
		}
		playMusicFromPath(path);
	}
	
	//setup
	/**/
	// Use connect method to connect to the Server 
	MongoClient.connect(MONGO_URL, function(err, db) {
		Debug("Connected correctly to server");
		findStorys(db, function(docs) {
			if (docs.length > 0) {
				Debug(docs);
				Debug("Found");
				updateStory(docs[0], formatObject(obj), db, function(path) {
					db.close();
				});
			} else {
				Debug("not found");
				insertStory(db, function(result) {
					Debug(result);
					var ops = result.ops;
					
					updateStory({extra: {path:""}}, ops[0], db, function(path) {
						db.close();
					});
				});
			}			
		});
	});
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
		data['path'] = data['url'];
		playMusic(data);
	}
});

socket.on('setVolume', function(data) {
	var volume = phpjs.intval(data['volume']);
	player.volume(volume);
});

socket.on('disconnect', function(){
	Debug("disconnect");
	player.stop();
});