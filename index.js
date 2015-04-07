var fs = require('fs'),
	path = require('path'),
	request = require('request'),
	yauzl = require('yauzl'),
	mkdirp = require('mkdirp'),
	async = require('async'),
	util = require('util'),
	events = require('events');

/**
 * function used to output stuff to console.
 * if debug function is called in module.exports,
 * then this is changed to console.log
 */
var log = function () {};
/**
 * User agent used in requests to github
 * @type {string}
 */
var userAgent = "";
/**
 * Downloads a github repository and extracts
 * @param {object} options
 * @param {function} next - callback
 * @constructor
 */
var GithubDownloader = function (options, next) {
  var self = this;
  self.id = new Date().getTime() + '-' + Math.floor(Math.random()*10000000000000000);
  if(!(this instanceof GithubDownloader)){
    log('creating instance');
    return new GithubDownloader(options, next);
  }
  if(!next){
    next = function(){};
  }
  options = options || {};
  log(options);

  // check required fields for options
  if(typeof options.username !== "string"){
    return next(new Error('github user name needs to be a string'));
  }
  if(typeof options.repo !== "string"){
    return next(new Error('githubRepo needs to be a string'));
  }
  if(typeof options.output !== "string"){
    return next(new Error('outputPath needs to be a string'));
  }

  version = options.version;
  if(typeof version !== "undefined"){
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

      // get url for zip file
      request(requestOpts, function (err, data){
        if(err) {
          log('err ', err);
          return next(err);
        }
        var body = JSON.parse(data.body);
        download(body.zipball_url, self.id, function (err) {
          if(err) {
            return next(err);
          }
          extract(self.id, options.output, function (err)  {
            log(err);
            log('finished unzipping');
            next(err);
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

    download(url, self.id, function (err) {
      if(err){
        return next(err);
      }

      extract(self.id, options.output, function (err) {
        log(err);
        log('finished unzipping');
        next(err);
      });
    });
  }
};
function download(url, zipName, next){
	console.log(url);
	var options = {
	url: url,
	headers: {
		'User-Agent': userAgent
		}
	}
	log('temzip=' + __dirname + path.sep + zipName + '.zip')
	request(options).on('error', function (err){
		log(err);
		next(err);
	}).on("end", function () {
		log('finished downloading');
		next();
	}).pipe(fs.createWriteStream(__dirname + path.sep +  zipName + '.zip'));
}

function extract(zipName, extractTo, next){
	log('extracting');
	try{

		yauzl.open(__dirname + path.sep + zipName + '.zip', function (err, zipfile) {
		  if (err) {
		    return next(err);
		  }
		  zipfile.once('end', function () {

		    fs.unlink(__dirname + path.sep + zipName + '.zip', function (err) {
          log('unzipped');
          return next(err);
		    });
		  });
		  // save files and folders
		  zipfile.on("entry", function (entry) {

		    if (/\/$/.test(entry.fileName)) {
		      // directory file names end with '/'. ignore those.
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
		        return err;
		      }

		      mkdirp(destDir, function (err) {
		        if (err) {
		          return err;
		        }


		        //entry.fileName = data.url.replace("/", "-");
		        // ensure parent directory exists, and then:

		        readStream.pipe(fs.createWriteStream(dest).on("error", function (err) {
		          return next(err)
		        }))
		      });

		    });

		  });
		});

	} catch (e) {
		log(e);
    return next(e);
	}
}


module.exports = GithubDownloader;
module.exports.setUserAgent = function (_userAgent) {
	userAgent = _userAgent;
}
module.exports.debug = function () {
	log = console.log;
}