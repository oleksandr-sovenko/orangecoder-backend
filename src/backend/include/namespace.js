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


function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1) ) + min;
}


const CONFIG       = require('../config'),
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
	  request      = require('request'),
	  { GPIO, BMP280, HC_SC04 } = require('../modules/core');


var private = {
	CLOUD: {}
};


// namespace CLOUD {
	const CLOUD = new EventEmitter();
	CLOUD.connect = function(token) {
		if (!/^[a-z0-9]+$/.test(token)) {
			CLOUD.emit('error', '"token" must have symbols only a-z and 0-9.');
			return false;
		}

		// if (!/^\w+$/.test(id)) {
		// 	CLOUD.emit('error', '"id" must have symbols only a-z, 0-9 and _.');
		// 	return false;
		// }

		CLOUD.loop = true;
		CLOUD.process();

		// cloud_request(function() {
		// 	if (CLOUD.loop) {
		// 		setTimeout(function() {

		// 		}, 3000);
		// 	}
		// })

		// 	CLOUD.emit('data', value, data);
		// };

		return true;
	};

	CLOUD.process = function() {
		CLOUD.request({ }, function(data) {
			if (CLOUD.data !== undefined) {
				for (key in data) {
					try {
						if (CLOUD.data[key] != data[key])
							CLOUD.emit('data', key, data[key]);
					} catch(e) {
						console.log(e);
					}
				}
			}

			CLOUD.data = data;

			if (CLOUD.loop) {
				setTimeout(function() {
					CLOUD.process();
				}, getRndInteger(2, 4) * 1000);
			}
		});
	},

	CLOUD.request = function(data, callback) {
		request({ method: 'GET', json: data, uri: 'http://mail.orangecoder.org:3000/123456789' }, function(error, response, body) {
			if (callback !== undefined)
				callback(body);
		});
	},

	CLOUD.disconnect = function() {
		CLOUD.loop = false;
	}

	CLOUD.set = function(name, data) {
		request({ method: 'POST', json: data, uri: 'http://mail.orangecoder.org:3000/123456789/' + name }, function(error, response, body) {

		});
	};

	CLOUD.get = function(name) {

	};
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
		}
	}
// }


// namespace HASH {
	const HASH = {
		md5: function(data) {
			return md5(data);
		},

		base64_decode: function(data) {
			return base64.decode(data);
		},

		base64_encode: function(data) {
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

	}
// }


// namespace I2C {
	const I2C = {
		BMP280: BMP280
	}
// }


// namespace DIR {
	const DIR = {
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


module.exports = { HASH, DATETIME, I2C, GPIO, DIR, FILE, HTTP, CLOUD };