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


// pkg -t node12.2.0-linux-armv7 -o orangecoder-node12.2.0-linux-armv7-1.0 app.js


const config  = require('./config'),
	  net     = require('net'),
	  vm      = require('vm'),
	  fs      = require('fs'),
	  fastify = require('fastify')({ logger: false }),
	  path    = require('path'),
	  { fork, execSync } = require('child_process'),
	  { HASH, DATETIME, W1, I2C, GPIO, FILE } = require('./modules/namespace');


/** @command install
 *
 */
if (process.argv[2] === 'install') {
	let service = '' +
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


/** @command uninstall
 *
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


/** @command wm
 *
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
			GPIO.emit('change', data);
		});

		client.on('end', function() {
			// console.log('disconnected from server');
		});

		client.on('error', function(err) {
			// console.log(err);
		});
	// }


	// namespace CONSOLE {
		const CONSOLE = {
			log: function(message) {
				try {
					client.write(JSON.stringify({ type: 'console', process: { pid: process.pid}, message: message }));
				} catch(e) {
					console.log(e);
				}
			},
		}
	// }


	// Execution JS code {
		try {
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
		} catch(e) {
			result = e.toString();
		}
	// }

	if (result !== true)
		client.write(JSON.stringify({ type: 'error', process: { pid: process.pid}, message: result }));
}


/** @command serve
 *
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
					if (message.type === 'console' || message.type === 'error')
						console.log(DATETIME.format('YYYY-MM-DD hh:mm:ss'), message.process.pid, message.message);
				}
			});

			client.on('end', function() {
		    	// console.log('client disconnected');
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
		                	// console.log('server recovered');
		            	});
		        	}
		    	});

		    	clientSocket.connect({ path: config.socket.ipc }, function() {
		        	// console.log('Server running, giving up...');
		        	process.exit();
		    	});
			}
		});

		server.listen(config.socket.ipc, function() {
			// console.log('PID [' + process.pid + '] TCP Server listening');
		});
	// }


	// fastify {
		fastify.register(require('fastify-cors'))
		fastify.register(require('fastify-ws'))
		fastify.register(require('fastify-formbody'))
		fastify.register(require('fastify-static'), {
			root: config.dir.public,
		})

		fastify.register(require('./modules/auth'));
		fastify.register(require('./modules/algorithms'));
		fastify.register(require('./modules/filesystem'));

		var clients = {};

		// global.appWSSendForAll = function(data) {
		//     for (var id in clients) {
		//         try {
		//             clients[id].send(data);
		//         } catch(e) {
		//             console.log(e);
		//         }
		//     }
		// }

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
		});

		fastify.listen(80, '0.0.0.0');
	// }
}

