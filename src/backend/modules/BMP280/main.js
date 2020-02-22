var BMP280 = require('./build/Release/BMP280');

BMP280.init();

setInterval(function() {
	console.log(BMP280.data());
}, 1000);
