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


const fs = require('fs'),
      { spawn } = require('child_process'),
      filename = './data/gpio-devices.json';


global.childs = [];


async function routes(fastify, options) {
    /** Get list of pins
     *  @endpoint /gpio
     */
    fastify.get('/gpio', async function(request, reply) {
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


    /** Get list of devices
     *  @endpoint /gpio/devices
     *  @method   GET
     */
    fastify.get('/gpio/devices', async function(req, rep) {
        if (!is_authorized(req))
            return { success: false, msg: 'Authorization required' }

        if (fs.existsSync(filename))
            var devices = JSON.parse(fs.readFileSync(filename, 'utf8'));
        else
            var devices = [];

        return { success: true, msg:'', data: devices }
    })


    /** Add new device
     *  @endpoint /gpio/device
     *  @method   PUT
     */
    fastify.put('/gpio/device', async function(req, rep) {
        if (!is_authorized(req))
            return { success: false, msg: 'Authorization required' }

        if (req.body.name === undefined || req.body.device === undefined || req.body.pins === undefined)
            return { success: false, msg: 'Require name, device and pins' };

        if (req.body.name === '' || req.body.device === '' || Object.keys(req.body.pins).length === 0)
            return { success: false, msg: "Fields name, device, pins can't be empty." };

        if (fs.existsSync(filename))
            var devices = JSON.parse(fs.readFileSync(filename, 'utf8'));
        else
            var devices = [];

        devices.push({ id: uuid4(), name: req.body.name,  device: req.body.device,  pins: req.body.pins })

        fs.writeFileSync(filename, JSON.stringify(devices));

        spawn_helpers();

        console.log(Object.keys(req.body.pins).length);

        return { success: true, msg:'' }
    })


    /** Get data of the device
     *  @endpoint /gpio/device/:id
     *  @method   GET
     */
    fastify.get('/gpio/device/:id', async function(req, rep) {
        if (!is_authorized(req))
            return { success: false, msg: 'Authorization required' }

        if (fs.existsSync(filename)) {
            var devices = JSON.parse(fs.readFileSync(filename, 'utf8')),
                filter = [];

            for (var i in devices) {
                if (devices[i].id === req.params.id)
                    return devices[i];
            }
        }

        return {}
    })


    /** Update a device
     *  @endpoint /gpio/device/:id
     *  @method   POST
     */
    fastify.post('/gpio/device/:id', async function(req, rep) {
        if (!is_authorized(req))
            return { success: false, msg: 'Authorization required' }

        if (req.body.name === undefined || req.body.device === undefined || req.body.pins === undefined)
            return { success: false, msg: 'Require name, device and pins' };

        if (req.body.name === '' || req.body.device === '' || Object.keys(req.body.pins).length === 0)
            return { success: false, msg: "Fields name, device, pins can't be empty." };        

        if (fs.existsSync(filename)) {
            var devices = JSON.parse(fs.readFileSync(filename, 'utf8')),
                filter = [];

            for (var i in devices) {
                if (devices[i].id === req.params.id)
                    devices[i] = {
                        id    : devices[i].id,
                        name  : req.body.name,
                        device: req.body.device,
                        pins  : req.body.pins
                    };
            }

            fs.writeFileSync(filename, JSON.stringify(devices));
        }

        spawn_helpers();

        return { success: true, msg:'' }
    })


    /** Remove a device
     *  @endpoint /gpio/device/:id
     *  @method   DELETE
     */
    fastify.delete('/gpio/device/:id', async function(req, rep) {
        if (!is_authorized(req))
            return { success: false, msg: 'Authorization required' }

        if (fs.existsSync(filename)) {
            var devices = JSON.parse(fs.readFileSync(filename, 'utf8')),
                filter = [];

            for (var i in devices) {
                if (devices[i].id !== req.params.id)
                    filter.push(devices[i]);
            }

            fs.writeFileSync(filename, JSON.stringify(filter));
        }

        spawn_helpers();

        return { success: true, msg:'' }
    })
}


/**
 *
 */
function spawn_helpers() {
    spawn('killall', ['pin-event-change']);

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

        global.helperPinEventChange([devices[i].device, devices[i].id, pins]);
    }
}


spawn_helpers();


module.exports = routes

