var { BMP280, GPIO, HC_SC04 } = require('./build/Release/core');

//BMP280.init();

//var gpio14  = GPIO.output(14);
var hc_sc04 = HC_SC04(15, 16);

setInterval(function() {
	//data = BMP280.data();

	var data = hc_sc04.distance_cm();

	console.log(data);

	//if (sm < 20)
	//	gpio14.high();
	//else
	//	gpio14.low();
}, 1000);
