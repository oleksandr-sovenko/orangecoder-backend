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


const events = require('events'),
	  path = require('path'),
	  moment = require('moment'),
	  fs = require('fs'),
	  vm = require('vm');

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


// DATETIME

const DATETIME = {
	timestamp: function() {
		return moment().unix();
	}
}


// GPIO

// GPIO.get = function() {

// };

// GPIO.post = function() {

// };


try {
	result = vm.runInNewContext(jscode + ';' + true, {
		CLOUD: CLOUD,
		HTTP: HTTP,
		GPIO: GPIO,
		STORAGE: STORAGE,
		CONSOLE: CONSOLE,
		DATETIME: DATETIME,

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

