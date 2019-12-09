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
	  fs = require('fs');
	  vm = require('vm');

console.log(process.argv[2]);


let CLOUD   = new events();
let HTTP    = new events();
let STORAGE = new events();


// if (fs.existsSync(filename)) {
// jscode = '';


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

HTTP.put = function() {

};

HTTP.delete = function() {

};


// try {
// 	result = vm.runInNewContext(jscode + true, {
// 		CLOUD: CLOUD,
// 		HTTP: HTTP,
// 		STORAGE: STORAGE,
// 		console: console,
// 		setInterval: setInterval
// 	}, { contextName: 'context-1' });
// } catch(e) {
// 	result = e.toString();
// }

// console.log(result);
