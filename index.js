var fs = require('fs'),
	path = require('path'),
	request = require('request'),
	yauzl = require('yauzl'),
	mkdirp = require('mkdirp'),
	async = require('async'),
	util = require('util'),
	events = require('events');

var userAgent = "";

function download(url, next){
	var options = {
	url: url,
	headers: {
		'User-Agent': userAgent
		}
	}
	console.log('temzip=' + __dirname + path.sep + 'test.zip')
	request(options).on('error', function (err){
		console.log(err);
		next(err);
	}).on("end", function () {
		console.log('finished downloading');
		next();
	}).pipe(fs.createWriteStream(__dirname + path.sep + 'test.zip'));
}

function extract(extractTo, next){
	console.log('extracting');
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
		      console.log('unzipped');
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
		console.log(e);
	}
}

module.exports = function (githubUser, githubRepo, outputPath, next) {
	if(!next){
		next = function(){};
	}
	if(typeof githubUser !== "string"){
		return next(new Error('github user name needs to be a string'))
	}
	if(typeof githubRepo !== "string"){
		return next(new Error('githubRepo needs to be a string'))
	}
	if(typeof outputPath !== "string"){
		return next(new Error('outputPath needs to be a string'))
	}

	var url = "https://api.github.com/repos/";
		url += githubUser;
		url += '/';
		url += githubRepo;
		url += '/zipball';
	console.log(url);
	download(url, function (err) {
		if(err){
			next(err);
			return err;
		}
		extract(outputPath, function (err) {
			console.log(err);
			console.log('finished unzipping');
			next();
		});
	})
}
module.exports.setUserAgent = function (_userAgent) {
	userAgent = _userAgent;
}