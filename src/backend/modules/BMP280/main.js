var { BMP280, GPIO, HC_SC04 } = require('./build/Release/BMP280');

BMP280.init();

var gpio14  = GPIO.output(14);
var hc_sc04 = HC_SC04(15, 16);

setInterval(function() {
	data = BMP280.data();

	console.log(data, hc_sc04.data(), gpio14.isLow(), gpio14.isHigh());

	if (gpio14.isLow())
		gpio14.high();
	else
		gpio14.low();
}, 1000);
