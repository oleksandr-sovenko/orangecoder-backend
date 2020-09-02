// namespace.js
// Copyright (C) 2020 Oleksandr Sovenko (info@oleksandrsovenko.com)
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


const	CONFIG       = require('../config'),
		LOG          = require('../include/log'),
		fs           = require('fs'),
		md5          = require('md5'),
		base64       = require('js-base64').Base64,
		path         = require('path'),
		uuid4        = require('uuid4'),
		moment       = require('moment'),
		fastify      = require('fastify')({ logger: false }),
		{ execSync } = require('child_process'),
		EventEmitter = require('events'),
		WebSocket    = require('ws'),
		got          = require('got'),
		// SerialPort   = require('serialport'),
		// Readline     = require('@serialport/parser-readline'),
		{ GPIO, BMP280, HC_SC04 } = require('../modules/core');


// namespace CLOUD {
	var profileData = {};

	function cloudGetProfile(token, id, callback) {
		(async () => {
			try {
				const response = await got(CONFIG.url.cloud + '/api/profile/' + id, {
			    	responseType: 'json',
					headers: {
						'Authorization': token,
						'Status': 'none',
					},
				});

				callback(response.body);
			} catch(err) {
				callback(undefined);

				LOG.append(err.stack);
			}
		})();
	}

	function cloudGetProfileLoop(token, id) {
		cloudGetProfile(token, id, function(body) {
			try {
				if (body !== undefined && body.data !== undefined && body.data.id !== undefined && body.data.data !== undefined) {
					var profile = body.data.id,
						json    = body.data.data;

					if (profileData[profile] === undefined)
						profileData[profile] = {};

					for (var variable in json) {
						if (profileData[profile][variable] === undefined) {
							CLOUD.emit('data', variable, json[variable].value);
						} else {
							if (profileData[profile][variable] !== json[variable].value)
								CLOUD.emit('data', variable, json[variable].value);
						}

						profileData[profile][variable] = json[variable].value;
					}
				}
			} catch(err) {
				LOG.append(err.stack);
			}

			setTimeout(function() {
				cloudGetProfileLoop(token, id);
			}, MATH.randInt(2, 4) * 1000);
		});
	}

	const CLOUD = new EventEmitter();
	CLOUD.auth = function(token) {
		if (!/^[a-z0-9]+$/.test(token)) {
			CLOUD.emit('error', '"token" must have symbols only a-z and 0-9.');
			return false;
		}

		CLOUD.token = token;

		return true;
	};

	CLOUD.listenProfile = function(id) {
		cloudGetProfileLoop(CLOUD.token, id);
	};

	CLOUD.getDevices = async function(callback) {
		(async function() {
		    const response = await got(CONFIG.url.cloud + '/api/devices', {
		        responseType: 'json',
	        	headers: {
					'Authorization': CLOUD.token,
					'Status': 'none',
				},
		    });

		 	if (callback !== undefined)
				callback(response.body.data);
		})();
	}

	CLOUD.sendNotification = function(uuid, title, body, callback) {
		(async function() {
		    const response = await got.put(CONFIG.url.cloud + '/api/notification', {
		        json: { uuid: uuid, title: title, body: body },
		        responseType: 'json',
	        	headers: {
					'Authorization': CLOUD.token,
					'Status': 'none',
				},
		    });

		 	if (callback !== undefined)
				callback(response.body.data);
		})();
	};

	CLOUD.sendEmail = function(to, data) {

	};

	CLOUD.sendSMS = function(to, data) {

	};

	CLOUD.setProfile = async function(id, data, callback) {
		// if (arguments.length == 2) {
		// 	if (typeof id === 'string' && typeof callback === 'function') {
				(async () => {
					try {
						const response = await got.post(CONFIG.url.cloud + '/api/profile/' + id, {
					    	responseType: 'json',
							headers: {
								'Authorization': CLOUD.token,
								'Status': 'none',
							},
							json: data
						});

						callback(response.body);
					} catch(err) {
						callback(undefined);

						LOG.append(err.stack);
					}
				})();
		// 	} else
		// 	    throw new Error('CLOUD.getProfile: Argument have to be string and function!');
		// } else
		// 	throw new Error('CLOUD.getProfile: Too few arguments!');
	};

	CLOUD.getProfile = async function(id, callback) {
		if (arguments.length == 2) {
			if (typeof id === 'string' && typeof callback === 'function') {
				(async () => {
					try {
						const response = await got(CONFIG.url.cloud + '/api/profile/' + id, {
					    	responseType: 'json',
							headers: {
								'Authorization': CLOUD.token,
								'Status': 'none',
							},
						});

						callback(response.body);
					} catch(err) {
						callback(undefined);

						LOG.append(err.stack);
					}
				})();
			} else
			    throw new Error('CLOUD.getProfile: Argument have to be string and function!');
		} else
			throw new Error('CLOUD.getProfile: Too few arguments!');
	};
