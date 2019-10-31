// gpio-devices.js
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


const fs = require('fs'),
      uuid4 = require('uuid4'),
      filename = './data/gpio-devices.json';


/**
 *
 */
async function routes(fastify, options) {


    /** Get list of devices
     * @endpoint /gpio-devices
     */
    fastify.get('/gpio-devices', async function(request, reply) {
        const is_authorized = global.is_authorized(request);

        if (!is_authorized)
            return { success: false, msg: 'Authorization required' }

        if (fs.existsSync(filename))
            var devices = JSON.parse(fs.readFileSync(filename, 'utf8'));
        else
            var devices = [];

        return { success: true, msg:'', data: devices }
    })


    /** Add new device
     * @endpoint /gpio-devices/add
     */
    fastify.post('/gpio-devices/add', async function(request, reply) {
        const is_authorized = global.is_authorized(request);

        if (!is_authorized)
            return { success: false, msg: 'Authorization required' }

        if (request.body.name === undefined || request.body.device === undefined || request.body.pins === undefined)
            return { success: false, msg: 'Require name, device and pins' };

        if (fs.existsSync(filename))
            var devices = JSON.parse(fs.readFileSync(filename, 'utf8'));
        else
            var devices = [];

        devices.push({ id: uuid4(), name: request.body.name,  device: request.body.device,  pins: request.body.pins })

        fs.writeFileSync(filename, JSON.stringify(devices));

        spawn_helpers();

        return { success: true, msg:'' }
    })


    /** Update a device
     * @endpoint /gpio-devices/update
     */
    fastify.post('/gpio-devices/update', async function(request, reply) {
        const is_authorized = global.is_authorized(request);

        if (!is_authorized)
            return { success: false, msg: 'Authorization required' }

        spawn_helpers();

        return { hello: 'asdasd' }
    })


    /** Remove a device
     * @endpoint /gpio-devices/remove
     */
    fastify.post('/gpio-devices/remove', async function(request, reply) {
        const is_authorized = global.is_authorized(request);

        if (!is_authorized)
            return { success: false, msg: 'Authorization required' }

        if (request.body.id === undefined)
            return { success: false, msg: 'Require id' };

        if (fs.existsSync(filename)) {
            var devices = JSON.parse(fs.readFileSync(filename, 'utf8')),
                filter = [];

            for (var i in devices) {
                if (devices[i].id !== request.body.id)
                    filter.push(devices[i]);
            }

            fs.writeFileSync(filename, JSON.stringify(filter));
        }

        spawn_helpers();

        return { success: true, msg:'' }
    })


}


global.childs = [];


/**
 *
 */
function spawn_helpers() {
    for (var i in global.childs) {
        global.childs[i].kill();
    }

    global.childs = [];

    if (fs.existsSync(filename))
        var devices = JSON.parse(fs.readFileSync(filename, 'utf8'));
    else
        var devices = [];

    for (var i in devices) {
        var pins =  JSON.stringify(devices[i].pins)
                    .replace(/{/g, '')
                    .replace(/"/g, '')
                    .replace(/,/g, ' ')
                    .replace(/}/g, '');

        global.helper_pin_event_change([devices[i].device, devices[i].id, pins]);
    }
}


spawn_helpers();


module.exports = routes
