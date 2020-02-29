// filesystem.js
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


const CONFIG  = require('../config'),
      SESSION = require('./session'),
      { DIR, FILE } = require('./namespace');


async function routes(fastify, options) {
    /**
     *  @endpoint /filesystem/list*
     *  @method   GET
     */
    fastify.get('/filesystem/list*', async function(req, rep) {
        if (!SESSION.get(req.headers['backend-authorization']))
            return { success: false, msg: 'Authorization required' };

        var list = [],
            directory = req.params['*'];

        return DIR.list(directory);

        //return { success: false, data: list, msg: 'Directory does not exist' };
        //return { success: true, data: list };
    });


    /**
     *  @endpoint /filesystem/file
     *  @method   PUT
     */
    fastify.put('/filesystem/file/*', async function(req, rep) {
        if (!SESSION.get(req.headers['backend-authorization']))
            return { success: false, msg: 'Authorization required' };

        if (req.body.name === undefined || req.body.content === undefined)
            return { success: false, msg: 'Required fields: string(name), base64(content)' };

        var directory = req.params['*'];

        // var id = HASH.uuid4();

        // if (fs.existsSync(index))
        //     var algorithms = JSON.parse(fs.readFileSync(index, 'utf8'));
        // else
        //     var algorithms = [];

        // algorithms.push({
        //     id         : id,
        //     title      : req.body.title,
        //     description: req.body.description
        // });

        //fs.writeFileSync(CONFIG.dir.algoritms + '/' + id, HASH.base64_decode(req.body.code));
        //fs.writeFileSync(index, JSON.stringify(algorithms));

        return { success: true, msg: 'Successfully' };

        // FILE.write(filename);
    });


    /**
     *  @endpoint /filesystem/file/:id
     *  @method   GET
     */
    fastify.get('/filesystem/file/*', async function(req, rep) {
        if (!SESSION.get(req.headers['backend-authorization']))
            return { success: false, msg: 'Authorization required' };

        var directory = req.params['*'];

        // FILE.read(filename);
    });


    /**
     *  @endpoint /filesystem/item/*
     *  @method   DELETE
     */
    fastify.delete('/filesystem/item/*', async function(req, rep) {
        if (!SESSION.get(req.headers['backend-authorization']))
            return { success: false, msg: 'Authorization required' };

        var directory = req.params['*'];

        if (!FILE.exist(directory))
            return { success: true, msg: 'File or directory not exists' };

        return { success: true, data: list };
    });
}


module.exports = routes
