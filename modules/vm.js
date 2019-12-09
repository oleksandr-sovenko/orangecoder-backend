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


async function routes(fastify, options) {
    /** Get list of pins
     *  @endpoint /gpio
     */
    fastify.get('/gpio', async function(request, reply) {
        return { success: true, msg:'', data: data }
    })


    /** Get list of devices
     *  @endpoint /gpio/devices
     *  @method   GET
     */
    fastify.get('/gpio/devices', async function(req, rep) {
        return { success: true, msg:'', data: devices }
    })


    /** Add new device
     *  @endpoint /gpio/device
     *  @method   PUT
     */
    fastify.put('/gpio/device', async function(req, rep) {
        return { success: true, msg:'' }
    })


    /** Get data of the device
     *  @endpoint /gpio/device/:id
     *  @method   GET
     */
    fastify.get('/gpio/device/:id', async function(req, rep) {
        return {}
    })


    /** Update a device
     *  @endpoint /gpio/device/:id
     *  @method   POST
     */
    fastify.post('/gpio/device/:id', async function(req, rep) {
        return { success: true, msg:'' }
    })
}

module.exports = routes







/*
// https://stackoverflow.com/questions/11652530/node-js-vm-how-to-cancel-script-runinnewcontext?lq=1
// https://itnext.io/multi-threading-and-multi-process-in-node-js-ffa5bb5cde98

global.CLOUD   = new events();
global.HTTP    = new events();
global.STORAGE = new events();


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
// 	result = vm.runInNewContext(
// 	`

// 	function asdasd() {
// 		setInterval(function() {
// 			console.log('111')
// 		}, 1000);
// 	}

// 	asdasd();

// 	` + true, {
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



// setTimeout(function() {
// 	try {
// 		result = vm.runInNewContext(
// 		`
// 		function asdasd() {
// 			setInterval(function() {
// 				console.log('222')
// 			}, 1000);
// 		}

// 		asdasd();
	
// 		` + true, {
// 			CLOUD: CLOUD,
// 			HTTP: HTTP,
// 			STORAGE: STORAGE,
// 			console: console,
// 			setInterval: setInterval
// 		}, { contextName: 'context-1' });
// 	} catch(e) {
// 		result = e.toString();
// 	}
	
// 	console.log(result);
// }, 5000);





const { fork } = require('child_process');
const process = fork('./modules/send_email.js');
process.send({ test: 456 });
process.on('message', async function(message) {
	console.log('parent:', message);
});

setTimeout(function() {
	process.kill();
}, 10000)
*/







