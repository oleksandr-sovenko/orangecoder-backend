// board.js
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


const   { execSync } = require('child_process'),
        I18N         = require('./i18n');


async function routes(fastify, options) {
    /** Get list of pins
     *  @endpoint /gpio
     */
    fastify.get('/board', async function(request, reply) {
        var result = await execSync('gpio readall').toString(),
            temp   = result.split('\n'),
            gpio   = [],
            fields = [];

        for (var i in temp) {
            var items = temp[i].split('|');

            if (items.length > 1 && !/Physical/.test(temp[i])) {
                gpio.push({
                    'H2+': items[1].trim(),
                    'wPi': items[2].trim(),
                    'Name': items[3].trim(),
                    'Mode': items[4].trim(),
                    'V': items[5].trim(),
                    'Physical': items[6].trim()
                });

                gpio.push({
                    'H2+': items[13].trim(),
                    'wPi': items[12].trim(),
                    'Name': items[11].trim(),
                    'Mode': items[10].trim(),
                    'V': items[9].trim(),
                    'Physical': items[8].trim()
                });
            }
        }

        return { success: true, msg: I18N.translate(locale, 'Successfully'), data: { gpio: gpio } }
    })
}


module.exports = routes