// }


// namespace SERIAL {
	const SERIAL = new EventEmitter();
	SERIAL.SIM800 = {
		// port: null,
		// parser: null,

		connect: function() {
			// this.port = new SerialPort('/dev/ttyS1', { autoOpen: false });
			// this.parser = this.port.pipe(new Readline({ delimiter: '\r\n' }));

			// parser.on('data', function (data) {
   //  			var data = data.toString();

   //  			if (/RING/.test(data))
   //      			// TO RECEIVE INCOMING CALL:
   //      			// port.write('ATA\r');

   //  			console.log('SERIAL.SIM800: ', data)
			// });
		},

		disconnect: function() {
			// if (this.port !== null)
			// 	this.port.close();
		},

		sendUSSD: function(query) {
    		// this.port.write('AT+CUSD=1,"' + query + '"\r\n');
		},

		listSMS: function() {
    		// setTimeout(function(){
      //   		this.port.write('AT+CMGF=1\r');
      //   		setTimeout(function(){
      //       		this.port.write('AT+CMGL="ALL"\r');
      //   		}, 100);
    		// }, 100);
		},

		sendSMS: function(phone, message) {
			// setTimeout(function() {
			//     this.port.write('AT+CMGF=1\r');
			//     setTimeout(function() {
			//         this.port.write('AT+CMGS=\"' + phone + '\"\r');
			//         setTimeout(function() {
			//             this.port.write(message + '\r');
			//             setTimeout(function() {
			//                 this.port.write('\x1A');
			//             }, 100);
			//         }, 100);
			//     }, 100);
			// }, 100);
		}
	}
// }


// namespace MATH {
	const MATH = {
		randInt: function(min, max) {
			return Math.floor(Math.random() * (max - min + 1) ) + min;
		}
	}
// }


// namespace HTTP {
	const HTTP = {
		server: function(port, options) {
			if (options !== undefined) {

				if (options.get !== undefined)
					for (var url in options.get) {
						fastify.get(url, async function(req, rep) {
							return options.get[req.raw.url]();
						});
					}
			}

			fastify.register(require('fastify-cors'))
			fastify.register(require('fastify-formbody'))
			fastify.listen(port, '0.0.0.0');
		},

		put: function() {
			if (typeof options === 'function')
				callback = options;

			(async () => {
				try {
			    	const response = await got.put(url, options);

			 		if (callback !== undefined)
						callback(response.body);
				} catch(err) {
			 		if (callback !== undefined)
						callback(undefined);

					LOG.append(err.stack);
				}
			})();
		},

		get: function(url, options, callback) {
			if (typeof options === 'function')
				callback = options;

			(async () => {
				try {
			    	const response = await got(url, options);

			 		if (callback !== undefined)
						callback(response.body);
				} catch(err) {
			 		if (callback !== undefined)
						callback(undefined);

					LOG.append(err.stack);
				}
			})();
		},

		post: function() {
			if (typeof options === 'function')
				callback = options;

			(async () => {
				try {
			    	const response = await got.post(url, options);

			 		if (callback !== undefined)
						callback(response.body);
				} catch(err) {
			 		if (callback !== undefined)
						callback(undefined);

					LOG.append(err.stack);
				}
			})();
		},

		delete: function() {
			if (typeof options === 'function')
				callback = options;

			(async () => {
				try {
			    	const response = await got.delete(url, options);

			 		if (callback !== undefined)
						callback(response.body);
				} catch(err) {
			 		if (callback !== undefined)
						callback(undefined);

					LOG.append(err.stack);
				}
			})();
		},
	}
