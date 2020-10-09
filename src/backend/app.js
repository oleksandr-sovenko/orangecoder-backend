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


global.backend = {};


const CONFIG  = require('./config'),
	  net     = require('net'),
	  vm      = require('vm'),
	  os      = require('os'),
	  fs      = require('fs'),
	  moment  = require('moment'),
	  fastify = require('fastify')({ logger: false }),
	  path    = require('path'),
	  INFO    = require('./include/info'),
	  PROCESS = require('./include/process'),
	  SESSION = require('./include/session'),
      LOG     = require('./include/log'),
	  { fork, execSync } = require('child_process'),
	  { HASH, DATETIME, W1, I2C, GPIO, HC_SC04, DIR, FILE, HTTP, CLOUD } = require('./include/namespace');


var clients = {},
	clientsSendInfo = true,
	log = [];


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
		var ipc = net.connect({ path: CONFIG.socket.ipc }, function() {

		});

		ipc.on('data', function(data) {
			//GPIO.emit('change', data);
		});

		ipc.on('end', function() {
			// console.log('disconnected from server');
		});

		ipc.on('error', function(err) {
			console.log(err);
		});
	// }


	// Trying to capture all nodejs errors {
		function processLog(err) {
			LOG.append(err.stack);

			try {
				const message = err.stack.replace(/\n/g, '').replace(/\).*/g, ')').replace(/ +(?= )/g,'');
				ipc.write(JSON.stringify({ type: 'error', process: { id: filename.replace(/.*\//g, ''), pid: process.pid }, message: message }));
			} catch(err) {
				LOG.append(err.stack);
			}
		}

		process.on('uncaughtExceptionMonitor', function(err) {
			processLog(err)
		});

		process.on('unhandledRejection', function(err) {
			processLog(err)
		});

		process.on('uncaughtException', function(err) {
			processLog(err)
		});
	// }


	// namespace CONSOLE {
		const CONSOLE = {
			log: function(message) {
				console.log('{ CONSOLE.log } =>', message);

				try {
					ipc.write(JSON.stringify({ type: 'console', process: { id: filename.replace(/.*\//g, ''), pid: process.pid }, message: message }));
				} catch(e) {
					console.log(e);
				}
			},
		}
	// }


	// Execution JS code {
		result = vm.runInNewContext(jscode + ';' + true, {
			W1       : W1,
			I2C      : I2C,
			GPIO     : GPIO,
			HC_SC04  : HC_SC04,
			CONSOLE  : CONSOLE,
			DATETIME : DATETIME,
			DIR      : DIR,
			FILE     : FILE,
			HASH     : HASH,
			HTTP     : HTTP,
			CLOUD    : CLOUD,

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

		var server = net.createServer(function(ipc) {
			connectedSockets.add(ipc);

			ipc.on('data',function(data) {
				var message = {};

				try {
					message = JSON.parse(data.toString());
				} catch(e) {
					message = {};
				}

				if (message.type !== undefined) {
					if (message.type === 'console' || message.type === 'error') {
						log.push(message);
						while (log.length > 1000) {
							log.shift();
						}

						fastify_ws_sendall(data.toString());
					}
				}
			});

			ipc.on('end', function() {
		    	connectedSockets.delete(ipc);
			});
		});

		server.on('error', function (e) {
			if (e.code == 'EADDRINUSE') {
		    	var clientSocket = new net.Socket();

		    	clientSocket.on('error', function(e) {
		        	if (e.code == 'ECONNREFUSED') {
		            	fs.unlinkSync(CONFIG.socket.ipc);

		            	server.listen(CONFIG.socket.ipc, function() {

		            	});
		        	}
		    	});

		    	clientSocket.connect({ path: CONFIG.socket.ipc }, function() {
		        	process.exit();
		    	});
			}
		});

		server.listen(CONFIG.socket.ipc, function() {

		});
	// }


	// fastify {
		fastify.addHook('preParsing', function(req, rep, done) {
			var url = req.raw.url;

			if (
				/\/algorithm\//.test(url) ||
				/\/storage\//.test(url) ||
				/\/management\//.test(url) ||
				/\/signout/.test(url)
			) {
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
			root: CONFIG.dir.public,
		});
		fastify.register(require('fastify-file-upload'), {
			limits: { fileSize: 512 * 1024 * 1024 },
		});

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

		fastify.get('/console', async function(req, rep) {
			return log
		})

		fastify.listen(80, '0.0.0.0');
	// }


	// info {
		const device = INFO.get_device_info();
		fastify.get('/device', async function(req, rep) {
			return device
		})

		setInterval(function() {
			if (clientsSendInfo)
				sendInfo();
		}, 1000);
	// }
}


function sendInfo() {
	if (Object.keys(clients).length) {
		clientsSendInfo = false;

		var disk_total = execSync('df -h | grep "/$" | awk \'{ print $2 }\'').toString(),
			disk_free  = execSync('df -h | grep "/$" | awk \'{ print $4 }\'').toString();

		if (/G/.test(disk_total))
			disk_total = parseFloat(disk_total) * 1073741824;

		if (/M/.test(disk_total))
			disk_total = parseFloat(disk_total) * 1048576;

		if (/G/.test(disk_free))
			disk_free = parseFloat(disk_free) * 1073741824;

		if (/M/.test(disk_free))
			disk_free = parseFloat(disk_free) * 1048576;

		INFO.get_cpu_usage(function(usage) {
			var temperature = Math.round(parseFloat(fs.readFileSync('/sys/class/thermal/thermal_zone0/temp')) / 1000),
				timezone    = 'UTC';

			try {
				var json = JSON.parse(fs.readFileSync(CONFIG.dir.conf + '/timezone.json'));
				timezone = json.timezone;
			} catch(e) {
				timezone = 'UTC';
			}

			fastify_ws_sendall(JSON.stringify({
				action: 'status',
				data: {
					timezone: timezone,
					memory: {
						free: os.freemem(),
						total: os.totalmem(),
					},
					disk: {
						free: parseInt(disk_free),
						total: parseInt(disk_total),
					},
					cpu: {
						temperature: temperature,
						usage: usage
					},
					loadavg: os.loadavg(),
					uptime: os.uptime(),
					network: os.networkInterfaces(),
				},
			}));

			setTimeout(function() {
				clientsSendInfo = true;
			}, 2000);
		});
	}
}

