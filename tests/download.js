var download = require('../index.js');
download.setUserAgent('silk-gui');
//download.debug();

function clean (path, next) {
	var exec = require('child_process').exec;
	exec('rm -r ./tests/output/' + path, function(err, data){
		console.log('rm err ', err);
	});
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
		clean('1');
	});

}
function download2 () {
	download({username: 'Silk-GUI', repo: 'Silk', output: './tests/output/2'}, function (err) {
		console.log('err2', err);
    console.log('finished 2');
		clean('2');
	});

}

download1();
download2();