// }


// namespace HASH {
	const HASH = {
		md5: function(data) {
			return md5(data);
		},

		base64Decode: function(data) {
			return base64.decode(data);
		},

		base64Encode: function(data) {
			return base64.encode(data);	
		},

		uuid4: function() {
			return uuid4();
		}
	}
// }


// namespace DATETIME {
	const DATETIME = {
		timestamp: function() {
			return moment().unix();
		},

		format: function(format) {
			return moment().format(format);
		}
	}
// }


// namespace W1 {
	const W1 = {
		_path: '/sys/bus/w1/devices',

		getDevices: function() {
			var result = [];

			if (!fs.existsSync(this._path))
				return result;

			var list = fs.readdirSync(this._path);

			for (var i in list) {
				if (fs.existsSync(this._path + '/' + list[i] + '/w1_slave'))
					result.push({ addr: list[i] });
			}

			return result;
		},

		DS18B20: function(addr) {
			this._addr = addr;

			this.getTemperatureC = function() {
				var filename = this._path + '/' + this._addr + '/w1_slave',
					value    = null;

				if (!fs.existsSync(filename))
					return value;

				try {
					value = parseFloat(fs.readFileSync(filename).toString().replace(/.*t=/s, '').trim()) / 1000;
				} catch(err) {
					return null;					
				}

				return value;
			}

			this.getTemperatureF = function() {
				var value = this.getTemperatureC();

				if (value === null)
					return value;

				return (value * 1.8) + 32;
			}

			return this;
		},
	}
// }


// namespace I2C {
	const I2C = {
		BMP280: BMP280
	}
// }


// namespace DIR {
	const DIR = {
		exists: function(filename) {
			var filename = get_storage_real_path(filename);

			return fs.existsSync(path.dirname(filename));
		},

		list: function(directory) {
        	var dirs  = [],
        		files = [],
            	directory = get_storage_real_path(directory);

        	if (fs.existsSync(CONFIG.dir.storage))
            	fs.mkdirSync(CONFIG.dir.storage, { recursive: true });

        	if (fs.existsSync(directory)) {
            	fs.readdirSync(directory).forEach(function(filename) {
            		var stat = fs.statSync(directory + '/' + filename);

            		if (stat.isDirectory())
						dirs.push({
							name      : filename,
							type      : 'dir',
							created_at: stat.atime,
							updated_at: stat.mtime,
							size      : stat.size,
						});
					else
						files.push({
							name      : filename,
							type      : 'file',
							created_at: stat.atime,
							updated_at: stat.mtime,
							size      : stat.size,
						});
            	});
        	}

        	return dirs.concat(files);
		},

		create: function(directory) {
			var directory = get_storage_real_path(directory);

			fs.mkdirSync(directory, { recursive: true });
		},

		remove: function(directory) {
			var list,
				directory = get_storage_real_path(directory);

			list = fs.readdirSync(directory);
			for (var i = 0; i < list.length; i++) {
				var filename = path.join(directory, list[i]),
					stat = fs.statSync(filename);

				if(filename == '.' || filename == '..') {
					// pass these files
				} else if(stat.isDirectory()) {
					// rmdir recursively
					this.remove(filename);
				} else {
					// rm fiilename
					fs.unlinkSync(filename);
				}
			}

			fs.rmdirSync(directory);
		}
	}
// }


