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


const config = require('../config'),
      { DIR, FILE } = require('./namespace');


async function routes(fastify, options) {
    /**
     *  @endpoint /filesystem/list*
     *  @method   GET
     */
    fastify.get('/filesystem/list*', async function(req, rep) {
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
    // fastify.put('/filesystem/file', async function(req, rep) {
    //     // FILE.write(filename);
    // });


    /**
     *  @endpoint /filesystem/file/:id
     *  @method   GET
     */
    // fastify.get('/filesystem/file/:id', async function(req, rep) {
    //     // FILE.read(filename);
    // });


    /**
     *  @endpoint /filesystem/item/*
     *  @method   DELETE
     */
    fastify.delete('/filesystem/item/*', async function(req, rep) {
        var directory = req.params['*'];

        if (!FILE.exist(directory))
            return { success: true, msg: 'File or directory not exists' };

        return { success: true, data: list };
    });


    /**
     *  @endpoint /filesystem/directory
     *  @method   PUT
     */
    // fastify.put('/filesystem/directory', async function(req, rep) {
    //     // DIR.create(directory);
    // });
}


module.exports = routes
