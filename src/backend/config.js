// config.js
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


const fs = require('fs');


const ROOT_DIR = '/opt/orangecoder';


const config = {
	'dir': {
		'root'     : ROOT_DIR,
		'conf'     : ROOT_DIR + '/conf',
		'algoritms': ROOT_DIR + '/algoritms',
		'public'   : ROOT_DIR + '/public',
		'storage'  : ROOT_DIR + '/storage',
		'modules'  : ROOT_DIR + '/modules',
	},

	'url': {
		'cloud': 'https://cloud.orangecoder.org',
	},

	'socket': {
		'ipc': ROOT_DIR + '/ipc.sock'
	}
};


// Create Default Directories {
    if (!fs.existsSync(config.dir.conf)) {
        fs.mkdirSync(config.dir.conf, { recursive: true });

        fs.writeFileSync(config.dir.conf + '/credentials.json', JSON.stringify({ 'username': 'admin', 'password': '21232f297a57a5a743894a0e4a801fc3' }));
        fs.writeFileSync(config.dir.conf + '/timezone.json', JSON.stringify({ 'timezone': 'UTC' }));
    }

    if (!fs.existsSync(config.dir.algoritms)) {
        fs.mkdirSync(config.dir.algoritms, { recursive: true });
    }
// }


module.exports = config;
