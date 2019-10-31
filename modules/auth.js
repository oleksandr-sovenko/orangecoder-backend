// auth.js
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


const md5 = require('md5'),
      fs = require('fs');


/**
 *
 */
async function routes(fastify, options) {


    /**
     *
     */
    fastify.post('/signin', async function(request, reply) {
        const credentials = JSON.parse(fs.readFileSync('./data/credentials.json', 'utf8')),
              session_id = md5(Math.random()),
              timestamp = global.get_unix_timestamp(),
              is_authorized = global.is_authorized(request);

        if (is_authorized)
            return { success: true, msg: 'Already authorized', data: request.headers.authorization };

        if (request.body.username === undefined || request.body.password === undefined)
            return { success: false, msg: 'Require username and password' };

        if (credentials.username !== request.body.username || credentials.password !== md5(request.body.password))
            return { success: false, msg: 'Wrong username or password' };

        global.sessions[session_id] = { expire: timestamp + 3600 };

        return { success: true, msg: 'Authorized successfully', data: session_id };
    })


    /**
     *
     */
    fastify.post('/signout', async function(request, reply) {
        if (request.headers.authorization !== undefined && global.sessions[request.headers.authorization] !== undefined) {

        } else {
            delete global.sessions[request.headers.authorization];
        }

        return { success: true, msg: 'Successfully' }
    })


}


module.exports = routes
