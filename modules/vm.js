// vm.js
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


var CLOUD = new events();

CLOUD.sendNotification = function(args) {
	console.log('sendNotification', args);
};

CLOUD.set = function() {

};

CLOUD.get = function() {

};

var STORAGE = {
	set: function(name, value) {

	},

	get: function(name) {

	},

	unset: function(name) {

	}
}

var HTTP = {
	get: function(url) {
		console.log(url)
	},

	post: function(url) {
		console.log(url)
	},

	put: function(url) {
		console.log(url)
	},

	delete: function(url) {
		console.log(url)
	},
}

try {
	result = vm.runInNewContext(
	`


	` + true, {
		CLOUD: CLOUD,
		HTTP: HTTP,
		STORAGE: STORAGE,
		console: console,
	}, { /*timeout: 10000,*/ });
} catch(e) {
	result = e.toString();
}
console.log(result);

setInterval(function() {
	CLOUD.emit('change-value', Math.floor(Math.random() * Math.floor(1000)));
}, 5000);