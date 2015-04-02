var download = require('../index.js');
download.setUserAgent('silk-gui');
download.debug();
function clean (next) {
	var exec = require('child_process').exec;
	exec('rm -r ./tests/output', function(err, data){
		console.log(err);
		next()
	});
}

function download1 () {
	download({
		username: 'Silk-GUI',
		repo: 'Silk',
		version: 'latest',
		output: './tests/output'
	}, function (err) {
		console.log(err);
		console.log('finished 1');
		clean(download2);
	});

}
function download2 () {
	download('Silk-GUI', 'Silk', './tests/output');
	console.log('finished tests');
	clean();
}

download1();

