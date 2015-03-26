var download = require('../index.js');
console.dir(download);
download.setUserAgent('silk-gui');
download('Silk-GUI', 'Silk', './tests/output');