/*
	Bear library
	@author: Ngo Huynh Ngoc Khanh
	@created time: 08042016

*/

const DEBUG		= false;

var Mpg 		= require('mpg123');
var fileExists 	= require('file-exists');
var php			= require('phpjs');
var Download 	= require('download');
var MongoClient = require('mongodb');
var events 		= require('events');
var util 		= require('util');
module.exports 	= Bear;
function Bear(options) {
	events.EventEmitter.call(this);
	var self = this;
	this._player 				= new Mpg();
	this._MongoClient 			= MongoClient.MongoClient;
	this._currentPlaylistCounter= -1;
	this._playlist				= {};
	
	this.options = options || {};
	this.options.volume 	= this.options.volume 		|| 100;
	this.options.mp3_dir	= this.options.mp3_dir 		|| './../mp3';
	this.options.mongo_url	= this.options.mongo_url	|| "mongodb://localhost:27017/pyBearClient";
	this.options.room_id	= this.options.room_id		|| "BearNo1";
	this.setVolume(this.options.volume);
	
	//init
	//this.__counter = 0;
	this._player.on('end', function() {
		//if (self.__counter++ % 2 == 1)
			self._finishSong();
	});
	
	//init default playlist
	var selectConfigOldPlaylist = function(db, callback) {
		var collection = db.collection('config');
		
		collection.find({key: 'oldPlaylist'}).toArray(function(err, docs) {
			var config = docs[0];
			config.value = config.value || [];
			callback(config.value);
		});
	}
	this._MongoClient.connect(this.options.mongo_url, function(err, db) {
		Debug("Connected correctly to server");
		selectConfigOldPlaylist(db, function(playlist) {
			self._playlist = playlist;
			db.close();
		}); 
	});
	
}
util.inherits(module.exports, events.EventEmitter);
var p = Bear.prototype;


/* PRIVATE */
p._finishSong = function() {
	var self = this;
	Debug("Song is played!");
	if (self.isPlayingPlaylist()) {
		//increase counter
		this._currentPlaylistCounter = (this._currentPlaylistCounter + 1) % this._playlist.length;
		
		//play next song
		this.playMusic(this._playlist[this._currentPlaylistCounter]);
		self.emit("onPlayNextSongInPlaylist", this._currentPlaylistCounter);
	}
	
	self.emit("onCompleted");
}


/* PUBLIC */

//updatePlaylist
p.updatePlaylist = function(uid, playlist) {
	var self = this;
	var playlistExists = function(db, callback) {
		// Get the playlist collection
		var collection = db.collection('playlist');
		
		collection.find({uid: uid}).toArray(function(err, docs) {
			var ret = (docs.length != 0) ? docs[0] : false;
			callback(ret);
		});
	}
	var insertNullPlaylist = function(db, callback) {
		// Get the playlist collection
		var collection = db.collection('playlist');
		collection.insert({uid: uid}, function(err, result) {
			Debug("Inserted");
			callback(result);
		});
	}
	var updatePlaylist = function(db, callback) {
		// Get the playlist collection 
		var collection = db.collection('playlist');
		collection.updateOne({
			uid: uid
		}, {
			$set: {
				"playlist"		 : playlist
			}
		}, function(err, result) {
			Debug("Updated!");
			//update bear's current playlist
			self._currentPlaylistCounter 	= 0;
			self._playlist 					= playlist;
			callback(playlist);
		});
	}
	
	var updateOldPlaylist = function(db) {
		var collection = db.collection('config');
		
		collection.updateOne({
			key: 'oldPlaylist'
		}, {
			$set: {
				"value"		 : playlist
			}
		}, function(err, result) {
			Debug("Config oldPlaylist updated");
		});
	}
	//update old playlist
	this._MongoClient.connect(this.options.mongo_url, function(err, db) {
		Debug("Connected correctly to server");
		updateOldPlaylist(db);
		playlistExists(db, function(playlist) {
			if (playlist == false) {
				insertNullPlaylist(db, function (playlist) {
					Debug("insert null playlist");
					updatePlaylist(db, function (playlist) {
						Debug("updated playlist");
						self.emit("onUpdatedPlaylist", playlist);
						db.close();
					});
				});
			} else {
				updatePlaylist(db, function (playlist) {
					Debug("updated playlist");
					self.emit("onUpdatedPlaylist", playlist);
					db.close();
				});
			}
		}); 
	});
}


//next song in playlist
p.nextSongPlaylist = function() {
	if (!this.isPlayingPlaylist()) return; //not yet
	
	this._currentPlaylistCounter = (this._currentPlaylistCounter + 1) % this._playlist.length;
	this.playMusic(this._playlist[this._currentPlaylistCounter]);
}

//start the playlist
p.startPlaylist = function() {
	if (this._playlist.length == 0) {
		return;//no playlist
	}
	this._currentPlaylistCounter = (this._currentPlaylistCounter + 1) % this._playlist.length;
	this.playMusic(this._playlist[this._currentPlaylistCounter]);
}

//stop the playlist
p.stopPlaylist = function() {
	if (!this.isPlayingPlaylist())
		return;
	this._currentPlaylistCounter = -1;
	this.stop();
}

//toggle playlist
p.togglePlaylist = function() {
	if (this.isPlayingPlaylist())
		this.stopPlaylist();
	else
		this.startPlaylist();
}

//get isPlaying playlist
p.isPlayingPlaylist = function() {
	return this._currentPlaylistCounter != -1 && this._playlist.length > 0;
}

//get room id
p.getRoomId = function() {
	return this.options.room_id;
}

//set volumne
p.setVolume = function (volume) {
	volume = volume || 100;
	this._player.volume(volume);
	this.options.volume = volume;
	var self = this;
	self.emit("onSetVolume", volume);
}

//stop
p.stop = function() {
	this._player.stop();//real stop
	this.emit("onStop");
}

//play music from path (local)
p.playMusicFromPath = function(path) {
	if (path != "") {
		Debug("play " + path);
		this._player.play(path);
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
				.dest(self.options.mp3_dir)
				.run(function (err, files) {
					Debug(err);
					if (err == null) {
						var localPath = self.options.mp3_dir + '/' + url.substring(url.lastIndexOf('/')+1);
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
	this._MongoClient.connect(self.options.mongo_url, function(err, db) {
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
	
	self.emit("onPlayMusic", obj);
}

//var Debug function
var Debug = function(data) {
	if (DEBUG)
		console.log(data);
}