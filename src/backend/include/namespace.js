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


const CONFIG = require('../config'),
      fs     = require('fs'),
	  md5    = require('md5'),
	  base64 = require('js-base64').Base64,
	  path   = require('path'),
	  uuid4  = require('uuid4'),
	  moment = require('moment'),
	  { execSync } = require('child_process');

const { GPIO, BMP280, HC_SC04 } = require('../modules/core');


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
            	directory = __path__(directory);

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
			var directory = __path__(directory);

			fs.mkdirSync(directory, { recursive: true });
		},

		remove: function(directory) {
			var list,
				directory = __path__(directory);

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
			var filename = __path__(filename);

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
			var filename = __path__(filename);

			fs.unlinkSync(filename);
		},

		exists: function(filename) {
			var filename = __path__(filename);

			return fs.existsSync(path.dirname(filename));
		},

		read: function(filename) {
			var filename = __path__(filename),
				content = '';

			try {
				content = fs.readFileSync(filename);
			} catch(e) {
				content = '';
			}

			return content;
		},

		write: function(filename, data) {
			var filename = __path__(filename);

			if (fs.existsSync(path.dirname(filename))) {
				fs.writeFileSync(filename, data);

				if (fs.existsSync(filename))
					execSync('sync -f "' + filename + '"');
			}
		},

		append: function(filename, data) {
			var filename = __path__(filename);

			fs.appendFileSync(filename, data);

			if (fs.existsSync(filename))
				execSync('sync -f "' + filename + '"');
		},
	}
// }


function __path__(path) {
	return (CONFIG.dir.storage + '/' + path.replace(CONFIG.dir.storage, '')).replace(/\.\.\//g, '');
}


module.exports = { HASH, DATETIME, I2C, GPIO, DIR, FILE };