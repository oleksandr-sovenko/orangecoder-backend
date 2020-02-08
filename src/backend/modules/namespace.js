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


const config = require('../config'),
      fs     = require('fs'),
	  md5    = require('md5'),
	  path   = require('path'),
	  moment = require('moment'),
	  { execSync } = require('child_process');


// namespace HASH {
	const HASH = {
		md5: function(data) {
			return md5(data);
		},
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

	}
// }


// namespace GPIO {
	const GPIO = {
		mode: function(pin, mode) {
			execSync('gpio mode ' + pin + ' ' + mode);
		},

		read: function(pin) {
			var value = parseInt(execSync('gpio read ' + pin).toString().trim());

			if (isNaN(value))
				value = -1;

			return value;
		},
	
		write: function(pin, value) {
			execSync('gpio write ' + pin + ' ' + value);
		},
	}
// }


// namespace DIR {
	const DIR = {
		list: function(directory) {
        	var list = [],
            	directory = (config.dir.storage + directory).replace(/\.\.\//g, '');

        	if (fs.existsSync(config.dir.storage))
            	fs.mkdirSync(config.dir.storage, { recursive: true });

        	if (fs.existsSync(directory)) {
            	fs.readdirSync(directory).forEach(function(filename) {
            		var stat = fs.statSync(directory + '/' + filename);

                	list.push({
                    	name      : filename,
                    	type      : stat.isDirectory() ? 'dir' : 'file',
                    	created_at: stat.atime,
                    	updated_at: stat.mtime,
                    	size      : stat.size,
                	});
            	});
        	}

        	return list;
		},
	}
// }


// namespace FILE {
	const FILE = {
		remove: function(filename) {
			var filename = (config.dir.storage + filename).replace(/\.\.\//g, '');
			
			fs.unlinkSync(filename);
		},

		exists: function(filename) {
			var filename = (config.dir.storage + filename).replace(/\.\.\//g, '');

			return fs.existsSync(path.dirname(filename));
		},

		read: function(filename) {
			var filename = (config.dir.storage + filename).replace(/\.\.\//g, ''),
				content = '';
	
			try {
				content = fs.readFileSync(filename);
			} catch(e) {
				content = '';
			}
	
			return content;
		},
	
		write: function(filename, data) {
			var filename = (config.dir.storage + filename).replace(/\.\.\//g, '');

			if (fs.existsSync(path.dirname(filename))) {
				fs.writeFileSync(filename, data);

				if (fs.existsSync(filename))
					execSync('sync -f ' + filename);
			}
		},
	
		append: function(filename, data) {
			var filename = (config.dir.storage + filename).replace(/\.\.\//g, '');

			fs.appendFileSync(filename, data);

			if (fs.existsSync(filename))
				execSync('sync -f ' + filename);
		},
	}
// }


module.exports = { HASH, DATETIME, W1, I2C, GPIO, DIR, FILE }