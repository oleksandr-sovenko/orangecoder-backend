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

// @command pkg -t node12.2.0-linux-armv7 -o orangecoder-node12.2.0-linux-armv7-1.0 app.js


global.backend = {};


const config  = require('./config'),
	  net     = require('net'),
	  vm      = require('vm'),
	  os      = require('os'),
	  fs      = require('fs'),
	  fastify = require('fastify')({ logger: false }),
	  path    = require('path'),
	  { fork, execSync } = require('child_process'),
	  PROCESS = require('./include/process'),
	  SESSION = require('./include/session'),
	  { HASH, DATETIME, W1, I2C, GPIO, FILE } = require('./include/namespace');


var clients = {};


function fastify_ws_sendall(data) {
	for (var id in clients) {
	    try {
	        clients[id].send(data);
	    } catch(e) {
	        console.log(e);
	    }
	}
}


/**
 *	Install Service
 *
 *	@command uninstall
 */
if (process.argv[2] === 'install') {
	var service = '' +
		'[Unit]\n' +
		'Description=OrangeCoder.org\n' +
		'After=network.target\n' +
		'StartLimitIntervalSec=0\n' +
		'[Service]\n' +
		'Type=simple\n' +
		'Restart=always\n' +
		'RestartSec=1\n' +
		'User=root\n' +
		'ExecStart=' + process.argv[0] + ' serve\n' +
		'' +
		'[Install]\n' +
		'WantedBy=multi-user.target\n';

	try {
		fs.writeFileSync('/etc/systemd/system/orangecoder.service', service);
	} catch(e) {
		console.log(e);
	}

	execSync('systemctl enable orangecoder');

	process.exit();
}


/**
 *	Uninstall Service
 *
 *	@command uninstall
 */
if (process.argv[2] === 'uninstall') {
	execSync('systemctl disable orangecoder');

	try {
		fs.unlinkSync('/etc/systemd/system/orangecoder.service');
	} catch(e) {
		console.log(e);
	}

	process.exit();
}


/**
 *  VM (Executing JavaScript)
 *
 *	@command vm
 */
if (process.argv[2] === 'vm') {
	var filename = process.argv[3],
		jscode = '';


	if (fs.existsSync(filename))
		jscode = fs.readFileSync(filename, 'utf8');
	else
		process.exit();


	// Inter Process Communications {
		var client = net.connect({ path: config.socket.ipc }, function() {

		});

		client.on('data', function(data) {
			//GPIO.emit('change', data);
		});

		client.on('end', function() {
			// console.log('disconnected from server');
		});

		client.on('error', function(err) {
			// console.log(err);
		});
	// }


	// uncaughtException {
		process.on('uncaughtException', function(err) {
			const message = err.stack.replace(/\n/g, '').replace(/\).*/g, ')').replace(/ +(?= )/g,'');

			client.write(JSON.stringify({ type: 'error', process: { id: filename.replace(/.*\//g, ''), pid: process.pid }, message: message }));
		});
	// }


	// namespace CONSOLE {
		const CONSOLE = {
			log: function(message) {
				try {
					client.write(JSON.stringify({ type: 'console', process: { id: filename.replace(/.*\//g, ''), pid: process.pid}, message: message }));
				} catch(e) {
					console.log(e);
				}
			},
		}
	// }


	// Execution JS code {
		result = vm.runInNewContext(jscode + ';' + true, {
			W1            : W1,
			I2C           : I2C,
			GPIO          : GPIO,
			CONSOLE       : CONSOLE,
			DATETIME      : DATETIME,
			FILE          : FILE,
			HASH          : HASH,

			setInterval   : setInterval,
			clearInterval : clearInterval,
			setTimeout    : setTimeout,
			clearTimeout  : clearTimeout,
		}, {
			breakOnSigint: true,
			displayErrors: false
		});
	// }
}



getDeviceInfo = function(){
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


/**
 *	Server Application
 *
 *	@command serve
 */
if (process.argv[2] === 'serve') {
	// Inter Process Communications {
		const connectedSockets = new Set();

		// connectedSockets.broadcast = function(data, except) {
		//     for (let sock of this) {
		//         if (sock !== except) {
		//             sock.write(data);
		//         }
		//     }
		// }

		var server = net.createServer(function(client) {
			connectedSockets.add(client);

			client.on('data',function(data) {
				var message = {};

				try {
					message = JSON.parse(data.toString());
				} catch(e) {
					message = {};
				}

				if (message.type !== undefined) {
					if (message.type === 'console' || message.type === 'error') {
						fastify_ws_sendall(data.toString());
					}
				}
			});

			client.on('end', function() {
		    	connectedSockets.delete(client);
			});
		});

		server.on('error', function (e) {
			if (e.code == 'EADDRINUSE') {
		    	var clientSocket = new net.Socket();

		    	clientSocket.on('error', function(e) {
		        	if (e.code == 'ECONNREFUSED') {
		            	fs.unlinkSync(config.socket.ipc);

		            	server.listen(config.socket.ipc, function() {

		            	});
		        	}
		    	});

		    	clientSocket.connect({ path: config.socket.ipc }, function() {
		        	process.exit();
		    	});
			}
		});

		server.listen(config.socket.ipc, function() {

		});
	// }


	// fastify {
		fastify.addHook('preParsing', function(req, rep, done) {
			var url = req.raw.url;

			if (url === '/device' || url === '/signin') {

			} else {
        		if (!SESSION.get(req.raw.headers['backend-authorization'])) {
        			rep.send({ success: false, msg: 'Authorization required' });
        			return;
        		}
			}

  			done();
		});

		fastify.register(require('fastify-cors'))
		fastify.register(require('fastify-ws'))
		fastify.register(require('fastify-formbody'))
		fastify.register(require('fastify-static'), {
			root: config.dir.public,
		})

		fastify.register(require('./include/auth'));
		fastify.register(require('./include/management'));
		fastify.register(require('./include/algorithm'));
		fastify.register(require('./include/storage'));

		fastify.ready(async function(err) {
 			fastify.ws.on('connection', function(socket, req) {
 				var id = Math.random()

 				clients[id] = socket;
 				clients[id].session_id = req.url.replace(/\//g, '');

				socket.on('message', function(msg) {
					//socket.send(msg)
				})

				socket.on('close', function() {
					PROCESS.killall_by_session(clients[id].session_id);

					delete clients[id];
				});
    		});
		});

		fastify.listen(80, '0.0.0.0');
	// }

	// info

	const device = getDeviceInfo();
	fastify.get('/device', async function(req, rep) {
		return device
	})

	setInterval(function() {
		const 	disk_total = execSync('df -h | grep "/$" | awk \'{ print $2 }\''),
				disk_free  = execSync('df -h | grep "/$" | awk \'{ print $4 }\'');

		get_cpu_usage(function(usage) {
			var temperature = Math.round(parseFloat(fs.readFileSync('/sys/class/thermal/thermal_zone0/temp')) / 1000);

			fastify_ws_sendall(JSON.stringify({
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
					// network: os.networkInterfaces(),
				},
			}));
		});
	}, 3000);
}

// Info


/** get_cpu_usage
 * @param callback
 */
get_cpu_usage = function(callback) { 
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


/** get_cpu_info
 * @param callback
 */
get_cpu_info = function(callback) { 
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








