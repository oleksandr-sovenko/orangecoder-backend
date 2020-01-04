// $1
// Copyright (C) 2019 Oleksandr Sovenko (info@oleksandrsovenko.com)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.


// const { stdout, stderr } = await exec('gpio readall');

//         var temp = stdout.split('\n'),
//             data = [],
//             fields = [];

//         for (var i in temp) {
//             var items = temp[i].split('|');

//             if (items.length > 1 && !/Physical/.test(temp[i])) {
//                 data.push({
//                     'H2+': items[1].trim(),
//                     'wPi': items[2].trim(),
//                     'Name': items[3].trim(),
//                     'Mode': items[4].trim(),
//                     'V': items[5].trim(),
//                     'Physical': items[6].trim()
//                 });

//                 data.push({
//                     'H2+': items[13].trim(),
//                     'wPi': items[12].trim(),
//                     'Name': items[11].trim(),
//                     'Mode': items[10].trim(),
//                     'V': items[9].trim(),
//                     'Physical': items[8].trim()
//                 });
//             }
//         }

//         return { success: true, msg:'', data: data }


const	events       = require('events'),
	  	path         = require('path'),
	  	moment       = require('moment'),
	  	fs           = require('fs'),
	  	vm           = require('vm'),
		{ execSync } = require('child_process');

const filename = path.join(__dirname, '..', 'data', 'algorithms', process.argv[2]);


var jscode = '';

if (fs.existsSync(filename))
	jscode = fs.readFileSync(filename, 'utf8');
else
	process.exit();


let GPIO    = new events();
let CLOUD   = new events();
let HTTP    = new events();
let STORAGE = new events();
let CONSOLE = new events();
let FILE    = new events();


// CLOUD

CLOUD.sendNotification = function(args) {
	console.log('sendNotification', args);
};

CLOUD.set = function() {

};

CLOUD.get = function() {

};


// HTTP

HTTP.get = function() {

};

HTTP.post = function() {

};


// CONSOLE

CONSOLE.log = function(message) {
	process.send(message);
};


// FILE

FILE.read = function(filename) {
	var content = '';

	try {
		content = fs.readFileSync(filename);
	} catch(e) {
		content = '';
	}

	return content;
};

FILE.write = function(filename, data) {
	fs.writeFileSync(filename, data);
};

FILE.append = function(filename, data) {
	fs.appendFileSync(filename, data);
};


// DATETIME

const DATETIME = {
	timestamp: function() {
		return moment().unix();
	},

	format: function(format) {
		return moment().format(format);
	}
}



// GPIO

GPIO.digitalRead = function(pin) {
	return execSync('gpio read ' + pin).toString().trim();
};

GPIO.digitalWrite = function(pin, value) {
	return execSync('gpio write ' + pin + ' ' + value).toString().trim();
};


try {
	result = vm.runInNewContext(jscode + ';' + true, {
		CLOUD: CLOUD,
		HTTP: HTTP,
		GPIO: GPIO,
		STORAGE: STORAGE,
		CONSOLE: CONSOLE,
		DATETIME: DATETIME,
		FILE: FILE,

		setInterval: setInterval,
		clearInterval: clearInterval,
		setTimeout: setTimeout,
		clearTimeout: clearTimeout,
	});
} catch(e) {
	result = e.toString();
}


process.on('message', function(data) {
	GPIO.emit('change', data);
});


if (result !== true)
	process.send(result);

