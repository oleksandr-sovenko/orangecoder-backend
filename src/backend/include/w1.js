// w1.js
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


/**
 *
 */
async function routes(fastify, options) {


    /**
     *
     */
    fastify.get('/w1/devices', async function(request, reply) {
    	var devices = [],
    		folder = '/sys/bus/w1/devices/',
    		files;

		files = await readdir(folder);
		for (var i in files)
			if (fs.existsSync(folder + '/' + files[i] + '/w1_slave')) {
				// console.log(devices[i]);
				devices.push(files[i]);
			}

        return devices
    })


}


module.exports = routes
