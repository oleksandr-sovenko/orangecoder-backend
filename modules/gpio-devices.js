const fs = require('fs'),
      uuid4 = require('uuid4'),
      filename = './data/gpio-devices.json';

async function routes(fastify, options) {

    /* =====================================
        /gpio-devices
    ===================================== */

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

    /* =====================================
        /gpio-devices/add
    ===================================== */

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

        return { success: true, msg:'' }
    })

    /* =====================================
        /gpio-devices/update
    ===================================== */

    fastify.post('/gpio-devices/update', async function(request, reply) {
        const is_authorized = global.is_authorized(request);

        if (!is_authorized)
            return { success: false, msg: 'Authorization required' }

        return { hello: 'asdasd' }
    })

    /* =====================================
        /gpio-devices/get
    ===================================== */

    // fastify.get('/gpio-devices/get', async function(request, reply) {
    //     const is_authorized = global.is_authorized(request);

    //     if (!is_authorized)
    //         return { success: false, msg: 'Authorization required' }

    //     return { hello: 'asdasd' }
    // })

    /* =====================================
        /gpio-devices/remove
    ===================================== */

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
        
        return { success: true, msg:'' }
    })

}

module.exports = routes