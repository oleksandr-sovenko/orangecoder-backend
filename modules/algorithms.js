// algorithms.js
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


const { fork } = require('child_process'),
      directory = './data/algorithms',
      filename  = directory + '/index.json';


var algorithm_process = {};


async function routes(fastify, options) {
    /** Get list of algorithms
     *  @endpoint /algorithms
     *  @method   GET
     */
    fastify.get('/algorithms', async function(req, rep) {
        var files = fs.readdirSync('./data/algorithms');

        if (fs.existsSync(filename)) {
            var algorithms = JSON.parse(fs.readFileSync(filename, 'utf8'));
            for (var i in algorithms)
                algorithms[i].running = algorithm_process[algorithms[i].id] !== undefined ? true : false;
        } else
            var algorithms = [];

        return algorithms;
    });


    /** Add new a algorithm
     *  @endpoint /algorithm
     *  @method   PUT
     */
    fastify.put('/algorithm', async function(req, rep) {
        if (!is_authorized(req))
            return { success: false, msg: 'Authorization required' }

        if (req.body.title === undefined || req.body.description === undefined || req.body.code === undefined)
            return { success: false, msg: 'Required fields: string(title), string(description), base64(code)' };

        var id = uuid4();

        if (fs.existsSync(filename))
            var algorithms = JSON.parse(fs.readFileSync(filename, 'utf8'));
        else
            var algorithms = [];

        algorithms.push({
            id         : id,
            title      : req.body.title,
            description: req.body.description
        });

        fs.writeFileSync(directory + '/' + id, base64.decode(req.body.code));
        fs.writeFileSync(filename, JSON.stringify(algorithms));

        return { success: true, msg: 'Successfully' };
    });


    /** Get data of a algorithm
     *  @endpoint /algorithm/:id
     *  @method   GET
     */
    fastify.get('/algorithm/:id', async function(req, rep) {
        if (!is_authorized(req))
            return { success: false, msg: 'Authorization required' }

        if (fs.existsSync(filename)) {
            var algorithms = JSON.parse(fs.readFileSync(filename, 'utf8'));

            for (var i in algorithms) {
                if (algorithms[i].id === req.params.id) {
                    if (fs.existsSync(filename))
                        algorithms[i].code = base64.encode(fs.readFileSync(directory + '/' + algorithms[i].id, 'utf8'));
                    else
                        algorithms[i].code = '';

                    return algorithms[i];
                }
            }
        }

        return {}
    });


    /** Update a algorithm
     *  @endpoint /algorithm/:id
     *  @method   POST
     */
    fastify.post('/algorithm/:id', async function(req, rep) {
        if (!is_authorized(req))
            return { success: false, msg: 'Authorization required' }

        if (req.body.title === undefined || req.body.description === undefined || req.body.code === undefined)
            return { success: false, msg: 'Required fields: string(title), string(description), base64(code)' };

        if (fs.existsSync(filename)) {
            var algorithms = JSON.parse(fs.readFileSync(filename, 'utf8'));

            for (var i in algorithms) {
                if (algorithms[i].id === req.params.id) {
                    algorithms[i] = {
                        id    : algorithms[i].id,
                        title : req.body.title,
                        description: req.body.description
                    };

                    fs.writeFileSync(directory + '/' + algorithms[i].id, base64.decode(req.body.code));
                    fs.writeFileSync(filename, JSON.stringify(algorithms));

                    return { success: true, msg: 'Successfully' }
                }
            }
        }

        return { success: false, msg: 'Failure' }
    });


    /** Remove a algorithm
     *  @endpoint /algorithm/:id
     *  @method   DELETE
     */
    fastify.delete('/algorithm/:id', async function(req, rep) {
        if (!is_authorized(req))
            return { success: false, msg: 'Authorization required' }

        if (fs.existsSync(filename)) {
            var algorithms = JSON.parse(fs.readFileSync(filename, 'utf8')),
                filter = [];

            for (var i in algorithms) {
                if (algorithms[i].id !== req.params.id)
                    filter.push(algorithms[i]);
                else {
                    // delete file with code
                }
            }

            fs.writeFileSync(filename, JSON.stringify(filter));
        }

        return { success: true, msg: 'Successfully' }
    });


    /** Execute a algorithm
     *  @endpoint /algorithm/run/:id
     *  @method   POST
     */
    fastify.post('/algorithm/run/:id', async function(req, rep) {
        if (!is_authorized(req))
            return { success: false, msg: 'Authorization required' }

        if (fs.existsSync(filename)) {
            var algorithms = JSON.parse(fs.readFileSync(filename, 'utf8')),
                id = req.params.id;

            for (var i in algorithms) {
                if (algorithms[i].id === id) {

                    algorithm_process[id] = fork('./helpers/context.algorithm.js', [algorithms[i].id]);
                    algorithm_process[id].on('message', async function(message) {
                        appWSSendForAll(JSON.stringify({ action: 'console', data: id + ', ' + message }));
                    });

                    return { success: true, msg: 'Successfully' };
                }
            }
        }

        return { success: false, msg: '' };
    });


    /** Stop a algorithm
     *  @endpoint /algorithm/stop/:id
     *  @method   POST
     */
    fastify.post('/algorithm/stop/:id', async function(req, rep) {
        if (!is_authorized(req))
            return { success: false, msg: 'Authorization required' }

        var id = req.params.id;

        algorithm_process[id].kill();

        delete algorithm_process[id];

        return { success: true, msg: 'Successfully' };
    });
}


/**
 *
 *
 */
global.appAlgorithmProcessSendForAll = function(data) {
    for (var id in algorithm_process)
        algorithm_process[id].send(data);
}


module.exports = routes
