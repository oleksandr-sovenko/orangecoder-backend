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

global.events  = require('events');
global.vm      = require('vm');
global.os      = require('os');
global.fs      = require('fs');
global.path    = require('path');
global.uuid4   = require('uuid4')
global.fastify = require('fastify')({ logger: false });
global.util    = require('util');
global.md5     = require('md5');
global.base64  = require('js-base64').Base64;
global.request = require('request-promise-native');
global.exec    = util.promisify(require('child_process').exec);
global.readdir = util.promisify(fs.readdir);



let clients = {};



// require('./modules/vm');

/** getDeviceInfo
 *
 */
global.getDeviceInfo = function(){
	var model = 'Unknown',
		serial = 'Unknown',
		version = '';

	if (fs.existsSync('/etc/armbian-release')) {
		model = fs.readFileSync('/etc/armbian-release')
				.toString()
				.replace(/.*BOARD_NAME="/s, '')
				.replace(/".*/s, '').trim();

		version = fs.readFileSync('/etc/armbian-release')
				.toString()
				.replace(/.*VERSION=/s, '')
				.replace(/\n.*/s, '').trim();
	}

	if (fs.existsSync('/proc/cpuinfo'))
		serial = fs.readFileSync('/proc/cpuinfo')
				.toString()
				.replace(/.*Serial		: /s, '').trim();

	return {
		platform: 'Linux',
    	version: os.release() + (version !== '' ? ', Armbian ' + version : ''),
    	model: model,
    	manufacturer: 'Xunlong',
    	serial: serial
	}
}


global.device = getDeviceInfo();


/** is_authorized
 *  @param request
 */
global.is_authorized = function(req) {
	const timestamp = global.getUnixTimestamp();

	if (req.headers['backend-authorization'] !== undefined &&
	    global.sessions[req.headers['backend-authorization']] !== undefined &&
	    global.sessions[req.headers['backend-authorization']].expire > timestamp) {
		return true;
	} else {
	    return false;
	}
}


/** getCpuUsage
 *  @param callback
 */
global.getCpuUsage = function(callback) {
	var result = [];

    var stats = global.getCpuInfo();
    var startIdle = stats.idle;
    var startTotal = stats.total;

    setTimeout(function() {
        var stats = global.getCpuInfo();
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


/** helperPinEventChange
 *  @param pin
 */
global.helperPinEventChange = function(args) {
	const { spawn } = require('child_process');
	const child = spawn('./helpers/pin-event-change', args);

	child.stderr.on('data', function(data) {
		let json_data = {};

		try {
			json_data = JSON.parse(data.toString().trim());
		} catch(e) {
			json_data = {};
		}

		appAlgorithmProcessSendForAll(json_data);
		appWSSendForAll(data.toString().trim());
	});

	return child
};


fastify.register(require('fastify-cors'))
fastify.register(require('fastify-ws'))
fastify.register(require('fastify-formbody'))
fastify.register(require('fastify-static'), {
	root: path.join(__dirname, 'public'),
})


//fastify.register(require('./modules/cloud'));
fastify.register(require('./modules/filesystem'));
fastify.register(require('./modules/auth'));
fastify.register(require('./modules/gpio'));
fastify.register(require('./modules/w1'));
fastify.register(require('./modules/algorithms'));


/**
 *
 */
fastify.get('/', function(req, reply) {
	reply.sendFile('index.html');
})


/**
 *
 */
fastify.get('/device', async function(req, rep) {
	return device
})


fastify.listen(80, '0.0.0.0');


/** fastify.ready
 *
 */
fastify.ready(async function(err) {
 	fastify.ws.on('connection', function(socket) {
 		var id = Math.random()

 		clients[id] = socket;

		socket.on('message', function(msg) {
			socket.send(msg)
		})

		socket.on('close', function() {
			delete clients[id];
		});
    });
})


/** getUnixTimestamp
 *
 */
global.getUnixTimestamp = function() {
	return Math.round(new Date().getTime() / 1000);
}


/** getCpuInfo
 *  @param callback
 */
global.getCpuInfo = function(callback) {
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


/**
 *
 */
global.appWSSendForAll = function(data) {
    for (var id in clients) {
        try {
            clients[id].send(data);
        } catch(e) {
            console.log(e);
        }
    }
}


/**
 *
 */
setInterval(async function() {
	const disk_total = await exec('df -h | grep "/$" | awk \'{ print $2 }\''),
		  disk_free  = await exec('df -h | grep "/$" | awk \'{ print $4 }\''),
	      length     = Object.keys(clients).length;


	if (length) {
		global.getCpuUsage(function(usage) {
			var temperature = Math.round(parseFloat(fs.readFileSync('/sys/class/thermal/thermal_zone0/temp')) / 1000);

			appWSSendForAll(JSON.stringify({
				action: 'status',
				data: {
					memory: {
						free: os.freemem(),
						total: os.totalmem(),
					},
					disk: {
						free: parseInt(disk_free.stdout) * 1073741824,
						total: parseInt(disk_total.stdout) * 1073741824,
					},
					cpu: {
						temperature: temperature,
						usage: usage
					},
					loadavg: os.loadavg(),
					uptime: os.uptime(),
				},
			}));
		});
	}
}, 3000);
