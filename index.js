var fs = require('fs'),
	path = require('path'),
	request = require('request'),
	yauzl = require('yauzl'),
	mkdirp = require('mkdirp'),
	async = require('async'),
	util = require('util'),
	events = require('events');

var log = function () {};
var userAgent = "";

function download(url, next){
	log(url);
	var options = {
	url: url,
	headers: {
		'User-Agent': userAgent
		}
	}
	log('temzip=' + __dirname + path.sep + 'test.zip')
	request(options).on('error', function (err){
		log(err);
		next(err);
	}).on("end", function () {
		log('finished downloading');
		next();
	}).pipe(fs.createWriteStream(__dirname + path.sep + 'test.zip'));
}

function extract(extractTo, next){
	log('extracting');
	try{

		yauzl.open(__dirname + path.sep + 'test.zip', function (err, zipfile) {
		  if (err) {
		    send(err);
		    return;
		  }
		  zipfile.once('end', function () {

		    fs.unlink(__dirname + path.sep + 'test.zip', function (err) {
		      if (err) {
		        return err;

		      }
		      log('unzipped');
		    })
		  });
		  // save files and folders
		  zipfile.on("entry", function (entry) {

		    if (/\/$/.test(entry.fileName)) {
		      // directory file names end with '/'
		      return;
		    }

		    var fileName = entry.fileName;
		    fileName = fileName.split(path.sep);
		    fileName = fileName.splice(1, fileName.length)
		    fileName = fileName.join(path.sep);

		    entry.fileName = fileName;
		    var dest = path.join(extractTo, entry.fileName)
		    var destDir = path.dirname(dest)
		      // dest = dest.split(path.sep);
		      // dest = dest.slice(0, dest.length - 1);

		    zipfile.openReadStream(entry, function (err, readStream) {
		      if (err) {
		        send(err);
		        return;
		      }

		      mkdirp(destDir, function (err) {
		        if (err) {
		          send(err);
		        }


		        //entry.fileName = data.url.replace("/", "-");
		        // ensure parent directory exists, and then:

		        readStream.pipe(fs.createWriteStream(dest).on("error", function (err) {
		          send(err)
		        }))
		      });

		    });

		  });
		});

	} catch (e) {
		log(e);
	}
}

module.exports = function (options, next) {
	if(!next){
		next = function(){};
	}
	options = options || {};
	console.dir(options);
	if(typeof options.username !== "string"){
		return next(new Error('github user name needs to be a string'));
	}
	if(typeof options.repo !== "string"){
		return next(new Error('githubRepo needs to be a string'));
	}
	if(typeof options.output !== "string"){
		return next(new Error('outputPath needs to be a string'));
	}
	version = options.version || "";
	if(version !== ""){
		if(version === "latest"){
			// download latest version
			var url = "https://api.github.com/repos/";
				url += options.username;
				url += '/';
				url += options.repo;
				url += '/releases/latest';
				log(url);
				var requestOpts = {
					uri : url,
					headers: {
						'User-Agent': userAgent
					}
				};
			request(requestOpts, function (err, data){
				log('err ', err);
				var body = JSON.parse(data.body);
				download(body.zipball_url, function (err) {
					if(err) {
						next(err);
						return err;
					}
					extract(options.output, function (err)  {
						log(err);
						log('finished unzipping');
						next();
					});
				});
			});
		} else {
			// TODO download version specified
			console.log('we only support "latest" for version');
		}

	} else {
		var url = "https://api.github.com/repos/";
			url += options.username;
			url += '/';
			url += options.repo;
			url += '/zipball';
	
		log(url);
		download(url, function (err) {
			if(err){
				next(err);
				return err;
			}
			extract(options.output, function (err) {
				log(err);
				log('finished unzipping');
				next();
			});
	});
	}
}
module.exports.setUserAgent = function (_userAgent) {
	userAgent = _userAgent;
}
module.exports.debug = function () {
	log = console.log;
}