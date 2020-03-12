// storage.js
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
      { DIR, FILE, HASH } = require('./namespace');


async function routes(fastify, options) {
    /**
     *  @endpoint /storage/list*
     *  @method   GET
     */
    fastify.get('/storage/list*', async function(req, rep) {
        var list = [],
            directory = req.params['*'];

        return DIR.list(directory);
    });


    /**
     *  @endpoint /storage/file
     *  @method   PUT
     */
    fastify.put('/storage/dir/*', async function(req, rep) {
        var path = req.params['*'];

        DIR.create(path);

        return { success: true, msg: 'Successfully' };
    });


    /**
     *  @endpoint /storage/file
     *  @method   PUT
     */
    fastify.put('/storage/file/*', async function(req, rep) {
        const path  = req.params['*'],
              files = req.raw.files

        FILE.write(path, files['file'].data, 'binary');

        return { success: true, msg: 'Successfully' };
    });


    /**
     *  @endpoint /storage/file/:id
     *  @method   GET
     */
    fastify.get('/storage/file/*', async function(req, rep) {
        var directory = req.params['*'];

        // FILE.read(filename);
    });


    /**
     *  @endpoint /storage/item/*
     *  @method   DELETE
     */
    fastify.delete('/storage/item/*', async function(req, rep) {
        var path = req.params['*'];

        if (!FILE.exists(path))
            return { success: false, msg: 'File or directory not exists' };

        if (FILE.is(path) == 'dir')
            DIR.remove(path);
        else
            FILE.remove(path);

        return { success: true };
    });
}


module.exports = routes
