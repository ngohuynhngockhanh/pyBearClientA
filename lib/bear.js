/*
	Bear library
	@author: Ngo Huynh Ngoc Khanh
	@created time: 08042016

*/

const DEBUG		= true;


var fileExists 	= require('file-exists');
var php			= require('phpjs');
var Download 	= require('download');

module.exports = Bear;
function Bear(player, MongoClient, options) {
	var self = this;
	this.player = player;
	this.MongoClient = MongoClient;
	this.options = options || {};
	this.options.volume 	= this.options.volume 		|| 100;
	this.options.mp3_dir	= this.options.mp3_dir 		|| './../mp3';
	this.options.mongo_url	= this.options.mongo_url	|| "mongodb://localhost:27017/pyBearClient";
	this.options.room_id	= this.options.room_id		|| "BearNo1";
	this.setVolume(this.options.volum);
}

var p = Bear.prototype;


//get room id
p.getRoomId = function() {
	return this.options.room_id;
}

//set volumne
p.setVolume = function (volume) {
	volume = volume || 100;
	this.player.volume(volume);
	this.options.volume = volume;
}

//stop
p.stop = function() {
	this.player.stop();
}

//play music from path (local)
p.playMusicFromPath = function(path) {
	this.player.stop();
	if (path != "") {
		Debug("play " + path);
		this.player.play(path);
	}	
}


//play music
p.playMusic = function(obj) {	
	var self = this;
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
				.dest(this.options.mp3_dir)
				.run(function (err, files) {
					Debug(err);
					if (err == null) {
						var localPath = this.options.mp3_dir + '/' + url.substring(url.lastIndexOf('/')+1);
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
		self.playMusicFromPath(path);
	}
	
	//setup
	/**/
	// Use connect method to connect to the Server 
	this.MongoClient.connect(this.options.mongo_url, function(err, db) {
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