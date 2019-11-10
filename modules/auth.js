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


/**
 *
 */
async function routes(fastify, options) {


    /**
     *
     */
    fastify.post('/signin', async function(req, rep) {
        const credentials = JSON.parse(fs.readFileSync('./data/credentials.json', 'utf8')),
              session_id = md5(Math.random()),
              timestamp = global.get_unix_timestamp();

        if (is_authorized(req))
            return { success: true, msg: 'Already authorized', data: req.headers['backend-authorization'] };

        if (req.body === null || req.body.username === undefined || req.body.password === undefined)
            return { success: false, msg: 'Require username and password' };

        if (credentials.username !== req.body.username || credentials.password !== md5(req.body.password))
            return { success: false, msg: 'Wrong username or password' };

        global.sessions[session_id] = { expire: timestamp + 3600 };

        return { success: true, msg: 'Authorized successfully', data: session_id };
    })


    /**
     *
     */
    fastify.post('/signout', async function(req, rep) {
        if (req.headers['backend-authorization'] !== undefined && global.sessions[req.headers['backend-authorization']] !== undefined) {

        } else {
            delete global.sessions[req.headers['backend-authorization']];
        }

        return { success: true, msg: 'Successfully' }
    })


}


module.exports = routes
