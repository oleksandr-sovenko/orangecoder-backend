// app.js
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

global.sessions = [];
global.clients = {};

const os = require('os');
const fs = require('fs');
const fastify = require('fastify')({ logger: false })

fastify.register(require('fastify-cors'))
fastify.register(require('fastify-ws'))

fastify.register(require('./modules/auth'))
fastify.register(require('./modules/gpio'))
fastify.register(require('./modules/gpio-devices'))

fastify.listen(3000, '0.0.0.0');

/**
 */
setInterval(function() {
	var length = Object.keys(global.clients).length;

	if (length) {

		global.get_cpu_usage(function(usage) {
			var temperature = Math.round(parseFloat(fs.readFileSync('/sys/class/thermal/thermal_zone0/temp')) / 1000);

			for (var id in global.clients) {
				global.clients[id].send(JSON.stringify({
					action: 'status',
					data: {
						memory: {
							free: os.freemem(),
							total: os.totalmem(),
						},
						cpu: {
							temperature: temperature,
							usage: usage
						}
					},
				}));
			}
		});	

	}
}, 3000);

/** fastify.ready
 */
fastify.ready(function(err) {
 	fastify.ws.on('connection', function(socket) {
 		var id = Math.random()

 		global.clients[id] = socket;

		socket.on('message', function(msg) {
			socket.send(msg)
		})

		socket.on('close', function() {
			delete global.clients[id];
		});
    });
})

/** get_unix_timestamp
 */
global.get_unix_timestamp = function() {
	return Math.round(new Date().getTime() / 1000);
}

/** is_authorized
 * @param request
 */
global.is_authorized = function(request) {
	const timestamp = global.get_unix_timestamp();

	if (request.headers.authorization !== undefined &&
	    global.sessions[request.headers.authorization] !== undefined &&
	    global.sessions[request.headers.authorization].expire > timestamp) {
		return true;
	} else {
	    return false;
	}
}

/** get_cpu_info
 * @param callback
 */
global.get_cpu_info = function(callback) { 
    var cpus = os.cpus();
	
    var user  = {};
    var nice  = {};
    var sys   = {};
    var idle  = {};
    var irq   = {};
    var total = {};
	
    for(var cpu in cpus){
        if (!cpus.hasOwnProperty(cpu)) continue;

        if (user[cpu] === undefined) user[cpu] = 0;
        if (nice[cpu] === undefined) nice[cpu] = 0;
        if (sys[cpu]  === undefined) sys[cpu]  = 0;
        if (irq[cpu]  === undefined) irq[cpu]  = 0;
        if (idle[cpu] === undefined) idle[cpu] = 0;

        user[cpu] += cpus[cpu].times.user;
        nice[cpu] += cpus[cpu].times.nice;
        sys[cpu]  += cpus[cpu].times.sys;
        irq[cpu]  += cpus[cpu].times.irq;
        idle[cpu] += cpus[cpu].times.idle;
    	total[cpu] = user[cpu] + nice[cpu] + sys[cpu] + idle[cpu] + irq[cpu];
    }
	
    return {
        'idle': idle, 
        'total': total
    };
}

/** get_cpu_usage
 * @param callback
 */
global.get_cpu_usage = function(callback) { 
	var result = [];

    var stats = global.get_cpu_info();
    var startIdle = stats.idle;
    var startTotal = stats.total;

    setTimeout(function() {
        var stats = global.get_cpu_info();
        var endIdle = stats.idle;
        var endTotal = stats.total;
		
		var cpus = os.cpus();
 		for (var cpu in cpus) {
        	if (!cpus.hasOwnProperty(cpu)) continue;

        	var idle  = endIdle[cpu]  - startIdle[cpu];
        	var total = endTotal[cpu] - startTotal[cpu];

			result.push({
				percentage: Math.round(100 - ((idle / total) * 100))
			});

        }

		callback(result);
    }, 1000);
}

/** helper_pin_event_change
 * @param pin
 */
global.helper_pin_event_change = function(pin) {
	const { spawn } = require('child_process');
	const child = spawn('./helpers/pin-event-change', ['output', pin, 100]);

	child.stderr.on('data', (chunk) => {
    	console.log(chunk.toString().trim());
	});

	// child.on('close', (_code, _signal) => {
	// });
};

