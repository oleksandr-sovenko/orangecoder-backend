// gpio.js
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


const util = require('util'),
      exec = util.promisify(require('child_process').exec);


/**
 *
 */
async function routes(fastify, options) {


    /**
     *
     */
    fastify.get('/gpio-readall', async function(request, reply) {
        const { stdout, stderr } = await exec('gpio readall');

        var temp = stdout.split('\n'),
            data = [],
            fields = [];

        for (var i in temp) {
            var items = temp[i].split('|');

            if (items.length > 1 && !/Physical/.test(temp[i])) {
                data.push({
                    'H2+': items[1].trim(),
                    'wPi': items[2].trim(),
                    'Name': items[3].trim(),
                    'Mode': items[4].trim(),
                    'V': items[5].trim(),
                    'Physical': items[6].trim()
                });

                data.push({
                    'H2+': items[13].trim(),
                    'wPi': items[12].trim(),
                    'Name': items[11].trim(),
                    'Mode': items[10].trim(),
                    'V': items[9].trim(),
                    'Physical': items[8].trim()
                });
            }
        }

        return { success: true, msg:'', data: data }
    })


}


module.exports = routes