// namespace FILE {
	const FILE = {
		is: function(filename) {
			var filename = get_storage_real_path(filename);

			if (!this.exists(filename))
				return '';

			stat = fs.statSync(filename);
			if (stat.isBlockDevice())
				return 'block-device';
			if (stat.isCharacterDevice())
				return 'char-device';
			if (stat.isDirectory())
				return 'dir';
			if (stat.isFIFO())
				return 'fifo';
			if (stat.isFile())
				return 'file';
			if (stat.isSocket())
				return 'socket';
			if (stat.isSymbolicLink())
				return 'symlink';

			return '';
		},

		remove: function(filename) {
			var filename = get_storage_real_path(filename);

			fs.unlinkSync(filename);
		},

		exists: function(filename) {
			var filename = get_storage_real_path(filename);

			return fs.existsSync(path.dirname(filename));
		},

		read: function(filename) {
			var filename = get_storage_real_path(filename),
				content = '';

			try {
				content = fs.readFileSync(filename);
			} catch(e) {
				content = '';
			}

			return content;
		},

		write: function(filename, data, options) {
			var filename = get_storage_real_path(filename);

			if (fs.existsSync(path.dirname(filename))) {
				fs.writeFileSync(filename, data, options);

				if (fs.existsSync(filename))
					execSync('sync -f "' + filename + '"');
			}
		},

		append: function(filename, data) {
			var filename = get_storage_real_path(filename);

			fs.appendFileSync(filename, data);

			if (fs.existsSync(filename))
				execSync('sync -f "' + filename + '"');
		},
	}
// }


// Functions {
	function get_storage_real_path(path) {
		return (CONFIG.dir.storage + '/' + path.replace(CONFIG.dir.storage, '')).replace(/\.\.\//g, '');
	}
// }


// Class WebSocketClient {
	function WebSocketClient() {
		var self = this;

    	self.number = 0;
    	self.autoReconnectInterval = 5*1000;
    	self.autoPingInterval = 30*1000;
	}

	WebSocketClient.prototype.open = function(url) {
		var self = this;

    	self.url = url;
    	self.instance = new WebSocket(self.url);

    	self.instance.on('open', function() {
        	self.onopen();
        	self.interval = setInterval(function() {
				self.instance.ping('conn');
			}, self.autoPingInterval);
    	});

    	self.instance.on('message', function(data, flags) {
        	self.number ++;
        	self.onmessage(data, flags, self.number);
    	});

    	self.instance.on('close', function(e) {
        	clearInterval(self.interval);

        	switch (e.code) {
        		case 1000:
            		break;
        		default:
            		self.reconnect(e);
            		break;
        	}
        	self.onclose(e);
    	});

    	self.instance.on('error', function(e) {
        	switch (e.code) {
        		case 'ECONNREFUSED':
            		self.reconnect(e);
            		break;
        		default:
            		self.onerror(e);
            		break;
        	}
    	});
	};

//	WebSocketClient.prototype.send = function(data,option) {
//		var self = this;
//
//    	try {
//        	self.instance.send(data, option);
//    	} catch (e) {
//        	self.instance.emit('error', e);
//    	}
//	};

	WebSocketClient.prototype.reconnect = function(e) {
    	var self = this;

        self.instance.removeAllListeners();
    	setTimeout(function(){
        	self.open(self.url);
    	}, self.autoReconnectInterval);
	};

	WebSocketClient.prototype.onopen = function(e) {
		// console.log("WebSocketClient: open", arguments);
	};

	WebSocketClient.prototype.onmessage = function(data, flags, number) {
		// console.log("WebSocketClient: message", arguments);
	};

	WebSocketClient.prototype.onerror = function(e) {
		// console.log("WebSocketClient: error", arguments);
	};

	WebSocketClient.prototype.onclose = function(e) {
		// console.log("WebSocketClient: closed", arguments);
	};
// }


module.exports = { HASH, MATH, DATETIME, I2C, GPIO, HC_SC04, DIR, FILE, HTTP, CLOUD, W1 };
