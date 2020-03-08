// algorithm.js
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


const fs       = require('fs'),
      CONFIG   = require('../config'),
      SESSION  = require('./session'),
      PROCESS  = require('./process'),
      { HASH } = require('./namespace');


async function routes(fastify, options) {
    var index = CONFIG.dir.algoritms + '/index.json';


    /**
     *
     *
     */
    if (fs.existsSync(index)) {
        var algorithms = JSON.parse(fs.readFileSync(index, 'utf8'));

        for (var i in algorithms) {
            if (algorithms[i].running === true)
                PROCESS.run(algorithms[i].id, null);
        }
    }


    /**
     *  Get list of algorithms
     *
     *  @endpoint /algorithms
     *  @method   GET
     */
    fastify.get('/algorithms', async function(req, rep) {
        // var files = fs.readdirSync(CONFIG.dir.algoritms);

        if (fs.existsSync(index)) {
            var algorithms = JSON.parse(fs.readFileSync(index, 'utf8'));
            for (var i in algorithms)
                algorithms[i].running = PROCESS.get(algorithms[i].id) !== undefined ? true : false;
        } else
            var algorithms = [];

        return algorithms;
    });


    /**
     *  Add new a algorithm
     *
     *  @endpoint /algorithm
     *  @method   PUT
     */
    fastify.put('/algorithm', async function(req, rep) {
        if (!SESSION.get(req.headers['backend-authorization']))
            return { success: false, msg: 'Authorization required' };

        if (req.body.title === null || req.body.description === null || req.body.code === null)
            return { success: false, msg: 'Required fields: string(title), string(description), base64(code)' };

        if (req.body.title === '')
            return { success: false, msg: 'Title can\'t be empty' };

        var id = HASH.uuid4();

        if (fs.existsSync(index))
            var algorithms = JSON.parse(fs.readFileSync(index, 'utf8'));
        else
            var algorithms = [];

        algorithms.push({
            id         : id,
            title      : req.body.title,
            description: req.body.description
        });

        fs.writeFileSync(CONFIG.dir.algoritms + '/' + id, HASH.base64_decode(req.body.code));
        fs.writeFileSync(index, JSON.stringify(algorithms));

        return { success: true, msg: 'Successfully' };
    });


    /**
     *  Get data of a algorithm
     *
     *  @endpoint /algorithm/:id
     *  @method   GET
     */
    fastify.get('/algorithm/:id', async function(req, rep) {
        if (!SESSION.get(req.headers['backend-authorization']))
            return { success: false, msg: 'Authorization required' };

        if (fs.existsSync(index)) {
            var algorithms = JSON.parse(fs.readFileSync(index, 'utf8'));

            for (var i in algorithms) {
                if (algorithms[i].id === req.params.id) {
                    if (fs.existsSync(index))
                        algorithms[i].code = HASH.base64_encode(fs.readFileSync(CONFIG.dir.algoritms + '/' + algorithms[i].id, 'utf8'));
                    else
                        algorithms[i].code = '';

                    return algorithms[i];
                }
            }
        }

        return {}
    });


    /**
     *  Update a algorithm
     *
     *  @endpoint /algorithm/:id
     *  @method   POST
     */
    fastify.post('/algorithm/:id', async function(req, rep) {
        if (!SESSION.get(req.headers['backend-authorization']))
            return { success: false, msg: 'Authorization required' };

        if (req.body.title === undefined || req.body.description === undefined || req.body.code === undefined)
            return { success: false, msg: 'Required fields: string(title), string(description), base64(code)' };

        if (fs.existsSync(index)) {
            var algorithms = JSON.parse(fs.readFileSync(index, 'utf8'));

            for (var i in algorithms) {
                if (algorithms[i].id === req.params.id) {
                    algorithms[i] = {
                        id    : algorithms[i].id,
                        title : req.body.title,
                        description: req.body.description
                    };

                    fs.writeFileSync(CONFIG.dir.algoritms + '/' + algorithms[i].id, HASH.base64_decode(req.body.code));
                    fs.writeFileSync(index, JSON.stringify(algorithms));

                    return { success: true, msg: 'Successfully' }
                }
            }
        }

        return { success: false, msg: 'Failure' }
    });


    /**
     *  Remove a algorithm
     *
     *  @endpoint /algorithm/:id
     *  @method   DELETE
     */
    fastify.delete('/algorithm/:id', async function(req, rep) {
        if (!SESSION.get(req.headers['backend-authorization']))
            return { success: false, msg: 'Authorization required' };

        if (fs.existsSync(index)) {
            var algorithms = JSON.parse(fs.readFileSync(index, 'utf8')),
                filter = [];

            for (var i in algorithms) {
                if (algorithms[i].id !== req.params.id)
                    filter.push(algorithms[i]);
                else {
                    try {
                        fs.unlinkSync(CONFIG.dir.algoritms + '/' + algorithms[i].id);
                    } catch(e) {
                        console.error(e);
                    }
                }
            }

            fs.writeFileSync(index, JSON.stringify(filter));
        }

        return { success: true, msg: 'Successfully' }
    });


    /**
     *  Execute a algorithm
     *
     *  @endpoint /algorithm/run/:id
     *  @method   POST
     */
    fastify.post('/algorithm/run/:id', async function(req, rep) {
        if (!SESSION.get(req.headers['backend-authorization']))
            return { success: false, msg: 'Authorization required' };

        if (fs.existsSync(index)) {
            var algorithms = JSON.parse(fs.readFileSync(index, 'utf8')),
                id = req.params.id;

            for (var i in algorithms) {
                if (algorithms[i].id === id) {

                    algorithms[i].running = true;
                    PROCESS.run(id);

                    fs.writeFileSync(index, JSON.stringify(algorithms));

                    return { success: true, msg: 'Successfully' };
                }
            }
        }

        return { success: false, msg: '' };
    });


    /**
     *  Stop a algorithm
     *
     *  @endpoint /algorithm/stop/:id
     *  @method   POST
     */
    fastify.post('/algorithm/stop/:id', async function(req, rep) {
        if (!SESSION.get(req.headers['backend-authorization']))
            return { success: false, msg: 'Authorization required' };

        if (fs.existsSync(index)) {
            var algorithms = JSON.parse(fs.readFileSync(index, 'utf8')),
                id = req.params.id;

            for (var i in algorithms) {
                if (algorithms[i].id === id) {

                    algorithms[i].running = false;
                    PROCESS.kill(id);

                    fs.writeFileSync(index, JSON.stringify(algorithms));

                    return { success: true, msg: 'Successfully' };
                }
            }
        }

        return { success: false, msg: '' };
    });


    /**
     *
     *
     */
    fastify.post('/algorithm/runcode', async function(req, rep) {
        if (!SESSION.get(req.headers['backend-authorization']))
            return { success: false, msg: 'Authorization required' };

        if (req.body.code === undefined)
            return { success: false, msg: 'Required fields: base64(code)' };

        var id = 'temp-' + HASH.uuid4(),
            session_id = req.headers['backend-authorization'];

        fs.writeFileSync(CONFIG.dir.algoritms + '/' + id, HASH.base64_decode(req.body.code));

        // Kill all previous executed scripts for current session
        PROCESS.killall_by_session(session_id);

        // Execute new one
        PROCESS.run(id, req.headers['backend-authorization']);

        return { success: true, msg: 'Successfully', data: id };
    });


    /**
     *
     *
     */
    fastify.post('/algorithm/stopcode/:id', async function(req, rep) {
        if (!SESSION.get(req.headers['backend-authorization']))
            return { success: false, msg: 'Authorization required' };

        var id = req.params.id;

        PROCESS.kill(id);

        try {
            fs.unlinkSync(CONFIG.dir.algoritms + '/' + id);
        } catch(e) {

        }

        return { success: true, msg: 'Successfully' };
    });
}


module.exports = routes
