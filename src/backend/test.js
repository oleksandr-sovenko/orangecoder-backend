//var addon = MODULE.import('hello');
//
//console.log(addon.hello()); // 'world'

//fs = require('fs');

//console.log(fs);

I2C.BMP280.init();

//console.log( I2C.BMP280.data() );

setInterval(function() {
    console.log( I2C.BMP280.data() );
}, 3000);
