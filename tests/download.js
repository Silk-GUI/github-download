var download = require('../index.js'),
	fs = require('fs');

download.setUserAgent('silk-gui');



//download.debug();

function clean (path, next) {
	var exec = require('child_process').exec;
	exec('rm -r ' + path, function(err, data){
		console.log('rm err ', err);
	});
}

function check (path, next) {
	var list = fs.readdirSync(path);
	if(list < 5) {
		throw new Error("didn't extract all files");
	}
	next();
}

function download1 () {
	download({
		username: 'Silk-GUI',
		repo: 'Silk',
		version: 'latest',
		output: './tests/output/1'
	}, function (err) {
		console.log('err1', err);
		console.log('finished 1');
		check('./tests/output/1/', function () {clean('./tests/output/1')});
	});

}
function download2 () {
	download({username: 'Silk-GUI', repo: 'Silk', output: './tests/output/2'}, function (err) {
		console.log('err2', err);
    console.log('finished 2');
		check('./tests/output/2/', function () {clean('./tests/output/2')});
	});

}
function download (path, version) {
	download({
		username: 'Silk-GUI',
		repo: 'Silk',
		version: version,
		output: path
	}, function (err) {
		console.log('err1', err);
		console.log('finished ', path, ' at ', version);
		check(path, function () {clean(path)});
	});
}

download1();
download2();
